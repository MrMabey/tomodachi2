# 🤖 Tomo AI Control Panel

A beautiful web-based GUI for interacting with the Tomo AI system. This interface provides full control over the Orchestrator-as-Router architecture with real-time visualization and parameter tuning.

## Features

### 💬 Chat Interface
- Interactive conversation with Tomo
- Real-time message history
- Visual distinction between chat and command responses
- Automatic route detection (Chat vs Command)
- Response metadata display (latency, intent, decision)

### ⚙️ Inference Parameters
Adjust AI behavior in real-time:
- **Temperature** (0.0 - 2.0): Controls randomness/creativity
- **Max Tokens** (10 - 500): Length of responses
- **Top-K** (1 - 100): Sampling diversity
- **Top-P** (0.0 - 1.0): Nucleus sampling threshold
- **Do Sample**: Toggle sampling vs greedy decoding

### 🎭 Mood Control (NEW!)
**Each mood automatically adjusts BOTH inference parameters AND system prompts!**

Control Tomo's personality with 9 moods that change behavior:
- **FOCUSED** (o_o) T=0.3 - Precise, concise, task-oriented
- **CREATIVE** (^-^) T=1.2 - Imaginative, playful, diverse
- **HELPFUL** (^_~) T=0.7 - Friendly, patient, supportive
- **LISTENING** (•_•) T=0.5 - Brief, attentive, clarifying
- **THINKING** (◉_◉) T=0.6 - Analytical, step-by-step reasoning
- **SUCCESS** (^o^) T=0.8 - Enthusiastic, encouraging, positive
- **ERROR** (x_x) T=0.4 - Calm, solution-focused, debugging
- **SLEEPING** (-_-) T=0.2 - Minimal, low-energy, brief
- **PHONE_HOME** (⊙_⊙) T=0.9 - Escalation to external systems

**Same question, different moods = dramatically different answers!**

See `MOOD_SYSTEM_README.md` for complete documentation.

### 📊 System Status
Real-time monitoring:
- API connection status (online/offline)
- Model loaded state
- Current adapter (orchestrator/persona)
- Message count
- Model unload control

### ⚡ Performance Metrics
Track system performance:
- Average response time
- Last response time
- Total chat responses
- Total commands detected

## Architecture

```
┌─────────────────┐
│   Web Browser   │
│  (GUI Client)   │
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────┐
│  Flask API      │
│  (tomo_api.py)  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Tomo AI Engine                     │
│  ┌───────────────┐  ┌─────────────┐ │
│  │ Orchestrator  │→│ Chat Route  │ │
│  │   Adapter     │  └─────────────┘ │
│  └───────────────┘  ┌─────────────┐ │
│         │          │ Command     │ │
│         └─────────→│ Route       │ │
│                    └─────────────┘ │
└─────────────────────────────────────┘
```

## Installation

### Prerequisites
- Python 3.8+
- Virtual environment (recommended)
- ~4GB RAM for TinyLlama model
- Trained LoRA adapters (orchestrator_adapter, persona_adapter)

### Quick Start

1. **Install dependencies:**
```bash
pip install -r requirements_gui.txt
```

Or manually:
```bash
pip install flask flask-cors torch transformers peft accelerate
```

2. **Verify adapter directories exist:**
```bash
ls orchestrator_adapter/  # Should contain adapter_config.json, adapter_model.bin
ls persona_adapter/       # Should contain adapter_config.json, adapter_model.bin
```

3. **Start the server:**
```bash
./start_tomo_gui.sh
```

Or manually:
```bash
python3 tomo_api.py
```

4. **Open your browser:**
```
http://localhost:5000
```

## Usage

### Basic Interaction

1. **Type a message** in the input field at the bottom
2. **Press Enter** or click "Send"
3. Tomo will process your input through the orchestrator
4. You'll see either:
   - A conversational response (Chat route)
   - A structured command (Command route with intent)

### Examples

**Chat Examples:**
- "Hello Tomo!"
- "What can you do?"
- "Tell me about your modes"

**Command Examples:**
- "Take a note: buy groceries"
- "Add milk to my shopping list"
- "Set a reminder for 3pm"
- "Send an email to John"
- "Show me my todos"

### Adjusting Parameters

1. Use the sliders in the "Inference Parameters" panel
2. Values update in real-time (shown in colored badges)
3. Click "Apply Parameters" to send to the server
4. Next message will use the new settings

### Changing Mood

1. Click any mood button in the "Mood Control" panel
2. The current mood display updates immediately
3. This can be integrated with ESP32 hardware for visual feedback

### Monitoring Performance

- Check the bottom metrics panel for statistics
- Average response time shows overall system speed
- Chat vs Command counts show routing behavior
- Use this to identify performance issues

## API Endpoints

The Flask backend exposes these REST endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/inference` | POST | Process user input through Tomo |
| `/api/history` | GET | Retrieve conversation history |
| `/api/history` | DELETE | Clear conversation history |
| `/api/status` | GET | Get system status |
| `/api/parameters` | GET | Get current inference parameters |
| `/api/parameters` | POST | Update inference parameters |
| `/api/mood` | POST | Set current mood/state |
| `/api/adapters` | GET | List available adapters |
| `/api/model/unload` | POST | Unload model from memory |

### Example API Call

```bash
curl -X POST http://localhost:5000/api/inference \
  -H "Content-Type: application/json" \
  -d '{"input": "Hello Tomo!"}'
