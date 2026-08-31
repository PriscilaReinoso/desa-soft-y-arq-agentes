# tests/test_persistence.py
# Pruebas de la persistencia de conversaciones usando un directorio temporal.

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def test_guardar_y_cargar_conversacion(tmp_path, monkeypatch):
    import app.services.persistence as persistence

    monkeypatch.setattr(persistence, "CONVERSATIONS_DIR", str(tmp_path))

    conv = persistence.crear_conversacion()
    assert conv["conversation_id"]
    assert conv["messages"] == []

    # Luego de guardar, se puede volver a cargar de disco
    loaded = persistence.cargar_conversacion(conv["conversation_id"])
    assert loaded is not None
    assert loaded["conversation_id"] == conv["conversation_id"]

    # El archivo JSON existe en el directorio temporal
    path = os.path.join(str(tmp_path), f"{conv['conversation_id']}.json")
    assert os.path.exists(path)


def test_cargar_conversacion_inexistente(tmp_path, monkeypatch):
    import app.services.persistence as persistence

    monkeypatch.setattr(persistence, "CONVERSATIONS_DIR", str(tmp_path))

    assert persistence.cargar_conversacion("no-existe-id") is None
