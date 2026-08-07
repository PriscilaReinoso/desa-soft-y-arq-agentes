## Context

Ver proposal.md - Why. El sistema autentica por `email`; se agrega `username`
como nuevo identificador de login manteniendo `email` como campo existente. El
token JWT se emite con `sub` = id del usuario, por lo que el mecanismo de
token no cambia.

## Goals / Non-Goals

**Goals:**
- Agregar `username` como campo único del usuario, manteniendo `email` intacto.
- El login autentica por `username` + `password`.
- El CRUD de usuarios recibe y expone `username` además de `email`.

**Non-Goals:**
- No eliminar ni renombrar la columna `email`.
- No cambiar el mecanismo JWT ni las claims del token.

## Decisions

- **Columna `username` (String(50), unique, nullable=False)** agregada junto a
  `email` (que permanece como String(255) único). La unicidad de `username` es
  case-insensitive vía normalización a minúsculas en el servicio.
- **Normalización a minúsculas** al crear/actualizar `username` (igual que
  `email`) para unicidad estable.
- **`get_by_username`** agregado al repositorio de usuarios (se mantiene
  `get_by_email`); el servicio de login busca por `username`.
- **Migración Alembic** que solo agrega la columna `username`, su índice y
  constraint única; no toca `email`.
- **Schemas**: `LoginRequest` pasa a `username: str`; `UsuarioAuthOut`,
  `UsuarioCreate`, `UsuarioUpdate` y `UsuarioOut` agregan `username` manteniendo
  `email`.

## Risks / Trade-offs

- [Usuarios existentes no tienen username en producción] → La migración inicial
  puede poblarlos con un valor derivado (p. ej. el `email` completo) en un paso
  de backfill; en desarrollo no hay datos y el impacto es nulo.
- [Login deja de aceptar email] → Cambio intencional del contrato de login;
  los clients existentes deben actualizar el payload. El CRUD mantiene `email`.
