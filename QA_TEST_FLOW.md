# Tomodachi QA Test Flow

Quality Assurance testing procedures for validating Tomodachi functionality.

## Manual Test Flow (Current)

This is the standard test flow to verify everything is working after setup or changes.

### Prerequisites
```bash
# Start all services
./start.sh

# Wait for services to initialize (~10 seconds)
# Check logs if needed:
# tail -f logs/api.log
```

### Test Sequence

#### 1. **Send Message Test**
- [ ] Open Campground: http://localhost:5173
- [ ] Drag an avatar/character into the scene
- [ ] Click on the character to open chat
- [ ] Send message: "hey tomo"
- [ ] **Expected**: Response appears in chat window
- [ ] **Backend**: Check `logs/api.log` for "Processing input: hey tomo"

#### 2. **Character Interaction Test**
- [ ] Drag character around the scene
- [ ] **Expected**: Smooth movement, no lag
- [ ] **Expected**: Character stays in bounds

#### 3. **Latency Display Test**
- [ ] Look at top-left corner during/after message
- [ ] **Expected**: Latency time displays (e.g., "1.2s")
- [ ] **Expected**: Updates after each message

#### 4. **Toolbox Test**
- [ ] Click toolbox icon (if applicable)
- [ ] **Expected**: Shows available avatars
- [ ] Drag different avatar types
- [ ] **Expected**: Each avatar type loads correctly

---

## Backend Verification (Current)

After manual testing, verify backend health:

```bash
# 1. Check all services are running
curl -s http://localhost:5003/ | grep "Edge RAG"  # Memory service
curl -s http://localhost:8080/api/status | jq    # API server
curl -s http://localhost:5173/ | grep "Base Camp" # GUI

# 2. Check adapter loading
grep "Adapter loaded" logs/api.log

# 3. Check memory system
grep "POST.*ingest\|POST.*query" logs/memory.log

# 4. Check for errors
grep -i "error\|exception\|fail" logs/*.log
```

### Expected Results

| Check | Expected Output |
|-------|-----------------|
| Memory service | HTML page with "Edge RAG Mini Control Panel" |
| API status | JSON with `model_loaded: true` (after first message) |
| GUI | HTML with `<title>Base Camp</title>` |
| Adapter logs | "✓ Adapter loaded: .../orchestrator_adapter" |
| Memory logs | POST requests to `/api/ingest` and `/api/query` |
| Error check | No critical errors (warnings OK) |

---

## Performance Benchmarks

### Cold Start (First Message)
- **Model Loading**: ~7 seconds
- **Total Response**: ~10-15 seconds

### Warm (Subsequent Messages)
- **Orchestrator**: <1 second
- **Persona Response**: 1-3 seconds
- **Total Latency**: 2-5 seconds

### Memory System
- **Ingestion**: ~100-200ms (sentence-transformers)
- **Query**: ~50ms (Annoy index)
- **Index Build**: <1ms

---

## Automated Test Suite (Future)

### Backend Tests (Can Automate)

```python
# tests/test_backend.py
import requests
import pytest

def test_api_status():
    """Test API server is running"""
    response = requests.get("http://localhost:8080/api/status")
    assert response.status_code == 200
    assert "model_config" in response.json()

def test_memory_ingest():
    """Test memory ingestion"""
    response = requests.post(
        "http://localhost:5003/api/ingest",
        json={"text": "test", "thread_id": "qa_test"}
    )
    assert response.status_code == 200
    assert "document" in response.json()

def test_memory_query():
    """Test memory retrieval"""
    response = requests.post(
        "http://localhost:5003/api/query",
        json={"query_text": "test", "top_k": 3}
    )
    assert response.status_code == 200
    assert "results" in response.json()

def test_inference():
    """Test AI inference"""
    response = requests.post(
        "http://localhost:8080/api/inference",
        json={"input": "hello"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    assert data["total_latency"] > 0
```

### Frontend Tests (Can Automate with Playwright)

```javascript
// tests/test_frontend.spec.js
const { test, expect } = require('@playwright/test');

test('campground loads', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await expect(page).toHaveTitle(/Base Camp/);
});

test('can drag avatar', async ({ page }) => {
  await page.goto('http://localhost:5173');
  // Wait for scene to load
  await page.waitForTimeout(2000);

  // Find avatar in toolbox
  const avatar = page.locator('[data-testid="avatar-robot"]');

  // Drag to scene
  await avatar.dragTo(page.locator('[data-testid="scene"]'));

  // Verify avatar exists in scene
  await expect(page.locator('[data-testid="scene-avatar"]')).toBeVisible();
});

test('can send message', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Click avatar to open chat
  await page.locator('[data-testid="scene-avatar"]').click();

  // Type message
  await page.fill('[data-testid="chat-input"]', 'hey tomo');
  await page.click('[data-testid="send-button"]');

  // Wait for response
  await page.waitForSelector('[data-testid="chat-response"]', {
    timeout: 15000 // Cold start can take time
  });

  // Verify latency displayed
  const latency = page.locator('[data-testid="latency-display"]');
  await expect(latency).toBeVisible();
  await expect(latency).toContainText(/\d+\.?\d*s/);
});
```

