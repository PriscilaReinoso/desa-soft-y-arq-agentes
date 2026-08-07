## Why

El login actual autentica por `email` + `password`, pero el dominio requiere
identificar a los usuarios por un `username` corto y amigable. Se agrega el
campo `username` al usuario —manteniendo `email`— y el login pasa a autenticar
por `username`.

## What Changes

- Se agrega la columna `username` (única, no nullable) a la tabla `usuario`;
  `email` se mantiene intacto.
- El login (`POST /api/v1/auth/login`) pasa a recibir `username` + `password`
  en lugar de `email` + `password`.
- El CRUD de usuarios pasa a recibir y exponer `username` (crear, listar,
  obtener, actualizar), con validación de unicidad sobre `username`. `email`
  se mantiene como campo obligatorio en creación.
- Las respuestas de usuario y de login exponen `username` además de `email`.
- Se agrega una migración Alembic que crea la columna `username` y su índice
  único.

## Capabilities

### New Capabilities

- Ninguna: el cambio modifica el comportamiento de capacidades existentes.

### Modified Capabilities

- `auth`: el endpoint `POST /api/v1/auth/login` autentica al usuario por
  `username` + `password` en lugar de `email` + `password`; la respuesta de
  login expone `username` además de `email`.
- `usuario-crud`: el CRUD de usuarios pasa a recibir y exponer `username` como
  campo adicional (crear, listar, obtener, actualizar y baja), manteniendo
  `email`.

## Impact

- `app/models/usuario.py`: nueva columna `username` (única).
- Nueva migración en `alembic/versions/` (creación de columna e índice
  `username`; `email` no cambia).
- `app/schemas/auth.py` (`LoginRequest`, `UsuarioAuthOut`), `app/schemas/usuario.py`
  (`UsuarioCreate`, `UsuarioUpdate`, `UsuarioOut`).
- `app/repositories/usuario_repository.py`: se agrega `get_by_username`.
- `app/services/auth_service.py`, `app/services/usuario_service.py`.
- `app/api/v1/auth.py` (payload de login).
- `tests/`: `conftest.py`, `test_auth.py`, `test_usuario.py`.
- `docs/db_schema.md`: agregar `username` a la definición de la tabla `usuario`.
