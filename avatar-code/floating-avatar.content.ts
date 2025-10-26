import * as THREE from 'three';

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    console.log('🚀 Complex avatar content script loaded!');
    createComplexAvatar();
  },
});

function createComplexAvatar() {
  let isLockInMode = false;
  let playfulMovement = true;
  let currentPath = 'floating';
  let pathProgress = 0;
  let targetX = 20;
  let targetY = 20;
  let currentX = 20;
  let currentY = 20;
  
  // Main container
  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 120px;
    height: 120px;
    z-index: 10000;
    cursor: pointer;
    transition: all 0.5s ease;
  `;

  // Avatar body
  const avatar = document.createElement('div');
  avatar.style.cssText = `
    width: 100%;
    height: 100%;
    background: linear-gradient(145deg, #ffb6c1, #ff69b4);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    box-shadow: 0 8px 32px rgba(255, 105, 180, 0.3);
    border: 3px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    position: relative;
    overflow: hidden;
  `;

  // Eyes container
  const eyesContainer = document.createElement('div');
  eyesContainer.style.cssText = `
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
    position: relative;
  `;

  // Left eye
  const leftEye = document.createElement('div');
  leftEye.style.cssText = `
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  `;

  const leftPupil = document.createElement('div');
  leftPupil.style.cssText = `
    width: 12px;
    height: 12px;
    background: #333;
    border-radius: 50%;
    transition: all 0.1s ease;
  `;
  leftEye.appendChild(leftPupil);

  // Right eye
  const rightEye = document.createElement('div');
  rightEye.style.cssText = `
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  `;

  const rightPupil = document.createElement('div');
  rightPupil.style.cssText = `
    width: 12px;
    height: 12px;
    background: #333;
    border-radius: 50%;
    transition: all 0.1s ease;
  `;
  rightEye.appendChild(rightPupil);

  eyesContainer.appendChild(leftEye);
  eyesContainer.appendChild(rightEye);

  // Mouth
  const mouth = document.createElement('div');
  mouth.style.cssText = `
    width: 24px;
    height: 12px;
    border: 2px solid #333;
    border-top: none;
    border-radius: 0 0 24px 24px;
    margin-top: 4px;
    transition: all 0.3s ease;
  `;

  // Cheeks
  const leftCheek = document.createElement('div');
  leftCheek.style.cssText = `
    position: absolute;
    left: 15px;
    top: 50px;
    width: 12px;
    height: 12px;
    background: rgba(255, 182, 193, 0.6);
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;

  const rightCheek = document.createElement('div');
  rightCheek.style.cssText = `
    position: absolute;
    right: 15px;
    top: 50px;
    width: 12px;
    height: 12px;
    background: rgba(255, 182, 193, 0.6);
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;



  // Desk (initially hidden) - lowered significantly
  const desk = document.createElement('div');
  desk.style.cssText = `
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 120px;
    height: 50px;
    opacity: 0;
    transition: all 0.5s ease;
  `;

  // Desk surface
  const deskSurface = document.createElement('div');
  deskSurface.style.cssText = `
    width: 100%;
    height: 12px;
    background: linear-gradient(145deg, #8B7355, #6B5B47);
    border-radius: 5px;
    border: 2px solid #5D4037;
    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
  `;

  // Desk legs
  const leftLeg = document.createElement('div');
  leftLeg.style.cssText = `
    position: absolute;
    left: 10px;
    top: 12px;
    width: 8px;
    height: 35px;
    background: linear-gradient(145deg, #6B5B47, #5D4037);
    border-radius: 2px;
  `;

  const rightLeg = document.createElement('div');
  rightLeg.style.cssText = `
    position: absolute;
    right: 10px;
    top: 12px;
    width: 8px;
    height: 35px;
    background: linear-gradient(145deg, #6B5B47, #5D4037);
    border-radius: 2px;
  `;

  desk.appendChild(deskSurface);
  desk.appendChild(leftLeg);
  desk.appendChild(rightLeg);


  avatar.appendChild(eyesContainer);
  avatar.appendChild(mouth);
  avatar.appendChild(leftCheek);
  avatar.appendChild(rightCheek);
  container.appendChild(avatar);
  container.appendChild(desk);
  document.body.appendChild(container);

  // Animation variables
  let time = 0;
  let isBlinking = false;
  let nextBlink = Math.random() * 3000 + 2000;
  let lastBlinkTime = 0;
  let mood = 'happy';
  let moodChangeTime = 0;
  let lastPathChange = 0;
  
  // Movement functions
  function getRandomScreenPosition() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const avatarSize = 120;
    
    // Sometimes go off-screen for more adventure
    const offScreenChance = Math.random() < 0.3;
    
    if (offScreenChance) {
      const edge = Math.floor(Math.random() * 4);
      switch (edge) {
        case 0: // Top
          return { x: Math.random() * screenWidth, y: -avatarSize };
        case 1: // Right
          return { x: screenWidth + avatarSize, y: Math.random() * screenHeight };
        case 2: // Bottom
          return { x: Math.random() * screenWidth, y: screenHeight + avatarSize };
        case 3: // Left
          return { x: -avatarSize, y: Math.random() * screenHeight };
      }
    }
    
    // Regular on-screen positions
    return {
      x: Math.random() * (screenWidth - avatarSize),
      y: Math.random() * (screenHeight - avatarSize)
    };
  }
  
  function getRandomPath() {
    const paths = ['floating', 'circling', 'zigzag', 'spiral', 'bouncing', 'exploring'];
    return paths[Math.floor(Math.random() * paths.length)];
  }
  
  function smoothLerp(current, target, factor) {
    return current + (target - current) * factor;
  }

  // Expressions
  const expressions = {
    happy: { mouth: '0 0 24px 24px', cheeks: 0.6 },
    excited: { mouth: '0 0 30px 30px', cheeks: 0.8 },
    sleepy: { mouth: '0 0 12px 12px', cheeks: 0.2 },
    surprised: { mouth: '12px', cheeks: 0.4 },
    focused: { mouth: '0 0 8px 8px', cheeks: 0.1 }
  };

  // Mouse tracking for eye movement
  function trackMouse(event) {
    const rect = container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    
    const deltaX = (mouseX - centerX) / 10;
    const deltaY = (mouseY - centerY) / 10;
    
    const limitedX = Math.max(-4, Math.min(4, deltaX));
    const limitedY = Math.max(-4, Math.min(4, deltaY));
    
    if (!isBlinking) {
      leftPupil.style.transform = `translate(${limitedX}px, ${limitedY}px)`;
      rightPupil.style.transform = `translate(${limitedX}px, ${limitedY}px)`;
    }
  }

  // Initialize from storage
  async function initializeLockInMode() {
    try {
      const result = await chrome.storage.local.get(['isLockInMode']);
      if (result.isLockInMode) {
        isLockInMode = true;
        playfulMovement = false;
        applyMode();
      } else {
        // Initialize Vibe mode with a random starting position
        const startPos = getRandomScreenPosition();
        targetX = startPos.x;
        targetY = startPos.y;
        currentX = startPos.x;
        currentY = startPos.y;
        currentPath = getRandomPath();
        lastPathChange = Date.now();
        console.log(`🎉 Flo starts ${currentPath} at (${Math.round(currentX)}, ${Math.round(currentY)})`);
      }
    } catch (error) {
      console.log('Could not read from storage, using default');
    }
  }

  // Apply mode visual changes
  function applyMode() {
    if (isLockInMode) {
      // Enter Lock-in Mode - avatar at desk setup
      container.style.bottom = '20px';
      container.style.top = 'auto';
      container.style.width = '120px';
      container.style.height = '140px';
      container.style.transform = 'scale(0.7) translateY(35px)';
      desk.style.opacity = '1';
      mood = 'focused';
      
      // More serious expression
      leftEye.style.transform = 'scaleY(0.8)';
      rightEye.style.transform = 'scaleY(0.8)';
      mouth.style.borderRadius = '0 0 12px 12px';
      
      console.log('🔥 Lock In mode ACTIVATED! Time to focus!');
    } else {
      // Exit Lock-in Mode - back to normal size
      container.style.top = '20px';
      container.style.bottom = 'auto';
      container.style.width = '120px';
      container.style.height = '120px';
      container.style.transform = 'scale(1)';
      desk.style.opacity = '0';
      mood = 'happy';
      
      // Back to normal expression
      leftEye.style.transform = 'scaleY(1)';
      rightEye.style.transform = 'scaleY(1)';
      
      console.log('😎 Vibe mode ACTIVATED! Let\'s have some fun!');
    }
  }

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Content script received message:', message);
    
    if (message.type === 'PING') {
      sendResponse({ available: true });
      return true;
    }
    
    if (message.type === 'TOGGLE_MODE' || message.type === 'TOGGLE_LOCKIN_MODE') {
      isLockInMode = message.isLockInMode;
      playfulMovement = !isLockInMode;
      console.log('Setting mode to:', isLockInMode ? 'Lock In' : 'Vibe');
      
      if (!isLockInMode && playfulMovement) {
        // Switching to Vibe mode - start adventure!
        const startPos = getRandomScreenPosition();
        targetX = startPos.x;
        targetY = startPos.y;
        currentPath = getRandomPath();
        lastPathChange = Date.now();
        console.log(`🎢 Flo starts new adventure: ${currentPath}!`);
      }
      
      applyMode();
      sendResponse({ success: true });
      return true;
    }
  });

  // Initialize
  initializeLockInMode();

  // Hover interactions (disabled in lock-in mode)
  container.addEventListener('mouseenter', () => {
    if (!isLockInMode) {
      container.style.transform = 'scale(1.1)';
      leftCheek.style.opacity = '0.6';
      rightCheek.style.opacity = '0.6';
      mood = 'excited';
    }
  });

  container.addEventListener('mouseleave', () => {
    if (!isLockInMode) {
      container.style.transform = 'scale(1)';
      leftCheek.style.opacity = '0';
      rightCheek.style.opacity = '0';
      mood = 'happy';
    }
  });

  container.addEventListener('click', () => {
    if (!isLockInMode) {
      // Surprise expression
      mood = 'surprised';
      container.style.transform = 'scale(1.2) rotate(5deg)';
      setTimeout(() => {
        container.style.transform = 'scale(1)';
        mood = 'happy';
      }, 500);
    }
  });

  document.addEventListener('mousemove', trackMouse);

  // Main animation loop
  function animate() {
    time += 0.02;
    const currentTime = Date.now();

    // Floating animation
    if (playfulMovement && !isLockInMode) {
      // Vibe mode - adventurous screen exploration
      
      // Change path every 8-15 seconds
      if (currentTime - lastPathChange > (8000 + Math.random() * 7000)) {
        currentPath = getRandomPath();
        const newTarget = getRandomScreenPosition();
        targetX = newTarget.x;
        targetY = newTarget.y;
        pathProgress = 0;
        lastPathChange = currentTime;
        console.log(`🎢 Flo is now ${currentPath}! Heading to (${Math.round(targetX)}, ${Math.round(targetY)})`);
      }
      
      if (!container.matches(':hover')) {
        // Different movement patterns
        switch (currentPath) {
          case 'exploring':
            // Smooth movement to random screen positions
            currentX = smoothLerp(currentX, targetX, 0.02);
            currentY = smoothLerp(currentY, targetY, 0.02);
            break;
            
          case 'circling':
            // Circle around the screen center
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const radius = Math.min(window.innerWidth, window.innerHeight) * 0.3;
            currentX = centerX + Math.cos(time * 0.5) * radius;
            currentY = centerY + Math.sin(time * 0.5) * radius;
            break;
            
          case 'zigzag':
            // Zigzag across the screen
            currentX = (Math.sin(time * 0.8) * window.innerWidth * 0.4) + window.innerWidth / 2;
            currentY = (time * 2) % window.innerHeight;
            break;
            
          case 'spiral':
            // Spiral outward from center
            const spiralRadius = (time * 10) % (Math.min(window.innerWidth, window.innerHeight) * 0.4);
            currentX = window.innerWidth / 2 + Math.cos(time * 2) * spiralRadius;
            currentY = window.innerHeight / 2 + Math.sin(time * 2) * spiralRadius;
            break;
            
          case 'bouncing':
            // Bounce around screen edges
            currentX += Math.cos(time * 1.2) * 3;
            currentY += Math.sin(time * 1.5) * 3;
            
            // Bounce off edges
            if (currentX < 0 || currentX > window.innerWidth - 120) {
              currentX = Math.max(0, Math.min(window.innerWidth - 120, currentX));
            }
            if (currentY < 0 || currentY > window.innerHeight - 120) {
              currentY = Math.max(0, Math.min(window.innerHeight - 120, currentY));
            }
            break;
            
          default: // 'floating'
            // Enhanced floating with bigger movement
            const floatX = Math.sin(time * 0.4) * 20;
            const floatY = Math.sin(time * 0.6) * 15;
            currentX = smoothLerp(currentX, targetX + floatX, 0.05);
            currentY = smoothLerp(currentY, targetY + floatY, 0.05);
            break;
        }
        
        // Apply position and add rotation/scale effects
        const rotateOffset = Math.sin(time * 0.8) * 15; // More dramatic rotation
        const bounceScale = 1 + Math.sin(time * 1.5) * 0.08; // More bounce
        
        container.style.left = `${currentX}px`;
        container.style.top = `${currentY}px`;
        container.style.right = 'auto'; // Override default right positioning
        container.style.transform = `rotate(${rotateOffset}deg) scale(${bounceScale})`;
      }
    } else if (isLockInMode) {
      // Lock In mode - back to fixed position
      container.style.left = 'auto';
      container.style.right = '20px';
      container.style.bottom = '20px';
      container.style.top = 'auto';
      
      const focusedFloat = Math.sin(time * 0.3) * 0.5;
      container.style.transform = `scale(0.7) translateY(${35 + focusedFloat}px)`;
    } else {
      // Default gentle float at fixed position
      container.style.left = 'auto';
      container.style.right = '20px';
      container.style.top = '20px';
      container.style.bottom = 'auto';
      
      const floatOffset = Math.sin(time) * 8;
      const rotateOffset = Math.sin(time * 0.5) * 2;
      
      if (!container.matches(':hover')) {
        container.style.transform = `translateY(${floatOffset}px) rotate(${rotateOffset}deg)`;
      }
    }

    // Blinking
    if (currentTime - lastBlinkTime > nextBlink && !isBlinking) {
      isBlinking = true;
      leftEye.style.height = '2px';
      rightEye.style.height = '2px';
      
      setTimeout(() => {
        leftEye.style.height = '20px';
        rightEye.style.height = '20px';
        isBlinking = false;
        lastBlinkTime = currentTime;
        nextBlink = Math.random() * 4000 + 2000;
      }, 150);
    }

    // Mood changes - more frequent in Vibe mode
    if (!isLockInMode) {
      if (playfulMovement && currentTime - moodChangeTime > 5000) {
        // Vibe mode - more varied expressions
        const vibeMoods = ['happy', 'excited', 'surprised'];
        mood = vibeMoods[Math.floor(Math.random() * vibeMoods.length)];
        moodChangeTime = currentTime;
      } else if (!playfulMovement && currentTime - moodChangeTime > 8000 && mood === 'happy') {
        // Normal mode
        const moods = ['happy', 'sleepy'];
        mood = moods[Math.floor(Math.random() * moods.length)];
        moodChangeTime = currentTime;
      }
    }

    // Apply expression
    if (expressions[mood]) {
      mouth.style.borderRadius = expressions[mood].mouth;
      if (mood !== 'excited') {
        leftCheek.style.opacity = expressions[mood].cheeks;
        rightCheek.style.opacity = expressions[mood].cheeks;
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
  console.log('✅ Complex animated avatar created with expressions and interactions!');
}

function createFloatingAvatar() {
  // Create container for the 3D scene
  const container = document.createElement('div');
  container.id = 'floating-avatar-container';
  container.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 200px;
    height: 200px;
    z-index: 10000;
    pointer-events: none;
    border-radius: 50%;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
  `;
  document.body.appendChild(container);

  // Set up Three.js scene
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  
  renderer.setSize(200, 200);
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  // Create a simple avatar (sphere with face-like features)
  const avatarGroup = new THREE.Group();

  // Head (main sphere)
  const headGeometry = new THREE.SphereGeometry(1, 32, 32);
  const headMaterial = new THREE.MeshPhongMaterial({ 
    color: 0xfdbcb4, // skin color
    shininess: 30 
  });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  avatarGroup.add(head);

  // Eyes
  const eyeGeometry = new THREE.SphereGeometry(0.1, 16, 16);
  const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
  
  const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  leftEye.position.set(-0.3, 0.2, 0.8);
  avatarGroup.add(leftEye);
  
  const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  rightEye.position.set(0.3, 0.2, 0.8);
  avatarGroup.add(rightEye);

  // Mouth
  const mouthGeometry = new THREE.TorusGeometry(0.2, 0.05, 8, 16, Math.PI);
  const mouthMaterial = new THREE.MeshPhongMaterial({ color: 0x8B0000 });
  const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
  mouth.position.set(0, -0.3, 0.8);
  mouth.rotation.z = Math.PI;
  avatarGroup.add(mouth);

  scene.add(avatarGroup);

  // Add lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);

  // Position camera
  camera.position.z = 3;

  // Animation variables
  let time = 0;

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    
    time += 0.01;
    
    // Floating animation
    avatarGroup.position.y = Math.sin(time * 2) * 0.1;
    avatarGroup.rotation.y = Math.sin(time) * 0.1;
    
    // Gentle head bob
    head.rotation.x = Math.sin(time * 1.5) * 0.05;
    
    // Blinking animation
    const blinkTime = Math.sin(time * 3);
    if (blinkTime > 0.8) {
      leftEye.scale.y = 0.1;
      rightEye.scale.y = 0.1;
    } else {
      leftEye.scale.y = 1;
      rightEye.scale.y = 1;
    }
    
    renderer.render(scene, camera);
  }

  animate();

  // Handle cleanup when navigating away
  window.addEventListener('beforeunload', () => {
    container.remove();
  });
}