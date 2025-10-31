// Campground UI JavaScript - Tomo API Integration
const API_BASE = 'http://localhost:8080/api';

// State
let conversationHistory = [];
let chatThreads = [];
let currentThreadId = null;
let currentParams = {
    temperature: 0.7,
    max_new_tokens: 150,
    top_k: 50,
    top_p: 0.95,
    do_sample: true
};
let stats = {
    totalLatency: 0,
    messageCount: 0,
    chatCount: 0,
    commandCount: 0
};
let messages = []; // Track message elements for positioning

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkStatus();
    setInterval(checkStatus, 5000); // Check status every 5 seconds
    loadChatThreads();
    initializeCurrentThread();
    pollKnobStatus(); // Check for knob button presses

    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        const chatPanel = document.getElementById('chatPanel');
        const toolbox = document.getElementById('toolbox');

        // Check if click is outside sidebar and toolbox
        if (chatPanel && !chatPanel.contains(e.target) && !toolbox.contains(e.target)) {
            closePanel();
        }
    });

    // Setup textarea auto-grow
    const textarea = document.getElementById('userInput');
    if (textarea) {
        // Auto-grow on input
        textarea.addEventListener('input', () => {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
        });

        // Send on Enter (without Shift)
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
});

// API Functions
async function apiCall(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

// Status Check
async function checkStatus() {
    try {
        const status = await apiCall('/status');
        document.getElementById('apiStatus').textContent = 'Online';
        document.getElementById('statusIndicator').className = 'indicator online';
        document.getElementById('modelStatus').textContent = status.model_loaded ? 'Yes' : 'No';
        document.getElementById('adapterStatus').textContent = status.current_adapter || 'None';
        document.getElementById('messageCount').textContent = status.conversation_count;

        // Update current mood if changed
        if (status.current_mood) {
            updateMoodDisplay(status.current_mood);
        }
    } catch (error) {
        document.getElementById('apiStatus').textContent = 'Offline';
        document.getElementById('statusIndicator').className = 'indicator offline';
    }
}

// Send Message
async function sendMessage() {
    const input = document.getElementById('userInput');
    const message = input.value.trim();

    if (!message) return;

    // Clear input and reset height
    input.value = '';
    input.style.height = 'auto';
    input.disabled = true;

    // Open chat panel if not open
    openPanel('chat');

    // Add user message to sidebar
    addSidebarMessage('user', message);

    // Save user message to thread
    saveMessageToThread({ input: message, timestamp: new Date().toISOString() });

    // Update thread title if it's the first message
    const thread = chatThreads.find(t => t.id === currentThreadId);
    if (thread && thread.messages && thread.messages.length === 1) {
        updateThreadTitle(currentThreadId, message);
    }

    // Add loading message
    const loadingMsg = addSidebarMessage('loading', '<div class="loading-dots"><span></span><span></span><span></span></div>');

    // Set mood to THINKING while processing
    updateMoodDisplay('THINKING');

    // Make API call
    apiCall('/inference', 'POST', { input: message })
        .then(response => {
            // Remove loading message
            removeMessage(loadingMsg);

            // Add response to sidebar
            addSidebarMessage('assistant', response.response);

            // Update stats
            stats.totalLatency += response.total_latency;
            stats.messageCount++;
            updateStats(response.total_latency);

            // Update mood from response
            if (response.mood) {
                updateMoodDisplay(response.mood);
            }

            // Add to history
            conversationHistory.push(response);

            // Save response to thread
            saveMessageToThread(response);
        })
        .catch(error => {
            // Remove loading message
            removeMessage(loadingMsg);

            // Add error message
            addSidebarMessage('assistant', `Error: ${error.message}`);
            updateMoodDisplay('ERROR');
        })
        .finally(() => {
            // Re-enable input
            input.disabled = false;
            input.focus();
        });
}

// Add Message Bubble to Top Display
function addMessageBubble(type, content) {
    const messageDisplay = document.getElementById('messageDisplay');
    const bubble = document.createElement('div');
    bubble.className = `message-bubble ${type}`;
    bubble.innerHTML = content;
    messageDisplay.appendChild(bubble);

    // Remove bubble after 5 seconds (except loading)
    if (type !== 'loading') {
        setTimeout(() => {
            bubble.style.transition = 'opacity 0.3s, transform 0.3s';
            bubble.style.opacity = '0';
            bubble.style.transform = 'translateX(-30px)';
            setTimeout(() => bubble.remove(), 300);
        }, 5000);
    }

    return bubble;
}

// Add Message to Sidebar (following reference positioning logic)
function addSidebarMessage(type, content) {
    const sidebarConversation = document.getElementById('sidebarConversation');
    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = `chat-bubble ${type}`;

    if (type === 'loading') {
        bubbleDiv.innerHTML = content;
    } else {
        bubbleDiv.textContent = content;
    }

    // Add to container
    sidebarConversation.appendChild(bubbleDiv);

    // Store message data
    const messageData = {
        element: bubbleDiv,
        timestamp: Date.now(),
        type: type
    };
    messages.push(messageData);

    // Position messages
    positionMessages();

    return messageData;
}

// Position messages like the reference (stacking upward from center)
function positionMessages() {
    const container = document.getElementById('sidebarConversation');
    if (!container) return;

    const containerHeight = container.clientHeight;
    const middleY = containerHeight / 2;

    // Use requestAnimationFrame for smooth positioning
    requestAnimationFrame(() => {
        let currentY = middleY;

        // Position from most recent (bottom) to oldest (top)
        for (let i = messages.length - 1; i >= 0; i--) {
            const msg = messages[i];

            // Get actual height of the element
            const rect = msg.element.getBoundingClientRect();
            const msgHeight = rect.height || 60; // fallback height

            if (i === messages.length - 1) {
                // Most recent message at middle
                currentY = middleY - msgHeight / 2;
            } else {
                // Stack upward with 15px gap
                currentY = currentY - msgHeight - 15;
            }

            // Apply position
            msg.element.style.top = `${currentY}px`;

            // Calculate opacity based on position (fade at top)
            const fadeZone = 100; // Top 100px is fade zone
            if (currentY < fadeZone) {
                const opacity = Math.max(0, currentY / fadeZone);
                msg.element.style.opacity = opacity;

                // Mark for removal if completely faded
                if (opacity <= 0 && !msg.element.classList.contains('fading')) {
                    msg.element.classList.add('fading');
                    setTimeout(() => {
                        if (msg.element.parentNode) {
                            msg.element.remove();
                            messages = messages.filter(m => m !== msg);
                        }
                    }, 600);
                }
            } else {
                msg.element.style.opacity = 1;
            }
        }
    });
}

// Remove a specific message
function removeMessage(messageData) {
    if (messageData && messageData.element && messageData.element.parentNode) {
        messageData.element.remove();
        messages = messages.filter(m => m !== messageData);
        positionMessages();
    }
}

// Update Parameter
function updateParam(param, value) {
    currentParams[param] = param === 'do_sample' ? value : parseFloat(value);

    // Update display
    const displayMap = {
        'temperature': 'tempValue',
        'max_new_tokens': 'tokensValue',
        'top_k': 'topkValue',
        'top_p': 'toppValue'
    };

    if (displayMap[param]) {
        document.getElementById(displayMap[param]).textContent = value;
    }
}

// Apply Parameters
async function applyParameters() {
    try {
        await apiCall('/parameters', 'POST', currentParams);
        addSidebarMessage('system', 'Parameters updated successfully');
    } catch (error) {
        alert('Failed to update parameters: ' + error.message);
    }
}

// Set Mood
async function setMood(mood) {
    try {
        const response = await apiCall('/mood', 'POST', { mood });
        updateMoodDisplay(mood);

        // Update mood description
        if (response.description) {
            const descEl = document.getElementById('moodDescription');
            descEl.innerHTML = `
                <strong>${mood}</strong>: ${response.description}<br>
                <em>System Prompt: ${response.system_prompt}</em>
            `;
        }

        // Update parameter sliders to reflect mood parameters
        if (response.parameters) {
            updateParamDisplays(response.parameters);
        }

        addSidebarMessage('system', `Mood set to ${mood} - ${response.description || ''}`);
    } catch (error) {
        alert('Failed to set mood: ' + error.message);
    }
}

// Toggle Mood Mode
async function toggleMoodMode(active) {
    try {
        const response = await apiCall('/mood/toggle', 'POST', { active });
        addSidebarMessage('system', response.message);

        if (!active) {
            addSidebarMessage('system', 'Manual parameter control enabled. Adjust sliders to customize.');
        }
    } catch (error) {
        alert('Failed to toggle mood mode: ' + error.message);
    }
}

// Update parameter displays from values
function updateParamDisplays(params) {
    if (params.temperature !== undefined) {
        document.getElementById('temperature').value = params.temperature;
        document.getElementById('tempValue').textContent = params.temperature;
    }
    if (params.max_new_tokens !== undefined) {
        document.getElementById('maxTokens').value = params.max_new_tokens;
        document.getElementById('tokensValue').textContent = params.max_new_tokens;
    }
    if (params.top_k !== undefined) {
        document.getElementById('topK').value = params.top_k;
        document.getElementById('topkValue').textContent = params.top_k;
    }
    if (params.top_p !== undefined) {
        document.getElementById('topP').value = params.top_p;
        document.getElementById('toppValue').textContent = params.top_p;
    }
}

// Update Mood Display
function updateMoodDisplay(mood) {
    const display = document.getElementById('currentMoodDisplay');
    if (display) {
        display.textContent = mood;
        display.className = `current-mood-display mood-${mood}`;
    }

    // Update active state on buttons
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    const activeBtn = document.querySelector(`.mood-btn.mood-${mood}`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

// Update Stats
function updateStats(lastLatency = null) {
    if (lastLatency !== null) {
        // Update HUD
        const hudLatencyEl = document.getElementById('hudLatency');
        if (hudLatencyEl) {
            hudLatencyEl.textContent = lastLatency.toFixed(2);
        }
    }
}

// Toolbox Control
let currentOptionIndex = 0;
let currentPanel = null;

function openPanel(panelName) {
    // Close any open panel
    closePanel();

    // Open the requested panel
    const panel = document.querySelector(`.side-panel[data-panel="${panelName}"]`);
    if (panel) {
        panel.classList.add('active');
        currentPanel = panelName;
    }

    // Update active state on toolbox options
    document.querySelectorAll('.toolbox-option').forEach(opt => {
        if (opt.dataset.panel === panelName) {
            opt.classList.add('active');
        } else {
            opt.classList.remove('active');
        }
    });
}

function closePanel() {
    document.querySelectorAll('.side-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    document.querySelectorAll('.toolbox-option').forEach(opt => {
        opt.classList.remove('active');
    });
    currentPanel = null;
}

function selectOption(index) {
    const options = document.querySelectorAll('.toolbox-option');
    if (options[index]) {
        currentOptionIndex = index;

        // Visual highlight (no transform to avoid vibration)
        options.forEach((opt, i) => {
            if (i === index) {
                opt.style.background = '#667eea';
                opt.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.5)';
            } else {
                opt.style.background = 'white';
                opt.style.boxShadow = '';
            }
        });
    }
}

// Unload Model
async function unloadModel() {
    if (!confirm('Unload the current model? This will free up memory.')) return;

    try {
        await apiCall('/model/unload', 'POST');
        addSidebarMessage('system', 'Model unloaded successfully');
        checkStatus();
    } catch (error) {
        alert('Failed to unload model: ' + error.message);
    }
}

// Utility Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to focus input
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('userInput').focus();
    }
});

