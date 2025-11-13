import * as THREE from 'three'

export class Campground {
  private campfire!: THREE.Group
  private fireLight!: THREE.PointLight
  private smokeParticles: THREE.Mesh[] = []
  private scene: THREE.Scene
  private cabin!: THREE.Group
  private radio!: THREE.Group
  private controlPanel!: THREE.Group
  private musicNotes: THREE.Sprite[] = []
  private isMusicPlaying: boolean = false

  constructor(scene: THREE.Scene) {
    this.scene = scene
    this.createCampfire(scene)
    this.createTent(scene)
    this.createRocks(scene)
    this.createCabin(scene)
    this.createRadio(scene)
    this.createControlPanel(scene)

    // Listen for music playback events
    window.addEventListener('musicPlaying', () => {
      this.isMusicPlaying = true
    })
    window.addEventListener('musicStopped', () => {
      this.isMusicPlaying = false
    })
  }

  public getCabin(): THREE.Group {
    return this.cabin
  }

  public getRadio(): THREE.Group {
    return this.radio
  }

  public getControlPanel(): THREE.Group {
    return this.controlPanel
  }

  private createCampfire(scene: THREE.Scene) {
    this.campfire = new THREE.Group()

    // Fire pit stones (low-poly rocks in a circle)
    const stoneGeometry = new THREE.DodecahedronGeometry(0.4, 0)
    const stoneMaterial = new THREE.MeshLambertMaterial({
      color: 0x808080,
      flatShading: true
    })

    for (let i = 0; i < 10; i++) {
      const stone = new THREE.Mesh(stoneGeometry, stoneMaterial)
      const angle = (i / 10) * Math.PI * 2
      const radius = 1.3 + Math.random() * 0.3
      stone.position.set(
        Math.cos(angle) * radius,
        0.15,
        Math.sin(angle) * radius
      )
      stone.rotation.set(
        Math.random() * 0.5,
        Math.random() * Math.PI,
        Math.random() * 0.5
      )
      stone.castShadow = true
      this.campfire.add(stone)
    }

    // Logs arranged in teepee style
    const logGeometry = new THREE.CylinderGeometry(0.1, 0.12, 1.2, 8)
    const logMaterial = new THREE.MeshLambertMaterial({
      color: 0x4A2511, // Dark brown
      flatShading: true
    })

    // Create 6 logs leaning inward like a teepee
    for (let i = 0; i < 6; i++) {
      const log = new THREE.Mesh(logGeometry, logMaterial)
      const angle = (i / 6) * Math.PI * 2
      const radius = 0.4

      log.position.set(
        Math.cos(angle) * radius,
        0.4,
        Math.sin(angle) * radius
      )

      // Lean logs inward toward center
      log.rotation.z = Math.cos(angle) * 0.3
      log.rotation.x = Math.sin(angle) * 0.3
      log.rotation.y = angle

      log.castShadow = true
      this.campfire.add(log)
    }

    // Inner flame layers (multiple for depth)
    // Bottom layer - red/orange
    const innerFlameGeometry = new THREE.ConeGeometry(0.5, 1.2, 4)
    const innerFlameMaterial = new THREE.MeshBasicMaterial({
      color: 0xFF4500, // Orange red
      transparent: true,
      opacity: 0.9
    })
    const innerFlame = new THREE.Mesh(innerFlameGeometry, innerFlameMaterial)
    innerFlame.position.y = 0.8
    innerFlame.rotation.y = Math.PI / 4
    this.campfire.add(innerFlame)

    // Middle layer - orange/yellow
    const midFlameGeometry = new THREE.ConeGeometry(0.6, 1.5, 4)
    const midFlameMaterial = new THREE.MeshBasicMaterial({
      color: 0xFF8C00, // Dark orange
      transparent: true,
      opacity: 0.7
    })
    const midFlame = new THREE.Mesh(midFlameGeometry, midFlameMaterial)
    midFlame.position.y = 0.9
    midFlame.rotation.y = 0
    this.campfire.add(midFlame)

    // Outer layer - yellow
    const outerFlameGeometry = new THREE.ConeGeometry(0.7, 1.8, 4)
    const outerFlameMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFAA00, // Yellow orange
      transparent: true,
      opacity: 0.5
    })
    const outerFlame = new THREE.Mesh(outerFlameGeometry, outerFlameMaterial)
    outerFlame.position.y = 1.0
    outerFlame.rotation.y = Math.PI / 8
    this.campfire.add(outerFlame)

    // Hot coals/embers at the base
    const emberGeometry = new THREE.SphereGeometry(0.08, 6, 6)
    const emberMaterial = new THREE.MeshBasicMaterial({
      color: 0xFF2200, // Bright red
      emissive: 0xFF2200,
      emissiveIntensity: 0.8
    })

    // Create glowing embers scattered at the base
    for (let i = 0; i < 15; i++) {
      const ember = new THREE.Mesh(emberGeometry, emberMaterial)
      const angle = Math.random() * Math.PI * 2
      const radius = Math.random() * 0.5
      ember.position.set(
        Math.cos(angle) * radius,
        0.1,
        Math.sin(angle) * radius
      )
      ember.scale.set(
        0.5 + Math.random() * 0.8,
        0.5 + Math.random() * 0.8,
        0.5 + Math.random() * 0.8
      )
      this.campfire.add(ember)
    }

    // Fire glow light (main)
    this.fireLight = new THREE.PointLight(0xFF6600, 3, 12)
    this.fireLight.position.set(0, 1.2, 0)
    this.fireLight.castShadow = true
    this.campfire.add(this.fireLight)

    // Additional warm glow at base
    const emberLight = new THREE.PointLight(0xFF2200, 1, 5)
    emberLight.position.set(0, 0.2, 0)
    this.campfire.add(emberLight)

    scene.add(this.campfire)
  }

  private createTent(scene: THREE.Scene) {
    const tent = new THREE.Group()

    // Tent body (low-poly triangle)
    const tentGeometry = new THREE.ConeGeometry(2, 2.5, 4)
    const tentMaterial = new THREE.MeshLambertMaterial({
      color: 0xdc143c,
      flatShading: true
    })
    const tentMesh = new THREE.Mesh(tentGeometry, tentMaterial)
    tentMesh.position.y = 1.25
    tentMesh.rotation.y = Math.PI / 4
    tentMesh.castShadow = true
    tent.add(tentMesh)

    // Position tent near campfire
    tent.position.set(-5, 0, 3)
    scene.add(tent)
  }

  private createRocks(scene: THREE.Scene) {
    // Scattered rocks around the area
    const rockPositions = [
      { x: 3, z: -4 },
      { x: -2, z: -5 },
      { x: 5, z: 2 },
      { x: -6, z: -2 }
    ]

    rockPositions.forEach(pos => {
      const rockGeometry = new THREE.DodecahedronGeometry(0.5 + Math.random() * 0.5, 0)
      const rockMaterial = new THREE.MeshLambertMaterial({
        color: 0x696969,
        flatShading: true
      })
      const rock = new THREE.Mesh(rockGeometry, rockMaterial)
      rock.position.set(pos.x, 0.3, pos.z)
      rock.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      )
      rock.castShadow = true
      scene.add(rock)
    })
  }

  private createCabin(scene: THREE.Scene) {
    this.cabin = new THREE.Group()

    // A-Frame front wall (triangular)
    const frontShape = new THREE.Shape()
    frontShape.moveTo(-2, 0)
    frontShape.lineTo(2, 0)
    frontShape.lineTo(0, 4)
    frontShape.lineTo(-2, 0)

    const frontGeometry = new THREE.ShapeGeometry(frontShape)
    const woodMaterial = new THREE.MeshLambertMaterial({
      color: 0xD2691E, // Chocolate brown - warmer wood
      flatShading: true
    })
    const frontWall = new THREE.Mesh(frontGeometry, woodMaterial)
    frontWall.position.set(0, 0, 1.5)
    frontWall.castShadow = true
    frontWall.receiveShadow = true
    this.cabin.add(frontWall)

    // A-Frame back wall (same triangular shape)
    const backWall = new THREE.Mesh(frontGeometry, woodMaterial)
    backWall.position.set(0, 0, -1.5)
    backWall.castShadow = true
    backWall.receiveShadow = true
    this.cabin.add(backWall)

    // Left roof panel - proper A-frame geometry
    const roofMaterial = new THREE.MeshLambertMaterial({
      color: 0xDC143C, // Crimson red - cute cottage roof
      flatShading: true,
      side: THREE.DoubleSide
    })

    // Create left roof panel as a custom shape
    // From peak (0,4) down to left edge (-2,0), full depth of cabin
    const vertices = new Float32Array([
      // Front triangle edge
      0, 4, 1.5,      // Peak front
      -2, 0, 1.5,     // Base left front

      // Back triangle edge
      0, 4, -1.5,     // Peak back
      -2, 0, -1.5,    // Base left back
    ])

    const indices = [
      0, 1, 2,  // First triangle
      1, 3, 2   // Second triangle
    ]

    const leftRoofGeometry = new THREE.BufferGeometry()
    leftRoofGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
    leftRoofGeometry.setIndex(indices)
    leftRoofGeometry.computeVertexNormals()

    const leftRoof = new THREE.Mesh(leftRoofGeometry, roofMaterial)
    leftRoof.castShadow = true
    this.cabin.add(leftRoof)

    // Right roof panel - mirror of left
    const verticesRight = new Float32Array([
      // Front triangle edge
      0, 4, 1.5,      // Peak front
      2, 0, 1.5,      // Base right front

      // Back triangle edge
      0, 4, -1.5,     // Peak back
      2, 0, -1.5,     // Base right back
    ])

    const rightRoofGeometry = new THREE.BufferGeometry()
    rightRoofGeometry.setAttribute('position', new THREE.BufferAttribute(verticesRight, 3))
    rightRoofGeometry.setIndex(indices)
    rightRoofGeometry.computeVertexNormals()

    const rightRoof = new THREE.Mesh(rightRoofGeometry, roofMaterial)
    rightRoof.castShadow = true
    this.cabin.add(rightRoof)

    // Ridge beam at peak for detail
    const ridgeGeometry = new THREE.BoxGeometry(0.15, 0.15, 3)
    const ridgeMaterial = new THREE.MeshLambertMaterial({
      color: 0x8B4513, // Saddle brown
      flatShading: true
    })
    const ridge = new THREE.Mesh(ridgeGeometry, ridgeMaterial)
    ridge.position.set(0, 4, 0)
    this.cabin.add(ridge)

    // Cute rounded door (arched top)
    const doorGeometry = new THREE.BoxGeometry(0.9, 1.6, 0.15)
    const doorMaterial = new THREE.MeshLambertMaterial({
      color: 0xFFE4B5, // Moccasin - light warm wood
      flatShading: true
    })
    const door = new THREE.Mesh(doorGeometry, doorMaterial)
    door.position.set(0, 0.8, 1.56)
    door.castShadow = true
    this.cabin.add(door)

    // Door arch top (semicircle)
    const archGeometry = new THREE.CircleGeometry(0.45, 16, 0, Math.PI)
    const arch = new THREE.Mesh(archGeometry, doorMaterial)
    arch.position.set(0, 1.6, 1.57)
    this.cabin.add(arch)

    // Heart-shaped door decoration
    const heartShape = new THREE.Shape()
    heartShape.moveTo(0, 0.15)
    heartShape.bezierCurveTo(0, 0.15, -0.1, 0.25, -0.1, 0.15)
    heartShape.bezierCurveTo(-0.1, 0.05, -0.05, 0, 0, -0.05)
    heartShape.bezierCurveTo(0.05, 0, 0.1, 0.05, 0.1, 0.15)
    heartShape.bezierCurveTo(0.1, 0.25, 0, 0.15, 0, 0.15)

    const heartGeometry = new THREE.ShapeGeometry(heartShape)
    const heartMaterial = new THREE.MeshLambertMaterial({
      color: 0xFF69B4 // Hot pink
    })
    const heart = new THREE.Mesh(heartGeometry, heartMaterial)
    heart.position.set(0, 1.3, 1.58)
    this.cabin.add(heart)

    // Door knob (cute sphere)
    const knobGeometry = new THREE.SphereGeometry(0.08, 8, 8)
    const knobMaterial = new THREE.MeshLambertMaterial({
      color: 0xFFD700 // Gold
    })
    const knob = new THREE.Mesh(knobGeometry, knobMaterial)
    knob.position.set(0.35, 0.9, 1.58)
    this.cabin.add(knob)

    // Circular window at top
    const topWindowGeometry = new THREE.CircleGeometry(0.5, 16)
    const windowMaterial = new THREE.MeshLambertMaterial({
      color: 0xADD8E6, // Light blue
      transparent: true,
      opacity: 0.6
    })
    const topWindow = new THREE.Mesh(topWindowGeometry, windowMaterial)
    topWindow.position.set(0, 2.8, 1.52)
    this.cabin.add(topWindow)

    // Window frame (circle outline)
    const frameRing = new THREE.RingGeometry(0.5, 0.58, 16)
    const frameMaterial = new THREE.MeshLambertMaterial({
      color: 0xFFFFFF // White trim
    })
    const windowFrame = new THREE.Mesh(frameRing, frameMaterial)
    windowFrame.position.set(0, 2.8, 1.52)
    this.cabin.add(windowFrame)

    // Window crosshatch
    const crossGeometry = new THREE.BoxGeometry(0.06, 1.0, 0.06)
    const crossMaterial = new THREE.MeshLambertMaterial({
      color: 0xFFFFFF
    })
    const crossV = new THREE.Mesh(crossGeometry, crossMaterial)
    crossV.position.set(0, 2.8, 1.53)
    this.cabin.add(crossV)

    const crossH = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.06, 0.06), crossMaterial)
    crossH.position.set(0, 2.8, 1.53)
    this.cabin.add(crossH)

    // Cute chimney (smaller, rounder)
    const chimneyGeometry = new THREE.CylinderGeometry(0.25, 0.3, 1.2, 8)
    const chimneyMaterial = new THREE.MeshLambertMaterial({
      color: 0xCD5C5C, // Indian red - softer brick
      flatShading: true
    })
    const chimney = new THREE.Mesh(chimneyGeometry, chimneyMaterial)
    chimney.position.set(0.8, 3.8, 0)
    chimney.castShadow = true
    this.cabin.add(chimney)

    // Chimney cap (cone)
    const capGeometry = new THREE.ConeGeometry(0.4, 0.3, 8)
    const capMaterial = new THREE.MeshLambertMaterial({
      color: 0x8B4513 // Saddle brown
    })
    const cap = new THREE.Mesh(capGeometry, capMaterial)
    cap.position.set(0.8, 4.5, 0)
    this.cabin.add(cap)

    // Window boxes with flowers
    const boxGeometry = new THREE.BoxGeometry(1.2, 0.15, 0.2)
    const boxMaterial = new THREE.MeshLambertMaterial({
      color: 0x8B4513, // Brown
      flatShading: true
    })

    // Window box under top window
    const windowBox = new THREE.Mesh(boxGeometry, boxMaterial)
    windowBox.position.set(0, 2.2, 1.6)
    this.cabin.add(windowBox)

    // Little flowers in window box
    const flowerColors = [0xFF69B4, 0xFFFF00, 0xFF4500, 0x9370DB]
    for (let i = 0; i < 4; i++) {
      const flowerGeometry = new THREE.SphereGeometry(0.08, 6, 6)
      const flowerMaterial = new THREE.MeshLambertMaterial({
        color: flowerColors[i]
      })
      const flower = new THREE.Mesh(flowerGeometry, flowerMaterial)
      flower.position.set(-0.4 + i * 0.27, 2.35, 1.65)
      this.cabin.add(flower)
    }

    // Cute wooden deck/porch
    const deckGeometry = new THREE.BoxGeometry(2.5, 0.15, 1)
    const deckMaterial = new THREE.MeshLambertMaterial({
      color: 0xDEB887, // Burlywood
      flatShading: true
    })
    const deck = new THREE.Mesh(deckGeometry, deckMaterial)
    deck.position.set(0, 0.08, 2.3)
    deck.castShadow = true
    this.cabin.add(deck)

    // Porch railings
    const railGeometry = new THREE.BoxGeometry(0.08, 0.4, 0.08)
    const railMaterial = new THREE.MeshLambertMaterial({
      color: 0xFFFFFF // White
    })

    // Left railing post
    const leftPost = new THREE.Mesh(railGeometry, railMaterial)
    leftPost.position.set(-1.2, 0.4, 2.8)
    this.cabin.add(leftPost)

    // Right railing post
    const rightPost = new THREE.Mesh(railGeometry, railMaterial)
    rightPost.position.set(1.2, 0.4, 2.8)
    this.cabin.add(rightPost)

    // Position cabin in upper right quadrant (positive X, negative Z)
    this.cabin.position.set(7, 0, -6)
    this.cabin.rotation.y = -Math.PI / 6 // Slight angle for better view

    scene.add(this.cabin)
  }

  private createRadio(scene: THREE.Scene) {
    this.radio = new THREE.Group()

    // Main boombox body (large rectangular box) - scaled to 0.81 (0.9 * 0.9)
    const bodyGeometry = new THREE.BoxGeometry(1.62, 0.81, 0.486)
    const bodyMaterial = new THREE.MeshLambertMaterial({
      color: 0x2C2C2C, // Dark gray/black
      flatShading: true
    })
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
    body.castShadow = true
    this.radio.add(body)

    // Left speaker (circular speaker with grille)
    const speakerGeometry = new THREE.CylinderGeometry(0.2835, 0.2835, 0.0648, 16)
    const speakerMaterial = new THREE.MeshLambertMaterial({
      color: 0x1A1A1A, // Darker black
      flatShading: true
    })
    const leftSpeaker = new THREE.Mesh(speakerGeometry, speakerMaterial)
    leftSpeaker.position.set(-0.4455, 0.081, 0.2835)
    leftSpeaker.rotation.x = Math.PI / 2
    this.radio.add(leftSpeaker)

    // Left speaker grille (inner circle)
    const grilleGeometry = new THREE.CylinderGeometry(0.2268, 0.2268, 0.081, 16)
    const grilleMaterial = new THREE.MeshLambertMaterial({
      color: 0x3A3A3A // Medium gray
    })
    const leftGrille = new THREE.Mesh(grilleGeometry, grilleMaterial)
    leftGrille.position.set(-0.4455, 0.081, 0.2916)
    leftGrille.rotation.x = Math.PI / 2
    this.radio.add(leftGrille)

    // Right speaker (mirror of left)
    const rightSpeaker = new THREE.Mesh(speakerGeometry, speakerMaterial)
    rightSpeaker.position.set(0.4455, 0.081, 0.2835)
    rightSpeaker.rotation.x = Math.PI / 2
    this.radio.add(rightSpeaker)

    const rightGrille = new THREE.Mesh(grilleGeometry, grilleMaterial)
    rightGrille.position.set(0.4455, 0.081, 0.2916)
    rightGrille.rotation.x = Math.PI / 2
    this.radio.add(rightGrille)

    // Cassette deck area (center panel)
    const deckGeometry = new THREE.BoxGeometry(0.486, 0.2835, 0.0648)
    const deckMaterial = new THREE.MeshLambertMaterial({
      color: 0x505050, // Light gray
      flatShading: true
    })
    const deck = new THREE.Mesh(deckGeometry, deckMaterial)
    deck.position.set(0, 0.1215, 0.2592)
    this.radio.add(deck)

    // Cassette window (clear/dark)
    const windowGeometry = new THREE.BoxGeometry(0.3645, 0.162, 0.0162)
    const windowMaterial = new THREE.MeshLambertMaterial({
      color: 0x1C1C1C,
      transparent: true,
      opacity: 0.8
    })
    const cassWindow = new THREE.Mesh(windowGeometry, windowMaterial)
    cassWindow.position.set(0, 0.1215, 0.2997)
    this.radio.add(cassWindow)

    // Control buttons below deck
    const buttonGeometry = new THREE.BoxGeometry(0.0648, 0.0648, 0.0324)
    const buttonMaterial = new THREE.MeshLambertMaterial({
      color: 0x8B0000 // Dark red
    })

    // Play button
    const playButton = new THREE.Mesh(buttonGeometry, buttonMaterial)
    playButton.position.set(-0.1215, -0.081, 0.2673)
    this.radio.add(playButton)

    // Stop button
    const stopMaterial = new THREE.MeshLambertMaterial({ color: 0x4A4A4A })
    const stopButton = new THREE.Mesh(buttonGeometry, stopMaterial)
    stopButton.position.set(-0.0405, -0.081, 0.2673)
    this.radio.add(stopButton)

    // Pause button
    const pauseButton = new THREE.Mesh(buttonGeometry, stopMaterial)
    pauseButton.position.set(0.0405, -0.081, 0.2673)
    this.radio.add(pauseButton)

    // Forward button
    const fwdButton = new THREE.Mesh(buttonGeometry, stopMaterial)
    fwdButton.position.set(0.1215, -0.081, 0.2673)
    this.radio.add(fwdButton)

    // Antenna (telescoping style)
    const antennaGeometry = new THREE.CylinderGeometry(0.0162, 0.02025, 1.215, 8)
    const antennaMaterial = new THREE.MeshLambertMaterial({
      color: 0xC0C0C0 // Silver
    })
    const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial)
    antenna.position.set(0.6885, 0.972, -0.081)
    antenna.rotation.z = -Math.PI / 8 // Slight angle
    this.radio.add(antenna)

    // Volume knob (left side)
    const knobGeometry = new THREE.CylinderGeometry(0.0648, 0.0648, 0.0486, 12)
    const knobMaterial = new THREE.MeshLambertMaterial({
      color: 0xFFD700 // Gold
    })
    const volumeKnob = new THREE.Mesh(knobGeometry, knobMaterial)
    volumeKnob.position.set(-0.567, -0.2025, 0.2673)
    volumeKnob.rotation.x = Math.PI / 2
    this.radio.add(volumeKnob)

    // Tuning knob (right side)
    const tuningKnob = new THREE.Mesh(knobGeometry, knobMaterial)
    tuningKnob.position.set(0.567, -0.2025, 0.2673)
    tuningKnob.rotation.x = Math.PI / 2
    this.radio.add(tuningKnob)

    // Carrying handle (arc on top)
    const handleCurve = new THREE.EllipseCurve(
      0, 0,            // center
      0.567, 0.405,    // xRadius, yRadius (scaled by 0.81)
      0, Math.PI,      // startAngle, endAngle
      false,           // clockwise
      0                // rotation
    )
    const handlePoints = handleCurve.getPoints(24)
    const handleGeometry = new THREE.BufferGeometry().setFromPoints(handlePoints)
    const handleMaterial = new THREE.LineBasicMaterial({
      color: 0x505050, // Gray
      linewidth: 4
    })
    const handle = new THREE.Line(handleGeometry, handleMaterial)
    handle.position.set(0, 0.405, 0)
    handle.rotation.x = Math.PI / 2
    this.radio.add(handle)

    // LED indicator (small red light)
    const ledGeometry = new THREE.SphereGeometry(0.0243, 8, 8)
    const ledMaterial = new THREE.MeshBasicMaterial({
      color: 0xFF0000, // Red
      emissive: 0xFF0000
    })
    const led = new THREE.Mesh(ledGeometry, ledMaterial)
    led.position.set(0.2025, 0.2835, 0.2592)
    this.radio.add(led)

    // Position boombox next to campfire (on the ground)
    // Height is 0.81, so y position should be 0.81/2 = 0.405
    this.radio.position.set(-2.5, 0.6, -3)
    this.radio.rotation.y = Math.PI / 2 - (40 * Math.PI / 180) // Face forward, rotated 40 degrees right

    scene.add(this.radio)
  }

  private createControlPanel(scene: THREE.Scene) {
    this.controlPanel = new THREE.Group()

    // Base/stand (truncated pyramid)
    const baseGeometry = new THREE.CylinderGeometry(0.5, 0.6, 0.3, 6)
    const baseMaterial = new THREE.MeshLambertMaterial({
      color: 0x2F4F4F, // Dark slate gray
      flatShading: true
    })
    const base = new THREE.Mesh(baseGeometry, baseMaterial)
    base.position.y = 0.15
    base.castShadow = true
    this.controlPanel.add(base)

    // Main console body (box)
    const bodyGeometry = new THREE.BoxGeometry(1.2, 0.8, 0.6)
    const bodyMaterial = new THREE.MeshLambertMaterial({
      color: 0x4682B4, // Steel blue
      flatShading: true
    })
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
    body.position.y = 0.7
    body.castShadow = true
    this.controlPanel.add(body)

    // Screen (dark with slight glow)
    const screenGeometry = new THREE.BoxGeometry(0.9, 0.55, 0.05)
    const screenMaterial = new THREE.MeshBasicMaterial({
      color: 0x001a33, // Very dark blue
      emissive: 0x00ff88, // Cyan/green glow
      emissiveIntensity: 0.3
    })
    const screen = new THREE.Mesh(screenGeometry, screenMaterial)
    screen.position.set(0, 0.8, 0.33)
    this.controlPanel.add(screen)

    // Screen frame/bezel
    const frameGeometry = new THREE.BoxGeometry(1.0, 0.65, 0.02)
    const frameMaterial = new THREE.MeshLambertMaterial({
      color: 0x2F4F4F // Dark slate gray
    })
    const frame = new THREE.Mesh(frameGeometry, frameMaterial)
    frame.position.set(0, 0.8, 0.32)
    this.controlPanel.add(frame)

    // LED indicators (3 small lights on top)
    const ledColors = [0xff0000, 0xffff00, 0x00ff00] // Red, Yellow, Green
    const ledGeometry = new THREE.SphereGeometry(0.04, 8, 8)

    for (let i = 0; i < 3; i++) {
      const ledMaterial = new THREE.MeshBasicMaterial({
        color: ledColors[i],
        emissive: ledColors[i],
        emissiveIntensity: 0.8
      })
      const led = new THREE.Mesh(ledGeometry, ledMaterial)
      led.position.set(-0.3 + i * 0.3, 1.15, 0.3)
      this.controlPanel.add(led)
    }

    // Keyboard area (lower front panel)
    const keyboardGeometry = new THREE.BoxGeometry(1.0, 0.1, 0.4)
    const keyboardMaterial = new THREE.MeshLambertMaterial({
      color: 0x696969, // Dim gray
      flatShading: true
    })
    const keyboard = new THREE.Mesh(keyboardGeometry, keyboardMaterial)
    keyboard.position.set(0, 0.4, 0.2)
    keyboard.rotation.x = -Math.PI / 8
    this.controlPanel.add(keyboard)

    // Key details (small squares)
    const keyGeometry = new THREE.BoxGeometry(0.08, 0.03, 0.08)
    const keyMaterial = new THREE.MeshLambertMaterial({
      color: 0x2F2F2F // Very dark gray
    })

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 8; col++) {
        const key = new THREE.Mesh(keyGeometry, keyMaterial)
        key.position.set(
          -0.35 + col * 0.1,
          0.42 + row * 0.04,
          0.15 + row * 0.08
        )
        key.rotation.x = -Math.PI / 8
        this.controlPanel.add(key)
      }
    }

    // Big red button (the webhook trigger button!)
    const buttonGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.08, 16)
    const buttonMaterial = new THREE.MeshLambertMaterial({
      color: 0xFF0000, // Bright red
      emissive: 0x440000,
      emissiveIntensity: 0.5
    })
    const bigButton = new THREE.Mesh(buttonGeometry, buttonMaterial)
    bigButton.position.set(0.5, 0.5, 0.35)
    bigButton.rotation.x = Math.PI / 2
    this.controlPanel.add(bigButton)

    // Button label plate
    const labelGeometry = new THREE.BoxGeometry(0.25, 0.02, 0.08)
    const labelMaterial = new THREE.MeshLambertMaterial({
      color: 0xFFFF00 // Yellow warning stripe
    })
    const label = new THREE.Mesh(labelGeometry, labelMaterial)
    label.position.set(0.5, 0.5, 0.2)
    this.controlPanel.add(label)

    // Side panel with vents
    const ventGeometry = new THREE.BoxGeometry(0.05, 0.6, 0.4)
    const ventMaterial = new THREE.MeshLambertMaterial({
      color: 0x2F2F2F
    })
    const leftVent = new THREE.Mesh(ventGeometry, ventMaterial)
    leftVent.position.set(-0.6, 0.7, 0)
    this.controlPanel.add(leftVent)

    const rightVent = new THREE.Mesh(ventGeometry, ventMaterial)
    rightVent.position.set(0.6, 0.7, 0)
    this.controlPanel.add(rightVent)

    // Antenna on top
    const antennaGeometry = new THREE.CylinderGeometry(0.02, 0.03, 0.4, 8)
    const antennaMaterial = new THREE.MeshLambertMaterial({
      color: 0xC0C0C0 // Silver
    })
    const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial)
    antenna.position.set(-0.4, 1.4, -0.1)
    antenna.rotation.z = Math.PI / 12
    this.controlPanel.add(antenna)

    // Antenna tip (small sphere)
    const tipGeometry = new THREE.SphereGeometry(0.05, 8, 8)
    const tipMaterial = new THREE.MeshBasicMaterial({
      color: 0xFF0000,
      emissive: 0xFF0000
    })
    const antennaTip = new THREE.Mesh(tipGeometry, tipMaterial)
    antennaTip.position.set(-0.42, 1.6, -0.1)
    this.controlPanel.add(antennaTip)

    // Position control panel to the right of campfire
    this.controlPanel.position.set(3.5, 0, 1.5)
    this.controlPanel.rotation.y = -Math.PI / 4 // Angle it nicely

    scene.add(this.controlPanel)
  }

  private createSmokeParticle() {
    // Create a puff of smoke
    const smokeGeometry = new THREE.SphereGeometry(0.2, 8, 8)
    const smokeMaterial = new THREE.MeshBasicMaterial({
      color: 0xDDDDDD, // Light gray
      transparent: true,
      opacity: 0.6
    })
    const smoke = new THREE.Mesh(smokeGeometry, smokeMaterial)

    // Position at chimney top (cabin is at 7, 0, -6)
    smoke.position.set(7 + 0.8, 4.6, -6)

    // Add some random offset
    smoke.position.x += (Math.random() - 0.5) * 0.2
    smoke.position.z += (Math.random() - 0.5) * 0.2

    // Store birth time for animation
    ;(smoke as any).birthTime = Date.now()
    ;(smoke as any).velocity = {
      x: (Math.random() - 0.5) * 0.01,
      y: 0.02 + Math.random() * 0.01,
      z: (Math.random() - 0.5) * 0.01
    }

    this.scene.add(smoke)
    this.smokeParticles.push(smoke)
  }

  private createMusicNote() {
    // Create canvas for music note
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')!

    // Draw music note (♪ or ♫)
    ctx.fillStyle = '#FF69B4' // Hot pink
    ctx.font = 'bold 48px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Randomly choose single or double note
    const notes = ['♪', '♫']
    const note = notes[Math.floor(Math.random() * notes.length)]
    ctx.fillText(note, 32, 32)

    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas)
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 1
    })

    const sprite = new THREE.Sprite(material)

    // Position at radio location with some randomness
    const radioPos = this.radio.position
    sprite.position.set(
      radioPos.x + (Math.random() - 0.5) * 0.5,
      radioPos.y + 0.5,
      radioPos.z + (Math.random() - 0.5) * 0.5
    )

    sprite.scale.set(0.3, 0.3, 1)

    // Store birth time and velocity
    ;(sprite as any).birthTime = Date.now()
    ;(sprite as any).velocity = {
      x: (Math.random() - 0.5) * 0.005,
      y: 0.008 + Math.random() * 0.005,
      z: (Math.random() - 0.5) * 0.005
    }

    this.scene.add(sprite)
    this.musicNotes.push(sprite)
  }

  public update(time: number) {
    // Animate fire flickering (more dramatic)
    if (this.fireLight) {
      this.fireLight.intensity = 3 + Math.sin(time * 5) * 0.8 + Math.sin(time * 3.7) * 0.3
    }

    // Animate all flame layers with different rotations and scales
    const flames = this.campfire.children.filter(
      child => child instanceof THREE.Mesh &&
      child.material instanceof THREE.MeshBasicMaterial &&
      (child.material as THREE.MeshBasicMaterial).transparent
    )

    if (flames.length >= 3) {
      // Inner flame - rotate one way
      flames[0].rotation.y = time * 0.8
      flames[0].scale.y = 1 + Math.sin(time * 4) * 0.1

      // Middle flame - rotate opposite way
      flames[1].rotation.y = -time * 0.6
      flames[1].scale.y = 1 + Math.sin(time * 3.5 + 0.5) * 0.15

      // Outer flame - slower rotation
      flames[2].rotation.y = time * 0.4
      flames[2].scale.y = 1 + Math.sin(time * 3 + 1) * 0.12
    }

    // Make embers flicker
    const embers = this.campfire.children.filter(
      child => child instanceof THREE.Mesh &&
      child.material instanceof THREE.MeshBasicMaterial &&
      (child.material as THREE.MeshBasicMaterial).emissive
    )

    embers.forEach((ember, index) => {
      const material = ember.material as THREE.MeshBasicMaterial
      material.emissiveIntensity = 0.5 + Math.sin(time * 4 + index) * 0.4
    })

    // Generate smoke particles periodically
    if (Math.random() < 0.1) { // 10% chance each frame
      this.createSmokeParticle()
    }

    // Update smoke particles
    const now = Date.now()
    for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
      const smoke = this.smokeParticles[i]
      const age = (now - (smoke as any).birthTime) / 1000 // Age in seconds
      const velocity = (smoke as any).velocity

      // Move smoke up and drift
      smoke.position.x += velocity.x
      smoke.position.y += velocity.y
      smoke.position.z += velocity.z

      // Grow larger as it rises
      const scale = 1 + age * 0.5
      smoke.scale.set(scale, scale, scale)

      // Fade out
      const material = smoke.material as THREE.MeshBasicMaterial
      material.opacity = Math.max(0, 0.6 - age * 0.3)

      // Remove old particles (after 3 seconds)
      if (age > 3) {
        this.scene.remove(smoke)
        smoke.geometry.dispose()
        material.dispose()
        this.smokeParticles.splice(i, 1)
      }
    }

    // Generate music notes when music is playing
    if (this.isMusicPlaying && Math.random() < 0.03) { // 3% chance each frame
      this.createMusicNote()
    }

    // Update music note particles
    for (let i = this.musicNotes.length - 1; i >= 0; i--) {
      const note = this.musicNotes[i]
      const age = (now - (note as any).birthTime) / 1000 // Age in seconds
      const velocity = (note as any).velocity

      // Move note up and drift
      note.position.x += velocity.x
      note.position.y += velocity.y
      note.position.z += velocity.z

      // Gentle rotation
      note.material.rotation += 0.02

      // Fade out
      note.material.opacity = Math.max(0, 1 - age * 0.5)

      // Remove old particles (after 2 seconds)
      if (age > 2) {
        this.scene.remove(note)
        note.material.map?.dispose()
        note.material.dispose()
        this.musicNotes.splice(i, 1)
      }
    }
  }
}
