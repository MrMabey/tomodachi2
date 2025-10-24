# Project Roadmap

**Version:** 3.0 (Web GUI + Mood System Implemented ✓)
**Last Updated:** October 24, 2025

This document outlines the strategic phases for the Tamagotchi AI Companion project, reflecting new priorities based on our discovery phase.

## Phase 1: Determine Core AI Engine (Current Focus)

This phase is about validating a viable AI engine for the Raspberry Pi 5. Our top priority is to create a small, reliable orchestrator model through fine-tuning.

*   **COMPLETED ✓:**
    *   Completed the initial discovery phase, which revealed instability with 1B-2.7B parameter models in the previous codebase.
    *   Authored key findings and project documents.
    *   Established a clean project structure for a revised approach.
    *   Selected **Whisper** as the primary Speech-to-Text (STT) engine.
    *   **Successfully implemented the "Dynamic Adapter" strategy**, including fine-tuning separate `persona_adapter` and `orchestrator_adapter` LoRA models.
    *   **✓ Implemented "Orchestrator as Router" Architecture:**
        *   ✓ Created unified training dataset (`orchestrator_router_training.jsonl`) with 19 examples (8 commands + 11 chat signals).
        *   ✓ Fine-tuned new `orchestrator_adapter` with routing capabilities (100 epochs, 97.8% accuracy, loss: 0.064).
        *   ✓ Refactored `test_finetune.py` to implement two-step orchestrator → persona flow.
        *   ✓ Validated with `golden_pairs.jsonl` test suite: **13/14 tests passing (92.9%)**.
        *   ✓ Cataloged 297 ASCII emoticons in `asciimoji_library.json` for persona expressions.
        *   ✓ Selected initial emoticon set: ʕ·͡ᴥ·ʔ (focused), ʕっ•ᴥ•ʔっ (friendly), ヽ( •_)ᕗ (creative).
        *   ✓ Created 10 avatar animation styles in `tomo_simulator_v3.html` for ESP32 display prototyping.
    *   **✓ Validated Two-Adapter System in Live Testing (October 21, 2025):**
        *   ✓ Successfully tested interactive conversation flow with `orchestrator_adapter` (checkpoint-1900) and `persona_adapter` (checkpoint-1100)
        *   ✓ Confirmed binary routing works: Chat mode vs Command mode
        *   ✓ Verified adapter caching and switching mechanism on Apple Silicon (MPS)
        *   ✓ Persona maintains consistent personality with ASCII emoticons in responses
        *   ✓ Observed emergent contextual behavior (e.g., "Chilling mode!" response)
        *   ✓ Identified edge cases and false positives for future training data expansion
        *   ✓ Documented results in `test_results_2025-10-21.md` and `02_DISCOVERY_FINDINGS.md`
    *   **✓ Implemented Web-Based GUI (October 24, 2025):**
        *   ✓ Created Flask REST API backend (`tomo_api.py`) with CORS support
        *   ✓ Built beautiful web interface (`tomo_gui/`) with real-time controls
        *   ✓ Interactive chat interface with message history and metadata display
        *   ✓ Real-time parameter tuning (temperature, max tokens, top-k, top-p)
        *   ✓ System status monitoring and performance metrics dashboard
        *   ✓ Conversation history tracking and management
        *   ✓ One-click startup script (`start_tomo_gui.sh`)
        *   ✓ Keyboard shortcuts (Enter, Ctrl+K, Ctrl+L)
        *   ✓ Documented in `TOMO_GUI_README.md`
    *   **✓ Implemented Revolutionary Mood System (October 24, 2025):**
        *   ✓ Created 9 distinct AI personalities through mood-based parameter and prompt control
        *   ✓ Each mood auto-adjusts inference parameters (temperature, sampling, token length)
        *   ✓ Each mood injects unique system prompt to guide behavioral personality
        *   ✓ Moods: FOCUSED (T=0.3), CREATIVE (T=1.2), HELPFUL (T=0.7), LISTENING (T=0.5), THINKING (T=0.6), SUCCESS (T=0.8), ERROR (T=0.4), SLEEPING (T=0.2), PHONE_HOME (T=0.9)
        *   ✓ Toggle control: Mood-based or manual parameter adjustment
        *   ✓ Visual feedback in GUI with mood buttons showing temperature
        *   ✓ Mood description panel showing active system prompt
        *   ✓ Same question yields dramatically different answers in different moods
        *   ✓ Comprehensive documentation: `MOOD_SYSTEM_README.md`, `MOOD_EXAMPLES.md`, `MOOD_SYSTEM_SUMMARY.md`, `MOOD_SYSTEM_ARCHITECTURE.md`
        *   ✓ **CRITICAL BUG FIX:** Isolated orchestrator from mood system to prevent routing interference
        *   ✓ Orchestrator now uses consistent base parameters (no mood influence) for reliable routing
        *   ✓ Persona adapter fully uses mood system for personality variation
        *   ✓ Documented fix in `BUGFIX_ROUTING.md` and created test script `test_routing_fix.py`

