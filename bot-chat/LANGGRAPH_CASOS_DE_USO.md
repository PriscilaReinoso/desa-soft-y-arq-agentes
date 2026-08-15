# LangGraph

## ¿Qué es?

LangGraph es un framework de **orquestación de agentes** construido sobre LangChain. Permite definir flujos de trabajo como **grafos cíclicos dirigidos** donde cada nodo es un paso (llamada a LLM, tool, decisión, etc.) y las aristas definen la transición entre pasos.

A diferencia de un pipeline lineal (LCEL), LangGraph soporta **loops, branching condicional, estado persistente entre nodos, y control fino del flujo de ejecución**.

---

## ¿Para qué sirve?

LangGraph está diseñado para aplicaciones **agentic** donde el flujo no es determinista:

| Caso de uso | Descripción |
|---|---|
| **Agentes con herramientas** | El LLM decide qué tool llamar, recibe el resultado, y loopa hasta completar la tarea |
| **Multi-agente** | Varios agentes colaboran (ej: un investigador, un escritor, un revisor) |
| **Human-in-the-loop** | Pausar el flujo para que un humano apruebe/modifique antes de continuar |
| **Self-RAG** | Evaluar la relevancia de documentos recuperados y reintentar si es necesario |
| **State machines complejas** | Flujos con validación, guardrails, reintentos, rutas alternativas |
| **Persistencia de estado** | Checkpoints, rollbacks, y continuar ejecuciones interrumpidas |

---

## Diferencia con LangChain

| Aspecto | LangChain | LangGraph |
|---|---|---|
| **Paradigma** | Pipeline lineal (secuencia fija) | Grafo cíclico (nodos + aristas) |
| **Flujo** | Determinista, siempre la misma secuencia | Dinámico, puede bifurcar, loopear, repetir |
| **Estado** | Pasa un diccionario de principio a fin | Grafo de estado persistente entre nodos |
| **Loops** | No soportados nativamente | Soportados (ej: agente llama tools hasta decidir) |
| **Control** | El código decide el flujo | El LLM puede decidir el flujo (routing condicional) |
| **Human-in-loop** | Difícil de implementar | Soportado nativamente (interrupción/espera) |
| **Complejidad** | Baja / media | Media / alta |

### Relación entre ambos

No son excluyentes — **LangGraph usa LangChain por debajo**:

- Los **nodos** del grafo suelen ser **cadenas de LangChain** (prompts, LLMs, parsers, retrievers)
- Las **tools** que usa un agente son **herramientas de LangChain**
- Los **modelos** se declaran con `ChatOpenAI`, `ChatOllama`, etc. (LangChain)

---

## Analogía

- **LangChain** es como una **cinta de montaje** lineal: cada estación hace su tarea en orden y el producto avanza sin vuelta atrás.
- **LangGraph** es como un **equipo de trabajo** con supervisión: el supervisor decide qué miembro actúa, puede pedir revisiones, repetir pasos, o cambiar de estrategia según el resultado.

---

## Ejemplo conceptual

```python
from langgraph.graph import StateGraph, END

# 1. Definir el estado del grafo
class RAGState(TypedDict):
    question: str
    documents: list
    answer: str

# 2. Definir nodos (cada uno es una cadena o función de LangChain)
def retrieve(state: RAGState) -> RAGState:
    docs = retriever.invoke(state["question"])
    return {"documents": docs}

def generate(state: RAGState) -> RAGState:
    answer = llm.invoke(f"Contexto: {state['documents']}\nPregunta: {state['question']}")
    return {"answer": answer}

def grade_documents(state: RAGState) -> str:
    """Evalúa si los docs son relevantes y decide el siguiente paso."""
    if is_relevant(state["documents"], state["question"]):
        return "generate"
    return "rewrite"

# 3. Construir el grafo
graph = StateGraph(RAGState)
graph.add_node("retrieve", retrieve)
graph.add_node("rewrite", rewrite_question)  # re-escribe la query
graph.add_node("generate", generate)

graph.set_entry_point("retrieve")
graph.add_conditional_edges("retrieve", grade_documents)
graph.add_edge("rewrite", "retrieve")     # loop: re-intenta
graph.add_edge("generate", END)

# 4. Ejecutar
app = graph.compile()
result = app.invoke({"question": "¿Qué dice la política de vacaciones?"})
```

---

## ¿Cuándo NO usar LangGraph?

- Pipelines RAG simples (recuperar → generar) sin validación ni reintentos
- Aplicaciones donde el flujo es fijo y no requiere decisiones en tiempo real
- Prototipos rápidos o proyectos pequeños donde LCEL es más que suficiente
