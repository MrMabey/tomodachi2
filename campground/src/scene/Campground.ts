import * as THREE from 'three'

export class Campground {
  private campfire!: THREE.Group
  private fireLight!: THREE.PointLight
  private smokeParticles: THREE.Mesh[] = []
  private scene: THREE.Scene
  private cabin!: THREE.Group

  constructor(scene: THREE.Scene) {
    this.scene = scene
    this.createCampfire(scene)
    this.createTent(scene)
    this.createRocks(scene)
    this.createCabin(scene)
  }

  public getCabin(): THREE.Group {
    return this.cabin
  }

  private createCampfire(scene: THREE.Scene) {
    this.campfire = new THREE.Group()

    // Fire pit stones (low-poly rocks in a circle)
    const stoneGeometry = new THREE.DodecahedronGeometry(0.4, 0)
    const stoneMaterial = new THREE.MeshLambertMaterial({
      color: 0x808080,
      flatShading: true
    })

    for (let i = 0; i < 8; i++) {
      const stone = new THREE.Mesh(stoneGeometry, stoneMaterial)
      const angle = (i / 8) * Math.PI * 2
      stone.position.set(
        Math.cos(angle) * 1.5,
        0.2,
        Math.sin(angle) * 1.5
      )
      stone.rotation.set(
        Math.random() * 0.5,
        Math.random() * Math.PI,
        Math.random() * 0.5
      )
      stone.castShadow = true
      this.campfire.add(stone)
    }

    // Fire (glowing pyramid)
    const fireGeometry = new THREE.ConeGeometry(0.8, 2, 4)
    const fireMaterial = new THREE.MeshBasicMaterial({
      color: 0xff6600,
      transparent: true,
      opacity: 0.8
    })
    const fire = new THREE.Mesh(fireGeometry, fireMaterial)
    fire.position.y = 1
    this.campfire.add(fire)

    // Fire glow light
    this.fireLight = new THREE.PointLight(0xff6600, 2, 10)
    this.fireLight.position.set(0, 1.5, 0)
    this.campfire.add(this.fireLight)

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

  public update(time: number) {
    // Animate fire flickering
    if (this.fireLight) {
      this.fireLight.intensity = 2 + Math.sin(time * 5) * 0.5
    }

    // Rotate fire mesh slightly
    const fire = this.campfire.children.find(
      child => child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial
    )
    if (fire) {
      fire.rotation.y = time * 0.5
    }

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
  }
}
