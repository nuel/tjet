const fs = require('fs')
const he = require('he')
const io = require('socket.io')({
    cors: {
        origin: '*'
    }
})
const server = io.listen(9443)
const clients = {}
const secrets = {}

// Load key
try {
    secrets.key = fs.readFileSync('.key', 'utf8').split('\n').shift().trim()
} catch (err) {
    console.error(err)
}

// Load banlist
refreshBanList()

server.on('connection', socket => {
    // Check if banned
    checkBanned(socket)

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
                            server.sockets.sockets.forEach(socket => {
                                // Check each client if their ID matches, if so, log their address
                                if (socket.client.id === argv[1]) {
                                    appendToFile('.banned', socket.handshake.address, () => {
                                        refreshBanList()
                                        kick(socket)
                                    })   
                                }
                            })
                        }
                        break
                    default:
                        break
                }
            }
        } else {
            // Sanitize input
            message.content = he.encode(message.content)

            // If we somehow lost the name of this client, set it now
            if(!clients[socket.client.id].tjetName) {
                clients[socket.client.id].tjetName = message.name
            }

            // Unless logs are disabled, log message
            if (!process.argv.includes('--no-log') && !process.argv.includes('-n')) {
                appendToFile('.log', `${Date.now()} [${socket.handshake.address}] ${message.name}: ${message.content}`)
            }

            // Broadcast message
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

function appendToFile(filename, text, callback) {
    const stream = fs.createWriteStream(filename, {'flags': 'a'})
    stream.once('open', () => {
        stream.write(text + '\r\n')
        if (callback) callback()
    })
}

function refreshBanList() {
    try {
        secrets.banned = fs.readFileSync('.banned', 'utf8').replace(/\r\n/g,'\n').split('\n')
    } catch (err) {
        console.error(err)
    }
}

function checkBanned (socket) {
    if (secrets.banned.includes(socket.handshake.address)) {
        kick(socket)
    }
}

function kick (socket) {
    socket.emit('banned')
    socket.disconnect()
}
