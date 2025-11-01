#!/bin/bash
# Tomodachi Unified Startup Script
# Handles dynamic port allocation, graceful degradation, and cross-platform compatibility

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "=========================================="
echo "🏕️  Starting Tomodachi (友達)"
echo "=========================================="
echo ""

# Load or create .env
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}No .env file found, creating from .env.example...${NC}"
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}✓ Created .env file${NC}"
    else
        echo -e "${YELLOW}⚠️  .env.example not found, using defaults${NC}"
    fi
fi

# Check Python configuration with fallback
echo -e "${BLUE}Checking configuration...${NC}"
if python3 config.py > /dev/null 2>&1; then
    python3 config.py
else
    echo -e "${YELLOW}⚠️  config.py check failed, continuing with defaults${NC}"
fi
echo ""

# === Setup Virtual Environments ===

# Main venv
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating main virtual environment...${NC}"
    python3 -m venv venv
    echo -e "${GREEN}✓ Main venv created${NC}"
fi

echo -e "${BLUE}Activating main venv...${NC}"
source venv/bin/activate

echo -e "${BLUE}Installing/updating main dependencies...${NC}"
pip install -q --upgrade pip
pip install -q -r server/requirements.txt
echo -e "${GREEN}✓ Main dependencies ready${NC}"
echo ""

# Memory service venv (separate for annoy compatibility)
if [ ! -d "memories/.venv" ]; then
    echo -e "${YELLOW}Creating memory service virtual environment...${NC}"
    cd memories
    python3 -m venv .venv
    cd ..
    echo -e "${GREEN}✓ Memory venv created${NC}"
fi

echo -e "${BLUE}Installing/updating memory dependencies...${NC}"
# Handle macOS-specific C++ headers for 'annoy' build if on Darwin
if [[ "$OSTYPE" == "darwin"* ]]; then
    export CPLUS_INCLUDE_PATH=${CPLUS_INCLUDE_PATH:-/Library/Developer/CommandLineTools/SDKs/MacOSX.sdk/usr/include/c++/v1}
    echo -e "${YELLOW}macOS detected. Setting CPLUS_INCLUDE_PATH for compiler.${NC}"
fi
cd memories
source .venv/bin/activate
pip install -q --upgrade pip
pip install -q -r requirements.txt
deactivate
cd ..
echo -e "${GREEN}✓ Memory dependencies ready${NC}"
echo ""

# === Install Node Dependencies ===
if [ ! -d "campground/node_modules" ]; then
    echo -e "${YELLOW}Installing Node.js dependencies...${NC}"
    cd campground && npm install && cd ..
    echo -e "${GREEN}✓ Node dependencies ready${NC}"
else
    echo -e "${GREEN}✓ Node dependencies already installed${NC}"
fi
echo ""

# === Read Configuration ===
# Export ports from config.py
eval $(python3 -c "import config; print(f'MEMORY_PORT={config.MEMORY_PORT}'); print(f'API_PORT={config.API_PORT}'); print(f'GUI_PORT={config.GUI_PORT}')")

echo "=========================================="
echo "🚀 Starting Services"
echo "=========================================="
echo -e "${GREEN}Memory Service:${NC} http://localhost:${MEMORY_PORT}"
echo -e "${GREEN}API Server:${NC}     http://localhost:${API_PORT}"
echo -e "${GREEN}Campground GUI:${NC} http://localhost:${GUI_PORT}"
echo ""
echo "Press ${YELLOW}Ctrl+C${NC} to stop all services"
echo "=========================================="
echo ""

# Create log directory
mkdir -p logs

# === Start Memory Service ===
echo -e "${BLUE}[1/3] Starting memory service...${NC}"
cd memories
# Handle macOS-specific C++ headers if on Darwin
if [[ "$OSTYPE" == "darwin"* ]]; then
    export CPLUS_INCLUDE_PATH=${CPLUS_INCLUDE_PATH:-/Library/Developer/CommandLineTools/SDKs/MacOSX.sdk/usr/include/c++/v1}
fi
source .venv/bin/activate
FLASK_APP=edge_rag.web:create_app FLASK_RUN_PORT=${MEMORY_PORT} python3 -m flask run --reload > ../logs/memory.log 2>&1 &
MEMORY_PID=$!
deactivate
cd ..
echo -e "${GREEN}✓ Memory service started (PID: ${MEMORY_PID})${NC}"

# Give memory service time to start
sleep 2

# === Start API Server ===
echo -e "${BLUE}[2/3] Starting API server...${NC}"
source venv/bin/activate
python3 server/tomo_api.py > logs/api.log 2>&1 &
API_PID=$!
echo -e "${GREEN}✓ API server started (PID: ${API_PID})${NC}"

# Give API time to start
sleep 2

# === Start GUI ===
echo -e "${BLUE}[3/3] Starting Campground GUI...${NC}"
cd campground
PORT=${GUI_PORT} npm run dev > ../logs/gui.log 2>&1 &
GUI_PID=$!
cd ..
echo -e "${GREEN}✓ GUI started (PID: ${GUI_PID})${NC}"

echo ""
echo "=========================================="
echo -e "${GREEN}✓ All services running!${NC}"
echo "=========================================="
echo ""
echo -e "${BLUE}📍 URLs:${NC}"
echo -e "   Campground: ${GREEN}http://localhost:${GUI_PORT}${NC}"
echo -e "   API:        http://localhost:${API_PORT}"
echo -e "   Memory:     http://localhost:${MEMORY_PORT}"
echo ""
echo -e "${YELLOW}📝 Logs:${NC}"
echo "   tail -f logs/memory.log"
echo "   tail -f logs/api.log"
echo "   tail -f logs/gui.log"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# === First-Time User Guidance ===
# Check if adapters are being used and show a helpful message if not.
eval $(python3 -c "import config; print(f'USE_ADAPTERS={config.USE_ADAPTERS})")

if [ "$USE_ADAPTERS" = "False" ]; then
    echo -e "${YELLOW}===================================================================${NC}"
    echo -e "${YELLOW}NOTE: Your Tomodachi is running with the generic base model.${NC}"
    echo -e "${YELLOW}To unlock its full personality, you need to train the adapters.${NC}"
    echo ""
    echo -e "To do this, first press ${GREEN}Ctrl+C${YELLOW} to stop the current services."
    echo -e "Then, run the following command:"
    echo ""
    echo -e "  ${GREEN}./scripts/train_adapters.sh${NC}"
    echo ""
    echo -e "${YELLOW}After training is complete, run ${GREEN}./start.sh${YELLOW} again.${NC}"
    echo -e "${YELLOW}===================================================================${NC}"
    echo ""
fi

# Cleanup function
cleanup() {
    echo ""
    echo "=========================================="
    echo "🛑 Shutting down services..."
    echo "=========================================="

    if [ ! -z "$GUI_PID" ]; then
        echo "Stopping GUI (PID: $GUI_PID)..."
        kill $GUI_PID 2>/dev/null || true
    fi

    if [ ! -z "$API_PID" ]; then
        echo "Stopping API server (PID: $API_PID)..."
        kill $API_PID 2>/dev/null || true
    fi

    if [ ! -z "$MEMORY_PID" ]; then
        echo "Stopping memory service (PID: $MEMORY_PID)..."
        kill $MEMORY_PID 2>/dev/null || true
    fi

    # Wait a moment for clean shutdown
    sleep 1

    echo -e "${GREEN}✓ All services stopped${NC}"
    echo "=========================================="
    exit 0
}

# Trap Ctrl+C
trap cleanup INT TERM

# Wait for any process to exit
wait
