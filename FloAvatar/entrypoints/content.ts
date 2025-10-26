export default defineContentScript({
  matches: ['*://*/*'],
  
  async main() {
    console.log('FloAvatar glassmorphism floating window loading...')
    
    // Add visual confirmation that content script is running
    setTimeout(() => {
      console.log('FloAvatar content script fully loaded!')
    }, 1000)
    
    // Initialize floating window
    createFloatingGlassWindow()
    
    // Activity tracking for token generation
    let activityScore = 0
    let lastActivity = Date.now()
    
    // Event listeners for activity tracking
    document.addEventListener('click', trackActivity)
    document.addEventListener('scroll', trackActivity)
    document.addEventListener('keydown', trackActivity)
    
    function trackActivity() {
      activityScore++
      lastActivity = Date.now()
      
      // Award tokens based on activity
      if (activityScore % 50 === 0) { // Every 50 actions
        awardTokens(2, 'Activity bonus! 🎯')
      }
    }
    
    // Time-based token generation
    setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivity
      
      // Award tokens for active browsing (every 5 minutes of activity)
      if (timeSinceLastActivity < 60000) { // Active within last minute
        awardTokens(1, 'Time bonus! ⏰')
      }
    }, 5 * 60 * 1000) // Every 5 minutes
    
    // Page visit tracking
    awardTokens(3, 'Page visit! 🌐')
    
    // Award tokens function
    async function awardTokens(amount: number, reason: string) {
      try {
        const result = await chrome.storage.local.get(['floavatar-gamestate'])
        const currentState = result['floavatar-gamestate'] || { tokens: 0 }
        
        currentState.tokens += amount
        await chrome.storage.local.set({ 'floavatar-gamestate': currentState })
        
        // Update floating window display
        updateFloatingTokens(currentState.tokens)
        
        // Show notification
        showTokenNotification(amount, reason)
        
      } catch (error) {
        console.error('Error awarding tokens:', error)
      }
    }
    
    function createFloatingGlassWindow() {
      // Remove existing window
      const existing = document.getElementById('floavatar-glass-window')
      if (existing) existing.remove()
      
      // Create main floating window container
      const floatingWindow = document.createElement('div')
      floatingWindow.id = 'floavatar-glass-window'
      floatingWindow.innerHTML = `
        <div class="glass-floating-window">
          <!-- PiP Header Bar -->
          <div class="pip-header" id="window-titlebar">
            <div class="pip-controls">
              <div class="pip-dot minimize-btn" id="minimize-window"></div>
              <div class="pip-dot close-btn" id="close-window"></div>
            </div>
            <div class="pip-brand">FloAvatar</div>
            <div class="pip-token-badge" id="pip-tokens">
              <span class="pip-coin">🪙</span>
              <span id="floating-tokens">0</span>
            </div>
          </div>
          
          <!-- PiP Main Content Area -->
          <div class="pip-main-content" id="window-content">
            <!-- Left: Pet Avatar -->
            <div class="pip-pet-zone">
              <div class="pip-avatar-frame">
                <canvas id="main-pet-avatar" width="120" height="120"></canvas>
                <div class="pip-avatar-glow"></div>
              </div>
              <div class="pip-pet-name" id="pet-name">Your Pet</div>
            </div>
            
            <!-- Right: Stats & Controls -->
            <div class="pip-control-zone">
              <!-- Status Bars -->
              <div class="pip-stats">
                <div class="pip-stat">
                  <div class="pip-stat-icon">❤️</div>
                  <div class="pip-stat-bar">
                    <div class="pip-stat-fill happiness" id="mini-happiness" style="width: 100%"></div>
                  </div>
                </div>
                <div class="pip-stat">
                  <div class="pip-stat-icon">⚡</div>
                  <div class="pip-stat-bar">
                    <div class="pip-stat-fill energy" id="mini-energy" style="width: 100%"></div>
                  </div>
                </div>
              </div>
              
              <!-- Action Buttons -->
              <div class="pip-actions">
                <button class="pip-action-btn feed" id="quick-feed" title="Feed (5🪙)">
                  <span>🍖</span>
                </button>
                <button class="pip-action-btn play" id="quick-play" title="Play (3🪙)">
                  <span>🎾</span>
                </button>
                <button class="pip-action-btn expand" id="quick-expand" title="Expand">
                  <span>⚡</span>
                </button>
              </div>
              
              <!-- Progress Indicator -->
              <div class="pip-progress">
                <div class="pip-progress-bar">
                  <div class="pip-progress-fill" id="daily-progress" style="width: 35%"></div>
                </div>
                <div class="pip-progress-text">Daily: 7/20</div>
              </div>
            </div>
          </div>
        </div>
      `
      
      // Inject floating window styles
      const styles = document.createElement('style')
      styles.textContent = `
        #floavatar-glass-window {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 320px;
          height: 180px;
          z-index: 999999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          pointer-events: none;
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          transform: scale(1) rotate(0deg);
          filter: drop-shadow(0 15px 35px rgba(0, 0, 0, 0.8));
          animation: pipFloat 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          border-radius: 16px;
          overflow: hidden;
        }
        
        @keyframes pipFloat {
          0% {
            transform: scale(0.3) translateX(200px) translateY(100px) rotate(10deg);
            opacity: 0;
          }
          60% {
            transform: scale(1.05) translateX(-10px) translateY(-10px) rotate(-2deg);
            opacity: 0.8;
          }
          100% {
            transform: scale(1) translateX(0) translateY(0) rotate(0deg);
            opacity: 1;
          }
        }
        
        .glass-floating-window {
          background: linear-gradient(135deg, 
            rgba(0, 0, 0, 0.9) 0%, 
            rgba(20, 20, 30, 0.95) 50%, 
            rgba(10, 10, 20, 0.9) 100%);
          backdrop-filter: blur(30px) brightness(1.1) contrast(1.1);
          -webkit-backdrop-filter: blur(30px) brightness(1.1) contrast(1.1);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          overflow: hidden;
          pointer-events: auto;
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          box-shadow: 
            0 0 0 1px rgba(255, 255, 255, 0.05),
            0 20px 60px rgba(0, 0, 0, 0.6),
            inset 0 1px 0 rgba(255, 255, 255, 0.15),
            inset 0 -1px 0 rgba(0, 0, 0, 0.5);
          width: 100%;
          height: 100%;
        }
        
        .glass-floating-window:hover {
          transform: scale(1.02);
          filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.9));
        }
        
        /* PiP Header */
        .pip-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 16px;
          background: rgba(0, 0, 0, 0.8);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          cursor: grab;
          user-select: none;
          height: 32px;
        }
        
        .pip-header:active {
          cursor: grabbing;
        }
        
        .pip-controls {
          display: flex;
          gap: 8px;
        }
        
        .pip-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .pip-dot.minimize-btn {
          background: linear-gradient(135deg, #FFD23F, #FF8F00);
        }
        
        .pip-dot.close-btn {
          background: linear-gradient(135deg, #FF6B6B, #FF3838);
        }
        
        .pip-dot:hover {
          transform: scale(1.2);
          box-shadow: 0 0 10px currentColor;
        }
        
        .pip-brand {
          color: white;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
        }
        
        .pip-token-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.2));
          border: 1px solid rgba(255, 215, 0, 0.4);
          border-radius: 12px;
          padding: 3px 8px;
          font-size: 10px;
          font-weight: 700;
        }
        
        .pip-coin {
          font-size: 8px;
        }
        
        #floating-tokens {
          color: #FFD700;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
        }
        
        /* PiP Main Content */
        .pip-main-content {
          display: flex;
          height: 148px;
          padding: 12px;
          gap: 16px;
        }
        
        /* Pet Zone (Left Side) */
        .pip-pet-zone {
          flex: 0 0 120px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .pip-avatar-frame {
          position: relative;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
          border: 2px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        
        .pip-avatar-glow {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: conic-gradient(from 0deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7, #DDA0DD, #FF6B6B);
          opacity: 0.3;
          animation: spin 8s linear infinite;
          z-index: -1;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        #main-pet-avatar {
          width: 96px;
          height: 96px;
          border-radius: 50%;
        }
        
        .pip-pet-name {
          color: white;
          font-size: 10px;
          font-weight: 600;
          text-align: center;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
          opacity: 0.9;
        }
        
        /* Control Zone (Right Side) */
        .pip-control-zone {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 4px 0;
        }
        
        /* Stats */
        .pip-stats {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .pip-stat {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .pip-stat-icon {
          font-size: 12px;
          width: 16px;
          text-align: center;
        }
        
        .pip-stat-bar {
          flex: 1;
          height: 6px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 3px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .pip-stat-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.6s cubic-bezier(0.4, 0, 0.6, 1);
        }
        
        .pip-stat-fill.happiness {
          background: linear-gradient(90deg, #FF6B6B, #FF8E8E);
        }
        
        .pip-stat-fill.energy {
          background: linear-gradient(90deg, #4ECDC4, #7EDCE2);
        }
        
        /* Actions */
        .pip-actions {
          display: flex;
          gap: 8px;
          justify-content: center;
        }
        
        .pip-action-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 16px;
        }
        
        .pip-action-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.4);
          transform: scale(1.1);
        }
        
        .pip-action-btn.feed:hover {
          background: rgba(255, 107, 107, 0.3);
          border-color: rgba(255, 107, 107, 0.6);
        }
        
        .pip-action-btn.play:hover {
          background: rgba(78, 205, 196, 0.3);
          border-color: rgba(78, 205, 196, 0.6);
        }
        
        .pip-action-btn.expand:hover {
          background: rgba(102, 126, 234, 0.3);
          border-color: rgba(102, 126, 234, 0.6);
        }
        
        /* Progress */
        .pip-progress {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .pip-progress-bar {
          height: 4px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 2px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .pip-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea, #764ba2);
          border-radius: 2px;
          transition: width 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .pip-progress-text {
          color: rgba(255, 255, 255, 0.7);
          font-size: 8px;
          text-align: center;
          font-weight: 500;
        }
        
        /* Minimized state */
        .glass-floating-window.minimized .pip-main-content {
          display: none;
        }
        
        .glass-floating-window.minimized {
          height: 32px;
        }
        
        /* Hover animations */
        @keyframes tokenPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .token-pulse {
          animation: tokenPulse 0.4s ease-in-out;
        }
        
        /* Mobile responsiveness */
        @media (max-width: 768px) {
          #floavatar-glass-window {
            width: 200px;
            right: 15px;
            top: 60px;
          }
          
          .glass-window-content {
            padding: 8px;
          }
          
          .pet-avatar-container {
            width: 40px;
            height: 40px;
          }
          
          #main-pet-avatar {
            width: 40px;
            height: 40px;
          }
        }
      `
      document.head.appendChild(styles)
      document.body.appendChild(floatingWindow)
      
      // Initialize floating window functionality
      initializeFloatingWindowFunctionality()
    }
    
    function initializeFloatingWindowFunctionality() {
      const floatingWindow = document.getElementById('floavatar-glass-window')
      const titlebar = document.getElementById('window-titlebar')
      const minimizeBtn = document.getElementById('minimize-window')
      const closeBtn = document.getElementById('close-window')
      const quickFeed = document.getElementById('quick-feed')
      const quickPlay = document.getElementById('quick-play')
      const quickExpand = document.getElementById('quick-expand')
      
      if (!floatingWindow || !titlebar) return
      
      // Dragging functionality
      let isDragging = false
      let dragOffset = { x: 0, y: 0 }
      
      titlebar.addEventListener('mousedown', (e) => {
        // Don't start drag if clicking on control buttons
        if ((e.target as HTMLElement).classList.contains('control-btn')) return
        
        isDragging = true
        const rect = floatingWindow.getBoundingClientRect()
        dragOffset.x = e.clientX - rect.left
        dragOffset.y = e.clientY - rect.top
        titlebar.style.cursor = 'grabbing'
      })
      
      document.addEventListener('mousemove', (e) => {
        if (!isDragging) return
        
        const x = e.clientX - dragOffset.x
        const y = e.clientY - dragOffset.y
        
        // Keep within viewport bounds with padding
        const padding = 20
        const maxX = window.innerWidth - floatingWindow.offsetWidth - padding
        const maxY = window.innerHeight - floatingWindow.offsetHeight - padding
        
        floatingWindow.style.left = Math.max(padding, Math.min(maxX, x)) + 'px'
        floatingWindow.style.top = Math.max(padding, Math.min(maxY, y)) + 'px'
        floatingWindow.style.right = 'auto'
      })
      
      document.addEventListener('mouseup', () => {
        isDragging = false
        titlebar.style.cursor = 'grab'
      })
      
      // Window controls
      minimizeBtn?.addEventListener('click', () => {
        floatingWindow.classList.toggle('minimized')
      })
      
      closeBtn?.addEventListener('click', () => {
        floatingWindow.style.animation = 'pipFloat 0.4s reverse'
        setTimeout(() => floatingWindow.remove(), 400)
      })
      
      // Quick actions
      quickFeed?.addEventListener('click', async () => {
        const gameState = await getGameState()
        if (gameState && gameState.tokens >= 5) {
          gameState.tokens -= 5
          gameState.happiness = Math.min(100, (gameState.happiness || 100) + 20)
          gameState.energy = Math.min(100, (gameState.energy || 100) + 10)
          await chrome.storage.local.set({ 'floavatar-gamestate': gameState })
          updateFloatingStats(gameState)
          showTokenNotification(-5, 'Fed your pet! 🍖')
        }
      })
      
      quickPlay?.addEventListener('click', async () => {
        const gameState = await getGameState()
        if (gameState && gameState.tokens >= 3) {
          gameState.tokens -= 3
          gameState.happiness = Math.min(100, (gameState.happiness || 100) + 15)
          gameState.energy = Math.max(0, (gameState.energy || 100) - 10)
          await chrome.storage.local.set({ 'floavatar-gamestate': gameState })
          updateFloatingStats(gameState)
          showTokenNotification(-3, 'Played with your pet! 🎾')
        }
      })
      
      quickExpand?.addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'openFullInterface' })
      })
      
      // Initialize with current game state
      loadFloatingWindowData()
    }
    
    async function loadFloatingWindowData() {
      const gameState = await getGameState()
      if (gameState) {
        updateFloatingTokens(gameState.tokens || 0)
        updateFloatingStats(gameState)
        renderFloatingAvatars(gameState)
      } else {
        // Show default state even without game data
        updateFloatingTokens(0)
        const defaultState = { happiness: 100, energy: 100, selectedEgg: 'cat' }
        updateFloatingStats(defaultState)
        renderFloatingAvatars({ isHatched: true, selectedEgg: 'cat' })
      }
    }
    
    function updateFloatingTokens(tokens: number) {
      const tokenElement = document.getElementById('floating-tokens')
      if (tokenElement) {
        tokenElement.textContent = tokens.toString()
        const counter = tokenElement.closest('.token-counter')
        counter?.classList.add('token-pulse')
        setTimeout(() => counter?.classList.remove('token-pulse'), 400)
      }
    }
    
    function updateFloatingStats(gameState: any) {
      const happinessBar = document.getElementById('mini-happiness')
      const energyBar = document.getElementById('mini-energy')
      const petName = document.getElementById('pet-name')
      
      if (happinessBar) happinessBar.style.width = `${gameState.happiness || 100}%`
      if (energyBar) energyBar.style.width = `${gameState.energy || 100}%`
      if (petName && gameState.selectedEgg) {
        const names = {
          cat: 'Whiskers',
          dragon: 'Flame',
          robot: 'Cyber',
          ghost: 'Spirit',
          alien: 'Cosmic',
          panda: 'Bamboo'
        }
        petName.textContent = names[gameState.selectedEgg as keyof typeof names] || 'Your Pet'
      }
    }
    
    function renderFloatingAvatars(gameState: any) {
      // Render tiny avatar in titlebar
      const titleAvatar = document.getElementById('floating-avatar') as HTMLCanvasElement
      if (titleAvatar && gameState.isHatched) {
        renderTinyAvatar(titleAvatar, gameState.selectedEgg)
      }
      
      // Render main pet avatar
      const mainAvatar = document.getElementById('main-pet-avatar') as HTMLCanvasElement
      if (mainAvatar && gameState.isHatched) {
        renderMainAvatar(mainAvatar, gameState.selectedEgg)
      }
    }
    
    function renderTinyAvatar(canvas: HTMLCanvasElement, avatarType: string) {
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      
      const animate = () => {
        const time = Date.now() * 0.002
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.save()
        ctx.translate(centerX, centerY)
        ctx.scale(0.15, 0.15) // Very tiny for titlebar
        
        drawSimpleAvatar(ctx, avatarType, time)
        
        ctx.restore()
        requestAnimationFrame(animate)
      }
      
      animate()
    }
    
    function renderMainAvatar(canvas: HTMLCanvasElement, avatarType: string) {
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      
      const animate = () => {
        const time = Date.now() * 0.003
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.save()
        ctx.translate(centerX, centerY)
        
        const breathe = 1 + Math.sin(time) * 0.05
        ctx.scale(breathe * 0.4, breathe * 0.4) // Medium size for main display
        
        drawSimpleAvatar(ctx, avatarType, time)
        
        ctx.restore()
        requestAnimationFrame(animate)
      }
      
      animate()
    }
    
    function drawSimpleAvatar(ctx: CanvasRenderingContext2D, avatarType: string, time: number) {
      if (avatarType === 'cat') {
        const blink = Math.sin(time * 0.3) > 0.9
        ctx.fillStyle = '#FFB6C1'
        ctx.beginPath()
        ctx.ellipse(0, 0, 25, 20, 0, 0, Math.PI * 2)
        ctx.fill()
        
        // Ears
        ctx.beginPath()
        ctx.ellipse(-12, -15, 6, 8, -0.3, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.ellipse(12, -15, 6, 8, 0.3, 0, Math.PI * 2)
        ctx.fill()
        
        // Eyes
        ctx.fillStyle = blink ? '#FFB6C1' : '#4169E1'
        ctx.beginPath()
        ctx.ellipse(-6, -5, 3, blink ? 1 : 4, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.ellipse(6, -5, 3, blink ? 1 : 4, 0, 0, Math.PI * 2)
        ctx.fill()
      } else if (avatarType === 'dragon') {
        ctx.fillStyle = '#FF4500'
        ctx.beginPath()
        ctx.ellipse(0, 0, 25, 20, 0, 0, Math.PI * 2)
        ctx.fill()
        
        // Eyes
        ctx.fillStyle = '#FF6347'
        ctx.beginPath()
        ctx.ellipse(-6, -5, 4, 5, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.ellipse(6, -5, 4, 5, 0, 0, Math.PI * 2)
        ctx.fill()
      } else if (avatarType === 'robot') {
        const pulse = Math.sin(time) * 0.2 + 0.8
        ctx.fillStyle = '#2C3E50'
        ctx.fillRect(-15, -15, 30, 30)
        
        ctx.fillStyle = `rgba(0, 255, 255, ${pulse})`
        ctx.fillRect(-12, -12, 24, 10)
        
        ctx.fillStyle = '#00FFFF'
        ctx.fillRect(-8, -10, 4, 3)
        ctx.fillRect(4, -10, 4, 3)
      } else if (avatarType === 'ghost') {
        ctx.fillStyle = 'rgba(240, 248, 255, 0.9)'
        ctx.beginPath()
        ctx.arc(0, -5, 20, Math.PI, 0, true)
        ctx.lineTo(-20, 15)
        ctx.lineTo(20, 15)
        ctx.closePath()
        ctx.fill()
        
        ctx.fillStyle = '#4169E1'
        ctx.beginPath()
        ctx.ellipse(-6, -8, 3, 4, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.ellipse(6, -8, 3, 4, 0, 0, Math.PI * 2)
        ctx.fill()
      } else if (avatarType === 'alien') {
        ctx.fillStyle = '#98FB98'
        ctx.beginPath()
        ctx.ellipse(0, 0, 20, 15, 0, 0, Math.PI * 2)
        ctx.fill()
        
        ctx.fillStyle = '#00CED1'
        ctx.beginPath()
        ctx.ellipse(-8, -5, 6, 8, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.ellipse(8, -5, 6, 8, 0, 0, Math.PI * 2)
        ctx.fill()
      } else if (avatarType === 'panda') {
        ctx.fillStyle = '#FFFFFF'
        ctx.beginPath()
        ctx.ellipse(0, 0, 18, 15, 0, 0, Math.PI * 2)
        ctx.fill()
        
        ctx.fillStyle = '#2F4F4F'
        ctx.beginPath()
        ctx.ellipse(-6, -8, 5, 6, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.ellipse(6, -8, 5, 6, 0, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    
    // Get game state
    async function getGameState() {
      try {
        const result = await chrome.storage.local.get(['floavatar-gamestate'])
        return result['floavatar-gamestate']
      } catch (error) {
        console.error('Error getting game state:', error)
        return null
      }
    }
    
    // Show token notification
    function showTokenNotification(amount: number, reason: string) {
      const existing = document.getElementById('floavatar-notification')
      if (existing) existing.remove()
      
      const notification = document.createElement('div')
      notification.id = 'floavatar-notification'
      notification.innerHTML = `
        <div style="
          position: fixed;
          top: 30px;
          left: 50%;
          transform: translateX(-50%) translateY(-100px);
          background: rgba(20, 25, 40, 0.9);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-weight: 600;
          font-size: 12px;
          z-index: 1000000;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          pointer-events: none;
        ">
          ${amount > 0 ? '+' : ''}${amount} 🪙 ${reason}
        </div>
      `
      
      document.body.appendChild(notification)
      
      // Animate in
      setTimeout(() => {
        const notifEl = notification.querySelector('div') as HTMLElement
        if (notifEl) notifEl.style.transform = 'translateX(-50%) translateY(0)'
      }, 100)
      
      // Animate out and remove
      setTimeout(() => {
        const notifEl = notification.querySelector('div') as HTMLElement
        if (notifEl) notifEl.style.transform = 'translateX(-50%) translateY(-100px)'
        setTimeout(() => notification.remove(), 300)
      }, 3000)
    }
  }
})