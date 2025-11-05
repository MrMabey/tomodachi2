import './style.css'
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

// Make Flow Buddy and Scene available globally for UI controls
;(window as any).flowBuddy = flowBuddy
;(window as any).campgroundScene = scene

console.log('🏕️ Base Camp initializing...')
console.log('🎀 Flow Buddy is ready!')
console.log('🦾 Mechanical HUD Arm controls:')
console.log('   H - Toggle arm deployment')
console.log('   1-5 - Change HUD tint (1=clear, 2=orange, 3=green, 4=yellow, 5=white)')
