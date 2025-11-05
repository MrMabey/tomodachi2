import * as THREE from 'three'

export type HUDTint = 'orange' | 'green' | 'yellow' | 'clear' | 'white'

export class MechanicalArm {
  private hudScene: THREE.Scene
  private hudCamera: THREE.OrthographicCamera
  private armGroup: THREE.Group
  private baseJoint!: THREE.Mesh
  private lowerArm!: THREE.Mesh
  private upperArm!: THREE.Mesh
  private projectorHead!: THREE.Mesh
  private beamLight!: THREE.Mesh
  private scanLine!: THREE.Mesh
  private hudWindow!: THREE.Mesh
  private particleSystem!: THREE.Points
  private isDeployed: boolean = false
  private currentTint: HUDTint = 'clear'

  // Animation state
  private deployProgress: number = 0
  private targetDeploy: number = 0
  private glowPhase: number = 0
  private renderCallCount: number = 0

  // Colors for different tints
  private tintColors: Record<HUDTint, THREE.Color> = {
    orange: new THREE.Color(0xff8800),
    green: new THREE.Color(0x00ff88),
    yellow: new THREE.Color(0xffff00),
    clear: new THREE.Color(0x88ccff),
    white: new THREE.Color(0xffffff),
  }

  constructor(_scene: THREE.Scene) {
    // Create separate HUD scene and camera for screen-space overlay
    this.hudScene = new THREE.Scene()

    // Orthographic camera for screen-space HUD (matches screen coordinates)
    const aspect = window.innerWidth / window.innerHeight
    const frustumSize = 10
    this.hudCamera = new THREE.OrthographicCamera(
      -frustumSize * aspect,
      frustumSize * aspect,
      frustumSize,
      -frustumSize,
      0.1,
      100
    )
    this.hudCamera.position.set(0, 0, 10)
    this.hudCamera.lookAt(0, 0, 0)

    // Add lighting to HUD scene
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    this.hudScene.add(ambientLight)
    const hudLight = new THREE.DirectionalLight(0xffffff, 0.8)
    hudLight.position.set(5, 5, 10)
    this.hudScene.add(hudLight)

    this.armGroup = new THREE.Group()

    // Position at bottom of side panel (left side of screen)
    // Will be attached to panel bottom when panel is active
    this.armGroup.position.set(-20.5, -9, 0)

    // Scale down for panel attachment
    this.armGroup.scale.set(2, 2, 2)

    this.createBaseJoint()
    this.createLowerArm()
    this.createUpperArm()
    this.createProjectorHead()
    this.createBeam()
    this.createHUDWindow()
    this.createParticles()

    this.hudScene.add(this.armGroup)

    console.log('🦾 HUD Arm initialized (attached to side panel)')

    // Start retracted - will deploy when panel opens
    this.retract()
  }

