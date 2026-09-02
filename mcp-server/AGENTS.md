# AGENTS.md

Instrucciones globales para los agentes de opencode en el mcp-server del
**Sistema de Gestión de Inventario para Ferretería**.

## Descripción del proyecto

Este proyecto implementa un MCP Server encargado de proporcionar al agente de IA herramientas (tools) para consultar información del sistema de gestión de inventario de una ferreteria.

- Se comunica con el agente mediante MCP sobre STDIO.
- Accede directamente a PostgreSQL.
- Expone únicamente operaciones controladas y definidas como MCP tools.
- Permite consultas sobre productos, proveedores, stock y demás información del inventario.
- Puede utilizar pgvector para búsquedas semánticas cuando corresponda.

## Stack tecnológico

- Python 3.12, Fast MCP
- PostgreSQL con pgvector (búsqueda semántica del asistente).
- Pytest para pruebas.

## Estructura del proyecto

```
app/
  server.py              # Punto de entrada de MCP.
  core/
    config.py          # Configuración de la aplicación y variables de entorno.
    database.py        # Configuración del sesiones y conexión a PostgreSQL.
  tools/                 # Herramientas MCP
  services/                 # Logica de negocio reutilizable
tests/                 # Pruebas unitarias e integración con pytest.
.env                   # Variables de entorno para desarrollo (no versionar).
.env.example           # Ejemplo de variables de entorno requeridas.
docs/
  de_schama.md             # Documentacion del esquema de la base de datos
README.md              # Documentación del proyecto e instrucciones de instalación.

```

## Convenciones

- Utizar snake_case para las tools.
- Nombres descriptivos en de las tools en español; descripcion de la tool en español:
- Esquema de bases de datos dentro de docs/db_schemma.md
- Comentarios solo cuando aportan valor; no repetir el código.
- Mantener cada archivo con una única responsabilidad.
- No escribir secretos en código ni en archivos versionados; usar variables
  de entorno.

## Arquitectura

La aplicación sigue una arquitectura por capas:

Bot-Chat
    ↓
Comunicacion STDIO
    ↓
MCP Server (Proceso hijo del bot chat)
    ↓
SQL / pgvector
    ↓
PostgreSQL

## Seguridad

- No exponer tools que permitan al agente enviar consultas SQL de formar arbitraria al MCP
- No exponer contraseñas y/o datos sensibles