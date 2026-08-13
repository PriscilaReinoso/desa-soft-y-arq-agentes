## Why

El inventario es la información central de consulta sobre los productos a la
venta: asocia un artículo, su medida, el stock, el precio de venta y su
ubicación física. Se necesita un CRUD que permita administrar estas
variantes, según la entidad `inventario` de `docs/db_schema.md`.

## What Changes

- Crear el modelo `Inventario` (tabla `inventario`) con `articulo_id`,
  `medida_id`, `espacio_id` (nullable), `fila`, `columna`, `stock` y
  `precio_venta`, más timestamps de auditoría.
- Constraint `UNIQUE(articulo_id, medida_id)` y checks `stock >= 0` y
  `precio_venta >= 0`.
- Implementar la capa completa por responsabilidad: Router → Service →
  Repository → SQLAlchemy, con relaciones bidireccionales hacia `articulo`,
  `medida` y `espacio`.
- Endpoints REST en `api/v1/inventario` (listar, crear, obtener por id,
  actualizar, baja lógica).
- Reglas de negocio:
  - `fila` y `columna` SHALL ser `>= 0` cuando se define una ubicación.
  - `stock` y `precio_venta` SHALL ser `>= 0`.
  - `espacio_id` puede ser `null` únicamente si `stock == 0`.
  - La combinación artículo + medida es única (HTTP 409 en duplicados).
- Borrado lógico vía `deleted_at`; las listas excluyen registros eliminados.
- Migración Alembic que materializa la tabla `inventario`.
- Pruebas con pytest para el CRUD de inventario.

## Capabilities

### New Capabilities
- `inventarios-crud`: CRUD completo de la entidad inventario (listado,
  detalle, alta, actualización y baja lógica) con validación de reglas de
  stock, precio, ubicación y unicidad de artículo + medida.

### Modified Capabilities

## Impact

- Código: `app/models/inventario.py`, nuevos `repositories/`, `services/`,
  `schemas/` y `app/api/v1/inventario.py`, registro en `app/main.py`.
- Base de datos: nueva tabla `inventario` (migración Alembic).
- Seguridad: los endpoints requieren JWT; alta y modificación restringidas a
  `ADMIN`.
- Pruebas: nueva suite de tests para el CRUD de inventario.
