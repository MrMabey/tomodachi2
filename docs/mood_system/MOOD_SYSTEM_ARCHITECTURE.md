# 🎭 Mood System Architecture

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERACTION                            │
│                                                                     │
│  "How do I reverse a string?"  +  Click CREATIVE Mood Button       │
└─────────────────────┬───────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        GUI (app.js)                                 │
│                                                                     │
│  1. User clicks mood → setMood('CREATIVE')                         │
│  2. POST /api/mood {"mood": "CREATIVE"}                            │
│  3. Update UI (display, sliders, description)                      │
│  4. User input → POST /api/inference {"input": "..."}              │
└─────────────────────┬───────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     FLASK API (tomo_api.py)                         │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ /api/mood endpoint                                         │    │
│  │                                                            │    │
│  │  1. Receive mood selection: "CREATIVE"                     │    │
│  │  2. Look up MOOD_CONFIGS["CREATIVE"]                       │    │
│  │  3. Apply parameters to state.inference_params:            │    │
│  │     - temperature: 1.2                                     │    │
│  │     - top_k: 80                                            │    │
│  │     - top_p: 0.98                                          │    │
│  │     - max_new_tokens: 200                                  │    │
│  │  4. Store system_prompt in state                           │    │
│  │  5. Set state.current_mood = "CREATIVE"                    │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ /api/inference endpoint                                    │    │
│  │                                                            │    │
│  │  1. Receive user input                                     │    │
│  │  2. Stage 1: Orchestrator (route decision)                 │    │
│  │     └─> Doesn't use mood params (fixed at 100 tokens)      │    │
│  │  3. Stage 2: Based on route...                             │    │
│  │                                                            │    │
│  │     If CHAT route:                                         │    │
│  │     ┌──────────────────────────────────────────┐           │    │
│  │     │ generate_response()                      │           │    │
│  │     │                                          │           │    │
│  │     │ 1. Get mood system prompt                │           │    │
│  │     │ 2. Inject into chat format:              │           │    │
│  │     │    <|im_start|>system                    │           │    │
│  │     │    {mood_system_prompt}                  │           │    │
│  │     │    <|im_end|>                            │           │    │
│  │     │    <|im_start|>user                      │           │    │
│  │     │    {user_input}                          │           │    │
│  │     │    <|im_end|>                            │           │    │
│  │     │                                          │           │    │
│  │     │ 3. Use mood-specific params:             │           │    │
│  │     │    - temperature: 1.2 (CREATIVE)         │           │    │
│  │     │    - top_k: 80                           │           │    │
│  │     │    - top_p: 0.98                         │           │    │
│  │     │    - max_new_tokens: 200                 │           │    │
│  │     │                                          │           │    │
│  │     │ 4. Load persona_adapter                  │           │    │
│  │     │ 5. Generate response                     │           │    │
│  │     └──────────────────────────────────────────┘           │    │
│  │                                                            │    │
│  │     If COMMAND route:                                      │    │
│  │     └─> Extract intent, return structured JSON            │    │
│  │                                                            │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────┬───────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    MODEL INFERENCE                                  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │ TinyLlama-1.1B-Chat-v1.0 (Base Model)                   │      │
│  │                                                          │      │
│  │  + Persona Adapter (LoRA)                                │      │
│  │                                                          │      │
│  │  Input (with system prompt):                             │      │
│  │  ┌────────────────────────────────────────────────────┐  │      │
│  │  │ <|im_start|>system                                 │  │      │
│  │  │ You are in CREATIVE mode. Think outside the        │  │      │
│  │  │ box, be imaginative and exploratory...             │  │      │
│  │  │ <|im_end|>                                         │  │      │
│  │  │                                                    │  │      │
│  │  │ <|im_start|>user                                   │  │      │
│  │  │ How do I reverse a string in Python?               │  │      │
│  │  │ <|im_end|>                                         │  │      │
│  │  │                                                    │  │      │
│  │  │ <|im_start|>assistant                              │  │      │
│  │  └────────────────────────────────────────────────────┘  │      │
│  │                                                          │      │
│  │  Generation Parameters (from CREATIVE mood):             │      │
│  │  - temperature: 1.2    (high diversity)                  │      │
│  │  - top_k: 80          (wide token selection)             │      │
│  │  - top_p: 0.98        (nucleus sampling)                 │      │
│  │  - max_new_tokens: 200 (longer response)                 │      │
│  │  - do_sample: True                                       │      │
│  │                                                          │      │
│  │  Output:                                                 │      │
│  │  "Oh, there are SO many fun ways to flip a string!      │      │
│  │   The classic: text[::-1]                                │      │
│  │   The functional: ''.join(reversed(text))                │      │
│  │   The loop dancer: ... (creative examples)               │      │
│  │   What vibe are you going for? ✨"                       │      │
│  └──────────────────────────────────────────────────────────┘      │
└─────────────────────┬───────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      RESPONSE RETURN                                │
│                                                                     │
│  {                                                                  │
│    "input": "How do I reverse a string in Python?",                │
│    "orchestrator_decision": {"action": "chat"},                    │
│    "response": "Oh, there are SO many fun ways...",                │
│    "route": "chat",                                                │
│    "mood": "CREATIVE",                                             │
│    "total_latency": 0.78,                                          │
│    "persona_latency": 0.52,                                        │
│    "orchestrator_latency": 0.26                                    │
│  }                                                                  │
└─────────────────────┬───────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         GUI UPDATE                                  │
│                                                                     │
│  1. Display response in chat window                                │
│  2. Show metadata: "Route: chat | Mood: CREATIVE | Latency: 0.78s" │
│  3. Update stats (avg latency, chat count)                         │
│  4. Scroll to bottom                                               │
│  5. Re-enable input field                                          │
└─────────────────────────────────────────────────────────────────────┘
```

## Mood Configuration Data Structure

```python
MOOD_CONFIGS = {
    "CREATIVE": {
        "params": {
            "temperature": 1.2,      # High = diverse, creative
            "top_k": 80,             # Wide selection pool
            "top_p": 0.98,           # Nearly full nucleus
            "max_new_tokens": 200    # Longer responses
        },
        "system_prompt": "You are in CREATIVE mode. Think outside the box...",
        "description": "High temperature, diverse outputs, imaginative"
    },

    "FOCUSED": {
        "params": {
            "temperature": 0.3,      # Low = precise, deterministic
            "top_k": 20,             # Narrow selection
            "top_p": 0.85,           # Limited nucleus
            "max_new_tokens": 100    # Concise responses
        },
        "system_prompt": "You are in FOCUSED mode. Be precise, concise...",
        "description": "Low temperature, precise responses, task-oriented"
    },

    # ... 7 more moods
}
```

## Parameter Effect Visualization

```
Temperature Impact (CREATIVE vs FOCUSED):

