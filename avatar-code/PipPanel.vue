<template>
  <div class="pip-window">
    <div class="pip-header" @mousedown="startDrag">
      <div class="pip-title">
        🤖 Flow Buddy
      </div>
      <button class="close-btn" @click="closeWindow">×</button>
    </div>
    
    <div class="pip-content">
      <!-- Avatar Status -->
      <div 
        :class="['avatar-status', avatarAvailable ? 'available' : 'unavailable']"
      >
        <span class="status-indicator">{{ avatarAvailable ? '✅' : '⚠️' }}</span>
        <span class="status-text">
          {{ avatarAvailable ? 'Avatar active on this page' : 'Avatar not available (system page)' }}
        </span>
      </div>
      
      <!-- Mode Selection -->
      <div class="mode-section">
        <div class="section-title">Mode</div>
        <div class="mode-buttons">
          <div 
            :class="['mode-btn', { active: !isLockInMode }]"
            @click="setMode(false)"
          >
            😎 Vibe
          </div>
          <div 
            :class="['mode-btn', { active: isLockInMode }]"
            @click="setMode(true)"
          >
            🔥 Lock In
          </div>
        </div>
      </div>
      
      <!-- Session Timer -->
      <div class="session-section">
        <div class="section-title">Session</div>
        <div class="timer-display">{{ formattedTime }}</div>
        <div class="session-controls">
          <button 
            v-if="!currentSession"
            class="session-btn start-btn" 
            @click="startSession"
          >
            Start
          </button>
          <button 
            v-else
            class="session-btn stop-btn" 
            @click="stopSession"
          >
            Stop
          </button>
        </div>
        <div class="session-status">{{ sessionStatusText }}</div>
      </div>
      
      <!-- Session Notes -->
      <div class="notes-section">
        <div class="section-title">Notes</div>
        <textarea 
          v-model="sessionNotes"
          class="session-notes" 
          placeholder="Add session notes..."
        ></textarea>
      </div>
      
      <!-- Export Options -->
      <div class="export-section">
        <button class="export-btn" @click="exportCSV">Export CSV</button>
        <button class="export-btn" @click="exportJSON">Export JSON</button>
      </div>
      
      <div class="keyboard-hint">
        Press Alt+Shift+U to toggle this panel
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

// Reactive state
const isLockInMode = ref(false)
const currentSession = ref<any>(null)
const sessionNotes = ref('')
const avatarAvailable = ref(false)
const elapsedTime = ref(0)

// Timer interval
let timerInterval: number | null = null

// Computed properties
const formattedTime = computed(() => {
  const seconds = Math.floor(elapsedTime.value / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  
  return `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
})

const sessionStatusText = computed(() => {
  if (currentSession.value) {
    return `Started at ${new Date(currentSession.value.startTime).toLocaleTimeString()}`
  }
  return 'Ready to start'
})

// Methods
const initializeState = async () => {
  try {
    const result = await chrome.storage.local.get(['isLockInMode', 'currentSession', 'sessions'])
    isLockInMode.value = result.isLockInMode || false
    currentSession.value = result.currentSession || null
    
    if (currentSession.value) {
      startTimer()
    }
  } catch (error) {
    console.log('Storage not available, using default state')
  }
}

const checkAvatarAvailability = async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    
    if (!tab || !tab.id || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('edge://') || tab.url.startsWith('about:')) {
      avatarAvailable.value = false
      return
    }
    
    await chrome.tabs.sendMessage(tab.id, { type: 'PING' })
    avatarAvailable.value = true
  } catch (error) {
    avatarAvailable.value = false
  }
}

const saveState = async () => {
  try {
    await chrome.storage.local.set({ 
      isLockInMode: isLockInMode.value, 
      currentSession: currentSession.value 
    })
  } catch (error) {
    console.log('Could not save to storage')
  }
}

const startTimer = () => {
  if (timerInterval) clearInterval(timerInterval)
  
  timerInterval = setInterval(() => {
    if (currentSession.value) {
      elapsedTime.value = Date.now() - currentSession.value.startTime
    }
  }, 1000) as unknown as number
}

const setMode = async (lockInMode: boolean) => {
  if (isLockInMode.value === lockInMode) return
  
  isLockInMode.value = lockInMode
  await saveState()
  await sendModeMessage()
}

const startSession = async () => {
  currentSession.value = {
    id: Date.now().toString(),
    startTime: Date.now(),
    mode: isLockInMode.value ? 'Lock In' : 'Vibe',
    notes: ''
  }
  
  await saveState()
  startTimer()
  sessionNotes.value = ''
}

const stopSession = async () => {
  if (!currentSession.value) return
  
  const completedSession = {
    ...currentSession.value,
    endTime: Date.now(),
    duration: Date.now() - currentSession.value.startTime,
    notes: sessionNotes.value || ''
  }
  
  const result = await chrome.storage.local.get(['sessions'])
  const sessions = result.sessions || []
  sessions.push(completedSession)
  
  await chrome.storage.local.set({ sessions })
  
  currentSession.value = null
  await saveState()
  
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  
  elapsedTime.value = 0
  sessionNotes.value = ''
}

const sendModeMessage = async () => {
  if (!avatarAvailable.value) {
    console.log('Avatar not available on this page')
    return
  }
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    
    await chrome.tabs.sendMessage(tab.id!, {
      type: 'TOGGLE_MODE',
      isLockInMode: isLockInMode.value
    })
    
    console.log(`Mode switched to: ${isLockInMode.value ? 'Lock In' : 'Vibe'}`)
  } catch (error) {
    console.log('Failed to send mode message:', error)
    avatarAvailable.value = false
  }
}

const exportCSV = async () => {
  const result = await chrome.storage.local.get(['sessions'])
  const sessions = result.sessions || []
  
  if (sessions.length === 0) {
    alert('No sessions to export')
    return
  }
  
  const headers = ['Start Time', 'End Time', 'Duration (minutes)', 'Mode', 'Notes']
  const rows = sessions.map((session: any) => [
    new Date(session.startTime).toLocaleString(),
    new Date(session.endTime).toLocaleString(),
    Math.round(session.duration / 60000),
    session.mode,
    `"${(session.notes || '').replace(/"/g, '""')}"`
  ])
  
  const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
  downloadFile(csvContent, 'flow-buddy-sessions.csv', 'text/csv')
}

