# Quick Guide: Distributing Adapter Weights

## For YOU (Maintainer)

### When you have trained adapters:

1. **Package them:**
   ```bash
   ./scripts/package_adapters.sh
   # Creates: dist/tomodachi-adapters-TIMESTAMP.tar.gz
   ```

2. **Upload to Google Drive:**
   - Go to [drive.google.com](https://drive.google.com)
   - Upload the `.tar.gz` file
   - Right-click → Share → "Anyone with the link"
   - Copy the link (looks like: `https://drive.google.com/file/d/FILE_ID/view?usp=sharing`)

3. **Get direct download link:**
   ```
   Change: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
   To:     https://drive.google.com/uc?export=download&id=FILE_ID
   ```

4. **Update ADAPTERS.md:**
   ```markdown
   ## Current Adapter Weights

   **Download**: https://drive.google.com/uc?export=download&id=FILE_ID

   Install with:
   ```bash
   ./scripts/install_adapters.sh https://drive.google.com/uc?export=download&id=FILE_ID
   ```
   ```

5. **Share with your team:**
   - Send them the repo link
   - Send them the Google Drive link
   - They follow "For Users" steps below

---

## For USERS (Your Buddy/Team)

### Setup Steps:

1. **Clone the repo:**
   ```bash
   git clone https://github.com/turtletuber/tomodachi.git
   cd tomodachi
   ```

2. **Install adapters** (if you have the link):
   ```bash
   ./scripts/install_adapters.sh DOWNLOAD_LINK
   ```

3. **Start Tomodachi:**
   ```bash
   ./start.sh
   ```

That's it! 🎉

### If you DON'T have adapter weights:

No problem! Just run:
```bash
./start.sh
```

The system will use the base TinyLlama model. You'll see:
```
⚠️  Adapters disabled (using base model only)
```

Everything still works, just without the custom personality system.

---

## Alternative: Dropbox

### For Maintainer:

1. Upload to Dropbox
2. Get share link: `https://www.dropbox.com/s/xxxxx/file.tar.gz?dl=0`
3. Change `dl=0` to `dl=1`: `https://www.dropbox.com/s/xxxxx/file.tar.gz?dl=1`
4. Use this link with install script

---

## File Sizes

- Adapter package: ~20-100MB (compresses well)
- TinyLlama base model: ~2.2GB (auto-downloaded, cached)
- Total first-time download: ~2.3GB

---

## Troubleshooting

### "Download failed"
- Check the link in a browser first
- Make sure you're using the **direct download** link (not the share page)
- Google Drive: Must have `uc?export=download&id=` format
- Dropbox: Must end with `dl=1`

### "Adapters not detected"
```bash
# Verify extraction
ls ai/orchestrator_adapter/
ls ai/persona_adapter/

# Should see adapter_config.json in both
```

### "Where do I get the download link?"
Ask the project maintainer! They'll share it after uploading to Google Drive/Dropbox.

---

## Future: Offline Hardware Package

For physical hardware distribution (USB/SD card):

- Complete package with base model + adapters
- No internet needed for setup
- Flash and go on Raspberry Pi
- Coming soon! 🚀

---

**Questions?** Check:
- [ADAPTERS.md](ADAPTERS.md) - Detailed adapter guide
- [SETUP.md](SETUP.md) - General setup
- [PORTABILITY_FIXES.md](PORTABILITY_FIXES.md) - Troubleshooting
