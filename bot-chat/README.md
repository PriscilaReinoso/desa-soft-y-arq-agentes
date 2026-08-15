# Chat Multi-Agente

Chat con orquestador multi-agente usando **LangGraph**. Un **supervisor** clasifica la consulta y la deriva al agente especializado (**Ventas** o **Inventario**); ambos consultan la base de datos PostgreSQL a través de un **servidor MCP** (ver `../mcp-server`) por stdio.

## Requisitos

```bash
cd bot-chat
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Tener un LLM disponible:

| Proveedor | Config (.env) | Requisito |
|---|---|---|
| **Ollama** (local) | `LLM_PROVIDER=ollama` | `ollama serve` corriendo + modelo descargado |
| **Groq** (cloud) | `LLM_PROVIDER=groq` | API key en `GROQ_API_KEY` |

Modelo recomendado: `qwen2.5:7b` (o superior) para mejor tool calling.

```bash
ollama pull qwen2.5:7b
```

Luego en `.env`:

```
LLM_PROVIDER=ollama
LLM_MODEL=qwen2.5:7b
```

La base de datos (`ferreteria_db`) la provee el MCP server — ver `../mcp-server/README.md`.

---

## Uso (CLI)

En Windows podés arrancar directo con el lanzador (activa el venv y fuerza UTF-8):

```bash
run.bat                    # Interactivo
run.bat --question "Hola"  # Pregunta única
```

O manualmente:

```bash
venv\Scripts\activate
# Interactivo
python chat.py
# Pregunta única
python chat.py --question "Que productos tienen bajo stock?"
python chat.py --conversation-id <uuid>
```

---

## API HTTP

```bash
venv\Scripts\python -m uvicorn api:app --host 0.0.0.0 --port 8001
```

| Método | Ruta | Body | Respuesta |
|---|---|---|---|
| POST | `/chat` | `{ "question": "...", "conversation_id": null }` | `{ "conversation_id", "answer" }` |
| GET | `/conversations/{id}` | - | Historial JSON |
| GET | `/health` | - | `{ "status": "ok" }` |

```bash
curl -X POST http://localhost:8001/chat -H "Content-Type: application/json" ^
  -d "{\"question\":\"Que productos tienen bajo stock?\",\"conversation_id\":null}"
```

---

## Docker

```bash
cd ../mcp-server
docker compose up -d --build
```

Levanta PostgreSQL (`ferreteria_db`, puerto host `5433`) y el servicio `chat-api` en `http://localhost:8001`. Ollama se consume desde el host (`host.docker.internal:11434`). Ver `../mcp-server/README.md`.

---

## Conversaciones

Los chats se persisten en `conversaciones/<uuid>.json`.

---

## Estructura

| Archivo | Contenido |
|---|---|
| `agent.py` | Grafo multi-agente en LangGraph (supervisor → ventas/inventario) + conexión MCP |
| `chat.py` | CLI y lógica de persistencia de conversaciones |
| `api.py` | API HTTP (FastAPI) para el frontend |
| `conversaciones/` | Historiales en JSON |
