# tests/test_app.py
# Verifica que el paquete `app` y sus modulos importan y que la API se crea.

import os
import sys

# Asegura que la raiz del proyecto este en el path para importar `app`.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def test_app_package_imports():
    import app.api
    import app.cli
    import app.agent
    import app.agent.graph
    import app.services.persistence
    import app.services.llm


def test_fastapi_app_created():
    from app.api import app

    assert app.title == "Chat Multi-Agente API"
    assert app.routes  # hay rutas registradas
