import * as THREE from 'three'

export class Campground {
  private campfire!: THREE.Group
  private fireLight!: THREE.PointLight

  constructor(scene: THREE.Scene) {
    this.createCampfire(scene)
    this.createTent(scene)
    this.createRocks(scene)
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
  }
}
