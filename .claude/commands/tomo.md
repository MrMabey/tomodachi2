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
✅ **Dynamic port allocation** (auto-finds available ports)
✅ **Graceful adapter fallback** (runs without weights, trains later)
✅ **Cross-platform compatibility** (macOS/Linux with auto-detection)
✅ **Automated validation** (test adapters before deployment)

**In Progress:**
- HUD toggle system (Master Chief / Halo aesthetic)
- ASCII+++ agent visualizations
- Scanner interface for agent inspection
- World zone expansion
- Autonomous agent behaviors (Level 3)
- Claude API integration for complex reasoning

**Project Structure:**
- `/campground/` - Three.js 3D UI and frontend
- `/server/` - Flask API backend (tomo_api.py with mood system)
- `/ai/` - AI models and training scripts
- `/memories/` - Vector memory system (separate venv for annoy)
- `/smartKnob/` - ESP32 hardware code
- `/documentation/` - Fumadocs site (deployed to GitHub Pages)
- `/scripts/` - Setup and training automation (train_adapters.sh, validate_adapters.sh)

**Key Files:**
- `start.sh` - Unified startup (manages 3 services, creates venvs, handles ports)
- `config.py` - Centralized config (dynamic port allocation, feature detection)
- `ai/scripts/validate_training.py` - Automated adapter testing
- `memories/scripts/setup_venv.sh` - Memory service venv setup

**ASCII Avatar Experiments:**
Location: ~/Desktop/ascii_ai/
- experimental_avatar.py (multi-technique: braille, particles, fluid, matrix, zalgo)
- Ready to integrate into campground

---

## Portability & New Dev Experience

**Zero to Running (without adapters):**
```bash
git clone https://github.com/turtletuber/tomodachi.git
cd tomodachi
./start.sh  # Auto-creates .env, venvs, installs deps, finds ports
```
- Works immediately with base TinyLlama
- Shows helpful first-time guidance
- No hard requirements for weights/adapters

**Adding Adapters (later):**
```bash
./scripts/train_adapters.sh      # Train orchestrator + persona
./scripts/validate_adapters.sh   # Verify quality
./start.sh                       # Now runs with adapters
```

**Smart Features:**
- **Dynamic ports**: If 5003/8080/5173 busy, auto-finds alternatives
- **Graceful fallback**: No adapters? Uses base model. No PEFT? Still works.
- **Cross-platform**: Detects macOS, sets C++ paths for annoy compilation
- **Self-documenting**: Color-coded output, explains each step, suggests next actions
- **Validation**: Automated tests ensure adapters work before deployment

---

**I'm now loaded with full Tomodachi context and ready to help!**

What would you like to work on today?
