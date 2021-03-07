const io = require('socket.io')({
    cors: {
        origin: '*'
    }
})
const server = io.listen(8443)

server.on('connection', socket => {
    socket.on('chat-message', message => {
        server.emit('chat-message', message)
    })
})