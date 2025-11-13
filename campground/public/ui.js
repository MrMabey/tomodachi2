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
    checkModelMemory(); // Initial check
    setInterval(checkModelMemory, 3000); // Check model memory every 3 seconds
    loadChatThreads();
    initializeCurrentThread();
    pollKnobStatus(); // Check for knob button presses

    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        const toolbox = document.getElementById('toolbox');
        const canvas = document.querySelector('canvas'); // 3D canvas element

        // Check if click is on a side panel or toolbox or canvas
        const isOnPanel = e.target.closest('.side-panel');
        const isOnToolbox = toolbox && toolbox.contains(e.target);
        const isOnCanvas = canvas && canvas.contains(e.target);

        // Only close if clicking outside all panels, toolbox, and canvas
        if (!isOnPanel && !isOnToolbox && !isOnCanvas) {
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

        // Fetch memory metrics
        checkMemoryMetrics();
    } catch (error) {
        document.getElementById('apiStatus').textContent = 'Offline';
        document.getElementById('statusIndicator').className = 'indicator offline';
    }
}

// Memory Metrics Check
async function checkMemoryMetrics() {
    try {
        const metrics = await apiCall('/memory/metrics');
        const memCount = metrics.total_documents || 0;
        const memSize = metrics.total_size_mb ? `${metrics.total_size_mb} MB` : '0 MB';
        const memOldest = metrics.oldest_document || 'None';

        // Update Status panel (all metrics now in one place)
        document.getElementById('memoryCount').textContent = memCount;
        document.getElementById('memorySize').textContent = memSize;
        document.getElementById('memoryOldest').textContent = memOldest;
    } catch (error) {
        // Memory service might be offline
        const offline = 'N/A';
        document.getElementById('memoryCount').textContent = offline;
        document.getElementById('memorySize').textContent = offline;
        document.getElementById('memoryOldest').textContent = 'Service offline';
    }
}

