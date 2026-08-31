## Why

Actualmente no hay una especialización clara para los agentes del bot conversacional que atienda las necesidades específicas de una ferretería, como ventas y gestión de inventario, ni una conexión a los datos reales. Se requiere dotar de roles definidos a los agentes y conectarlos a la base de datos para proveer respuestas útiles y precisas a los usuarios (clientes y administradores).

## What Changes

- Creación/Configuración de un Agente Especialista en Ventas (para atención al cliente de la ferretería, recomendaciones, etc.).
- Creación/Configuración de un Agente Experto en Inventario/Stock (para consultas de disponibilidad, ingresos, egresos de mercadería).
- Integración con PostgreSQL mediante un servidor MCP (Model Context Protocol) para que ambos agentes puedan consultar datos reales (productos, precios, stock, ventas).

## Capabilities

### New Capabilities
- `sales-agent`: Define el comportamiento y herramientas del agente especializado en ventas.
- `inventory-agent`: Define el comportamiento y herramientas del agente experto en inventario.
- `postgres-mcp-integration`: Define la conexión y las consultas permitidas a la base de datos PostgreSQL mediante MCP.

### Modified Capabilities


## Impact

- Modificación del flujo principal de agentes para incluir los dos nuevos roles.
- Requerirá configuración de credenciales de la base de datos PostgreSQL y la implementación/despliegue del servidor MCP.
- Impacta en la forma en que el bot responde y rutea las solicitudes del usuario (Ventas vs Inventario).
