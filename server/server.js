const io = require('socket.io')({
    cors: {
        origin: '*'
    }
})
const server = io.listen(8443)

const mods = []

server.on('connection', socket => {
    socket.emit('remote-id', socket.client.id)
    socket.on('chat-message', message => {
        server.emit('chat-message', {
            message,
            id: socket.client.id
        })
    })
})