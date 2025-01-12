const Router = require('../framework/Router')
const fs = require('fs')
const crypto = require('crypto')
const path = require('path')
const dirTree = require('directory-tree')
const remover = require('./reccurentKeyRemover')

const gen_token = () => {
    const token = crypto.randomBytes(32).toString('hex')
    return token
}

const router = new Router()

router.post('/register', (req, res) => {
    fs.readFile('users.json', 'utf8', (err, data) => {
        if(err) throw err

        let jsonData = JSON.parse(data)
        let id = 0
        if(!Object.keys(jsonData).length) {
            id = 1
            token = gen_token()
            jsonData[id] = {
                name: req.body['name'],
                email: req.body['email'],
                password: req.body['password'],
                token: token
            }
            fs.writeFile('users.json', JSON.stringify(jsonData, null, 2), (err) => {
                if(err) throw err
            })
            fs.mkdir(path.resolve(__dirname, '..', 'usersData', `${req.body['name']}[${id}]`), (err) => {
                if(err) throw err
            })
            res.send({
                success: true,
                token: token,
                id: id
            })
        }
        else {
            let free = true
            Object.keys(jsonData).forEach(key => {
                if(jsonData[key]['email'] == req.body['email']) {
                    free = false
                }
            })
            if(free) {
                id = Number(Object.keys(jsonData).at(-1)) + 1
                token = gen_token()
                jsonData[id] = {
                    name: req.body['name'],
                    email: req.body['email'],
                    password: req.body['password'],
                    token: token
                }
                fs.writeFile('users.json', JSON.stringify(jsonData, null, 2), (err) => {
                    if(err) throw err
                })
                fs.mkdir(path.resolve(__dirname, '..', 'usersData', `${req.body['name']}[${id}]`), (err) => {
                    if(err) throw err
                })
                res.send({
                    success: true,
                    token: token,
                    id: id
                })
            }
            else {
                res.writeHead(403, {
                    'Content-Type': 'application/json'
                })
                res.end(JSON.stringify({
                    success: false,
                    message: 'the email is already taken'
                }))
            }
        }
    })
})

router.post('/auth', (req, res) => {
    fs.readFile('users.json', 'utf8', (err, data) => {
        if(err) throw err

        let jsonData = JSON.parse(data)
        let hit = false
        Object.keys(jsonData).forEach(key => {
            if(jsonData[key]['email'] == req.body['email']) {
                if(jsonData[key]['password'] == req.body['password']) {
                    token = gen_token()
                    jsonData[key]['token'] = token
                    res.send({
                        success: true,
                        token: token,
                        id: Number(key)
                    })
                }
                else {
                    res.writeHead(403, {
                        'Content-Type': 'application/json'
                    })
                    res.end(JSON.stringify({
                        success: false,
                        message: 'wrong password'
                    }))
                }
                hit = true
            }
        })
        if(!hit) {
            res.writeHead(403, {
                'Content-Type': 'application/json'
            })
            res.end(JSON.stringify({
                success: false,
                message: 'email not found'
            }))
        }
    })
})

router.post('/create_dir', (req, res) => {
    fs.readFile('users.json', 'utf8', (err, data) => {
        if(err) throw err

        let jsonData = JSON.parse(data)
        let hit = false
        Object.keys(jsonData).forEach(key => {
            if(key == req.body['id']) {
                if(jsonData[key]['token'] == req.body['token']) {
                    fs.mkdir(path.resolve(__dirname, '..', 'usersData', `${jsonData[key]['name']}[${req.body['id']}]`, path.join(...req.body['fullpath'])), (err) => {
                        if(err) throw err
                    })
                    res.send({
                        success: true
                    })
                }
                else {
                    res.writeHead(403, {
                        'Content-Type': 'application/json'
                    })
                    res.end(JSON.stringify({
                        success: false,
                        message: 'some error'
                    }))
                }
                hit = true
            }
        })
        if(!hit) {
            res.writeHead(403, {
                'Content-Type': 'application/json'
            })
            res.end(JSON.stringify({
                success: false,
                message: 'some error 2'
            }))
        }
    })
})

router.post('/delete_dir', (req, res) => {
    fs.readFile('users.json', 'utf8', (err, data) => {
        if(err) throw err

        let jsonData = JSON.parse(data)
        let hit = false
        Object.keys(jsonData).forEach(key => {
            if(key == req.body['id']) {
                if(jsonData[key]['token'] == req.body['token']) {
                    fs.rmdir(path.resolve(__dirname, '..', 'usersData', `${jsonData[key]['name']}[${req.body['id']}]`, path.join(...req.body['path'])), (err) => {
                        if(err) throw err
                    })
                    res.send({
                        success: true
                    })
                }
                else {
                    res.writeHead(403, {
                        'Content-Type': 'application/json'
                    })
                    res.end(JSON.stringify({
                        success: false,
                        message: 'some error'
                    }))
                }
                hit = true
            }
        })
        if(!hit) {
            res.writeHead(403, {
                'Content-Type': 'application/json'
            })
            res.end(JSON.stringify({
                success: false,
                message: 'some error 2'
            }))
        }
    })
})

router.post('/tree', (req, res) => {
    fs.readFile('users.json', 'utf8', (err, data) => {
        if(err) throw err

        let jsonData = JSON.parse(data)
        let hit = false
        Object.keys(jsonData).forEach(key => {
            if(key == req.body['id']) {
                if(jsonData[key]['token'] == req.body['token']) {
                    let tree = dirTree(path.join(__dirname, '..', 'usersData', `${jsonData[key]['name']}[${key}]`, path.join(...req.body.fullpath)), (err) => {
                        if(err) throw err
                    })
                    tree = remover(tree)
                    res.send(tree)
                }
                else {
                    res.writeHead(403, {
                        'Content-Type': 'application/json'
                    })
                    res.end(JSON.stringify({
                        success: false,
                        message: 'some error'
                    }))
                }
                hit = true
            }
        })
        if(!hit) {
            res.writeHead(403, {
                'Content-Type': 'application/json'
            })
            res.end(JSON.stringify({
                success: false,
                message: 'some error 2'
            }))
        }
    })
})

module.exports = router