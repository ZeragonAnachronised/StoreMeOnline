module.exports = remover = (tree) => {
    delete tree.path
    tree['children'].forEach(node => {
        if(node['children']) {
            node = remover(node)
        }
    })
    return tree
}