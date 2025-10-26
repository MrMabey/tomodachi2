<template>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>🥚 FloAvatar</h1>
      <p>Your Virtual Pet Companion</p>
    </div>

    <!-- Token Display -->
    <div class="token-display">
      <span>🪙</span>
      <span class="token-count">{{ gameState.tokens }}</span>
    </div>

    <!-- Navigation Tabs -->
    <div class="nav-tabs">
      <button 
        class="nav-tab" 
        :class="{ active: currentTab === 'pet' }"
        @click="currentTab = 'pet'"
      >
        🐾 Pet
      </button>
      <button 
        class="nav-tab" 
        :class="{ active: currentTab === 'tasks' }"
        @click="currentTab = 'tasks'"
      >
        ✅ Tasks
      </button>
      <button 
        class="nav-tab" 
        :class="{ active: currentTab === 'shop' }"
        @click="currentTab = 'shop'"
      >
        🛒 Shop
      </button>
    </div>

    <!-- Pet Tab -->
    <div v-if="currentTab === 'pet'">
      <!-- Egg Selection (if no pet selected) -->
      <div v-if="!gameState.selectedEgg" class="egg-container">
        <h3>Choose Your Egg! 🥚</h3>
        <div class="egg-selection">
          <div 
            v-for="eggType in eggTypes" 
            :key="eggType.id"
            class="egg-option"
            :class="{ selected: selectedEggId === eggType.id }"
            @click="selectEgg(eggType.id)"
          >
            <canvas 
              :ref="el => eggCanvases[eggType.id] = el"
              class="egg-canvas"
              width="60" 
              height="60"
            ></canvas>
            <div class="egg-name">{{ eggType.name }}</div>
          </div>
        </div>
        <button 
          class="btn" 
          :disabled="!selectedEggId"
          @click="confirmEggSelection"
        >
          Start Journey! 🚀
        </button>
      </div>

      <!-- Pet Display (if egg selected) -->
      <div v-else>
        <div class="avatar-container">
          <canvas
            ref="avatarCanvas"
            class="avatar-canvas"
            :class="{ hatching: isHatching }"
            width="150"
            height="150"
            @click="interactWithPet"
          ></canvas>
        </div>

        <!-- Pet Status -->
        <div class="pet-status">
          <div class="progress-container" v-if="!gameState.isHatched">
            <div class="progress-label">
              <span>🥚 Hatching Progress</span>
              <span>{{ Math.floor(hatchProgress) }}%</span>
            </div>
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: hatchProgress + '%' }"
              ></div>
            </div>
            <p class="hatch-info">
              Collect tokens and spend time with your egg to help it hatch! 
              {{ gameState.tokensSpent }}/{{ selectedEggType?.hatchCost }} tokens spent
            </p>
          </div>

          <div v-else class="pet-info">
            <h3>{{ gameState.petName || selectedEggType?.name }} 🎉</h3>
            <div class="pet-stats">
              <div class="stat">
                <span>❤️ Happiness</span>
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    :style="{ width: gameState.happiness + '%' }"
                  ></div>
                </div>
              </div>
              <div class="stat">
                <span>⚡ Energy</span>
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    :style="{ width: gameState.energy + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="pet-actions">
          <button class="btn btn-secondary" @click="feedPet" :disabled="gameState.tokens < 5">
            🍖 Feed (5 🪙)
          </button>
          <button class="btn btn-secondary" @click="playWithPet" :disabled="gameState.tokens < 3">
            🎾 Play (3 🪙)
          </button>
        </div>
      </div>
    </div>

    <!-- Tasks Tab -->
    <div v-if="currentTab === 'tasks'">
      <h3>Daily Tasks 📋</h3>
      <div class="shop-grid">
        <div v-for="task in availableTasks" :key="task.id" class="shop-item">
          <div class="shop-item-info">
            <div class="shop-item-name">{{ task.name }}</div>
            <div class="shop-item-description">{{ task.description }}</div>
          </div>
          <div class="shop-item-price">+{{ task.reward }} 🪙</div>
          <button 
            class="btn" 
            style="padding: 8px 16px; font-size: 0.9em;"
            :disabled="task.completed"
            @click="completeTask(task.id)"
          >
            {{ task.completed ? '✅' : 'Do' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Shop Tab -->
    <div v-if="currentTab === 'shop'">
      <h3>Avatar Shop 🛒</h3>
      <div class="shop-grid">
        <div v-for="item in shopItems" :key="item.id" class="shop-item">
          <div class="shop-item-info">
            <div class="shop-item-name">{{ item.name }}</div>
            <div class="shop-item-description">{{ item.description }}</div>
          </div>
          <div class="shop-item-price">{{ item.price }} 🪙</div>
          <button 
            class="btn" 
            style="padding: 8px 16px; font-size: 0.9em;"
            :disabled="gameState.tokens < item.price || gameState.inventory.includes(item.id)"
            @click="buyItem(item.id)"
          >
            {{ gameState.inventory.includes(item.id) ? '✅ Owned' : 'Buy' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, nextTick, watch } from 'vue'
import { useStorage } from '@vueuse/core'

// Types
interface EggType {
  id: string
  name: string
  color: string
  hatchCost: number
  hatchTime: number // minutes
  avatarType: string
}

interface Task {
  id: string
  name: string
  description: string
  reward: number
  completed: boolean
  resetDaily?: boolean
}

interface ShopItem {
  id: string
  name: string
  description: string
  price: number
  type: 'accessory' | 'food' | 'toy' | 'boost'
}

interface GameState {
  selectedEgg: string | null
  isHatched: boolean
  hatchStartTime: number
  tokensSpent: number
  tokens: number
  happiness: number
  energy: number
  petName: string
  inventory: string[]
  lastTaskReset: number
}

// Reactive state
const currentTab = ref('pet')
const selectedEggId = ref<string | null>(null)
const eggCanvases = ref<Record<string, HTMLCanvasElement>>({})
const avatarCanvas = ref<HTMLCanvasElement | null>(null)
const isHatching = ref(false)

// Game state with persistence
const gameState = useStorage<GameState>('floavatar-gamestate', {
  selectedEgg: null,
  isHatched: false,
  hatchStartTime: 0,
  tokensSpent: 0,
  tokens: 50, // Starting tokens
  happiness: 100,
  energy: 100,
  petName: '',
  inventory: [],
  lastTaskReset: Date.now()
})

// Egg types configuration
const eggTypes: EggType[] = [
  { id: 'cat', name: '🐱 Kitty', color: '#FFB6C1', hatchCost: 20, hatchTime: 30, avatarType: 'cat' },
  { id: 'dragon', name: '🐲 Dragon', color: '#FF4500', hatchCost: 50, hatchTime: 60, avatarType: 'dragon' },
  { id: 'robot', name: '🤖 Robot', color: '#00FFFF', hatchCost: 40, hatchTime: 45, avatarType: 'robot' },
  { id: 'ghost', name: '👻 Ghost', color: '#E6E6FA', hatchCost: 35, hatchTime: 40, avatarType: 'ghost' },
  { id: 'alien', name: '👽 Alien', color: '#98FB98', hatchCost: 45, hatchTime: 50, avatarType: 'alien' },
  { id: 'panda', name: '🐼 Panda', color: '#FFFFFF', hatchCost: 30, hatchTime: 35, avatarType: 'panda' }
]

// Tasks configuration
const availableTasks = ref<Task[]>([
  { id: 'visit-sites', name: 'Visit 5 websites', description: 'Browse different websites', reward: 10, completed: false, resetDaily: true },
  { id: 'spend-time', name: 'Spend 30 minutes online', description: 'Active browsing time', reward: 15, completed: false, resetDaily: true },
  { id: 'open-tabs', name: 'Open 10 new tabs', description: 'Open new browser tabs', reward: 8, completed: false, resetDaily: true },
  { id: 'search-queries', name: 'Make 5 searches', description: 'Use search engines', reward: 12, completed: false, resetDaily: true }
])

// Shop items
const shopItems: ShopItem[] = [
  { id: 'food-premium', name: '🥩 Premium Food', description: 'Increases happiness by 50', price: 25, type: 'food' },
  { id: 'toy-ball', name: '🎾 Toy Ball', description: 'Increases energy by 30', price: 15, type: 'toy' },
  { id: 'accessory-hat', name: '🎩 Fancy Hat', description: 'Stylish accessory for your pet', price: 40, type: 'accessory' },
  { id: 'boost-tokens', name: '💰 Token Boost', description: 'Double tokens for 1 hour', price: 60, type: 'boost' }
]

// Computed properties
const selectedEggType = computed(() => 
  eggTypes.find(egg => egg.id === gameState.value.selectedEgg)
)

const hatchProgress = computed(() => {
  if (!gameState.value.selectedEgg || gameState.value.isHatched) return 100
  
  const eggType = selectedEggType.value
  if (!eggType) return 0
  
  const timeProgress = Math.min(100, ((Date.now() - gameState.value.hatchStartTime) / (eggType.hatchTime * 60 * 1000)) * 100)
  const tokenProgress = Math.min(100, (gameState.value.tokensSpent / eggType.hatchCost) * 100)
  
  return Math.max(timeProgress, tokenProgress)
})

// Egg rendering with animation
const renderEgg = (canvas: HTMLCanvasElement, eggType: EggType, animate = false) => {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  const centerX = canvas.width / 2
  const centerY = canvas.height / 2
  const time = animate ? Date.now() * 0.002 : 0
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  ctx.save()
  ctx.translate(centerX, centerY)
  
  // Gentle floating animation
  const floatY = animate ? Math.sin(time) * 2 : 0
  ctx.translate(0, floatY)
  
  // Draw egg shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
  ctx.beginPath()
  ctx.ellipse(0, 5, 18, 12, 0, 0, Math.PI * 2)
  ctx.fill()
  
  // Draw egg body with gradient
  const gradient = ctx.createLinearGradient(0, -20, 0, 20)
  gradient.addColorStop(0, eggType.color)
  gradient.addColorStop(0.7, '#FFFFFF')
  gradient.addColorStop(1, '#F0F0F0')
  
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.ellipse(0, 0, 16, 20, 0, 0, Math.PI * 2)
  ctx.fill()
  
  // Draw egg outline
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.ellipse(0, 0, 16, 20, 0, 0, Math.PI * 2)
  ctx.stroke()
  
  // Draw spots/pattern based on egg type
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
  
  if (eggType.id === 'cat') {
    // Cat paw prints
    ctx.beginPath()
    ctx.ellipse(-6, -8, 2, 3, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(4, -2, 1.5, 2, 0, 0, Math.PI * 2)
    ctx.fill()
  } else if (eggType.id === 'dragon') {
    // Scale pattern
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (Math.abs(i) + Math.abs(j) <= 1) {
          ctx.beginPath()
          ctx.ellipse(i * 6, j * 6, 2, 2, 0, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }
  } else if (eggType.id === 'robot') {
    // Circuit pattern
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(-8, -5)
    ctx.lineTo(8, -5)
    ctx.moveTo(0, -10)
    ctx.lineTo(0, 10)
    ctx.stroke()
  } else {
    // Generic spots
    ctx.beginPath()
    ctx.ellipse(-6, -6, 3, 4, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(4, -1, 2, 3, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(-2, 6, 1.5, 2, 0, 0, Math.PI * 2)
    ctx.fill()
  }
  
  // Add subtle glow for selected egg
  if (selectedEggId.value === eggType.id) {
    ctx.shadowColor = eggType.color
    ctx.shadowBlur = 15
    ctx.globalAlpha = 0.3
    ctx.beginPath()
    ctx.ellipse(0, 0, 18, 22, 0, 0, Math.PI * 2)
    ctx.fill()
  }
  
  ctx.restore()
}

// Methods
const selectEgg = (eggId: string) => {
  selectedEggId.value = eggId
}

const confirmEggSelection = () => {
  if (!selectedEggId.value) return
  
  gameState.value.selectedEgg = selectedEggId.value
  gameState.value.hatchStartTime = Date.now()
  gameState.value.tokensSpent = 0
  gameState.value.isHatched = false
}

const interactWithPet = () => {
  if (!gameState.value.isHatched) return
  
  // Simple interaction - increases happiness
  gameState.value.happiness = Math.min(100, gameState.value.happiness + 5)
  
  // Show interaction effect
  isHatching.value = true
  setTimeout(() => {
    isHatching.value = false
  }, 500)
}

const feedPet = () => {
  if (gameState.value.tokens < 5) return
  
  gameState.value.tokens -= 5
  gameState.value.happiness = Math.min(100, gameState.value.happiness + 20)
  gameState.value.energy = Math.min(100, gameState.value.energy + 10)
  
  if (!gameState.value.isHatched) {
    gameState.value.tokensSpent += 5
    checkHatching()
  }
}

const playWithPet = () => {
  if (gameState.value.tokens < 3) return
  
  gameState.value.tokens -= 3
  gameState.value.happiness = Math.min(100, gameState.value.happiness + 15)
  gameState.value.energy = Math.max(0, gameState.value.energy - 10)
  
  if (!gameState.value.isHatched) {
    gameState.value.tokensSpent += 3
    checkHatching()
  }
}

const completeTask = (taskId: string) => {
  const task = availableTasks.value.find(t => t.id === taskId)
  if (!task || task.completed) return
  
  task.completed = true
  gameState.value.tokens += task.reward
  
  // Simulate task completion (in real extension, this would track actual browser activity)
  setTimeout(() => {
    // Task completed!
  }, 1000)
}

const buyItem = (itemId: string) => {
  const item = shopItems.find(i => i.id === itemId)
  if (!item || gameState.value.tokens < item.price || gameState.value.inventory.includes(itemId)) return
  
  gameState.value.tokens -= item.price
  gameState.value.inventory.push(itemId)
  
  // Apply item effects
  if (item.type === 'food') {
    gameState.value.happiness = Math.min(100, gameState.value.happiness + 50)
  } else if (item.type === 'toy') {
    gameState.value.energy = Math.min(100, gameState.value.energy + 30)
  }
}

const checkHatching = () => {
  if (gameState.value.isHatched) return
  
  const progress = hatchProgress.value
  if (progress >= 100) {
    gameState.value.isHatched = true
    isHatching.value = true
    
    setTimeout(() => {
      isHatching.value = false
    }, 2000)
  }
}

// Watch for hatching progress
watch(hatchProgress, (newProgress) => {
  if (newProgress >= 100 && !gameState.value.isHatched) {
    checkHatching()
  }
})

// Avatar renderer management
let avatarRenderer: any = null
let avatarAnimationFrame: number | null = null

const createAvatarRenderer = () => {
  if (!gameState.value.selectedEgg || !gameState.value.isHatched) return
  
  const canvas = avatarCanvas.value
  if (!canvas) return
  
  // Clean up existing renderer
  if (avatarRenderer && avatarRenderer.destroy) {
    avatarRenderer.destroy()
  }
  if (avatarAnimationFrame) {
    cancelAnimationFrame(avatarAnimationFrame)
  }
  
  // Create simple animated avatar since we can't load external renderers in popup
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  const selectedEgg = selectedEggType.value
  if (!selectedEgg) return
  
  const animateAvatar = () => {
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const time = Date.now() * 0.003
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    ctx.save()
    ctx.translate(centerX, centerY)
    
    // Breathing animation
    const breathe = 1 + Math.sin(time) * 0.05
    ctx.scale(breathe, breathe)
    
    // Draw based on avatar type
    if (selectedEgg.id === 'cat') {
      drawSimpleCat(ctx, time)
    } else if (selectedEgg.id === 'dragon') {
      drawSimpleDragon(ctx, time)
    } else if (selectedEgg.id === 'robot') {
      drawSimpleRobot(ctx, time)
    } else if (selectedEgg.id === 'ghost') {
      drawSimpleGhost(ctx, time)
    } else if (selectedEgg.id === 'alien') {
      drawSimpleAlien(ctx, time)
    } else if (selectedEgg.id === 'panda') {
      drawSimplePanda(ctx, time)
    }
    
    ctx.restore()
    avatarAnimationFrame = requestAnimationFrame(animateAvatar)
  }
  
  animateAvatar()
}

// Simple avatar drawing functions
const drawSimpleCat = (ctx: CanvasRenderingContext2D, time: number) => {
  const blink = Math.sin(time * 0.3) > 0.9
  
  // Body
  ctx.fillStyle = '#FFB6C1'
  ctx.beginPath()
  ctx.ellipse(0, 10, 25, 20, 0, 0, Math.PI * 2)
  ctx.fill()
  
  // Head
  ctx.beginPath()
  ctx.ellipse(0, -15, 20, 18, 0, 0, Math.PI * 2)
  ctx.fill()
  
  // Ears
  ctx.fillStyle = '#E6E6FA'
  ctx.beginPath()
  ctx.ellipse(-12, -25, 8, 10, -0.3, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(12, -25, 8, 10, 0.3, 0, Math.PI * 2)
  ctx.fill()
  
  // Eyes
  ctx.fillStyle = blink ? '#FFB6C1' : '#4169E1'
  ctx.beginPath()
  ctx.ellipse(-8, -18, 4, blink ? 1 : 6, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(8, -18, 4, blink ? 1 : 6, 0, 0, Math.PI * 2)
  ctx.fill()
  
  // Mouth
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(0, -8, 6, 0.2, Math.PI - 0.2)
  ctx.stroke()
}

const drawSimpleDragon = (ctx: CanvasRenderingContext2D, time: number) => {
  const wingFlap = Math.sin(time * 2) * 0.3
  
  // Wings
  ctx.fillStyle = '#B22222'
  ctx.save()
  ctx.rotate(-0.5 + wingFlap)
  ctx.translate(-20, -10)
  ctx.beginPath()
  ctx.ellipse(0, 0, 12, 20, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
  
  ctx.save()
  ctx.rotate(0.5 - wingFlap)
  ctx.translate(20, -10)
  ctx.beginPath()
  ctx.ellipse(0, 0, 12, 20, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
  
  // Body
  ctx.fillStyle = '#FF4500'
  ctx.beginPath()
  ctx.ellipse(0, 5, 28, 25, 0, 0, Math.PI * 2)
  ctx.fill()
  
  // Head
  ctx.beginPath()
  ctx.ellipse(0, -15, 22, 20, 0, 0, Math.PI * 2)
  ctx.fill()
  
  // Eyes
  ctx.fillStyle = '#FF6347'
  ctx.beginPath()
  ctx.ellipse(-8, -18, 6, 8, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(8, -18, 6, 8, 0, 0, Math.PI * 2)
  ctx.fill()
}

const drawSimpleRobot = (ctx: CanvasRenderingContext2D, time: number) => {
  const pulse = Math.sin(time) * 0.2 + 0.8
  
  // Body
  ctx.fillStyle = '#2C3E50'
  ctx.fillRect(-20, -10, 40, 40)
  
  // Head
  ctx.fillRect(-15, -30, 30, 25)
  
  // Screen face
  ctx.fillStyle = `rgba(0, 255, 255, ${pulse})`
  ctx.fillRect(-12, -25, 24, 15)
  
  // Eyes
  ctx.fillStyle = '#00FFFF'
  ctx.fillRect(-10, -22, 6, 4)
  ctx.fillRect(4, -22, 6, 4)
  
  // Mouth line
  ctx.fillRect(-6, -15, 12, 2)
}

const drawSimpleGhost = (ctx: CanvasRenderingContext2D, time: number) => {
  const float = Math.sin(time) * 3
  ctx.translate(0, float)
  
  // Body with wavy bottom
  ctx.fillStyle = 'rgba(240, 248, 255, 0.9)'
  ctx.beginPath()
  ctx.arc(0, -10, 25, Math.PI, 0, true)
  
  // Wavy bottom
  for (let i = -25; i <= 25; i += 5) {
    const waveY = 15 + Math.sin((i / 5 + time) * 0.5) * 3
    if (i === -25) ctx.lineTo(i, waveY)
    else ctx.lineTo(i, waveY)
  }
  ctx.closePath()
  ctx.fill()
  
  // Eyes
  ctx.fillStyle = '#4169E1'
  ctx.beginPath()
  ctx.ellipse(-8, -15, 4, 6, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(8, -15, 4, 6, 0, 0, Math.PI * 2)
  ctx.fill()
}

const drawSimpleAlien = (ctx: CanvasRenderingContext2D, time: number) => {
  // Body
  ctx.fillStyle = '#98FB98'
  ctx.beginPath()
  ctx.ellipse(0, 5, 20, 25, 0, 0, Math.PI * 2)
  ctx.fill()
  
  // Large head
  ctx.beginPath()
  ctx.ellipse(0, -15, 25, 20, 0, 0, Math.PI * 2)
  ctx.fill()
  
  // Large alien eyes
  ctx.fillStyle = '#00CED1'
  ctx.beginPath()
  ctx.ellipse(-10, -18, 8, 12, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(10, -18, 8, 12, 0, 0, Math.PI * 2)
  ctx.fill()
  
  // Pupils
  ctx.fillStyle = '#000080'
  ctx.beginPath()
  ctx.ellipse(-10, -18, 4, 6, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(10, -18, 4, 6, 0, 0, Math.PI * 2)
  ctx.fill()
}

const drawSimplePanda = (ctx: CanvasRenderingContext2D, time: number) => {
  // Body
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.ellipse(0, 10, 20, 18, 0, 0, Math.PI * 2)
  ctx.fill()
  
  // Head
  ctx.beginPath()
  ctx.ellipse(0, -10, 22, 20, 0, 0, Math.PI * 2)
  ctx.fill()
  
  // Ears
  ctx.fillStyle = '#2F4F4F'
  ctx.beginPath()
  ctx.ellipse(-15, -22, 8, 10, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(15, -22, 8, 10, 0, 0, Math.PI * 2)
  ctx.fill()
  
  // Eye patches
  ctx.beginPath()
  ctx.ellipse(-8, -15, 7, 9, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(8, -15, 7, 9, 0, 0, Math.PI * 2)
  ctx.fill()
  
  // Eyes
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()  
  ctx.ellipse(-8, -15, 4, 6, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(8, -15, 4, 6, 0, 0, Math.PI * 2)
  ctx.fill()
}

// Initialize
onMounted(async () => {
  // Reset daily tasks if needed
  const now = Date.now()
  const dayInMs = 24 * 60 * 60 * 1000
  if (now - gameState.value.lastTaskReset > dayInMs) {
    availableTasks.value.forEach(task => {
      if (task.resetDaily) task.completed = false
    })
    gameState.value.lastTaskReset = now
  }
  
  // Render egg options with animation
  await nextTick()
  eggTypes.forEach(eggType => {
    const canvas = eggCanvases.value[eggType.id]
    if (canvas) {
      const animateEgg = () => {
        renderEgg(canvas, eggType, true)
        requestAnimationFrame(animateEgg)
      }
      animateEgg()
    }
  })
  
  // Check if should auto-hatch based on time
  if (gameState.value.selectedEgg && !gameState.value.isHatched) {
    checkHatching()
  }
  
  // Create avatar renderer if hatched
  if (gameState.value.isHatched) {
    await nextTick()
    createAvatarRenderer()
  }
})

// Watch for hatching to create avatar renderer
watch(() => gameState.value.isHatched, (isHatched) => {
  if (isHatched) {
    nextTick(() => createAvatarRenderer())
  }
})
</script>