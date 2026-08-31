# app/services/llm.py
# Fabrica del LLM configurada segun variables de entorno.

import os

from langchain_ollama import ChatOllama
from langchain_groq import ChatGroq


def get_llm():
    """Devuelve una instancia del LLM configurada segun las variables de entorno.
    Soporta Ollama (local) y Groq (cloud)."""
    provider = os.getenv("LLM_PROVIDER", "ollama").lower()

    if provider == "groq":
        return ChatGroq(
            model=os.getenv("LLM_MODEL", "llama3-70b-8192"),
            temperature=0,
            api_key=os.getenv("GROQ_API_KEY"),
        )

    # Default: Ollama local
    return ChatOllama(
        model=os.getenv("LLM_MODEL", "llama3.2"),
        base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"),
        temperature=0,
    )
