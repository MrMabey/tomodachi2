#!/bin/bash
# Initialize Claude instructions for a new project
# Usage: ./scripts/init-claude-project.sh [project-name]

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get project name from argument or prompt
if [ -z "$1" ]; then
    echo -e "${BLUE}Enter project name:${NC}"
    read -r PROJECT_NAME
else
    PROJECT_NAME="$1"
fi

# Determine base instructions location
BASE_FILE="$HOME/dotfiles/claude-instructions-base.md"
FALLBACK_BASE="$(dirname "$0")/../.claude/instructions-base.md"

if [ ! -f "$BASE_FILE" ]; then
    if [ -f "$FALLBACK_BASE" ]; then
        echo -e "${YELLOW}Base file not found in ~/dotfiles, using local copy${NC}"
        BASE_FILE="$FALLBACK_BASE"
    else
        echo -e "${YELLOW}Base instructions not found!${NC}"
        echo -e "${YELLOW}Creating from template...${NC}"

        # Create base in dotfiles
        mkdir -p "$HOME/dotfiles"
        BASE_FILE="$HOME/dotfiles/claude-instructions-base.md"

        # Copy from fallback if it exists, otherwise create minimal template
        if [ -f "$FALLBACK_BASE" ]; then
            cp "$FALLBACK_BASE" "$BASE_FILE"
        else
            cat > "$BASE_FILE" << 'TEMPLATE'
# Claude Core Operating Instructions

## Core Principles
- Think creatively, act disciplined
- Question assumptions, propose alternatives
- Document learnings in code
- Clean, modular, configurable

## Git Attribution
- ✅ ALWAYS add: "Coded by Claude, designed by Mike"
- ❌ NEVER add: Anthropic/company attribution

## Communication
- Be conversational and collaborative
- Challenge ideas constructively
- Explain reasoning clearly
TEMPLATE
        fi
        echo -e "${GREEN}✓ Created base instructions in ~/dotfiles/${NC}"
    fi
fi

# Create .claude directory if it doesn't exist
mkdir -p .claude

# Generate project instructions
cat > .claude/instructions.md << EOF
# Project Instructions for Claude

<!-- Base instructions: ~/dotfiles/claude-instructions-base.md -->

$(cat "$BASE_FILE")

---

## Project: ${PROJECT_NAME}

### Overview
[Brief description of what this project does]

### Tech Stack
- **Frontend**:
- **Backend**:
- **Storage**:

### Development Philosophy
-
-

### Code Organization
- \`/\` -

### Current Focus
[What you're currently working on]

EOF

echo -e "${GREEN}✓ Created .claude/instructions.md${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Edit .claude/instructions.md to add project-specific details"
echo "  2. git add .claude/instructions.md"
echo "  3. Start coding!"
