import * as THREE from 'three'
import { Forest } from './Forest'
import { Campground } from './Campground'
import { AvatarManager } from './AvatarSprite'
import { MechanicalArm } from '../hud/MechanicalArm'
import { VRManager } from './VRManager'

export class IsometricScene {
  private scene: THREE.Scene
  private camera: THREE.OrthographicCamera
  private renderer: THREE.WebGLRenderer
  private clock: THREE.Clock
  private campground!: Campground
  private avatarManager!: AvatarManager
  private mechanicalArm!: MechanicalArm
  private raycaster: THREE.Raycaster
  private mouse: THREE.Vector2
  private draggedAvatar: any = null
  private isDragging: boolean = false
  private dragPlane: THREE.Plane
  private dragOffset: THREE.Vector3
  private hoveredAvatar: any = null
  private tooltip: HTMLElement
  private vrManager!: VRManager
  private isVRMode: boolean = false

  constructor() {
    this.clock = new THREE.Clock()
    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()
    this.dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    this.dragOffset = new THREE.Vector3()

    // Get tooltip element
    this.tooltip = document.getElementById('avatarTooltip')!

    // Create scene
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x87CEEB) // Sky blue
    this.scene.fog = new THREE.Fog(0x87CEEB, 20, 60) // Add depth with fog (closer range)

    // Create isometric camera
    const aspect = window.innerWidth / window.innerHeight
    const frustumSize = 20
    this.camera = new THREE.OrthographicCamera(
      -frustumSize * aspect / 2,
      frustumSize * aspect / 2,
      frustumSize / 2,
      -frustumSize / 2,
      0.1,
      1000
    )

    // Position camera for isometric view - looking down at the scene
    this.camera.position.set(15, 15, 15)
    this.camera.lookAt(0, 2, 0) // Look at a point slightly above ground

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap

    // Add renderer to DOM
    document.querySelector<HTMLDivElement>('#app')!.appendChild(this.renderer.domElement)

    // Setup lighting
    this.setupLighting()

    // Create ground
    this.createGround()

    // Create forest and campground
    new Forest(this.scene)  // Create forest (no need to store reference)
    this.campground = new Campground(this.scene)

    // Create and load avatars
    this.avatarManager = new AvatarManager(this.scene)
    this.avatarManager.createAvatars().then(() => {
      console.log('✨ Avatars are now floating in the campground!')
    })

    // Create mechanical HUD arm
    this.mechanicalArm = new MechanicalArm(this.scene)
    console.log('🦾 Mechanical HUD arm initialized')

    // Setup drag and drop event listeners
    this.setupDragAndDrop()

    // Setup keyboard controls for HUD arm
    this.setupHUDControls()

    // Initialize VR Manager
    this.vrManager = new VRManager(
      this.renderer,
      this.scene,
      this.onVRModeChange.bind(this)
    )
    console.log('🥽 VR Manager initialized')

