"""
Centralized configuration for Tomodachi project.
Handles environment variables, port allocation, and feature detection.
"""
import os
import socket
from pathlib import Path
from typing import Optional

# Project root
PROJECT_ROOT = Path(__file__).parent


def load_env():
    """Load .env file if it exists (simple implementation, no python-dotenv dependency)"""
    env_file = PROJECT_ROOT / ".env"
    if env_file.exists():
        with open(env_file) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#"):
                    if "=" in line:
                        key, value = line.split("=", 1)
                        # Strip inline comments (everything after #)
                        if "#" in value:
                            value = value.split("#")[0]
                        os.environ.setdefault(key.strip(), value.strip())


load_env()


def get_bool(key: str, default: bool = False) -> bool:
    """Get boolean from environment variable"""
    value = os.environ.get(key, str(default)).lower()
    return value in ("true", "1", "yes", "on")


def get_int(key: str, default: int) -> int:
    """Get integer from environment variable with fallback"""
    try:
        return int(os.environ.get(key, default))
    except ValueError:
        return default


def is_port_available(port: int, host: str = "127.0.0.1") -> bool:
    """Check if a port is available"""
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.bind((host, port))
            return True
    except OSError:
        return False


def find_available_port(start_port: int, max_attempts: int = 100) -> int:
    """Find an available port starting from start_port"""
    for port in range(start_port, start_port + max_attempts):
        if is_port_available(port):
            return port
    raise RuntimeError(f"Could not find available port in range {start_port}-{start_port + max_attempts}")


# === Port Configuration ===
DEFAULT_MEMORY_PORT = 5003
DEFAULT_API_PORT = 8080
DEFAULT_GUI_PORT = 5173

# Try to use configured ports, fall back to finding available ones
MEMORY_PORT = get_int("TOMO_MEMORY_PORT", DEFAULT_MEMORY_PORT)
if not is_port_available(MEMORY_PORT):
    print(f"⚠️  Port {MEMORY_PORT} is in use, finding alternative...")
    MEMORY_PORT = find_available_port(DEFAULT_MEMORY_PORT + 1)
    print(f"✓ Using port {MEMORY_PORT} for memory service")

API_PORT = get_int("TOMO_API_PORT", DEFAULT_API_PORT)
if not is_port_available(API_PORT):
    print(f"⚠️  Port {API_PORT} is in use, finding alternative...")
    API_PORT = find_available_port(DEFAULT_API_PORT + 1)
    print(f"✓ Using port {API_PORT} for API server")

GUI_PORT = get_int("TOMO_GUI_PORT", DEFAULT_GUI_PORT)
if not is_port_available(GUI_PORT):
    print(f"⚠️  Port {GUI_PORT} is in use, finding alternative...")
    GUI_PORT = find_available_port(DEFAULT_GUI_PORT + 1)
    print(f"✓ Using port {GUI_PORT} for GUI")

# === Model Configuration ===
BASE_MODEL_NAME = os.environ.get("TOMO_BASE_MODEL", "TinyLlama/TinyLlama-1.1B-Chat-v1.0")
ORCHESTRATOR_ADAPTER_DIR = PROJECT_ROOT / os.environ.get("TOMO_ORCHESTRATOR_ADAPTER", "./ai/orchestrator_adapter")
PERSONA_ADAPTER_DIR = PROJECT_ROOT / os.environ.get("TOMO_PERSONA_ADAPTER", "./ai/persona_adapter")

# === Memory Configuration ===
MEMORY_DB_PATH = PROJECT_ROOT / os.environ.get("TOMO_MEMORY_DB", "./memories/data/edge_rag.db")
MEMORY_INDEX_PATH = PROJECT_ROOT / os.environ.get("TOMO_MEMORY_INDEX", "./memories/data/edge_rag.ann")

# === Feature Detection ===
def check_adapters_available() -> bool:
    """Check if LoRA adapters exist"""
    return (
        ORCHESTRATOR_ADAPTER_DIR.exists() and
        (ORCHESTRATOR_ADAPTER_DIR / "adapter_config.json").exists() and
        PERSONA_ADAPTER_DIR.exists() and
        (PERSONA_ADAPTER_DIR / "adapter_config.json").exists()
    )


USE_ADAPTERS_CONFIG = os.environ.get("TOMO_USE_ADAPTERS", "auto").lower()
if USE_ADAPTERS_CONFIG == "auto":
    USE_ADAPTERS = check_adapters_available()
elif USE_ADAPTERS_CONFIG in ("true", "1", "yes"):
    USE_ADAPTERS = True
else:
    USE_ADAPTERS = False

USE_MEMORY = get_bool("TOMO_USE_MEMORY", True)
DEBUG = get_bool("TOMO_DEBUG", False)

# === URL Generation ===
MEMORY_SERVICE_URL = f"http://localhost:{MEMORY_PORT}"
API_SERVICE_URL = f"http://localhost:{API_PORT}"
GUI_SERVICE_URL = f"http://localhost:{GUI_PORT}"


def print_config():
    """Print current configuration (useful for debugging)"""
    print("=" * 60)
    print("🏕️  Tomodachi Configuration")
    print("=" * 60)
    print(f"Memory Service: {MEMORY_SERVICE_URL}")
    print(f"API Server:     {API_SERVICE_URL}")
    print(f"GUI:            {GUI_SERVICE_URL}")
    print("")
    print(f"Base Model:     {BASE_MODEL_NAME}")
    print(f"Use Adapters:   {USE_ADAPTERS}")
    if USE_ADAPTERS:
        print(f"  Orchestrator: {ORCHESTRATOR_ADAPTER_DIR}")
        print(f"  Persona:      {PERSONA_ADAPTER_DIR}")
    else:
        print("  (Running with base model only)")
    print(f"Use Memory:     {USE_MEMORY}")
    print(f"Debug Mode:     {DEBUG}")
    print("=" * 60)


if __name__ == "__main__":
    print_config()
