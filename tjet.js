const tjetState = {
    name: false
}
const tjetLabels = {
    sendLabel:  'Send',
    setNameLabel: 'Set name',
    noNamePlaceholder: 'Enter your name',
    sendPlaceholder: 'Send a message'
}

// Create UI ------------
const tjet = document.getElementById('tjet')
const tjetMessages = document.createElement('ul')
tjetMessages.classList.add('tjet-messages')

// Form
const tjetForm = document.createElement('form')
tjetForm.action = 'javascript:;'
tjetForm.classList.add('tjet-form')
tjetForm.classList.add('tjet-no-name')

// Input box
const tjetInput = document.createElement('input')
tjetInput.name = 'tjet-input'
tjetInput.placeholder = tjetLabels.noNamePlaceholder
tjetInput.classList.add('tjet-input')

// Submit button
const tjetSubmit = document.createElement('a')
tjetSubmit.innerHTML = tjetLabels.setNameLabel
tjetSubmit.classList.add('tjet-submit')

// Put them all together
tjet.appendChild(tjetMessages)
tjetForm.appendChild(tjetInput)
tjetForm.appendChild(tjetSubmit)
tjet.appendChild(tjetForm)
// End create UI ------------

// Connect to server
const socket = io(tjet.dataset.server || null)

socket.on('chat-message', data => {
    const bubble = document.createElement('li')
    const name = document.createElement('div')
    const message = document.createElement('div')

    bubble.classList.add('tjet-message')
    name.classList.add('tjet-message-name')
    name.innerHTML = data.name
    message.classList.add('tjet-message-content')
    message.innerHTML = data.message

    bubble.appendChild(name)
    bubble.appendChild(message)
    tjetMessages.appendChild(bubble)
})

// Handle inputs
function tjetHandleInput() {
    if(tjetState.name) {
        socket.emit('chat-message', {
            message: tjetInput.value,
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
