# 🤖 Tomo AI Companion

> A personality-rich local AI with 9 distinct moods, powered by TinyLlama and custom LoRA adapters

```bash
./start_tomo_gui.sh  # → http://localhost:5000
```

**What makes Tomo different?** Same question, wildly different personalities based on mood state.

---

## ✨ Features

🎭 **9 Distinct Moods** — From creative brainstorming to focused debugging
🧠 **Smart Routing** — Orchestrator decides: chat or command execution
⚡ **Runs Locally** — No API keys, no cloud dependencies
🎛️ **Live Tuning** — Adjust temperature, top-k, top-p in real-time
🎨 **Clean Web UI** — Simple, responsive interface

---

## 🎭 The 9 Moods

| Mood | 🌡️ Temp | Use Case |
|------|---------|----------|
| **FOCUSED** | 0.3 | Precise code, debugging |
| **CREATIVE** | 1.2 | Wild ideas, brainstorming |
| **HELPFUL** | 0.7 | Teaching, patient support |
| **LISTENING** | 0.5 | Short, attentive responses |
| **THINKING** | 0.6 | Step-by-step analysis |
| **SUCCESS** | 0.8 | Celebrating wins |
| **ERROR** | 0.4 | Calm troubleshooting |
| **SLEEPING** | 0.2 | Minimal, low-energy |
| **PHONE_HOME** | 0.9 | Complex task delegation |

**Example:** Ask "How do I reverse a string in Python?"
- FOCUSED: `s[::-1]` *(just code)*
- CREATIVE: 5+ playful alternatives
- HELPFUL: Friendly tutorial with examples
- THINKING: Step-by-step with trade-offs

---

## 🚀 Quick Start

**Requirements:** Python 3.8+, ~4GB RAM

```bash
# Clone the repo
git clone https://github.com/turtletuber/tomodachi.git
cd tomodachi

# Start the GUI (auto-creates venv and installs dependencies)
./start_tomo_gui.sh
```

Then open **http://localhost:5000** in your browser.

The startup script will:
1. Create a virtual environment (if needed)
2. Install all dependencies from `server/requirements.txt`
3. Start the Flask server with both adapters loaded
4. Serve the GUI at http://localhost:5000

**First run takes ~2 minutes** to download TinyLlama model (~2GB).

---

## 🏗️ How It Works

```
User Input → Orchestrator (routing) → Persona (mood-based) → Response
                                   └→ Command (intent extraction)
```

**Two-Adapter System:**
- **Orchestrator** — Consistent routing (no mood influence)
- **Persona** — Mood-driven responses (9 personalities)

---

## 📁 Project Structure

```
tomodachi/
├── ai/                      # AI models & training
│   ├── orchestrator_adapter/ # Routing LoRA
│   ├── persona_adapter/     # Personality LoRA
│   ├── scripts/             # Training scripts
│   └── training_data/       # Training datasets
├── server/                  # Flask backend
│   ├── tomo_api.py          # API server
│   └── requirements.txt     # Dependencies
├── gui/                     # Web UI (HTML/JS)
├── smartKnob/               # Hardware integration
├── database/                # Conversation storage
├── docs/                    # Documentation
└── start_tomo_gui.sh        # Quick start script
```

---

## 📚 Docs

Want more detail? Check the `/docs` folder:
- `project_docs/` — Project specs, roadmap, architecture
- `mood_system/MOOD_SYSTEM.md` — Complete mood guide
- `sessions/` — Development notes and session logs

---

## 🛠️ Status

- ✅ Dual-adapter architecture
- ✅ 9-mood personality system
- ✅ Web GUI with live tuning
- ⚠️ Command execution (detection only)
- 🔜 Voice input (Whisper)
- 🔜 Hardware integration (Smart Knob)

---

## 🤖 Built With

**TinyLlama-1.1B-Chat** · **LoRA (PEFT)** · **Flask** · **Vanilla JS**

*A local, personality-rich AI companion for experimentation and fun* ✨
