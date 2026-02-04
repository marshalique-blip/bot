(function() {
    // 1. EXTRACT DATA FROM SCRIPT TAG
    const scriptTag = document.currentScript;
    const botId = scriptTag.getAttribute('data-bot-id');
    
    // 🔧 REPLACE THIS WITH YOUR RENDER URL
    const BASE_URL = 'https://bot-8yai.onrender.com';
    // Example: 'https://chatbot-api-abc123.onrender.com'
    
   // 2. INJECT CSS STYLES
const style = document.createElement('style');
style.innerHTML = `
    #bot-container { 
        position: fixed; 
        bottom: 20px; 
        right: 20px; 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
        z-index: 9999; 
    }
    #bot-bubble { 
        width: 60px; 
        height: 60px; 
        background: linear-gradient(135deg, #06B6D4 0%, #0891B2 100%);
        border-radius: 50%; 
        cursor: pointer; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        box-shadow: 0 4px 15px rgba(6, 182, 212, 0.4); 
        transition: all 0.3s ease;
        position: fixed;
        bottom: 20px;
        right: 20px;
    }
    #bot-bubble:hover { 
        transform: scale(1.1); 
        box-shadow: 0 6px 20px rgba(6, 182, 212, 0.6);
    }
    #bot-bubble svg {
        width: 28px;
        height: 28px;
        stroke: white;
        fill: none;
    }
    #bot-bubble.hidden {
        display: none;
    }
    
    /* Move bubble to the left when window is open (desktop only) */
    #bot-bubble.window-open {
        right: 440px; /* 400px window + 20px gap + 20px bubble margin */
    }
    
    /* DESKTOP/LAPTOP - Bottom right corner window with padding and navbar clearance */
    #bot-window { 
        position: fixed;
        width: 400px; 
        height: calc(100vh - 120px); /* Full height minus navbar space and bottom margin */
        max-height: 700px; /* Cap maximum height */
        bottom: 20px;
        right: 20px;
        background: white; 
        border-radius: 16px;
        display: none; 
        flex-direction: column; 
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        overflow: hidden; 
        animation: slideUp 0.3s ease;
        z-index: 10000;
    }

    @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    
    #bot-header { 
        background: linear-gradient(135deg, #06B6D4 0%, #0891B2 100%);
        color: white; 
        padding: 18px; 
        font-weight: 600; 
        display: flex; 
        justify-content: space-between; 
        align-items: center;
        font-size: 16px;
        flex-shrink: 0;
    }
    #close-bot {
        cursor: pointer;
        font-size: 16px;
        font-weight: 600;
        line-height: 1;
        opacity: 0.9;
        transition: opacity 0.2s;
        background: rgba(255,255,255,0.2);
        padding: 6px 12px;
        border-radius: 6px;
    }
    #close-bot:hover {
        opacity: 1;
        background: rgba(255,255,255,0.3);
    }
    #bot-messages { 
        flex: 1; 
        padding: 15px; 
        overflow-y: auto; 
        display: flex; 
        flex-direction: column; 
        gap: 12px; 
        background: #F8FAFC;
    }
    #bot-messages::-webkit-scrollbar {
        width: 6px;
    }
    #bot-messages::-webkit-scrollbar-thumb {
        background: #CBD5E1;
        border-radius: 3px;
    }
    #bot-input-area { 
        border-top: 1px solid #E2E8F0; 
        padding: 12px; 
        display: flex; 
        gap: 8px;
        background: white;
        flex-shrink: 0;
    }
    #bot-input { 
        flex: 1; 
        border: 2px solid #E2E8F0; 
        padding: 10px 14px; 
        border-radius: 8px; 
        outline: none;
        font-size: 16px; /* Prevent iOS zoom on focus */
        transition: border-color 0.2s;
    }
    #bot-input:focus {
        border-color: #06B6D4;
    }
    #bot-send-btn {
        background: linear-gradient(135deg, #06B6D4 0%, #0891B2 100%);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s;
        font-size: 14px;
    }
    #bot-send-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
    }
    #bot-send-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    .msg { 
        padding: 12px 16px; 
        border-radius: 12px; 
        max-width: 80%; 
        font-size: 14px; 
        line-height: 1.5;
        word-wrap: break-word;
        animation: fadeIn 0.3s ease;
    }
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .user-msg { 
        align-self: flex-end; 
        background: linear-gradient(135deg, #06B6D4 0%, #0891B2 100%);
        color: white; 
        border-bottom-right-radius: 4px;
        box-shadow: 0 2px 8px rgba(6, 182, 212, 0.2);
    }
    .bot-msg { 
        align-self: flex-start; 
        background: white;
        color: #0F172A; 
        border-bottom-left-radius: 4px;
        box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
        border: 1px solid #E2E8F0;
    }
    .typing-indicator {
        display: flex;
        gap: 4px;
        padding: 12px 16px;
        background: white;
        border-radius: 12px;
        align-self: flex-start;
        box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
        border: 1px solid #E2E8F0;
    }
    .typing-indicator span {
        width: 8px;
        height: 8px;
        background: #06B6D4;
        border-radius: 50%;
        animation: bounce 1.4s infinite ease-in-out;
    }
    .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
    .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
    @keyframes bounce {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1); }
    }
    .error-msg {
        align-self: flex-start;
        background: #FEE2E2;
        color: #991B1B;
        border: 1px solid #FCA5A5;
    }

    /* MOBILE - Full viewport with keyboard handling */
    @media (max-width: 768px) {
        #bot-container {
            bottom: 0 !important;
            right: 0 !important;
        }
        #bot-bubble {
            position: fixed;
            bottom: 16px;
            right: 16px;
        }
        #bot-bubble.window-open {
            right: 16px; /* Don't move on mobile */
        }
        #bot-window {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            height: 100dvh;
            max-height: none;
            border-radius: 0;
            bottom: auto;
            right: auto;
            z-index: 10000;
        }
        #bot-input {
            font-size: 16px; /* Prevent iOS zoom */
        }
        #bot-input-area {
            padding-bottom: max(12px, env(safe-area-inset-bottom));
        }
        /* Prevent body scroll when chat is open on mobile */
        body.chat-open {
            overflow: hidden;
            position: fixed;
            width: 100%;
        }
    }

    /* TABLET - Larger corner window */
    @media (min-width: 769px) and (max-width: 1024px) {
        #bot-window {
            width: 420px;
            max-height: 650px;
        }
        #bot-bubble.window-open {
            right: 460px; /* 420px window + 20px gap + 20px bubble margin */
        }
    }

    /* LARGE DESKTOP - Even larger corner window */
    @media (min-width: 1440px) {
        #bot-window {
            width: 450px;
            max-height: 750px;
        }
        #bot-bubble.window-open {
            right: 490px; /* 450px window + 20px gap + 20px bubble margin */
        }
    }
`;
document.head.appendChild(style);

// 3. CREATE UI ELEMENTS
const container = document.createElement('div');
container.id = 'bot-container';
container.innerHTML = `
    <div id="bot-window">
        <div id="bot-header">
            <span id="bot-name">Arrilan Assistant</span>
            <span id="close-bot">Done</span>
        </div>
        <div id="bot-messages"></div>
        <div id="bot-input-area">
            <input type="text" id="bot-input" placeholder="Ask me anything...">
            <button id="bot-send-btn">Send</button>
        </div>
    </div>
    <div id="bot-bubble">
        <i data-lucide="message-circle"></i>
    </div>
`;

document.body.appendChild(container);

// Initialize Lucide icons for the bubble
lucide.createIcons();

    const botWindow = document.getElementById('bot-window');
    const botBubble = document.getElementById('bot-bubble');
    const botMessages = document.getElementById('bot-messages');
    const botInput = document.getElementById('bot-input');
    const botNameHeader = document.getElementById('bot-name');
    const sendBtn = document.getElementById('bot-send-btn');


    // 4. LOAD BOT SETTINGS FROM SERVER
    fetch(`${BASE_URL}/api/get-bot?id=${botId}`)
        .then(res => {
            if (!res.ok) throw new Error('Bot not found');
            return res.json();
        })
        .then(data => {
            botNameHeader.innerText = data.name || 'AI Assistant';
            addMessage(data.greeting || "Hello! How can I help you?", 'bot');
        })
        .catch((err) => {
            console.error('Error loading bot:', err);
            addMessage("Hello! I'm ready to help you.", 'bot');
        });

    // 5. HELPER: ADD MESSAGE TO SCREEN
    function addMessage(text, sender, isError = false) {
        const div = document.createElement('div');
        div.className = `msg ${sender}-msg${isError ? ' error-msg' : ''}`;
        div.innerText = text;
        botMessages.appendChild(div);
        botMessages.scrollTop = botMessages.scrollHeight;
    }

    // 6. HELPER: SHOW TYPING INDICATOR
    function showTyping() {
        const typing = document.createElement('div');
        typing.className = 'typing-indicator';
        typing.id = 'typing-indicator';
        typing.innerHTML = '<span></span><span></span><span></span>';
        botMessages.appendChild(typing);
        botMessages.scrollTop = botMessages.scrollHeight;
    }

    function hideTyping() {
        const typing = document.getElementById('typing-indicator');
        if (typing) typing.remove();
    }

    // 7. TOGGLE WINDOW
botBubble.addEventListener('click', function() {
    if (botWindow.style.display === 'flex') {
        botWindow.style.display = 'none';
        botBubble.classList.remove('window-open');
        document.body.classList.remove('chat-open');
    } else {
        botWindow.style.display = 'flex';
        botBubble.classList.add('window-open');
        document.body.classList.add('chat-open');
        
        // Auto-focus input and scroll to it on mobile
        setTimeout(() => {
            botInput.focus();
            botInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    }
});

// Close button
document.getElementById('close-bot').addEventListener('click', function() {
    botWindow.style.display = 'none';
    botBubble.classList.remove('window-open');
    document.body.classList.remove('chat-open');
});

// Focus input when clicking anywhere in the input area (mobile helper)
document.getElementById('bot-input-area').addEventListener('click', function() {
    botInput.focus();
});

    
    // 8. HANDLE SENDING MESSAGE
    async function sendMessage() {
        const message = botInput.value.trim();
        if (message === "") return;

        // Add user message
        addMessage(message, 'user');
        botInput.value = "";
        
        // Disable input while processing
        botInput.disabled = true;
        sendBtn.disabled = true;
        
        // Show typing indicator
        showTyping();

        try {
            const response = await fetch(`${BASE_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, botId })
            });

            hideTyping();

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.reply) {
                addMessage(data.reply, 'bot');
            } else {
                addMessage("I received your message but couldn't generate a response.", 'bot', true);
            }
        } catch (err) {
            hideTyping();
            console.error('Chat error:', err);
            addMessage("Sorry, I'm having trouble connecting. Please try again.", 'bot', true);
        } finally {
            // Re-enable input
            botInput.disabled = false;
            sendBtn.disabled = false;
            botInput.focus();
        }
    }

    // 9. EVENT LISTENERS
    botInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    sendBtn.addEventListener('click', sendMessage);

    // 10. AUTO-FOCUS INPUT WHEN WINDOW OPENS
    botBubble.addEventListener('click', () => {
        setTimeout(() => botInput.focus(), 100);
    });

    console.log('✅ Chatbot widget loaded successfully');
    console.log('🤖 Bot ID:', botId);
    console.log('🌐 API URL:', BASE_URL);
})();



