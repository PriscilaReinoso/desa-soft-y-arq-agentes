# app/api.py
# API HTTP del chat multi-agente. Expone el orquestador LangGraph + MCP
# para que el frontend pueda consumirlo desde el navegador.
#
# Uso:
#   venv\Scripts\python -m uvicorn app.api:app --host 0.0.0.0 --port 8001

from contextlib import asynccontextmanager
import os
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.services.persistence import (
    cargar_conversacion,
    crear_conversacion,
    guardar_conversacion,
)
from app.agent import responder_agent, initialize_mcp, cleanup_mcp


class ChatRequest(BaseModel):
    question: str
    conversation_id: Optional[str] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    await initialize_mcp()
    yield
    await cleanup_mcp()


app = FastAPI(title="Chat Multi-Agente API", lifespan=lifespan)


def _parse_cors_origins(raw: str) -> list[str]:
    return [o.strip() for o in raw.split(",") if o.strip()]


CORS_ORIGINS = _parse_cors_origins(
    os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://127.0.0.1,http://127.0.0.1:80",
    )
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/chat")
async def chat(req: ChatRequest):
    question = req.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="La pregunta no puede estar vacia.")

    if req.conversation_id:
        conversation = cargar_conversacion(req.conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversacion no encontrada.")
    else:
        conversation = crear_conversacion()

    history = conversation["messages"][-10:]
    answer = await responder_agent(question, history)

    conversation["messages"].append({"role": "user", "content": question})
    conversation["messages"].append({"role": "assistant", "content": answer})
    guardar_conversacion(conversation)

    return {
        "conversation_id": conversation["conversation_id"],
        "answer": answer,
    }


@app.get("/conversations/{conversation_id}")
async def get_conversation(conversation_id: str):
    conversation = cargar_conversacion(conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversacion no encontrada.")
    return conversation
