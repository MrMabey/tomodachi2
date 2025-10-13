import torch
from peft import PeftModel
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
import sys
import json
import os
import argparse

# --- Configuration ---
base_model_name = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
persona_adapter_dir = "./persona_adapter"
orchestrator_adapter_dir = "./orchestrator_adapter"
ORCHESTRATION_KEYWORDS = ["add", "note", "list", "remind", "send", "what is on", "jot down", "idea for", "can you", "create"]

# --- Argument Parser ---
parser = argparse.ArgumentParser(description="Test script for Tomo's dynamic adapters.")
parser.add_argument("--query", type=str, help="A single query to process non-interactively.")
args = parser.parse_args()

# --- Model Loading ---
print("Loading base model...")
base_model = AutoModelForCausalLM.from_pretrained(
    base_model_name,
    torch_dtype=torch.float16,
    device_map="auto",
)

print("Loading tokenizer...")
tokenizer = AutoTokenizer.from_pretrained(base_model_name)

# --- Helper Functions ---
def clean_and_parse_json(text):
    """Finds the first '{' and last '}' to extract a JSON object."""
    try:
        start = text.find('{')
        end = text.rfind('}') + 1
        if start == -1 or end == 0:
            return None
        json_str = text[start:end]
        return json.loads(json_str)
    except json.JSONDecodeError:
        return None

def process_query(user_input, current_adapter=None, pipe=None):
    """Processes a single user query, loading adapters as needed."""
    # --- Router Logic ---
    use_orchestrator = any(keyword in user_input.lower() for keyword in ORCHESTRATION_KEYWORDS)
    adapter_to_load = orchestrator_adapter_dir if use_orchestrator else persona_adapter_dir

    # --- Dynamic Adapter Loading ---
    if adapter_to_load != current_adapter:
        print(f"--- Loading {os.path.basename(adapter_to_load)} ---")
        model = PeftModel.from_pretrained(base_model, adapter_to_load)
        model = model.merge_and_unload()
        pipe = pipeline(
            "text-generation",
            model=model,
            tokenizer=tokenizer,
            torch_dtype=torch.float16,
            device_map="auto",
        )
        current_adapter = adapter_to_load
        print("--- Adapter loaded. ---")

    # --- Inference ---
    prompt = f"<|im_start|>user\n{user_input}<|im_end|>\n<|im_start|>assistant\n"
    sequences = pipe(
        prompt,
        max_new_tokens=150,
        do_sample=True,
        temperature=0.7,
        top_k=50,
        top_p=0.95,
        num_return_sequences=1,
        pad_token_id=tokenizer.eos_token_id
    )
    assistant_output_str = sequences[0]['generated_text'].split("<|im_start|>assistant\n")[-1].replace("<|im_end|>", "").strip()

    # --- Output Handling ---
    if use_orchestrator:
        parsed_json = clean_and_parse_json(assistant_output_str)
        if parsed_json:
            print(f"Tomo: (Understood command)")
            print(f"DEBUG: Intent={parsed_json.get('intent')}, Content={parsed_json}")
        else:
            print("Tomo: (I understood the command, but failed to generate valid JSON.)")
            print(f"DEBUG: Raw output: {assistant_output_str}")
    else:
        print(f"Tomo: {assistant_output_str}")
        
    return current_adapter, pipe

# --- Main Execution Logic ---
if args.query:
    # Non-interactive mode
    print(f"\nUser: {args.query}")
    process_query(args.query)
else:
    # Interactive mode
    print("\n--- Tomo is ready. Type 'exit' or 'quit' to end the session. ---")
    current_adapter = None
    pipe = None
    while True:
        try:
            user_input = input("\nUser: ")
            if user_input.lower() in ["exit", "quit"]:
                print("Tomo powering down. Goodbye!")
                break
            current_adapter, pipe = process_query(user_input, current_adapter, pipe)
        except KeyboardInterrupt:
            print("\n\nTomo powering down. Goodbye!")
            break