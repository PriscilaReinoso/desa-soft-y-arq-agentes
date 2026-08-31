# app/agent/graph.py
# Orquestador multi-agente con LangGraph.
# Flujo:
#   Supervisor (clasifica la consulta) → ventas_agent o inventario_agent
#   Cada agente tiene su propio LLM + herramientas MCP especificas
#   El agente hace loop (agente → tools → agente) hasta que responde sin tools

import sys
import os
import warnings
from typing import Annotated, Sequence, TypedDict, Literal
from dotenv import load_dotenv

load_dotenv()
warnings.filterwarnings("ignore", module="urllib3")
warnings.filterwarnings("ignore", category=PendingDeprecationWarning)

from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage, AIMessage, HumanMessage, SystemMessage, ToolMessage

from app.services.llm import get_llm

import contextlib
from pathlib import Path
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from langchain_mcp_adapters.tools import load_mcp_tools

# bot-chat/app/agent/graph.py → raiz del workspace (…/desa-soft-y-arq-agentes)
MCP_SERVER_DIR = Path(__file__).resolve().parent.parent.parent.parent / "mcp-server"

# El MCP server se lanza como modulo del paquete `app` del mcp-server,
# con cwd = MCP_SERVER_DIR para que resuelva app.tools/app.core y no el
# paquete `app` del bot-chat. Ver mcp-server/mcp_config.json.
MCP_SERVER_MODULE = "app.server"


def _mcp_python() -> str:
    """Devuelve el Python con fastmcp/psycopg para lanzar el MCP server.
    Prioriza el venv local del MCP server; en contenedores (donde todas las
    dependencias viven en el mismo Python) usa sys.executable."""
    candidate = MCP_SERVER_DIR / "venv" / "Scripts" / "python.exe"
    if candidate.exists():
        return str(candidate)
    return sys.executable


# --- Estado del grafo ---
# messages: historial completo de la conversacion
# current_agent: a qué agente debe ir la proxima vez que tools devuelva control
#   ("ventas", "inventario", "FINISH")

class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add_messages]
    current_agent: str


# --- Prompts de sistema ---

SUPERVISOR_PROMPT = """Eres un clasificador de consultas. Tu unica tarea es analizar
el ultimo mensaje del usuario y decidir a qué agente derivarlo.

- ventas: consultas y recomendaciones de productos, precios, envios, descuentos y
          atencion al cliente en la ferreteria.
- inventario: preguntas sobre stock disponible, ingresos de mercaderia, egresos y
              gestión logística.

Si la pregunta es de uno de estos temas, responde SOLO con el nombre del agente
("ventas" o "inventario"), sin explicaciones ni texto adicional.
Si es un saludo, agradecimiento, despedida o consulta general, responde
normalmente como asistente."""

VENTAS_FERRETERIA_PROMPT = """Eres un agente de Ventas especializado en una ferretería.
Debes ayudar a los clientes con recomendaciones de productos, precios y uso de herramientas.
Usa las herramientas conectadas a la base de datos para buscar productos.
Responde de forma clara y amable."""

INVENTARIO_PROMPT = """Eres un agente experto en Inventario y Stock de una ferretería.
Te encargas de consultas operativas, revisar el stock disponible de productos,
listar categorías y verificar movimientos o alertas de bajo stock.
Usa las herramientas de base de datos para obtener información exacta."""


# --- MCP Globals ---
_mcp_exit_stack = contextlib.AsyncExitStack()
mcp_tools = []


async def initialize_mcp():
    global mcp_tools
    if mcp_tools:
        return mcp_tools

    server_params = StdioServerParameters(
        command=_mcp_python(),
        args=["-m", MCP_SERVER_MODULE],
        env=os.environ,
        cwd=str(MCP_SERVER_DIR),
    )

    stdio_transport = await _mcp_exit_stack.enter_async_context(stdio_client(server_params))
    read, write = stdio_transport
    session = await _mcp_exit_stack.enter_async_context(ClientSession(read, write))
    await session.initialize()
    mcp_tools = await load_mcp_tools(session)
    print(f"[MCP] Cargadas {len(mcp_tools)} herramientas dinámicas.")
    return mcp_tools


async def cleanup_mcp():
    await _mcp_exit_stack.aclose()


# --- Nodos del grafo ---

async def supervisor_node(state: AgentState):
    """Clasifica la consulta o responde directamente si es general."""
    llm = get_llm()
    last_msgs = state["messages"][-3:]
    prompt = SystemMessage(content=SUPERVISOR_PROMPT)
    response = await llm.ainvoke([prompt] + last_msgs)
    content = response.content.strip().lower()

    if content == "ventas":
        return {"current_agent": "ventas"}
    elif content == "inventario":
        return {"current_agent": "inventario"}
    else:
        # Respuesta directa
        return {"messages": [response], "current_agent": "FINISH"}


