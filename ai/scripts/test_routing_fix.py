#!/usr/bin/env python3
"""
Quick test to verify orchestrator routing is working correctly after bug fix
"""

import requests
import json

API_BASE = "http://localhost:5000/api"

# Test cases
test_cases = [
    {
        "input": "im building a cat tower out of cardboard",
        "expected_route": "chat",
        "expected_intent": None,
        "description": "Statement should route to chat"
    },
    {
        "input": "add coffee to my todo list",
        "expected_route": "command",
        "expected_intent": "add_to_list",
        "description": "Command should route to command with correct intent"
    },
    {
        "input": "hello!",
        "expected_route": "chat",
        "expected_intent": None,
        "description": "Greeting should route to chat"
    },
    {
        "input": "remind me to call mom tomorrow",
        "expected_route": "command",
        "expected_intent": "set_reminder",
        "description": "Reminder should route to command"
    },
    {
        "input": "what are your modes?",
        "expected_route": "chat",
        "expected_intent": None,
        "description": "Question should route to chat"
    },
    {
        "input": "take a note: buy groceries",
        "expected_route": "command",
        "expected_intent": "take_note",
        "description": "Note-taking should route to command"
    }
]

moods_to_test = ["CREATIVE", "FOCUSED", "HELPFUL", "LISTENING"]

def test_routing():
    print("=" * 70)
    print("Testing Orchestrator Routing After Bug Fix")
    print("=" * 70)
    print()

    total_tests = 0
    passed_tests = 0

    for mood in moods_to_test:
        print(f"\n{'─' * 70}")
        print(f"Testing with mood: {mood}")
        print(f"{'─' * 70}\n")

        # Set mood
        try:
            response = requests.post(
                f"{API_BASE}/mood",
                json={"mood": mood},
                timeout=5
            )
            print(f"✓ Mood set to {mood}")
        except Exception as e:
            print(f"✗ Failed to set mood: {e}")
            continue

        for test in test_cases:
            total_tests += 1
            print(f"\nTest {total_tests}: {test['description']}")
            print(f"  Input: '{test['input']}'")
            print(f"  Expected: {test['expected_route']}", end="")
            if test['expected_intent']:
                print(f" (intent: {test['expected_intent']})", end="")
            print()

            try:
                # Send inference request
                response = requests.post(
                    f"{API_BASE}/inference",
                    json={"input": test['input']},
                    timeout=30
                )

                if response.status_code == 200:
                    result = response.json()
                    actual_route = result.get("route")
                    actual_intent = result.get("intent")
                    actual_mood = result.get("mood")

                    # Check route
                    route_correct = actual_route == test['expected_route']

                    # Check intent if applicable
                    intent_correct = True
                    if test['expected_intent']:
                        intent_correct = actual_intent == test['expected_intent']

                    if route_correct and intent_correct:
                        print(f"  ✅ PASS - Route: {actual_route}", end="")
                        if actual_intent:
                            print(f", Intent: {actual_intent}", end="")
                        print(f", Mood: {actual_mood}")
                        passed_tests += 1
                    else:
                        print(f"  ❌ FAIL - Got route: {actual_route}", end="")
                        if actual_intent:
                            print(f", intent: {actual_intent}", end="")
                        print()
                        if not route_correct:
                            print(f"    Expected route: {test['expected_route']}")
                        if not intent_correct:
                            print(f"    Expected intent: {test['expected_intent']}")

                    # Show latency
                    print(f"    Latency: {result.get('total_latency', 0):.2f}s")

                else:
                    print(f"  ❌ FAIL - HTTP {response.status_code}")
                    print(f"    {response.text}")

            except requests.exceptions.Timeout:
                print(f"  ❌ FAIL - Request timeout (>30s)")
            except Exception as e:
                print(f"  ❌ FAIL - Error: {e}")

    # Summary
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"Total tests: {total_tests}")
    print(f"Passed: {passed_tests}")
    print(f"Failed: {total_tests - passed_tests}")
    print(f"Success rate: {(passed_tests/total_tests*100):.1f}%")
    print()

    if passed_tests == total_tests:
        print("🎉 All tests passed! Routing is working correctly!")
    else:
        print("⚠️  Some tests failed. Review the output above.")

    print("=" * 70)

if __name__ == "__main__":
    print("\nMake sure the Tomo GUI server is running at http://localhost:5000")
    print("Press Enter to start testing, or Ctrl+C to cancel...")
    input()

    try:
        test_routing()
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user.")
    except Exception as e:
        print(f"\n\nTest failed with error: {e}")
