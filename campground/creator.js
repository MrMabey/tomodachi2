import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

// Scene setup
let scene, camera, renderer, controls
let currentAsset = null
let animationId = null
let currentAssetType = '3d-object'

// Initialize Three.js scene
function initScene() {
    // Scene
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0x1a1a2e)
    scene.fog = new THREE.Fog(0x1a1a2e, 10, 50)

    // Camera
    const canvas = document.getElementById('preview-canvas')
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.set(5, 5, 5)
    camera.lookAt(0, 0, 0)

    // Renderer
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: false
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    // Controls
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.minDistance = 2
    controls.maxDistance = 20

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 10, 5)
    directionalLight.castShadow = true
    directionalLight.shadow.camera.near = 0.1
    directionalLight.shadow.camera.far = 50
    directionalLight.shadow.camera.left = -10
    directionalLight.shadow.camera.right = 10
    directionalLight.shadow.camera.top = 10
    directionalLight.shadow.camera.bottom = -10
    scene.add(directionalLight)

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(20, 20)
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a3e,
        roughness: 0.8,
        metalness: 0.2
    })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -1
    ground.receiveShadow = true
    scene.add(ground)

    // Grid helper
    const gridHelper = new THREE.GridHelper(20, 20, 0x4a4a5e, 0x2a2a3e)
    gridHelper.position.y = -0.99
    scene.add(gridHelper)

    // Handle window resize
    window.addEventListener('resize', onWindowResize)

    // Start animation loop
    animate()
}

function onWindowResize() {
    const canvas = document.getElementById('preview-canvas')
    const width = canvas.clientWidth
    const height = canvas.clientHeight

    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
}

function animate() {
    animationId = requestAnimationFrame(animate)

    // Rotate animated objects
    if (currentAsset && currentAsset.userData.animated) {
        currentAsset.rotation.y += 0.01
    }

    // Update particle systems
    if (currentAsset && currentAsset.userData.isParticleSystem) {
        updateParticles(currentAsset)
    }

    controls.update()
    renderer.render(scene, camera)
}

// Create 3D Object
function create3DObject() {
    const geometryType = document.getElementById('geometryType').value
    const scale = parseFloat(document.getElementById('scaleSlider').value)
    const color = document.getElementById('objectColor').value
    const materialType = document.getElementById('materialType').value
    const castShadow = document.getElementById('castShadow').checked
    const animated = document.getElementById('animated').checked

    // Remove previous asset
    if (currentAsset) {
        scene.remove(currentAsset)
    }

    // Create geometry
    let geometry
    switch (geometryType) {
        case 'box':
            geometry = new THREE.BoxGeometry(1, 1, 1)
            break
        case 'sphere':
            geometry = new THREE.SphereGeometry(0.5, 32, 32)
            break
        case 'cylinder':
            geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32)
            break
        case 'cone':
            geometry = new THREE.ConeGeometry(0.5, 1, 32)
            break
        case 'torus':
            geometry = new THREE.TorusGeometry(0.5, 0.2, 16, 100)
            break
        case 'dodecahedron':
            geometry = new THREE.DodecahedronGeometry(0.5, 0)
            break
        case 'octahedron':
            geometry = new THREE.OctahedronGeometry(0.5, 0)
            break
        case 'tetrahedron':
            geometry = new THREE.TetrahedronGeometry(0.5, 0)
            break
    }

    // Create material
    let material
    const materialColor = new THREE.Color(color)
    switch (materialType) {
        case 'standard':
            material = new THREE.MeshStandardMaterial({
                color: materialColor,
                roughness: 0.5,
                metalness: 0.5
            })
            break
        case 'phong':
            material = new THREE.MeshPhongMaterial({
                color: materialColor,
                shininess: 100
            })
            break
        case 'lambert':
            material = new THREE.MeshLambertMaterial({
                color: materialColor
            })
            break
        case 'basic':
            material = new THREE.MeshBasicMaterial({
                color: materialColor
            })
            break
    }

    // Create mesh
    const mesh = new THREE.Mesh(geometry, material)
    mesh.scale.set(scale, scale, scale)
    mesh.castShadow = castShadow
    mesh.receiveShadow = true
    mesh.userData.animated = animated

    scene.add(mesh)
    currentAsset = mesh

    // Update preview info
    updatePreviewInfo(geometry, '3D Object')
}

