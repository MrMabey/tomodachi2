// Tomo GUI JavaScript
const API_BASE = 'http://localhost:5000/api';

// State
let conversationHistory = [];
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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkStatus();
    setInterval(checkStatus, 5000); // Check status every 5 seconds
    loadHistory();
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

    const sendBtn = document.getElementById('sendBtn');
    const originalText = sendBtn.textContent;

    // Disable input and show loading
    input.disabled = true;
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<span class="spinner"></span>';

    // Add user message to chat
    addMessage('user', message);
    input.value = '';

    try {
        // Set mood to THINKING while processing
        updateMoodDisplay('THINKING');

        const response = await apiCall('/inference', 'POST', { input: message });

        // Add response to chat
        if (response.route === 'chat') {
            addMessage('assistant', response.response, response);
            stats.chatCount++;
        } else {
            addMessage('command', `Command: ${response.intent}`, response);
            stats.commandCount++;
        }

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

    } catch (error) {
        addMessage('error', `Error: ${error.message}`);
        updateMoodDisplay('ERROR');
    } finally {
        // Re-enable input
        input.disabled = false;
        sendBtn.disabled = false;
        sendBtn.textContent = originalText;
        input.focus();
    }
}

// Add Message to Chat
function addMessage(type, content, metadata = null) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;

    const now = new Date().toLocaleTimeString();

    let headerText = type.charAt(0).toUpperCase() + type.slice(1);
    if (type === 'assistant') headerText = 'Tomo';
    if (type === 'system') headerText = '⚙️ System';

    let metaHTML = '';
    if (metadata) {
        const parts = [];

        if (metadata.route) {
            parts.push(`Route: ${metadata.route}`);
        }

        if (metadata.mood) {
            parts.push(`Mood: ${metadata.mood}`);
        }

        if (metadata.intent) {
            parts.push(`Intent: ${metadata.intent}`);
        }

        if (metadata.total_latency) {
            parts.push(`Latency: ${metadata.total_latency.toFixed(2)}s`);
        }

        if (metadata.orchestrator_decision) {
            parts.push(`Decision: ${JSON.stringify(metadata.orchestrator_decision)}`);
        }

        if (parts.length > 0) {
            metaHTML = `<div class="message-meta">${parts.join(' | ')}</div>`;
        }
    }

    messageDiv.innerHTML = `
        <div class="message-header">
            <span>${headerText}</span>
            <span class="message-time">${now}</span>
        </div>
        <div class="message-content">${escapeHtml(content)}</div>
        ${metaHTML}
    `;

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Clear History
async function clearHistory() {
    if (!confirm('Clear all conversation history?')) return;

    try {
        await apiCall('/history', 'DELETE');
        document.getElementById('chatMessages').innerHTML = '';
        conversationHistory = [];
        stats = {
            totalLatency: 0,
            messageCount: 0,
            chatCount: 0,
            commandCount: 0
        };
        updateStats();
        addMessage('system', 'History cleared');
    } catch (error) {
        alert('Failed to clear history: ' + error.message);
    }
}

// Load History
async function loadHistory() {
    try {
        const data = await apiCall('/history');
        conversationHistory = data.history || [];

        // Display history
        conversationHistory.forEach(item => {
            if (item.route === 'chat') {
                addMessage('assistant', item.response, item);
            } else {
                addMessage('command', `Command: ${item.intent}`, item);
            }
        });
    } catch (error) {
        console.error('Failed to load history:', error);
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
        addMessage('system', 'Parameters updated successfully');
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

        addMessage('system', `Mood set to ${mood} - ${response.description || ''}`);
    } catch (error) {
        alert('Failed to set mood: ' + error.message);
    }
}

// Toggle Mood Mode
async function toggleMoodMode(active) {
    try {
        const response = await apiCall('/mood/toggle', 'POST', { active });
        addMessage('system', response.message);

        if (!active) {
            // If mood mode disabled, reset to base parameters
            addMessage('system', 'Manual parameter control enabled. Adjust sliders to customize.');
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
    display.textContent = mood;
    display.className = `current-mood-display mood-${mood}`;

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
        document.getElementById('lastLatency').textContent = lastLatency.toFixed(2);
    }

    if (stats.messageCount > 0) {
        const avgLatency = stats.totalLatency / stats.messageCount;
        document.getElementById('avgLatency').textContent = avgLatency.toFixed(2);
    }

    document.getElementById('chatCount').textContent = stats.chatCount;
    document.getElementById('commandCount').textContent = stats.commandCount;
}

// Unload Model
async function unloadModel() {
    if (!confirm('Unload the current model? This will free up memory.')) return;

    try {
        await apiCall('/model/unload', 'POST');
        addMessage('system', 'Model unloaded successfully');
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

    // Ctrl/Cmd + L to clear history
    if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        clearHistory();
    }
});

console.log('🤖 Tomo GUI loaded successfully');
console.log('Keyboard shortcuts:');
console.log('  Ctrl/Cmd + K: Focus input');
console.log('  Ctrl/Cmd + L: Clear history');
console.log('  Enter: Send message');
