# Discovery Phase: Findings & Learnings

**Version:** 2.1 (Revised Priorities)

## Executive Summary

The primary goal of the initial phase was to run a local LLM on the Raspberry Pi 5. Our experiments revealed significant challenges, including hardware instability (with a 2.7B model) and unreliable instruction-following (with a 1.1B model). While initial conclusions pointed to hardware limitations, a **new, overriding hypothesis** is that these failures may have been caused or exacerbated by code complexity and a lack of strict prompt structuring. The immediate priority is therefore to re-test a 3B model in a clean, minimal environment.

## Initial Challenges with On-Device LLM

We systematically tested several hypotheses which revealed critical issues.

### Attempt 1: TinyLlama 1.1B for Structured JSON Output

*   **Result:** **Failure.** The model was unreliable, often failing to generate the required structured JSON, instead producing conversational text or malformed data.

### Attempt 2: Phi-2 2.7B for Improved Instruction Following

*   **Result:** **Catastrophic Failure.** The Raspberry Pi 5 experienced repeated, sudden shutdowns, indicating that the CPU load exceeded the platform's power or thermal capacity under the test conditions.

### Attempt 3: "Mixture of Agents" with Single-Word Classification

*   **Result:** **Failure.** Even when the task was simplified to single-word classification, the 1.1B model failed to comply reliably, often echoing the prompt.

## Revised Hypothesis & New Path Forward

Based on a review of the hackathon environment where a 3B model was successful, we have revised our conclusion:

*   **New Hypothesis:** The previous failures were not necessarily fundamental hardware limitations but may have been caused by an overly complex and "messy" codebase. A clean, minimal implementation may allow a 3B model to run stably.
*   **The Role of MCP:** A **Model Context Protocol (MCP)**—a rigorous, standardized schema for prompt engineering—is critical. This was not formally used in initial tests and is believed to be a key factor for success. It ensures the model receives context and instructions in a predictable format, maximizing the reliability of structured output.
*   **New Priority:** The primary path is now to test a 3B model on the Raspberry Pi 5 in a completely clean environment, using a well-defined MCP.
*   **Sentiment Analysis as a Tool:** The non-LLM approach (e.g., `vaderSentiment`) remains a valid and important tool. It can be used as a fallback if the 3B model test fails, or it can be used in a hybrid system to handle simple, high-frequency tasks, reducing the load on the LLM.

## Addendum: Prompt Engineering vs. Fine-Tuning for Personas

Following the successful installation and execution of the `tinyllama` 1.1B model via Ollama, further experiments were conducted to create a specific AI persona ("Tomo") through advanced prompt engineering.

*   **Method:** We used interactive commands, including `/set system` to define the persona's personality and rules, and `/set parameter` to adjust creative output (`temperature`).
*   **Finding:** While prompt engineering can influence the model's tone and style, achieving a consistent and nuanced persona with a small, general-purpose model proved difficult. The model often misinterpreted complex instructions or failed to adhere to them reliably, breaking character.
*   **Conclusion:** For a product requiring a robust and consistent persona like the "Tomo" companion, relying solely on prompt engineering is insufficient. The professional approach, as detailed in external research, is to pursue **fine-tuning**. This process embeds the desired personality directly into the model's weights by training it on a curated dataset of example conversations, ensuring reliable and consistent behavior. The project's next steps should focus on this fine-tuning process.

### Fine-Tuning for Orchestration: A Note on Terminology

Our plan to fine-tune a `tinyllama` model to act as an "orchestrator" aligns with established best practices in the AI industry. While "orchestrator bot" is a descriptive internal term, the standard industry terms for this pattern are:

*   **Tool Use / Function Calling:** This is the modern approach where an LLM is trained to recognize when a user's request requires an external tool (like an API or a local function) and to output a structured JSON object that specifies the tool to call and its parameters. This is precisely what we are implementing.

