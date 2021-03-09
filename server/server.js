const fs = require('fs')
const secrets = {}

try {
  secrets.key = fs.readFileSync('.key', 'utf8')
} catch (err) {
  console.error(err)
}

const io = require('socket.io')({
    cors: {
        origin: '*'
    }
})
const server = io.listen(8443)

const clients = {}

server.on('connection', socket => {
    // Broadcast client list and own id on login
    clients[socket.client.id] = {}
    socket.emit('remote-id', socket.client.id)
    server.emit('clients', clients)

    socket.on('chat-message', message => {
        // Handle commands
        if (message.content && message.content[0] === '/')  {
            const argv = message.content.slice(1, message.content.length).split(' ')

            if (argv.length > 1) {
                switch (argv[0]) {
                    case 'mod':
                        if (argv[1] === secrets.key) {
                            // Check if key is correct, if so, tell everyone we have a mod here
                            clients[socket.client.id].mod = true
                            server.emit('clients', clients)
                        }
                        break
                    case 'ban':
                        if (argv[1] && clients[argv[1]]) {
                            console.log(clients[argv[1]])
                        }
                        break
                    default:
                        break
                }
            }
        } else {
            server.emit('chat-message', {
                message,
                id: socket.client.id
            })
        }
    })
    socket.on('set-name', message => {
        clients[socket.client.id].tjetName = message
    })
    socket.on('typing', message => {
        // If not already typing, change status and broadcast updated list
        if (!clients[socket.client.id].typing) {
            clients[socket.client.id].typing = true
            server.emit('clients', clients)
        }
    })
    socket.on('idle', message => {
        // Update status and send new list to everyone
        clients[socket.client.id].typing = false
        server.emit('clients', clients)
    })
    socket.on('disconnect', () => {
        // Delete this client from the list and inform everyone
        delete clients[socket.client.id]
        server.emit('clients', clients)
    })
})