import json
from llama_cpp import Llama
from huggingface_hub import hf_hub_download

# --- Configuration ---
MODEL_REPO_ID = "microsoft/Phi-3-mini-4k-instruct-gguf"
MODEL_FILENAME = "Phi-3-mini-4k-instruct-q4.gguf" # Using a 4-bit quantized model

# --- Model Context Protocol (MCP) for Intent Recognition ---
SYSTEM_PROMPT = """
You are 'Flow', an AI assistant state machine. Your job is to understand user requests, identify the correct action, and extract the necessary parameters. You must only respond with a single, valid JSON object and nothing else. Do not add any conversational text or explanations.

**JSON Schema:**
{"action": "string", "parameters": {"வுகளை": "string"}}

**Possible Actions & Parameters:**

1.  **take_note**
    *   Description: For capturing general thoughts, ideas, or ramblings.
    *   Parameters: `{"content": "string"}`

2.  **send_email**
    *   Description: For sending the last captured note as an email to a specific person.
    *   Parameters: `{"recipient": "string"}`

3.  **forward_to_home_llm**
    *   Description: For sending a note to a more powerful computer for complex processing.
    *   Parameters: `{"content": "string", "specialized_model": "string (e.g., 'code', 'creative_writing')"}`

"""

# --- Main Test Logic ---
def run_test():
    """
    Downloads the model, loads it, and runs a series of intent recognition tests.
    """
    print(f"--- Downloading model: {MODEL_FILENAME} from {MODEL_REPO_ID} ---")
    model_path = hf_hub_download(repo_id=MODEL_REPO_ID, filename=MODEL_FILENAME)
    print(f"--- Model downloaded to: {model_path} ---")

    print("--- Loading model ---")
    llm = Llama(
        model_path=model_path,
        n_gpu_layers=-1,  # Offload all layers to GPU if available
        n_ctx=1024,       # Increased context window for more complex prompts
        verbose=False
    )
    print("--- Model loaded successfully ---")

    # Test cases based on the new user stories
    test_prompts = {
        "take_note": "I'm just rambling here, so take some notes. What if we approach the chat bot in a different way?",
        "send_email": "Okay, that's the idea. Now, can you send this email to Miles?",
        "forward_to_home_llm": "New idea for a React component. Let's create a bare-bones mockup for that."
    }

    for intent, user_text in test_prompts.items():
        print(f"\n--- Test for intent '{intent}': Sending user text: '{user_text}' ---")

        response = llm.create_chat_completion(
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_text}
            ],
            temperature=0.0, # Set to 0 for deterministic output
            max_tokens=150
        )

        output = response['choices'][0]['message']['content'].strip()
        print(f"Raw output:\n{output}")

        # Verification
        try:
            json_output = json.loads(output)
            if "action" in json_output and "parameters" in json_output:
                if json_output['action'] == intent:
                    print(f"Verification: PASS - Correct action '{intent}' identified.")
                else:
                    print(f"Verification: WARN - Action identified as '{json_output['action']}' but expected '{intent}'.")
            else:
                print("Verification: FAIL - JSON is missing required keys ('action', 'parameters').")
        except json.JSONDecodeError:
            print("Verification: FAIL - Output is not valid JSON.")

if __name__ == "__main__":
    run_test()