*   **Intent Recognition and Slot Filling:** This is the classic paradigm from chatbots and voice assistants. The model's job is to identify the user's overall *intent* (e.g., `send_message`) and fill the necessary *slots* or parameters (e.g., `recipient: "John"`).

By fine-tuning our model, we are creating a specialized "tool-using" agent where the "tools" are the capabilities of our AI companion, such as `take_note` or `send_email`.

### Fine-Tuning for Persona: Successful Implementation

Following the conclusion that fine-tuning was the correct path, we executed the process with the `TinyLlama-1.1B-Chat-v1.0` model.

*   **Process:** A Python script (`fine_tune.py`) was created using the `transformers` and `trl` libraries to perform Supervised Fine-Tuning (SFT) with a LoRA adapter.
*   **Initial Hurdles:**
    *   We initially encountered an `ImportError` with the `bitsandbytes` library, which was bypassed to proceed with the core training logic.
    *   We then faced a series of `TypeError` exceptions related to the `SFTTrainer` constructor. Through iterative debugging, we discovered that the API for `trl` had changed, and we removed several deprecated arguments (`dataset_text_field`, `max_seq_length`, `tokenizer`).
*   **Critical Finding & Resolution:** The most significant issue was an initial failed test where the model did not adopt the desired persona. Investigation revealed that the `training_dataset.jsonl` contained incorrect data from a previous intent-recognition experiment. We corrected this by creating a new dataset with 5 examples of the target "Tomo" conversational persona.
*   **Outcome: Success.** After retraining on the correct dataset, the fine-tuned model was tested and successfully responded with the "Tomo" persona as intended. This validates that fine-tuning is the effective and correct strategy for instilling a robust persona in the model. The next step is to package this fine-tuned model for integration with Ollama.

### Pivot: The "Dynamic Adapter" Strategy

Our experiments with a single model trained to produce a complex JSON object (the "Structured Response" agent) still resulted in model confusion and unreliable output formatting. This approach, while sound in theory, proved too complex for the current model and dataset size.

To solve this, we are pivoting to a more robust, yet still resource-efficient, architecture:

1.  **Two Specialized Adapters:** We will fine-tune two separate, expert LoRA adapters:
    *   `persona_adapter`: Trained exclusively on conversational data to handle chit-chat and maintain the Tomo persona. Its output is natural language.
    *   `orchestrator_adapter`: Trained exclusively on command-based data. Its sole purpose is to reliably output structured JSON for intent recognition.

2.  **Keyword-Based Router:** A simple router will be implemented in the application logic. It will scan user input for keywords (e.g., "add," "note," "send").

3.  **Dynamic Loading:** Based on the router's decision, the application will dynamically load the appropriate adapter onto the single base model for inference.
    *   If no keywords are found, it loads the `persona_adapter` for a conversation.
    *   If a keyword is found, it loads the `orchestrator_adapter` to get a JSON command.

This approach avoids the "two full LLMs" memory problem while ensuring each task is handled by a specialized expert, maximizing reliability and performance. This is the new path forward for the project's core logic.

### Final Architecture: The "Orchestrator as Router" Model

After further iteration and clarification, we have finalized the core logic architecture for Tomo. This model moves away from a simple keyword-based router or a dedicated "persona router" to a more elegant, two-adapter system where the orchestrator itself acts as the intelligent entry point.

**The Flow:**

1.  **Orchestrator is the Entry Point**: Every user query is first processed by the `orchestrator_adapter`.

2.  **The Orchestrator Decides**: This model is trained to perform a routing function. It analyzes the user's query and makes one of two decisions:
    *   If it recognizes a **command** (e.g., "add milk to my list"), it will respond with the structured **JSON** for that command (e.g., `{"intent": "add_to_list", ...}`).
    *   If it recognizes a **general conversation**, it will respond with a simple, specific signal: `{"action": "chat"}`.

