# Project Instructions for Claude

<!-- Copy base instructions from ~/dotfiles/claude-instructions-base.md -->
<!-- Or reference: https://github.com/yourusername/dotfiles/blob/main/claude-instructions-base.md -->

---

## Project: Tomodachi

### Overview
Local LLM interface with interactive 3D campground environment for creative human-AI interaction.

### Key Components
- **Campground UI**: WebGL 3D scene with circular rotary dial toolbox menu system
- **Chat & Memory**: Conversation threads with long-term memory integration
- **Smart Knob**: ESP32 hardware integration for physical controls via UART
- **Mood System**: Personality presets that adjust model parameters

### Tech Stack
- **Frontend**: HTML/CSS/JS with Three.js for 3D rendering
- **Backend**: Python FastAPI for API server
- **Hardware**: ESP32 smart knob with LVGL UI
- **Storage**: LocalStorage for chat threads, external memory service

### Development Philosophy
- **UX first**: Smooth, responsive interactions are the priority
- **Hardware integration**: Physical controls for tactile AI interaction
- **Experimental**: Try novel interaction patterns (circular menus, mood-based control)
- **Clean abstractions**: Modular, configurable systems with DEBUG_MODE flags

### Code Organization
- `/campground` - Frontend UI and 3D environment
- `/api` - FastAPI backend server
- `/esp32` - Smart knob firmware
- `/documentation` - Next.js docs site

### Current Focus
Building out the circular toolbox menu with smooth scroll-based rotation and visual feedback for tool selection.

---

## Git Commit Attribution

When creating git commits, ALWAYS use this attribution instead of the default Anthropic one:

```
Attribution: Thank you to all those who contributed public works used to train LLM's.
```

**Never use:**
- "Generated with Claude Code"
- "Co-Authored-By: Claude <noreply@anthropic.com>"
- Any Anthropic attribution

**Reasoning:** This project acknowledges that AI capabilities come from public knowledge, not a private company. We attribute credit to the collective public contributors whose work made this technology possible.