// Model Memory Check
async function checkModelMemory() {
    try {
        const memory = await apiCall('/model/memory');
        const memUsage = memory.rss_human || 'N/A';

        // Update Status Panel
        document.getElementById('hudModelMemory').textContent = memUsage;
    } catch (error) {
        // Model memory unavailable
        document.getElementById('hudModelMemory').textContent = 'N/A';
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

            // Update stats with response text for token counting
            stats.totalLatency += response.total_latency;
            stats.messageCount++;
            updateStats(response.total_latency, response.response);

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

// Add Message to Sidebar (simplified for scrolling)
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

    // Auto-scroll to bottom to show new message
    sidebarConversation.scrollTop = sidebarConversation.scrollHeight;

    // Store message data
    const messageData = {
        element: bubbleDiv,
        timestamp: Date.now(),
        type: type
    };
    messages.push(messageData);

    return messageData;
}

// No longer needed with scrolling layout

// Remove a specific message
function removeMessage(messageData) {
    if (messageData && messageData.element && messageData.element.parentNode) {
        messageData.element.remove();
        messages = messages.filter(m => m !== messageData);
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
function updateStats(lastLatency = null, responseText = null) {
    if (lastLatency !== null) {
        // Update Status Panel - Latency
        const hudLatencyEl = document.getElementById('hudLatency');
        if (hudLatencyEl) {
            hudLatencyEl.textContent = `${lastLatency.toFixed(2)}s`;
        }

        // Calculate tokens (rough estimate: ~4 chars per token)
        let tokenCount = 0;
        let tokensPerSec = 0;

        if (responseText) {
            tokenCount = Math.ceil(responseText.length / 4);
            tokensPerSec = lastLatency > 0 ? (tokenCount / lastLatency).toFixed(1) : 0;

            // Update Status Panel - Tokens
            document.getElementById('hudTokens').textContent = tokenCount;
            document.getElementById('hudTokensPerSec').textContent = `${tokensPerSec} t/s`;
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

        // Deploy mechanical arm when panel opens
        if (window.campgroundScene) {
            window.campgroundScene.getMechanicalArm().deploy();
            console.log('🦾 Mechanical arm deployed with panel');
        }
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

    // Retract mechanical arm when panel closes
    if (window.campgroundScene) {
        window.campgroundScene.getMechanicalArm().retract();
        console.log('🦾 Mechanical arm retracted with panel');
    }

    currentPanel = null;
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

// ============================================================================
// CIRCULAR TOOLBOX MENU
// ============================================================================
// A rotary dial-style menu where options rotate around a circle and the
// option at a fixed selector position (135° = northwest) is highlighted.
//
// Key Learnings:
// - CSS screen coordinates have Y-axis pointing DOWN (not up like math)
// - Must use -Math.sin() to flip Y-axis for proper positioning
// - Centered coordinate system: .toolbox-options acts as (0,0) origin
// - Options positioned with translate(x, y) from center point
// ============================================================================

const toolbox = document.getElementById('toolbox');

if (toolbox) {
    // Configuration
    const SELECTOR_ANGLE = 135; // Fixed selector position (northwest/top-left diagonal)
    const RADIUS = 120; // Distance from center (pixels)
    const NUM_OPTIONS = 6; // Number of tool options
    const ANGLE_STEP = 360 / NUM_OPTIONS; // Degrees between each option (60°)
    const SCROLL_THRESHOLD = 15; // Pixels of scroll needed to trigger rotation
    const SCROLL_DEBOUNCE_TIME = 40; // ms cooldown after rotation (prevents flick scroll wildness)
    const SCROLL_RESET_TIME = 150; // ms before scroll accumulator resets
    const DEBUG_MODE = false; // Set to true to enable console logging

    // State
    let currentRotation = SELECTOR_ANGLE; // Start with first option at selector
    let toolboxExpanded = false;

    const toolboxButton = toolbox.querySelector('.toolbox-button');
    const toolboxOptions = toolbox.querySelector('.toolbox-options');
    const options = document.querySelectorAll('.toolbox-option');

    // Toggle toolbox expansion
    toolboxButton.addEventListener('click', (e) => {
        e.stopPropagation();
        toolboxExpanded = !toolboxExpanded;
        if (toolboxExpanded) {
            toolbox.classList.add('expanded');
            updateOptionPositions();
        } else {
            toolbox.classList.remove('expanded');
        }
    });

    // Calculate position for each option based on current rotation
    function updateOptionPositions() {
        options.forEach((option, index) => {
            // Calculate angle for this option (starting at 0 degrees = right)
            const baseAngle = index * ANGLE_STEP; // 0°, 60°, 120°, 180°, 240°, 300°
            const currentAngle = (baseAngle + currentRotation) % 360;

            // Convert to radians
            const radians = (currentAngle * Math.PI) / 180;

            // Calculate position from center point (0, 0)
            // IMPORTANT: CSS screen coordinates have Y-axis pointing DOWN
            // So we need to flip the Y-axis from standard math coordinates
            // Standard math: 0° = right, 90° = up, 180° = left, 270° = down
            // CSS screen: 0° = right, 90° = down, 180° = left, 270° = up
            // 315° should be top-left diagonal: x negative, y negative
            const x = Math.cos(radians) * RADIUS;
            const y = -Math.sin(radians) * RADIUS;  // Flip Y for screen coordinates

            // Apply transform
            option.style.transform = `translate(${x}px, ${y}px)`;
            option.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';

            // Debug mode: Add angle info to tooltip
            if (DEBUG_MODE) {
                option.title = `${currentAngle.toFixed(0)}° [${x.toFixed(0)}, ${y.toFixed(0)}]`;
            }

            // Check if this option is at the selector position (within tolerance)
            // Normalize angle difference to -180 to 180 range to handle wrapping
            let angleDiff = currentAngle - SELECTOR_ANGLE;
            while (angleDiff > 180) angleDiff -= 360;
            while (angleDiff < -180) angleDiff += 360;

            if (Math.abs(angleDiff) < ANGLE_STEP / 2) {
                // This option is selected
                option.classList.add('selected');
                currentOptionIndex = index;

                // Debug mode: Log selection changes
                if (DEBUG_MODE && option.dataset.wasSelected !== 'true') {
                    console.log(`✓ Option ${index} selected at ${currentAngle.toFixed(1)}° (target: ${SELECTOR_ANGLE}°, pos: [${x.toFixed(1)}, ${y.toFixed(1)}])`);
                    option.dataset.wasSelected = 'true';
                }
            } else {
                option.classList.remove('selected');
                if (DEBUG_MODE && option.dataset.wasSelected === 'true') {
                    option.dataset.wasSelected = 'false';
                }
            }
        });
    }

    // Click handlers for toolbox options
    options.forEach((option, index) => {
        option.addEventListener('click', () => {
            const panelName = option.dataset.panel;
            const action = option.dataset.action;

            if (action === 'memories') {
                window.open('http://localhost:5003/', '_blank');
            } else if (panelName) {
                openPanel(panelName);
            }
        });
    });

    // Scroll wheel rotation handler - works globally on campground view
    let debounceTimeout = null;
    let resetTimeout = null;
    let scrollAccumulator = 0;

    // Listen to wheel events on the entire window
    window.addEventListener('wheel', (e) => {
        // Don't interfere with scrolling inside panels or chat
        if (e.target.closest('.side-panel') || e.target.closest('input') || e.target.closest('textarea')) {
            return;
        }

        // Auto-expand toolbox on first scroll
        if (!toolboxExpanded) {
            toolboxExpanded = true;
            toolbox.classList.add('expanded');
            updateOptionPositions();
        }

        e.preventDefault();

        // Accumulate scroll delta to prevent jittery movement
        scrollAccumulator += e.deltaY;

        // Clear the reset timeout since user is actively scrolling
        clearTimeout(resetTimeout);

        // Trigger rotation when threshold is reached (if not in debounce cooldown)
        if (Math.abs(scrollAccumulator) >= SCROLL_THRESHOLD && !debounceTimeout) {
            const direction = scrollAccumulator > 0 ? 1 : -1;
            scrollAccumulator = 0;

            // Rotate by one step (60° for 6 options)
            currentRotation = (currentRotation - (direction * ANGLE_STEP) + 360) % 360;
            updateOptionPositions();

            // Debounce to prevent rapid successive rotations
            debounceTimeout = setTimeout(() => {
                debounceTimeout = null;
            }, SCROLL_DEBOUNCE_TIME);
        }

        // Reset accumulator if user stops scrolling for a while
        resetTimeout = setTimeout(() => {
            scrollAccumulator = 0;
        }, SCROLL_RESET_TIME);
    }, { passive: false });

    // Enter or Space key to activate selected option
    document.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !e.target.matches('input, textarea')) {
            if (!toolboxExpanded) return;

            e.preventDefault();
            const selectedOption = document.querySelector('.toolbox-option.selected');
            if (selectedOption) {
                const panelName = selectedOption.dataset.panel;
                const action = selectedOption.dataset.action;

                if (action === 'memories') {
                    window.open('http://localhost:5003/', '_blank');
                } else if (panelName) {
                    openPanel(panelName);
                }
            }
        }
    });

    // Escape to close toolbox
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (toolboxExpanded) {
                toolboxExpanded = false;
                toolbox.classList.remove('expanded');
            }
            closePanel();
        }
    });

    // Close toolbox when clicking outside
    document.addEventListener('click', (e) => {
        if (toolboxExpanded && !toolbox.contains(e.target)) {
            toolboxExpanded = false;
            toolbox.classList.remove('expanded');
        }
    });
}

