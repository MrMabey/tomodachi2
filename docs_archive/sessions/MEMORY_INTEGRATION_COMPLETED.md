# Memory System Integration - Full Refactor TODO

## Current Status (Quick Integration)
✅ Code integration complete in `server/tomo_api.py`
✅ Memory storage/retrieval functions added
✅ Hooks added to `/api/inference` endpoint
❌ **BLOCKED**: Python version incompatibility

## Blocking Issue
- Edge RAG requires Python 3.11 (for `annoy` package compilation)
- Main `venv` uses Python 3.13
- `annoy` 1.17.3 fails to compile on Python 3.13 (missing C++ headers)

## Quick Fix Options

### Option A: Separate Memory Service
1. Create Python 3.11 venv in `memories/` folder:
   ```bash
   cd memories
   /opt/homebrew/bin/python3.11 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

2. Run memory system as separate Flask service on port 5003:
   ```bash
   FLASK_APP=edge_rag.web:create_app FLASK_RUN_PORT=5003 python3 -m flask run
   ```

3. Update `tomo_api.py` to call memory service via HTTP:
   - POST to `http://localhost:5003/api/ingest` for storage
   - POST to `http://localhost:5003/api/query` for retrieval

### Option B: Rebuild Main Venv with Python 3.11
1. Delete current `venv/`
2. Create new venv with Python 3.11:
   ```bash
   /opt/homebrew/bin/python3.11 -m venv venv
   source venv/bin/activate
   pip install -r server/requirements.txt
   pip install -r memories/requirements.txt
   ```

## Full Refactor Tasks (When You Have Time)

### 1. Thread Management
- [ ] Add thread_id parameter to GUI chat interface
- [ ] Store thread_id in session/localStorage
- [ ] Pass thread_id through `/api/inference` requests
- [ ] Allow users to switch between conversation threads

### 2. Memory UI Integration
- [ ] Add "Memories" panel to campground toolbox
- [ ] Show retrieved memories in chat UI (e.g., "💭 Remembering: ...")
- [ ] Add memory search interface
- [ ] Display memory stats (total memories, threads, etc.)

### 3. API Endpoints
- [ ] `GET /api/memories` - List all memories
- [ ] `GET /api/memories/threads` - List conversation threads
- [ ] `POST /api/memories/search` - Search memories
- [ ] `DELETE /api/memories/:id` - Delete specific memory
- [ ] `GET /api/memories/stats` - Memory system statistics

### 4. Configuration
- [ ] Add memory system toggles (enable/disable retrieval)
- [ ] Configurable `top_k` (how many memories to retrieve)
- [ ] Configurable `min_similarity` threshold
- [ ] Option to exclude certain threads from retrieval

### 5. Optimization
- [ ] Index building happens on startup - add progress indicator
- [ ] Large memory sets slow down retrieval - add caching
- [ ] Memory context can bloat prompts - add summarization
- [ ] Store embeddings alongside conversation history for faster access

### 6. Testing
- [ ] Test memory storage with various conversation lengths
- [ ] Test retrieval relevance (are memories actually useful?)
- [ ] Test thread isolation (memories from thread A don't leak to thread B)
- [ ] Test edge cases (empty memories, identical messages, etc.)

## Current Integration Code

The integration code is already in `server/tomo_api.py`:
- Lines 18-30: Import Edge RAG with fallback
- Lines 159-195: `store_memory()` and `retrieve_memories()` helper functions
- Lines 305-323: Modified `process_chat_response()` to use memories
- Lines 356-367: Modified `/api/inference` endpoint to store conversations

## Next Steps

1. **Immediate**: Choose Option A or B above to fix Python version issue
2. **Test**: Have a conversation with Tomo and verify memories are being stored/retrieved
3. **Iterate**: If memories work, gradually add UI features from "Full Refactor" list
4. **Monitor**: Check `memories/data/edge_rag.db` to see stored memories and telemetry

## Notes

- Current thread_id is hardcoded to "default"
- Memory context is prepended to user input (may affect response quality)
- No UI feedback yet when memories are used
- The orchestrator decision doesn't use memory context (intentional)
