import subprocess
import json
import os

def run_test(query):
    """Runs the test_finetune.py script with a given query and returns the output."""
    command = ["python3", "test_finetune.py", "--query", query]
    result = subprocess.run(command, capture_output=True, text=True)
    return result.stdout

def parse_output(output):
    """Parses the output of the test script to extract key information."""
    adapter_loaded = None
    intent = None
    content = None
    raw_output = None

    for line in output.splitlines():
        if "--- Loading" in line:
            adapter_loaded = line.split(" ")[2].strip()
        if "DEBUG: Intent=" in line:
            try:
                intent_str = line.split("DEBUG: Intent=")[1].split(",")[0]
                intent = intent_str
                content_str = line.split("Content=")[1]
                content = json.loads(content_str)
            except (IndexError, json.JSONDecodeError):
                pass # Ignore parsing errors for now
        if "Tomo:" in line and "(I understood the command, but failed to generate valid JSON.)" in line:
             raw_output_line = next((l for l in output.splitlines() if "DEBUG: Raw output:" in l), None)
             if raw_output_line:
                 raw_output = raw_output_line.split("DEBUG: Raw output: ")[1]

    return adapter_loaded, intent, content, raw_output

def main():
    golden_pairs_file = "golden_pairs.jsonl"
    if not os.path.exists(golden_pairs_file):
        print(f"Error: {golden_pairs_file} not found.")
        return

    with open(golden_pairs_file, 'r') as f:
        for i, line in enumerate(f):
            test_case = json.loads(line)
            query = test_case["query"]
            expected_adapter = test_case["expected_adapter"]
            expected_intent = test_case["expected_intent"]
            expected_content_keys = test_case["expected_content_keys"]

            print(f"--- Running Test Case #{i+1} ---")
            print(f"Query: {query[:80]}...")

            output = run_test(query)
            adapter_loaded, intent, content, raw_output = parse_output(output)

            pass_fail_status = []

            # Test 1: Adapter Loading
            if adapter_loaded == expected_adapter:
                pass_fail_status.append(f"  [PASS] Adapter: Correctly loaded '{adapter_loaded}'")
            else:
                pass_fail_status.append(f"  [FAIL] Adapter: Expected '{expected_adapter}', but loaded '{adapter_loaded}'")

            # Test 2: Intent and Content (for orchestrator)
            if expected_adapter == "orchestrator_adapter":
                if intent == expected_intent:
                    pass_fail_status.append(f"  [PASS] Intent: Correctly identified as '{intent}'")
                else:
                    pass_fail_status.append(f"  [FAIL] Intent: Expected '{expected_intent}', but got '{intent}'")
                
                if content and expected_content_keys:
                    missing_keys = [key for key in expected_content_keys if key not in content]
                    if not missing_keys:
                        pass_fail_status.append(f"  [PASS] Content: All expected keys found.")
                    else:
                        pass_fail_status.append(f"  [FAIL] Content: Missing keys {missing_keys}")
                elif raw_output:
                    pass_fail_status.append(f"  [INFO] Content: Model failed to generate valid JSON. Raw output: {raw_output}")

            print("\n".join(pass_fail_status))
            print("------------------------------------\n")

if __name__ == "__main__":
    main()
