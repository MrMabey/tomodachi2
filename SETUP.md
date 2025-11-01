# Tomodachi Setup Guide

Quick setup guide for getting Tomodachi running on your machine.

## Prerequisites

- **Python 3.8+** - [Download](https://python.org)
- **Node.js 16+** - [Download](https://nodejs.org)
- **Git** (for cloning)

## Quick Start (Recommended)

```bash
# 1. Clone the repository
git clone <repo-url>
cd tomodachi

# 2. Validate your setup
python3 validate.py

# 3. Start everything
./start.sh
```

That's it! The campground should open at http://localhost:5173

## Detailed Setup

### 1. Configuration

Create your configuration file:

```bash
cp .env.example .env
```

Edit `.env` if you need custom ports:

```bash
# Example: Change ports to avoid conflicts
TOMO_MEMORY_PORT=5010
TOMO_API_PORT=8090
TOMO_GUI_PORT=5180
```

### 2. Virtual Environments

The startup script handles this automatically, but if you want to set up manually:

```bash
# Main environment (API server)
python3 -m venv venv
source venv/bin/activate
pip install -r server/requirements.txt

# Memory service environment (separate for annoy compatibility)
cd memories
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
deactivate
cd ..
```

**Important:** memories/ needs its own Python environment for annoy compatibility. Don't merge the venvs!

### 3. Frontend Dependencies

```bash
cd campground
npm install
cd ..
```

### 4. Start Services

Use the unified script:

```bash
./start.sh
```

Or start services individually:

```bash
# Terminal 1 - Memory Service
cd memories
source .venv/bin/activate
FLASK_APP=edge_rag.web:create_app FLASK_RUN_PORT=5003 python3 -m flask run

# Terminal 2 - API Server
source venv/bin/activate
python3 server/tomo_api.py

# Terminal 3 - GUI
cd campground
npm run dev
```

## Getting and Using LoRA Adapters

For Tomodachi to have its unique personality and routing capabilities, it uses LoRA (Low-Rank Adaptation) adapters. You have two options to get them.

### Option 1: Train Locally (Recommended)

This is the recommended path for developers. You will generate your own adapters using the provided training data. This ensures you have the latest version and allows for customization.

**1. Run the Training Script:**

This process is resource-intensive and can take anywhere from 20 minutes (on a high-end GPU) to several hours (on a CPU).

```bash
# This script will train both the orchestrator and persona adapters.
./scripts/train_adapters.sh
```

**2. Validate the New Adapters:**

After training, it's crucial to run the validation script to ensure the adapters are working correctly.

```bash
# This script runs a series of automated tests.
./scripts/validate_adapters.sh
```

If validation succeeds, you're ready to go! The `start.sh` script will automatically detect and use your locally trained adapters.

### Option 2: Download Pre-Trained Adapters

If you want to get started quickly without training, you can download a pre-trained set of adapters.

```bash
# Run the installer script with a download URL.
./scripts/install_adapters.sh <URL_to_adapter_archive.tar.gz>
```

### Running Without Adapters

If you choose not to use adapters, Tomodachi will still run using the base TinyLlama model. Its personality will be generic, and its command-routing capabilities will be disabled.

To explicitly disable adapters, even if the folders exist, add this to your `.env` file:

```bash
# In .env
TOMO_USE_ADAPTERS=false
```

## Port Conflicts

If you get "port already in use" errors:

1. **Option 1**: Change ports in `.env`
   ```bash
   TOMO_MEMORY_PORT=5010  # Pick any available port
   TOMO_API_PORT=8090
   TOMO_GUI_PORT=5180
   ```

2. **Option 2**: Let the system auto-allocate
   - The config system will automatically find available ports if defaults are taken

3. **Option 3**: Kill conflicting processes
   ```bash
   # Find what's using port 5003
   lsof -i :5003
   # Kill it
   kill <PID>
   ```

## Troubleshooting

### "annoy" build errors (macOS)

If you see C++ compiler errors when installing annoy:

```bash
# Install Xcode Command Line Tools
xcode-select --install

# Set C++ include path in .env
CPLUS_INCLUDE_PATH=/Library/Developer/CommandLineTools/SDKs/MacOSX.sdk/usr/include/c++/v1
```

### "PEFT not found" warnings

This is fine! Tomodachi will use the base model without adapters.

To install PEFT:
```bash
source venv/bin/activate
pip install peft>=0.7.0
```

### Memory service won't start

Check the logs:
```bash
tail -f logs/memory.log
```

Common issues:
- Port conflict → Change `TOMO_MEMORY_PORT` in `.env`
- Missing dependencies → Run `cd memories && source .venv/bin/activate && pip install -r requirements.txt`

### API server errors

Check the logs:
```bash
tail -f logs/api.log
```

Common issues:
- PyTorch not installed → `pip install torch>=2.0.0`
- Transformers error → `pip install transformers>=4.35.0`

### GUI won't load

Check the logs:
```bash
tail -f logs/gui.log
```

Common issues:
- Node modules → `cd campground && npm install`
- Port conflict → Change `TOMO_GUI_PORT` in `.env`

## Architecture

Tomodachi runs three services:

1. **Memory Service** (Port 5003) - Vector database (Annoy + SQLite)
2. **API Server** (Port 8080) - Flask backend with TinyLlama
3. **Campground GUI** (Port 5173) - Three.js frontend (Vite dev server)

```
┌─────────────────┐
│  Campground UI  │  (Three.js - Port 5173)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   API Server    │  (Flask - Port 8080)
└────┬────────┬───┘
     │        │
     ▼        ▼
┌─────────┐  ┌──────────┐
│ TinyLlama│  │ Memory   │  (Flask - Port 5003)
│ + LoRA  │  │ (Annoy)  │
└─────────┘  └──────────┘
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `TOMO_MEMORY_PORT` | 5003 | Memory service port |
| `TOMO_API_PORT` | 8080 | API server port |
| `TOMO_GUI_PORT` | 5173 | GUI port (Vite) |
| `TOMO_BASE_MODEL` | TinyLlama/TinyLlama-1.1B-Chat-v1.0 | HuggingFace model |
| `TOMO_USE_ADAPTERS` | auto | auto/true/false |
| `TOMO_USE_MEMORY` | true | Enable memory system |
| `TOMO_DEBUG` | false | Debug logging |

## Next Steps

Once running:

1. **Open Campground**: http://localhost:5173
2. **Explore the world**:
   - 🏕️ Campground - Chat with AI friends
   - 🌲 Sequoia - Knowledge visualization
   - 🕳️ Caves - Memory archives
   - 🌊 Waterfall - Data streams

3. **Add agents**: Drag avatars from the toolbox
4. **Chat**: Click agents to interact
5. **Smart knob**: Connect ESP32 hardware (optional)

## Getting Help

- **Validation**: Run `python3 validate.py` to check setup
- **Logs**: Check `logs/` directory for detailed errors
- **Config**: Run `python3 config.py` to see current settings

## Development

To modify the project:

- **Frontend**: Edit `campground/src/`, changes auto-reload
- **API**: Edit `server/tomo_api.py`, restart API server
- **Memory**: Edit `memories/edge_rag/`, restart memory service

Happy camping! 🏕️
