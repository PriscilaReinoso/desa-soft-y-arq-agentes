## Context

See proposal.md - Why. El esquema de las tablas (`categoria`, `metodo_pago`, `medida`, `articulo`, `inventario`) lo crea exclusivamente alembic; `init.sql` (raíz del repo) se ejecuta después de `alembic upgrade head` desde el servicio `migrate` del docker-compose y hoy ya contiene carga idempotente de roles/usuario y la infraestructura de búsqueda semántica. Este change agrega la sección de datos base del catálogo al final de ese mismo archivo.

## Goals / Non-Goals

**Goals:**
- Carga idempotente (`ON CONFLICT DO NOTHING`) de categorías, medios de pago, medidas, artículos y su inventario inicial.
- Resolución de claves foráneas por nombre mediante subconsultas `SELECT` (sin hardcodear UUIDs).
- Generación de `stock`/`precio_venta` aleatorios en SQL puro (sin dependencias externas) con algunos casos de stock bajo.

**Non-Goals:**
- No se modifica el esquema (ni alembic, ni DDL). Solo carga de datos.
- No se agregan dependencias nuevas (ni scripts Python ni librerías).
- No se indexan embeddings en este change (eso pertenece a `mcp-busquedas-semanticas`).

## Decisions

**1. Todo en `init.sql` con SQL puro.**
Los inserts se escriben directamente en `init.sql` mediante `VALUES ... ON CONFLICT DO NOTHING`. Alternativa descartada: un script Python de seed — agrega una dependencia de ejecución y duplica la lógica que el docker-compose ya orquesta con `init.sql`.

**2. Resolución de FKs por nombre.**
- `articulo.categoria_id` se resuelve con `(SELECT id FROM categoria WHERE nombre = '...')`.
- `inventario.medida_id` y `medida_venta_id` se resuelven con `(SELECT id FROM medida WHERE unidad_medida = '...' AND medida = '...')`.
Esto evita fijar UUIDs hardcodeados. Alternativa descartada: generarlos con `gen_random_uuid()` y capturarlos en CTEs — más verboso y dificulta leer el mapeo artículo→medida.

**3. Set completo de medidas con `INSERT ... SELECT` cruzado.**
Para poblar todas las combinaciones, se usa un `INSERT INTO medida ... SELECT gen_random_uuid(), u, v, now(), now() FROM (VALUES ...) AS unidades(u), (VALUES ...) AS valores(v) WHERE NOT EXISTS (...)` en lugar de listar cada combinación a mano. Alternativa descartada: un `INSERT ... VALUES` con las ~36 filas explícitas — propenso a errores y difícil de mantener.

**4. Stock/precio aleatorios en SQL.**
Se genera `stock` con una distribución que fuerza algunos valores bajos, p. ej. `GREATEST((random()*20)::int, floor(now())::int = 0)::int` — en la práctica se usan expresiones del tipo: para la mayoría `(random()*50)::int` y para una selección de artículos un valor entre 0 y `minimo_stock` para dejar stock bajo. `precio_venta` con `round((5 + random()*500)::numeric, 2)`. Alternativa descartada: valores fijos — no refleja la intención del issue de tener stocks bajos variados.

**5. Mapeo artículo→medida.**
Cada artículo define su medida por su presentación en el nombre (p. ej. THINER DE 1 LTRS → lts/1; AGUARRAS DE 1 LTRS → lts/1; ACIDO MURIATICO 5 LTS → lts/5; CODO ESPIGA 1/2 → p/1/2; HORMIGUICIDA X 60cc → cc/60; ALARGUES RICHI X 10MTS → mt/10; CAJA 13" → p/13; los "sin medida" → unidad/1). Se define en el manual el par (unidad_medida, medida) para cada artículo y se le pasa al `INSERT` de inventario.

**6. Descripción de artículos.**
Cada artículo se inserta con una `descripcion` breve y descriptiva en español (concordante con su categoría y presentación).

## Risks / Trade-offs

- **Alcance de las combinaciones de medida** → Al cruzar todas las unidades por todos los valores pueden quedar combinaciones poco usadas; mitigación: es idempotente y sirve de catálogo de referencia, no afecta consultas.
- **Valores aleatorios no reproducibles** → Para test/validación, el resultado exacto de stock/precio varía entre ejecuciones; mitigación: se valida por estructura (existencia, no negatividad, presencia de al menos un stock bajo), no por valores concretos.
- **Posible desincronización entre el nombre del artículo y su medida** → Mitigación: se mantiene un mapeo explícito y comentado en el archivo entre cada artículo y su (unidad_medida, medida).
- **Re-ejecución con datos ya modificados por el usuario** → `ON CONFLICT DO NOTHING` evita pisar datos existentes; la carga es solo inicial.

## Migration Plan

- **Deploy**: agregar la sección al final de `init.sql` (raíz). Al levantar el stack, `migrate` la ejecuta tras `alembic upgrade head`. En una base ya levantada, ejecutar el archivo a mano para poblar.
- **Rollback**: retirar la sección de `init.sql`; los datos cargados permanecen salvo limpieza manual (no se eliminan filas en el rollback).

## Open Questions

Ninguna.
