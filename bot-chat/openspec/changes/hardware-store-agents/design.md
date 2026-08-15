## Context

El bot actualmente utiliza LangGraph con un patrón de supervisor y agentes especializados (RH, Ventas) que consultan colecciones en ChromaDB mediante herramientas (`buscar_en_rh`, `buscar_en_ventas`). Se requiere evolucionar este bot para una ferretería integrando un agente de ventas y uno de inventario. Ambos deberán consultar una base de datos PostgreSQL real a través de un servidor MCP, reemplazando o complementando el enfoque de ChromaDB estático.

See proposal.md for motivation - don't restate it.

## Goals / Non-Goals

**Goals:**
- Definir la arquitectura para integrar el servidor MCP de PostgreSQL con los agentes de LangGraph.
- Establecer los roles y herramientas exactas que tendrán el agente de Ventas (Ferretería) y el agente de Inventario.
- Modificar el flujo del supervisor para rutear consultas hacia estos nuevos agentes.

**Non-Goals:**
- No se diseñará el esquema detallado de la base de datos PostgreSQL en este documento (se asume que existe o se creará externamente).
- No se implementará el código del servidor MCP (solo cómo los agentes se conectan a él).

## Decisions

**1. Herramientas de los Agentes mediante MCP**
- **Decisión:** Los agentes usarán herramientas dinámicas proporcionadas por el cliente MCP conectado al servidor PostgreSQL MCP, en lugar de tools locales con `@tool`.
- **Rationale:** Permite flexibilidad y reuso. El MCP expone tools como `query_database` o `list_tables`.
- **Alternativa:** Crear tools de LangChain hardcodeadas con `psycopg2`. Descartado porque rompe el patrón MCP.

**2. Agente de Ventas y Agente de Inventario**
- **Decisión:** Se crearán dos agentes separados (`ventas_ferreteria_agent` e `inventario_agent`) en LangGraph. Cada uno tendrá un prompt especializado, pero ambos usarán las tools del cliente MCP.
- **Rationale:** Mantiene el principio de responsabilidad única de los agentes definido en el flujo actual. El supervisor decidirá si la pregunta es comercial (precio, recomendación) o logística (stock, ingresos).

**3. Inicialización del Cliente MCP**
- **Decisión:** El cliente MCP se inicializará al arrancar la aplicación (`chat.py`) y sus tools se vincularán al modelo (LLM) que usen los nuevos agentes.
- **Rationale:** Evita conectar y desconectar el cliente en cada turno de la conversación, mejorando la latencia.

## Risks / Trade-offs

- **[Risk] Latencia en consultas SQL** → Asegurar que el MCP tenga configurados límites de tiempo y filas (`LIMIT`) en las consultas para evitar bloqueos del agente.
- **[Risk] Inyección SQL desde el LLM** → El servidor MCP debería implementar seguridad de solo lectura para los agentes de consulta.
- **[Risk] Complejidad en asincronismo (async/await)** → Los clientes MCP típicamente son asíncronos, por lo que el código de LangGraph y las tools deberán ser adaptados a llamadas asíncronas si es necesario, o usar wrappers síncronos.
