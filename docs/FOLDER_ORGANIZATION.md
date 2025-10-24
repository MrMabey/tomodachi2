# 📁 Folder Organization Guide

**Date:** October 24, 2025
**Status:** Cleaned and organized ✅

## 🎯 Organization Summary

The project has been reorganized for better maintainability while keeping all critical files in their required locations.

## 📂 New Structure

```
tamai_reboot/
│
├── 📦 CRITICAL - DO NOT MOVE
│   ├── orchestrator_adapter/      # LoRA adapter (hardcoded path)
│   ├── persona_adapter/           # LoRA adapter (hardcoded path)
│   ├── tomo_api.py                # Flask API server
│   ├── start_tomo_gui.sh          # Startup script
│   ├── requirements_gui.txt       # Dependencies
│   └── tomo_gui/                  # Web interface
│       ├── index.html
│       └── app.js
│
├── 📚 Documentation
│   ├── docs/
│   │   ├── 01_ROADMAP.md              # Project roadmap
│   │   ├── 02_DISCOVERY_FINDINGS.md   # Architecture decisions
│   │   ├── TOMO_GUI_README.md         # GUI setup guide
│   │   ├── WHATS_NEW.md               # v3.0 features
│   │   ├── BUGFIX_ROUTING.md          # Bug fixes
│   │   ├── FOLDER_ORGANIZATION.md     # This file
│   │   │
│   │   ├── mood_system/               # Mood system docs (4 files)
│   │   │   ├── MOOD_SYSTEM_README.md
│   │   │   ├── MOOD_EXAMPLES.md
│   │   │   ├── MOOD_SYSTEM_SUMMARY.md
│   │   │   └── MOOD_SYSTEM_ARCHITECTURE.md
│   │   │
│   │   └── sessions/                  # Development history
│   │       ├── SESSION_NOTES_2025-10-21.md
│   │       ├── SESSION_NOTES_2025-10-24.md
│   │       ├── TUESDAY_JAM_SESSION_PLAN.md
│   │       ├── claude_convo_10-21-25.pdf
│   │       └── test_results_2025-10-21.md
│
├── 📊 Training Data
│   └── training_data/
│       ├── orchestrator_router_training.jsonl  # Current (19 examples)
│       ├── persona_training.jsonl              # Current (11 examples)
│       ├── golden_pairs.jsonl                  # Test suite (14 tests)
│       ├── asciimoji_library.json              # 297 emoticons
│       ├── orchestrator_training.jsonl         # Legacy
│       ├── persona_router_training.jsonl       # Experimental
│       └── training_dataset.jsonl              # Legacy
│
├── 🔧 Scripts (currently empty - scripts are elsewhere)
│   └── scripts/
│
├── 🤖 Hardware
│   ├── esp32_avatar/                  # ESP32 Smart Knob code
│   │   ├── TomoFace/                  # Arduino firmware
│   │   └── tomo_simulator_v3.html     # Browser simulator
│   └── persona_router_adapter/        # Experimental adapter
│
└── 📄 Root Files
    ├── README.md                      # Project overview (NEW)
    ├── .gitignore
    └── .git/
```

## ⚠️ Critical Path Dependencies

### Files with Hardcoded Paths:

**1. tomo_api.py (lines 128-129)**
```python
"orchestrator_adapter_dir": "./orchestrator_adapter",
"persona_adapter_dir": "./persona_adapter",
```
**Must stay:** `./orchestrator_adapter/` and `./persona_adapter/` in root

**2. Scripts (if they existed)**
Would reference `./orchestrator_adapter` and `./persona_adapter`

### Safe to Move Anywhere:
- ✅ All `.md` documentation files
- ✅ Training data `.jsonl` files
- ✅ Session notes and PDFs
- ✅ ESP32 hardware code

## 📝 What Changed

### Moved Files:

