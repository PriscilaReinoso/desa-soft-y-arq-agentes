# app/cli.py
# Interfaz de linea de comandos del chat multi-agente.
#
# Uso:
#   python -m app.cli                    # modo interactivo
#   python -m app.cli --question "..."   # pregunta unica (modo API)

import json
import argparse
import asyncio

from aioconsole import ainput

from app.services.persistence import (
    cargar_conversacion,
    crear_conversacion,
    guardar_conversacion,
)
from app.agent import responder_agent, initialize_mcp, cleanup_mcp


async def process_question(question, history):
    """Enruta la pregunta al orquestador multi-agente."""
    return await responder_agent(question, history)


async def responder(conversation, question):
    """Ejecuta una pregunta sobre una conversacion y retorna la respuesta."""
    history = conversation["messages"][-10:]
    response = await process_question(question, history)
    conversation["messages"].append({"role": "user", "content": question})
    conversation["messages"].append({"role": "assistant", "content": response})
    guardar_conversacion(conversation)
    return response


async def main():
    parser = argparse.ArgumentParser(description="Chat por consola")
    parser.add_argument("--question", help="Pregunta unica (modo API). Omítelo para modo interactivo.")
    parser.add_argument("--conversation-id", help="ID de conversacion existente para continuar.")
    args = parser.parse_args()

    print("Inicializando conexión con MCP...")
    await initialize_mcp()

    if args.conversation_id:
        conversation = cargar_conversacion(args.conversation_id)
        if not conversation:
            print(f"No se encontro la conversacion '{args.conversation_id}'.")
            await cleanup_mcp()
            exit(1)
    else:
        conversation = crear_conversacion()
        print(f"Nueva conversacion iniciada. ID: {conversation['conversation_id']}")

    # Modo pregunta-unica (para endpoint)
    if args.question:
        respuesta = await responder(conversation, args.question)
        print(json.dumps({
            "conversation_id": conversation["conversation_id"],
            "answer": respuesta,
        }, ensure_ascii=False))
        await cleanup_mcp()
        exit(0)

    # Modo interactivo
    print("Chat listo (escribe 'exit' para salir)\n")

    try:
        while True:
            question = await ainput("Vos: ")
            question = question.strip()
            if question.lower() in ("exit", "quit", "salir", "chau"):
                break
            if not question:
                continue

            respuesta = await responder(conversation, question)

            print("IA: ", end="", flush=True)
            print(respuesta)
    finally:
        await cleanup_mcp()


if __name__ == "__main__":
    asyncio.run(main())