// Poll for knob button presses
let knobPollingEnabled = true;
let knobPollingTimeout = null;

async function pollKnobStatus() {
    const statusIndicator = document.getElementById('knobIndicator');
    const buttonStatus = document.getElementById('knobButtonStatus');

    if (!statusIndicator && !buttonStatus) return;

    // Check if polling is enabled
    if (!knobPollingEnabled) {
        // Update status to show polling is disabled
        if (buttonStatus) {
            buttonStatus.textContent = 'Polling Disabled';
            buttonStatus.style.color = '#ff9800';
        }
        return; // Don't schedule next poll
    }

    try {
        const response = await fetch(`${API_BASE}/knob/status`);
        const data = await response.json();

        if (data.has_event) {
            // Button was pressed!
            // Update Status Panel indicator
            if (statusIndicator) {
                statusIndicator.textContent = 'PRESSED!';
                statusIndicator.style.color = '#4caf50';
                statusIndicator.style.fontWeight = 'bold';

                const statusDiv = document.getElementById('knobStatus');
                if (statusDiv) {
                    statusDiv.style.background = 'rgba(76, 175, 80, 0.1)';
                }

                setTimeout(() => {
                    statusIndicator.textContent = 'Waiting...';
                    statusIndicator.style.color = '#888';
                    statusIndicator.style.fontWeight = 'normal';
                    if (statusDiv) statusDiv.style.background = '';
                }, 2000);
            }

            // Update Smart Knob Panel button status
            if (buttonStatus) {
                buttonStatus.textContent = 'PRESSED!';
                buttonStatus.style.color = '#4caf50';
                buttonStatus.style.fontWeight = 'bold';

                setTimeout(() => {
                    if (knobPollingEnabled) {
                        buttonStatus.textContent = 'Waiting...';
                        buttonStatus.style.color = '#888';
                        buttonStatus.style.fontWeight = 'normal';
                    }
                }, 2000);
            }

            console.log('🎛️ KNOB BUTTON PRESSED!', data.event);
        }
    } catch (error) {
        console.error('Error polling knob status:', error);
    }

    // Poll every 500ms if still enabled
    if (knobPollingEnabled) {
        knobPollingTimeout = setTimeout(pollKnobStatus, 500);
    }
}

