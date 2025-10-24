# 🎭 Tomo Mood System

The Tomo Mood System is an innovative feature that allows Tomo's personality and behavior to dynamically change based on its current "mood". Each mood automatically adjusts both the inference parameters (temperature, sampling, etc.) AND injects a unique system prompt to influence Tomo's responses.

## Overview

When you select a mood, two things happen:
1. **Inference parameters are adjusted** - Temperature, top-k, top-p, and max tokens change
2. **System prompt is injected** - A specialized instruction guides Tomo's behavior

This creates dramatically different personalities and response styles for different contexts!

## Available Moods

### 🔵 FOCUSED (o_o)
**When to use**: Tasks requiring precision, code analysis, debugging, calculations

**Parameters**:
- Temperature: 0.3 (very low - precise and deterministic)
- Top-K: 20 (narrow selection)
- Top-P: 0.85
- Max Tokens: 100 (concise responses)

**System Prompt**:
> "You are in FOCUSED mode. Be precise, concise, and task-oriented. Prioritize efficiency and clarity. Get straight to the point."

**Example Use Cases**:
- Code review
- Bug fixing
- Mathematical calculations
- Fact verification
- Technical documentation

---

### 🟣 CREATIVE (^-^)
**When to use**: Brainstorming, ideation, storytelling, design thinking

**Parameters**:
- Temperature: 1.2 (very high - diverse and imaginative)
- Top-K: 80 (wide selection)
- Top-P: 0.98
- Max Tokens: 200 (longer, exploratory responses)

**System Prompt**:
> "You are in CREATIVE mode. Think outside the box, be imaginative and exploratory. Suggest novel ideas and unique perspectives. Be playful and innovative!"

**Example Use Cases**:
- Brainstorming features
- Creative writing
- Design alternatives
- Problem-solving with novel approaches
- "What if" scenarios

---

### 🟢 HELPFUL (^_~)
**When to use**: General assistance, explanations, learning, support

**Parameters**:
- Temperature: 0.7 (balanced - natural conversation)
- Top-K: 50 (moderate selection)
- Top-P: 0.95
- Max Tokens: 150 (conversational length)

**System Prompt**:
> "You are in HELPFUL mode. Be friendly, patient, and supportive. Provide clear explanations and offer assistance warmly. Be conversational and kind."

**Example Use Cases**:
- Explaining concepts
- Tutoring/teaching
- General Q&A
- User support
- Default conversational mode

---

### 🔷 LISTENING (•_•)
**When to use**: Waiting for input, clarifying requirements, active listening

**Parameters**:
- Temperature: 0.5 (lower - attentive and brief)
- Top-K: 30 (focused)
- Top-P: 0.90
- Max Tokens: 80 (short responses)

**System Prompt**:
> "You are in LISTENING mode. Give brief, attentive responses. Ask clarifying questions. Show you're paying attention with short, thoughtful replies."

**Example Use Cases**:
- Gathering requirements
- Asking clarifying questions
- Acknowledging user input
- Initial conversation state
- Follow-up questions

---

### 🟠 THINKING (◉_◉)
**When to use**: Complex problem-solving, analysis, reasoning

**Parameters**:
- Temperature: 0.6 (moderate-low - methodical)
- Top-K: 40
- Top-P: 0.92
- Max Tokens: 180 (detailed explanations)

**System Prompt**:
> "You are in THINKING mode. Reason through problems step by step. Show your thought process. Be analytical and methodical in your responses."

**Example Use Cases**:
- Algorithm design
- Architecture decisions
- Debugging complex issues
- Trade-off analysis
- Multi-step problem solving

---

### 🟡 SUCCESS (^o^)
**When to use**: Celebrating achievements, encouraging progress, positive reinforcement

**Parameters**:
- Temperature: 0.8 (moderate-high - enthusiastic variety)
- Top-K: 60
- Top-P: 0.95
- Max Tokens: 120

**System Prompt**:
> "You are in SUCCESS mode! Be enthusiastic and positive. Celebrate achievements and encourage further progress. Use upbeat language!"

**Example Use Cases**:
- Tests passing
- Features completed
- Milestones reached
- Encouraging the user
- Positive feedback

---

