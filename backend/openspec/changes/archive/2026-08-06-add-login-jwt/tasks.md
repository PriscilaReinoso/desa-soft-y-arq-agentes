## 1. Dependencias y configuración

- [x] 1.1 Agregar `PyJWT` a `requirements.txt` e instalarlo en el entorno
- [x] 1.2 Agregar `JWT_SECRET`, `JWT_ALGORITHM` y `JWT_EXPIRES_MINUTES` a `app/core/config.py` (defaults: HS256, 30 minutos; fallback de desarrollo para el secreto)
- [x] 1.3 Documentar las nuevas variables en `.env.example` y setear `JWT_SECRET` en `.env`

## 2. Seguridad y errores

- [x] 2.1 Implementar `verify_password(password, stored)` en `app/core/security.py` (parseo `salt$digest`, comparación en tiempo constante)
- [x] 2.2 Implementar `create_access_token(usuario)` y `decode_token(token)` en `app/core/security.py` (payload `sub`, `role`, `iat`, `exp`)
- [x] 2.3 Agregar `UnauthorizedError` (401) y `ForbiddenError` (403) en `app/exceptions/base.py`

## 3. Dependencias de autenticación

- [x] 3.1 Crear `app/core/dependencies.py` con `get_current_usuario` (HTTPBearer auto_error=False, decodifica token, valida usuario activo y no eliminado)
- [x] 3.2 Crear el factory `require_roles(*roles)` en `app/core/dependencies.py` (responde 403 si el rol no está permitido)

## 4. Login

- [x] 4.1 Crear `app/schemas/auth.py` con `LoginRequest` (email, password) y `LoginResponse` (access_token, token_type, expires_in, usuario)
- [x] 4.2 Crear `app/services/auth_service.py` con `authenticate(email, password)` (valida usuario activo/no eliminado y credenciales; emite token)
- [x] 4.3 Crear `app/api/v1/auth.py` con `POST /login` público
- [x] 4.4 Registrar el router de auth en `app/main.py`

## 5. Protección de endpoints (objetivo principal)

- [x] 5.1 Proteger el router `app/api/v1/roles.py` (auth a nivel router; `require_roles("ADMIN")` en POST/PUT/DELETE)
- [x] 5.2 Proteger el router `app/api/v1/usuarios.py` (auth a nivel router; `require_roles("ADMIN")` en POST/PUT/DELETE)

## 6. Tests

- [x] 6.1 Actualizar `tests/conftest.py` con helpers de auth (crear rol/usuario y obtener header Bearer vía login)
- [x] 6.2 Actualizar `tests/test_rol.py` y `tests/test_usuario.py` agregando el header de autenticación
- [x] 6.3 Crear `tests/test_auth.py`: login exitoso, credenciales inválidas, usuario inactivo/eliminado, datos incompletos, acceso sin/inválido/expirado token, autorización ADMIN vs CONSULTOR
- [x] 6.4 Ejecutar `pytest` completo y corregir fallos