3.  **The Script Executes**: The application's Python script (`test_finetune.py`) inspects the output from the orchestrator:
    *   If it receives command JSON, it proceeds to process that command.
    *   If it receives the `{"action": "chat"}` signal, it then takes the user's original query and runs it through the separate `persona_adapter`.

4.  **Persona Responds**: The `persona_adapter`, which is dedicated solely to personality and conversation, generates the final, natural language response, which must include one of the three ASCII emoticons (`(o_o)`, `(^-^)` or `(^_~)`).

**Advantages of this Model:**

*   **Modularity**: The `orchestrator_adapter` (for routing and commands) and the `persona_adapter` (for personality) are kept separate. They can be trained, evaluated, and improved independently without affecting each other.
*   **Intelligence**: The routing is handled by a fine-tuned model, making it far more robust and nuanced than a simple keyword list.
*   **Efficiency**: We are still only loading one adapter at a time for the final response generation, conserving memory on the Raspberry Pi.

### Feasibility of Advanced Tasks on Raspberry Pi 5

Following further analysis and user discussion, we've re-confirmed that running highly complex, multi-LLM tasks (such as those required for a "product manager" persona involving extensive context management, agenda processing, document drafting, and real-time messaging) directly on the Raspberry Pi 5 (even with 16GB RAM) is **not viable for achieving a fluid, low-latency, and consistent user experience.**

**Reasons for this conclusion include:**
*   **Computational Demands:** LLM inference, especially for multiple models or complex reasoning chains, significantly taxes the Pi's CPU/GPU, leading to slow response times.
*   **Memory Constraints:** While 16GB is substantial for a Pi, loading multiple LLM adapters, maintaining large context windows (KV cache), and processing extensive data for document generation would quickly exhaust available memory, resulting in performance degradation due to swapping.
*   **Latency Requirements:** For an interactive companion, real-time responsiveness is crucial. The Pi's hardware limitations would introduce unacceptable delays for sophisticated tasks.

**Reinforcement of the Hybrid Approach:**
This reinforces the necessity of our hybrid architecture. The Raspberry Pi 5 will serve as the intelligent edge device, handling:
*   Speech-to-Text (STT) using optimized Whisper models
*   Basic persona interactions
*   The orchestrator's intent recognition and routing logic (e.g., `phone_home`).

For computationally intensive or knowledge-heavy tasks (like drafting detailed product specs, analyzing complex documents, or generating code), the Pi will dispatch these requests to more powerful, external LLMs (e.g., cloud-based APIs like Claude/Gemini, or a larger home server) using the `phone_home` intent. This strategy ensures Tomo can offer advanced functionalities without compromising the core interactive experience on the Pi.

### Addendum: Agent Memory Architecture

During our sessions, we discussed the internal memory architecture of the Gemini agent. This is a high-level, conceptual overview of how the agent prioritizes information, which is relevant to understanding its behavior and decision-making process.

The agent's memory can be thought of as a hierarchy or pyramid:

1.  **Core Directives & Saved Memory (The Foundation):** This is the highest-priority layer. It contains the agent's fundamental operating instructions and, most importantly, specific facts explicitly saved via the `save_memory` tool. Our "next steps" and agenda items are stored here, ensuring they persist across sessions.

2.  **Project Context (The Workspace):** This is the agent's dynamic understanding of the current project. It is built by reading and analyzing project files (like `README.md`, specs, and source code) and by observing the output of shell commands. This context allows the agent to adhere to project-specific conventions and goals.

3.  **Conversational Context (Short-Term Memory):** This is the most volatile layer, containing the last few turns of the user-agent conversation. It is used for immediate, turn-by-turn understanding but has the lowest priority when making strategic decisions.

This hierarchical process ensures that explicit user instructions and established project context guide the agent's actions more strongly than the immediate conversational flow.

### Addendum: Understanding the KV Cache

During our discussion of hardware requirements, the concept of the KV Cache was identified as a primary consumer of RAM during model inference. This note provides a high-level explanation.

