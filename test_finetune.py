import torch
from peft import PeftModel
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
import sys
import json
import os
import argparse

# --- Configuration ---
base_model_name = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
persona_router_adapter_dir = "./persona_router_adapter"
orchestrator_adapter_dir = "./orchestrator_adapter"
persona_adapter_dir = "./persona_adapter" # General purpose persona

# --- Mappings for future adapters ---
ADAPTER_MAP = {
    "orchestrator": orchestrator_adapter_dir,
    "focused": persona_adapter_dir, # Fallback to general persona for now
    "creative": persona_adapter_dir, # Fallback to general persona for now
    "helpful": persona_adapter_dir,  # Fallback to general persona for now
    "default": persona_adapter_dir
}


# --- Argument Parser ---
parser = argparse.ArgumentParser(description="Test script for Tomo's dynamic adapters.")
parser.add_argument("--query", type=str, help="A single query to process non-interactively.")
args = parser.parse_args()

# --- Model Loading ---
print("Loading base model...")
# Load the base model in float16
base_model = AutoModelForCausalLM.from_pretrained(
    base_model_name,
    torch_dtype=torch.float16,
    device_map="auto",
)

print("Loading tokenizer...")
tokenizer = AutoTokenizer.from_pretrained(base_model_name)
tokenizer.pad_token = tokenizer.eos_token # Set pad token

# --- Global Pipeline Cache ---
# Cache for loaded pipelines to avoid reloading models
pipelines = {}

# --- Helper Functions ---
def clean_and_parse_json(text):
    """Finds the first '{' and last '}' to extract a JSON object."""
    try:
        start = text.find('{')
        end = text.rfind('}') + 1
        if start == -1 or end == 0:
            return None
        json_str = text[start:end]
        # Be more robust against trailing characters
        return json.loads(json_str)
    except json.JSONDecodeError:
        print(f"DEBUG: Failed to decode JSON from: {text}")
        return None

def get_pipeline_for_adapter(adapter_dir):
    """Loads and caches a pipeline for a given adapter."""
    if adapter_dir in pipelines:
        print(f"--- Using cached {os.path.basename(adapter_dir)} adapter ---")
        return pipelines[adapter_dir]

    print(f"--- Loading {os.path.basename(adapter_dir)} adapter ---")
    # It's safer to reload the base model before applying a new adapter
    # to ensure no residual weights from other adapters.
    model = AutoModelForCausalLM.from_pretrained(
        base_model_name,
        torch_dtype=torch.float16,
        device_map="auto",
    )
    model = PeftModel.from_pretrained(model, adapter_dir)
    model = model.merge_and_unload()

    pipe = pipeline(
        "text-generation",
        model=model,
        tokenizer=tokenizer,
        torch_dtype=torch.float16,
        device_map="auto",
    )
    pipelines[adapter_dir] = pipe
    print(f"--- Adapter {os.path.basename(adapter_dir)} loaded and cached. ---")
    return pipe

def run_inference(pipe, prompt, max_new_tokens=150):
    """Runs inference using the provided pipeline and prompt."""
    sequences = pipe(
        prompt,
        max_new_tokens=max_new_tokens,
        do_sample=True,
        temperature=0.7,
        top_k=50,
        top_p=0.95,
        num_return_sequences=1,
        pad_token_id=tokenizer.eos_token_id
    )
    return sequences[0]['generated_text'].split("<|im_start|>assistant\n")[-1].replace("<|im_end|>", "").strip()

def process_query(user_input):
    """
    NEW ARCHITECTURE: Orchestrator as Router
    1. Orchestrator decides: command JSON or {"action": "chat"}
    2. If chat → route to persona_adapter for response
    3. If command → process the command
    """
    prompt = f"<|im_start|>user\n{user_input}<|im_end|>\n<|im_start|>assistant\n"

    # 1. --- Orchestrator Decision ---
    print("--- 1. Orchestrator Decision ---")
    orchestrator_pipe = get_pipeline_for_adapter(orchestrator_adapter_dir)
    orchestrator_output = run_inference(orchestrator_pipe, prompt, max_new_tokens=100)

    parsed_json = clean_and_parse_json(orchestrator_output)

    if not parsed_json:
        print(f"Tomo: (Failed to parse orchestrator output)")
        print(f"DEBUG: Raw output: {orchestrator_output}")
        return

    # 2. --- Route Based on Output ---
    if "action" in parsed_json and parsed_json["action"] == "chat":
        # Chat mode - use persona adapter
        print("--- 2. Chat Mode - Using Persona Adapter ---")
        persona_pipe = get_pipeline_for_adapter(persona_adapter_dir)
        persona_output = run_inference(persona_pipe, prompt, max_new_tokens=150)
        print(f"Tomo: {persona_output}")

    elif "intent" in parsed_json:
        # Command mode - process the command
        print("--- 2. Command Mode - Processing Intent ---")
        print(f"Tomo: (Understood command)")
        print(f"DEBUG: Intent={parsed_json.get('intent')}, Full JSON={parsed_json}")

        # TODO: Actually execute the command (send to API, save to DB, etc.)

    else:
        print(f"Tomo: (Unknown orchestrator output format)")
        print(f"DEBUG: Received: {parsed_json}")


# --- Main Execution Logic ---
if __name__ == "__main__":
    if args.query:
        # Non-interactive mode
        print(f"\nUser: {args.query}")
        process_query(args.query)
    else:
        # Interactive mode
        print("\n--- Tomo is ready. Type 'exit' or 'quit' to end the session. ---")
        while True:
            try:
                user_input = input("\nUser: ")
                if user_input.lower() in ["exit", "quit"]:
                    print("Tomo powering down. Goodbye!")
                    break
                process_query(user_input)
            except KeyboardInterrupt:
                print("\n\nTomo powering down. Goodbye!")
                break
