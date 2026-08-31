# tests/test_llm.py
# Pruebas de la fabrica del LLM segun LLM_PROVIDER (mockeando se elimina deps reales).

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def test_get_llm_ollama_por_defecto(monkeypatch):
    import app.services.llm as llm

    monkeypatch.delenv("LLM_PROVIDER", raising=False)

    instance = llm.get_llm()
    assert type(instance).__name__ == "ChatOllama"


def test_get_llm_groq(monkeypatch):
    import app.services.llm as llm

    monkeypatch.setenv("LLM_PROVIDER", "groq")
    monkeypatch.setenv("GROQ_API_KEY", "test-key")
    monkeypatch.setenv("LLM_MODEL", "llama3-70b-8192")

    instance = llm.get_llm()
    assert type(instance).__name__ == "ChatGroq"
    assert instance.model_name == "llama3-70b-8192"
