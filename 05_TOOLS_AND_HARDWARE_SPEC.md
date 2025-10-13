# Tools & Hardware Specification

**Version:** 1.0

This document outlines the key hardware requirements and software dependencies for the Tamai project.

## Hardware Requirements

### Core Compute Module (e.g., Raspberry Pi 5)

#### LLM RAM Usage

-   **Model:** `TinyLlama-1.1B-Chat-v1.0`
-   **Baseline Weight Size:** The model weights require approximately **2.2 GB** of RAM.
-   **Inference Overhead:** Additional memory is required for the KV cache (the model's conversational memory) and framework overhead (PyTorch, etc.).
-   **Recommended RAM:** To run the 1.1B model comfortably, the device should have at least **4 GB of free RAM** available. This provides a safe buffer for the KV cache and system processes.

## Software & Libraries

*(This section will be populated with key software dependencies, library versions, and setup notes as they are finalized.)*