// Create Avatar
function createAvatar() {
    const canvasSize = parseInt(document.getElementById('canvasSize').value)
    const code = document.getElementById('avatarCode').value

    // Remove previous asset
    if (currentAsset) {
        scene.remove(currentAsset)
    }

    // Create canvas
    const canvas = document.createElement('canvas')
    canvas.width = canvasSize
    canvas.height = canvasSize
    const ctx = canvas.getContext('2d')

    // Execute custom drawing code
    try {
        const drawFunction = new Function('canvas', 'ctx', code)
        drawFunction(canvas, ctx)
    } catch (error) {
        showToast('Error in avatar code: ' + error.message, 'error')
        console.error('Avatar code error:', error)
        return
    }

    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true

    // Create sprite
    const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true
    })
    const sprite = new THREE.Sprite(spriteMaterial)
    sprite.scale.set(2, 2, 1)

    scene.add(sprite)
    currentAsset = sprite

    // Update preview info
    document.getElementById('previewType').textContent = 'Avatar Sprite'
    document.getElementById('previewVertices').textContent = `Canvas: ${canvasSize}x${canvasSize}`
    document.getElementById('previewFaces').textContent = 'Type: Canvas2D'
}

// Create Particle System
function createParticleSystem() {
    const particleCount = parseInt(document.getElementById('particleCount').value)
    const particleColor = document.getElementById('particleColor').value
    const particleSize = parseFloat(document.getElementById('particleSize').value)
    const particleSpeed = parseFloat(document.getElementById('particleSpeed').value)

    // Remove previous asset
    if (currentAsset) {
        scene.remove(currentAsset)
    }

    // Create particle geometry
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const velocities = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount * 3; i += 3) {
        // Random position in a sphere
        const radius = Math.random() * 2
        const theta = Math.random() * Math.PI * 2
        const phi = Math.random() * Math.PI

        positions[i] = radius * Math.sin(phi) * Math.cos(theta)
        positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta)
        positions[i + 2] = radius * Math.cos(phi)

        // Random velocity
        velocities[i] = (Math.random() - 0.5) * particleSpeed * 0.01
        velocities[i + 1] = (Math.random() - 0.5) * particleSpeed * 0.01
        velocities[i + 2] = (Math.random() - 0.5) * particleSpeed * 0.01
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    // Create particle material
    const material = new THREE.PointsMaterial({
        color: new THREE.Color(particleColor),
        size: particleSize,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    })

    // Create particle system
    const particles = new THREE.Points(geometry, material)
    particles.userData.isParticleSystem = true
    particles.userData.velocities = velocities
    particles.userData.particleSpeed = particleSpeed

    scene.add(particles)
    currentAsset = particles

    // Update preview info
    document.getElementById('previewType').textContent = 'Particle System'
    document.getElementById('previewVertices').textContent = `Particles: ${particleCount}`
    document.getElementById('previewFaces').textContent = `Speed: ${particleSpeed}`
}

// Update particle positions
function updateParticles(particleSystem) {
    const positions = particleSystem.geometry.attributes.position.array
    const velocities = particleSystem.userData.velocities
    const speed = particleSystem.userData.particleSpeed || 0.5

    for (let i = 0; i < positions.length; i += 3) {
        positions[i] += velocities[i]
        positions[i + 1] += velocities[i + 1]
        positions[i + 2] += velocities[i + 2]

        // Reset particles that go too far
        const distance = Math.sqrt(
            positions[i] ** 2 +
            positions[i + 1] ** 2 +
            positions[i + 2] ** 2
        )

        if (distance > 3) {
            const radius = Math.random() * 0.5
            const theta = Math.random() * Math.PI * 2
            const phi = Math.random() * Math.PI

            positions[i] = radius * Math.sin(phi) * Math.cos(theta)
            positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta)
            positions[i + 2] = radius * Math.cos(phi)
        }
    }

    particleSystem.geometry.attributes.position.needsUpdate = true
}

// Create Light
function createLight() {
    const lightType = document.getElementById('lightType').value
    const lightColor = document.getElementById('lightColor').value
    const lightIntensity = parseFloat(document.getElementById('lightIntensity').value)

    // Remove previous asset
    if (currentAsset) {
        scene.remove(currentAsset)
    }

    let light
    const color = new THREE.Color(lightColor)

    switch (lightType) {
        case 'point':
            light = new THREE.PointLight(color, lightIntensity, 10)
            light.position.set(0, 2, 0)
            break
        case 'directional':
            light = new THREE.DirectionalLight(color, lightIntensity)
            light.position.set(0, 5, 5)
            break
        case 'spot':
            light = new THREE.SpotLight(color, lightIntensity)
            light.position.set(0, 5, 0)
            light.angle = Math.PI / 6
            break
        case 'ambient':
            light = new THREE.AmbientLight(color, lightIntensity)
            break
    }

    // Add helper
    let helper
    if (lightType === 'point') {
        helper = new THREE.PointLightHelper(light, 0.2)
        scene.add(helper)
    } else if (lightType === 'directional') {
        helper = new THREE.DirectionalLightHelper(light, 0.5)
        scene.add(helper)
    } else if (lightType === 'spot') {
        helper = new THREE.SpotLightHelper(light)
        scene.add(helper)
    }

    scene.add(light)
    currentAsset = light

    // Update preview info
    document.getElementById('previewType').textContent = `${lightType} Light`
    document.getElementById('previewVertices').textContent = `Intensity: ${lightIntensity}`
    document.getElementById('previewFaces').textContent = `Color: ${lightColor}`
}

