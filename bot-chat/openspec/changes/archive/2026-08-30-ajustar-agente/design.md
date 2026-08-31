# design.md — Ajustar Agente

## Context

Ver `proposal.md` para la motivación. Estado actual: los módulos de Python
(`api.py`, `chat.py`, `agent.py`) viven en la raíz del proyecto, mientras que
`AGENTS.md` declara una estructura `app/` con `app/api.py`, `app/agent/` y
`app/services/`, además de `tests/`. No existe paquete `app`, no hay carpeta
`services` propia ni carpeta `tests` del proyecto. Esta refactorización es
solo estructural: no cambia el comportamiento del agente (routing, tools MCP,
persistencia) ni el contrato de la API HTTP.

## Goals / Non-Goals

**Goals:**
- Reorganizar el código siguiendo el layout de `AGENTS.md`.
- Mantener idéntico el comportamiento externo (mismos endpoints, mismas
  variables de entorno, misma persistencia).
- Mantener la carga de `.env` y la conexión MCP funcionando tras el movimiento.

**Non-Goals:**
- No introducir nuevas capacidades de agente.
- No cambiar el contrato de la API ni del CLI.
- No tocar el servidor MCP ni la base de datos.
- No alterar `requirements.txt`.

## Decisions

**D1 — Mapeo de módulos al nuevo layout**
- `api.py` → `app/api.py`: punto de entrada HTTP (FastAPI). Sin cambios de
  lógica; solo ajuste de imports a los nuevos módulos.
- `agent.py` → `app/agent/` como paquete Python:
  - `app/agent/__init__.py` expone `responder_agent`, `initialize_mcp`,
    `cleanup_mcp` (la API pública que consumen `api` y el CLI).
  - Orquestador LangGraph (supervisor + ventas + inventario) se mantiene
    (p. ej. `app/agent/orchestrator.py` o `app/agent/graph.py`); los
    subagentes (ventas/inventario) pueden separarse en
    `app/agent/subagents/` para reflejar "instancia del agente y subagentes".
- `chat.py` → separado por responsabilidad en `app/services/`:
  - Persistencia de conversaciones → `app/services/persistence.py`
    (`crear_conversacion`, `cargar_conversacion`, `guardar_conversacion`).
  - Fábrica del LLM → `app/services/llm.py` (`get_llm`).
  - El CLI interactivo pasa a `app/` (p. ej. `app/main.py` con el bloque
    `if __name__ == "__main__"`) o `app/cli.py`, invocable como `python -m
    app.cli`.
- Los `SystemMessage`/prompts y constantes de `agent.py` residen en
  `app/agent/` junto al orquestador.

_Rationale:_ respeta "cada archivo con una única responsabilidad" y ubica la
lógica reutilizable en `services/` como declara `AGENTS.md`.
_Alternativa:_ dejar `agent.py` como un único archivo dentro de `app/agent/`.
Se descarta en favor de un paquete para separar orquestador y subagentes.

**D2 — Ajuste de imports y arranque**
- Todos los imports relativos entre `api`, `agent`, `chat` pasan a rutas de
  paquete (`app.api`, `app.agent.agent`, `app.services.persistence`,
  `app.services.llm`), usando imports relativos o absolutos de paquete según
  el módulo.
- `MCP_SERVER_DIR` en `agent.py` usa `Path(__file__).resolve().parent.parent.parent`
  si la profundidad cambia. Verificar con una prueba que la ruta al
  `mcp-server` siga resolviendo.
- `uvicorn api:app` → `uvicorn app.api:app` (README y `Dockerfile`).
- CLI: `python chat.py` → nueva invocación documentada (p. ej.
  `python -m app.cli`).

**D3 — Tests en `tests/`**
- Crear `tests/` con pytest cubriendo al menos:
  - imports/arranque: los módulos importan y `app.api.app` se crea;
  - persistencia: `crear_conversacion`/`guardar`/`cargar` (usando un
    directorio temporal para `CONVERSATIONS_DIR`);
  - fábrica LLM: `get_llm` construye el cliente correcto según `LLM_PROVIDER`.
- Sin tests que requieran LLM real ni MCP en CI básico (mockear).

## Risks / Trade-offs

- [Rutas MCP rotas tras el movimiento] → Verificar `MCP_SERVER_DIR` con
  `Path(__file__).resolve()` y un test de ruta.
- [Imports circulares al reorganizar `chat`/`agent`/`api`] → Mover
  persistencia/LLM a `services/` rompe el ciclo; usar imports de módulo y
  no de subida de nivel.
- [Dockerfile/README desactualizados] → Actualizar punto de entrada
  (`app.api:app`) y comandos documentados en el mismo change.
- [Regresión en comportamiento API] → Cobertura con tests de arranque +
  persistencia y verificación manual de la API (`/health`, `/chat`).

## Migration Plan

1. Crear el paquete `app/` y mover/renombrar los módulos por capas.
2. Ajustar imports y puntos de entrada (CLI, uvicorn, `Dockerfile`).
3. Crear `tests/` y correr `pytest`.
4. Actualizar `README.md` con la nueva estructura.
5. Verificación manual: levantar `app.api:app` y probar `/health` y `/chat`.

_Rollback:_ al ser un movimiento de archivos dentro del repo, el tag/commit
anterior restaura la estructura plana; el comportamiento no varía.

## Open Questions

- Ninguna que requiera resolver ahora: el layout objetivo está declarado en
  `AGENTS.md` y la separación exacta de archivos dentro de `app/agent/` y
  `app/services/` puede afinarse durante la implementación sin cambiar el
  alcance ni las tareas.