// ===== TODO CHECKLIST MANAGEMENT =====
let todos = [];

// Load todos from localStorage
function loadTodos() {
    const stored = localStorage.getItem('cabinTodos');
    if (stored) {
        todos = JSON.parse(stored);
        renderTodos();
    }
}

// Save todos to localStorage
function saveTodos() {
    localStorage.setItem('cabinTodos', JSON.stringify(todos));
}

// Add a new todo
function addTodo() {
    const input = document.getElementById('newTodoInput');
    const text = input.value.trim();

    if (text) {
        todos.push({
            id: Date.now(),
            text: text,
            completed: false
        });
        input.value = '';
        saveTodos();
        renderTodos();
    }
}

// Toggle todo completion
function toggleTodo(id, event) {
    if (event) {
        event.stopPropagation(); // Prevent closing the panel
    }
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
    }
}

// Delete a todo
function deleteTodo(id, event) {
    if (event) {
        event.stopPropagation(); // Prevent closing the panel
    }
    todos = todos.filter(t => t.id !== id);
    saveTodos();
    renderTodos();
}

// Render todos
function renderTodos() {
    const todoList = document.getElementById('todoList');
    if (!todoList) return;

    if (todos.length === 0) {
        todoList.innerHTML = `
            <div style="
                text-align: center;
                padding: 40px 20px;
                color: rgba(255,255,255,0.5);
                font-style: italic;
            ">
                No tasks yet. Add one above!
            </div>
        `;
        return;
    }

    todoList.innerHTML = todos.map(todo => `
        <div style="
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 15px;
            background: rgba(255,255,255,0.1);
            border-radius: 8px;
            border: 1px solid rgba(255,255,255,0.2);
            transition: all 0.2s;
        ">
            <input
                type="checkbox"
                ${todo.completed ? 'checked' : ''}
                onchange="toggleTodo(${todo.id}, event)"
                style="
                    width: 20px;
                    height: 20px;
                    cursor: pointer;
                    flex-shrink: 0;
                "
            />
            <span style="
                flex: 1;
                color: white;
                ${todo.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}
            ">
                ${todo.text}
            </span>
            <button
                onclick="deleteTodo(${todo.id}, event)"
                style="
                    background: rgba(244, 67, 54, 0.8);
                    border: none;
                    color: white;
                    width: 30px;
                    height: 30px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    transition: background 0.2s;
                "
                onmouseover="this.style.background='rgba(244, 67, 54, 1)'"
                onmouseout="this.style.background='rgba(244, 67, 54, 0.8)'"
            >
                ×
            </button>
        </div>
    `).join('');
}

// Allow Enter key to add todo
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('newTodoInput');
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addTodo();
            }
        });
    }
    loadTodos();
});

// Tab key focuses checklist input when panel is open
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        const checklistPanel = document.getElementById('checklistPanel');
        const input = document.getElementById('newTodoInput');

        // If checklist panel is open, focus the input
        if (checklistPanel && checklistPanel.classList.contains('active') && input) {
            e.preventDefault(); // Prevent default tab behavior
            input.focus();
        }
    }
});
// Toggle knob polling
function toggleKnobPolling() {
    const toggle = document.getElementById('knobPollingToggle');
    const buttonStatus = document.getElementById('knobButtonStatus');

    knobPollingEnabled = toggle.checked;

    if (knobPollingEnabled) {
        // Re-enable polling
        if (buttonStatus) {
            buttonStatus.textContent = 'Waiting...';
            buttonStatus.style.color = '#888';
        }
        console.log('🎛️ Knob polling enabled');
        pollKnobStatus(); // Restart polling
    } else {
        // Disable polling
        if (knobPollingTimeout) {
            clearTimeout(knobPollingTimeout);
            knobPollingTimeout = null;
        }
        if (buttonStatus) {
            buttonStatus.textContent = 'Polling Disabled';
            buttonStatus.style.color = '#ff9800';
        }
        console.log('🎛️ Knob polling disabled');
    }
}

// Voice Input
let recognition = null;
let isRecording = false;

function initializeVoiceRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const input = document.getElementById('userInput');
            input.value = transcript;
            input.focus();
            stopRecording();
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            stopRecording();
            addSidebarMessage('system', `Voice input error: ${event.error}`);
        };

        recognition.onend = () => {
            stopRecording();
        };
    } else {
        console.warn('Speech recognition not supported in this browser');
    }
}

function toggleVoiceInput() {
    if (!recognition) {
        addSidebarMessage('system', 'Voice input not supported in this browser');
        return;
    }

    if (isRecording) {
        recognition.stop();
    } else {
        startRecording();
    }
}

function startRecording() {
    isRecording = true;
    const micButton = document.getElementById('micButton');
    micButton.classList.add('recording');
    micButton.textContent = '⏹️';

    try {
        recognition.start();
        addSidebarMessage('system', 'Listening...');
    } catch (error) {
        console.error('Error starting recognition:', error);
        stopRecording();
    }
}

function stopRecording() {
    isRecording = false;
    const micButton = document.getElementById('micButton');
    micButton.classList.remove('recording');
    micButton.textContent = '🎤';
}

// Initialize voice recognition on load
initializeVoiceRecognition();

// ============================================================================
// WEBHOOK FUNCTIONALITY
// ============================================================================

let webhooks = [];
let selectedWebhook = null;

// Load webhooks when panel opens
async function loadWebhooks() {
    try {
        const response = await apiCall('/webhooks', 'GET');
        webhooks = response.webhooks || [];
        renderWebhookList();
    } catch (error) {
        console.error('Error loading webhooks:', error);
    }
}

// Render webhook list
function renderWebhookList() {
    const webhookList = document.getElementById('webhookList');
    if (!webhookList) return;

    if (webhooks.length === 0) {
        webhookList.innerHTML = `
            <div style="
                color: rgba(255,255,255,0.5);
                text-align: center;
                padding: 30px;
                font-style: italic;
            ">
                No webhooks saved yet. Add one above!
            </div>
        `;
        return;
    }

    webhookList.innerHTML = webhooks.map(webhook => `
        <div style="
            background: rgba(255,255,255,0.08);
            padding: 15px;
            border-radius: 10px;
            border: 1px solid rgba(255,255,255,0.1);
            transition: all 0.3s ease;
        "
        onmouseover="this.style.background='rgba(255,255,255,0.15)'; this.style.borderColor='rgba(139, 92, 246, 0.5)'"
        onmouseout="this.style.background='rgba(255,255,255,0.08)'; this.style.borderColor='rgba(255,255,255,0.1)'"
        >
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                <div>
                    <div style="color: white; font-weight: bold; font-size: 16px; margin-bottom: 4px;">
                        ${webhook.name}
                    </div>
                    <div style="color: rgba(255,255,255,0.6); font-size: 12px; margin-bottom: 4px;">
                        <span style="
                            background: rgba(139, 92, 246, 0.3);
                            padding: 2px 8px;
                            border-radius: 4px;
                            font-weight: bold;
                        ">${webhook.method}</span>
                    </div>
                    <div style="
                        color: rgba(255,255,255,0.5);
                        font-size: 11px;
                        word-break: break-all;
                        margin-top: 4px;
                    ">
                        ${webhook.url}
                    </div>
                </div>
                <button
                    onclick="deleteWebhook('${webhook.id}')"
                    style="
                        background: rgba(255, 0, 0, 0.2);
                        border: 1px solid rgba(255, 0, 0, 0.3);
                        color: #ff6b6b;
                        padding: 6px 10px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                        transition: all 0.2s ease;
                    "
                    onmouseover="this.style.background='rgba(255, 0, 0, 0.4)'"
                    onmouseout="this.style.background='rgba(255, 0, 0, 0.2)'"
                >
                    🗑️
                </button>
            </div>
            <button
                onclick="selectWebhook('${webhook.id}')"
                class="btn btn-primary"
                style="width: 100%; padding: 8px; margin-top: 8px; font-size: 13px;"
            >
                🚀 Fire This Webhook
            </button>
        </div>
    `).join('');
}

