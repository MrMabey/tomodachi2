import os
import torch
import argparse
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
    args = parser.parse_args()

    # Model and tokenizer names
    model_name = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"

    # Load the dataset
    dataset = load_dataset('json', data_files=args.dataset, split='train')

    # LoRA configuration
    lora_config = LoraConfig(
        lora_alpha=16,
        lora_dropout=0.1,
        r=64,
        bias="none",
        task_type="CAUSAL_LM"
    )

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
    training_args = TrainingArguments(
        output_dir=args.output_dir, # Use the output_dir from args
        num_train_epochs=100,
        per_device_train_batch_size=1,
        gradient_accumulation_steps=1,
        optim="adamw_torch",
        save_steps=0, # Disable intermediate saving
        logging_steps=25,
        learning_rate=2e-4,
        weight_decay=0.001,
        fp16=False,
        bf16=False,
        max_grad_norm=0.3,
        max_steps=-1,
        warmup_ratio=0.03,
        group_by_length=True,
        lr_scheduler_type="constant",
        report_to="none", # Disable reporting to tensorboard
    )

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

if __name__ == "__main__":
    main()