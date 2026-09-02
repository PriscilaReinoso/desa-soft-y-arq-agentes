## Why

La base de datos de la ferretería arranca vacía de datos de catálogo (categorías, medios de pago, medidas y artículos), por lo que las búsquedas y consultas del MCP Server no tienen contenido real sobre el que operar. Se necesita una precarga de datos base, idempotente y ejecutable desde el arranque del stack, para que el sistema disponga de un catálogo inicial con el que trabajar y probar.

## What Changes

- Carga inicial idempotente en `init.sql` (raíz del repo) de las **7 categorías** definidas en el issue.
- Carga inicial de los **3 medios de pago** (Tarjeta Débito/Crédito, Transferencia, Efectivo).
- Precarga del **set completo de medidas**: todas las combinaciones conocidas de `unidad_medida` × `medida` (unidad, kg, g, ml, lts, mt, mm, cm, pulgadas, cc con valores 1, 1/2, 1/4, 1/8, 1/3, 3/4).
- Carga de los **artículos** listados en el issue, cada uno con su `nombre` y `descripcion`, asociado a su categoría correspondiente.
- Creación de una fila en `inventario` por cada artículo, vinculada a su **medida definida**, con `stock` y `precio_venta` aleatorios (intencionalmente incluyendo algunos stocks bajos) y `minimo_stock`.
- Todos los `INSERT` usan `ON CONFLICT DO NOTHING` (idempotentes) y resuelven las claves foráneas por nombre con subconsultas `SELECT`.

## Capabilities

### New Capabilities
- `seed-catalogo-inicial`: Precarga de datos base del catálogo (categorías, medios de pago, medidas, artículos y su inventario inicial) de forma idempotente desde `init.sql`, garantizando que el esquema gestionado por alembic quede poblado con datos iniciales al levantar el stack.

### Modified Capabilities
*(Ninguna)*

## Impact

- **Código**: solo el archivo `init.sql` de la raíz del repo (`desa-soft-y-arq-agentes/init.sql`) se ve modificado (sección de datos base de catálogo, manteniendo la carga idempotente existente de roles/usuario y de la infraestructura de búsqueda semántica).
- **Base de datos**: se insertan filas en las tablas `categoria`, `metodo_pago`, `medida`, `articulo` e `inventario`. No hay cambios de esquema (las tablas las crea alembic).
- **Dependencias**: ninguna nueva.
- **Docker**: sin cambios; `init.sql` ya se ejecuta desde el servicio `migrate` tras `alembic upgrade head`.
- **Referencia**: IF-35 — https://reinoso-yesica-priscila.atlassian.net/browse/IF-35
