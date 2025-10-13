FROM python:3.11-slim

WORKDIR /app

# Install llama-cpp-python with basic build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends gcc g++ make && rm -rf /var/lib/apt/lists/*
RUN pip install llama-cpp-python

COPY test_llm.py .

CMD ["python", "test_llm.py"]