FOCUSED (T=0.3)                    CREATIVE (T=1.2)
─────────────────                  ─────────────────

Token Selection:                   Token Selection:
┌─────────┐                        ┌─────────┐
│ "text"  │ 95% ← Likely chosen    │ "text"  │ 40% ← One option
│ "string"│ 3%                      │ "string"│ 25% ← Valid too
│ "s"     │ 1%                      │ "s"     │ 15% ← Why not
│ "word"  │ 1%                      │ "word"  │ 10% ← Maybe
│ "chars" │ 0%                      │ "chars" │ 5%  ← Could be fun
│ "seq"   │ 0%                      │ "seq"   │ 3%  ← Interesting
└─────────┘                        │ "str_"  │ 2%  ← Creative!
                                   └─────────┘

Result: Predictable, safe         Result: Diverse, surprising


Response Character:                Response Character:
┌─────────────────────────┐        ┌──────────────────────────┐
│ s[::-1]                 │        │ Oh, there are SO many   │
│                         │        │ fun ways to flip a      │
│ Or use reversed():      │        │ string around! (^-^)    │
│ ''.join(reversed(s))    │        │                         │
│                         │        │ The classic slice:      │
│                         │        │ text[::-1]              │
│ [Direct, minimal]       │        │                         │
└─────────────────────────┘        │ The functional wizard:  │
                                   │ ''.join(reversed(text)) │
                                   │                         │
                                   │ The loop dancer: ...    │
                                   │                         │
                                   │ [Playful, exploratory]  │
                                   └──────────────────────────┘
```

## System Prompt Injection Points

```
WITHOUT System Prompt              WITH System Prompt (CREATIVE)
─────────────────────              ──────────────────────────────

<|im_start|>user                   <|im_start|>system
How do I reverse a string?         You are in CREATIVE mode. Think
<|im_end|>                         outside the box, be imaginative...
                                   <|im_end|>

<|im_start|>assistant              <|im_start|>user
                                   How do I reverse a string?
                                   <|im_end|>

                                   <|im_start|>assistant

                  ▼                                  ▼

Generic response                   Mood-influenced response
No behavioral guidance             Guided by system prompt
Uses base personality              Uses mood-specific personality
```

## State Management

```python
class TomoState:
    # Current State
    current_mood: str = "LISTENING"           # Active mood
    mood_mode_active: bool = True             # Mood control enabled?

    # Parameters
    base_inference_params: dict = {...}       # Default params
    inference_params: dict = {...}            # Active params

    # Models
    base_model: Model                         # TinyLlama base
    current_adapter: PeftModel                # Active LoRA adapter

    # History
    conversation_history: list = []           # All interactions

# When mood changes:
def set_mood(mood_name):
    state.current_mood = mood_name

    if state.mood_mode_active:
        # Apply mood's parameters
        state.inference_params = MOOD_CONFIGS[mood_name]["params"].copy()

    return MOOD_CONFIGS[mood_name]
