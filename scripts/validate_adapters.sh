#!/bin/bash
# This script runs the automated validation tests for the locally trained adapters.

set -e # Exit immediately if a command exits with a non-zero status.

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}🔬 Validating Trained Adapters...         ${NC}"
echo -e "${BLUE}==========================================${NC}"

# Activate virtual environment
if [ -d "venv" ]; then
    echo "Activating Python virtual environment..."
    source venv/bin/activate
else
    echo -e "${YELLOW}Warning: Main virtual environment not found. Running with system Python.${NC}"
fi

# Run the validation script
if python3 ai/scripts/validate_training.py; then
    echo -e "\n${GREEN}==========================================${NC}"
    echo -e "${GREEN}✅ Validation Successful!                 ${NC}"
    echo -e "${GREEN}Your new adapters are working correctly. ${NC}"
    echo -e "${GREEN}==========================================${NC}"
else
    echo -e "\n${RED}==========================================${NC}"
    echo -e "${RED}❌ Validation Failed.                     ${NC}"
    echo -e "${RED}There was an issue with your adapters.   ${NC}"
    echo -e "${RED}Please check the error messages above.   ${NC}"
    echo -e "${RED}==========================================${NC}"
    exit 1
fi
