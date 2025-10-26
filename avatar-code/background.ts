export default defineBackground(() => {
  let pipWindow: chrome.windows.Window | null = null;

  // Listen for keyboard shortcut
  chrome.commands.onCommand.addListener(async (command) => {
    console.log('Command received:', command);
    if (command === 'toggle-pip-panel') {
      console.log('Toggling PiP panel...');
      await togglePipPanel();
    }
  });

  // Listen for extension icon click (fallback)
  chrome.action.onClicked.addListener(async () => {
    await togglePipPanel();
  });

  async function togglePipPanel() {
    try {
      // If PiP window exists, close it
      if (pipWindow && pipWindow.id) {
        try {
          await chrome.windows.remove(pipWindow.id);
          pipWindow = null;
          return;
        } catch (error) {
          // Window might already be closed
          pipWindow = null;
        }
      }

      // Create new PiP window
      const screenWidth = await getScreenWidth();
      const screenHeight = await getScreenHeight();
      
      pipWindow = await chrome.windows.create({
        url: chrome.runtime.getURL('panel.html'),
        type: 'popup',
        width: 320,
        height: 400,
        left: screenWidth - 340, // 20px margin from right
        top: 100, // 100px from top
        focused: true
      });

      // Listen for window close to clean up reference
      chrome.windows.onRemoved.addListener((windowId) => {
        if (pipWindow && pipWindow.id === windowId) {
          pipWindow = null;
        }
      });

    } catch (error) {
      console.error('Failed to create PiP window:', error);
    }
  }

  async function getScreenWidth(): Promise<number> {
    return new Promise((resolve) => {
      chrome.system.display.getInfo((displays) => {
        const primaryDisplay = displays.find(d => d.isPrimary) || displays[0];
        resolve(primaryDisplay?.bounds.width || 1920);
      });
    });
  }

  async function getScreenHeight(): Promise<number> {
    return new Promise((resolve) => {
      chrome.system.display.getInfo((displays) => {
        const primaryDisplay = displays.find(d => d.isPrimary) || displays[0];
        resolve(primaryDisplay?.bounds.height || 1080);
      });
    });
  }
});