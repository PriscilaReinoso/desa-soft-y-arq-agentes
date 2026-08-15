## Context

`DepositoOut` responde solo `id`, `nombre`, `descripcion`, `direccion` y `cantidad_espacios` (contador mantenido por el service de espacios). El modelo `Deposito` ya tiene la relationship `espacios` (1:N) y el esquema `EspacioOut` ya existe con `from_attributes=True` (`app/schemas/espacio.py`). El frontend necesita la lista de espacios para gestionarlos al editar un depósito.

## Goals / Non-Goals

**Goals:**
- Exponer la lista de espacios no eliminados en el detalle del depósito.
- Mantener el listado de depósitos liviano (sin espacios).

**Non-Goals:**
- No cambiar el listado ni los endpoints de creación/actualización/baja de depósitos.
- No migrar la base de datos.
- No tocar el frontend (depende del change `depositos-datos-api`).

## Decisions

- **Nuevo esquema `DepositoDetalleOut(DepositoOut)`** con `espacios: list[EspacioOut] = []`: hereda los campos de `DepositoOut` (incluido `from_attributes` vía `ConfigDict`) y agrega la lista.
- **Solo el detalle incluye espacios**: `GET ""` (listado) y POST/PUT siguen usando `DepositoOut` para no inflar el listado ni las respuestas de escritura.
- **Filtrar espacios eliminados al serializar**: la relationship `Deposito.espacios` no filtra por sí sola los `deleted_at` no nulos. En `GET /{deposito_id}` se reemplaza la colección en memoria por `[e for e in deposito.espacios if e.deleted_at is None]` antes de devolver el objeto; no se persiste (no hay flush), por lo que no altera el estado real.

## Risks / Trade-offs

- [Mutar la colección del objeto ORM es frágil si la instancia se reusa] → El filtrado se aplica únicamente en el endpoint de detalle y no se persiste.
- [Pydantic v2 valida listas de ORM anidadas] → `EspacioOut` ya tiene `from_attributes=True`, por lo que la lista de `Espacio` se serializa correctamente dentro de `DepositoDetalleOut`.
