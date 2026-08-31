## 1. Configuración de MCP
- [x] 1.1 Configurar e inicializar el cliente MCP (PostgreSQL) en `agent.py` o `chat.py`.
- [x] 1.2 Extraer las herramientas dinámicas proporcionadas por el cliente MCP para que puedan ser usadas por los modelos de LangChain.

## 2. Creación de Nuevos Agentes
- [x] 2.1 Crear el prompt del agente de ventas (`VENTAS_FERRETERIA_PROMPT`).
- [x] 2.2 Crear el prompt del agente de inventario (`INVENTARIO_PROMPT`).
- [x] 2.3 Implementar el nodo `ventas_ferreteria_agent` en el grafo LangGraph, bindeando las herramientas MCP.
- [x] 2.4 Implementar el nodo `inventario_agent` en el grafo LangGraph, bindeando las herramientas MCP.

## 3. Actualización del Flujo
- [x] 3.1 Actualizar el prompt del supervisor (`SUPERVISOR_PROMPT`) para que rutee consultas comerciales a `ventas` y consultas de stock/logística a `inventario`.
- [x] 3.2 Actualizar la función `supervisor_decision` y el ruteo del grafo para incluir los nuevos nodos y caminos (`ventas_ferreteria_agent` e `inventario_agent`).
- [x] 3.3 Validar que el nodo `tools` pueda ejecutar correctamente las herramientas del cliente MCP y devolver el control al agente correspondiente.

## 4. Pruebas y Validación
- [ ] 4.1 Ejecutar consultas de prueba relacionadas a precios y recomendaciones para verificar ruteo a Ventas y conexión SQL.
- [ ] 4.2 Ejecutar consultas de prueba relacionadas a stock para verificar ruteo a Inventario y conexión SQL.
