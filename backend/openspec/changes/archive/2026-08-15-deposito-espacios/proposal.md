## Why

El frontend necesita gestionar los espacios de un depósito al editarlo, pero `GET /api/v1/depositos/{id}` hoy devuelve solo `cantidad_espacios` (contador) y no la lista de espacios. Sin esa lista el frontend no puede listar, modificar ni eliminar los espacios existentes desde el modal de edición de un depósito.

## What Changes

- `GET /api/v1/depositos/{id}` pasa a devolver la lista de espacios no eliminados del depósito mediante un nuevo esquema de detalle `DepositoDetalleOut`.
- El listado (`GET /api/v1/depositos`) y el resto de endpoints del CRUD de depósitos no cambian: siguen respondiendo `DepositoOut`, sin inflar la respuesta.

## Capabilities

### New Capabilities

- (ninguna)

### Modified Capabilities

- `depositos`: el requisito "Obtener depósito por id" cambia para incluir la lista de espacios no eliminados del depósito.

## Impact

- `app/schemas/deposito.py`: nuevo esquema `DepositoDetalleOut(DepositoOut)` con `espacios: list[EspacioOut]`.
- `app/api/v1/depositos.py`: `GET /{deposito_id}` usa `DepositoDetalleOut` y excluye de la response los espacios con `deleted_at` no nulo.
- `app/services/deposito_service.py`: sin cambios de lógica; el filtrado se aplica al serializar el detalle.
- Sin migraciones: no cambia el esquema de base de datos (se reutiliza la relationship `Deposito.espacios`).
- Tests: pytest del detalle con espacios, sin espacios y exclusión de espacios eliminados.
