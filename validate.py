#!/usr/bin/env python3
"""
Tomodachi Setup Validator
Checks system requirements, dependencies, and configuration
"""

import sys
import subprocess
import os
from pathlib import Path

# ANSI colors
RED = '\033[0;31m'
GREEN = '\033[0;32m'
YELLOW = '\033[1;33m'
BLUE = '\033[0;34m'
NC = '\033[0m'  # No Color

def check(description, condition, fix_hint=None):
    """Check a condition and print status"""
    if condition:
        print(f"{GREEN}✓{NC} {description}")
        return True
    else:
        print(f"{RED}✗{NC} {description}")
        if fix_hint:
            print(f"  {YELLOW}→{NC} {fix_hint}")
        return False

def command_exists(cmd):
    """Check if a command exists"""
    try:
        subprocess.run([cmd, '--version'], capture_output=True, check=False)
        return True
    except FileNotFoundError:
        return False

def get_python_version():
    """Get Python version as tuple"""
    return sys.version_info[:2]

def main():
    print("=" * 60)
    print("🏕️  Tomodachi Setup Validator")
    print("=" * 60)
    print()

    all_good = True

    # === System Requirements ===
    print(f"{BLUE}System Requirements:{NC}")
    print()

    # Python version
    py_version = get_python_version()
    all_good &= check(
        f"Python 3.8+   (found {py_version[0]}.{py_version[1]})",
        py_version >= (3, 8),
        "Install Python 3.8 or newer from python.org"
    )

    # Node.js
    has_node = command_exists('node')
    all_good &= check(
        "Node.js installed",
        has_node,
        "Install Node.js from nodejs.org"
    )

    # npm
    has_npm = command_exists('npm')
    all_good &= check(
        "npm installed",
        has_npm,
        "Install npm (comes with Node.js)"
    )

    print()

    # === Project Structure ===
    print(f"{BLUE}Project Structure:{NC}")
    print()

    project_root = Path(__file__).parent

    # Core directories
    all_good &= check("server/ directory", (project_root / "server").exists())
    all_good &= check("memories/ directory", (project_root / "memories").exists())
    all_good &= check("campground/ directory", (project_root / "campground").exists())

    # Requirements files
    all_good &= check(
        "server/requirements.txt",
        (project_root / "server" / "requirements.txt").exists()
    )
    all_good &= check(
        "memories/requirements.txt",
        (project_root / "memories" / "requirements.txt").exists()
    )
    all_good &= check(
        "campground/package.json",
        (project_root / "campground" / "package.json").exists()
    )

    print()

    # === Configuration ===
    print(f"{BLUE}Configuration:{NC}")
    print()

    has_env_example = (project_root / ".env.example").exists()
    check(".env.example", has_env_example)

    has_env = (project_root / ".env").exists()
    if not has_env and has_env_example:
        check(
            ".env file",
            False,
            "Copy .env.example to .env: cp .env.example .env"
        )
    else:
        check(".env file", has_env)

    has_config = (project_root / "config.py").exists()
    check("config.py", has_config)

    print()

    # === Optional Components ===
    print(f"{BLUE}Optional Components:{NC}")
    print()

    # Adapters
    orchestrator_exists = (project_root / "ai" / "orchestrator_adapter" / "adapter_config.json").exists()
    persona_exists = (project_root / "ai" / "persona_adapter" / "adapter_config.json").exists()

    if orchestrator_exists and persona_exists:
        check("LoRA adapters (orchestrator + persona)", True)
    else:
        print(f"{YELLOW}⚠{NC} LoRA adapters not found (will use base model only)")
        if not orchestrator_exists:
            print(f"  Missing: ai/orchestrator_adapter/")
        if not persona_exists:
            print(f"  Missing: ai/persona_adapter/")

    print()

    # === Virtual Environments ===
    print(f"{BLUE}Virtual Environments:{NC}")
    print()

    venv_exists = (project_root / "venv").exists()
    memory_venv_exists = (project_root / "memories" / ".venv").exists()

    if venv_exists:
        check("Main venv/ created", True)
    else:
        check(
            "Main venv/ created",
            False,
            "Run: python3 -m venv venv"
        )

    if memory_venv_exists:
        check("Memory .venv/ created", True)
    else:
        check(
            "Memory .venv/ created",
            False,
            "Run: cd memories && python3 -m venv .venv"
        )

    print()

    # === Port Availability ===
    print(f"{BLUE}Port Configuration:{NC}")
    print()

    try:
        import config
        print(f"  Memory Service: {config.MEMORY_PORT}")
        print(f"  API Server:     {config.API_PORT}")
        print(f"  GUI:            {config.GUI_PORT}")
        print()
    except Exception as e:
        print(f"{YELLOW}⚠{NC} Could not load config.py: {e}")
        print()

    # === Summary ===
    print("=" * 60)
    if all_good:
        print(f"{GREEN}✓ Setup looks good! Ready to start Tomodachi.{NC}")
        print()
        print(f"Run: {BLUE}./start.sh{NC}")
    else:
        print(f"{YELLOW}⚠ Some issues detected. Please fix the items marked with ✗{NC}")
        print()
        print(f"After fixing issues, run: {BLUE}./validate.py{NC}")
    print("=" * 60)

if __name__ == "__main__":
    # Make escape codes work on all platforms
    if sys.platform == "win32":
        import os
        os.system("color")

    main()
