## Why

Cada artículo se vende bajo distintas medidas (por ejemplo: "caño 1/2 pulgada"
y "caño 3/4 pulgada"). El inventario y las listas de precios combinan
artículo + medida, por lo que el sistema necesita poder administrar las
medidas de forma independiente, según la entidad `medida` de
`docs/db_schema.md`.

## What Changes

- Crear el modelo `Medida` (tabla `medida`) con `unidad_medida` y `medida`,
  con constraint `UNIQUE(unidad_medida, medida)` y timestamps de auditoría
  (`created_at`, `updated_at`, `deleted_at`).
- Implementar la capa completa por responsabilidad: Router → Service →
  Repository → SQLAlchemy, modelo en singular.
- Endpoints REST en `api/v1/medidas` (listar, crear, obtener por id,
  actualizar, baja lógica).
- Borrado lógico vía `deleted_at`; las listas excluyen registros eliminados.
- Migración Alembic que materializa la tabla `medida`.
- Pruebas con pytest para el CRUD de medidas.

## Capabilities

### New Capabilities
- `medidas-crud`: CRUD completo de la entidad medida (listado, detalle, alta,
  actualización y baja lógica) con unicidad de la combinación
  `unidad_medida` + `medida`.

### Modified Capabilities

## Impact

- Código: `app/models/medida.py`, nuevos `repositories/`, `services/`,
  `schemas/` y `app/api/v1/medidas.py`, registro en `app/main.py`.
- Base de datos: nueva tabla `medida` (migración Alembic).
- Seguridad: los endpoints requieren JWT; alta y modificación restringidas a
  `ADMIN`.
- Pruebas: nueva suite de tests para el CRUD de medidas.
