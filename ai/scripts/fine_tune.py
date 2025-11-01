import os
import torch
import argparse
import yaml
from datasets import load_dataset
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
)
from peft import LoraConfig
from trl import SFTTrainer

def main():
    parser = argparse.ArgumentParser(description="Fine-tune a model with a specific dataset.")
    parser.add_argument("--dataset", type=str, required=True, help="Path to the training dataset file.")
    parser.add_argument("--output_dir", type=str, required=True, help="Directory to save the fine-tuned model adapter.")
    parser.add_argument("--config", type=str, default="ai/training_data/training_config.yaml", help="Path to the training configuration file.")
    args = parser.parse_args()

    # Load configuration from YAML file
    with open(args.config, 'r') as f:
        config = yaml.safe_load(f)

    # Model and tokenizer names
    model_name = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"

    # Load the dataset
    dataset = load_dataset('json', data_files=args.dataset, split='train')

    # LoRA configuration
    lora_config = LoraConfig(**config['lora_config'])

    # Load model and tokenizer
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        device_map={"": 0}
    )
    model.config.use_cache = False
    model.config.pretraining_tp = 1

    tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
    tokenizer.pad_token = tokenizer.eos_token
    tokenizer.padding_side = "right"

    # Training arguments
    training_args_dict = config['training_args']
    training_args_dict['output_dir'] = args.output_dir # Set output_dir from command line
    training_args = TrainingArguments(**training_args_dict)

    # Supervised Fine-tuning Trainer
    trainer = SFTTrainer(
        model=model,
        train_dataset=dataset,
        peft_config=lora_config,
        args=training_args,
    )

    # Train the model
    trainer.train()

    # Save the fine-tuned model
    trainer.model.save_pretrained(args.output_dir)
    print(f"Model adapter saved to {args.output_dir}")

if __name__ == "__main__":
    main()