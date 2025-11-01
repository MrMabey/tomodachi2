# 🤖 Tomo AI Companion

> A personality-rich local AI with 9 distinct moods, powered by TinyLlama and custom LoRA adapters

```bash
./start.sh  # → Campground UI at http://localhost:5173
```

**What makes Tomo different?** Same question, wildly different personalities based on mood state.

> **🆕 NEW:** Easy setup with automatic port allocation and graceful degradation! Works even without adapter weights. See [QUICKSTART.md](QUICKSTART.md) or [SETUP.md](SETUP.md) for details.

---

## ✨ Features

🎭 **9 Distinct Moods** — From creative brainstorming to focused debugging
🧠 **Smart Routing** — Orchestrator decides: chat or command execution
🧠 **Vector Memory** — RAG-based conversation memory with similarity search
⚡ **Runs Locally** — No API keys, no cloud dependencies
🎛️ **Live Tuning** — Adjust temperature, top-k, top-p in real-time
🎨 **Glassmorphism UI** — Beautiful liquid glass chat interface with 3D scene
🌐 **Dual Interface** — Campground (3D) + Memory Admin (localhost:5003)
🎛️ **Hardware Control** — ESP32-S3 Smart Knob with touchscreen integration

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

**Requirements:** Python 3.8+, ~4GB RAM, Node.js (for Campground UI)

```bash
# Clone the repo
git clone https://github.com/turtletuber/tomodachi.git
cd tomodachi

# Start Tomo (launches all services)
./start_tomo_gui.sh
```

This starts:
- **Tomo API** → http://localhost:8080/api
- **Campground UI** → http://localhost:8080 (3D glassmorphism chat)
- **Memory Service** → http://localhost:5003 (vector DB admin)

The startup script will:
1. Create a virtual environment (if needed)
2. Install Python dependencies from `server/requirements.txt`
3. Install Node dependencies for Campground UI
4. Start the Flask API server with both adapters loaded
5. Start the memory service (edge RAG with Annoy vector DB)
6. Launch Campground UI with Vite dev server

**First run takes ~2 minutes** to download TinyLlama model (~2GB).

### 📦 Getting the Adapters (Optional but Recommended)

To unlock Tomo's full personality and smart routing features, you need LoRA adapters. The system will function without them, but it will use the generic base model.

You have two options:

1.  **Train Locally (Recommended for Devs):** Generate your own adapters from the source data. This ensures you have the latest version.
    ```bash
    # This will take a while!
    ./scripts/train_adapters.sh
    ```

2.  **Download Pre-Trained:** Get started quickly by downloading a pre-trained set.
    ```bash
    ./scripts/install_adapters.sh <URL_to_adapter_archive.tar.gz>
    ```

For detailed instructions on both methods, please see the **[SETUP.md](SETUP.md)** guide.

---

## 🏗️ How It Works

```
User Input → Orchestrator (routing) → Persona (mood-based) → Response
              ↓                          ↓
         Memory Retrieval          RAG Context Injection
              ↓                          ↓
         Command Intent            Similarity Search
```