  private createBaseJoint(): void {
    // Cylindrical base mount with mechanical details
    const baseGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.3, 8)
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x111111,
    })
    this.baseJoint = new THREE.Mesh(baseGeometry, baseMaterial)

    // Add detail rings
    const ringGeometry = new THREE.TorusGeometry(0.18, 0.02, 8, 16)
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0xff4400,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0xff2200,
      emissiveIntensity: 0.3,
    })
    const ring1 = new THREE.Mesh(ringGeometry, ringMaterial)
    ring1.rotation.y = Math.PI / 2
    this.baseJoint.add(ring1)

    this.armGroup.add(this.baseJoint)
  }

  private createLowerArm(): void {
    // Main arm segment - rectangular with chamfered edges
    const armGroup = new THREE.Group()

    // Main body
    const bodyGeometry = new THREE.BoxGeometry(1.5, 0.12, 0.15)
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x444444,
      metalness: 0.7,
      roughness: 0.3,
    })
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
    body.position.x = 0.75
    armGroup.add(body)

    // Glowing tech strips
    const stripGeometry = new THREE.BoxGeometry(1.4, 0.08, 0.02)
    const stripMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 0.5,
      metalness: 1.0,
      roughness: 0.1,
    })
    const strip1 = new THREE.Mesh(stripGeometry, stripMaterial)
    strip1.position.set(0.75, 0, 0.08)
    armGroup.add(strip1)

    // Add hydraulic cylinders
    const hydraulicGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.2, 8)
    const hydraulicMaterial = new THREE.MeshStandardMaterial({
      color: 0x666666,
      metalness: 0.8,
      roughness: 0.2,
    })
    const hydraulic = new THREE.Mesh(hydraulicGeometry, hydraulicMaterial)
    hydraulic.rotation.z = Math.PI / 2
    hydraulic.position.set(0.4, 0.08, 0)
    armGroup.add(hydraulic)

    this.lowerArm = body
    this.baseJoint.add(armGroup)
  }

  private createUpperArm(): void {
    const armGroup = new THREE.Group()
    armGroup.position.x = 1.5

    // Upper arm segment
    const bodyGeometry = new THREE.BoxGeometry(1.2, 0.1, 0.12)
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x555555,
      metalness: 0.7,
      roughness: 0.3,
    })
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
    body.position.x = 0.6
    armGroup.add(body)

    // Joint sphere
    const jointGeometry = new THREE.SphereGeometry(0.1, 16, 16)
    const jointMaterial = new THREE.MeshStandardMaterial({
      color: 0x222222,
      metalness: 0.9,
      roughness: 0.1,
    })
    const joint = new THREE.Mesh(jointGeometry, jointMaterial)
    armGroup.add(joint)

    this.upperArm = body
    this.baseJoint.add(armGroup)
  }

  private createProjectorHead(): void {
    const headGroup = new THREE.Group()
    headGroup.position.x = 2.7

    // Projector housing - trapezoidal
    const headGeometry = new THREE.ConeGeometry(0.15, 0.3, 4)
    const headMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x004488,
      emissiveIntensity: 0.2,
    })
    this.projectorHead = new THREE.Mesh(headGeometry, headMaterial)
    this.projectorHead.rotation.z = Math.PI / 2
    headGroup.add(this.projectorHead)

    // Lens with glow
    const lensGeometry = new THREE.CircleGeometry(0.12, 32)
    const lensMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ccff,
      emissive: 0x00ccff,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.7,
    })
    const lens = new THREE.Mesh(lensGeometry, lensMaterial)
    lens.position.x = 0.16
    headGroup.add(lens)

    // Add point light from projector
    const projectorLight = new THREE.PointLight(0x00ccff, 1, 5)
    projectorLight.position.x = 0.2
    headGroup.add(projectorLight)

    this.baseJoint.add(headGroup)
  }

  private createBeam(): void {
    // Holographic projection beam pointing toward side panel
    // Shorter beam to just reach the panel
    const beamGeometry = new THREE.PlaneGeometry(4, 0.05)
    const beamMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 1.0,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    })
    this.beamLight = new THREE.Mesh(beamGeometry, beamMaterial)
    this.beamLight.position.set(2.5, 0, 0.2)
    this.armGroup.add(this.beamLight)

    // Add animated scan lines
    const scanLineGeometry = new THREE.PlaneGeometry(4, 0.01)
    const scanLineMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 2.0,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    })
    this.scanLine = new THREE.Mesh(scanLineGeometry, scanLineMaterial)
    this.scanLine.position.y = 0.15
    this.beamLight.add(this.scanLine)
  }

  private createHUDWindow(): void {
    // No separate window - the side panel IS the holographic projection
    // Create an invisible placeholder for compatibility
    const windowGeometry = new THREE.PlaneGeometry(0.1, 0.1)
    const windowMaterial = new THREE.MeshStandardMaterial({
      transparent: true,
      opacity: 0,
    })
    this.hudWindow = new THREE.Mesh(windowGeometry, windowMaterial)
    this.hudWindow.visible = false
    this.armGroup.add(this.hudWindow)
  }

  private createParticles(): void {
    // Digital particles flowing upward toward the panel
    const particleCount = 150  // More particles for consistent flow
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 4        // X: match beam width (4 units wide)
      positions[i * 3 + 1] = Math.random() * 8 - 4        // Y: flowing upward (start from -4 to 4)
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.3  // Z: depth variation

      colors[i * 3] = 0
      colors[i * 3 + 1] = 1
      colors[i * 3 + 2] = 1
    }

    const particleGeometry = new THREE.BufferGeometry()
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    })

    this.particleSystem = new THREE.Points(particleGeometry, particleMaterial)
    this.particleSystem.position.set(2.7, 4, 0.2)  // Moved up by 2 units
    this.armGroup.add(this.particleSystem)
  }

  public deploy(): void {
    this.isDeployed = true
    this.targetDeploy = 1
  }

  public retract(): void {
    this.isDeployed = false
    this.targetDeploy = 0
  }

  public toggle(): void {
    if (this.isDeployed) {
      this.retract()
    } else {
      this.deploy()
    }
  }

  public setTint(tint: HUDTint): void {
    this.currentTint = tint
    const color = this.tintColors[tint]

    // Update HUD window tint
    if (this.hudWindow.material instanceof THREE.MeshStandardMaterial) {
      this.hudWindow.material.color.copy(color)
      this.hudWindow.material.emissive.copy(color).multiplyScalar(0.3)
    }

    // Update beam color
    if (this.beamLight.material instanceof THREE.MeshStandardMaterial) {
      this.beamLight.material.color.copy(color)
      this.beamLight.material.emissive.copy(color)
    }

    // Update particle colors
    const colors = this.particleSystem.geometry.attributes.color as THREE.BufferAttribute
    for (let i = 0; i < colors.count; i++) {
      colors.setXYZ(i, color.r, color.g, color.b)
    }
    colors.needsUpdate = true
  }

  public update(deltaTime: number): void {
    // Smooth deployment animation
    const deploySpeed = 2.0
    if (this.deployProgress < this.targetDeploy) {
      this.deployProgress = Math.min(1, this.deployProgress + deltaTime * deploySpeed)
    } else if (this.deployProgress > this.targetDeploy) {
      this.deployProgress = Math.max(0, this.deployProgress - deltaTime * deploySpeed)
    }

    // Eased deployment using cubic easing
    const eased = this.easeOutCubic(this.deployProgress)

    // Rotate arm out from base - swinging from vertical (up) to horizontal (right)
    // Start at +90 degrees (pointing up/north), rotate to 0 degrees (pointing right/east)
    this.baseJoint.rotation.z = (Math.PI / 2) - (eased * Math.PI / 2)

    // Animate glow effect
    this.glowPhase += deltaTime * 2
    const glowIntensity = 0.5 + Math.sin(this.glowPhase) * 0.3

    // Update emissive intensity on glowing parts
    if (this.beamLight.material instanceof THREE.MeshStandardMaterial) {
      this.beamLight.material.emissiveIntensity = glowIntensity * eased
      this.beamLight.material.opacity = 0.6 * eased
    }

    if (this.hudWindow.material instanceof THREE.MeshStandardMaterial) {
      this.hudWindow.material.opacity = 0.15 * eased
      this.hudWindow.material.emissiveIntensity = 0.2 * glowIntensity * eased
    }

    // Make the HUD window, frame, and scan line fully transparent when retracted
    this.hudWindow.visible = eased > 0.01
    this.scanLine.visible = eased > 0.01

    // Animate particles flowing upward toward the panel
    const positions = this.particleSystem.geometry.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < positions.count; i++) {
      let y = positions.getY(i)
      y += deltaTime * 2 // Move particles upward
      if (y > 4) y = -4 // Reset to bottom when reaching top
      positions.setY(i, y)
    }
    positions.needsUpdate = true

    // Particle system visibility based on deployment
    if (this.particleSystem.material instanceof THREE.PointsMaterial) {
      this.particleSystem.material.opacity = 0.8 * eased
    }

    // Mechanical servo jitter (subtle)
    if (eased > 0 && eased < 1) {
      const jitter = Math.sin(this.glowPhase * 10) * 0.002
      this.lowerArm.rotation.z = jitter
      this.upperArm.rotation.z = -jitter * 0.5
    }
  }

  private easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3)
  }

  public getIsDeployed(): boolean {
    return this.isDeployed
  }

  public getCurrentTint(): HUDTint {
    return this.currentTint
  }

  public render(renderer: THREE.WebGLRenderer): void {
    // Render HUD scene on top of main scene
    renderer.autoClear = false
    renderer.clearDepth() // Clear depth buffer so HUD renders on top
    renderer.render(this.hudScene, this.hudCamera)
    renderer.autoClear = true

    // Debug logging (only log first 10 calls)
    this.renderCallCount++
    if (this.renderCallCount <= 10) {
      console.log(`🦾 HUD Render call #${this.renderCallCount}, deployed: ${this.isDeployed}, progress: ${this.deployProgress.toFixed(2)}`)
    }
  }

  public handleResize(width: number, height: number): void {
    const aspect = width / height
    const frustumSize = 10

    this.hudCamera.left = -frustumSize * aspect
    this.hudCamera.right = frustumSize * aspect
    this.hudCamera.top = frustumSize
    this.hudCamera.bottom = -frustumSize

    this.hudCamera.updateProjectionMatrix()
  }

  public getHUDScene(): THREE.Scene {
    return this.hudScene
  }

  public getHUDCamera(): THREE.OrthographicCamera {
    return this.hudCamera
  }
}
