# desa-soft-y-arq-agentes

Desarrollo de codigo con herramientas de IA y agentes.

El desarrollo de este proyecto fue creado con herramientas de IA completamente gratuitas.

- Herramientas de desarrollo e IDE: CLI OpenCode en su mayoria. Antigravity IDE en menor medida.
- Agente: en su mayoria Big Pickle en su version gratuita para Plan y Build. 
- Metodologia: SDD (Spec-Driven Development) con OpenSpec y Jira para el registro de tareas.
- Otras herramientas: Figma como ayuda para el diseño de la interfaz y prototipado.
- Versionamiento: Git y GitHub.

## Proyectos

| Proyecto | Descripción |
|---|---|
| `frontend/` | App React + Vite (dashboard, inventario, asistente IA) |
| `backend/` | API FastAPI de negocio (CRUD inventario, auth JWT) |
| `bot-chat/` | Chat multi-agente (LangGraph + MCP) con API HTTP y Docker |
| `mcp-server/` | Servidor MCP de inventario (tools + PostgreSQL) |

## Inicio rápido

1. **Base de datos + chat**: `cd mcp-server && docker compose up -d --build` (PostgreSQL en `localhost:5433`, chat en `http://localhost:8001`).
2. **Backend**: ver `backend/README.md`.
3. **Frontend**: `cd frontend && npm install && npm run dev`.

Cada proyecto tiene su propio `README.md` con instrucciones detalladas. Sin embargo esta cada proyecto contenirizado para iniciar con el docker compose

1. docker compose up -d a la altura del docker compose

URL: http://127.0.0.1/login
SWAGGER: http://localhost:8000/docs


