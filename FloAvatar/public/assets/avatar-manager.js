// Avatar Management Utilities
// Faithful JavaScript conversion of avatar-manager.ts
class AvatarManager {
  constructor(onAvatarClick, showFeedback) {
    this.onAvatarClick = onAvatarClick;
    this.showFeedback = showFeedback;
    this.avatar = null;
    this.avatarRenderer = null;
    this.movementTimer = null;
    this.fidgetTimer = null;
    this.currentSizeIndex = 2; // Default to medium size (110px)
    this.sizes = [
      { size: 40, name: 'Tiny' },
      { size: 70, name: 'Small' },
      { size: 110, name: 'Medium' },
      { size: 160, name: 'Large' },
      { size: 220, name: 'Huge' }
    ];
    
    this.loadSavedSize().then(() => {
      this.createAvatar();
    });
  }
  
  async loadSavedSize() {
    try {
      // For browser implementation, use localStorage instead of browser.storage
      const result = localStorage.getItem('avatarSizeIndex');
      if (result !== null) {
        this.currentSizeIndex = parseInt(result);
        console.log('Canvas Flow: Loaded saved size index:', this.currentSizeIndex);
      }
    } catch (error) {
      console.error('Canvas Flow: Error loading saved size:', error);
    }
  }
  
  async saveSizeIndex() {
    try {
      localStorage.setItem('avatarSizeIndex', this.currentSizeIndex.toString());
      console.log('Canvas Flow: Saved size index:', this.currentSizeIndex);
    } catch (error) {
      console.error('Canvas Flow: Error saving avatar size:', error);
    }
  }
  
  createAvatar() {
    const existingAvatar = document.getElementById('canvas-flow-flo-avatar');
    if (existingAvatar) return;
    
    // Create the avatar renderer with current size
    const currentSize = this.sizes[this.currentSizeIndex].size;
    this.avatarRenderer = new AvatarRenderer(currentSize);
    
    this.avatar = document.createElement('div');
    this.avatar.className = 'flo-avatar';
    this.avatar.id = 'canvas-flow-flo-avatar';
    
    // Add the canvas to the avatar container
    this.avatar.appendChild(this.avatarRenderer.getCanvas());
    
    this.styleAvatar();
    document.body.appendChild(this.avatar);
    this.setupAvatarEvents();
    this.startLifelikeMovement();
  }
  
  styleAvatar() {
    if (!this.avatar) return;
    
    this.updateAvatarSize();
    
    // Add avatar-specific styles
    const styleElement = document.createElement('style');
    styleElement.id = 'flo-avatar-styles';
    styleElement.textContent = `
      @keyframes avatarBounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      
      @keyframes avatarSpin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .avatar-excited {
        animation: avatarBounce 0.6s ease-in-out 3, avatarSpin 1s ease-in-out !important;
      }
      
      .avatar-moving {
        animation: none !important;
        transform: translateY(-2px);
      }
      
      #canvas-flow-flo-avatar canvas {
        border-radius: 50%;
        display: block;
      }
      
      #canvas-flow-flo-avatar {
        box-sizing: border-box;
      }
    `;
    
    // Remove existing style if present
    const existingStyle = document.getElementById('flo-avatar-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
    document.head.appendChild(styleElement);
  }
  
  setupAvatarEvents() {
    if (!this.avatar) return;
    
    this.avatar.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // If Shift is held while clicking, cycle sizes instead
      if (e.shiftKey) {
        this.cycleSizes();
        return;
      }
      
      // Add excited animation and change mood
      this.avatar.classList.add('avatar-excited');
      if (this.avatarRenderer) {
        this.avatarRenderer.doHappyDance();
      }
      setTimeout(() => this.avatar?.classList.remove('avatar-excited'), 2000);
      
      // Call the click handler
      this.onAvatarClick();
    });
    
    // Hover effects
    this.avatar.addEventListener('mouseenter', () => {
      if (this.avatar) {
        this.avatar.style.transform = 'scale(1.2)';
        this.avatar.style.filter = 'drop-shadow(0 6px 20px rgba(255, 182, 193, 0.8))';
        if (this.avatarRenderer) {
          this.avatarRenderer.setHovered(true);
          this.avatarRenderer.setMood('curious');
        }
      }
    });
    
