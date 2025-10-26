// Flow Buddy - DOM-based floating avatar with advanced behaviors
export class FlowBuddy {
  private container: HTMLDivElement;
  private avatar: HTMLDivElement;
  private leftEye: HTMLDivElement;
  private rightEye: HTMLDivElement;
  private leftPupil: HTMLDivElement;
  private rightPupil: HTMLDivElement;
  private mouth: HTMLDivElement;
  private leftCheek: HTMLDivElement;
  private rightCheek: HTMLDivElement;
  private desk: HTMLDivElement;

  private time = 0;
  private isBlinking = false;
  private nextBlink = Math.random() * 3000 + 2000;
  private lastBlinkTime = 0;
  private mood = 'happy';
  private moodChangeTime = 0;
  private isLockInMode = false;

  constructor() {
    this.createAvatar();
    this.setupEventListeners();
    this.animate();
  }

  private createAvatar() {
    // Main container
    this.container = document.createElement('div');
    this.container.style.cssText = `
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
    this.avatar = document.createElement('div');
    this.avatar.style.cssText = `
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
    this.leftEye = document.createElement('div');
    this.leftEye.style.cssText = `
      width: 20px;
      height: 20px;
      background: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    `;

    this.leftPupil = document.createElement('div');
    this.leftPupil.style.cssText = `
      width: 12px;
      height: 12px;
      background: #333;
      border-radius: 50%;
      transition: all 0.1s ease;
    `;
    this.leftEye.appendChild(this.leftPupil);

    // Right eye
    this.rightEye = document.createElement('div');
    this.rightEye.style.cssText = `
      width: 20px;
      height: 20px;
      background: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    `;

    this.rightPupil = document.createElement('div');
    this.rightPupil.style.cssText = `
      width: 12px;
      height: 12px;
      background: #333;
      border-radius: 50%;
      transition: all 0.1s ease;
    `;
    this.rightEye.appendChild(this.rightPupil);

    eyesContainer.appendChild(this.leftEye);
    eyesContainer.appendChild(this.rightEye);

    // Mouth
    this.mouth = document.createElement('div');
    this.mouth.style.cssText = `
      width: 24px;
      height: 12px;
      border: 2px solid #333;
      border-top: none;
      border-radius: 0 0 24px 24px;
      margin-top: 4px;
      transition: all 0.3s ease;
    `;

    // Cheeks
    this.leftCheek = document.createElement('div');
    this.leftCheek.style.cssText = `
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

    this.rightCheek = document.createElement('div');
    this.rightCheek.style.cssText = `
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

    // Desk (initially hidden)
    this.desk = document.createElement('div');
    this.desk.style.cssText = `
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

    this.desk.appendChild(deskSurface);
    this.desk.appendChild(leftLeg);
    this.desk.appendChild(rightLeg);

    // Assemble avatar
    this.avatar.appendChild(eyesContainer);
    this.avatar.appendChild(this.mouth);
    this.avatar.appendChild(this.leftCheek);
    this.avatar.appendChild(this.rightCheek);
    this.container.appendChild(this.avatar);
    this.container.appendChild(this.desk);

    document.body.appendChild(this.container);
  }

  private setupEventListeners() {
    // Mouse tracking for eye movement
    document.addEventListener('mousemove', (event) => {
      const rect = this.container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const mouseX = event.clientX;
      const mouseY = event.clientY;

      const deltaX = (mouseX - centerX) / 10;
      const deltaY = (mouseY - centerY) / 10;

      const limitedX = Math.max(-4, Math.min(4, deltaX));
      const limitedY = Math.max(-4, Math.min(4, deltaY));

      if (!this.isBlinking) {
        this.leftPupil.style.transform = `translate(${limitedX}px, ${limitedY}px)`;
        this.rightPupil.style.transform = `translate(${limitedX}px, ${limitedY}px)`;
      }
    });

    // Hover interactions
    this.container.addEventListener('mouseenter', () => {
      if (!this.isLockInMode) {
        this.container.style.transform = 'scale(1.1)';
        this.leftCheek.style.opacity = '0.6';
        this.rightCheek.style.opacity = '0.6';
        this.mood = 'excited';
      }
    });

    this.container.addEventListener('mouseleave', () => {
      if (!this.isLockInMode) {
        this.container.style.transform = 'scale(1)';
        this.leftCheek.style.opacity = '0';
        this.rightCheek.style.opacity = '0';
        this.mood = 'happy';
      }
    });

    // Click interaction
    this.container.addEventListener('click', () => {
      if (!this.isLockInMode) {
        this.mood = 'surprised';
        this.container.style.transform = 'scale(1.2) rotate(5deg)';
        setTimeout(() => {
          this.container.style.transform = 'scale(1)';
          this.mood = 'happy';
        }, 500);
      }
    });
  }

  private animate = () => {
    this.time += 0.02;
    const currentTime = Date.now();

    // Floating animation
    if (!this.isLockInMode) {
      const floatOffset = Math.sin(this.time) * 8;
      const rotateOffset = Math.sin(this.time * 0.5) * 2;

      if (!this.container.matches(':hover')) {
        this.container.style.transform = `translateY(${floatOffset}px) rotate(${rotateOffset}deg)`;
      }
    } else {
      // Lock In mode - subtle float
      const focusedFloat = Math.sin(this.time * 0.3) * 0.5;
      this.container.style.transform = `scale(0.7) translateY(${35 + focusedFloat}px)`;
    }

    // Blinking
    if (currentTime - this.lastBlinkTime > this.nextBlink && !this.isBlinking) {
      this.isBlinking = true;
      this.leftEye.style.height = '2px';
      this.rightEye.style.height = '2px';

      setTimeout(() => {
        this.leftEye.style.height = '20px';
        this.rightEye.style.height = '20px';
        this.isBlinking = false;
        this.lastBlinkTime = currentTime;
        this.nextBlink = Math.random() * 4000 + 2000;
      }, 150);
    }

    // Mood changes
    if (!this.isLockInMode && currentTime - this.moodChangeTime > 8000 && this.mood === 'happy') {
      const moods = ['happy', 'sleepy'];
      this.mood = moods[Math.floor(Math.random() * moods.length)];
      this.moodChangeTime = currentTime;
    }

    // Apply expression
    this.applyExpression();

    requestAnimationFrame(this.animate);
  };

  private applyExpression() {
    const expressions: Record<string, { mouth: string; cheeks: number }> = {
      happy: { mouth: '0 0 24px 24px', cheeks: 0.6 },
      excited: { mouth: '0 0 30px 30px', cheeks: 0.8 },
      sleepy: { mouth: '0 0 12px 12px', cheeks: 0.2 },
      surprised: { mouth: '12px', cheeks: 0.4 },
      focused: { mouth: '0 0 8px 8px', cheeks: 0.1 }
    };

    if (expressions[this.mood]) {
      this.mouth.style.borderRadius = expressions[this.mood].mouth;
      if (this.mood !== 'excited') {
        this.leftCheek.style.opacity = expressions[this.mood].cheeks.toString();
        this.rightCheek.style.opacity = expressions[this.mood].cheeks.toString();
      }
    }
  }

  public setMood(mood: string) {
    const moodMap: Record<string, string> = {
      'HAPPY': 'happy',
      'EXCITED': 'excited',
      'FOCUSED': 'focused',
      'LISTENING': 'happy',
      'THINKING': 'focused',
      'SUCCESS': 'excited',
      'ERROR': 'surprised',
      'SLEEPING': 'sleepy',
      'CREATIVE': 'excited'
    };

    this.mood = moodMap[mood] || 'happy';
  }

  public setLockInMode(enabled: boolean) {
    this.isLockInMode = enabled;

    if (enabled) {
      // Enter Lock-in Mode
      this.container.style.bottom = '20px';
      this.container.style.top = 'auto';
      this.container.style.width = '120px';
      this.container.style.height = '140px';
      this.container.style.transform = 'scale(0.7) translateY(35px)';
      this.desk.style.opacity = '1';
      this.mood = 'focused';

      this.leftEye.style.transform = 'scaleY(0.8)';
      this.rightEye.style.transform = 'scaleY(0.8)';
      this.mouth.style.borderRadius = '0 0 12px 12px';

      console.log('🔥 Lock In mode ACTIVATED!');
    } else {
      // Exit Lock-in Mode
      this.container.style.top = '20px';
      this.container.style.bottom = 'auto';
      this.container.style.width = '120px';
      this.container.style.height = '120px';
      this.container.style.transform = 'scale(1)';
      this.desk.style.opacity = '0';
      this.mood = 'happy';

      this.leftEye.style.transform = 'scaleY(1)';
      this.rightEye.style.transform = 'scaleY(1)';

      console.log('😎 Vibe mode ACTIVATED!');
    }
  }

  public destroy() {
    this.container.remove();
  }
}
