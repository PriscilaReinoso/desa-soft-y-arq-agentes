# Orquestador Multi-Agente con LangGraph

## ¿Qué hace?

Un **orquestador de agentes** donde un **supervisor** clasifica la consulta y la deriva al agente especializado correspondiente (**Ventas** o **Inventario**). Cada agente decide **cuándo y cómo** usar sus herramientas (patrón ReAct). Las herramientas provienen de un **servidor MCP** que consulta la base PostgreSQL real de la ferretería (ver `../mcp-server`).

### Orquestador multi-agente (actual)

```
Pregunta → Supervisor clasifica...
              ├─ "ventas"     → ventas_agent (tools MCP)
              ├─ "inventario" → inventario_agent (tools MCP)
              └─ saludo/general → responde directamente
```

Cada agente loopea: **piensa → actúa → observa → piensa de nuevo** hasta que tiene suficiente información para responder (patrón ReAct: Reasoning + Acting).

---

## Estructura del grafo

```
          ┌──────────────┐
          │    START     │
          └──────┬───────┘
                 │
          ┌──────▼───────┐
          │  supervisor  │  ← clasifica la consulta
          └──────┬───────┘
                 │
        ┌────────┼────────┬──────────┐
        │        │        │          │
   ┌────▼───┐ ┌──▼─────┐  │  ┌───────▼──────┐
   │ ventas │ │invent. │  │  │   FINISH     │
   │(agente)│ │(agent) │  │  │(responde     │
   └────┬───┘ └──┬─────┘  │  │ directamente)│
        │        │        │  └───────┬──────┘
   ┌────┴───┐ ┌──┴─────┐  │          │
   │ tools  │ │ tools  │  │          │
   │(ejecuta│ │(ejec.) │  │          │
   └────┬───┘ └──┬─────┘  │          │
        │        │        │          │
        └─ ventas┘        │          │
        (vuelve)          │          │
                          └──── END ─┘
```

**Nodos:**
- `supervisor` — Clasifica la consulta: si es de Ventas → "ventas", si es de Inventario → "inventario", si es saludo/general → responde directo y termina.
- `ventas` — Agente de Ventas de la ferretería con las tools MCP. Loop: agente → tools → agente hasta responder.
- `inventario` — Agente de Inventario con las tools MCP. Loop: agente → tools → agente hasta responder.
- `tools` — Ejecuta la herramienta MCP que el agente solicitó y vuelve al mismo agente.

**Aristas:**
- `supervisor → ventas` si clasifica como Ventas
- `supervisor → inventario` si clasifica como Inventario
- `supervisor → END` si responde directo (saludos, etc.)
- `ventas/inventario → tools` si el agente pidió una herramienta
- `ventas/inventario → END` si el agente respondió sin herramientas
- `tools → ventas/inventario` (vuelve al agente que llamó la tool)

---

## Estado del grafo

```python
class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add_messages]
    current_agent: str  # "ventas", "inventario", o "FINISH"
```

- `messages`: historial completo de la conversación
- `current_agent`: rastrea qué agente está activo para que `tools` sepa a quién devolver el control

---

## Herramientas disponibles (MCP)

Las tools no se definen en este repo: se cargan dinámicamente desde el **MCP server** de inventario al iniciar (`initialize_mcp` → `load_mcp_tools`). El LLM del agente las bindea con `bind_tools(mcp_tools)`.

Tools expuestas por el MCP server:

| Tool | Descripción |
|---|---|
| `search_products` | Busca productos por nombre, SKU, descripción o categoría |
| `get_product_details` | Ficha completa de un producto por ID o SKU |
| `check_low_stock` | Lista productos bajo su stock mínimo |
| `list_categories` | Lista las categorías |
| `get_stock_movements` | Historial de movimientos de un producto |

El MCP server se lanza como subproceso (transporte stdio) con el Python del venv de `../mcp-server` (o el mismo Python en contenedores).

---

## Prompts del supervisor

El supervisor usa un prompt específico para clasificar la consulta:

```
Eres un clasificador de consultas. Tu unica tarea es analizar
el ultimo mensaje del usuario y decidir a qué agente derivarlo.

- ventas: consultas y recomendaciones de productos, precios, envios, descuentos y
          atencion al cliente en la ferreteria.
- inventario: preguntas sobre stock disponible, ingresos de mercaderia, egresos y
              gestión logística.

Si la pregunta es de uno de estos temas, responde SOLO con el nombre del agente
("ventas" o "inventario"), sin explicaciones ni texto adicional.
Si es un saludo, agradecimiento, despedida o consulta general, responde
normalmente como asistente.
```

Si el supervisor responde "ventas" o "inventario", el grafo rutea al agente correspondiente. Si responde cualquier otra cosa (un saludo, etc.), ese mensaje se devuelve al usuario como respuesta final.

---

## Cómo se usa

```bash
# Interactivo
run.bat

# Pregunta única
run.bat --question "Que productos tienen bajo stock?"

# El supervisor clasifica automáticamente:
python chat.py --question "Que productos tienen bajo stock?"
python chat.py --question "Tienen tornillos de 5/8?"
python chat.py --question "Hola, buenos dias"
```

La base de datos debe estar levantada (ver `../mcp-server/README.md`).

---

## Archivos

| Archivo | Propósito |
|---|---|
| `agent.py` | Grafo multi-agente de LangGraph con supervisor, agentes y conexión MCP |
| `chat.py` | CLI del orquestador multi-agente y persistencia de conversaciones |
| `api.py` | API HTTP (FastAPI) que expone el orquestador al frontend |
| `conversaciones/` | Historiales de conversaciones en JSON |

---

## Agregar más agentes

Para agregar un nuevo agente especializado (ej. Compras):

### 1. Crear el prompt del agente
```python
COMPRAS_PROMPT = """Eres un agente experto en Compras de una ferretería..."""
```

### 2. Agregar el nodo en el grafo
```python
async def compras_agent(state: AgentState):
    llm = get_llm().bind_tools(mcp_tools)
    system = SystemMessage(content=COMPRAS_PROMPT)
    response = await llm.ainvoke([system] + state["messages"][-6:])
    return {"messages": [response]}

workflow.add_node("compras", compras_agent)
workflow.add_conditional_edges("compras", should_continue, {
    "tools": "tools",
    "__end__": END,
})
```

### 3. Actualizar el supervisor
Agregar la opción en `SUPERVISOR_PROMPT`, en `supervisor_node`, en `supervisor_decision` y en `route_from_tools`.

Si el nuevo agente necesita herramientas que el MCP server no expone, agregarlas en `../mcp-server/src/server.py`.

---

## Requisitos

- `langgraph>=1.0.0`, `langchain-mcp-adapters`, `mcp` (en `requirements.txt`)
- El LLM debe soportar **tool/function calling** (Ollama con `qwen2.5`, `llama3.2+`, o Groq)
- Modelo recomendado: `qwen2.5:7b` o superior para mejor precisión en tool calling
- El MCP server de inventario y su base PostgreSQL deben estar disponibles
