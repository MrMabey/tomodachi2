export default defineBackground(() => {
  console.log('FloAvatar background script loaded!')
  
  // Initialize extension
  chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
      // Set default game state
      chrome.storage.local.set({
        'floavatar-gamestate': {
          selectedEgg: null,
          isHatched: false,
          hatchStartTime: 0,
          tokensSpent: 0,
          tokens: 50, // Starting tokens
          happiness: 100,
          energy: 100,
          petName: '',
          inventory: [],
          lastTaskReset: Date.now()
        }
      })
      
      console.log('FloAvatar installed! Welcome to your virtual pet journey! 🥚')
    }
  })
  
  // Handle tab updates for activity tracking
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
      // Award tokens for visiting new sites
      awardActivityTokens(1, 'Site visit')
    }
  })
  
  // Handle tab activation
  chrome.tabs.onActivated.addListener((activeInfo) => {
    awardActivityTokens(1, 'Tab switch')
  })
  
  // Periodic happiness/energy decay
  setInterval(async () => {
    try {
      const result = await chrome.storage.local.get(['floavatar-gamestate'])
      const gameState = result['floavatar-gamestate']
      
      if (gameState && gameState.isHatched) {
        // Slowly decrease happiness and energy over time
        gameState.happiness = Math.max(0, gameState.happiness - 1)
        gameState.energy = Math.max(0, gameState.energy - 1)
        
        await chrome.storage.local.set({ 'floavatar-gamestate': gameState })
      }
    } catch (error) {
      console.error('Error updating pet stats:', error)
    }
  }, 10 * 60 * 1000) // Every 10 minutes
  
  // Award activity tokens
  async function awardActivityTokens(amount: number, reason: string) {
    try {
      const result = await chrome.storage.local.get(['floavatar-gamestate'])
      const gameState = result['floavatar-gamestate']
      
      if (gameState) {
        gameState.tokens += amount
        await chrome.storage.local.set({ 'floavatar-gamestate': gameState })
      }
    } catch (error) {
      console.error('Error awarding activity tokens:', error)
    }
  }
  
  // Handle messages from content scripts
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'openFullInterface') {
      // Open popup when user clicks expand button
      chrome.tabs.create({ url: chrome.runtime.getURL('popup/index.html') })
    }
  })
  
  // Daily task reset
  setInterval(async () => {
    try {
      const result = await chrome.storage.local.get(['floavatar-gamestate'])
      const gameState = result['floavatar-gamestate']
      
      if (gameState) {
        const now = Date.now()
        const dayInMs = 24 * 60 * 60 * 1000
        
        if (now - gameState.lastTaskReset > dayInMs) {
          gameState.lastTaskReset = now
          await chrome.storage.local.set({ 'floavatar-gamestate': gameState })
          
          console.log('Daily tasks reset!')
        }
      }
    } catch (error) {
      console.error('Error resetting daily tasks:', error)
    }
  }, 60 * 60 * 1000) // Check every hour
})