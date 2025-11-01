#!/bin/bash

echo "=========================================="
echo "🏕️ Starting Base Camp (Tomo GUI)"
echo "=========================================="
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Virtual environment not found. Creating one..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies if needed
echo "Checking Python dependencies..."
pip install -q -r server/requirements.txt

# Check if node_modules exists in campground
if [ ! -d "campground/node_modules" ]; then
    echo "Installing Node.js dependencies..."
    cd campground && npm install && cd ..
fi

echo ""
echo "Starting services..."
echo "  - Memory Service: http://localhost:5003"
echo "  - API Server: http://localhost:8080"
echo "  - GUI (Campground): http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop"
echo "=========================================="
echo ""

# Start memory service (with C++ headers fix for annoy)
cd memories
export CPLUS_INCLUDE_PATH=/Library/Developer/CommandLineTools/SDKs/MacOSX15.sdk/usr/include/c++/v1
source .venv/bin/activate
FLASK_APP=edge_rag.web:create_app FLASK_RUN_PORT=5003 python3 -m flask run --reload > ../memory.log 2>&1 &
MEMORY_PID=$!
deactivate
cd ..

# Start API server
python3 server/tomo_api.py &
API_PID=$!

# Start GUI
cd campground && npm run dev &
GUI_PID=$!

# Wait for Ctrl+C
trap "kill $MEMORY_PID $API_PID $GUI_PID 2>/dev/null; exit" INT

wait
