import * as THREE from 'three'

export class Forest {
  private trees: THREE.Group[] = []

  constructor(scene: THREE.Scene) {
    this.createForest(scene)
  }

  private createTree(): THREE.Group {
    const tree = new THREE.Group()

    // Tree trunk (low-poly cylinder)
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 3, 6)
    const trunkMaterial = new THREE.MeshLambertMaterial({
      color: 0x8B4513,
      flatShading: true
    })
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial)
    trunk.position.y = 1.5
    trunk.castShadow = true
    tree.add(trunk)

    // Tree canopy (low-poly cone)
    const canopyGeometry = new THREE.ConeGeometry(1.5, 3, 6)
    const canopyMaterial = new THREE.MeshLambertMaterial({
      color: 0x2d5016,
      flatShading: true
    })
    const canopy = new THREE.Mesh(canopyGeometry, canopyMaterial)
    canopy.position.y = 4
    canopy.castShadow = true
    tree.add(canopy)

    // Add second layer for depth
    const canopy2 = canopy.clone()
    canopy2.position.y = 5
    canopy2.scale.set(0.7, 0.7, 0.7)
    tree.add(canopy2)

    return tree
  }

  private createForest(scene: THREE.Scene) {
    // Create trees in a circle around the campground
    const treePositions = [
      { x: -15, z: -15 },
      { x: -12, z: -18 },
      { x: -18, z: -10 },
      { x: 15, z: -15 },
      { x: 18, z: -12 },
      { x: 12, z: -18 },
      { x: -15, z: 15 },
      { x: -18, z: 12 },
      { x: -12, z: 18 },
      { x: 15, z: 15 },
      { x: 18, z: 18 },
      { x: 12, z: 18 },
      // Background trees
      { x: -20, z: -5 },
      { x: -20, z: 5 },
      { x: 20, z: -5 },
      { x: 20, z: 5 },
      { x: 0, z: -20 },
      { x: 0, z: 20 },
    ]

    treePositions.forEach(pos => {
      const tree = this.createTree()
      tree.position.set(pos.x, 0, pos.z)

      // Random rotation for variety
      tree.rotation.y = Math.random() * Math.PI * 2

      // Slight scale variation
      const scale = 0.8 + Math.random() * 0.4
      tree.scale.set(scale, scale, scale)

      scene.add(tree)
      this.trees.push(tree)
    })
  }

  public getTrees(): THREE.Group[] {
    return this.trees
  }
}
