document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const newChatBtn = document.getElementById('new-chat-btn');
    let chatHistory = [];

    // Cargar historial de chat del localStorage
    function loadChatHistory() {
        const savedHistory = localStorage.getItem('chatHistory');
        if (savedHistory) {
            chatHistory = JSON.parse(savedHistory);
            chatHistory.forEach(message => addMessage(message.text, message.sender, false));
        }
    }

    // Guardar historial de chat en el localStorage
    function saveChatHistory() {
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }

    // Función para añadir un mensaje a la interfaz
    function addMessage(message, sender, save = true) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}-message`;

        const messageText = document.createElement('span');
        messageText.innerText = message;
        messageElement.appendChild(messageText);

        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.innerText = 'Copiar';
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(message).then(() => {
                copyBtn.innerText = 'Copiado!';
                setTimeout(() => copyBtn.innerText = 'Copiar', 2000);
            });
        });
        messageElement.appendChild(copyBtn);

        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll

        if (save) {
            chatHistory.push({ text: message, sender });
            saveChatHistory();
        }
    }

    // Función para simular una respuesta de la IA
    function simulateIaResponse(userMessage) {
        const response = `Respuesta simulada a: "${userMessage}"`;
        addMessage(response, 'ia');

        if (userMessage.toLowerCase().includes('código')) {
            const codeResponse = `motor.crear_archivo('nuevo_script.js');`;
            addMessage(codeResponse, 'ia');
        }
    }

    // Enviar mensaje al pulsar el botón
    sendBtn.addEventListener('click', () => {
        const message = messageInput.value.trim();
        if (message) {
            addMessage(message, 'user');
            messageInput.value = '';
            setTimeout(() => simulateIaResponse(message), 500);
        }
    });

    // Enviar mensaje al pulsar Enter
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendBtn.click();
        }
    });

    // Iniciar nuevo chat
    newChatBtn.addEventListener('click', () => {
        chatMessages.innerHTML = '';
        chatHistory = [];
        localStorage.removeItem('chatHistory');
    });

    // Cargar el historial al iniciar
    loadChatHistory();
});
