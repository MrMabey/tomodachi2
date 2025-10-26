import * as THREE from 'three'

// Dynamically import avatar renderers
declare global {
  interface Window {
    AvatarRenderer: any
    DragonAvatar: any
    RobotAvatar: any
    GhostAvatar: any
    AlienAvatar: any
    PandaAvatar: any
    FlowBuddyAvatar: any
  }
}

export class AvatarSprite {
  private sprite: THREE.Sprite
  private avatarRenderer: any
  private canvasTexture: THREE.CanvasTexture
  private velocity: THREE.Vector3
  private bounds = { x: 15, z: 15 }
  private targetHeight: number

  constructor(scene: THREE.Scene, avatarClass: any, position: THREE.Vector3) {
    // Create avatar renderer instance
    this.avatarRenderer = new avatarClass(80)
    const canvas = this.avatarRenderer.getCanvas()

    // Create texture from canvas
    this.canvasTexture = new THREE.CanvasTexture(canvas)
    this.canvasTexture.needsUpdate = true

    // Create sprite material
    const spriteMaterial = new THREE.SpriteMaterial({
      map: this.canvasTexture,
      transparent: true,
      alphaTest: 0.1
    })

    // Create sprite
    this.sprite = new THREE.Sprite(spriteMaterial)
    this.sprite.position.copy(position)
    this.sprite.scale.set(2, 2, 1) // Size of the sprite in 3D space

    scene.add(this.sprite)

    // Random velocity for floating movement
    this.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.02,
      0,
      (Math.random() - 0.5) * 0.02
    )

    // Random target height for bobbing
    this.targetHeight = 2 + Math.random() * 3
  }

  public update(time: number) {
    // Update canvas texture (for animation)
    this.canvasTexture.needsUpdate = true

    // Floating movement
    this.sprite.position.x += this.velocity.x
    this.sprite.position.z += this.velocity.z

    // Bounce off boundaries
    if (Math.abs(this.sprite.position.x) > this.bounds.x) {
      this.velocity.x *= -1
      this.sprite.position.x = Math.sign(this.sprite.position.x) * this.bounds.x
    }
    if (Math.abs(this.sprite.position.z) > this.bounds.z) {
      this.velocity.z *= -1
      this.sprite.position.z = Math.sign(this.sprite.position.z) * this.bounds.z
    }

    // Gentle bobbing motion
    this.sprite.position.y = this.targetHeight + Math.sin(time * 0.5 + this.sprite.position.x) * 0.3
  }

  public setMood(mood: string) {
    if (this.avatarRenderer && this.avatarRenderer.setMood) {
      this.avatarRenderer.setMood(mood)
    }
  }

  public destroy() {
    if (this.avatarRenderer && this.avatarRenderer.destroy) {
      this.avatarRenderer.destroy()
    }
    this.canvasTexture.dispose()
    this.sprite.material.dispose()
  }
}

export class AvatarManager {
  private avatars: AvatarSprite[] = []
  private scriptsLoaded = false

  constructor(private scene: THREE.Scene) {}

  async loadAvatarScripts() {
    if (this.scriptsLoaded) return

    // Load all avatar scripts with cache busting
    const version = Date.now(); // Cache buster
    const scripts = [
      '/avatars/avatar-renderer.js',
      '/avatars/dragon-avatar.js',
      '/avatars/robot-avatar.js',
      '/avatars/ghost-avatar.js',
      '/avatars/alien-avatar.js',
      '/avatars/panda-avatar.js',
      `/avatars/flow-buddy-avatar.js?v=${version}`
    ]

    for (const src of scripts) {
      await this.loadScript(src)
    }

    this.scriptsLoaded = true
    console.log('🎨 Avatar scripts loaded!')
  }

  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = src
      script.onload = () => resolve()
      script.onerror = () => reject(new Error(`Failed to load ${src}`))
      document.head.appendChild(script)
    })
  }

  async createAvatars() {
    await this.loadAvatarScripts()

    // Create different avatar types at random positions
    const avatarTypes = [
      { class: window.AvatarRenderer, pos: new THREE.Vector3(-5, 3, -5) },
      { class: window.DragonAvatar, pos: new THREE.Vector3(5, 4, -5) },
      { class: window.RobotAvatar, pos: new THREE.Vector3(-5, 3, 5) },
      { class: window.GhostAvatar, pos: new THREE.Vector3(5, 4, 5) },
      { class: window.AlienAvatar, pos: new THREE.Vector3(0, 5, -8) },
      { class: window.PandaAvatar, pos: new THREE.Vector3(-8, 3, 0) },
      { class: window.FlowBuddyAvatar, pos: new THREE.Vector3(8, 4, 0) }
    ]

    for (const { class: AvatarClass, pos } of avatarTypes) {
      if (AvatarClass) {
        const avatar = new AvatarSprite(this.scene, AvatarClass, pos)
        this.avatars.push(avatar)
      }
    }

    console.log(`🎭 Created ${this.avatars.length} floating avatars!`)
  }

  public update(time: number) {
    this.avatars.forEach(avatar => avatar.update(time))
  }

  public destroy() {
    this.avatars.forEach(avatar => avatar.destroy())
    this.avatars = []
  }
}
