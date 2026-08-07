## Why

El sistema expone endpoints de administración de roles y usuarios sin ningún
mecanismo de autenticación: cualquier cliente puede crear, modificar o eliminar
datos. El objetivo de este change es **segurizar los endpoints existentes**
exigiendo un token JWT válido en cada request, y proveer el login que emite ese
token. El login solo tiene valor si los endpoints protegidos validan un JWT
correcto en el header de autorización; sin esa validación, el login no agrega
seguridad.

## What Changes

- Se protege con autenticación JWT **todos** los endpoints existentes
  (`/api/v1/roles/*` y `/api/v1/usuarios/*`) y los futuros, excepto el login:
  cada request debe incluir un header `Authorization: Bearer <token>` válido.
- Se agrega el endpoint público `POST /api/v1/auth/login` que valida
  credenciales (email + password) y devuelve un token JWT con los datos del
  usuario autenticado. El token emitido solo es útil porque los endpoints
  protegidos exigen un JWT correcto en el header de autorización; sin esa
  validación el login no agrega seguridad.
- Se agrega verificación de contraseña compatible con el formato actual de hash
  (`salt$digest`, PBKDF2-SHA256) en `app/core/security.py`.
- Se agregan generación y decodificación de tokens JWT (HS256) con expiración
  configurable (por defecto 30 minutos).
- Se agrega autorización por rol: `ADMIN` puede leer y escribir;
  `CONSULTOR` solo lectura (GET). Acciones no permitidas responden 403.
- Se agregan los errores HTTP 401 (no autenticado) y 403 (sin permiso).
- Se agregan dependencias reutilizables en `app/core/dependencies.py` para
  obtener el usuario autenticado y validar roles.
- Se actualizan los tests existentes (agregando el header de autenticación) y
  se agregan tests de login y de protección de endpoints.

## Capabilities

### New Capabilities
- `auth`: Segurización de los endpoints existentes exigiendo un token JWT
  válido en cada request, login de usuarios que emite ese token y autorización
  por rol (ADMIN/CONSULTOR). El login solo es útil porque los endpoints
  protegidos validan un JWT correcto en el header de autorización.

### Modified Capabilities
<!-- Ninguna: los capabilities rol-crud y usuario-crud no cambian su comportamiento
     funcional, solo quedan protegidos por autenticación. -->

## Impact

- **Código**: `app/core/config.py` (settings JWT), `app/core/security.py`
  (verify_password, create/decode token), `app/core/dependencies.py` (nuevo),
  `app/exceptions/base.py` (401/403), `app/schemas/auth.py` (nuevo),
  `app/services/auth_service.py` (nuevo), `app/api/v1/auth.py` (nuevo),
  `app/main.py`, routers `app/api/v1/roles.py` y `usuarios.py`.
- **API**: nuevo endpoint `/api/v1/auth/login`; todos los demás endpoints
  requieren header `Authorization: Bearer <token>`. Cambio de contrato de la
  API: los clientes existentes deberán autenticarse (marcado como cambio
  relevante de API, sin cambios de payload en los recursos).
- **Dependencias**: se agrega `PyJWT`.
- **Configuración**: nuevas variables de entorno `JWT_SECRET`,
  `JWT_ALGORITHM`, `JWT_EXPIRES_MINUTES` (documentadas en `.env.example`).
- **Tests**: se actualizan `tests/conftest.py`, `tests/test_rol.py`,
  `tests/test_usuario.py` y se agrega `tests/test_auth.py`.
