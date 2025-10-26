import './style.css'
import * as THREE from 'three'
import { IsometricScene } from './scene/IsometricScene'
import { FlowBuddy } from './flow-buddy'

// Create the main 3D scene
const scene = new IsometricScene()

// Create Flow Buddy (DOM-based overlay avatar)
const flowBuddy = new FlowBuddy()

// Handle window resize
window.addEventListener('resize', () => {
  scene.handleResize()
})

// Animation loop
function animate() {
  requestAnimationFrame(animate)
  scene.update()
  scene.render()
}

animate()

// Make Flow Buddy available globally for UI controls
;(window as any).flowBuddy = flowBuddy

console.log('🏕️ Base Camp initializing...')
console.log('🎀 Flow Buddy is ready!')
