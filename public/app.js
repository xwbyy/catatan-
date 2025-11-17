// app.js
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const chatContainer = document.getElementById('chatContainer');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const menuButton = document.getElementById('menuButton');
    const closeSidebar = document.getElementById('closeSidebar');
    const sidebar = document.getElementById('sidebar');
    const modelButton = document.getElementById('modelButton');
    const currentModelDisplay = document.getElementById('currentModelDisplay');
    const sendSound = document.getElementById('sendSound');
    const receiveSound = document.getElementById('receiveSound');
    const newChatButton = document.getElementById('newChatButton');
    const newChatSidebarButton = document.getElementById('newChatSidebarButton');
    const historyButton = document.getElementById('historyButton');
    const wallpaperToggle = document.getElementById('wallpaperToggle');
    const wallpaperOpacitySlider = document.getElementById('wallpaperOpacitySlider');
    const welcomeModal = document.getElementById('welcomeModal');
    const closeModal = document.getElementById('closeModal');
    const continueButton = document.getElementById('continueButton');
    const dontShowAgain = document.getElementById('dontShowAgain');
    const toastNotification = document.getElementById('toastNotification');
    const toolsSection = document.getElementById('toolsSection');

    // State variables
    let currentModel = 'gpt3';
    let sessionId = localStorage.getItem('rylac_session_id') || generateSessionId();
    let isWaitingForResponse = false;
    let chatHistory = JSON.parse(localStorage.getItem('rylac_chat_history')) || [];
    let currentChatId = localStorage.getItem('rylac_current_chat_id') || generateChatId();

    // Initialize the chat
    initChat();
    renderTools();

    // Viewport adjustment for mobile
    function updateViewportHeight() {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    updateViewportHeight();
    window.addEventListener('resize', updateViewportHeight);
    window.addEventListener('orientationchange', updateViewportHeight);

    // Render tools from config
    function renderTools() {
        const toolsHTML = toolsConfig.map(tool => `
            <a href="${tool.path}" class="sidebar-link">
                <i class="${tool.icon}"></i> ${tool.name}
            </a>
        `).join('');

        toolsSection.innerHTML += toolsHTML;
    }

    // Welcome modal
    const welcomeShown = localStorage.getItem('rylac_welcome_shown');
    if (welcomeShown !== 'true') {
        setTimeout(() => welcomeModal.classList.add('show'), 500);
    }

    function closeWelcomeModal() {
        welcomeModal.classList.remove('show');
        if (dontShowAgain.checked) {
            localStorage.setItem('rylac_welcome_shown', 'true');
        }
    }
    closeModal.addEventListener('click', closeWelcomeModal);
    continueButton.addEventListener('click', closeWelcomeModal);

    // Toast notification
    function showToast(message) {
        toastNotification.textContent = message;
        toastNotification.classList.add('show');
        setTimeout(() => toastNotification.classList.remove('show'), 3000);
    }

    // Event listeners
    messageInput.addEventListener('input', handleInputChange);
    messageInput.addEventListener('keydown', handleKeyDown);
    sendButton.addEventListener('click', sendMessage);
    menuButton.addEventListener('click', toggleSidebar);
    closeSidebar.addEventListener('click', toggleSidebar);
    newChatButton.addEventListener('click', startNewChat);
    newChatSidebarButton.addEventListener('click', startNewChat);
    historyButton.addEventListener('click', showChatHistory);
    wallpaperToggle.addEventListener('change', toggleWallpaper);
    wallpaperOpacitySlider.addEventListener('input', updateWallpaperOpacity);

    // Initialize chat
    function initChat() {
        const savedHistory = localStorage.getItem('rylac_chat_history');
        if (savedHistory) {
            chatHistory = JSON.parse(savedHistory);
        }

        const currentChat = chatHistory.find(chat => chat.id === currentChatId);
        if (currentChat) {
            chatContainer.innerHTML = currentChat.messages;
            setTimeout(() => {
                addCodeCopyButtons();
                scrollToBottom();
            }, 100);
        } else {
            chatContainer.innerHTML = '<div class="empty-state">Mulai percakapan baru dengan RyLac AI</div>';
        }

        setupTextareaAutoResize();
        updateModelDisplay();
        loadWallpaperSettings();
    }

    function handleInputChange() {
        sendButton.disabled = messageInput.value.trim() === '';
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (messageInput.value.trim() !== '') {
                sendMessage();
            }
        }
    }

    function sendMessage() {
        const messageText = messageInput.value.trim();
        if (messageText === '' || isWaitingForResponse) return;

        const emptyState = chatContainer.querySelector('.empty-state');
        if (emptyState) emptyState.remove();

        addMessage(messageText, 'user');
        playSound(sendSound);
        messageInput.value = '';
        sendButton.disabled = true;
        adjustTextareaHeight();
        showTypingIndicator();
        isWaitingForResponse = true;
        sendButton.classList.add('sending');

        // Use our new server API instead of direct external API
        callChatAPI(messageText);
    }

    function callChatAPI(messageText) {
        console.log('Sending message to chat API:', messageText);

        const endpoint = `/api/chat?message=${encodeURIComponent(messageText)}&session=${sessionId}`;

        fetch(endpoint, {
            headers: { 
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Chat API response:', data);
            removeTypingIndicator();
            playSound(receiveSound);
            
            let responseText;
            if (data.success) {
                responseText = data.result;
            } else if (data.fallback) {
                responseText = data.result;
            } else {
                responseText = "Maaf, saya tidak bisa memproses permintaan Anda saat ini. Silakan coba lagi.";
            }

            const processedResponse = processCodeBlocks(responseText);
            addMessage(processedResponse, 'bot');
            setTimeout(() => addCodeCopyButtons(), 100);
            saveChat();
        })
        .catch(error => {
            console.error('Chat API Error:', error);
            removeTypingIndicator();
            
            // Fallback responses
            const fallbackResponses = [
                "Hai! Maaf, saat ini ada gangguan teknis nih. Tapi saya tetap di sini untuk kamu! 😊",
                "Wah, sepertinya koneksi sedang bermasalah. Coba ceritakan sesuatu yang menyenangkan? 🌸",
                "RyLac di sini! Sedang ada gangguan teknis, tapi jangan khawatir. Aku tetap bisa mendengarkan ceritamu! 💫"
            ];
            
            const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
            addMessage(randomResponse, 'bot');
            saveChat();
        })
        .finally(() => {
            isWaitingForResponse = false;
            sendButton.classList.remove('sending');
        });
    }

    function processCodeBlocks(text) {
        const codeBlockRegex = /```(\w*)\n([\s\S]*?)\n```/g;
        return text.replace(codeBlockRegex, (match, language, code) => {
            const langClass = language ? `language-${language}` : '';
            return `
                <div class="code-block">
                    <div class="code-header">
                        <span class="code-language">${language || 'code'}</span>
                        <button class="copy-button" data-code="${escapeHtml(code.trim())}">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                    </div>
                    <pre><code class="${langClass}">${escapeHtml(code.trim())}</code></pre>
                </div>
            `;
        });
    }

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function addCodeCopyButtons() {
        document.querySelectorAll('.code-block .copy-button').forEach(button => {
            button.addEventListener('click', function() {
                const code = this.getAttribute('data-code');
                navigator.clipboard.writeText(code).then(() => {
                    showToast('Kode berhasil disalin!');
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                    showToast('Gagal menyalin kode');
                });
            });
        });
    }

    function addMessage(text, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);

        const messageText = document.createElement('div');
        messageText.innerHTML = text;

        const messageTime = document.createElement('div');
        messageTime.classList.add('message-time');
        messageTime.textContent = getCurrentTime();

        messageElement.appendChild(messageText);
        messageElement.appendChild(messageTime);
        chatContainer.appendChild(messageElement);
        scrollToBottom();
    }

    function showTypingIndicator() {
        const typingElement = document.createElement('div');
        typingElement.classList.add('typing-indicator');
        typingElement.id = 'typingIndicator';

        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.classList.add('typing-dot');
            typingElement.appendChild(dot);
        }

        chatContainer.appendChild(typingElement);
        scrollToBottom();
    }

    function removeTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) typingIndicator.remove();
    }

    function scrollToBottom() {
        setTimeout(() => {
            chatContainer.scrollTo({
                top: chatContainer.scrollHeight,
                behavior: 'smooth'
            });
        }, 50);
    }

    function getCurrentTime() {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function generateSessionId() {
        const id = Math.floor(Math.random() * 1000000).toString();
        localStorage.setItem('rylac_session_id', id);
        return id;
    }

    function generateChatId() {
        const id = Date.now().toString();
        localStorage.setItem('rylac_current_chat_id', id);
        return id;
    }

    function saveChat() {
        const chatHTML = chatContainer.innerHTML;

        const chatIndex = chatHistory.findIndex(chat => chat.id === currentChatId);
        if (chatIndex !== -1) {
            chatHistory[chatIndex] = {
                ...chatHistory[chatIndex],
                messages: chatHTML,
                lastUpdated: new Date().toISOString(),
                model: currentModel
            };
        } else {
            chatHistory.push({
                id: currentChatId,
                title: getChatTitle(chatHTML),
                messages: chatHTML,
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
                model: currentModel
            });
        }

        localStorage.setItem('rylac_chat_history', JSON.stringify(chatHistory));
    }

    function getChatTitle(chatHTML) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = chatHTML;
        const firstMessage = tempDiv.querySelector('.user-message');
        return firstMessage ? firstMessage.textContent.trim().substring(0, 30) + 
            (firstMessage.textContent.trim().length > 30 ? '...' : '') : 'Percakapan Baru';
    }

    function startNewChat() {
        saveChat();
        currentChatId = generateChatId();
        sessionId = generateSessionId();
        chatContainer.innerHTML = '<div class="empty-state">Mulai percakapan baru dengan RyLac AI</div>';
        sidebar.classList.remove('open');
        showToast('Percakapan baru dimulai');
    }

    function showChatHistory() {
        const historyHTML = `
            <div style="padding: 16px;">
                <h3 style="margin-bottom: 16px;">Riwayat Percakapan</h3>
                ${chatHistory.map(chat => `
                    <div class="history-item" onclick="loadChat('${chat.id}')">
                        <div class="history-title">${chat.title}</div>
                        <div class="history-time">${new Date(chat.lastUpdated).toLocaleString()}</div>
                        <div class="history-model">
                            <i class="fas fa-brain"></i> GPT-3
                        </div>
                    </div>
                `).reverse().join('')}
                ${chatHistory.length === 0 ? '<p class="no-history">Tidak ada riwayat percakapan</p>' : ''}
            </div>
        `;

        chatContainer.innerHTML = historyHTML;
        sidebar.classList.remove('open');
        chatContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function loadChat(chatId) {
        const chat = chatHistory.find(c => c.id === chatId);
        if (chat) {
            currentChatId = chatId;
            localStorage.setItem('rylac_current_chat_id', chatId);
            chatContainer.innerHTML = chat.messages;
            setTimeout(() => {
                addCodeCopyButtons();
                scrollToBottom();
            }, 100);
            showToast('Percakapan dimuat');
        }
    }

    function updateModelDisplay() {
        currentModelDisplay.innerHTML = `
            <i class="fas fa-brain"></i> GPT-3
        `;
    }

    function setupTextareaAutoResize() {
        messageInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    }

    function adjustTextareaHeight() {
        messageInput.style.height = 'auto';
    }

    function playSound(audioElement) {
        audioElement.currentTime = 0;
        audioElement.play().catch(e => console.log("Audio play failed:", e));
    }

    function toggleSidebar() {
        sidebar.classList.toggle('open');
    }

    function toggleWallpaper() {
        document.body.classList.toggle('no-wallpaper', !this.checked);
        localStorage.setItem('rylac_wallpaper_enabled', this.checked);
        showToast(`Wallpaper ${this.checked ? 'diaktifkan' : 'dinonaktifkan'}`);
    }

    function updateWallpaperOpacity() {
        const opacity = this.value / 100;
        document.documentElement.style.setProperty('--wallpaper-opacity', opacity);
        localStorage.setItem('rylac_wallpaper_opacity', opacity);
    }

    function loadWallpaperSettings() {
        const wallpaperEnabled = localStorage.getItem('rylac_wallpaper_enabled');
        if (wallpaperEnabled !== null) {
            wallpaperToggle.checked = wallpaperEnabled === 'true';
            document.body.classList.toggle('no-wallpaper', !wallpaperToggle.checked);
        }

        const wallpaperOpacity = localStorage.getItem('rylac_wallpaper_opacity');
        if (wallpaperOpacity !== null) {
            const opacityValue = parseFloat(wallpaperOpacity) * 100;
            wallpaperOpacitySlider.value = opacityValue;
            document.documentElement.style.setProperty('--wallpaper-opacity', wallpaperOpacity);
        }
    }

    // Test server connection on load
    function testServerConnection() {
        fetch('/api/health')
            .then(response => response.json())
            .then(data => {
                console.log('Server health:', data);
            })
            .catch(error => {
                console.warn('Server health check failed:', error);
            });
    }

    // Test connection after page load
    setTimeout(testServerConnection, 2000);

    window.loadChat = loadChat;
});