// Chat Thread Management
function loadChatThreads() {
    const saved = localStorage.getItem('campgroundThreads');
    if (saved) {
        chatThreads = JSON.parse(saved);
    }
}

function saveChatThreads() {
    localStorage.setItem('campgroundThreads', JSON.stringify(chatThreads));
}

function initializeCurrentThread() {
    if (chatThreads.length === 0) {
        createNewThread();
    } else {
        currentThreadId = chatThreads[0].id;
    }
}

function createNewThread() {
    const thread = {
        id: Date.now(),
        title: 'New Chat',
        timestamp: new Date().toISOString(),
        messages: []
    };
    chatThreads.unshift(thread);
    currentThreadId = thread.id;
    saveChatThreads();
    return thread;
}

function newChat() {
    createNewThread();
    document.getElementById('sidebarConversation').innerHTML = '';
    conversationHistory = [];
    stats = {
        totalLatency: 0,
        messageCount: 0,
        chatCount: 0,
        commandCount: 0
    };
    updateStats();
    addSidebarMessage('system', 'New chat started');
}

function updateThreadTitle(threadId, firstMessage) {
    const thread = chatThreads.find(t => t.id === threadId);
    if (thread && thread.title === 'New Chat') {
        // Use first 30 chars of first message as title
        thread.title = firstMessage.substring(0, 30) + (firstMessage.length > 30 ? '...' : '');
        saveChatThreads();
    }
}

