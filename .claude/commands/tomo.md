# Load Tomodachi Project Context

Read project documentation to understand current state:
- /Users/mamatoya/tomodachi/documentation/content/docs/concepts/vision.mdx
- /Users/mamatoya/tomodachi/documentation/content/docs/concepts/system.mdx
- /Users/mamatoya/tomodachi/README.md

**Full documentation available at:** https://turtletuber.github.io/tomodachi/

## Project Overview

**Tomodachi** (友達 = friends) - Spatial AI collaboration environment where you and AI agents work together as companions in a shared digital campground.

**Core Concept:**
- NOT a pet simulator or traditional assistant
- Collaborative workspace with embedded AI friends
- 3D explorable world with meaningful spatial zones
- Dual view modes: Immersive (HUD off) vs Technical (HUD on)

**Current Stack:**
- Frontend: Three.js + TypeScript (glassmorphism campground UI)
- Backend: Flask + Python
- AI: TinyLlama 1.1B with dual LoRA adapters (orchestrator + persona)
- Memory: Vector DB (Annoy + SQLite)
- Hardware: Raspberry Pi + ESP32-S3 Smart Knob

**World Zones:**
- 🏕️ Campground - Social hub (chat, coordination)
- 🌲 Sequoia - Visualization tower (knowledge tree)
- 🕳️ Caves - Memory archives (vector storage)
- 🌾 Crops - Processing farm (training/learning)
- 🌊 Waterfall - Data streams (API calls)
- 🏔️ Mountains - Challenge zone (complex tasks)

**Existing Features:**
✅ 9 mood-based AI personalities
✅ Multiple avatar types (Robot, Dragon, Ghost, Alien, Panda, FlowBuddy)
✅ Drag/drop agent system
✅ Vector memory with RAG
✅ Smart knob hardware integration
✅ Glassmorphism 3D UI
✅ GitHub Pages documentation site (Fumadocs)

**In Progress:**
- HUD toggle system (Master Chief / Halo aesthetic)
- ASCII+++ agent visualizations
- Scanner interface for agent inspection
- World zone expansion
- Autonomous agent behaviors (Level 3)
- Claude API integration for complex reasoning

**Project Structure:**
- `/campground/` - Three.js 3D UI and frontend
- `/server/` - Flask API backend
- `/ai/` - AI models and training
- `/memories/` - Vector memory system
- `/smartKnob/` - ESP32 hardware code
- `/documentation/` - Fumadocs site (deployed to GitHub Pages)

**ASCII Avatar Experiments:**
Location: ~/Desktop/ascii_ai/
- experimental_avatar.py (multi-technique: braille, particles, fluid, matrix, zalgo)
- Ready to integrate into campground

---

**I'm now loaded with full Tomodachi context and ready to help!**

What would you like to work on today?