// Update preview info
function updatePreviewInfo(geometry, type) {
    document.getElementById('previewType').textContent = type
    if (geometry) {
        const positions = geometry.attributes.position
        const vertices = positions ? positions.count : 0
        const faces = geometry.index ? geometry.index.count / 3 : vertices / 3

        document.getElementById('previewVertices').textContent = `Vertices: ${vertices}`
        document.getElementById('previewFaces').textContent = `Faces: ${Math.floor(faces)}`
    }
}

// Export asset code
function exportCode() {
    if (!currentAsset) {
        showToast('Please create an asset first', 'error')
        return
    }

    const assetName = document.getElementById('assetName').value || 'CustomAsset'
    let code = ''

    if (currentAssetType === '3d-object') {
        const geometryType = document.getElementById('geometryType').value
        const scale = document.getElementById('scaleSlider').value
        const color = document.getElementById('objectColor').value
        const materialType = document.getElementById('materialType').value

        code = `// ${assetName}
import * as THREE from 'three'

export function create${assetName.replace(/\s+/g, '')}(scene) {
    const geometry = new THREE.${geometryType.charAt(0).toUpperCase() + geometryType.slice(1)}Geometry(${getGeometryParams(geometryType)})
    const material = new THREE.Mesh${materialType.charAt(0).toUpperCase() + materialType.slice(1)}Material({
        color: 0x${color.substring(1)},
        ${materialType === 'standard' ? 'roughness: 0.5,\n        metalness: 0.5' : ''}
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.scale.set(${scale}, ${scale}, ${scale})
    mesh.castShadow = true
    mesh.receiveShadow = true
    scene.add(mesh)
    return mesh
}
`
    } else if (currentAssetType === 'avatar') {
        const canvasSize = document.getElementById('canvasSize').value
        const drawCode = document.getElementById('avatarCode').value

        code = `// ${assetName}
export class ${assetName.replace(/\s+/g, '')}Avatar {
    constructor(size = ${canvasSize}) {
        this.canvas = document.createElement('canvas')
        this.canvas.width = size
        this.canvas.height = size
        this.ctx = this.canvas.getContext('2d')
        this.update()
    }

    update() {
        const canvas = this.canvas
        const ctx = this.ctx
        ${drawCode}
    }

    getCanvas() {
        return this.canvas
    }
}
`
    } else if (currentAssetType === 'particle') {
        const particleCount = document.getElementById('particleCount').value
        const particleColor = document.getElementById('particleColor').value
        const particleSize = document.getElementById('particleSize').value

        code = `// ${assetName} Particle System
import * as THREE from 'three'

export function create${assetName.replace(/\s+/g, '')}Particles(scene) {
    const particleCount = ${particleCount}
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 4
        positions[i + 1] = (Math.random() - 0.5) * 4
        positions[i + 2] = (Math.random() - 0.5) * 4
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const material = new THREE.PointsMaterial({
        color: 0x${particleColor.substring(1)},
        size: ${particleSize},
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    })

    const particles = new THREE.Points(geometry, material)
    scene.add(particles)
    return particles
}
`
    }

    // Copy to clipboard
    navigator.clipboard.writeText(code).then(() => {
        showToast('Code copied to clipboard!', 'success')
        console.log('Exported code:', code)
    }).catch(err => {
        showToast('Failed to copy code', 'error')
        console.error('Copy error:', err)
    })
}

// Get geometry parameters based on type
function getGeometryParams(type) {
    switch (type) {
        case 'box':
            return '1, 1, 1'
        case 'sphere':
            return '0.5, 32, 32'
        case 'cylinder':
            return '0.5, 0.5, 1, 32'
        case 'cone':
            return '0.5, 1, 32'
        case 'torus':
            return '0.5, 0.2, 16, 100'
        case 'dodecahedron':
        case 'octahedron':
        case 'tetrahedron':
            return '0.5, 0'
        default:
            return ''
    }
}