function saveMessageToThread(message) {
    const thread = chatThreads.find(t => t.id === currentThreadId);
    if (thread) {
        if (!thread.messages) thread.messages = [];
        thread.messages.push(message);
        saveChatThreads();
    }
}

// Setup Toolbox
const toolbox = document.getElementById('toolbox');

if (toolbox) {
    // Click handlers for toolbox options
    const options = document.querySelectorAll('.toolbox-option');
    options.forEach((option, index) => {
        option.addEventListener('click', () => {
            const panelName = option.dataset.panel;
            const action = option.dataset.action;

            if (action === 'memories') {
                // Open memory admin panel in new window
                window.open('http://localhost:5003/', '_blank');
            } else if (panelName) {
                openPanel(panelName);
            }
        });
    });

    // Scroll to navigate through options (with debouncing)
    let scrollTimeout = null;
    let isScrolling = false;

    toolbox.addEventListener('wheel', (e) => {
        e.preventDefault();

        // Ignore rapid scroll events
        if (isScrolling) return;

        isScrolling = true;
        const options = document.querySelectorAll('.toolbox-option');
        const direction = e.deltaY > 0 ? 1 : -1;

        // Update current selection
        currentOptionIndex = (currentOptionIndex + direction + options.length) % options.length;
        selectOption(currentOptionIndex);

        // Debounce: wait 150ms before allowing next scroll
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            isScrolling = false;
        }, 150);
    }, { passive: false });

    // Enter or Space key to activate current selection
    document.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !e.target.matches('input, textarea')) {
            e.preventDefault(); // Prevent page scroll on space
            const options = document.querySelectorAll('.toolbox-option');
            if (options[currentOptionIndex]) {
                const panelName = options[currentOptionIndex].dataset.panel;
                const action = options[currentOptionIndex].dataset.action;

                if (action === 'memories') {
                    window.open('http://localhost:5003/', '_blank');
                } else if (panelName) {
                    openPanel(panelName);
                }
            }
        }
    });

    // Escape to close panel
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closePanel();
        }
    });
}

