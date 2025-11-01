#!/bin/bash
# This script automates the fine-tuning process for both the orchestrator and persona adapters.

set -e # Exit immediately if a command exits with a non-zero status.

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}🤖 Starting Tomodachi Local Adapter Training ${NC}"
echo -e "${BLUE}==========================================${NC}"

# Activate virtual environment
if [ -d "venv" ]; then
    echo "Activating Python virtual environment..."
    source venv/bin/activate
else
    echo -e "${YELLOW}Warning: Main virtual environment not found. Running with system Python.${NC}"
fi

echo ""
echo -e "${GREEN}[1/2] Training Orchestrator Adapter...${NC}"
echo "This will take a while depending on your hardware. See documentation for estimates."

python3 ai/scripts/fine_tune.py \
    --dataset="ai/training_data/orchestrator_training.jsonl" \
    --output_dir="ai/orchestrator_adapter" \
    --config="ai/training_data/training_config.yaml"

echo ""
echo -e "${GREEN}✓ Orchestrator adapter trained successfully!${NC}"

echo ""
echo -e "${GREEN}[2/2] Training Persona Adapter...${NC}"
echo "This will also take a while."

python3 ai/scripts/fine_tune.py \
    --dataset="ai/training_data/persona_training.jsonl" \
    --output_dir="ai/persona_adapter" \
    --config="ai/training_data/training_config.yaml"

echo ""
echo -e "${GREEN}✓ Persona adapter trained successfully!${NC}"


echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}✅ All adapters trained successfully! ${NC}"
echo -e "${BLUE}==========================================${NC}"
echo ""
echo "You can now run ${YELLOW}./start.sh${NC}, and it will automatically use your new adapters."

echo ""
echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}🔬 What's Next?                         ${NC}"
echo -e "${BLUE}==========================================${NC}"
echo ""
echo -e "We recommend validating your new adapters to ensure they work correctly."
echo -e "Run the following command:"
echo ""
echo -e "  ${GREEN}./scripts/validate_adapters.sh${NC}"
echo ""
