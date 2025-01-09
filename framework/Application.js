const http = require('http')
const EventEmitter = require('events')

module.exports = class Application {
    constructor() {
        this.emitter = new EventEmitter()
        this.server = this._createServer()
        this.middlewares = []
    }

    use(middleware) {
        this.middlewares.push(middleware)
    }

    listen(port, callback) {
        this.server.listen(port, callback)
    }

    addRouter(router) {
        Object.keys(router.endpoints).forEach(path => {
            const endpoint = router.endpoints[path]
            Object.keys(endpoint).forEach((method) => {
                this.emitter.on(this._getRouteMask(path, method), (request, response) => {
                    const handler = endpoint[method]
                    this.middlewares.forEach(middleware => middleware(request, response))
                    handler(request, response)
                })
            })
        })
    }

    _createServer() {
        return http.createServer((request, response) => {
            let body = ''
            request.on('data', (chunk) => {
                body += chunk
            })
            request.on('end', () => {
                if(body) {
                    request.body = JSON.parse(body)
                }
                const emitted = this.emitter.emit(this._getRouteMask(request.url, request.method), request, response)
                if(!emitted) {
                    response.writeHead(404, {
                        'Content-Type': 'application/json'
                    })
                    response.end(JSON.stringify({
                        success: false
                    }))
                }
            })
        })
    }
    _getRouteMask(path, method) {
        return `[${path}]:[${method}]`
    }
}