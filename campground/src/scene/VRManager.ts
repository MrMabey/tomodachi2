import * as THREE from 'three'

/**
 * VRManager handles WebXR session management for tabletop VR view
 */
export class VRManager {
  private renderer: THREE.WebGLRenderer
  private scene: THREE.Scene
  private vrCamera: THREE.PerspectiveCamera
  private xrSession: XRSession | null = null
  private isVRMode: boolean = false
  private tabletopGroup: THREE.Group
  private controllers: THREE.Group[] = []
  private controllerRays: THREE.Line[] = []
  private controllerRaycasters: THREE.Raycaster[] = []
  private onVRModeChange?: (isVR: boolean) => void
  private highlightedObject: THREE.Object3D | null = null

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    onVRModeChange?: (isVR: boolean) => void
  ) {
    this.renderer = renderer
    this.scene = scene
    this.onVRModeChange = onVRModeChange

    // Create VR camera (perspective for VR mode)
    this.vrCamera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.01,
      100
    )
    this.vrCamera.position.set(0, 1.6, 0) // Average eye height

    // Create tabletop group to scale and position the scene
    this.tabletopGroup = new THREE.Group()
    this.tabletopGroup.name = 'VR_Tabletop'
    this.scene.add(this.tabletopGroup)

    // Move all existing scene children into the tabletop group
    // BUT skip lights and cameras
    const sceneChildren = [...this.scene.children]
    for (const child of sceneChildren) {
      if (
        child !== this.tabletopGroup &&
        !(child instanceof THREE.Light) &&
        !(child instanceof THREE.Camera) &&
        child.type !== 'HUD' // Skip HUD elements
      ) {
        this.scene.remove(child)
        this.tabletopGroup.add(child)
      }
    }

    // Scale down to tabletop size (campground becomes ~1 meter wide)
    this.tabletopGroup.scale.setScalar(0.05) // 20x smaller

    // Position in front of user at comfortable viewing height
    this.tabletopGroup.position.set(0, 0.8, -1.5) // On a table ~80cm high, 1.5m away

    console.log(`📦 Tabletop group created with ${this.tabletopGroup.children.length} objects`)

    // Enable XR
    this.renderer.xr.enabled = true
  }

  /**
   * Check if WebXR is supported in this browser
   */
  public async isWebXRSupported(): Promise<boolean> {
    if (!navigator.xr) {
      console.warn('WebXR not supported in this browser')
      return false
    }

    try {
      const supported = await navigator.xr.isSessionSupported('immersive-vr')
      return supported
    } catch (error) {
      console.error('Error checking WebXR support:', error)
      return false
    }
  }

  /**
   * Enter VR mode
   */
  public async enterVR(): Promise<boolean> {
    if (this.isVRMode) {
      console.warn('Already in VR mode')
      return true
    }

    const supported = await this.isWebXRSupported()
    if (!supported) {
      alert('WebXR not supported. Please use a VR-capable browser.')
      return false
    }

    try {
      // Request VR session
      const session = await navigator.xr!.requestSession('immersive-vr', {
        optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking']
      })

      this.xrSession = session

      // Setup XR session
      await this.renderer.xr.setSession(session)

      // Setup controllers
      this.setupControllers()

      // Handle session end
      session.addEventListener('end', () => {
        this.exitVR()
      })

      this.isVRMode = true
      if (this.onVRModeChange) {
        this.onVRModeChange(true)
      }

      console.log('✨ Entered VR mode - Tabletop view active!')
      return true
    } catch (error) {
      console.error('Failed to enter VR:', error)
      alert('Failed to start VR session. Make sure your VR headset is connected.')
      return false
    }
  }

  /**
   * Exit VR mode
   */
  public async exitVR(): Promise<void> {
    if (!this.isVRMode) {
      return
    }

    if (this.xrSession) {
      await this.xrSession.end()
      this.xrSession = null
    }

    // Clean up controllers
    this.cleanupControllers()

    this.isVRMode = false
    if (this.onVRModeChange) {
      this.onVRModeChange(false)
    }

    console.log('👋 Exited VR mode')
  }

  /**
   * Setup VR controllers with visual rays
   */
  private setupControllers(): void {
    // Controller 0 (usually right hand)
    const controller0 = this.renderer.xr.getController(0)
    controller0.addEventListener('selectstart', this.onSelectStart.bind(this))
    controller0.addEventListener('selectend', this.onSelectEnd.bind(this))
    this.scene.add(controller0)
    this.controllers.push(controller0)

    // Controller 1 (usually left hand)
    const controller1 = this.renderer.xr.getController(1)
    controller1.addEventListener('selectstart', this.onSelectStart.bind(this))
    controller1.addEventListener('selectend', this.onSelectEnd.bind(this))
    this.scene.add(controller1)
    this.controllers.push(controller1)

    // Add visual rays to controllers
    const rayGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -3) // 3 meter ray
    ])

    for (const controller of this.controllers) {
      // Create ray with dynamic color
      const rayMaterial = new THREE.LineBasicMaterial({
        color: 0x00ffff,
        linewidth: 2,
        opacity: 0.8,
        transparent: true
      })
      const ray = new THREE.Line(rayGeometry, rayMaterial)
      controller.add(ray)
      this.controllerRays.push(ray)

      // Create raycaster for interaction
      const raycaster = new THREE.Raycaster()
      raycaster.far = 3 // 3 meter range
      this.controllerRaycasters.push(raycaster)

      // Add a small sphere at the tip for visual feedback
      const tipGeometry = new THREE.SphereGeometry(0.01, 8, 8)
      const tipMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff })
      const tip = new THREE.Mesh(tipGeometry, tipMaterial)
      tip.position.set(0, 0, -3)
      controller.add(tip)
    }

    console.log('🎮 VR controllers initialized with raycasting')
  }

  /**
   * Clean up VR controllers
   */
  private cleanupControllers(): void {
    for (const controller of this.controllers) {
      this.scene.remove(controller)
    }
    this.controllers = []
    this.controllerRays = []
  }

  /**
   * Handle controller select start (trigger press)
   */
  private onSelectStart(event: any): void {
    const controller = event.target
    console.log('🎯 Controller trigger pressed')

    // Find which controller triggered
    const controllerIndex = this.controllers.indexOf(controller)
    if (controllerIndex === -1) return

    // Check if pointing at an interactable object
    const raycaster = this.controllerRaycasters[controllerIndex]
    const intersects = raycaster.intersectObjects(this.tabletopGroup.children, true)

    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object
      console.log('🎯 Hit object:', intersectedObject.name || intersectedObject.type)

      // Change ray color to indicate selection
      const ray = this.controllerRays[controllerIndex]
      if (ray.material instanceof THREE.LineBasicMaterial) {
        ray.material.color.setHex(0x00ff00) // Green when selecting
      }

      // TODO: Implement object-specific interactions
      // - Avatars: Pick up and move
      // - Campfire: Toggle fire effect
      // - Radio: Play music
      // - Cabin: Open checklist
    }
  }

  /**
   * Handle controller select end (trigger release)
   */
  private onSelectEnd(event: any): void {
    const controller = event.target
    console.log('🎯 Controller trigger released')

    // Reset ray color
    const controllerIndex = this.controllers.indexOf(controller)
    if (controllerIndex !== -1) {
      const ray = this.controllerRays[controllerIndex]
      if (ray.material instanceof THREE.LineBasicMaterial) {
        ray.material.color.setHex(0x00ffff) // Back to cyan
      }
    }
  }

  /**
   * Update VR-related elements (called every frame)
   */
  public update(): void {
    if (!this.isVRMode) {
      return
    }

    // Update raycasting for each controller
    for (let i = 0; i < this.controllers.length; i++) {
      const controller = this.controllers[i]
      const raycaster = this.controllerRaycasters[i]
      const ray = this.controllerRays[i]

      // Setup raycaster from controller position and direction
      const tempMatrix = new THREE.Matrix4()
      tempMatrix.identity().extractRotation(controller.matrixWorld)

      raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld)
      raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix)

      // Check for intersections
      const intersects = raycaster.intersectObjects(this.tabletopGroup.children, true)

      // Update ray color based on what we're pointing at
      if (ray.material instanceof THREE.LineBasicMaterial) {
        if (intersects.length > 0) {
          // Hovering over an object - make ray yellow
          ray.material.color.setHex(0xffff00)
          ray.material.opacity = 1.0

          // Highlight the object
          const intersectedObject = intersects[0].object
          if (intersectedObject !== this.highlightedObject) {
            // Remove previous highlight
            if (this.highlightedObject && (this.highlightedObject as any).material) {
              const mat = (this.highlightedObject as any).material
              if (mat.emissive) {
                mat.emissive.setHex(mat.userData.originalEmissive || 0x000000)
              }
            }

            // Add new highlight
            if ((intersectedObject as any).material) {
              const mat = (intersectedObject as any).material
              if (mat.emissive) {
                mat.userData.originalEmissive = mat.emissive.getHex()
                mat.emissive.setHex(0x444444) // Subtle highlight
              }
            }

            this.highlightedObject = intersectedObject
          }
        } else {
          // Not pointing at anything - cyan ray
          ray.material.color.setHex(0x00ffff)
          ray.material.opacity = 0.6

          // Remove highlight
          if (this.highlightedObject && (this.highlightedObject as any).material) {
            const mat = (this.highlightedObject as any).material
            if (mat.emissive) {
              mat.emissive.setHex(mat.userData.originalEmissive || 0x000000)
            }
          }
          this.highlightedObject = null
        }
      }
    }
  }

  /**
   * Get the VR camera
   */
  public getCamera(): THREE.PerspectiveCamera {
    return this.vrCamera
  }

  /**
   * Get tabletop group for positioning adjustments
   */
  public getTabletopGroup(): THREE.Group {
    return this.tabletopGroup
  }

  /**
   * Check if currently in VR mode
   */
  public isInVRMode(): boolean {
    return this.isVRMode
  }

  /**
   * Get controllers for interaction
   */
  public getControllers(): THREE.Group[] {
    return this.controllers
  }

  /**
   * Adjust tabletop position (useful for user preference)
   */
  public adjustTabletopPosition(x: number, y: number, z: number): void {
    this.tabletopGroup.position.set(x, y, z)
  }

  /**
   * Adjust tabletop scale (useful for user preference)
   */
  public adjustTabletopScale(scale: number): void {
    this.tabletopGroup.scale.setScalar(scale)
  }
}
