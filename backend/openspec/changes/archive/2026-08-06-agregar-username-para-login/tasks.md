## 1. Modelo y migración

- [x] 1.1 Agregar la columna `username` (String(50), unique, nullable=False) en `app/models/usuario.py`, manteniendo `email`
- [x] 1.2 Crear migración Alembic que agrega `username` (con backfill desde `email`) e índice/constraint única sobre `username`
- [x] 1.3 Actualizar `docs/db_schema.md` agregando `username` a la tabla `usuario`

## 2. Schemas

- [x] 2.1 En `app/schemas/auth.py`: `LoginRequest` con `username: str`; `UsuarioAuthOut` con `username` (manteniendo `email`)
- [x] 2.2 En `app/schemas/usuario.py`: `UsuarioCreate`, `UsuarioUpdate` y `UsuarioOut` con `username` además de `email`

## 3. Repositorio y servicios

- [x] 3.1 Agregar `get_by_username` en `app/repositories/usuario_repository.py`
- [x] 3.2 En `app/services/auth_service.py`: autenticar por `username` (normalizado a minúsculas)
- [x] 3.3 En `app/services/usuario_service.py`: crear/actualizar con `username` (validación de unicidad) manteniendo `email`

## 4. API y tests

- [x] 4.1 Actualizar `app/api/v1/auth.py` para enviar `username` al servicio de login
- [x] 4.2 Actualizar `tests/conftest.py` (crear usuarios con username; login por username)
- [x] 4.3 Actualizar `tests/test_auth.py` y `tests/test_usuario.py` con username
- [x] 4.4 Ejecutar `pytest` completo y corregir fallos