---

## Integration Test Script

Quick script to verify full system health:

```bash
#!/bin/bash
# tests/integration_test.sh

echo "🧪 Running Tomodachi Integration Tests"
echo ""

# 1. Check services
echo "1️⃣ Checking services..."
curl -sf http://localhost:5003/ > /dev/null && echo "  ✓ Memory service" || echo "  ✗ Memory service FAILED"
curl -sf http://localhost:8080/api/status > /dev/null && echo "  ✓ API server" || echo "  ✗ API server FAILED"
curl -sf http://localhost:5173/ > /dev/null && echo "  ✓ GUI" || echo "  ✗ GUI FAILED"
echo ""

# 2. Test memory ingestion
echo "2️⃣ Testing memory system..."
INGEST=$(curl -sf -X POST http://localhost:5003/api/ingest \
  -H "Content-Type: application/json" \
  -d '{"text":"integration test","thread_id":"test"}')
if echo "$INGEST" | grep -q "doc_id"; then
  echo "  ✓ Memory ingestion"
else
  echo "  ✗ Memory ingestion FAILED"
fi
echo ""

# 3. Test AI inference
echo "3️⃣ Testing AI inference..."
INFERENCE=$(curl -sf -X POST http://localhost:8080/api/inference \
  -H "Content-Type: application/json" \
  -d '{"input":"test"}')
if echo "$INFERENCE" | grep -q "response"; then
  echo "  ✓ AI inference"
  LATENCY=$(echo "$INFERENCE" | jq -r '.total_latency')
  echo "  ⏱️  Latency: ${LATENCY}s"
else
  echo "  ✗ AI inference FAILED"
fi
echo ""

# 4. Check for errors in logs
echo "4️⃣ Checking logs for errors..."
ERRORS=$(grep -i "error\|exception" logs/*.log 2>/dev/null | grep -v "UserWarning" | wc -l)
if [ "$ERRORS" -eq 0 ]; then
  echo "  ✓ No critical errors in logs"
else
  echo "  ⚠️  Found $ERRORS error(s) in logs"
fi
echo ""

echo "✅ Integration tests complete!"
```

---

## Regression Test Checklist

Run these after making changes to ensure nothing broke:

### Configuration Changes
- [ ] `python3 config.py` - Verify config loads
- [ ] `python3 validate.py` - All checks pass
- [ ] Test with port conflicts (occupy 5003, 8080, 5173)
- [ ] Test without adapters (rename `ai/` folder temporarily)

### Code Changes
- [ ] `./start.sh` - All services start
- [ ] Send test message - Response received
- [ ] Check logs for errors
- [ ] Test memory ingestion/query
- [ ] Test all 9 moods via `/api/mood`

### Deployment
- [ ] Fresh clone on new machine
- [ ] `./start.sh` on first run
- [ ] Test basic flow (message + drag)
- [ ] Verify logs show correct ports
- [ ] Test shutdown (Ctrl+C cleans up PIDs)

---

## Known Issues (Non-blocking)

These appear in logs but don't affect functionality:

1. **torch_dtype deprecation warning**
   - Appears during model loading
   - Will be fixed in next PyTorch update

2. **PEFT multiple adapters warning**
   - Expected when switching between adapters
   - No impact on performance

3. **Orchestrator extra tokens**
   - Adapter occasionally outputs `<|im_end|>` after JSON
   - Handled gracefully by try/except

---

## Test Data Cleanup

After testing, optionally clean test data:

```bash
# Remove test messages from memory
sqlite3 memories/data/edge_rag.db "DELETE FROM documents WHERE thread_id = 'test';"

# Or reset entire memory database
rm memories/data/edge_rag.db memories/data/edge_rag.ann
# Will be recreated on next ingest
```

---

## CI/CD Integration (Future)

For GitHub Actions or similar:

```yaml
# .github/workflows/test.yml
name: QA Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.10'
      - name: Validate setup
        run: python3 validate.py
      - name: Install dependencies
        run: |
          python3 -m venv venv
          source venv/bin/activate
          pip install -r server/requirements.txt
      - name: Run backend tests
        run: pytest tests/test_backend.py
```

---

## Quick Test Command

For daily development testing:

```bash
# One-liner to verify everything works
./start.sh && sleep 15 && bash tests/integration_test.sh
```

---

**Last Updated**: 2025-11-01
**Test Flow Version**: 1.0
**Tester**: mamatoya
