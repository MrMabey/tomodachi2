# 🧹 Tomodachi Cleanup Plan

## 📋 Files & Folders to Clean Up

### 1. Empty/Unused Folders ✅ Safe to Remove

```bash
# Empty database folder (not being used)
rm -rf /Users/mamatoya/tomodachi/database/
```

**Reason:** Empty folder, never populated. Memory system uses `memories/data/` instead.

---

### 2. Log Files 🟡 Safe to Delete (Will Regenerate)

```bash
# Remove log files from root (they regenerate on startup)
rm /Users/mamatoya/tomodachi/server.log
rm /Users/mamatoya/tomodachi/memory.log
```

**Size:** 12KB + 4KB = 16KB total
**Reason:** Runtime logs that regenerate. Not tracked in git.

**Better Solution:** Update `.gitignore` to exclude them:
```bash
echo "*.log" >> .gitignore
```

---

### 3. macOS Cache Files 🟡 Safe to Delete

```bash
# Remove .DS_Store files (macOS Finder metadata)
find /Users/mamatoya/tomodachi -name ".DS_Store" -delete
```

**Reason:** macOS-specific metadata files. Already in `.gitignore` but some slipped through.

---

### 4. Outdated Documentation 🔴 Needs Review Before Delete

**File:** `MEMORY_INTEGRATION_TODO.md` (root folder)
- **Status:** Outdated - memory integration is DONE (Option A was implemented)
- **Action:** Archive or update with current status

**Suggested Actions:**
```bash
# Option A: Move to docs folder as historical reference
mv MEMORY_INTEGRATION_TODO.md docs/sessions/MEMORY_INTEGRATION_COMPLETED.md

# Option B: Delete if content is captured in session notes
rm MEMORY_INTEGRATION_TODO.md
```

**Reason:** Memory system is now running as separate service (Option A). Most TODOs are either done or documented elsewhere.

---

### 5. Reference File (Keep for Now) ✅

**File:** `campground/ai-sidebar.html`
- **Status:** Design reference used for glassmorphism redesign
- **Action:** Keep temporarily, can delete after confirming no more design tweaks needed

---

### 6. Avatar Files 🟡 Consider Organization

**Location:** `campground/public/avatars/`
- 10 avatar files (alien, dragon, ghost, panda, robot, etc.)
- Total size: ~150KB
- Currently unused in Campground UI

**Options:**
1. **Keep** - If planning to add 3D avatars to scene soon
2. **Move** - To `campground/src/avatars/` (better organization)
3. **Archive** - Move to `docs/experimental/avatars/` if not using soon

**Recommendation:** Keep for now since 3D avatar is on roadmap.

---

### 7. Git Status - Untracked Files 🟢 Review Before Commit

**New files to potentially commit:**
```
?? MEMORY_INTEGRATION_TODO.md          # Archive/delete first
?? campground/ai-sidebar.html          # Keep as reference or delete
?? docs/CAMPGROUND_UI.md               # ✅ Commit
?? docs/README_TODO.md                 # ✅ Commit
?? docs/sessions/SESSION_NOTES_2025-10-27.md  # ✅ Commit
?? memory.log                           # ✅ Add to .gitignore
?? server.log                           # ✅ Add to .gitignore
```

---

## 🔧 Recommended Cleanup Script

```bash
#!/bin/bash
# Run from tomodachi root directory

echo "🧹 Starting cleanup..."

# 1. Remove empty database folder
if [ -d "database" ] && [ -z "$(ls -A database)" ]; then
    echo "Removing empty database folder..."
    rm -rf database/
fi

# 2. Remove log files
echo "Removing log files..."
rm -f server.log memory.log

# 3. Remove .DS_Store files
echo "Removing .DS_Store files..."
find . -name ".DS_Store" -delete

# 4. Update .gitignore
echo "Updating .gitignore..."
if ! grep -q "^\*.log$" .gitignore; then
    echo "*.log" >> .gitignore
fi

# 5. Archive old TODO
echo "Archiving MEMORY_INTEGRATION_TODO.md..."
if [ -f "MEMORY_INTEGRATION_TODO.md" ]; then
    mv MEMORY_INTEGRATION_TODO.md docs/sessions/MEMORY_INTEGRATION_COMPLETED.md
fi

echo "✨ Cleanup complete!"
```

Save as `cleanup.sh`, make executable with `chmod +x cleanup.sh`, then run `./cleanup.sh`.

---

## 📊 Space Savings Summary

| Item | Size | Safe to Delete? |
|------|------|----------------|
| database/ folder | 0 KB | ✅ Yes |
| *.log files | 16 KB | ✅ Yes |
| .DS_Store files | <1 KB | ✅ Yes |
| MEMORY_INTEGRATION_TODO.md | 4 KB | 🟡 Archive |
| ai-sidebar.html | 16 KB | 🟡 Temporary |
| avatars/ | 150 KB | 🟢 Keep |

**Total immediate savings:** ~20 KB (minimal, mostly for git cleanliness)

---

## 🎯 Priority Actions

### High Priority (Do Now)
1. ✅ Delete empty `database/` folder
2. ✅ Add `*.log` to `.gitignore`
3. ✅ Archive or delete `MEMORY_INTEGRATION_TODO.md`
4. ✅ Commit new documentation files

### Medium Priority (This Week)
1. 🟡 Review `ai-sidebar.html` - delete if design is finalized
2. 🟡 Organize avatar files or document future plans
3. 🟡 Clean up .DS_Store files (run `find . -name ".DS_Store" -delete`)

### Low Priority (Nice to Have)
1. 🔵 Add Python `__pycache__` cleanup to startup script
2. 🔵 Add log rotation for server.log if it gets large
3. 🔵 Document which avatar files are actually used

---

## 📝 Notes

- **Don't delete:** `venv/`, `node_modules/`, `memories/data/` - these are active
- **Python cache:** `__pycache__/` folders already in `.gitignore`
- **Model files:** `.safetensors` already in `.gitignore`
- **Checkpoints:** Training checkpoints already gitignored

---

## 🚫 What NOT to Clean

These look like clutter but are actually needed:

- ❌ `memories/data/edge_rag.db` - Active database
- ❌ `memories/data/edge_rag.ann` - Annoy vector index
- ❌ `campground/ai-sidebar.html` - Design reference (keep for now)
- ❌ `campground/public/avatars/` - Future 3D avatar system
- ❌ Any `checkpoint-*/` folders in ai/ - Training artifacts

---

*Last updated: 2025-10-27*