// Add webhook
async function addWebhook() {
    const nameInput = document.getElementById('webhookNameInput');
    const urlInput = document.getElementById('webhookUrlInput');
    const methodInput = document.getElementById('webhookMethodInput');

    const name = nameInput.value.trim();
    const url = urlInput.value.trim();
    const method = methodInput.value;

    if (!name) {
        alert('Please enter a webhook name');
        return;
    }

    if (!url) {
        alert('Please enter a webhook URL');
        return;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        alert('URL must start with http:// or https://');
        return;
    }

    try {
        const response = await apiCall('/webhooks', 'POST', {
            name,
            url,
            method
        });

        // Clear inputs
        nameInput.value = '';
        urlInput.value = '';
        methodInput.value = 'POST';

        // Reload list
        await loadWebhooks();

        console.log('Webhook added:', response.webhook);
    } catch (error) {
        console.error('Error adding webhook:', error);
        alert('Failed to add webhook: ' + error.message);
    }
}

// Delete webhook
async function deleteWebhook(webhookId) {
    if (!confirm('Are you sure you want to delete this webhook?')) {
        return;
    }

    try {
        await apiCall(`/webhooks/${webhookId}`, 'DELETE');
        await loadWebhooks();
        console.log('Webhook deleted:', webhookId);
    } catch (error) {
        console.error('Error deleting webhook:', error);
        alert('Failed to delete webhook: ' + error.message);
    }
}

// Select webhook for firing
function selectWebhook(webhookId) {
    selectedWebhook = webhooks.find(wh => wh.id === webhookId);
    if (!selectedWebhook) return;

    // Hide webhook list, show fire section
    document.querySelector('#webhookList').parentElement.style.display = 'none';
    document.querySelector('#webhookNameInput').parentElement.parentElement.style.display = 'none';
    document.getElementById('fireWebhookSection').style.display = 'block';

    // Populate fire section
    document.getElementById('selectedWebhookName').textContent = selectedWebhook.name;
    document.getElementById('selectedWebhookMethod').textContent = selectedWebhook.method;
    document.getElementById('selectedWebhookUrl').textContent = selectedWebhook.url;

    // Reset response
    document.getElementById('webhookResponse').style.display = 'none';
}

// Deselect webhook
function deselectWebhook() {
    selectedWebhook = null;

    // Show webhook list, hide fire section
    document.querySelector('#webhookList').parentElement.style.display = 'block';
    document.querySelector('#webhookNameInput').parentElement.parentElement.style.display = 'block';
    document.getElementById('fireWebhookSection').style.display = 'none';
}

// Fire webhook
async function fireWebhook() {
    if (!selectedWebhook) return;

    const payloadInput = document.getElementById('webhookPayloadInput');
    const responseDiv = document.getElementById('webhookResponse');
    const responseContent = document.getElementById('webhookResponseContent');

    // Parse payload
    let payload;
    try {
        payload = JSON.parse(payloadInput.value);
    } catch (error) {
        alert('Invalid JSON payload: ' + error.message);
        return;
    }

    // Show loading
    responseDiv.style.display = 'block';
    responseContent.textContent = 'Firing webhook...';

    try {
        const result = await apiCall('/webhooks/fire', 'POST', {
            webhook_id: selectedWebhook.id,
            payload: payload
        });

        // Display response
        responseContent.textContent = JSON.stringify(result, null, 2);

        // Update response styling based on success
        if (result.success) {
            responseDiv.style.background = 'rgba(0, 255, 0, 0.1)';
            responseDiv.style.border = '1px solid rgba(0, 255, 0, 0.3)';
        } else {
            responseDiv.style.background = 'rgba(255, 0, 0, 0.1)';
            responseDiv.style.border = '1px solid rgba(255, 0, 0, 0.3)';
        }

        console.log('Webhook fired:', result);
    } catch (error) {
        console.error('Error firing webhook:', error);
        responseContent.textContent = 'Error: ' + error.message;
        responseDiv.style.background = 'rgba(255, 0, 0, 0.1)';
        responseDiv.style.border = '1px solid rgba(255, 0, 0, 0.3)';
    }
}

// Load webhooks when webhook panel is opened
const originalOpenPanel = window.openPanel;
window.openPanel = function(panelName) {
    if (originalOpenPanel) {
        originalOpenPanel(panelName);
    }

    if (panelName === 'webhook') {
        loadWebhooks();
    }
};

console.log('🏕️ Campground UI loaded successfully');
console.log('Keyboard shortcuts:');
console.log('  Ctrl/Cmd + K: Focus input');
console.log('  Enter/Space (when not typing): Open selected tool');
console.log('  Escape: Close panel');
console.log('  Scroll on toolbox: Navigate through options');
console.log('\n🎛️ Smart Knob: Press button to test!');
console.log('🎤 Voice Input: Click mic button to dictate');
