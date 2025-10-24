# Test Results - October 21, 2025

## Test Session: Orchestrator + Persona Adapter

**Date:** 10/21/25
**Architecture:** Orchestrator as Router (two-adapter system)
**Adapters Tested:**
- `orchestrator_adapter` (checkpoint-1900)
- `persona_adapter` (checkpoint-1100)

---

## Session Output

```
(base) mamatoya@Michaels-MacBook-Pro tamai_reboot % python test_finetune.py
Loading base model...
`torch_dtype` is deprecated! Use `dtype` instead!
Loading tokenizer...

--- Tomo is ready. Type 'exit' or 'quit' to end the session. ---

User: hey tomo
--- 1. Orchestrator Decision ---
--- Loading orchestrator_adapter adapter ---
`torch_dtype` is deprecated! Use `dtype` instead!
Device set to use mps
--- Adapter orchestrator_adapter loaded and cached. ---
--- 2. Chat Mode - Using Persona Adapter ---
--- Loading persona_adapter adapter ---
Device set to use mps
--- Adapter persona_adapter loaded and cached. ---
Tomo: Hey! How are you today? (^_~)

User: good! how r u?
--- 1. Orchestrator Decision ---
--- Using cached orchestrator_adapter adapter ---
--- 2. Chat Mode - Using Persona Adapter ---
--- Using cached persona_adapter adapter ---
Tomo: I'm operating at peak efficiency! What can I help you with? (^_~)

User: im going to improve a coding project
--- 1. Orchestrator Decision ---
--- Using cached orchestrator_adapter adapter ---
--- 2. Command Mode - Processing Intent ---
Tomo: (Understood command)
DEBUG: Intent=go_home, Full JSON={'intent': 'go_home', 'content': 'im going to improve a coding project'}

User: make a todo list
--- 1. Orchestrator Decision ---
--- Using cached orchestrator_adapter adapter ---
--- 2. Command Mode - Processing Intent ---
Tomo: (Understood command)
DEBUG: Intent=make_list, Full JSON={'intent': 'make_list', 'content': 'add new todo'}

User: im chilling
--- 1. Orchestrator Decision ---
--- Using cached orchestrator_adapter adapter ---
--- 2. Chat Mode - Using Persona Adapter ---
--- Using cached persona_adapter adapter ---
Tomo: Chilling mode! (o_o)

User: u r funny hahaha
--- 1. Orchestrator Decision ---
--- Using cached orchestrator_adapter adapter ---
--- 2. Command Mode - Processing Intent ---
Tomo: (Understood command)
DEBUG: Intent=get_status, Full JSON={'intent': 'get_status', 'content': 'hahaha'}

User: you are doing great
--- 1. Orchestrator Decision ---
--- Using cached orchestrator_adapter adapter ---
--- 2. Chat Mode - Using Persona Adapter ---
--- Using cached persona_adapter adapter ---
Tomo: You are perfect! Ready for a task? (o_o)
```

---

## Observations

### ✅ What's Working Well

1. **Adapter Loading & Caching:** Both adapters load successfully and are cached for subsequent queries
2. **Chat Detection:** Greetings and casual conversation are correctly routed to persona adapter
   - "hey tomo" → Chat mode ✓
   - "good! how r u?" → Chat mode ✓
   - "im chilling" → Chat mode ✓
   - "you are doing great" → Chat mode ✓

3. **Command Detection:** Task-oriented inputs trigger command mode
   - "im going to improve a coding project" → `go_home` intent
   - "make a todo list" → `make_list` intent

4. **Persona Consistency:** Responses include ASCII emoticons as trained
   - Uses `(^_~)`, `(o_o)` appropriately

### ⚠️ Issues Identified

1. **False Positive Command Detection:**
   - **Input:** "u r funny hahaha"
   - **Expected:** Chat mode (casual laughter/expression)
   - **Actual:** Command mode with `get_status` intent
   - **Issue:** Orchestrator is over-classifying casual expressions as commands

2. **Persona Response Quality:**
   - "You are perfect! Ready for a task?" feels slightly off-topic for "you are doing great"
   - Persona could be more contextually aware

3. **Intent Mapping Issues:**
   - `go_home` appears when it should likely be `phone_home` (based on training data)
   - `make_list` has incorrect content: "add new todo" instead of preserving user's original phrasing

---

## Next Steps / Recommendations

1. **Expand orchestrator training data** with more casual conversational examples to reduce false positives
2. **Review intent naming consistency** (go_home vs phone_home)
3. **Increase persona training data** for more varied and contextually appropriate responses
4. **Add edge case examples** for expressions like "hahaha", "lol", etc. to chat training
5. Consider testing the `persona_router_adapter` (checkpoint-1500) to compare routing quality