**Three-Layer Architecture:**
- **Orchestrator Adapter** — Consistent routing (no mood influence)
- **Persona Adapter** — Mood-driven responses (9 personalities)
- **Memory System** — Vector-based RAG with Annoy index (384-dim embeddings)

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
│   ├── tomo_api.py          # Main API server (port 8080)
│   └── requirements.txt     # Python dependencies
├── campground/              # 3D Glassmorphism UI
│   ├── index.html           # Main campground interface
│   ├── public/ui.js         # Chat UI logic
│   ├── src/main.ts          # Three.js 3D scene
│   └── package.json         # Node dependencies
├── memories/                # Vector memory system
│   ├── edge_rag.py          # RAG implementation
│   ├── web.py               # Memory admin UI (port 5003)
│   └── data/                # Annoy index + SQLite DB
├── smartKnob/               # ESP32-S3 Smart Knob integration
│   ├── knob_button_test/    # LVGL touchscreen button → WiFi → Mac
│   └── 01-08_*_Test/        # Sample code (ADC, SD, audio, encoder, LVGL)
├── docs/                    # Documentation
└── start_tomo_gui.sh        # Launch script (all services)
```

---

## 📚 Docs

Want more detail? Check the `/docs` folder:
- `project_docs/` — Project specs, roadmap, architecture
- `mood_system/MOOD_SYSTEM.md` — Complete mood guide
- `sessions/` — Development notes and session logs

---

## 🛠️ Status

- ✅ Dual-adapter architecture (orchestrator + persona)
- ✅ 9-mood personality system with live parameter control
- ✅ Campground glassmorphism UI with 3D scene
- ✅ Vector memory system (RAG with Annoy + SQLite)
- ✅ Memory admin interface (query, ingest, inspect)
- ✅ Smart Knob hardware integration (ESP32-S3 with LVGL touchscreen)
- ⚠️ Command execution (detection only, not execution)
- ⚠️ Memory injection (disabled by default, needs tuning)
- 🔜 Voice input (Whisper STT)
- 🔜 Audio recording via Smart Knob microphone

---

## 🎮 Using Campground UI

**Chat Interface:**
- Glassmorphism sidebar slides in from left
- Messages appear at center, stack upward
- Auto-expanding textarea (Shift+Enter for new line)
- Fade gradient at top for infinite scroll effect

**Toolbox (bottom-right):**
- 💬 Chat — Toggle glassmorphism sidebar
- 🎛️ Inference — Adjust temperature, tokens, etc.
- 🎭 Mood — Switch between 9 personality modes
- 📊 Status — System info and model status
- 🧠 Memories — Open vector DB admin (new window)

**Smart Knob Indicator (top-right):**
- 🎛️ Knob status display
- Shows "PRESSED!" when button tapped on knob touchscreen
- Polls every 500ms for hardware events

**Keyboard Shortcuts:**
- `Enter` — Send message
- `Shift+Enter` — New line in textarea
- `Ctrl/Cmd+K` — Focus input
- `Esc` — Close sidebar
- Click outside — Close sidebar

## 🧠 Memory System

**Vector Database:**
- **Engine:** Annoy (Approximate Nearest Neighbors)
- **Embedding Model:** sentence-transformers/all-MiniLM-L6-v2 (384-dim)
- **Storage:** SQLite + Annoy index
- **Features:** Similarity search, thread-based filtering, metadata tracking

**Memory Admin UI (localhost:5003):**
- Query memories by similarity
- View all documents with metadata
- Ingest new documents manually
- Inspect embedding/retrieval times
- Delete unwanted memories

**Current Status:** Memory retrieval is working but **disabled by default** in chat responses to prevent context leakage. Enable by setting `use_memory=True` in `process_chat_response()`.

---

## 🎛️ Smart Knob Hardware

**Hardware:** Waveshare ESP32-S3-Knob-Touch-LCD-1.8 ([specs](smartKnob/HARDWARE_SPECS.md))

**Features:**
- 1.8" touchscreen UI with LVGL 8.3.11
- Dual ESP32 processors (S3R8 + U4WDH)
- WiFi communication with Mac/server
- I2S digital microphone for voice input
- PCM5100A stereo DAC with 3.5mm output
- DRV2605 haptic motor driver
- Dual rotary encoders
- Real-time status updates in Campground UI

**How It Works:**
```
User taps button on knob → HTTP POST via WiFi → Flask API (/api/knob/trigger)
                                                        ↓
                                            Campground UI polls /api/knob/status
                                                        ↓
                                            Green indicator lights up in browser
```

**Setup:**
1. Flash `smartKnob/knob_button_test/knob_button_test.ino` to ESP32-S3
2. Configure WiFi credentials in the .ino file
3. Update Mac IP address in `MAC_URL` constant
4. Start Tomo services with `./start_tomo_gui.sh`
5. Open Campground UI and tap the green button on the knob screen

**Next Steps:** Audio recording via I2S microphone → voice input for Tomo

---

## 🤖 Built With

**AI/ML:** TinyLlama-1.1B-Chat · LoRA (PEFT) · sentence-transformers
**Backend:** Flask · Annoy · SQLite
**Frontend:** Three.js · Vite · TypeScript
**Hardware:** ESP32-S3 · LVGL 8.3.11 · Arduino

*A local, personality-rich AI companion for experimentation and fun* ✨
