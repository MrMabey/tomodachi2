#!/bin/bash
# Package adapter weights for distribution
# Usage: ./scripts/package_adapters.sh

set -e

echo "📦 Packaging Tomodachi Adapter Weights"
echo "======================================"
echo

# Check if adapter directories exist
if [ ! -d "ai/orchestrator_adapter" ] && [ ! -d "ai/persona_adapter" ]; then
    echo "❌ No adapter directories found!"
    echo "   Looking for:"
    echo "   - ai/orchestrator_adapter/"
    echo "   - ai/persona_adapter/"
    echo
    echo "   Train your adapters first, or skip this step if using base model only."
    exit 1
fi

# Create output directory
mkdir -p dist

# Get timestamp for versioning
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_FILE="dist/tomodachi-adapters-${TIMESTAMP}.tar.gz"

echo "Creating archive..."
echo

# Package the adapters
tar -czf "$OUTPUT_FILE" \
    $([ -d "ai/orchestrator_adapter" ] && echo "ai/orchestrator_adapter") \
    $([ -d "ai/persona_adapter" ] && echo "ai/persona_adapter") \
    2>/dev/null || true

# Get file size
SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)

echo "✅ Package created successfully!"
echo
echo "📊 Details:"
echo "   File: $OUTPUT_FILE"
echo "   Size: $SIZE"
echo
echo "📤 Next steps:"
echo "   1. Upload this file to Google Drive or Dropbox"
echo "   2. Get a shareable link"
echo "   3. Update ADAPTERS.md with the download link"
echo "   4. Share the link in your README or setup docs"
echo
echo "💡 Installation command for users:"
echo "   curl -L YOUR_DOWNLOAD_LINK -o adapters.tar.gz"
echo "   tar -xzf adapters.tar.gz"
echo "   rm adapters.tar.gz"
echo
