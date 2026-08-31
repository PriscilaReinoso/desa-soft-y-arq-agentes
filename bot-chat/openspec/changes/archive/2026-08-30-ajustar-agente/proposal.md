# proposal.md — Ajustar Agente

> **Requerimiento de origen (Jira):** [IF-32 — Ajustar Agente](https://reinoso-yesica-priscila.atlassian.net/browse/IF-32)
> "ajustar Agente al formato de carpetas declarado en Agents.md"

## Why

El código del bot-de-chat está disperso en módulos planos en la raíz
(`api.py`, `chat.py`, `agent.py`), lo que no coincide con la estructura de
carpetas declarada en `AGENTS.md` (`app/api.py`, `app/agent/`, `app/services/`
y `tests/`). Se requiere reorganizar el agente para que siga el formato
estándar del proyecto, facilitando la navegación, el mantenimiento y la
coherencia con la convención documentada.

## What Changes

- Mover el punto de entrada HTTP a `app/api.py`.
- Convertir el orquestador multi-agente (LangGraph + MCP) en el paquete
  `app/agent/` (agente supervisor y subagentes de ventas e inventario).
- Mover la lógica de negocio reutilizable (persistencia de conversaciones y
  fábrica del LLM) a `app/services/`.
- Añadir la carpeta `tests/` con pruebas unitarias/integración (pytest).
- Actualizar importaciones, rutas de arranque (CLI, uvicorn, Dockerfile) y
  documentación de `README.md` para reflejar la nueva estructura.

> El comportamiento externo del agente no cambia: la API HTTP, el CLI y la
> persistencia mantienen su contrato. Es una **refactorización estructural**
> (sin cambios de comportamiento a nivel de spec), por lo que el change
> declara `skip_specs: true`.

## Capabilities

### New Capabilities

_(ninguna — no se introduce comportamiento nuevo; se reorganiza el existente)_

### Modified Capabilities

_(ninguna — no cambian requerimientos a nivel de spec; solo la ubicación del
código. Por eso `skip_specs: true` en `.openspec.yaml`)_

## Impact

- **Código movido:** `api.py` → `app/api.py`; `agent.py` → `app/agent/`;
  módulos de `chat.py` (persistencia y `get_llm`) → `app/services/`.
- **Imports y arranque:**

  - `uvicorn api:app` → `uvicorn app.api:app` (también en `Dockerfile`).
  - `python chat.py` → CLI actualizado a los nuevos módulos/paquete.
  - Referencias cruzadas entre `api`, `agent` y `chat` se ajustan a los
    nuevos import paths (p. ej. `app.api`, `app.agent.agent`, `app.services.chat`).

- **Dependencias:** sin cambios en `requirements.txt`.
- **Infraestructura:** `Dockerfile` actualizado con el nuevo punto de entrada.
- **Documentación:** `README.md` con la nueva estructura de carpetas.
- **Tests:** nueva carpeta `tests/` (pytest) cubriendo la reestructuración.