// Poll for knob button presses
async function pollKnobStatus() {
    const indicator = document.getElementById('knobIndicator');
    if (!indicator) return;

    try {
        const response = await fetch(`${API_BASE}/knob/status`);
        const data = await response.json();

        if (data.has_event) {
            // Button was pressed!
            indicator.textContent = 'PRESSED!';
            indicator.style.color = '#0f0';
            indicator.style.textShadow = '0 0 10px #0f0';

            const statusDiv = document.getElementById('knobStatus');
            statusDiv.style.background = 'rgba(0, 255, 0, 0.2)';
            statusDiv.style.borderColor = 'rgba(0, 255, 0, 0.5)';

            console.log('🎛️ KNOB BUTTON PRESSED!', data.event);

            // Reset after 2 seconds
            setTimeout(() => {
                indicator.textContent = 'Waiting...';
                indicator.style.color = '#888';
                indicator.style.textShadow = 'none';
                statusDiv.style.background = 'rgba(0, 0, 0, 0.7)';
                statusDiv.style.borderColor = 'rgba(0, 255, 0, 0.3)';
            }, 2000);
        }
    } catch (error) {
        console.error('Error polling knob status:', error);
    }

    // Poll every 500ms
    setTimeout(pollKnobStatus, 500);
}

console.log('🏕️ Campground UI loaded successfully');
console.log('Keyboard shortcuts:');
console.log('  Ctrl/Cmd + K: Focus input');
console.log('  Enter/Space (when not typing): Open selected tool');
console.log('  Escape: Close panel');
console.log('  Scroll on toolbox: Navigate through options');
console.log('\n🎛️ Smart Knob: Press button to test!');