// Save to campground (placeholder - would need backend)
function saveToCampground() {
    if (!currentAsset) {
        showToast('Please create an asset first', 'error')
        return
    }

    const assetName = document.getElementById('assetName').value || 'CustomAsset'
    const assetDescription = document.getElementById('assetDescription').value

    // In a real implementation, this would send to a backend API
    const assetData = {
        name: assetName,
        description: assetDescription,
        type: currentAssetType,
        timestamp: new Date().toISOString()
    }

    // For now, just save to localStorage
    const savedAssets = JSON.parse(localStorage.getItem('campgroundAssets') || '[]')
    savedAssets.push(assetData)
    localStorage.setItem('campgroundAssets', JSON.stringify(savedAssets))

    showToast(`Asset "${assetName}" saved to local storage!`, 'success')
    console.log('Saved asset:', assetData)
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast')
    const toastMessage = document.getElementById('toastMessage')

    toastMessage.textContent = message
    toast.className = `toast ${type}`

    setTimeout(() => {
        toast.classList.add('show')
    }, 10)

    setTimeout(() => {
        toast.classList.remove('show')
    }, 3000)
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize scene
    initScene()

    // Asset type selection
    document.querySelectorAll('.asset-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            document.querySelectorAll('.asset-type-btn').forEach(b => b.classList.remove('active'))
            btn.classList.add('active')

            // Update asset type
            currentAssetType = btn.dataset.type

            // Show/hide relevant settings
            document.getElementById('objectSettings').style.display =
                currentAssetType === '3d-object' ? 'block' : 'none'
            document.getElementById('avatarSettings').style.display =
                currentAssetType === 'avatar' ? 'block' : 'none'
            document.getElementById('particleSettings').style.display =
                currentAssetType === 'particle' ? 'block' : 'none'
            document.getElementById('lightSettings').style.display =
                currentAssetType === 'light' ? 'block' : 'none'

            // Create default asset
            if (currentAssetType === '3d-object') {
                create3DObject()
            } else if (currentAssetType === 'avatar') {
                createAvatar()
            } else if (currentAssetType === 'particle') {
                createParticleSystem()
            } else if (currentAssetType === 'light') {
                createLight()
            }
        })
    })

    // 3D Object controls
    document.getElementById('geometryType').addEventListener('change', create3DObject)
    document.getElementById('materialType').addEventListener('change', create3DObject)
    document.getElementById('objectColor').addEventListener('input', (e) => {
        document.getElementById('colorValue').textContent = e.target.value
        create3DObject()
    })
    document.getElementById('scaleSlider').addEventListener('input', (e) => {
        document.getElementById('scaleValue').textContent = parseFloat(e.target.value).toFixed(1)
        create3DObject()
    })
    document.getElementById('castShadow').addEventListener('change', create3DObject)
    document.getElementById('animated').addEventListener('change', create3DObject)

    // Avatar controls
    document.getElementById('canvasSize').addEventListener('change', createAvatar)
    document.getElementById('avatarCode').addEventListener('input',
        debounce(createAvatar, 500))

    // Particle controls
    document.getElementById('particleCount').addEventListener('input', (e) => {
        document.getElementById('particleCountValue').textContent = e.target.value
        createParticleSystem()
    })
    document.getElementById('particleColor').addEventListener('input', createParticleSystem)
    document.getElementById('particleSize').addEventListener('input', (e) => {
        document.getElementById('particleSizeValue').textContent = parseFloat(e.target.value).toFixed(2)
        createParticleSystem()
    })
    document.getElementById('particleSpeed').addEventListener('input', (e) => {
        document.getElementById('particleSpeedValue').textContent = parseFloat(e.target.value).toFixed(1)
        createParticleSystem()
    })

    // Light controls
    document.getElementById('lightType').addEventListener('change', createLight)
    document.getElementById('lightColor').addEventListener('input', createLight)
    document.getElementById('lightIntensity').addEventListener('input', (e) => {
        document.getElementById('lightIntensityValue').textContent = parseFloat(e.target.value).toFixed(1)
        createLight()
    })

    // Action buttons
    document.getElementById('createBtn').addEventListener('click', () => {
        if (currentAssetType === '3d-object') {
            create3DObject()
        } else if (currentAssetType === 'avatar') {
            createAvatar()
        } else if (currentAssetType === 'particle') {
            createParticleSystem()
        } else if (currentAssetType === 'light') {
            createLight()
        }
        showToast('Asset created!', 'success')
    })

    document.getElementById('exportBtn').addEventListener('click', exportCode)
    document.getElementById('saveBtn').addEventListener('click', saveToCampground)

    // Create initial asset
    create3DObject()
})

// Debounce helper
function debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout)
            func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}
