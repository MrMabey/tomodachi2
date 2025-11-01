#!/bin/bash
# Install adapter weights from Google Drive/Dropbox
# Usage: ./scripts/install_adapters.sh [DOWNLOAD_URL]

set -e

echo "📥 Tomodachi Adapter Weights Installer"
echo "======================================"
echo

# Download URL (can be passed as argument or set here)
DOWNLOAD_URL="${1:-}"

if [ -z "$DOWNLOAD_URL" ]; then
    echo "❌ No download URL provided!"
    echo
    echo "Usage:"
    echo "   ./scripts/install_adapters.sh YOUR_DOWNLOAD_URL"
    echo
    echo "Or set the URL in ADAPTERS.md and run:"
    echo "   ./scripts/install_adapters.sh"
    echo
    exit 1
fi

# Check if adapters already exist
if [ -d "ai/orchestrator_adapter" ] || [ -d "ai/persona_adapter" ]; then
    echo "⚠️  Adapter directories already exist!"
    echo
    read -p "   Overwrite existing adapters? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 0
    fi
fi

# Create ai directory if it doesn't exist
mkdir -p ai

# Download the archive
echo "Downloading adapters..."
TEMP_FILE=$(mktemp).tar.gz

if command -v curl &> /dev/null; then
    curl -L "$DOWNLOAD_URL" -o "$TEMP_FILE"
elif command -v wget &> /dev/null; then
    wget "$DOWNLOAD_URL" -O "$TEMP_FILE"
else
    echo "❌ Neither curl nor wget found. Please install one of them."
    exit 1
fi

# Verify download
if [ ! -f "$TEMP_FILE" ] || [ ! -s "$TEMP_FILE" ]; then
    echo "❌ Download failed or file is empty"
    rm -f "$TEMP_FILE"
    exit 1
fi

# Extract the archive
echo "Extracting adapters..."
tar -xzf "$TEMP_FILE" -C .

# Clean up
rm "$TEMP_FILE"

echo
echo "✅ Adapters installed successfully!"
echo
echo "📊 Installed:"
[ -d "ai/orchestrator_adapter" ] && echo "   ✓ ai/orchestrator_adapter/"
[ -d "ai/persona_adapter" ] && echo "   ✓ ai/persona_adapter/"
echo
echo "🚀 Next: Start Tomodachi with ./start.sh"
echo "   The system will automatically detect and use the adapters."
echo