const exportJSON = async () => {
  const result = await chrome.storage.local.get(['sessions'])
  const sessions = result.sessions || []
  
  if (sessions.length === 0) {
    alert('No sessions to export')
    return
  }
  
  const jsonContent = JSON.stringify(sessions, null, 2)
  downloadFile(jsonContent, 'flow-buddy-sessions.json', 'application/json')
}

const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const closeWindow = () => {
  window.close()
}

const startDrag = (e: MouseEvent) => {
  // Let the browser handle window dragging
}

// Keyboard shortcuts
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeWindow()
  }
  
  if (event.key === ' ' && !event.target?.matches?.('textarea, input')) {
    event.preventDefault()
    setMode(!isLockInMode.value)
  }
}

// Lifecycle
onMounted(async () => {
  await initializeState()
  await checkAvatarAvailability()
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.pip-window {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  height: 100vh;
  display: flex;
  flex-direction: column;
  user-select: none;
  overflow: hidden;
}

.pip-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  cursor: move;
}

.pip-title {
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.pip-content {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
}

.mode-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}

.mode-buttons {
  display: flex;
  gap: 12px;
}

.mode-btn {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  backdrop-filter: blur(5px);
}

.mode-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.mode-btn.active {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 4px 20px rgba(255, 255, 255, 0.2);
}

.session-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.timer-display {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(5px);
  margin-bottom: 8px;
}

.session-controls {
  display: flex;
  gap: 8px;
}

.session-btn {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.start-btn {
  background: #4CAF50;
  color: white;
}

.stop-btn {
  background: #f44336;
  color: white;
}

.session-btn:hover {
  transform: translateY(-1px);
  opacity: 0.9;
}

.session-status {
  font-size: 12px;
  text-align: center;
  opacity: 0.8;
  margin-top: 8px;
}

.notes-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.session-notes {
  width: 100%;
  min-height: 60px;
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-family: inherit;
  font-size: 13px;
  resize: vertical;
  backdrop-filter: blur(5px);
}

.session-notes::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.session-notes:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.6);
}

.export-section {
  display: flex;
  gap: 8px;
}

.export-btn {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
  backdrop-filter: blur(5px);
}

.export-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.avatar-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  font-size: 12px;
  backdrop-filter: blur(5px);
}

.avatar-status.available {
  border-left: 3px solid #4CAF50;
}

.avatar-status.unavailable {
  border-left: 3px solid #ff9800;
}

.keyboard-hint {
  font-size: 11px;
  text-align: center;
  opacity: 0.6;
  margin-top: 8px;
  font-style: italic;
}
</style>