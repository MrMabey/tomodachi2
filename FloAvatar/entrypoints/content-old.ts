export default defineContentScript({
  matches: ['*://*/*'],
  
  async main() {
    console.log('FloAvatar content script loaded!')
    
    // Track user activity for token generation
    let activityScore = 0
    let lastActivity = Date.now()
    let floatingAvatar: any = null
    
    // Load avatar renderers
    await loadAvatarRenderers()
    
    // Check if user has a hatched pet
    const gameState = await getGameState()
    
    if (gameState?.isHatched && gameState?.selectedEgg) {
      createFloatingAvatar(gameState.selectedEgg)
    }
    
    // Activity tracking
    const trackActivity = () => {
      activityScore++
      lastActivity = Date.now()
      
      // Award tokens based on activity
      if (activityScore % 50 === 0) { // Every 50 actions
        awardTokens(2, 'Activity bonus! 🎯')
      }
    }
    
    // Event listeners for activity tracking
    document.addEventListener('click', trackActivity)
    document.addEventListener('scroll', trackActivity)
    document.addEventListener('keydown', trackActivity)
    
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
    
    // Tab change tracking
    let tabChangeCount = 0
    window.addEventListener('focus', () => {
      tabChangeCount++
      if (tabChangeCount % 5 === 0) {
        awardTokens(2, 'Tab explorer! 📑')
      }
    })
    
    // Search detection
    const detectSearch = () => {
      const url = window.location.href
      const searchEngines = ['google.com/search', 'bing.com/search', 'duckduckgo.com', 'yahoo.com/search']
      
      if (searchEngines.some(engine => url.includes(engine))) {
        awardTokens(5, 'Search master! 🔍')
      }
    }
    
    detectSearch()
    
    // Award tokens function
    async function awardTokens(amount: number, reason: string) {
      try {
        const result = await chrome.storage.local.get(['floavatar-gamestate'])
        const currentState = result['floavatar-gamestate'] || { tokens: 0 }
        
        currentState.tokens += amount
        await chrome.storage.local.set({ 'floavatar-gamestate': currentState })
        
        // Show notification
        showTokenNotification(amount, reason)
        
        // Update floating avatar happiness if exists
        if (floatingAvatar && floatingAvatar.setMood) {
          floatingAvatar.setMood('happy')
          setTimeout(() => floatingAvatar.setMood('content'), 2000)
        }
        
      } catch (error) {
        console.error('Error awarding tokens:', error)
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
    
    // Create floating avatar
    function createFloatingAvatar(avatarType: string) {
      // Remove existing avatar
      const existing = document.getElementById('floavatar-floating')
      if (existing) existing.remove()
      
      const container = document.createElement('div')
      container.id = 'floavatar-floating'
      container.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 999999;
        cursor: pointer;
        border-radius: 50%;
        filter: drop-shadow(0 4px 20px rgba(255, 182, 193, 0.6));
        transition: all 0.3s ease;
        pointer-events: auto;
        width: 80px;
        height: 80px;
      `
      
      // Create canvas for simple avatar
      const canvas = document.createElement('canvas')
      canvas.width = 80
      canvas.height = 80
      canvas.style.borderRadius = '50%'
      canvas.style.width = '80px'
      canvas.style.height = '80px'
      
      container.appendChild(canvas)
      document.body.appendChild(container)
      
      // Simple avatar animation
      const ctx = canvas.getContext('2d')
      if (ctx) {
        let animationFrame: number
        
        const animate = () => {
          const time = Date.now() * 0.003
          const centerX = canvas.width / 2
          const centerY = canvas.height / 2
          
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.save()
          ctx.translate(centerX, centerY)
          
          // Simple avatar based on type
          const breathe = 1 + Math.sin(time) * 0.05
          ctx.scale(breathe * 0.5, breathe * 0.5) // Smaller scale for floating avatar
          
          if (avatarType === 'cat') {
            drawSimpleFloatingCat(ctx, time)
          } else if (avatarType === 'dragon') {
            drawSimpleFloatingDragon(ctx, time)
          } else if (avatarType === 'robot') {
            drawSimpleFloatingRobot(ctx, time)
          } else if (avatarType === 'ghost') {
            drawSimpleFloatingGhost(ctx, time)
          } else if (avatarType === 'alien') {
            drawSimpleFloatingAlien(ctx, time)
          } else if (avatarType === 'panda') {
            drawSimpleFloatingPanda(ctx, time)
          }
          
          ctx.restore()
          animationFrame = requestAnimationFrame(animate)
        }
        
        animate()
        
        // Store cleanup function
        floatingAvatar = {
          destroy: () => {
            if (animationFrame) cancelAnimationFrame(animationFrame)
          }
        }
      }
      
      // Add interactions
      container.addEventListener('mouseenter', () => {
        container.style.transform = 'scale(1.1)'
        container.style.filter = 'drop-shadow(0 6px 25px rgba(255, 182, 193, 0.8))'
      })
      
      container.addEventListener('mouseleave', () => {
        container.style.transform = 'scale(1)'
        container.style.filter = 'drop-shadow(0 4px 20px rgba(255, 182, 193, 0.6))'
      })
      
      container.addEventListener('click', () => {
        // Bounce animation
        container.style.transform = 'scale(1.2)'
        setTimeout(() => {
          container.style.transform = 'scale(1)'
        }, 200)
        
        awardTokens(1, 'Pet interaction! 💖')
      })
    }
    
    // Simple floating avatar drawing functions
    function drawSimpleFloatingCat(ctx: CanvasRenderingContext2D, time: number) {
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
      const blink = Math.sin(time * 0.3) > 0.9
      ctx.fillStyle = blink ? '#FFB6C1' : '#4169E1'
      ctx.beginPath()
      ctx.ellipse(-6, -5, 3, blink ? 1 : 4, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(6, -5, 3, blink ? 1 : 4, 0, 0, Math.PI * 2)
      ctx.fill()
    }
    
    function drawSimpleFloatingDragon(ctx: CanvasRenderingContext2D, time: number) {
      ctx.fillStyle = '#FF4500'
      ctx.beginPath()
      ctx.ellipse(0, 0, 25, 20, 0, 0, Math.PI * 2)
      ctx.fill()
      
      // Wings
      const wingFlap = Math.sin(time * 2) * 0.2
      ctx.fillStyle = '#B22222'
      ctx.save()
      ctx.rotate(-0.3 + wingFlap)
      ctx.translate(-15, -5)
      ctx.beginPath()
      ctx.ellipse(0, 0, 8, 15, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
      
      ctx.save()
      ctx.rotate(0.3 - wingFlap)
      ctx.translate(15, -5)
      ctx.beginPath()
      ctx.ellipse(0, 0, 8, 15, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
      
      // Eyes
      ctx.fillStyle = '#FF6347'
      ctx.beginPath()
      ctx.ellipse(-6, -5, 4, 5, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(6, -5, 4, 5, 0, 0, Math.PI * 2)
      ctx.fill()
    }
    
    function drawSimpleFloatingRobot(ctx: CanvasRenderingContext2D, time: number) {
      ctx.fillStyle = '#2C3E50'
      ctx.fillRect(-15, -15, 30, 30)
      
      const pulse = Math.sin(time) * 0.2 + 0.8
      ctx.fillStyle = `rgba(0, 255, 255, ${pulse})`
      ctx.fillRect(-12, -12, 24, 10)
      
      ctx.fillStyle = '#00FFFF'
      ctx.fillRect(-8, -10, 4, 3)
      ctx.fillRect(4, -10, 4, 3)
    }
    
    function drawSimpleFloatingGhost(ctx: CanvasRenderingContext2D, time: number) {
      const float = Math.sin(time) * 2
      ctx.translate(0, float)
      
      ctx.fillStyle = 'rgba(240, 248, 255, 0.9)'
      ctx.beginPath()
      ctx.arc(0, -5, 20, Math.PI, 0, true)
      
      for (let i = -20; i <= 20; i += 4) {
        const waveY = 15 + Math.sin((i / 4 + time) * 0.5) * 2
        if (i === -20) ctx.lineTo(i, waveY)
        else ctx.lineTo(i, waveY)
      }
      ctx.closePath()
      ctx.fill()
      
      ctx.fillStyle = '#4169E1'
      ctx.beginPath()
      ctx.ellipse(-6, -8, 3, 4, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(6, -8, 3, 4, 0, 0, Math.PI * 2)
      ctx.fill()
    }
    
    function drawSimpleFloatingAlien(ctx: CanvasRenderingContext2D, time: number) {
      ctx.fillStyle = '#98FB98'
      ctx.beginPath()
      ctx.ellipse(0, 5, 15, 18, 0, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.beginPath()
      ctx.ellipse(0, -10, 20, 15, 0, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.fillStyle = '#00CED1'
      ctx.beginPath()
      ctx.ellipse(-8, -12, 6, 8, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(8, -12, 6, 8, 0, 0, Math.PI * 2)
      ctx.fill()
    }
    
    function drawSimpleFloatingPanda(ctx: CanvasRenderingContext2D, time: number) {
      ctx.fillStyle = '#FFFFFF'
      ctx.beginPath()
      ctx.ellipse(0, 0, 18, 15, 0, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.fillStyle = '#2F4F4F'
      ctx.beginPath()
      ctx.ellipse(-12, -12, 6, 8, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(12, -12, 6, 8, 0, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.beginPath()
      ctx.ellipse(-6, -8, 5, 6, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(6, -8, 5, 6, 0, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.fillStyle = '#FFFFFF'
      ctx.beginPath()
      ctx.ellipse(-6, -8, 3, 4, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(6, -8, 3, 4, 0, 0, Math.PI * 2)
      ctx.fill()
    }
    
    // Load avatar renderers
    async function loadAvatarRenderers() {
      const scripts = [
        'avatar-renderer.js',
        'dragon-avatar.js',
        'robot-avatar.js',
        'ghost-avatar.js',
        'alien-avatar.js',
        'panda-avatar.js'
      ]
      
      for (const script of scripts) {
        try {
          const scriptTag = document.createElement('script')
          scriptTag.src = chrome.runtime.getURL(`assets/${script}`)
          document.head.appendChild(scriptTag)
          
          await new Promise((resolve) => {
            scriptTag.onload = resolve
          })
        } catch (error) {
          console.error(`Error loading ${script}:`, error)
        }
      }
    }
    
    // Show token notification
    function showTokenNotification(amount: number, reason: string) {
      // Remove existing notification
      const existing = document.getElementById('floavatar-notification')
      if (existing) existing.remove()
      
      const notification = document.createElement('div')
      notification.id = 'floavatar-notification'
      notification.innerHTML = `
        <div style="
          position: fixed;
          top: 20px;
          right: 20px;
          background: linear-gradient(135deg, #FFB6C1, #98FB98);
          color: white;
          padding: 12px 20px;
          border-radius: 25px;
          font-family: 'Segoe UI', sans-serif;
          font-weight: bold;
          font-size: 14px;
          z-index: 999999;
          box-shadow: 0 4px 20px rgba(255, 182, 193, 0.4);
          transform: translateX(400px);
          transition: transform 0.3s ease;
          pointer-events: none;
        ">
          +${amount} 🪙 ${reason}
        </div>
      `
      
      document.body.appendChild(notification)
      
      // Animate in
      setTimeout(() => {
        const notifEl = notification.querySelector('div') as HTMLElement
        if (notifEl) notifEl.style.transform = 'translateX(0)'
      }, 100)
      
      // Animate out and remove
      setTimeout(() => {
        const notifEl = notification.querySelector('div') as HTMLElement
        if (notifEl) notifEl.style.transform = 'translateX(400px)'
        setTimeout(() => notification.remove(), 300)
      }, 3000)
    }
    
    // Listen for storage changes to update floating avatar
    chrome.storage.onChanged.addListener((changes) => {
      if (changes['floavatar-gamestate']) {
        const newState = changes['floavatar-gamestate'].newValue
        
        // Show floating avatar if pet just hatched
        if (newState?.isHatched && newState?.selectedEgg && !floatingAvatar) {
          createFloatingAvatar(newState.selectedEgg)
        }
        
        // Remove floating avatar if pet is no longer available
        if (!newState?.isHatched && floatingAvatar) {
          const existing = document.getElementById('floavatar-floating')
          if (existing) existing.remove()
          floatingAvatar = null
        }
      }
    })
  }
})