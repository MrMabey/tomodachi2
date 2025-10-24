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

## 🚀 Setup

**Requirements:** Python 3.8+, ~4GB RAM

```bash
# Install dependencies
pip install -r requirements_gui.txt

# Start the GUI
./start_tomo_gui.sh
```

Then open **http://localhost:5000**

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
├── orchestrator_adapter/    # Routing LoRA
├── persona_adapter/         # Personality LoRA
├── tomo_gui/                # Web UI (HTML/JS)
├── training_data/           # Training datasets
├── tomo_api.py              # Flask backend
└── start_tomo_gui.sh        # Quick start script
```

**Important:** Adapter directories must stay at project root

---

## 📚 Docs

Want more detail? Check the `/docs` folder:
- `01_ROADMAP.md` — What's next
- `WHATS_NEW.md` — Latest features
- `TOMO_GUI_README.md` — GUI deep dive
- `mood_system/` — Everything about moods

---

## 🛠️ Status

- ✅ Dual-adapter architecture
- ✅ 9-mood personality system
- ✅ Web GUI with live tuning
- ⚠️ Command execution (detection only)
- 🔜 Voice input (Whisper)
- 🔜 Hardware integration (ESP32)

---

## 🤖 Built With

**TinyLlama-1.1B-Chat** · **LoRA (PEFT)** · **Flask** · **Vanilla JS**

*A local, personality-rich AI companion for experimentation and fun* ✨
