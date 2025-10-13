# Project Roadmap

**Version:** 2.2 (Fine-Tuning Priority)

This document outlines the strategic phases for the Tamagotchi AI Companion project, reflecting new priorities based on our discovery phase.

## Phase 1: Determine Core AI Engine (Current Focus)

This phase is about validating a viable AI engine for the Raspberry Pi 5. Our top priority is to create a small, reliable orchestrator model through fine-tuning.

*   **NOW (What We Just Did):**
    *   Completed the initial discovery phase, which revealed instability with 1B-2.7B parameter models in the previous codebase.
    *   Authored key findings and project documents.
    *   Established a clean project structure for a revised approach.
    *   Selected **Whisper** as the primary Speech-to-Text (STT) engine.

*   **NEXT (Immediate Steps):**

    **Path A: Fine-Tune a Small Orchestrator Model (Top Priority)**
    1.  **Goal:** Create a highly specialized `tinyllama` model that can reliably translate user commands into structured JSON, as detailed in the Project Specification.
    2.  **Action:** Create a high-quality dataset of `text` -> `JSON` examples based on the project's use cases.
    3.  **Action:** Write and execute a fine-tuning script using a standard framework like Hugging Face Transformers.
    4.  **Success Criteria:** The fine-tuned model must consistently and accurately convert test sentences into the correct JSON format.

    **Path B: Validate a Larger General-Purpose Model (Secondary Priority)**
    1.  **Goal:** Validate if a 3B parameter LLM can run stably on the Raspberry Pi 5 in a clean environment.
    2.  **Action:** Set up a minimal Docker container with `llama-cpp-python` and a 3B model (e.g., Phi-3-mini).
    3.  **Action:** Test the model's ability to follow instructions using a strict prompt-based protocol.
    4.  **Success Criteria:** The model must respond reliably with valid, non-conversational JSON for 100 consecutive test prompts under moderate system load.

    **Path C: Lightweight NLP (Fallback/Tool)**
    1.  **Goal:** If fine-tuning and larger models both prove unviable, use a classic NLP library.
    2.  **Action:** Implement `vaderSentiment` or a similar library to handle basic state changes based on sentiment.
    3.  **Status:** This remains a valuable tool in our toolbox, either as a fallback or for augmenting an LLM.

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

*   **Cloud-Based Inference:** Offload AI/ML tasks to a cloud API (Google AI, OpenAI) for more complex interactions.
*   **Hybrid Approach:** Use a local model for simple tasks and a cloud model for complex ones.
*   **Hardware Acceleration:** Investigate AI accelerators (e.g., Google Coral TPU) for the Raspberry Pi.
