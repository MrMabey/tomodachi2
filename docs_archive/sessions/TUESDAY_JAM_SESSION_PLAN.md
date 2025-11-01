# Tuesday Jam Session Plan - Tomo MVP Integration

**Date:** Tuesday (Target Date TBD)
**Participants:** You + Miles
**Location:** In-person working session

---

## 🎯 Session Goal

**Wire up the full MVP loop:** Voice input → AI processing → Physical feedback

Validate that the core user experience feels good and responsive.

---

## ✅ What We Accomplished Today (October 21, 2025)

### Two-Adapter AI System - VALIDATED ✅

**Tested:** Interactive conversation with TinyLlama 1.1B + two LoRA adapters
- `orchestrator_adapter` (checkpoint-1900) - Routes between chat and commands
- `persona_adapter` (checkpoint-1100) - Tomo personality for conversations

**Results:**
- ✅ Chat mode works (greetings, casual conversation)
- ✅ Command mode works (task requests → structured JSON)
- ✅ Persona maintains personality with ASCII emoticons
- ✅ Emergent behavior (e.g., "Chilling mode!" response)
- ⚠️ Minor edge cases (can be fixed later with more training data)

**Current Flow:**
```
User Text → orchestrator_adapter → Decision:
    ├─ Chat? → {"action": "chat"} → persona_adapter → Natural response
    └─ Command? → {"intent": "...", ...} → JSON for execution
```

**Conclusion:** AI brain is solid enough to move forward with hardware integration.

---

## 📋 Pre-Work (Before Tuesday)

### Your Pre-Work

**Goal:** Get voice input working with the AI models

**Tasks:**
1. **Install Whispering**
   - Repo: `github.com/epicenter-os/epicenter`
   - Local-first dictation tool (press shortcut → speak → get text)
   - Uses Whisper.cpp locally or cloud providers

2. **Integrate Whispering with test_finetune.py**
   - Modify `test_finetune.py` to accept transcribed text from Whispering
   - Test flow: Speak → Whispering → Orchestrator → Persona/Command

3. **Validate Voice-to-AI Pipeline**
   - Confirm you can speak and get responses from Tomo
   - Document any issues or latency problems

**Target Flow:**
```
Your Voice → Whispering (STT) → orchestrator_adapter →
    ├─ Chat? → persona_adapter → Text response
    └─ Command? → JSON intent
```

### Miles' Pre-Work

**Goal:** Understand the ESP32 knob hardware and connectivity

**Tasks:**
1. **Get Knob Connected**
   - Connect Waveshare ESP32-S3 1.8" Knob to laptop/Raspberry Pi
   - Verify basic functionality (display, mic, knob rotation)

2. **Explore Whispering Integration**
   - Test Whispering on his machine
   - Understand audio capture and streaming possibilities

3. **Review Existing Firmware**
   - Look at `TomoFace.ino` (the animated face code)
   - Understand current capabilities and what needs to be added

**Miles brings:** ESP32 expertise + second knob for parallel testing

---

## 🚀 Tuesday Jam Session Agenda

### Phase 1: Establish Communication (1-2 hours)

**Goal:** Get ESP32 talking to a server

**Tasks:**
- Choose protocol: MQTT vs WebSocket
- Set up simple server on laptop/Pi
- Send test commands from server → ESP32
- Verify ESP32 can receive and display different moods

**Success Metric:** Can we make Tomo's face change colors/moods from a server command?

---

### Phase 2: Voice Input Integration (1-2 hours)

**Goal:** Connect microphone to Whispering to AI models

**Tasks:**
- Test mic on ESP32 (if available) or use laptop mic
- Stream/send audio to Whispering for transcription
- Feed transcribed text to orchestrator adapter
- Get response back from AI

**Success Metric:** Can we speak and get Tomo to respond (via text)?

---

### Phase 3: Close the Loop (1-2 hours)

**Goal:** Wire voice input → AI → visual output

**Tasks:**
- Connect AI response to ESP32 display commands
- Map AI moods/states to visual animations
- Test full loop: Voice → Whisper → Orchestrator → Persona → Display change

**Success Metric:** Speak to Tomo → see face react appropriately

---

### Phase 4: Polish & Document (Remaining time)

**Tasks:**
- Fix any latency or UX issues
- Document the architecture and communication protocol
- Identify what's working and what needs improvement
- Plan next steps for full MVP

---

## 🛠️ Technical Stack Summary