async def ventas_ferreteria_agent(state: AgentState):
    """Agente de Ventas de ferreteria: usa herramientas MCP."""
    llm = get_llm().bind_tools(mcp_tools)
    system = SystemMessage(content=VENTAS_FERRETERIA_PROMPT)
    response = await llm.ainvoke([system] + state["messages"][-6:])
    return {"messages": [response]}


async def inventario_agent(state: AgentState):
    """Agente de Inventario: usa herramientas MCP."""
    llm = get_llm().bind_tools(mcp_tools)
    system = SystemMessage(content=INVENTARIO_PROMPT)
    response = await llm.ainvoke([system] + state["messages"][-6:])
    return {"messages": [response]}


async def call_tool(state: AgentState):
    """Ejecuta la herramienta que el LLM solicito."""
    last = state["messages"][-1]
    results = []

    # Mapear nombre a herramienta real
    tools_by_name = {t.name: t for t in mcp_tools}

    for tc in last.tool_calls:
        t_name = tc["name"]
        if t_name in tools_by_name:
            tool_obj = tools_by_name[t_name]
            result = await tool_obj.ainvoke(tc["args"])
            results.append(ToolMessage(content=str(result), tool_call_id=tc["id"]))
        else:
            results.append(ToolMessage(content=f"Error: Tool {t_name} not found.", tool_call_id=tc["id"]))

    return {"messages": results}


# --- Funciones de ruteo ---

def supervisor_decision(state: AgentState) -> Literal["ventas", "inventario", "__end__"]:
    """Rutea desde supervisor al agente elegido o finaliza."""
    agent = state.get("current_agent", "FINISH")
    if agent in ("ventas", "inventario"):
        return agent
    return "__end__"


def should_continue(state: AgentState) -> Literal["tools", "__end__"]:
    """Despues de un agente: si pidio herramienta → tools, sino → fin."""
    last = state["messages"][-1]
    if getattr(last, "tool_calls", None):
        return "tools"
    return "__end__"


def route_from_tools(state: AgentState) -> Literal["ventas", "inventario"]:
    """Despues de ejecutar tools, vuelve al agente que la llamo."""
    agent = state.get("current_agent", "ventas")
    return agent if agent in ("ventas", "inventario") else "ventas"


# --- Compilacion del grafo ---

_agent = None


def get_agent():
    global _agent
    if _agent is None:
        workflow = StateGraph(AgentState)

        # Registro de nodos
        workflow.add_node("supervisor", supervisor_node)
        workflow.add_node("ventas", ventas_ferreteria_agent)
        workflow.add_node("inventario", inventario_agent)
        workflow.add_node("tools", call_tool)

        # Entrada: siempre arranca por el supervisor
        workflow.set_entry_point("supervisor")

        # Supervisor → ventas, inventario, o fin
        workflow.add_conditional_edges(
            "supervisor",
            supervisor_decision,
            {
                "ventas": "ventas",
                "inventario": "inventario",
                "__end__": END,
            },
        )

        # Cada agente puede llamar tools o terminar
        workflow.add_conditional_edges(
            "ventas",
            should_continue,
            {
                "tools": "tools",
                "__end__": END,
            },
        )
        workflow.add_conditional_edges(
            "inventario",
            should_continue,
            {
                "tools": "tools",
                "__end__": END,
            },
        )

        # Tools siempre vuelve al agente que hizo la llamada
        workflow.add_conditional_edges(
            "tools",
            route_from_tools,
            {
                "ventas": "ventas",
                "inventario": "inventario",
            },
        )

        _agent = workflow.compile()
    return _agent


# --- Funcion publica para el punto de entrada ---

async def responder_agent(question: str, history: list) -> str:
    """Punto de entrada desde la API/CLI. Recibe pregunta + historial y devuelve respuesta."""
    messages = []
    for msg in history[-6:]:
        if msg["role"] == "user":
            messages.append(HumanMessage(content=msg["content"]))
        else:
            messages.append(AIMessage(content=msg["content"]))
    messages.append(HumanMessage(content=question))

    result = await get_agent().ainvoke({
        "messages": messages,
        "current_agent": "",
    })

    # Buscamos la ultima respuesta del asistente (sin tool_calls)
    for msg in reversed(result["messages"]):
        if isinstance(msg, AIMessage) and not getattr(msg, "tool_calls", None):
            return msg.content
    return "No se pudo generar una respuesta."
