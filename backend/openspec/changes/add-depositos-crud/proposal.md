## Why

El sistema debe conocer el espacio físico donde se almacena el stock. Los
depósitos agrupan los espacios de almacenamiento, por lo que se necesita un
CRUD de depósitos según la entidad `deposito` de `docs/db_schema.md`.

## What Changes

- Crear el modelo `Deposito` (tabla `deposito`) con `nombre`, `descripcion`,
  `direccion` y `cantidad_espacios` (por defecto 0) y timestamps de auditoría
  (`created_at`, `updated_at`, `deleted_at`).
- Implementar la capa completa por responsabilidad: Router → Service →
  Repository → SQLAlchemy, modelo en singular, con relación `1:N` a espacio.
- Endpoints REST en `api/v1/depositos` (listar, crear, obtener por id,
  actualizar, baja lógica).
- Borrado lógico vía `deleted_at`; las listas excluyen registros eliminados.
- Migración Alembic que materializa la tabla `deposito`.
- Pruebas con pytest para el CRUD de depósitos.

## Capabilities

### New Capabilities
- `depositos-crud`: CRUD completo de la entidad depósito (listado, detalle,
  alta, actualización y baja lógica).

### Modified Capabilities

## Impact

- Código: `app/models/deposito.py`, nuevos `repositories/`, `services/`,
  `schemas/` y `app/api/v1/depositos.py`, registro en `app/main.py`.
- Base de datos: nueva tabla `deposito` (migración Alembic).
- Seguridad: los endpoints requieren JWT; alta y modificación restringidas a
  `ADMIN`.
- Pruebas: nueva suite de tests para el CRUD de depósitos.
