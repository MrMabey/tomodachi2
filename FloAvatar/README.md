# 🥚 FloAvatar - Virtual Pet Browser Extension

A delightful browser extension built with **WXT Framework** and **Vue 3** that lets you raise virtual pet avatars by collecting tokens through daily web browsing activities!

## ✨ Features

### 🥚 **Egg Selection System**
- Choose from 6 unique avatar types: Cat, Dragon, Robot, Ghost, Alien, and Panda
- Each egg has its own hatching requirements and timeline
- Beautiful animated egg displays with unique colors and patterns

### 🪙 **Token Collection System**
- Earn tokens by completing daily browsing tasks:
  - Visit different websites (+3 tokens per visit)
  - Complete searches (+5 tokens per search)
  - Switch between tabs (+2 tokens per 5 switches)
  - Stay active online (+1 token per 5 minutes)
  - Special activity bonuses (+2 tokens per 50 actions)

### 🐣 **Hatching Mechanics**
- Eggs hatch based on **time spent** and **tokens invested**
- Each avatar type has different requirements:
  - 🐱 **Kitty**: 20 tokens, 30 minutes
  - 🐲 **Dragon**: 50 tokens, 60 minutes  
  - 🤖 **Robot**: 40 tokens, 45 minutes
  - 👻 **Ghost**: 35 tokens, 40 minutes
  - 👽 **Alien**: 45 tokens, 50 minutes
  - 🐼 **Panda**: 30 tokens, 35 minutes

### 🛒 **Avatar Shop & Care**
- **Feed your pet** (5 tokens) - increases happiness and energy
- **Play with your pet** (3 tokens) - boosts happiness, uses energy
- **Buy premium items**:
  - 🥩 Premium Food (25 tokens) - +50 happiness
  - 🎾 Toy Ball (15 tokens) - +30 energy
  - 🎩 Fancy Hat (40 tokens) - stylish accessory
  - 💰 Token Boost (60 tokens) - double tokens for 1 hour

### 🎨 **Floating Avatar Companion**
- Once hatched, your pet appears as a floating companion on websites
- **Unique animations** for each avatar type:
  - 🐱 Cat: Purring, happy dance, blinking
  - 🐲 Dragon: Fire breathing, wing flapping, roaring
  - 🤖 Robot: Processing effects, LED indicators, digital scan lines
  - 👻 Ghost: Phasing effects, ethereal wisps, transparency
  - 👽 Alien: Telepathic communication, cosmic effects, brain waves
  - 🐼 Panda: Bamboo eating, zen aura, sakura petals

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Modern browser (Chrome, Firefox, Edge)

### Installation & Development

1. **Clone or download** the project files
2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```
   This will build the extension and watch for changes.

4. **Load extension in browser**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `.output/chrome-mv3` folder

5. **For Firefox development**:
   ```bash
   npm run dev:firefox
   ```
   Then load the `.output/firefox-mv2` folder in `about:debugging`

### Building for Production

```bash
npm run build
npm run zip
```

This creates optimized builds and a zip file ready for store submission.

## 🎮 How to Play

1. **Install the extension** and click the FloAvatar icon
2. **Choose your egg** from 6 adorable options
3. **Start collecting tokens** by browsing the web naturally:
   - Visit websites you normally browse
   - Search for things you're interested in
   - Switch between tabs while working
   - Stay active online
4. **Feed and play** with your egg using tokens to speed up hatching
5. **Watch your egg hatch** into a beautiful avatar companion!
6. **Care for your pet** by feeding, playing, and buying items
7. **Enjoy your floating companion** that appears on websites

## 🛠 Technical Architecture

### **WXT Framework**
- Modern browser extension framework
- TypeScript support out of the box
- Hot module replacement for fast development
- Multi-browser compatibility (Chrome, Firefox, Safari)

### **Vue 3 + Composition API**
- Reactive UI with Vue 3's Composition API
- VueUse for browser API integration
- Persistent state management with browser storage

### **Canvas-Based Avatars**
- High-performance 2D canvas rendering
- 60fps animations with requestAnimationFrame
- Particle effects and advanced graphics
- Responsive scaling and interactions

### **Browser Integration**
- **Content Scripts**: Token collection, floating avatar, activity tracking
- **Background Service**: Periodic updates, tab monitoring, state management
- **Popup Interface**: Main game UI, egg selection, shop, inventory
- **Storage API**: Persistent game state across browser sessions

## 📁 Project Structure

```
FloAvatar/
├── entrypoints/
│   ├── popup/           # Main extension popup UI
│   │   ├── App.vue      # Main Vue application
│   │   ├── main.ts      # Vue app initialization
│   │   └── style.css    # Global styles
│   ├── content.ts       # Content script for token collection
│   └── background.ts    # Background service worker
├── public/
│   └── assets/          # Avatar renderer JavaScript files
├── wxt.config.ts        # WXT framework configuration
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

## 🎨 Avatar Types & Abilities

| Avatar | Special Ability | Theme | Colors |
|--------|----------------|-------|---------|
| 🐱 **Cat** | Happy Dance | Kawaii | Pastel pink, lavender |
| 🐲 **Dragon** | Fire Breathing | Fantasy | Red-orange, gold flames |
| 🤖 **Robot** | Processing Mode | Sci-fi | Cyan, green LEDs |
| 👻 **Ghost** | Phasing | Mystical | Ethereal blues, purples |
| 👽 **Alien** | Telepathy | Cosmic | Green skin, cosmic pink |
| 🐼 **Panda** | Bamboo Eating | Zen | Black/white, bamboo green |

## 🏆 Achievements & Tasks

### Daily Tasks (Reset every 24 hours)
- **Website Explorer**: Visit 5 different websites (+10 tokens)
- **Active Browsing**: Spend 30 minutes online (+15 tokens)  
- **Tab Master**: Open 10 new tabs (+8 tokens)
- **Search Guru**: Make 5 search queries (+12 tokens)

### Continuous Rewards
- **Activity Bonus**: Every 50 interactions (+2 tokens)
- **Time Bonus**: Every 5 minutes of activity (+1 token)
- **Site Visit**: Each new page load (+3 tokens)
- **Pet Interaction**: Click your floating avatar (+1 token)

## 💡 Development Tips

### **Adding New Avatar Types**
1. Create new avatar renderer in `public/assets/`
2. Add to `eggTypes` array in `App.vue`
3. Update content script avatar creation switch
4. Design unique egg appearance and abilities

### **Adding New Shop Items**
1. Add to `shopItems` array in `App.vue`
2. Implement item effects in `buyItem()` method
3. Create item icons and descriptions
4. Add inventory usage logic if needed

### **Customizing Token Rewards**
1. Modify reward amounts in `content.ts`
2. Add new activity tracking events
3. Adjust task requirements in `App.vue`
4. Balance economy based on user testing

## 🤝 Contributing

We welcome contributions! Please feel free to:
- Add new avatar types with unique animations
- Improve the token economy and game balance
- Add new shop items and pet care mechanics
- Enhance the UI/UX design
- Fix bugs and optimize performance

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎉 Credits

Built with love using:
- **WXT Framework** for modern extension development
- **Vue 3** for reactive UI components  
- **Canvas API** for high-performance avatar rendering
- **Chrome Extension APIs** for browser integration

---

**Happy pet raising! 🐾✨**

*Start your virtual pet journey today and turn your daily browsing into a delightful adventure!*