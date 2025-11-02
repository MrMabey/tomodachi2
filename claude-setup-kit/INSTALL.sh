#!/bin/bash
# Quick install for Claude project tools
# Run from anywhere: ./INSTALL.sh

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Installing Claude project tools..."

# 1. Setup dotfiles
mkdir -p ~/dotfiles
cp "$SCRIPT_DIR/instructions-base.md" ~/dotfiles/claude-instructions-base.md
echo "✓ Base instructions → ~/dotfiles/"

# 2. Install command
mkdir -p ~/bin
cp "$SCRIPT_DIR/init-claude-project.sh" ~/bin/init-claude-project

# Fix line endings automatically (handles Windows/Mac/Linux)
if command -v dos2unix >/dev/null 2>&1; then
    dos2unix ~/bin/init-claude-project 2>/dev/null
elif command -v sed >/dev/null 2>&1; then
    sed -i '' $'s/\r$//' ~/bin/init-claude-project 2>/dev/null || sed -i 's/\r$//' ~/bin/init-claude-project 2>/dev/null
fi

chmod +x ~/bin/init-claude-project
echo "✓ Command → ~/bin/init-claude-project (line endings fixed)"

# 3. Check PATH and offer to add it
if [[ ":$PATH:" != *":$HOME/bin:"* ]]; then
    echo ""
    echo "~/bin is not in your PATH."
    echo -n "Add it automatically? (y/n): "
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        # Detect shell config
        if [ -n "$ZSH_VERSION" ] || [ -n "$ZSH_NAME" ] || [ "$SHELL" = "/bin/zsh" ]; then
            SHELL_RC="$HOME/.zshrc"
        else
            SHELL_RC="$HOME/.bashrc"
        fi

        # Check if already added
        if ! grep -q 'export PATH="$HOME/bin:$PATH"' "$SHELL_RC" 2>/dev/null; then
            echo "" >> "$SHELL_RC"
            echo "# Added by claude-setup-kit" >> "$SHELL_RC"
            echo 'export PATH="$HOME/bin:$PATH"' >> "$SHELL_RC"
            echo "✓ Added to $SHELL_RC"
        else
            echo "✓ Already in $SHELL_RC"
        fi

        # Export for current session
        export PATH="$HOME/bin:$PATH"
        echo "✓ Added to current session"
        echo ""
        echo "Restart terminal or run: source $SHELL_RC"
    else
        echo ""
        echo "Manually add to your shell config:"
        echo 'export PATH="$HOME/bin:$PATH"'
    fi
else
    echo "✓ ~/bin already in PATH"
fi

echo ""
echo "✓ Done! Use: init-claude-project \"ProjectName\""
