# Project Roadmap

**Version:** 2.3 (Orchestrator Validated ✓)

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

*   **NEXT (Immediate Steps):**

    1.  **Train Dedicated Persona Adapters with New Emoticons.**
        *   **Goal:** Give Tomo distinct, consistent personalities with bear-themed emoticons.
        *   **Action:** Create three new training datasets, one for each persona (`focused`, `creative`, `helpful`), with high-quality conversational examples using the selected emoticons:
            *   `focused_training.jsonl` → ʕ·͡ᴥ·ʔ
            *   `creative_training.jsonl` → ヽ( •_)ᕗ
            *   `helpful_training.jsonl` → ʕっ•ᴥ•ʔっ
        *   **Action:** Fine-tune three new adapters (`focused_adapter`, `creative_adapter`, `helpful_adapter`).
        *   **Action:** Update the `ADAPTER_MAP` in the main script to point to these new adapters.
        *   **Status:** Ready to begin once emoticon selection is finalized.

    2.  **Map Emoticons to Avatar Animations.**
        *   **Goal:** Create visual-emotional coherence between text emoticons and ESP32 display animations.
        *   **Action:** Finalize mapping between emoticons and animation styles from `tomo_simulator_v3.html`.
        *   **Current Mapping:**
            *   ʕ·͡ᴥ·ʔ → Data Bars (analytical, focused)
            *   ʕっ•ᴥ•ʔっ → Minimalist Orbs (warm, approachable)
            *   ヽ( •_)ᕗ → Spiral Mandala (playful, dynamic)

    3.  **Improve Golden Pairs Test Coverage.**
        *   **Goal:** Address the 1 failing test and expand coverage.
        *   **Action:** Review "What's a good color for a website?" misrouting and either:
            *   Add more conversational training examples, or
            *   Accept design questions as `phone_home` candidates for better responses.
        *   **Action:** Add edge case tests for ambiguous queries.

## Phase 2: Hardware Integration (The Body)

This phase begins *after* a core AI engine is validated in Phase 1.

*   **LATER:**
    *   Develop the ESP32 firmware based on the "stateless executor" principle.
    *   Implement MQTT communication between the Raspberry Pi and the ESP32.
    *   Integrate audio streaming from the ESP32 to the Pi for STT processing.

## Phase 3: UI & User Experience (The Dashboard)

*   **FUTURE:**
    *   Develop the Chrome Extension UI to monitor and interact with the AI state.

## Future Exploration (Post MVP)

*   **Hardware Acceleration:** Investigate AI accelerators (e.g., Google Coral TPU) for the Raspberry Pi.
