(function() {
    // 1. EXTRACT DATA FROM SCRIPT TAG
    const scriptTag = document.currentScript;
    const botId = scriptTag.getAttribute('data-bot-id');
    const BASE_URL = 'https://your-app.onrender.com'; // <--- REPLACE THIS

    // 2. INJECT CSS STYLES
    const style = document.createElement('style');
    style.innerHTML = `
        #bot-container { position: fixed; bottom: 20px; right: 20px; font-family: sans-serif; z-index: 1000; }
        #bot-bubble { width: 60px; height: 60px; background: #007bff; borderRadius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.2); transition: transform 0.2s; }
        #bot-bubble:hover { transform: scale(1.1); }
        #bot-window { width: 350px; height: 450px; background: white; border-radius: 12px; display: none; flex-direction: column; box-shadow: 0 8px 20px rgba(0,0,0,0.15); overflow: hidden; margin-bottom: 10px; }
        #bot-header { background: #007bff; color: white; padding: 15px; font-weight: bold; display: flex; justify-content: space-between; }
        #bot-messages { flex: 1; padding: 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; background: #f9f9f9; }
        #bot-input-area { border-top: 1px solid #eee; padding: 10px; display: flex; }
        #bot-input { flex: 1; border: 1px solid #ddd; padding: 8px; border-radius: 4px; outline: none; }
        .msg { padding: 8px 12px; border-radius: 10px; max-width: 80%; font-size: 14px; line-height: 1.4; }
        .user-msg { align-self: flex-end; background: #007bff; color: white; }
        .bot-msg { align-self: flex-start; background: #e9e9eb; color: black; }
    `;
    document.head.appendChild(style);

    // 3. CREATE UI ELEMENTS
    const container = document.createElement('div');
    container.id = 'bot-container';
    container.innerHTML = `
        <div id="bot-window">
            <div id="bot-header"><span id="bot-name">AI Assistant</span><span id="close-bot" style="cursor:pointer">✕</span></div>
            <div id="bot-messages"></div>
            <div id="bot-input-area">
                <input type="text" id="bot-input" placeholder="Type a message...">
            </div>
        </div>
        <div id="bot-bubble">💬</div>
    `;
    document.body.appendChild(container);

    const botWindow = document.getElementById('bot-window');
    const botBubble = document.getElementById('bot-bubble');
    const botMessages = document.getElementById('bot-messages');
    const botInput = document.getElementById('bot-input');
    const botNameHeader = document.getElementById('bot-name');

    // 4. LOAD BOT SETTINGS FROM SERVER
    fetch(`${BASE_URL}/api/get-bot?id=${botId}`)
        .then(res => res.json())
        .then(data => {
            botNameHeader.innerText = data.name;
            addMessage(data.greeting, 'bot');
        })
        .catch(() => addMessage("Hello! How can I help you?", 'bot'));

    // 5. HELPER: ADD MESSAGE TO SCREEN
    function addMessage(text, sender) {
        const div = document.createElement('div');
        div.className = `msg ${sender}-msg`;
        div.innerText = text;
        botMessages.appendChild(div);
        botMessages.scrollTop = botMessages.scrollHeight;
    }

    // 6. TOGGLE WINDOW
    botBubble.onclick = () => botWindow.style.display = botWindow.style.display === 'flex' ? 'none' : 'flex';
    document.getElementById('close-bot').onclick = () => botWindow.style.display = 'none';

    // 7. HANDLE SENDING
    botInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter' && botInput.value.trim() !== "") {
            const message = botInput.value;
            addMessage(message, 'user');
            botInput.value = "";

            // Call the chat API
            try {
                const response = await fetch(`${BASE_URL}/api/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message, botId })
                });
                const data = await response.json();
                addMessage(data.reply || "I'm having trouble thinking right now.", 'bot');
            } catch (err) {
                addMessage("Error: Could not connect to AI. Check your Render logs.", 'bot');
            }
        }
    });
})();