*   **NEXT (Immediate Steps - Updated October 24, 2025):**

    **Priority 1: Test and Validate Bug Fixes**
        *   **Goal:** Confirm orchestrator routing is fixed and mood system works correctly
        *   **Action:** Run `test_routing_fix.py` to validate routing decisions
        *   **Action:** Test all 9 moods with same question to verify personality differences
        *   **Action:** Verify orchestrator uses base parameters (not mood-influenced)
        *   **Status:** Ready to test immediately with GUI running

    **Priority 2: Expand Training Data for Current Adapters**
        *   **Goal:** Improve accuracy and reduce false positives/negatives in routing and responses
        *   **Action:** Expand `orchestrator_router_training.jsonl` with:
            *   More casual statements (e.g., "im building a cat tower") → `{"action": "chat"}`
            *   Edge case conversational inputs that might look like commands
            *   Additional command variations for existing intents
            *   Target: 50-100 examples total (currently at 19)
        *   **Action:** Expand `persona_training.jsonl` with:
            *   Mood-appropriate responses (creative, focused, helpful variations)
            *   More varied conversational responses
            *   Context-appropriate emotional states
            *   Target: 30-50 examples (currently at 11)
        *   **Action:** Standardize intent naming (`phone_home` vs `go_home`)
        *   **Status:** High priority after validation testing

    **Priority 3: Implement Command Execution Layer**
        *   **Goal:** Move beyond debug prints to actual functionality
        *   **Action:** Build basic command handlers for core intents:
            *   `add_to_list` → append to file or database
            *   `take_note` → save to notes file with timestamp
            *   `phone_home` → API call to external LLM (Claude/GPT)
            *   `set_reminder` → create reminder entry
        *   **Action:** Add success/error responses to GUI
        *   **Action:** Create persistent storage (SQLite or JSON files)
        *   **Status:** Awaiting decision on storage/API architecture

    **Priority 4: GUI Enhancements (Optional)**
        *   **Goal:** Improve user experience and add requested features
        *   **Action:** Add code editor panel (Monaco Editor for VS Code experience)
        *   **Action:** Voice input integration (Whisper STT)
        *   **Action:** Export conversation history (JSON/Markdown)
        *   **Action:** Dark mode toggle
        *   **Status:** Nice-to-have, user-driven priorities

    **Future: Advanced Mood Features**
        *   **Goal:** Make mood system even more powerful
        *   **Action:** Auto-detect mood from user sentiment
        *   **Action:** Mood scheduling (e.g., SLEEPING mode at night)
        *   **Action:** Custom mood profiles per user
        *   **Action:** Smooth parameter interpolation between moods
        *   **Status:** Deferred pending core system validation

## Phase 2: Hardware Integration (The Body)

This phase begins *after* a core AI engine is validated in Phase 1.

*   **LATER:**
    *   Develop the ESP32 firmware based on the "stateless executor" principle.
    *   Implement MQTT communication between the Raspberry Pi and the ESP32.
    *   Integrate audio streaming from the ESP32 to the Pi for STT processing.

## Phase 3: UI & User Experience (The Dashboard)

*   **COMPLETED ✓:**
    *   ✓ Developed web-based GUI (Flask + HTML/JS) for interacting with Tomo
    *   ✓ Real-time parameter controls and system monitoring
    *   ✓ Mood system visual interface with 9 personality buttons
    *   ✓ Conversation history and performance metrics
    *   ✓ Comprehensive documentation suite

*   **FUTURE:**
    *   Chrome Extension UI for system tray monitoring
    *   Mobile-responsive design
    *   Progressive Web App (PWA) for offline use
    *   Multi-user support with authentication

## Future Exploration (Post MVP)

*   **Hardware Acceleration:** Investigate AI accelerators (e.g., Google Coral TPU) for the Raspberry Pi.
