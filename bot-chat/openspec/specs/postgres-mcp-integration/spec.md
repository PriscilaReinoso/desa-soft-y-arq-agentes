# postgres-mcp-integration Specification

## Purpose
Integración con base de datos PostgreSQL mediante MCP para proveer a los agentes de datos reales de la ferretería.

## Requirements

### Requirement: Conexión a Base de Datos
El sistema MUST conectar los agentes al servidor MCP que interactúa con PostgreSQL para acceder a las tablas de productos, inventario y ventas.

#### Scenario: Ejecución de consulta MCP
- **WHEN** un agente invoca una herramienta MCP para buscar productos
- **THEN** el servidor MCP ejecuta la consulta en PostgreSQL y devuelve los resultados al agente
