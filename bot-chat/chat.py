# chat.py
# Punto de entrada del chat multi-agente.
# Orquesta la conversacion: recibe preguntas, las pasa al agente LangGraph, persiste el historial.

import os  # rutas de archivos
import json  # serializar conversaciones a JSON
import uuid  # generar IDs unicos para cada conversacion
import warnings  # silenciar warnings de librerias externas
from dotenv import load_dotenv  # carga variables de entorno desde .env

load_dotenv()  # ejecuta la carga del .env para tener disponibles API keys y config

# Silencia warnings inofensivos de urllib3 (problema de LibreSSL en macOS)
warnings.filterwarnings("ignore", module="urllib3")
# Silencia FutureWarning que usan librerias como langgraph para avisar de cambios futuros
warnings.simplefilter("ignore", FutureWarning)

from langchain_ollama import ChatOllama  # LLM local via Ollama
from langchain_groq import ChatGroq  # LLM cloud via Groq

# Directorio donde se guardan las conversaciones como archivos JSON
CONVERSATIONS_DIR = "./conversaciones"


# ---- Funciones de persistencia (JSON) ----

def crear_conversacion():
    """Crea una nueva conversacion con un UUID unico y la guarda a disco."""
    conv = {
        "conversation_id": str(uuid.uuid4()),  # ID unico para identificar la conversacion
        "messages": [],  # lista de mensajes (user + assistant)
    }
    guardar_conversacion(conv)  # la persiste inmediatamente
    return conv


def cargar_conversacion(conversation_id):
    """Carga una conversacion existente desde su archivo JSON."""
    path = os.path.join(CONVERSATIONS_DIR, f"{conversation_id}.json")
    if not os.path.exists(path):  # si no existe el archivo, devolvemos None
        return None
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)  # deserializa el JSON a un diccionario Python


def guardar_conversacion(conv):
    """Guarda la conversacion a disco como JSON."""
    os.makedirs(CONVERSATIONS_DIR, exist_ok=True)  # crea el directorio si no existe
    path = os.path.join(CONVERSATIONS_DIR, f"{conv['conversation_id']}.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(conv, f, indent=2, ensure_ascii=False)  # serializa bonito con indentacion


# ---- Funcion para crear el LLM segun configuracion ----

def get_llm():
    """Devuelve una instancia del LLM configurada segun las variables de entorno.
    Soporta Ollama (local) y Groq (cloud)."""
    provider = os.getenv("LLM_PROVIDER", "ollama").lower()  # lee el proveedor del .env, default ollama

    if provider == "groq":
        # Si usa Groq, devuelve un ChatGroq con el modelo y API key del .env
        return ChatGroq(
            model=os.getenv("LLM_MODEL", "llama3-70b-8192"),  # modelo, con fallback a llama3-70b
            temperature=0,  # temperatura 0 = respuestas deterministicas
            api_key=os.getenv("GROQ_API_KEY"),  # API key de Groq
        )

    # Default: Ollama local
    return ChatOllama(
        model=os.getenv("LLM_MODEL", "llama3.2"),  # modelo, con fallback a llama3.2
        base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"),
        temperature=0,  # temperatura 0 = respuestas deterministicas
    )


# ---- CLI ----

if __name__ == "__main__":
    import argparse  # para parsear argumentos de linea de comandos
    import asyncio
    from aioconsole import ainput
    
    parser = argparse.ArgumentParser(description="Chat por consola")
    parser.add_argument("--question", help="Pregunta unica (modo API). Omítelo para modo interactivo.")
    parser.add_argument("--conversation-id", help="ID de conversacion existente para continuar.")
    args = parser.parse_args()

    # Importamos el agente LangGraph solo cuando se necesita (evita loops de import)
    from agent import responder_agent, initialize_mcp, cleanup_mcp

    async def process_question(question, history):
        """Enruta la pregunta al orquestador multi-agente."""
        return await responder_agent(question, history)

    # ---- Responder ----

    async def responder(conversation, question):
        """Ejecuta una pregunta sobre una conversacion y retorna la respuesta."""
        history = conversation["messages"][-10:]  # ultimos 10 mensajes para no saturar el contexto
        response = await process_question(question, history)
        # Guardamos la pregunta y respuesta en el historial
        conversation["messages"].append({"role": "user", "content": question})
        conversation["messages"].append({"role": "assistant", "content": response})
        guardar_conversacion(conversation)  # persistimos los cambios
        return response

    async def main():
        # Inicializar cliente MCP
        print("Inicializando conexión con MCP...")
        await initialize_mcp()
        
        # Cargar o crear conversacion
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
            # Devuelve JSON con el ID de conversacion y la respuesta
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
                    break  # comandos de salida
                if not question:
                    continue  # pregunta vacia, vuelve a preguntar

                respuesta = await responder(conversation, question)

                print("IA: ", end="", flush=True)  # flush=True para mostrar el prompt antes de la respuesta
                print(respuesta)
        finally:
            await cleanup_mcp()

    asyncio.run(main())
