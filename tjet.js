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
    remoteID: null
}

// Localization
const tjetLabels = {
    sendLabel:  'Send',
    setNameLabel: 'Set name',
    noNamePlaceholder: 'Enter your name',
    sendPlaceholder: 'Send a message'
}

// Create UI
const tjet = document.getElementById('tjet')
const tjetMessages = h('ul.tjet-messages')
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
    }

    tjetInput.value = ''
}

// Bind listeners
tjetSubmit.addEventListener('click', tjetHandleInput)
tjetForm.addEventListener('submit', tjetHandleInput)