```

## Mood → Response Pipeline

```
USER INPUT
    ↓
┌───────────────────┐
│ Select Mood       │ ← Manual selection or auto-detect
└─────┬─────────────┘
      │
      ▼
┌───────────────────┐
│ Apply Parameters  │ ← Temperature, top_k, top_p, max_tokens
└─────┬─────────────┘
      │
      ▼
┌───────────────────┐
│ Inject Sys Prompt │ ← Behavioral instructions
└─────┬─────────────┘
      │
      ▼
┌───────────────────┐
│ Orchestrator      │ ← Route to chat or command
└─────┬─────────────┘
      │
      ├─→ CHAT ──────┐
      │              ▼
      │          ┌───────────────────┐
      │          │ Persona Adapter   │ ← Uses mood params + prompt
      │          └─────┬─────────────┘
      │                ▼
      │          ┌───────────────────┐
      │          │ Generate Response │ ← Mood-influenced output
      │          └─────┬─────────────┘
      │                │
      └─→ COMMAND ────┼─→ Extract Intent
                      │
                      ▼
                  RESPONSE
```

## Mood Transition Example

```
Conversation Flow with Mood Transitions:

User: "I want to build a todo app"
  ↓
[LISTENING Mode: T=0.5, brief responses]
Tomo: "What features do you need? Web or mobile?"
  ↓
User: "Web app, with categories and due dates"
  ↓
[THINKING Mode: T=0.6, analytical]
Tomo: "Let's break this down:
       1. Data model: Tasks, Categories, Due Dates
       2. Frontend: React or Vue?
       3. Backend: REST API or GraphQL?
       What's your tech stack preference?"
  ↓
User: "I'm new to React, suggest some creative ideas"
  ↓
[CREATIVE Mode: T=1.2, imaginative]
Tomo: "Ooh! Let's make it fun! (^-^)
       - Gamify it with XP points!
       - Drag-and-drop with physics!
       - Mood-based task colors!
       - AI suggests task order!
       Which sounds exciting?"
  ↓
User: "Let's start simple, just basic CRUD"
  ↓
[FOCUSED Mode: T=0.3, precise]
Tomo: "React component structure:
       - App.js
       - TodoList.js
       - TodoItem.js
       - AddTodo.js

       State: useState for tasks array
       CRUD: add, delete, toggle, edit"
  ↓
[User implements code, runs into error]
  ↓
User: "Getting 'Cannot read property map of undefined'"
  ↓
[ERROR Mode: T=0.4, solution-focused]
Tomo: "Array is undefined. Check:
       1. Initial state: useState([]) not useState()
       2. Filter returns array
       3. Map called on correct variable

       Show me line 47?"
  ↓
[User fixes it, app works]
  ↓
[SUCCESS Mode: T=0.8, enthusiastic]
Tomo: "Yes! It's working! (^o^)
       You built your first React CRUD app!
       Next: add localStorage persistence?
       Great job! 🎉"
```

## Performance Characteristics

```
Latency Breakdown (typical):

Total Response Time: ~0.5-2.0 seconds

┌──────────────────────────────────────┐
│ Orchestrator Inference: 0.15-0.30s   │ ← Fixed parameters
├──────────────────────────────────────┤
│ Persona Inference: 0.35-1.70s        │ ← Varies by mood!
│                                      │
│  SLEEPING (50 tokens):   0.35s       │ ← Fastest
│  FOCUSED (100 tokens):   0.45s       │
│  HELPFUL (150 tokens):   0.60s       │
│  CREATIVE (200 tokens):  0.80s       │ ← Slower (more tokens)
│                                      │
│  High temperature adds ~5-10% time   │
└──────────────────────────────────────┘

Memory Usage: ~2-3GB (base model + adapter)
```

## Integration Points

```
┌─────────────────────────────────────────────────┐
│               Tomo Mood System                  │
└────────┬───────────────────────────┬────────────┘
         │                           │
         ▼                           ▼
┌────────────────────┐    ┌──────────────────────┐
│  ESP32 Hardware    │    │   External Services  │
│                    │    │                      │
│  Mood → Color      │    │  PHONE_HOME mood →   │
│  CREATIVE: Purple  │    │  Call Claude API     │
│  FOCUSED: Blue     │    │  Call Gemini API     │
│  ERROR: Red        │    │  Call Whisper STT    │
│                    │    │  Web search          │
│  Mood → Animation  │    └──────────────────────┘
│  Blink rate        │
│  Pupil movement    │
│  Haptic feedback   │
└────────────────────┘
```

---

## Summary

The Mood System is a **two-pronged behavioral modifier**:

1. **Inference Parameters** control HOW the model generates (temperature, sampling)
2. **System Prompts** control WHAT personality the model adopts

Together, they create **9 distinct AI personas** from a single base model, making Tomo adaptable to any task! 🎭✨
