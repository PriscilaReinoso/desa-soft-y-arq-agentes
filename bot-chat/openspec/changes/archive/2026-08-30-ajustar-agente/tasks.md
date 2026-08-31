# tasks.md — Ajustar Agente

> Requerimiento de origen: [IF-32 — Ajustar Agente](https://reinoso-yesica-priscila.atlassian.net/browse/IF-32)
> Reorganizar el agente al formato de carpetas declarado en `AGENTS.md`.

## 1. Crear el paquete `app/` y mover `services`

- [x] 1.1 Crear el paquete `app/` con `app/__init__.py`.
- [x] 1.2 Crear `app/services/` con `app/services/__init__.py`.
- [x] 1.3 Mover la persistencia de conversaciones (`crear_conversacion`,
      `cargar_conversacion`, `guardar_conversacion` y `CONVERSATIONS_DIR`) de
      `chat.py` a `app/services/persistence.py`.
- [x] 1.4 Mover la fábrica del LLM (`get_llm`) de `chat.py` a
      `app/services/llm.py`.

## 2. Mover el orquestador multi-agente a `app/agent/`

- [x] 2.1 Crear el paquete `app/agent/` con `app/agent/__init__.py`.
- [x] 2.2 Mover el orquestador LangGraph (grafo, nodos, prompts, funciones de
      ruteo, compilación) de `agent.py` a `app/agent/` (p. ej.
      `app/agent/graph.py`).
- [x] 2.3 Opcional: separar los subagentes (ventas/inventario) en
      `app/agent/subagents/`. _(No aplicado: se mantuvieron dentro de
      `app/agent/graph.py`, que es la alternativa indicada en design.md)_
- [x] 2.4 Exponer la API pública (`responder_agent`, `initialize_mcp`,
      `cleanup_mcp`) desde `app/agent/__init__.py`.
- [x] 2.5 Ajustar `MCP_SERVER_DIR` (y `_mcp_python`) a la nueva profundidad de
      `__file__` y verificar que la ruta al `mcp-server` siga resolviendo.

## 3. Mover la API HTTP y el CLI

- [x] 3.1 Mover `api.py` a `app/api.py` y ajustar sus imports a
      `app.agent` y `app.services.persistence`.
- [x] 3.2 Mover/crear el CLI en `app/` (p. ej. `app/cli.py` con el bloque
      `if __name__ == "__main__"`), actualizando imports a los nuevos módulos.
- [x] 3.3 Actualizar el comando de arranque de uvicorn a `app.api:app`.

## 4. Ajustar infraestructura y documentación

- [x] 4.1 Actualizar el `Dockerfile` (CMD `uvicorn app.api:app`).
- [x] 4.2 Actualizar `README.md` con la nueva estructura de carpetas y
      comandos de arranque (CLI y API).

## 5. Pruebas

- [x] 5.1 Crear `tests/` con `tests/__init__.py` (o `conftest.py`) y un test
      de arranque que verifique que `app.api.app` se crea y que los módulos
      importan correctamente.
- [x] 5.2 Añadir tests de persistencia (`crear_conversacion`,
      `guardar_conversacion`, `cargar_conversacion`) usando un directorio
      temporal para `CONVERSATIONS_DIR`.
- [x] 5.3 Añadir test de la fábrica LLM (`get_llm`) según `LLM_PROVIDER`
      (mockeando el proveedor).
- [x] 5.4 Correr `pytest` y verificar que toda la suite pasa.

## 6. Verificación final

- [x] 6.1 Levantar `app.api:app` localmente y verificar `/health` y `/chat`
      (con LLM y MCP disponibles).
- [x] 6.2 Confirmar que los módulos originales en la raíz (`api.py`,
      `chat.py`, `agent.py`) ya no son necesarios o quedan eliminados sin
      romper el arranque.