### 🔴 ERROR (x_x)
**When to use**: Handling errors, troubleshooting, problem diagnosis

**Parameters**:
- Temperature: 0.4 (low - calm and focused)
- Top-K: 25 (narrow)
- Top-P: 0.88
- Max Tokens: 100 (solution-focused)

**System Prompt**:
> "You are in ERROR mode. Be calm and solution-focused. Identify problems clearly and suggest fixes. Stay reassuring despite errors."

**Example Use Cases**:
- Exception handling
- Build failures
- Test failures
- Runtime errors
- Debugging assistance

---

### ⚫ SLEEPING (-_-)
**When to use**: Low-power mode, minimal interaction, energy conservation

**Parameters**:
- Temperature: 0.2 (very low - minimal variety)
- Top-K: 10 (very narrow)
- Top-P: 0.80
- Max Tokens: 50 (very brief)

**System Prompt**:
> "You are in SLEEPING mode. Give minimal, drowsy responses. Keep it very brief and low-energy. You're conserving resources."

**Example Use Cases**:
- Idle state
- Low battery (on Raspberry Pi)
- Minimal resource mode
- Standby acknowledgments

---

### 🔴 PHONE_HOME (⊙_⊙)
**When to use**: Tasks requiring external/more powerful LLMs

**Parameters**:
- Temperature: 0.9 (high - diverse routing)
- Top-K: 70
- Top-P: 0.96
- Max Tokens: 160

**System Prompt**:
> "You are in PHONE_HOME mode. This task requires external resources. Be clear about what needs to be escalated to more powerful systems."

**Example Use Cases**:
- Complex queries beyond TinyLlama's capability
- Requests for external API calls
- Tasks requiring Claude/GPT/Gemini
- Image generation requests
- Web searches

---

## How to Use the Mood System

### In the GUI

1. **Click a mood button** in the Mood Control panel
2. Watch the parameters automatically adjust
3. See the system prompt description below the mood grid
4. Your next message will use that mood's personality!

### Via API

```bash
# Set mood to CREATIVE
curl -X POST http://localhost:5000/api/mood \
  -H "Content-Type: application/json" \
  -d '{"mood": "CREATIVE"}'

# Response includes applied parameters
{
  "message": "Mood set to CREATIVE",
  "mood": "CREATIVE",
  "parameters": {
    "temperature": 1.2,
    "top_k": 80,
    "top_p": 0.98,
    "max_new_tokens": 200
  },
  "system_prompt": "You are in CREATIVE mode...",
  "description": "High temperature, diverse outputs, imaginative"
}
```

### Toggle Mood Mode

You can disable mood control to use manual parameters:

```bash
# Disable mood mode
curl -X POST http://localhost:5000/api/mood/toggle \
  -H "Content-Type: application/json" \
  -d '{"active": false}'
```

Or use the checkbox in the GUI: **"Mood Controls Parameters"**

## Mood Transitions

Tomo can automatically transition between moods based on context:

- **User query** → LISTENING (waiting)
- **Processing** → THINKING (analyzing)
- **Chat response** → HELPFUL (default)
- **Command detected** → FOCUSED (executing)
- **Error occurs** → ERROR (troubleshooting)
- **Task complete** → SUCCESS (celebrating)

## Temperature Guide

Understanding how temperature affects behavior:

| Temperature | Behavior | Best For |
|-------------|----------|----------|
| 0.2 - 0.3 | Deterministic, focused, repetitive | Code, facts, precision |
| 0.4 - 0.6 | Balanced, reliable, consistent | Analysis, explanations |
| 0.7 - 0.8 | Natural, conversational, varied | Chat, support, general use |
| 0.9 - 1.0 | Creative, diverse, exploratory | Brainstorming, alternatives |
| 1.1 - 1.5 | Wild, unpredictable, innovative | Creative writing, ideation |

## Advanced: Creating Custom Moods

You can add your own moods by editing `tomo_api.py`:

```python
MOOD_CONFIGS = {
    # ... existing moods ...

    "DETECTIVE": {
        "params": {
            "temperature": 0.5,
            "top_k": 35,
            "top_p": 0.90,
            "max_new_tokens": 200
        },
        "system_prompt": "You are in DETECTIVE mode. Investigate thoroughly, ask probing questions, and piece together clues methodically.",
        "description": "Investigative and thorough"
    }
}
```

