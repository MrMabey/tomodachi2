# Project Specification: Tamagotchi AI Companion

**Version:** 2.2 (Fine-Tuning Priority)

## 1. Vision

To create an interactive AI companion that provides ambient feedback and responds to user interaction. The AI's "emotional state" is the core of the experience, expressed physically through a custom hardware interface and monitored through a software dashboard.

## 2. System Architecture & Component Roles

The system consists of three distinct modules communicating over a local Wi-Fi network.

### 2.1. Core Compute Module (Raspberry Pi 5)

*   **Role:** Central Orchestrator & AI/ML Hub.
*   **Responsibilities:**
    *   Hosts the main application server (FastAPI).
    *   Runs the core logic that determines the AI's state, which is implemented as a two-stage pipeline.
    *   Serves as the central communication broker between all other components.

*   **Core Logic: A Two-Stage Pipeline**

    To reliably understand and act upon user commands, the core logic is split into two distinct stages: Transcription and Orchestration.

    1.  **Stage 1: Transcription (Whisper STT)**
        *   **Technology:** We will use **OpenAI's Whisper** model, running locally on the Raspberry Pi via an optimized port like `whisper.cpp`.
        *   **Function:** Its sole responsibility is to listen to the user's voice (streamed from the ESP32) and accurately transcribe it into raw, unstructured text. For example, it turns the spoken words "Hey Flow, take a note that I need to buy milk" into the simple text string: `"I need to buy milk"`.

    2.  **Stage 2: Orchestration (Fine-Tuned LLM)**
        *   **Technology:** A small, specialized **fine-tuned Large Language Model** (e.g., `tinyllama`) will serve as the system's "brain."
        *   **Function:** This model receives the raw text from Whisper. Because it has been specifically trained for this job, it does not engage in conversation. Instead, its only goal is to analyze the text and convert it into a structured, machine-readable **JSON command**. This process replaces the need for a complex, prompt-based "Model Context Protocol (MCP)".
        *   **Example:** The text `"I need to buy milk"` is transformed into the JSON object: `{"intent": "take_note", "content": "buy milk"}`. The main application can then reliably parse this command and trigger the correct action (e.g., saving the note).

    This two-stage approach makes the system modular, reliable, and easy to extend. New capabilities can be added by simply training the orchestrator model with new examples.

### 2.2. I/O Peripheral (ESP32 Smart Knob)

*   **Role:** The Physical Body of the AI.
*   **Responsibilities:**
    *   **Output:** Displays the AI's current state via ASCII art on its screen. Provides haptic (vibration) and auditory feedback.
    *   **Input:** Captures user voice commands and physical interactions.
    *   **Design Philosophy:** A "stateless executor" that acts on commands from the Raspberry Pi.

### 2.3. UI Dashboard (MacBook Chrome Extension)

*   **Role:** Monitoring and Configuration Interface.
*   **Responsibilities:**
    *   Provides a real-time view of the AI's state and interaction history.
    *   Communicates directly with the API on the Raspberry Pi.
