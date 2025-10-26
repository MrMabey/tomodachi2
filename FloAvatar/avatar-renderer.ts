// 2D Avatar Renderer - Cute Cat-like Creature
export class AvatarRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationFrame: number | null = null;
  
  // Avatar state
  private blinkTimer = 0;
  private mouthState: 'happy' | 'curious' | 'sleepy' | 'excited' | 'focused' = 'happy';
  private earWiggleTimer = 0;
  private breathingTimer = 0;
  private glowPulse = 0;
  private headTiltTimer = 0;
  private isHovered = false;
  
  // Colors - soft, playful palette
  private colors = {
    primary: '#FFB6C1',      // Light pink
    secondary: '#E6E6FA',    // Lavender
    accent: '#98FB98',       // Pale green
    eyes: '#4169E1',         // Royal blue
    pupils: '#191970',       // Midnight blue
    nose: '#FF69B4',         // Hot pink
    innerEar: '#FFC0CB',     // Pink
    whiskers: '#D3D3D3',     // Light gray
    glow: 'rgba(255, 182, 193, 0.6)'
  };
  
  constructor(size = 64) {
    this.canvas = document.createElement('canvas');
    this.setCanvasSize(size);
    this.ctx = this.canvas.getContext('2d')!;
    
    // Enable smooth rendering
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    
    this.startAnimation();
  }

  private setCanvasSize(size: number) {
    this.canvas.width = size;
    this.canvas.height = size;
    // Set CSS size to match canvas dimensions for consistent sizing
    this.canvas.style.width = `${size}px`;
    this.canvas.style.height = `${size}px`;
  }

  public resizeCanvas(newSize: number) {
    console.log('Canvas Flow: AvatarRenderer.resizeCanvas called with:', newSize);
    console.log('Canvas Flow: Before resize - canvas:', this.canvas.width, 'x', this.canvas.height, 'style:', this.canvas.style.width, 'x', this.canvas.style.height);
    
    this.setCanvasSize(newSize);
    
    console.log('Canvas Flow: After resize - canvas:', this.canvas.width, 'x', this.canvas.height, 'style:', this.canvas.style.width, 'x', this.canvas.style.height);
    
    if (this.ctx) {
      // Re-enable smooth rendering after resize
      this.ctx.imageSmoothingEnabled = true;
      this.ctx.imageSmoothingQuality = 'high';
    }
  }
  
  private startAnimation() {
    const animate = (timestamp: number) => {
      this.updateTimers(timestamp);
      this.draw();
      this.animationFrame = requestAnimationFrame(animate);
    };
    this.animationFrame = requestAnimationFrame(animate);
  }
  
  private updateTimers(timestamp: number) {
    // Blinking cycle (2-4 seconds)
    this.blinkTimer = (timestamp / 1000) % 3;
    
    // Ear wiggle (random intervals)
    this.earWiggleTimer = (timestamp / 300) % (Math.PI * 2);
    
    // Breathing/scaling
    this.breathingTimer = (timestamp / 2000) % (Math.PI * 2);
    
    // Glow pulse
    this.glowPulse = (timestamp / 1500) % (Math.PI * 2);
    
    // Head tilt for curiosity
    this.headTiltTimer = (timestamp / 4000) % (Math.PI * 2);
  }
  
  private draw() {
    const { ctx, canvas } = this;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = 0.8 + Math.sin(this.breathingTimer) * 0.05; // Subtle breathing
    const tilt = this.mouthState === 'curious' ? Math.sin(this.headTiltTimer) * 0.1 : 0;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(tilt); // Subtle head tilt
    ctx.scale(scale, scale);
    
    // Draw glow effect
    this.drawGlow();
    
    // Draw main body (rounded)
    this.drawBody();
    
    // Draw ears
    this.drawEars();
    
    // Draw face
    this.drawEyes();
    this.drawNose();
    this.drawMouth();
    this.drawWhiskers();
    
    // Draw cheek blush
    this.drawCheeks();
    
    ctx.restore();
  }
  
  private drawGlow() {
    const { ctx } = this;
    const glowIntensity = 0.3 + Math.sin(this.glowPulse) * 0.2;
    
    ctx.save();
    ctx.shadowColor = this.colors.glow;
    ctx.shadowBlur = 15 * glowIntensity;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Invisible circle to create glow
    ctx.globalAlpha = 0;
    ctx.beginPath();
    ctx.arc(0, 0, 25, 0, Math.PI * 2);
    ctx.fillStyle = this.colors.primary;
    ctx.fill();
    
    ctx.restore();
  }
  
  private drawBody() {
    const { ctx } = this;
    
    // Main body - soft rounded shape
    ctx.save();
    
    // Gradient fill
    const gradient = ctx.createRadialGradient(0, -5, 0, 0, 0, 25);
    gradient.addColorStop(0, this.colors.primary);
    gradient.addColorStop(1, this.colors.secondary);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(0, 0, 22, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Subtle outline
    ctx.strokeStyle = this.colors.accent;
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.restore();
  }
  
  private drawEars() {
    const { ctx } = this;
    const wiggle = Math.sin(this.earWiggleTimer) * 0.1;
    
    ctx.save();
    
    // Left ear
    ctx.save();
    ctx.rotate(-0.3 + wiggle);
    ctx.translate(-8, -15);
    this.drawEar();
    ctx.restore();
    
    // Right ear
    ctx.save();
    ctx.rotate(0.3 - wiggle);
    ctx.translate(8, -15);
    this.drawEar();
    ctx.restore();
    
    ctx.restore();
  }
  
  private drawEar() {
    const { ctx } = this;
    
    // Outer ear
    ctx.fillStyle = this.colors.primary;
    ctx.beginPath();
    ctx.ellipse(0, 0, 6, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner ear
    ctx.fillStyle = this.colors.innerEar;
    ctx.beginPath();
    ctx.ellipse(0, 1, 3, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  
  private drawEyes() {
    const { ctx } = this;
    const isBlinking = this.blinkTimer > 2.8; // Blink for 0.2 seconds
    const eyeHeight = isBlinking ? 2 : 8;
    
    // Eye glow
    ctx.save();
    ctx.shadowColor = this.colors.eyes;
    ctx.shadowBlur = 8;
    
    // Left eye
    ctx.fillStyle = this.colors.eyes;
    ctx.beginPath();
    ctx.ellipse(-6, -3, 4, eyeHeight, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Right eye
    ctx.beginPath();
    ctx.ellipse(6, -3, 4, eyeHeight, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
    
    if (!isBlinking) {
      // Pupils
      ctx.fillStyle = this.colors.pupils;
      ctx.beginPath();
      ctx.ellipse(-6, -3, 2, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.beginPath();
      ctx.ellipse(6, -3, 2, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Eye highlights
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.ellipse(-7, -5, 1, 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.beginPath();
      ctx.ellipse(7, -5, 1, 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  private drawNose() {
    const { ctx } = this;
    
    // Cute triangular nose
    ctx.fillStyle = this.colors.nose;
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.lineTo(-2, 5);
    ctx.lineTo(2, 5);
    ctx.closePath();
    ctx.fill();
    
    // Nose highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.ellipse(-0.5, 3.5, 0.5, 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  
  private drawMouth() {
    const { ctx } = this;
    
    ctx.strokeStyle = this.colors.pupils;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    
    switch (this.mouthState) {
      case 'happy':
        // Smiling mouth
        ctx.beginPath();
        ctx.arc(0, 8, 4, 0, Math.PI);
        ctx.stroke();
        break;
        
      case 'curious':
        // Small 'o' mouth
        ctx.fillStyle = this.colors.pupils;
        ctx.beginPath();
        ctx.ellipse(0, 8, 2, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'sleepy':
        // Wavy sleepy line
        ctx.beginPath();
        ctx.moveTo(-3, 8);
        ctx.quadraticCurveTo(0, 10, 3, 8);
        ctx.stroke();
        break;
        
      case 'excited':
        // Big smile with tongue
        ctx.beginPath();
        ctx.arc(0, 6, 6, 0, Math.PI);
        ctx.stroke();
        
        // Little tongue
        ctx.fillStyle = '#FFB6C1';
        ctx.beginPath();
        ctx.ellipse(0, 11, 1.5, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'focused':
        // Determined line with slight frown
        ctx.beginPath();
        ctx.arc(0, 10, 4, Math.PI, 0, true); // Upside down arc
        ctx.stroke();
        break;
    }
  }
  
  private drawWhiskers() {
    const { ctx } = this;
    
    ctx.strokeStyle = this.colors.whiskers;
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';
    
    const whiskerLength = 8;
    const whiskerY = 3;
    
    // Left whiskers
    ctx.beginPath();
    ctx.moveTo(-12, whiskerY - 2);
    ctx.lineTo(-12 - whiskerLength, whiskerY - 4);
    ctx.moveTo(-12, whiskerY);
    ctx.lineTo(-12 - whiskerLength, whiskerY);
    ctx.moveTo(-12, whiskerY + 2);
    ctx.lineTo(-12 - whiskerLength, whiskerY + 4);
    
    // Right whiskers
    ctx.moveTo(12, whiskerY - 2);
    ctx.lineTo(12 + whiskerLength, whiskerY - 4);
    ctx.moveTo(12, whiskerY);
    ctx.lineTo(12 + whiskerLength, whiskerY);
    ctx.moveTo(12, whiskerY + 2);
    ctx.lineTo(12 + whiskerLength, whiskerY + 4);
    
    ctx.stroke();
  }
  
  private drawCheeks() {
    const { ctx } = this;
    
    // Cute blush marks
    ctx.fillStyle = 'rgba(255, 105, 180, 0.3)';
    
    // Left cheek
    ctx.beginPath();
    ctx.ellipse(-12, 2, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Right cheek
    ctx.beginPath();
    ctx.ellipse(12, 2, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Public methods to change avatar state
  setMood(mood: 'happy' | 'curious' | 'sleepy' | 'excited' | 'focused') {
    this.mouthState = mood;
  }
  
  setHovered(hovered: boolean) {
    this.isHovered = hovered;
  }
  
  // Trigger a special animation
  doHappyDance() {
    const originalMood = this.mouthState;
    this.setMood('excited');
    setTimeout(() => this.setMood(originalMood), 2000);
  }
  
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }
  
  destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }
  
  // Get a static version (for performance when needed)
  getStaticImage(): string {
    // Draw one frame without animation
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.canvas.width;
    tempCanvas.height = this.canvas.height;
    const tempCtx = tempCanvas.getContext('2d')!;
    
    tempCtx.drawImage(this.canvas, 0, 0);
    return tempCanvas.toDataURL();
  }
}