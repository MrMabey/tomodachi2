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
echo "  - API Server: http://localhost:8080"
echo "  - GUI (Campground): http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop"
echo "=========================================="
echo ""

# Start both servers in background
python3 server/tomo_api.py &
API_PID=$!

cd campground && npm run dev &
GUI_PID=$!

# Wait for Ctrl+C
trap "kill $API_PID $GUI_PID; exit" INT

wait
