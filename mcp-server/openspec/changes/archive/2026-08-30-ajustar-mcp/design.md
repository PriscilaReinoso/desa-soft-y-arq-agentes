## Context

El servidor MCP de inventario fue implementado originalmente con el código en
`src/` (`src/server.py`, `src/db.py`), pero `AGENTS.md` declara una estructura
por capas `app/` (`core/`, `tools/`, `services/`). Al mismo tiempo, las tools
reflejan el esquema inicial definido en `docker/init.sql`. Ver `proposal.md - Why`
para la motivación.

## Goals / Non-Goals

**Goals:**
- Reorganizar el código hacia la estructura `app/` declarada en `AGENTS.md`.
- Verificar y ajustar las tools para que consulten exactamente las tablas y
  columnas del esquema real (`categories`, `suppliers`, `products`,
  `stock_movements`).
- Mantener intacto el contrato público de cada tool (nombre y parámetros).

**Non-Goals:**
- No modificar el esquema de base de datos ni los datos.
- No agregar nuevos requerimientos de inventario fuera del alcance del issue.
- No cambiar el mecanismo de transporte MCP (STDIO).

## Decisions

- **Estructura `app/` según `AGENTS.md`:** se mueve el código a
  `app/server.py`, `app/core/` (config + database), `app/tools/` (registro de
  tools) y `app/services/` (lógica reutilizable). Alternativa considerada:
  mantener `src/` y actualizar `AGENTS.md`; se descartó porque `AGENTS.md` es
  la convención canónica del proyecto y el issue pide alinear el código a ella.
- **Capa `core` para conexión y configuración:** se reutiliza la lógica de
  `src/db.py` moviéndola a `app/core/database.py` y se extrae la lectura de
  variables de entorno a `app/core/config.py`. Cada tool usa
  `app/core/database.execute_query` en lugar de construir conexiones.
- **Ajuste de tools al esquema real:** las consultas se alinean a las columnas
  verificadas en `docker/init.sql`. Se documenta el esquema en
  `docs/db_schema.md` como fuente de verdad para futuras tools.
- **Imports relativos dentro del paquete `app`:** se usa el prefijo `app.`
  para importar módulos del servidor, manteniendo compatibilidad con el punto
  de entrada y los tests.

## Risks / Trade-offs

- [Riesgo de romper imports/tests al mover archivos] → Actualizar todas las
  rutas de importación y ejecutar la suite de pytest al finalizar.
- [Diferencia entre el esquema real y lo que asumen las tools] → Contrastar
  cada consulta contra `docker/init.sql` y documentar el esquema en
  `docs/db_schema.md`.
- [Cambio de rutas sin cambio de comportamiento] → Se valida que el
  comportamiento observado de las tools no varíe (mismos parámetros y
  respuestas).
