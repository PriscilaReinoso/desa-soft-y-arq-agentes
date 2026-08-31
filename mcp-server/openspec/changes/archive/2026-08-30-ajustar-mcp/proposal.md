## Why

El MCP Server de inventario fue desarrollado inicialmente con una estructura
de archivos que no coincide con el formato declarado en `AGENTS.md`, y las
herramientas existentes no verifican explícitamente su alineación con el
esquema real de tablas de PostgreSQL. Esto dificulta el mantenimiento, la
navegación del repositorio y genera dudas sobre qué columnas expone cada tool.
Este cambio ordena la estructura del proyecto y ajusta las tools para que
consulten exactamente el esquema definido en `docker/init.sql`.

Referencia de requerimiento: issue [[IF-31]](https://reinoso-yesica-priscila.atlassian.net/browse/IF-31) -
"Ajustar de MCP".

## What Changes

- **Reorganizar la estructura de carpetas** del servidor para alinearla al
  formato declarado en `AGENTS.md` (`app/`, `core/`, `tools/`, `services/`),
  moviendo el código hoy disperso en `src/`.
- **Ajustar las tools existentes** al esquema de tablas real de la base
  (`categories`, `suppliers`, `products`, `stock_movements`), verificando
  nombres y tipos de columnas, y corrigiendo cualquier desajuste.
- **Normalizar las tools** con nombres descriptivos en `snake_case` y
  descripciones en español, según las convenciones del proyecto.
- Mantener el acceso a la base de datos centralizado en la capa `core`.

## Capabilities

### New Capabilities

- `project-structure`: estructura de directorios del proyecto acorde a
  `AGENTS.md` (capa `app/core` para configuración y conexión, `app/tools` para
  las tools MCP y `app/services` para lógica reutilizable).

### Modified Capabilities

- `inventory-query`: las tools de consulta (`search_products`,
  `get_product_details`, `check_low_stock`, `list_categories`,
  `get_stock_movements`) se ajustan para consultar exactamente el esquema de
  tablas real (`products`, `categories`, `suppliers`, `stock_movements`) y
  quedar alojadas en la nueva estructura de carpetas.

## Impact

- **Código**: se reorganiza `src/` hacia `app/` (server, core, tools, services)
  sin cambiar el comportamiento público de las tools.
- **Base de datos**: no hay cambios de esquema; solo se verifican y ajustan las
  consultas contra el esquema ya definido en `docker/init.sql`.
- **Tests**: se actualizan las rutas de importación de los tests existentes.
- **Documentación**: `README.md` y referencias de rutas en `AGENTS.md` se
  alinean con la nueva estructura.