**KV Cache** stands for **Key-Value Cache**. It is a critical optimization that makes the process of generating text significantly faster. It functions as the model's short-term memory for the current conversational context.

To understand its importance, consider this analogy:

*   **Without a KV Cache:** To generate the next word in a long conversation, the model would need to re-process the *entire* conversation history from scratch, just to produce that single word. This is computationally expensive and very slow.

*   **With a KV Cache:** As the model processes each word (or "token") in the conversation, it stores a calculated representation of that token's context—these are the "Keys" and "Values"—in the cache. To generate the next word, it only needs to process the most recent token and can instantly re-use the cached information for all the preceding ones.

**The Trade-Off:** This immense speed-up comes at a direct cost: memory. The cache must hold the Key-Value information for every token in the context window. As the conversation gets longer, the cache grows in size, leading to increased RAM consumption. This is a primary reason why running LLMs, especially with long context windows, is a memory-intensive task.

### Successful Implementation: Two-Adapter System (October 21, 2025)

After iterative development and fine-tuning, we achieved a **working proof-of-concept** of the "Orchestrator as Router" architecture. This marks a significant milestone in the project.

**Test Date:** October 21, 2025

**System Configuration:**
*   **Base Model:** TinyLlama-1.1B-Chat-v1.0
*   **Adapter 1:** `orchestrator_adapter` (checkpoint-1900) - Routing and intent recognition
*   **Adapter 2:** `persona_adapter` (checkpoint-1100) - Tomo personality for conversation
*   **Platform:** MacBook Pro with Apple Silicon (MPS device)

**Architecture Flow:**
1. All user input first passes through the `orchestrator_adapter`
2. Orchestrator makes binary decision:
   *   **Chat Mode:** Outputs `{"action": "chat"}` → loads `persona_adapter` for natural conversation
   *   **Command Mode:** Outputs structured JSON with intent (e.g., `{"intent": "add_to_list", "item": "milk"}`)
3. Application processes the orchestrator's decision and executes accordingly

**Test Results - What's Working:**
*   ✅ **Successful Adapter Loading:** Both adapters load and cache properly, with smooth switching between them
*   ✅ **Chat Detection:** Greetings and casual conversation correctly route to persona adapter
    *   Examples: "hey tomo", "good! how r u?", "im chilling", "you are doing great"
*   ✅ **Command Detection:** Task-oriented requests trigger command mode with structured JSON output
    *   Examples: "im going to improve a coding project" → `go_home` intent, "make a todo list" → `make_list` intent
*   ✅ **Persona Consistency:** Tomo maintains personality with ASCII emoticons `(o_o)`, `(^_~)`, `(^-^)` in responses
*   ✅ **Contextual Responses:** Some nice emergent behavior like "Chilling mode! (o_o)" for "im chilling"

**Known Issues & Edge Cases:**
*   ⚠️ **False Positive Commands:** "u r funny hahaha" incorrectly classified as command (`get_status` intent) instead of chat
*   ⚠️ **Intent Naming Inconsistency:** Training data shows both `go_home` and `phone_home` being used
*   ⚠️ **Content Extraction Accuracy:** Some commands don't preserve original user phrasing accurately
*   ⚠️ **Limited Training Data:** Small dataset leads to occasional misclassification of edge cases

**Conclusion:**
The two-adapter architecture is **functionally validated**. The system successfully routes between conversational and command modes, maintains a consistent persona, and generates appropriate structured output for task execution. While there are edge cases and accuracy issues stemming from limited training data, the core mechanism works as designed. This is a major step forward from earlier attempts with single-model approaches.

**Next Development Phase:**
The foundation is solid. The immediate path forward involves:
1. Expanding training datasets for both adapters to improve accuracy and reduce misclassification
2. Implementing the third dimension: multi-persona routing (creative/focused/helpful modes)
3. Building out actual command execution (API calls, database writes, etc.)
4. Testing the experimental `persona_router_adapter` (checkpoint-1500) for comparison