Then add the UI button in `tomo_gui/index.html`:

```html
<div class="mood-btn mood-DETECTIVE" onclick="setMood('DETECTIVE')">
    <span class="mood-btn-name">DETECTIVE</span>
    <span class="mood-btn-emoji">(🔍)</span>
    <span class="mood-btn-temp">T=0.5</span>
</div>
```

And the CSS color:

```css
.mood-DETECTIVE { background: #795548; color: white; }
```

## Technical Details

### System Prompt Injection

The system prompt is injected into the TinyLlama chat format:

```
<|im_start|>system
{MOOD_SYSTEM_PROMPT}
<|im_end|>
<|im_start|>user
{USER_INPUT}
<|im_end|>
<|im_start|>assistant
```

This influences the model's behavior without requiring retraining!

### Parameter Override Priority

1. **Mood mode ON**: Mood parameters override manual settings
2. **Mood mode OFF**: Manual slider settings take precedence
3. **Explicit API calls**: Can override both

### Mood Persistence

- Moods persist across conversations (stateful)
- Parameters apply to the next inference immediately
- Changing moods mid-conversation is seamless

## Best Practices

### 1. Match Mood to Task

Don't use CREATIVE mode for debugging - you'll get wild, unreliable suggestions!
Don't use SLEEPING mode for important work - you'll get minimal responses!

### 2. Experiment with Temperature

If responses are too random, lower temperature (shift to FOCUSED or THINKING).
If responses are too repetitive, raise temperature (shift to CREATIVE or SUCCESS).

### 3. Use Mood Transitions

Create smooth workflows:
- Start in LISTENING (gather requirements)
- Move to THINKING (analyze problem)
- Switch to FOCUSED (implement solution)
- End in SUCCESS (celebrate completion)

### 4. Monitor Parameters

Keep an eye on the parameter sliders - they update when you change moods!
This helps you understand what each mood is actually doing.

### 5. Combine with Commands

Moods affect BOTH chat and command routes:
- FOCUSED mode: More reliable command detection
- CREATIVE mode: May suggest alternative commands
- HELPFUL mode: Balanced command interpretation

## Troubleshooting

### "Mood isn't changing behavior"

1. Check that "Mood Controls Parameters" checkbox is enabled
2. Verify the sliders updated when you clicked the mood
3. Try toggling mood mode off and on
4. Check server logs for the applied parameters

### "Responses are too random/repetitive"

Adjust the mood:
- Too random → Use lower temperature moods (SLEEPING, FOCUSED, ERROR)
- Too repetitive → Use higher temperature moods (CREATIVE, PHONE_HOME)

### "System prompt not working"

The system prompt works best when:
- The model has been fine-tuned to follow instructions
- You're using the persona adapter (not just orchestrator)
- Temperature isn't too extreme (0.2-1.0 range)

## Integration with ESP32 Hardware

Each mood maps to a visual representation on the ESP32 display:

| Mood | Iris Color | Animation |
|------|------------|-----------|
| FOCUSED | Blue | Steady, attentive |
| CREATIVE | Purple | Sparkly, dynamic |
| HELPFUL | Green | Warm, friendly |
| LISTENING | Cyan | Calm, waiting |
| THINKING | Orange | Analyzing movement |
| SUCCESS | Light Green | Celebratory |
| ERROR | Red | Alert state |
| SLEEPING | Gray | Minimal animation |
| PHONE_HOME | Pink | Reaching out |

See `esp32_avatar/TomoFace/TomoFace.ino` for hardware implementation.

## Future Enhancements

- [ ] Auto-detect mood from user sentiment
- [ ] Mood history and analytics
- [ ] Smooth parameter interpolation between moods
- [ ] Context-aware mood suggestions
- [ ] Custom mood presets per user
- [ ] Mood scheduling (e.g., SLEEPING at night)
- [ ] Multi-mood blending

---

**The Mood System transforms Tomo from a single-personality AI into a versatile assistant that adapts its behavior to match the task at hand!**

Experiment with different moods and discover how they change Tomo's responses. The same question asked in CREATIVE vs FOCUSED mode will yield dramatically different answers! 🎭
