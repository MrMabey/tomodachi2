# Tools and Hardware Specification

This document outlines the tools and hardware components used in the Tamai project.

## Hardware

*   **Raspberry Pi 5:** Core processing unit for the AI companion.
*   **ESP32 Smart Knob:** Physical interface for user interaction (input/output).
*   **MacBook:** Used for development, UI dashboard (Chrome Extension), and potentially for offloading some processing during development/testing.

## Software/Frameworks

*   **whisper.cpp:** Speech-to-text engine.
*   **Ollama:** Local LLM server for running custom fine-tuned models.
*   **Go:** Programming language used for certain components (e.g., Ollama server).
*   **Python:** Likely used for fine-tuning models, scripting, and other AI-related tasks.
*   **Chrome Extension:** For the UI dashboard on the MacBook.
*   **LoRA (Low-Rank Adaptation):** Technique used for fine-tuning the TinyLlama model.
*   **TinyLlama-1.1B-Chat-v1.0:** Base LLM model being fine-tuned.

## Gemini CLI Tools (Potential Approach for Tomo)

These are the tools available to the Gemini CLI, which could serve as inspiration or a direct approach for Tomo's capabilities:

*   Edit
*   FindFiles
*   GoogleSearch
*   ReadFile
*   ReadFolder
*   ReadManyFiles
*   Save Memory
*   SearchText
*   Shell
*   WebFetch
*   WriteFile