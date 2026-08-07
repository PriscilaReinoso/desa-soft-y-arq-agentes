## Context

Estado actual relevante (ver `proposal.md` para la motivación):

- `app/core/security.py` solo implementa `hash_password` con PBKDF2-SHA256 en
  formato `salt$digest` (salt en hex de 16 bytes, 100k iteraciones).
- No hay librería JWT instalada; se debe agregar `PyJWT`.
- No existen `app/core/dependencies.py`, `app/api/v1/auth.py` ni esquemas de
  auth. `config.py` no tiene settings JWT.
- `app/api/v1/roles.py` y `usuarios.py` no exigen autenticación; el modelo
  `Usuario` tiene `activo` y `deleted_at`; el rol es una tabla dinámica
  (`Rol.nombre` = `ADMIN`/`CONSULTOR`).
- Los tests usan SQLite en memoria y llaman a los endpoints sin token.

## Goals / Non-Goals

**Goals:**
- Segurizar los endpoints existentes y futuros exigiendo un token JWT válido
  en el header de cada request (objetivo principal del change).
- El token emitido por el login solo tiene valor porque los endpoints
  protegidos validan un JWT correcto en el header `Authorization` de cada
  request; sin esa validación el login no agrega seguridad.
- Login público que valide credenciales y emita JWT HS256 con expiración
  configurable (default 30 min).
- Reutilizar el hash existente (sin invalidar contraseñas ya almacenadas).
- Distinguir permisos de escritura por rol sin hardcodear dependencias en cada
  endpoint.

**Non-Goals:**
- Refresh tokens, revocación de tokens, o logout server-side (fuera de alcance).
- Gestión de sesiones/soporte en frontend.
- Cambiar el esquema de hash de contraseñas ni el modelo de datos.

## Decisions

### 1. Librería JWT: PyJWT
Se usa `PyJWT` (HS256). Alternativa: `python-jose` (mantenimiento más
irregular). `PyJWT` es liviano, activamente mantenido y suficiente para
emisión/validación simétrica.

### 2. Settings JWT en config
`JWT_SECRET` (secreto de firma; sin default en producción, con fallback de
desarrollo para que los tests corran sin configurar env), `JWT_ALGORITHM`
(default `HS256`) y `JWT_EXPIRES_MINUTES` (default 30). El secreto no se
versiona: solo `.env` (dev) y `.env.example` (documentación).

### 3. Funciones en `security.py`
- `verify_password(password, stored) -> bool`: descompone `salt$digest`, recalcula
  y compara en tiempo constante (`hmac.compare_digest`). Alternativa: re-hashear
  todo con passlib/bcrypt (invalida hashes actuales, cambio de esquema).
- `create_access_token(usuario) -> str`: payload `sub` (id como string), `role`
  (nombre del rol), `iat`, `exp`. Firma HS256 con `JWT_SECRET`.
- `decode_token(token) -> dict`: decodifica y valida expiración; lanza
  `UnauthorizedError` ante cualquier fallo (genérico para no filtrar motivo).

### 4. Errores 401/403
Se agregan `UnauthorizedError` (401) y `ForbiddenError` (403) en
`app/exceptions/base.py` heredando `DomainError`, reutilizando el handler
global existente. La lógica de roles usa 403; la autenticación usa 401.

### 5. Dependencias reutilizables (`app/core/dependencies.py`)
- `get_current_usuario`: usa `HTTPBearer(auto_error=False)`; si falta o es
  inválido el token → `UnauthorizedError`. Decodifica, carga el usuario por
  `sub` (vía `UsuarioRepository.get`) y valida `activo` y `deleted_at`.
- `require_roles(*roles)`: factory que devuelve una dependencia que valida
  `role` contra los roles permitidos → `ForbiddenError` si no coincide.
  Alternativa considerada: dependency global en `main.py` (aplica auth pero no
  permite distinguir por rol por router/endpoint; se descarta).

### 6. Arquitectura por capas para auth
`POST /api/v1/auth/login` → `AuthService.authenticate(email, password)` →
`UsuarioRepository.get_by_email` → `verify_password` → `create_access_token`.
Los routers `roles.py` y `usuarios.py` aplican auth a nivel de `APIRouter`
(`dependencies=[Depends(get_current_usuario)]`) y autorización por endpoint
(`require_roles("ADMIN")` en POST/PUT/DELETE). GET queda solo autenticado.

La protección (no el login) es lo que seguriza el sistema: el login por sí
solo no protege nada; su único propósito es emitir el token que los endpoints
protegidos exigen y validan en cada request.

### 7. Respuesta del login
`LoginResponse` con `access_token`, `token_type="bearer"`, `expires_in` y
`usuario` (id, nombre, apellido, email, rol). El rol del claim se lee de
`usuario.rol.nombre` (relación cargada en el servicio).

## Risks / Trade-offs

- [Secreto débil o en código] → `JWT_SECRET` solo por env; fallback de dev
  claramente marcado; documentado en `.env.example`.
- [Token no revocable (estado de baja no se propaga a tokens ya emitidos)] →
  mitigación aceptable para el alcance: cada request vuelve a la BD y valida
  `activo`/`deleted_at`, así un usuario dado de baja deja de operar aunque su
  token siga sin expirar.
- [401 vs 403: FastAPI/HTTPBearer puede responder 403 por defecto] → se usa
  `auto_error=False` y se maneja la ausencia manualmente para normalizar 401.
- [Tests existentes sin token] → se agrega un helper en `conftest.py` que
  crea rol/usuario y loguea para obtener el header; se actualizan los tests.
- [Hash actual sin forma de distinguir formato] → `verify_password` asume el
  formato `salt$digest` vigente; cualquier hash fuera de formato se rechaza
  como credencial inválida.
