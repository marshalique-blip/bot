(function() {
    // 1. Create the Chat Bubble
    const bubble = document.createElement('div');
    bubble.id = 'bot-bubble';
    bubble.innerHTML = `💬`;
    Object.assign(bubble.style, {
        position: 'fixed', bottom: '20px', right: '20px',
        width: '60px', height: '60px', backgroundColor: '#4f46e5',
        borderRadius: '50%', color: 'white', display: 'flex',
        alignItems: 'center', justifyContent: 'center', fontSize: '24px',
        cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: '9999'
    });
    document.body.appendChild(bubble);

    // 2. Create the Chat Window (Hidden by default)
    const window = document.createElement('div');
    window.id = 'bot-window';
    Object.assign(window.style, {
        position: 'fixed', bottom: '90px', right: '20px',
        width: '350px', height: '500px', backgroundColor: 'white',
        borderRadius: '15px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        display: 'none', flexDirection: 'column', overflow: 'hidden', zIndex: '9999'
    });
    
    // 3. Load Bot Data from your Render Server
    const botId = document.currentScript.getAttribute('data-bot-id');
    
    fetch(`https://bot-8yai.onrender.com/api/get-bot?id=${botId}`)
        .then(res => res.json())
        .then(bot => {
            window.innerHTML = `
                <div style="background:#4f46e5; padding:15px; color:white; font-weight:bold;">
                    ${bot.name}
                </div>
                <div id="bot-messages" style="flex:1; padding:15px; overflow-y:auto; font-family:sans-serif; font-size:14px;">
                    <div style="background:#f1f5f9; padding:10px; border-radius:10px; margin-bottom:10px;">
                        ${bot.greeting}
                    </div>
                </div>
                <div style="padding:10px; border-top:1px solid #eee; display:flex;">
                    <input id="bot-input" type="text" placeholder="Type a message..." style="flex:1; border:none; outline:none;">
                    <button id="bot-send" style="background:none; border:none; color:#4f46e5; cursor:pointer; font-weight:bold;">Send</button>
                </div>
            `;
        });

    document.body.appendChild(window);

    // 4. Toggle Logic
    bubble.onclick = () => {
        window.style.display = window.style.display === 'none' ? 'flex' : 'none';
    };
})();