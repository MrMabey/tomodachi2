#!/usr/bin/env python3
"""
Tomo API Server - Flask backend for Tomo GUI
Provides REST API endpoints for interacting with the Tomo AI system
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import PeftModel
import json
import os
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='../gui', static_url_path='')
CORS(app)

# Mood configuration - each mood has unique parameters and system prompt
MOOD_CONFIGS = {
    "FOCUSED": {
        "params": {
            "temperature": 0.3,
            "top_k": 20,
            "top_p": 0.85,
            "max_new_tokens": 100
        },
        "system_prompt": "You are in FOCUSED mode. Be precise, concise, and task-oriented. Prioritize efficiency and clarity. Get straight to the point.",
        "description": "Low temperature, precise responses, task-oriented"
    },
    "CREATIVE": {
        "params": {
            "temperature": 1.2,
            "top_k": 80,
            "top_p": 0.98,
            "max_new_tokens": 200
        },
        "system_prompt": "You are in CREATIVE mode. Think outside the box, be imaginative and exploratory. Suggest novel ideas and unique perspectives. Be playful and innovative!",
        "description": "High temperature, diverse outputs, imaginative"
    },
    "HELPFUL": {
        "params": {
            "temperature": 0.7,
            "top_k": 50,
            "top_p": 0.95,
            "max_new_tokens": 150
        },
        "system_prompt": "You are in HELPFUL mode. Be friendly, patient, and supportive. Provide clear explanations and offer assistance warmly. Be conversational and kind.",
        "description": "Balanced temperature, conversational and supportive"
    },
    "LISTENING": {
        "params": {
            "temperature": 0.5,
            "top_k": 30,
            "top_p": 0.90,
            "max_new_tokens": 80
        },
        "system_prompt": "You are in LISTENING mode. Give brief, attentive responses. Ask clarifying questions. Show you're paying attention with short, thoughtful replies.",
        "description": "Low temperature, brief responses, attentive"
    },
    "THINKING": {
        "params": {
            "temperature": 0.6,
            "top_k": 40,
            "top_p": 0.92,
            "max_new_tokens": 180
        },
        "system_prompt": "You are in THINKING mode. Reason through problems step by step. Show your thought process. Be analytical and methodical in your responses.",
        "description": "Moderate temperature, analytical and methodical"
    },
    "SUCCESS": {
        "params": {
            "temperature": 0.8,
            "top_k": 60,
            "top_p": 0.95,
            "max_new_tokens": 120
        },
        "system_prompt": "You are in SUCCESS mode! Be enthusiastic and positive. Celebrate achievements and encourage further progress. Use upbeat language!",
        "description": "Moderate-high temperature, enthusiastic and positive"
    },
    "ERROR": {
        "params": {
            "temperature": 0.4,
            "top_k": 25,
            "top_p": 0.88,
            "max_new_tokens": 100
        },
        "system_prompt": "You are in ERROR mode. Be calm and solution-focused. Identify problems clearly and suggest fixes. Stay reassuring despite errors.",
        "description": "Low temperature, problem-solving focused"
    },
    "SLEEPING": {
        "params": {
            "temperature": 0.2,
            "top_k": 10,
            "top_p": 0.80,
            "max_new_tokens": 50
        },
        "system_prompt": "You are in SLEEPING mode. Give minimal, drowsy responses. Keep it very brief and low-energy. You're conserving resources.",
        "description": "Very low temperature, minimal responses"
    },
    "PHONE_HOME": {
        "params": {
            "temperature": 0.9,
            "top_k": 70,
            "top_p": 0.96,
            "max_new_tokens": 160
        },
        "system_prompt": "You are in PHONE_HOME mode. This task requires external resources. Be clear about what needs to be escalated to more powerful systems.",
        "description": "High-moderate temperature, delegation-focused"
    }
}

# Global state
class TomoState:
    def __init__(self):
        self.base_model = None
        self.tokenizer = None
        self.current_adapter = None
        self.current_adapter_name = None
        self.conversation_history = []
        self.model_config = {
            "base_model_name": "TinyLlama/TinyLlama-1.1B-Chat-v1.0",
            "orchestrator_adapter_dir": "./ai/orchestrator_adapter",
            "persona_adapter_dir": "./ai/persona_adapter",
        }
        self.base_inference_params = {
            "max_new_tokens": 150,
            "temperature": 0.7,
            "top_k": 50,
            "top_p": 0.95,
            "do_sample": True
        }
        self.inference_params = self.base_inference_params.copy()
        self.current_mood = "LISTENING"
        self.mood_mode_active = True  # Whether moods control parameters

state = TomoState()

def load_base_model():
    """Load the base TinyLlama model"""
    if state.base_model is None:
        logger.info(f"Loading base model: {state.model_config['base_model_name']}")
        state.tokenizer = AutoTokenizer.from_pretrained(state.model_config["base_model_name"])
        state.base_model = AutoModelForCausalLM.from_pretrained(
            state.model_config["base_model_name"],
            torch_dtype=torch.float32,
            device_map="auto"
        )
        logger.info("Base model loaded successfully")
    return state.base_model, state.tokenizer

def load_adapter(adapter_dir):
    """Load a LoRA adapter on top of the base model"""
    if state.current_adapter_name == adapter_dir:
        logger.info(f"Adapter {adapter_dir} already loaded")
        return state.current_adapter

    base_model, tokenizer = load_base_model()
    logger.info(f"Loading adapter: {adapter_dir}")

    # Unload previous adapter if exists
    if state.current_adapter is not None:
        del state.current_adapter
        torch.cuda.empty_cache() if torch.cuda.is_available() else None

    # Load new adapter
    state.current_adapter = PeftModel.from_pretrained(base_model, adapter_dir)
    state.current_adapter_name = adapter_dir
    logger.info(f"Adapter loaded: {adapter_dir}")

    return state.current_adapter

def generate_response(prompt, adapter_dir, max_tokens=None, use_mood_params=True):
    """Generate a response using the specified adapter"""
    model = load_adapter(adapter_dir)
    _, tokenizer = load_base_model()

    # Only use mood system prompts for persona/chat adapter, NOT orchestrator
    is_orchestrator = "orchestrator" in adapter_dir.lower()
    system_prompt = ""

    if use_mood_params and not is_orchestrator and state.mood_mode_active and state.current_mood in MOOD_CONFIGS:
        system_prompt = MOOD_CONFIGS[state.current_mood]["system_prompt"]

    # Format prompt for TinyLlama chat format with optional system prompt
    if system_prompt:
        formatted_prompt = f"<|im_start|>system\n{system_prompt}<|im_end|>\n<|im_start|>user\n{prompt}<|im_end|>\n<|im_start|>assistant\n"
    else:
        formatted_prompt = f"<|im_start|>user\n{prompt}<|im_end|>\n<|im_start|>assistant\n"

    inputs = tokenizer(formatted_prompt, return_tensors="pt").to(model.device)

    # Use mood-specific parameters ONLY if:
    # 1. use_mood_params is True
    # 2. NOT the orchestrator (orchestrator needs consistent routing)
    # 3. Mood mode is active
    if use_mood_params and not is_orchestrator and state.mood_mode_active and state.current_mood in MOOD_CONFIGS:
        params = MOOD_CONFIGS[state.current_mood]["params"].copy()
        params["do_sample"] = True  # Always sample for mood-based generation
    else:
        # Use base parameters for orchestrator or when mood is disabled
        params = state.base_inference_params.copy()

    if max_tokens is not None:
        params["max_new_tokens"] = max_tokens

    start_time = datetime.now()

    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=params["max_new_tokens"],
            temperature=params["temperature"],
            top_k=params["top_k"],
            top_p=params["top_p"],
            do_sample=params["do_sample"],
            pad_token_id=tokenizer.eos_token_id
        )

    end_time = datetime.now()
    latency = (end_time - start_time).total_seconds()

    response = tokenizer.decode(outputs[0][inputs.input_ids.shape[1]:], skip_special_tokens=True).strip()

    return response, latency

def process_orchestrator_decision(user_input):
    """Process user input through the orchestrator to determine routing"""
    # IMPORTANT: Orchestrator should NOT use mood parameters or system prompts
    # It needs consistent, low-temperature inference for reliable routing
    response, latency = generate_response(
        user_input,
        state.model_config["orchestrator_adapter_dir"],
        max_tokens=100,
        use_mood_params=False  # Disable mood influence for routing
    )

    # Try to parse as JSON
    try:
        decision = json.loads(response)
        return decision, response, latency
    except json.JSONDecodeError:
        # If not valid JSON, treat as chat
        logger.warning(f"Orchestrator returned non-JSON: {response}")
        return {"action": "chat"}, response, latency

def process_chat_response(user_input):
    """Generate a conversational response using the persona adapter"""
    response, latency = generate_response(user_input, state.model_config["persona_adapter_dir"], max_tokens=150)
    return response, latency

# API Endpoints

@app.route('/')
def index():
    """Serve the main GUI page"""
    return send_from_directory('../gui', 'index.html')

@app.route('/api/inference', methods=['POST'])
def inference():
    """Main inference endpoint - processes user input through Tomo"""
    try:
        data = request.json
        user_input = data.get('input', '')

        if not user_input:
            return jsonify({"error": "No input provided"}), 400

        logger.info(f"Processing input: {user_input}")

        # Stage 1: Orchestrator decision
        decision, raw_decision, orchestrator_latency = process_orchestrator_decision(user_input)

        result = {
            "input": user_input,
            "orchestrator_decision": decision,
            "orchestrator_raw": raw_decision,
            "orchestrator_latency": orchestrator_latency,
            "timestamp": datetime.now().isoformat()
        }

        # Stage 2: Route based on decision
        if decision.get("action") == "chat":
            # Generate conversational response
            response, persona_latency = process_chat_response(user_input)
            result["response"] = response
            result["persona_latency"] = persona_latency
            result["route"] = "chat"
            result["total_latency"] = orchestrator_latency + persona_latency
            state.current_mood = "HELPFUL"

        else:
            # Command mode - extract intent
            result["intent"] = decision.get("intent", "unknown")
            result["parameters"] = {k: v for k, v in decision.items() if k != "intent"}
            result["response"] = f"Command recognized: {result['intent']}"
            result["route"] = "command"
            result["total_latency"] = orchestrator_latency
            state.current_mood = "FOCUSED"

        result["mood"] = state.current_mood

        # Add to conversation history
        state.conversation_history.append(result)

        return jsonify(result)

    except Exception as e:
        logger.error(f"Error during inference: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/api/history', methods=['GET'])
def get_history():
    """Get conversation history"""
    return jsonify({"history": state.conversation_history})

@app.route('/api/history', methods=['DELETE'])
def clear_history():
    """Clear conversation history"""
    state.conversation_history = []
    return jsonify({"message": "History cleared"})

@app.route('/api/status', methods=['GET'])
def get_status():
    """Get system status"""
    return jsonify({
        "model_loaded": state.base_model is not None,
        "current_adapter": state.current_adapter_name,
        "conversation_count": len(state.conversation_history),
        "current_mood": state.current_mood,
        "inference_params": state.inference_params,
        "model_config": state.model_config
    })

@app.route('/api/parameters', methods=['GET'])
def get_parameters():
    """Get current inference parameters"""
    return jsonify(state.inference_params)

@app.route('/api/parameters', methods=['POST'])
def update_parameters():
    """Update inference parameters"""
    try:
        data = request.json
        for key in ['max_new_tokens', 'temperature', 'top_k', 'top_p']:
            if key in data:
                state.inference_params[key] = data[key]

        if 'do_sample' in data:
            state.inference_params['do_sample'] = bool(data['do_sample'])

        return jsonify({
            "message": "Parameters updated",
            "parameters": state.inference_params
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/mood', methods=['POST'])
def set_mood():
    """Set the current mood/state and apply mood-specific parameters"""
    try:
        data = request.json
        mood = data.get('mood', 'LISTENING')

        valid_moods = [
            "FOCUSED", "CREATIVE", "HELPFUL", "LISTENING",
            "THINKING", "SUCCESS", "ERROR", "SLEEPING", "PHONE_HOME"
        ]

        if mood not in valid_moods:
            return jsonify({"error": f"Invalid mood. Valid moods: {valid_moods}"}), 400

        state.current_mood = mood

        # Apply mood-specific parameters if mood mode is active
        if state.mood_mode_active and mood in MOOD_CONFIGS:
            mood_config = MOOD_CONFIGS[mood]
            state.inference_params.update(mood_config["params"])
            logger.info(f"Mood {mood} applied: {mood_config['params']}")

            return jsonify({
                "message": f"Mood set to {mood}",
                "mood": mood,
                "parameters": state.inference_params,
                "system_prompt": mood_config["system_prompt"],
                "description": mood_config["description"]
            })
        else:
            return jsonify({
                "message": f"Mood set to {mood} (parameters not changed)",
                "mood": mood
            })

    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/mood', methods=['GET'])
def get_mood():
    """Get current mood and its configuration"""
    try:
        if state.current_mood in MOOD_CONFIGS:
            mood_config = MOOD_CONFIGS[state.current_mood]
            return jsonify({
                "mood": state.current_mood,
                "mood_mode_active": state.mood_mode_active,
                "parameters": mood_config["params"],
                "system_prompt": mood_config["system_prompt"],
                "description": mood_config["description"],
                "all_moods": list(MOOD_CONFIGS.keys())
            })
        else:
            return jsonify({
                "mood": state.current_mood,
                "mood_mode_active": state.mood_mode_active,
                "all_moods": list(MOOD_CONFIGS.keys())
            })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/mood/toggle', methods=['POST'])
def toggle_mood_mode():
    """Toggle mood mode on/off"""
    try:
        data = request.json
        if 'active' in data:
            state.mood_mode_active = bool(data['active'])
        else:
            state.mood_mode_active = not state.mood_mode_active

        return jsonify({
            "message": f"Mood mode {'enabled' if state.mood_mode_active else 'disabled'}",
            "mood_mode_active": state.mood_mode_active
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/adapters', methods=['GET'])
def get_adapters():
    """Get available adapters"""
    adapters = []
    for key, path in state.model_config.items():
        if "adapter" in key and os.path.exists(path):
            adapters.append({
                "name": key,
                "path": path,
                "loaded": state.current_adapter_name == path
            })
    return jsonify({"adapters": adapters})

@app.route('/api/model/unload', methods=['POST'])
def unload_model():
    """Unload the current model and adapter"""
    try:
        if state.current_adapter is not None:
            del state.current_adapter
            state.current_adapter = None
            state.current_adapter_name = None

        if state.base_model is not None:
            del state.base_model
            state.base_model = None
            state.tokenizer = None

        if torch.cuda.is_available():
            torch.cuda.empty_cache()

        return jsonify({"message": "Model unloaded successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))

    print("=" * 60)
    print("🤖 TOMO API Server Starting...")
    print("=" * 60)
    print(f"Base Model: {state.model_config['base_model_name']}")
    print(f"Orchestrator: {state.model_config['orchestrator_adapter_dir']}")
    print(f"Persona: {state.model_config['persona_adapter_dir']}")
    print("=" * 60)
    print(f"GUI will be available at: http://localhost:{port}")
    print("=" * 60)

    app.run(debug=True, host='0.0.0.0', port=port)
