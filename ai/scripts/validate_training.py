#!/usr/bin/env python3
"""
Validates the locally trained adapters to ensure they meet basic quality standards.
This is a non-interactive script that exits with a status code.
"""

import torch
from peft import PeftModel
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
import json
import sys
import os

# --- Configuration ---
BASE_MODEL_NAME = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
ORCHESTRATOR_ADAPTER_DIR = "ai/orchestrator_adapter"
PERSONA_ADAPTER_DIR = "ai/persona_adapter"

# --- Test Cases ---
TEST_CASES = {
    "orchestrator_chat": {
        "prompt": "hey how are you doing?",
        "expected_action": "chat"
    },
    "orchestrator_command": {
        "prompt": "add bread to my grocery list",
        "expected_intent": "add_to_list"
    },
    "persona_chat": {
        "prompt": "tell me a fun fact about space",
        "expected_emoticons": ["(o_o)", "(^-^)", "(^_~)"]
    }
}

# --- Helper Functions ---
def clean_and_parse_json(text):
    try:
        start = text.find('{')
        end = text.rfind('}') + 1
        if start == -1 or end == 0:
            return None
        json_str = text[start:end]
        return json.loads(json_str)
    except json.JSONDecodeError:
        return None

def run_inference(pipe, prompt):
    sequences = pipe(
        prompt,
        max_new_tokens=100,
        do_sample=True,
        temperature=0.1, # Low temperature for predictable validation
        top_k=50,
        top_p=0.95,
        num_return_sequences=1,
        pad_token_id=pipe.tokenizer.eos_token_id
    )
    return sequences[0]['generated_text'].split("<|im_start|>assistant\n")[-1].replace("<|im_end|>", "").strip()

def main():
    print("--- Starting Adapter Validation ---")
    all_tests_passed = True

    # --- Load Base Model and Tokenizer ---
    try:
        print("Loading base model and tokenizer...")
        base_model = AutoModelForCausalLM.from_pretrained(BASE_MODEL_NAME, torch_dtype=torch.float16, device_map="auto")
        tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL_NAME)
        tokenizer.pad_token = tokenizer.eos_token
        print("✓ Base model and tokenizer loaded.")
    except Exception as e:
        print(f"❌ CRITICAL: Failed to load base model. Error: {e}")
        sys.exit(1)

    # --- Test 1: Orchestrator (Chat Routing) ---
    print("\n--- [1/3] Testing Orchestrator: Chat Routing ---")
    try:
        test_case = TEST_CASES["orchestrator_chat"]
        prompt = f"<|im_start|>user\n{test_case['prompt']}<|im_end|>\n<|im_start|>assistant\n"
        
        model = PeftModel.from_pretrained(base_model, ORCHESTRATOR_ADAPTER_DIR)
        model = model.merge_and_unload()
        pipe = pipeline("text-generation", model=model, tokenizer=tokenizer)

        output = run_inference(pipe, prompt)
        parsed_json = clean_and_parse_json(output)

        if parsed_json and parsed_json.get("action") == test_case["expected_action"]:
            print(f"✓ PASS: Correctly routed to '{test_case["expected_action"]}'.")
        else:
            all_tests_passed = False
            print(f"❌ FAIL: Expected action '{test_case["expected_action"]}', but got: {parsed_json}")

    except Exception as e:
        all_tests_passed = False
        print(f"❌ FAIL: An exception occurred during chat routing test: {e}")

    # --- Test 2: Orchestrator (Command Routing) ---
    print("\n--- [2/3] Testing Orchestrator: Command Routing ---")
    try:
        test_case = TEST_CASES["orchestrator_command"]
        prompt = f"<|im_start|>user\n{test_case['prompt']}<|im_end|>\n<|im_start|>assistant\n"
        
        # Re-using the same orchestrator pipeline
        output = run_inference(pipe, prompt)
        parsed_json = clean_and_parse_json(output)

        if parsed_json and parsed_json.get("intent") == test_case["expected_intent"]:
            print(f"✓ PASS: Correctly identified intent '{test_case["expected_intent"]}'.")
        else:
            all_tests_passed = False
            print(f"❌ FAIL: Expected intent '{test_case["expected_intent"]}', but got: {parsed_json}")

    except Exception as e:
        all_tests_passed = False
        print(f"❌ FAIL: An exception occurred during command routing test: {e}")

    # --- Test 3: Persona (Response Quality) ---
    print("\n--- [3/3] Testing Persona: Response Quality ---")
    try:
        test_case = TEST_CASES["persona_chat"]
        prompt = f"<|im_start|>user\n{test_case['prompt']}<|im_end|>\n<|im_start|>assistant\n"

        # Load persona adapter
        model = AutoModelForCausalLM.from_pretrained(BASE_MODEL_NAME, torch_dtype=torch.float16, device_map="auto") # Reload base
        model = PeftModel.from_pretrained(model, PERSONA_ADAPTER_DIR)
        model = model.merge_and_unload()
        pipe = pipeline("text-generation", model=model, tokenizer=tokenizer)

        output = run_inference(pipe, prompt)
        
        contains_emoticon = any(emoticon in output for emoticon in test_case["expected_emoticons"])
        is_long_enough = len(output) > 10

        if contains_emoticon and is_long_enough:
            print(f"✓ PASS: Persona responded in character with a valid response.")
            print(f"    Response: {output}")
        else:
            all_tests_passed = False
            if not contains_emoticon:
                print("❌ FAIL: Response did not contain a required emoticon.")
            if not is_long_enough:
                print("❌ FAIL: Response was too short.")

    except Exception as e:
        all_tests_passed = False
        print(f"❌ FAIL: An exception occurred during persona quality test: {e}")

    # --- Final Verdict ---
    print("\n--- Validation Complete ---")
    if all_tests_passed:
        print("🎉 SUCCESS: All adapter validation tests passed!")
        sys.exit(0)
    else:
        print("🔥 FAILURE: Some validation tests failed. Please review the logs above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
