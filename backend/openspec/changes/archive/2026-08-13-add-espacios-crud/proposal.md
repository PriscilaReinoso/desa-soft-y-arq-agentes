## Why

Los artículos del inventario se ubican físicamente en espacios dentro de un
depósito (estantería, mostrador, etc.). Para registrar esa ubicación el
sistema necesita administrar espacios, que siempre pertenecen a un depósito,
según la entidad `espacio` de `docs/db_schema.md`.

## What Changes

- Crear el modelo `Espacio` (tabla `espacio`) con `tipo`, `descripcion`,
  `deposito_id` FK y las dimensiones `max_fila` y `max_columna`, más
  timestamps de auditoría (`created_at`, `updated_at`, `deleted_at`).
- Crear la relación bidireccional `Espacio.deposito` (N:1) y
  `Deposito.espacios` (1:N).
- Implementar la capa completa por responsabilidad: Router → Service →
  Repository → SQLAlchemy, modelo en singular.
- Endpoints REST en `api/v1/espacios` (listar, crear, obtener por id,
  actualizar, baja lógica).
- Un espacio SHALL pertenecer a un depósito existente; al crear o eliminar un
  espacio se mantiene sincronizado `deposito.cantidad_espacios`.
- Borrado lógico vía `deleted_at`; las listas excluyen registros eliminados.
- Migración Alembic que materializa la tabla `espacio`.
- Pruebas con pytest para el CRUD de espacios.

## Capabilities

### New Capabilities
- `espacios-crud`: CRUD completo de la entidad espacio (listado, detalle,
  alta, actualización y baja lógica) con validación del depósito padre y
  sincronización de `cantidad_espacios`.

### Modified Capabilities

## Impact

- Código: `app/models/espacio.py`, nuevos `repositories/`, `services/`,
  `schemas/` y `app/api/v1/espacios.py`, registro en `app/main.py`.
- Base de datos: nueva tabla `espacio` (migración Alembic).
- Seguridad: los endpoints requieren JWT; alta y modificación restringidas a
  `ADMIN`.
- Pruebas: nueva suite de tests para el CRUD de espacios.