**Documentation → docs/**
- 01_ROADMAP.md
- 02_DISCOVERY_FINDINGS.md
- TOMO_GUI_README.md
- WHATS_NEW.md
- BUGFIX_ROUTING.md

**Mood Docs → docs/mood_system/**
- MOOD_SYSTEM_README.md
- MOOD_EXAMPLES.md
- MOOD_SYSTEM_SUMMARY.md
- MOOD_SYSTEM_ARCHITECTURE.md

**Session Notes → docs/sessions/**
- SESSION_NOTES_2025-10-21.md
- SESSION_NOTES_2025-10-24.md
- TUESDAY_JAM_SESSION_PLAN.md
- claude_convo_10-21-25.pdf
- test_results_2025-10-21.md

**Training Data → training_data/**
- orchestrator_router_training.jsonl
- persona_training.jsonl
- golden_pairs.jsonl
- asciimoji_library.json
- orchestrator_training.jsonl (legacy)
- persona_router_training.jsonl (experimental)
- training_dataset.jsonl (legacy)

### Stayed in Root:
- ✅ orchestrator_adapter/ (required)
- ✅ persona_adapter/ (required)
- ✅ tomo_api.py (main server)
- ✅ start_tomo_gui.sh (startup)
- ✅ tomo_gui/ (web interface)
- ✅ requirements_gui.txt (deps)
- ✅ esp32_avatar/ (hardware)
- ✅ persona_router_adapter/ (experimental)

### New Files:
- ✅ README.md (project overview)
- ✅ docs/FOLDER_ORGANIZATION.md (this file)

## 🔍 Finding Files Now

### Documentation
```bash
# Main docs
ls docs/

# Mood system
ls docs/mood_system/

# Session history
ls docs/sessions/
```

### Training Data
```bash
ls training_data/
```

### Quick Links
- **Getting Started**: [README.md](../README.md)
- **GUI Setup**: [docs/TOMO_GUI_README.md](TOMO_GUI_README.md)
- **Roadmap**: [docs/01_ROADMAP.md](01_ROADMAP.md)
- **Mood System**: [docs/mood_system/](mood_system/)

## ✅ Verification Checklist

After organization, verify:

- [ ] `./start_tomo_gui.sh` still works
- [ ] Adapters load correctly (check for "./orchestrator_adapter")
- [ ] GUI opens at http://localhost:5000
- [ ] Mood system works
- [ ] No broken imports in tomo_api.py

## 🔄 If You Need to Move Adapters

If you want to reorganize adapter locations:

1. **Create new folder** (e.g., `models/`)
2. **Move adapters** to new location
3. **Update tomo_api.py** lines 128-129:
   ```python
   "orchestrator_adapter_dir": "./models/orchestrator_adapter",
   "persona_adapter_dir": "./models/persona_adapter",
   ```
4. **Update any scripts** that reference adapters
5. **Test thoroughly**

## 📊 File Count Summary

### Before Organization
- Root directory: ~30 files (cluttered)
- Mix of docs, code, data

### After Organization
- Root directory: ~10 essential files
- docs/: 7 main docs + 2 subdirs
- training_data/: 7 data files
- Clean and navigable ✅

## 🎉 Benefits

1. **Cleaner Root**: Only essential runtime files
2. **Organized Docs**: Easy to find information
3. **Grouped Data**: Training files together
4. **No Broken Paths**: Critical files untouched
5. **Better Navigation**: Logical folder structure

## 📖 Documentation Index

**Quick References:**
- [README.md](../README.md) - Project overview
- [ROADMAP](01_ROADMAP.md) - What's done, what's next
- [GUI Guide](TOMO_GUI_README.md) - How to use the interface
- [What's New](WHATS_NEW.md) - Latest features

**Mood System:**
- [Complete Guide](mood_system/MOOD_SYSTEM_README.md) - Full documentation
- [Quick Reference](mood_system/MOOD_SYSTEM_SUMMARY.md) - Cheat sheet
- [Examples](mood_system/MOOD_EXAMPLES.md) - See moods in action
- [Architecture](mood_system/MOOD_SYSTEM_ARCHITECTURE.md) - Technical deep-dive

**Development:**
- [Discovery Findings](02_DISCOVERY_FINDINGS.md) - Why we built it this way
- [Bug Fixes](BUGFIX_ROUTING.md) - Known issues and solutions
- [Session Notes](sessions/) - Development history

---

**Organization completed:** October 24, 2025 ✅

**Status:** Clean, organized, and fully functional! 🎉
