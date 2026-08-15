## Context

El proyecto requiere la creación de un servidor MCP en Python que interactúe con una base de datos PostgreSQL en Docker Compose para consultar datos de inventario de ferretería. Ver `proposal.md` para la motivación y capacidades.

## Goals / Non-Goals

**Goals:**
- Implementar un servidor MCP funcional en Python con `FastMCP` y `psycopg` (v3 with pool).
- Exponer 5 herramientas MCP para consultas de productos, stock, categorías y historial de movimientos.
- Garantizar manejo de errores robusto (`isError: true` en el payload) conforme a las reglas de `AGENTS.md`.
- Mantener la base de datos PostgreSQL aislada en Docker Compose con datos de prueba cargados mediante `docker/init.sql`.
- Configurar la integración en `mcp_config.json`.

**Non-Goals:**
- Operaciones de modificación de inventario (mutaciones de escritura como INSERT/UPDATE/DELETE de productos).
- Autenticación o control de acceso basado en roles (RBAC) en la capa MCP para esta fase inicial.
- Migraciones complejas de base de datos con Alembic/ORM.

## Decisions

### Decision 1: Uso de Python con `FastMCP` y `psycopg` (v3)
- **Opción elegida:** Python 3.11 + `FastMCP` + `psycopg[binary,pool]`.
- **Justificación:** Se adecúa al stack preconfigurado en `requirements.txt`. `FastMCP` proporciona una API declarativa basada en decoradores `@mcp.tool()` con generación automática de schemas a partir de Type Hints y Docstrings.
- **Alternativas consideradas:** SDK de TypeScript (Node.js). Se descartó por contar con las dependencias Python ya inicializadas y requerir menos boilerplate para integración con PostgreSQL.

### Decision 2: Pool de Conexiones a PostgreSQL
- **Opción elegida:** Manejo de conexiones mediante `psycopg_pool.ConnectionPool`.
- **Justificación:** Permite reutilizar conexiones entre invocaciones de herramientas MCP, garantizando alta performance y evitando la saturación de conexiones en PostgreSQL.
- **Alternativas consideradas:** Conexión única persistente o crear/cerrar conexión por cada consulta. La conexión única puede romperse si la BD se reinicia; crear/cerrar por request agrega overhead inasumible.

### Decision 3: Control de Errores e Resiliencia MCP
- **Opción elegida:** Capturar `psycopg.Error` en los handlers de las herramientas MCP y retornar respuestas estructuradas o mensajes de error sin colapsar el proceso del servidor (cumpliendo con `AGENTS.md`).
- **Justificación:** Si PostgreSQL no está levantado (`docker compose up -d` no ejecutado), el servidor MCP responderá con una sugerencia de diagnóstico clara en lugar de fallar de manera no controlada.

### Decision 4: Definición del Nombre de Herramientas en `snake_case`
- **Herramientas a implementar:**
  1. `search_products(query: str = "", category_id: int | None = None, limit: int = 20)`
  2. `get_product_details(product_id: int | None = None, sku: str | None = None)`
  3. `check_low_stock()`
  4. `list_categories()`
  5. `get_stock_movements(product_id: int, limit: int = 20)`

## Risks / Trade-offs

- **[Riesgo: PostgreSQL no iniciado]** → **Mitigación:** En cada tool, si falla la conexión a la base de datos, retornar un mensaje de error descriptivo indicando al usuario/agente que inicie el contenedor con `docker compose up -d`.
- **[Riesgo: Conflicto de puerto 5432]** → **Mitigación:** Utilizar variables de entorno en `.env` (`POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`) con valores por defecto resueltos mediante `python-dotenv`.
