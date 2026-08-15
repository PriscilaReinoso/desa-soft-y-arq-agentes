## Why

El inventario necesita registrar dos valores adicionales por ítem: el stock mínimo
a partir del cual conviene volver a pedir (`minimo_stock`) y la unidad de medida
que rige el precio de venta (`medida_venta`, p. ej. "precio por metro"). Hoy
ninguno de los dos existe, por lo que no se puede decidir reposición ni expresar
el precio de venta en su unidad correspondiente.

## What Changes

- `inventario` incorpora `minimo_stock` (INTEGER NOT NULL DEFAULT 0, `>= 0`) y
  `medida_venta_id` (UUID nullable, FK a `medida.id`).
- El CRUD de inventario (`POST`, `GET`, `PUT`) acepta y devuelve los nuevos
  valores: los request reciben `minimo_stock` (opcional, default 0) y
  `medida_venta_id` (opcional); las respuestas incluyen `minimo_stock` y el
  objeto anidado `medida_venta` (puede ser `null`).
- El alta compuesta (`POST /inventarios/alta`) acepta opcionalmente
  `medida_venta_id` referenciando una medida existente (sin crear medida nueva).
- Nueva migración Alembic. Sin cambios en `docs/db_schema.md` (ya documenta los
  campos).

## Capabilities

### New Capabilities

- (ninguna)

### Modified Capabilities

- `inventarios-crud`: los requisitos de listar, crear, obtener y actualizar
  incorporan `minimo_stock` y `medida_venta`.
- `alta-inventario`: el requisito de alta compuesta acepta `medida_venta_id`
  opcional.

## Impact

- `app/models/inventario.py`: columnas `minimo_stock` y `medida_venta_id`,
  relationship `medida_venta`, CHECK `minimo_stock >= 0`; se desambiguan las
  dos FKs a `medida`.
- `app/models/medida.py`: relationship `inventarios_venta` con `foreign_keys`.
- Nueva migración Alembic sobre `inventario`.
- `app/schemas/inventario.py`: `InventarioCreate`, `InventarioUpdate` e
  `InventarioOut` con los nuevos campos.
- `app/schemas/alta_inventario.py`: `InventarioAlta` con `minimo_stock` y
  `medida_venta_id`.
- `app/services/inventario_service.py`: validación de `medida_venta_id` y
  aplicación de los nuevos campos en create/update.
- `app/services/alta_inventario_service.py`: validación de `medida_venta_id`
  dentro de la transacción (mantiene rollback).
- `app/repositories/inventario_repository.py`: eager-load de `medida_venta`.
- Tests de CRUD y alta de inventario.
