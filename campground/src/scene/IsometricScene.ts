import * as THREE from 'three'
import { Forest } from './Forest'
import { Campground } from './Campground'
import { AvatarManager } from './AvatarSprite'

export class IsometricScene {
  private scene: THREE.Scene
  private camera: THREE.OrthographicCamera
  private renderer: THREE.WebGLRenderer
  private clock: THREE.Clock
  private forest!: Forest
  private campground!: Campground
  private avatarManager!: AvatarManager

  constructor() {
    this.clock = new THREE.Clock()

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
    this.forest = new Forest(this.scene)
    this.campground = new Campground(this.scene)

    // Create and load avatars
    this.avatarManager = new AvatarManager(this.scene)
    this.avatarManager.createAvatars().then(() => {
      console.log('✨ Avatars are now floating in the campground!')
    })
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
  }

  public update() {
    const elapsedTime = this.clock.getElapsedTime()

    // Update campground animations (fire flickering, etc.)
    this.campground.update(elapsedTime)

    // Update floating avatars
    if (this.avatarManager) {
      this.avatarManager.update(elapsedTime)
    }
  }

  public render() {
    this.renderer.render(this.scene, this.camera)
  }

  public getScene(): THREE.Scene {
    return this.scene
  }
}
