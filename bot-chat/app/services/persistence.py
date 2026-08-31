# app/services/persistence.py
# Persistencia de conversaciones en disco como archivos JSON.

import json
import os
import uuid

# Directorio donde se guardan las conversaciones como archivos JSON.
CONVERSATIONS_DIR = "./conversaciones"


def crear_conversacion():
    """Crea una nueva conversacion con un UUID unico y la guarda a disco."""
    conv = {
        "conversation_id": str(uuid.uuid4()),
        "messages": [],
    }
    guardar_conversacion(conv)
    return conv


def cargar_conversacion(conversation_id):
    """Carga una conversacion existente desde su archivo JSON."""
    path = os.path.join(CONVERSATIONS_DIR, f"{conversation_id}.json")
    if not os.path.exists(path):
        return None
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def guardar_conversacion(conv):
    """Guarda la conversacion a disco como JSON."""
    os.makedirs(CONVERSATIONS_DIR, exist_ok=True)
    path = os.path.join(CONVERSATIONS_DIR, f"{conv['conversation_id']}.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(conv, f, indent=2, ensure_ascii=False)
