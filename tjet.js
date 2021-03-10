/** Tjet
 * by nuel
 */

// Simplified h function
function h (tagName, properties, content) {
    const parts = tagName.split('.')
    const el = document.createElement(parts[0])

    parts.shift()
    parts.forEach(className => {
        el.classList.add(className)
    })

    if (!content && typeof properties === 'string') {
        content = properties
    }

    if (typeof properties === 'object') {
        Object.assign(el, properties)
    }

    if (content) el.innerHTML = content

    return el
}

// State
const tjetState = {
    name: null,
    remoteID: null,
    typing: false,
    unread: 0,
    title: null,
    clients: {}
}

// Localization
const tjetLabels = {
    sendLabel:  'Send',
    setNameLabel: 'Set name',
    noNamePlaceholder: 'Enter your name',
    sendPlaceholder: 'Send a message',
    and: 'and',
    typingSingular: 'is typing',
    typingPlural: 'are typing',
    typingSeveral: 'Several people'
}

// Preload sound
const tjetSound = new Audio('data:audio/mpeg;base64,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')

// Create UI
const tjet = document.getElementById('tjet')
const tjetMessages = h('ul.tjet-messages')
const tjetTypingIndicator = h('div.tjet-typing-indicator')
const tjetForm = h('form.tjet-form.tjet-no-name', {
    action: 'javascript:;'
})
const tjetInput = h('input.tjet-input', {
    name: 'tjet-input',
    placeholder: tjetLabels.noNamePlaceholder
})
const tjetSubmit = h('a.tjet-submit', tjetLabels.setNameLabel)
const tjetCount = h('div.tjet-count', '0')

// Attach UI
tjetForm.appendChild(tjetInput)
tjetForm.appendChild(tjetSubmit)
tjetForm.appendChild(tjetTypingIndicator)
tjetForm.appendChild(tjetCount)
tjet.appendChild(tjetMessages)
tjet.appendChild(tjetForm)

// Connect to server
const socket = io(tjet.dataset.server || null)

// Listen for remote id to be set
socket.on('remote-id', data => {
    tjetState.remoteID = data
})

// Handle incoming messages
socket.on('chat-message', data => {
    const bubble = h('li.tjet-message')
    const messageName = h('div.tjet-message-name', data.message.name)
    const senderId = h('div.tjet-sender-id', data.id)
    const messageContent = h('div.tjet-message-content', data.message.content)

    // Did we send this?
    if (tjetState.remoteID === data.id) {
        bubble.classList.add('tjet-sent')
    } else {
        // If not, send a notification
        tjetSendNotification()
    }

    bubble.appendChild(messageName)
    bubble.appendChild(senderId)
    bubble.appendChild(messageContent)
    tjetMessages.appendChild(bubble)
    tjetMessages.scrollTop = tjetMessages.scrollHeight
})

// Client list syncing
socket.on('clients', clients => {
    // Update list
    tjetState.clients = clients

    // Check if we have become mod
    if (
        tjetState.clients[tjetState.remoteID] &&
        tjetState.clients[tjetState.remoteID].mod
    ) {
        tjet.classList.add('tjet-advanced')
    }

    // Count clients
    tjetCount.innerHTML = Object.keys(clients).length

    // Check if people are typing
    tjetCheckTypingIndicators()
})

// Receiving a ban
socket.on('banned', data => {
    tjet.classList.add('banned')
    tjetInput.disabled = true
})

// Check typing indicators
function tjetCheckTypingIndicators() {
    const typing = []
    for (client in tjetState.clients) {
        if (
            tjetState.remoteID !== client &&
            tjetState.clients[client].typing
        ) {
            typing.push(client)
        }
    }
    if (typing.length) {
        tjetTypingIndicator.classList.add('active')
        // Set a max name length to keep typing indicator short
        const tr = 20

        if (typing.length === 1) {
            tjetTypingIndicator.innerHTML = `<span class="tjet-name">${tjetGetName(typing[0], tr)}</span> ${tjetLabels.typingSingular}&hellip;`
        } else if (typing.length === 2) {
            tjetTypingIndicator.innerHTML = `<span class="tjet-name">${tjetGetName(typing[0], tr)}</span> ${tjetLabels.and} <span class="tjet-name">${tjetGetName(typing[1], tr)}</span> ${tjetLabels.typingPlural}&hellip;`
        } else if (typing.length === 3) {
            tjetTypingIndicator.innerHTML = `<span class="tjet-name">${tjetGetName(typing[0], tr)}</span>, <span class="tjet-name">${tjetGetName(typing[1], tr)}</span> ${tjetLabels.and} <span class="tjet-name">${tjetGetName(typing[2], tr)}</span> ${tjetLabels.typingPlural}&hellip;`
        } else {
            tjetTypingIndicator.innerHTML = `<span class="tjet-name">${tjetLabels.typingSeveral}</span> ${tjetLabels.typingPlural}&hellip;`
        }
    } else {
        tjetTypingIndicator.classList.remove('active')
        tjetTypingIndicator.innerHTML = ''
    }
}

// Handle user input
function tjetHandleInput() {
    if (!tjetInput.value) return

    if(tjetState.name) {
        socket.emit('chat-message', {
            content: tjetInput.value,
            name: tjetState.name
        })
    } else {
        tjetState.name = tjetInput.value
        tjetSubmit.innerHTML = tjetLabels.sendLabel
        tjetForm.classList.remove('tjet-no-name')
        tjetInput.placeholder = tjetLabels.sendPlaceholder
        socket.emit('set-name', tjetState.name)
    }

    tjetInput.value = ''
    tjetBroadcastTypingIndicator()
}

// Broadcast typing status on begin and end
function tjetBroadcastTypingIndicator() {
    if(tjetState.name) {
        if(tjetInput.value) {
            if (!tjetState.typing) {
                socket.emit('typing')
                tjetState.typing = true
            }
        } else {
            socket.emit('idle')
            tjetState.typing = false
        }
    }
}

// Send a notification, increase unread count if necessary
function tjetSendNotification() {
    if(!document.hasFocus()) {
        tjetSound.play()
        tjetState.unread ++
        if (!tjetState.title) tjetState.title = document.title
        document.title = `(${tjetState.unread}) ${tjetState.title}`
    }
}

// Clear all notifications
function tjetClearNotifications() {
    tjetState.unread = 0
    if (tjetState.title) document.title = tjetState.title
}

// Helper function to fetch names for IDs
function tjetGetName(id, truncate) {
    if (tjetState.clients[id]) {
        const name = tjetState.clients[id].tjetName
        console.log(truncate)
        if (truncate) {
            return name.length > truncate ? name.slice(0, truncate).trim() + '&hellip;' : name
        }
        return name
    }
    return false
}

// Bind listeners
tjetSubmit.addEventListener('click', tjetHandleInput)
tjetForm.addEventListener('submit', tjetHandleInput)
tjetInput.addEventListener('keyup', tjetBroadcastTypingIndicator)
document.addEventListener('focus', tjetClearNotifications)
