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

// Attach UI
tjetForm.appendChild(tjetInput)
tjetForm.appendChild(tjetSubmit)
tjet.appendChild(tjetMessages)
tjet.appendChild(tjetTypingIndicator)
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
    if (tjetState.remoteID === data.id) bubble.classList.add('tjet-sent')

    bubble.appendChild(messageName)
    bubble.appendChild(senderId)
    bubble.appendChild(messageContent)
    tjetMessages.appendChild(bubble)
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

    // Check if people are typing
    tjetCheckTypingIndicators()
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

        if (typing.length === 1) {
            tjetTypingIndicator.innerHTML = `<span class="tjet-name">${tjetGetName(typing[0])}</span> ${tjetLabels.typingSingular}&hellip;`
        } else if (typing.length === 2) {
            tjetTypingIndicator.innerHTML = `<span class="tjet-name">${tjetGetName(typing[0])}</span> ${tjetLabels.and} <span class="tjet-name">${tjetGetName(typing[1])}</span> ${tjetLabels.typingPlural}&hellip;`
        } else if (typing.length === 3) {
            tjetTypingIndicator.innerHTML = `<span class="tjet-name">${tjetGetName(typing[0])}</span>, <span class="tjet-name">${tjetGetName(typing[1])}</span> ${tjetLabels.and} <span class="tjet-name">${tjetGetName(typing[2])}</span> ${tjetLabels.typingPlural}&hellip;`
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

// Helper function to fetch names for IDs
function tjetGetName(id) {
    if (tjetState.clients[id]) {
        return tjetState.clients[id].tjetName
    }
    return false
}

// Bind listeners
tjetSubmit.addEventListener('click', tjetHandleInput)
tjetForm.addEventListener('submit', tjetHandleInput)
tjetInput.addEventListener('keyup', tjetBroadcastTypingIndicator)