    this.avatar.addEventListener('mouseleave', () => {
      if (this.avatar) {
        this.avatar.style.transform = 'scale(1)';
        this.avatar.style.filter = 'drop-shadow(0 4px 12px rgba(255, 182, 193, 0.4))';
        if (this.avatarRenderer) {
          this.avatarRenderer.setHovered(false);
          this.avatarRenderer.setMood('happy');
        }
      }
    });
  }
  
  startLifelikeMovement() {
    if (!this.avatar) return;
    
    let currentX = parseFloat(this.avatar.style.left) || 10;
    let currentY = parseFloat(this.avatar.style.top) || 30;
    let isMoving = false;
    
    const moveToRandomPosition = () => {
      if (isMoving || !this.avatar) return;
      
      // Calculate safe boundaries based on current size
      const currentSize = this.sizes[this.currentSizeIndex].size;
      const padding = currentSize + 16; // Add some padding
      const maxX = Math.max(0, (window.innerWidth - padding) / window.innerWidth * 100);
      const maxY = Math.max(0, (window.innerHeight - padding) / window.innerHeight * 100);
      
      // Generate random target position
      const targetX = Math.random() * maxX;
      const targetY = Math.random() * maxY;
      
      // Don't move if target is too close
      const deltaX = Math.abs(targetX - currentX);
      const deltaY = Math.abs(targetY - currentY);
      if (deltaX < 5 && deltaY < 5) return;
      
      isMoving = true;
      this.avatar.classList.add('avatar-moving');
      if (this.avatarRenderer) {
        this.avatarRenderer.setMood('focused');
      }
      
      // Smooth transition
      this.avatar.style.transition = 'all 3s cubic-bezier(0.4, 0, 0.2, 1)';
      this.avatar.style.left = `${targetX}%`;
      this.avatar.style.top = `${targetY}%`;
      
      currentX = targetX;
      currentY = targetY;
      
      // Stop moving animation
      setTimeout(() => {
        if (this.avatar) {
          isMoving = false;
          this.avatar.classList.remove('avatar-moving');
          this.avatar.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
          if (this.avatarRenderer) {
            this.avatarRenderer.setMood('happy');
          }
        }
      }, 3000);
    };
    
    // Schedule movements
    const scheduleNextMove = () => {
      const delay = Math.random() * 7000 + 8000; // 8-15 seconds
      this.movementTimer = setTimeout(() => {
        moveToRandomPosition();
        scheduleNextMove();
      }, delay);
    };
    
    // Start movement cycle
    scheduleNextMove();
    
    // Fidget movements with mood changes
    const fidget = () => {
      if (!isMoving && this.avatar) {
        const fidgetX = currentX + (Math.random() - 0.5) * 3;
        const fidgetY = currentY + (Math.random() - 0.5) * 3;
        
        const currentSize = this.sizes[this.currentSizeIndex].size;
        const padding = currentSize + 16;
        const maxX = (window.innerWidth - padding) / window.innerWidth * 100;
        const maxY = (window.innerHeight - padding) / window.innerHeight * 100;
        
        const boundedX = Math.max(0, Math.min(maxX, fidgetX));
        const boundedY = Math.max(0, Math.min(maxY, fidgetY));
        
        this.avatar.style.left = `${boundedX}%`;
        this.avatar.style.top = `${boundedY}%`;
        
        currentX = boundedX;
        currentY = boundedY;
        
        // Random mood changes during fidget
        if (this.avatarRenderer && Math.random() > 0.7) {
          const moods = ['happy', 'curious', 'sleepy'];
          const randomMood = moods[Math.floor(Math.random() * moods.length)];
          this.avatarRenderer.setMood(randomMood);
          
          // Return to happy after a moment
          setTimeout(() => {
            this.avatarRenderer?.setMood('happy');
          }, 3000);
        }
      }
      
      this.fidgetTimer = setTimeout(fidget, Math.random() * 25000 + 20000);
    };
    
    // Start fidgeting
    setTimeout(fidget, Math.random() * 10000 + 5000);
  }
  
  destroy() {
    if (this.avatarRenderer) {
      this.avatarRenderer.destroy();
      this.avatarRenderer = null;
    }
    
    if (this.avatar) {
      this.avatar.remove();
      this.avatar = null;
    }
    
    if (this.movementTimer) {
      clearTimeout(this.movementTimer);
      this.movementTimer = null;
    }
    
    if (this.fidgetTimer) {
      clearTimeout(this.fidgetTimer);
      this.fidgetTimer = null;
    }
  }
  
  recreate() {
    this.destroy();
    this.loadSavedSize().then(() => {
      this.createAvatar();
    });
  }
  
  getCurrentSizeInfo() {
    const currentSize = this.sizes[this.currentSizeIndex];
    console.log('Canvas Flow: Current size info:', {
      index: this.currentSizeIndex,
      size: currentSize,
      actualWidth: this.avatar?.style.width,
      actualHeight: this.avatar?.style.height
    });
    return currentSize;
  }
  
  updateAvatarSize() {
    if (!this.avatar) return;
    
    const currentSize = this.sizes[this.currentSizeIndex].size;
    
    // Store current position before updating styles
    const currentLeft = this.avatar.style.left || '10%';
    const currentTop = this.avatar.style.top || '30%';
    
    // Update CONTAINER size while preserving position
    this.avatar.style.width = `${currentSize}px`;
    this.avatar.style.height = `${currentSize}px`;
    
    // Ensure base container styles are set (but don't interfere with canvas)
    this.avatar.style.position = 'fixed';
    this.avatar.style.zIndex = '9998';
    this.avatar.style.cursor = 'pointer';
    this.avatar.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    this.avatar.style.userSelect = 'none';
    this.avatar.style.filter = 'drop-shadow(0 4px 12px rgba(255, 182, 193, 0.4))';
    this.avatar.style.borderRadius = '50%';
    this.avatar.style.overflow = 'hidden';
    
    // Make sure the canvas inside fits the container perfectly
    const canvas = this.avatar.querySelector('canvas');
    if (canvas) {
      canvas.style.display = 'block'; // Remove any inline spacing
      canvas.style.borderRadius = '50%'; // Match container border radius
    }
    
    // Restore position
    this.avatar.style.left = currentLeft;
    this.avatar.style.top = currentTop;
    
    console.log('Canvas Flow: Updated avatar container to', currentSize, 'px, canvas should match');
  }
  
  cycleSizes() {
    // Cycle to next size
    this.currentSizeIndex = (this.currentSizeIndex + 1) % this.sizes.length;
    const newSize = this.sizes[this.currentSizeIndex];
    
    if (!this.avatar || !this.avatarRenderer) {
      return;
    }
    
    console.log('Canvas Flow: Cycling to size:', newSize.name, newSize.size);
    
    // Store current position to maintain it
    const currentLeft = this.avatar.style.left;
    const currentTop = this.avatar.style.top;
    
    // Update container size FIRST
    this.updateAvatarSize();
    
    // Then resize the canvas to match - delay slightly to ensure container is updated
    setTimeout(() => {
      if (this.avatarRenderer) {
        console.log('Canvas Flow: Resizing canvas to:', newSize.size);
        this.avatarRenderer.resizeCanvas(newSize.size);
        
        // Force a style update to ensure consistency
        const canvas = this.avatar?.querySelector('canvas');
        if (canvas) {
          console.log('Canvas Flow: Final canvas style - width:', canvas.style.width, 'height:', canvas.style.height);
        }
      }
    }, 10);
    
    // Restore position
    if (currentLeft) this.avatar.style.left = currentLeft;
    if (currentTop) this.avatar.style.top = currentTop;
    
    // Save the new size
    this.saveSizeIndex();
    
    // Show feedback if function provided
    if (this.showFeedback) {
      this.showFeedback(`🌸 Avatar size: ${newSize.name}`);
    }
    
    // Brief excited animation for the size change
    setTimeout(() => {
      if (this.avatarRenderer) {
        this.avatarRenderer.doHappyDance();
      }
    }, 100); // Small delay to ensure animation
  }
}

// Export for use
window.AvatarManager = AvatarManager;