### AI Layer (Your Domain)
- **Base Model:** TinyLlama 1.1B-Chat-v1.0
- **Adapters:**
  - `orchestrator_adapter` - Intent recognition & routing
  - `persona_adapter` - Tomo conversational personality
- **STT:** Whispering (using Whisper.cpp locally)
- **Platform:** MacBook Pro (Apple Silicon MPS) or Raspberry Pi 5

### Hardware Layer (Miles' Domain)
- **Device:** Waveshare ESP32-S3 1.8" Knob
- **Display:** 360x360 LCD (SH8601 driver)
- **Graphics:** LVGL 8.x
- **Features:** Microphone, rotary encoder, haptic motor
- **Firmware:** `TomoFace.ino` (animated face with 9 mood states)

### Communication Layer (Joint Effort)
- **Protocol:** TBD (MQTT or WebSocket)
- **Server:** FastAPI or simple Python server
- **Message Format:** JSON commands for mood/state changes

---

## 📊 MVP Success Criteria

By end of Tuesday, we should be able to:
1. ✅ Speak into a microphone
2. ✅ See transcribed text from Whispering
3. ✅ Get AI response (chat or command)
4. ✅ Send mood/state to ESP32
5. ✅ See Tomo's face change on the knob display

**The Key Question:** Does this interaction feel good and alive?

---

## 🚫 What We're NOT Doing (Yet)

- Expanding training data for AI models
- Building full command execution layer
- Multi-persona routing
- Hardware integration beyond basics (knob rotation, haptic)
- Web dashboard
- Perfect polish

**Philosophy:** Build the thinnest possible slice that validates the core experience.

---

## 📁 Key Files to Reference

- `test_finetune.py` - Current AI testing script
- `esp32_avatar/TomoFace/TomoFace.ino` - Animated face firmware
- `orchestrator_router_training.jsonl` - Orchestrator training data (19 examples)
- `persona_training.jsonl` - Persona training data (11 examples)
- `test_results_2025-10-21.md` - Today's test results
- `SESSION_NOTES_2025-10-21.md` - Today's session summary

---

## 🎨 Mood Mappings (AI → Display)

From `TomoFace.ino`:
- **MOOD_FOCUSED** - Blue iris, steady eyes - `(o_o)`
- **MOOD_CREATIVE** - Purple iris, squinted eyes - `(^-^)`
- **MOOD_HELPFUL** - Green iris, winking - `(^_~)`
- **MOOD_LISTENING** - Cyan iris, wide eyes - `(◉_◉)`
- **MOOD_THINKING** - Yellow iris, looking up, spinner - `(º_º)`
- **MOOD_SUCCESS** - Bright green, happy - `(^_^)`
- **MOOD_ERROR** - Red, X eyes - `(×_×)`
- **MOOD_SLEEPING** - Gray, closed - `(-_-)`
- **MOOD_PHONE_HOME** - Magenta, looking right - `(→_→)`

---

## 💡 Potential Blockers & Backup Plans

### If Whispering is Hard to Integrate:
- Use simple Whisper Python library instead
- Or start with typing text to validate AI → Display loop first

### If ESP32 Mic Doesn't Work:
- Use laptop mic for MVP
- Stream audio over WiFi to server

### If Communication Protocol is Tricky:
- Start with simple HTTP POST requests
- Upgrade to WebSocket/MQTT later

### If Latency is Bad:
- Profile each step (STT, AI inference, network)
- Consider running everything local on Pi vs Mac

---

## 📝 Post-Session Deliverables

**Documentation:**
- Architecture diagram of the working system
- Communication protocol spec
- Setup instructions for replicating the demo

**Code:**
- Modified `test_finetune.py` with voice input
- ESP32 firmware with server communication
- Simple server script for routing

**Test Results:**
- Video/demo of working end-to-end flow
- Latency measurements
- List of remaining issues/improvements

---

## 🎯 Long-term Vision Reminder

**Full MVP Loop:**
```
Human Voice → Smart Knob (ESP32) → Raspberry Pi Server → Web Dashboard
     ↑                                      ↓
     └──────────── Visual/Haptic Feedback ──┘
```

Tuesday's goal: Prove the left side of this loop (Voice → AI → Display) works and feels good.

---

## Questions to Answer Tuesday

1. What's the end-to-end latency? (Speak → See response)
2. Does Tomo feel "alive" and responsive?
3. Is the voice recognition accurate enough?
4. Do the mood animations match the AI's intent?
5. What's the biggest remaining blocker for a full demo?

---

**Let's make Tomo come alive! 🎉**