    // Setup VR button
    this.setupVRButton()
  }

  private setupLighting() {
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    this.scene.add(ambientLight)

    // Directional light for shadows (sun)
    const sunLight = new THREE.DirectionalLight(0xffffff, 0.8)
    sunLight.position.set(10, 20, 10)
    sunLight.castShadow = true

    // Configure shadow camera
    sunLight.shadow.camera.left = -30
    sunLight.shadow.camera.right = 30
    sunLight.shadow.camera.top = 30
    sunLight.shadow.camera.bottom = -30
    sunLight.shadow.mapSize.width = 2048
    sunLight.shadow.mapSize.height = 2048

    this.scene.add(sunLight)
  }

  private createGround() {
    // Use a flat box for the ground instead of a plane
    const groundGeometry = new THREE.BoxGeometry(100, 0.5, 100, 15, 1, 15)
    const groundMaterial = new THREE.MeshLambertMaterial({
      color: 0x4a7c59,
      flatShading: true
    })

    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.position.y = -0.25 // Half the height below ground
    ground.receiveShadow = true
    ground.castShadow = true

    // Add some randomness to top vertices for terrain variation
    const positions = groundGeometry.attributes.position
    for (let i = 0; i < positions.count; i++) {
      const y = positions.getY(i)
      // Only modify top face vertices
      if (y > 0) {
        positions.setY(i, y + Math.random() * 0.5)
      }
    }
    positions.needsUpdate = true
    groundGeometry.computeVertexNormals()

    this.scene.add(ground)

    console.log('🏕️ Ground added at position:', ground.position)
  }

  public handleResize() {
    const aspect = window.innerWidth / window.innerHeight
    const frustumSize = 20

    this.camera.left = -frustumSize * aspect / 2
    this.camera.right = frustumSize * aspect / 2
    this.camera.top = frustumSize / 2
    this.camera.bottom = -frustumSize / 2

    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)

    // Update HUD arm camera
    if (this.mechanicalArm) {
      this.mechanicalArm.handleResize(window.innerWidth, window.innerHeight)
    }
  }

  public update() {
    const delta = this.clock.getDelta()
    const elapsedTime = this.clock.getElapsedTime()

    // Update campground animations (fire flickering, etc.)
    this.campground.update(elapsedTime)

    // Update floating avatars
    if (this.avatarManager) {
      this.avatarManager.update(elapsedTime)
    }

    // Update mechanical arm animations
    if (this.mechanicalArm) {
      this.mechanicalArm.update(delta)
    }

    // Update VR interactions (controller raycasting, etc.)
    if (this.vrManager) {
      this.vrManager.update()
    }
  }

  public render() {
    // In VR mode, renderer uses XR animation loop automatically
    // So we only render manually in non-VR mode
    if (!this.isVRMode) {
      // Render main scene
      this.renderer.render(this.scene, this.camera)

      // Render HUD overlay
      if (this.mechanicalArm) {
        this.mechanicalArm.render(this.renderer)
      }
    }
  }

  private setupDragAndDrop() {
    const canvas = this.renderer.domElement

    const onMouseDown = (event: MouseEvent) => {
      // Calculate mouse position in normalized device coordinates
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

      // Update raycaster
      this.raycaster.setFromCamera(this.mouse, this.camera)

      // Check for cabin click first
      const cabin = this.campground.getCabin()
      const cabinObjects: THREE.Object3D[] = []
      cabin.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          cabinObjects.push(child)
        }
      })

      const cabinIntersects = this.raycaster.intersectObjects(cabinObjects)
      if (cabinIntersects.length > 0) {
        // Clicked on cabin - open checklist panel
        event.stopPropagation() // Prevent close-panel logic from triggering
        const checklistPanel = document.getElementById('checklistPanel')
        if (checklistPanel) {
          const isAlreadyOpen = checklistPanel.classList.contains('active')
          // Close other panels
          document.querySelectorAll('.side-panel').forEach(panel => {
            panel.classList.remove('active')
          })
          // Toggle or open the checklist panel
          if (!isAlreadyOpen) {
            checklistPanel.classList.add('active')
          }
        }
        return // Don't check for other clicks
      }

      // Check for radio click
      const radio = this.campground.getRadio()
      const radioObjects: THREE.Object3D[] = []
      radio.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          radioObjects.push(child)
        }
      })

      const radioIntersects = this.raycaster.intersectObjects(radioObjects)
      if (radioIntersects.length > 0) {
        // Clicked on radio - open music panel
        event.stopPropagation() // Prevent close-panel logic from triggering
        const musicPanel = document.getElementById('musicPanel')
        if (musicPanel) {
          const isAlreadyOpen = musicPanel.classList.contains('active')
          // Close other panels
          document.querySelectorAll('.side-panel').forEach(panel => {
            panel.classList.remove('active')
          })
          // Toggle or open the music panel
          if (!isAlreadyOpen) {
            musicPanel.classList.add('active')
          }
        }
        return // Don't check for avatar clicks
      }

      // Get all avatar sprites
      const avatars = this.avatarManager.getAvatars()
      const sprites = avatars.map(avatar => avatar.getSprite())

      // Check for intersections
      const intersects = this.raycaster.intersectObjects(sprites)

      if (intersects.length > 0) {
        // Found an avatar!
        const sprite = intersects[0].object as THREE.Sprite
        const avatar = avatars.find(a => a.getSprite() === sprite)

        if (avatar) {
          this.draggedAvatar = avatar
          this.isDragging = true
          avatar.startDrag()

          // Calculate the drag plane at the avatar's current height
          this.dragPlane.constant = -sprite.position.y

          // Calculate offset between intersection point and avatar position
          const intersectPoint = new THREE.Vector3()
          this.raycaster.ray.intersectPlane(this.dragPlane, intersectPoint)
          this.dragOffset.copy(sprite.position).sub(intersectPoint)

          canvas.style.cursor = 'grabbing'
        }
      }
    }

    const onMouseMove = (event: MouseEvent) => {
      // Update mouse position
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

      // Update raycaster
      this.raycaster.setFromCamera(this.mouse, this.camera)

      if (this.isDragging && this.draggedAvatar) {
        // Handle dragging
        const intersectPoint = new THREE.Vector3()
        this.raycaster.ray.intersectPlane(this.dragPlane, intersectPoint)

        if (intersectPoint) {
          intersectPoint.add(this.dragOffset)
          this.draggedAvatar.setPosition(intersectPoint.x, intersectPoint.y, intersectPoint.z)
        }
      } else {
        // Handle hovering
        const avatars = this.avatarManager.getAvatars()
        const sprites = avatars.map(avatar => avatar.getSprite())
        const intersects = this.raycaster.intersectObjects(sprites)

        if (intersects.length > 0) {
          const sprite = intersects[0].object as THREE.Sprite
          const avatar = avatars.find(a => a.getSprite() === sprite)

          if (avatar && avatar !== this.hoveredAvatar) {
            this.hoveredAvatar = avatar
            this.tooltip.textContent = avatar.getName()
            this.tooltip.classList.add('visible')
            canvas.style.cursor = 'grab'
          }

          // Update tooltip position
          this.tooltip.style.left = `${event.clientX + 15}px`
          this.tooltip.style.top = `${event.clientY + 15}px`
        } else if (this.hoveredAvatar) {
          // No longer hovering
          this.hoveredAvatar = null
          this.tooltip.classList.remove('visible')
          canvas.style.cursor = 'default'
        } else {
          // Update tooltip position even when hovering nothing (for smooth transitions)
          this.tooltip.style.left = `${event.clientX + 15}px`
          this.tooltip.style.top = `${event.clientY + 15}px`
        }
      }
    }

    const onMouseUp = () => {
      if (this.isDragging && this.draggedAvatar) {
        this.draggedAvatar.endDrag()
        this.draggedAvatar = null
        this.isDragging = false
        canvas.style.cursor = 'default'
      }
    }

    const onMouseLeave = () => {
      onMouseUp() // Stop dragging if mouse leaves canvas

      // Hide tooltip when mouse leaves canvas
      if (this.hoveredAvatar) {
        this.hoveredAvatar = null
        this.tooltip.classList.remove('visible')
      }
    }

    canvas.addEventListener('mousedown', onMouseDown)
    canvas.addEventListener('mousemove', onMouseMove)
    canvas.addEventListener('mouseup', onMouseUp)
    canvas.addEventListener('mouseleave', onMouseLeave)
  }

  private setupHUDControls() {
    // Mechanical arm is now controlled by side panel opening/closing
    // No keyboard controls needed
  }

  public getMechanicalArm(): MechanicalArm {
    return this.mechanicalArm
  }

  public getScene(): THREE.Scene {
    return this.scene
  }

  public getRenderer(): THREE.WebGLRenderer {
    return this.renderer
  }

  public getVRManager(): VRManager {
    return this.vrManager
  }

  private setupVRButton() {
    const vrButton = document.getElementById('vrButton')
    if (!vrButton) {
      console.warn('VR button not found in DOM')
      return
    }

    vrButton.addEventListener('click', async () => {
      if (this.isVRMode) {
        // Exit VR
        await this.vrManager.exitVR()
      } else {
        // Enter VR
        const success = await this.vrManager.enterVR()
        if (!success) {
          console.error('Failed to enter VR mode')
        }
      }
    })

    console.log('🥽 VR button event listener attached')
  }

  private onVRModeChange(isVR: boolean) {
    this.isVRMode = isVR
    console.log(`VR mode ${isVR ? 'activated' : 'deactivated'}`)

    const vrButton = document.getElementById('vrButton')
    if (vrButton) {
      if (isVR) {
        vrButton.classList.add('in-vr')
        vrButton.textContent = '🚪' // Exit icon
        vrButton.title = 'Exit VR Mode'
      } else {
        vrButton.classList.remove('in-vr')
        vrButton.textContent = '🥽' // VR goggles icon
        vrButton.title = 'Enter VR Tabletop Mode'
      }
    }

    // Update tooltip
    const tooltip = document.querySelector('.vr-tooltip') as HTMLElement
    if (tooltip) {
      tooltip.textContent = isVR ? 'Exit VR' : 'Enter VR Tabletop'
    }
  }
}
