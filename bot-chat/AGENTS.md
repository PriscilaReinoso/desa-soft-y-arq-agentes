# AGENTS.md

Instrucciones globales para los agentes de opencode en agente/bot chat del
**Sistema de Gestión de Inventario para Ferretería**.

## Descripción del proyecto

Este proyecto implementa un agente de consultar para consultar información del sistema de gestión de inventario de una ferreteria. No tiene acceso a la base de datos, y la informacion la toma de MCP Server que instancia como proceso hijo.

- Se comunica con el MCP sobre STDIO.
- No accede directamente a PostgreSQL.
- Expone una API para mantener un chat en el frontend.
- Permite consultas sobre productos, proveedores, stock y demás información que dispongan las tools del MCP.

## Stack tecnológico

- Python 3.12, Langgraph y Langchain
- Pytest para pruebas.
- Docker para contenerización.

## Estructura del proyecto

```
app/
  api.py              # Punto de entrada de consultas.
  agent/                 # instancia del agente y subagentes
  services/                 # Logica de negocio reutilizable
conversaciones/        # Registro de conversacion contra el agente (no versionar)
tests/                 # Pruebas unitarias e integración con pytest.
.env                   # Variables de entorno para desarrollo (no versionar).
.env.example           # Ejemplo de variables de entorno requeridas.
README.md              # Documentación del proyecto e instrucciones de instalación.

```

## Convenciones

- Ejecuta el MCP server como proceso hijo.
- Comentarios solo cuando aportan valor; no repetir el código.
- Mantener cada archivo con una única responsabilidad.
- No escribir secretos en código ni en archivos versionados; usar variables
  de entorno.

## Arquitectura

La aplicación sigue una arquitectura por capas:

Bot-Chat
    ↓
Comunicacion STDIO (RPC)
    ↓
MCP Server (Proceso hijo del bot chat)
    ↓
SQL / pgvector
    ↓
PostgreSQL

## Seguridad

- No permitir al agente enviar consultas SQL de formar arbitraria al MCP
- No exponer contraseñas y/o datos sensibles
- No dar informacion que no este relacionada al sistema de gestion de inventario