```

Response:
```json
{
  "input": "Hello Tomo!",
  "orchestrator_decision": {"action": "chat"},
  "orchestrator_raw": "{\"action\": \"chat\"}",
  "orchestrator_latency": 0.234,
  "response": "Hey there! How can I help you today? (^_~)",
  "persona_latency": 0.456,
  "route": "chat",
  "total_latency": 0.690,
  "mood": "HELPFUL",
  "timestamp": "2025-10-23T14:30:00.123456"
}
```

## Keyboard Shortcuts

- **Enter**: Send message
- **Ctrl/Cmd + K**: Focus input field
- **Ctrl/Cmd + L**: Clear history

## Customization

### Changing Base Model

Edit `tomo_api.py`:
```python
state.model_config = {
    "base_model_name": "your-model-name",  # Change this
    "orchestrator_adapter_dir": "./orchestrator_adapter",
    "persona_adapter_dir": "./persona_adapter",
}
```

### Adjusting Default Parameters

Edit `tomo_api.py`:
```python
state.inference_params = {
    "max_new_tokens": 150,    # Increase for longer responses
    "temperature": 0.7,       # Higher = more creative
    "top_k": 50,
    "top_p": 0.95,
    "do_sample": True
}
```

### Customizing the GUI

- **HTML**: Edit `tomo_gui/index.html`
- **CSS**: Styles are in `<style>` tag in index.html
- **JavaScript**: Edit `tomo_gui/app.js`

### Adding New Moods

1. Add mood to valid_moods list in `tomo_api.py`
2. Add CSS class in `index.html` (`.mood-YOURNAME`)
3. Add button in mood-grid section

## Troubleshooting

### "Connection refused" or "API Offline"
- Ensure Flask server is running (`python3 tomo_api.py`)
- Check that port 5000 is not in use
- Try `lsof -i :5000` to see what's using the port

### "Model not found"
- Verify adapter directories exist and contain required files
- Check paths in `tomo_api.py` are correct
- Ensure you've trained the adapters first

### Slow response times
- First inference is always slow (model loading)
- Reduce `max_new_tokens` for faster responses
- Consider using GPU if available
- Check system RAM usage

### JSON parsing errors
- Orchestrator adapter may need more training
- Check `orchestrator_router_training.jsonl` has correct format
- Review orchestrator checkpoint quality

### CORS errors
- Flask-CORS should handle this automatically
- If issues persist, check browser console for specific errors
- Verify API_BASE in `app.js` matches your server address

## Performance Tips

1. **First load is slow**: Model downloads and loads on first request
2. **GPU acceleration**: Will automatically use CUDA if available
3. **Memory usage**: ~2-3GB for TinyLlama + adapters
4. **Response caching**: Current adapter stays loaded between requests
5. **Unload when done**: Use "Unload Model" button to free memory

## Integration with ESP32

The mood control system is designed to integrate with the ESP32 Smart Knob hardware:

1. Add serial/network communication to `tomo_api.py`
2. Send mood changes to ESP32 via `/api/mood` endpoint
3. ESP32 firmware updates visual display based on mood
4. See `esp32_avatar/TomoFace/TomoFace.ino` for hardware implementation

## Testing

Test the golden pairs from the command line:
```bash
python3 evaluate_model.py
```

Or test through the GUI by entering test inputs from `golden_pairs.jsonl`.

## Development

### Project Structure
```
tamai_reboot/
├── tomo_api.py                    # Flask API server
├── tomo_gui/
│   ├── index.html                 # GUI frontend
│   └── app.js                     # JavaScript logic
├── start_tomo_gui.sh              # Startup script
├── requirements_gui.txt           # Python dependencies
├── orchestrator_adapter/          # Routing LoRA adapter
├── persona_adapter/               # Conversational LoRA adapter
├── test_finetune.py              # CLI version
└── fine_tune.py                  # Training script
```

### Adding Features

1. **Backend**: Add new endpoints to `tomo_api.py`
2. **Frontend**: Add UI elements to `index.html`
3. **Logic**: Add JavaScript functions to `app.js`
4. **Testing**: Use browser DevTools console for debugging

### Contributing

When adding features, maintain the architecture:
- Keep Flask API RESTful and stateless (except for model caching)
- Keep frontend responsive and provide feedback
- Update both GUI and CLI versions if applicable
- Test with multiple browsers

## Known Issues

- [ ] Command execution not yet implemented (only detection works)
- [ ] No persistent storage for conversation history
- [ ] No authentication/multi-user support
- [ ] ESP32 hardware integration is manual
- [ ] No voice input yet (Whisper integration planned)

## Future Enhancements

- [ ] Voice input with Whisper STT
- [ ] Actual command execution (notes, emails, reminders)
- [ ] Persistent conversation storage (SQLite)
- [ ] WebSocket streaming for real-time responses
- [ ] ESP32 hardware auto-discovery
- [ ] Training data editor in GUI
- [ ] Model fine-tuning from GUI
- [ ] Export conversations (JSON, Markdown)
- [ ] Dark mode toggle
- [ ] Mobile responsive design

## License

Part of the Tamai project. See main LICENSE file.

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the main project documentation
3. Check `test_finetune.py` for CLI-based debugging
4. Examine Flask logs in the terminal where server is running

---

**Made with ❤️ for the Tomo AI Assistant**
