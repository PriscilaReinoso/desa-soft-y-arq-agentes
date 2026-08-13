## Context

- Ver `proposal.md - Why`.
- `backend/app/main.py` crea la app FastAPI y registra routers con prefix `/api/v1`. No configura CORS.
- `backend/app/core/config.py` usa Pydantic Settings; las variables se leen de `.env`. Verificado: la preflight `OPTIONS /api/v1/auth/login` responde 405 sin cabeceras `Access-Control-Allow-*`.

## Goals / Non-Goals

**Goals:**
- Habilitar consumo de la API desde el frontend de desarrollo (`localhost:5173` y `127.0.0.1:5173`) con el mínimo cambio.
- Mantener CORS configurable por entorno sin secretos en el repo.

**Non-Goals:**
- No restringir métodos/headers por origen (lista de orígenes es la política completa).
- No agregar autenticación ni cambiar la lógica de login.
- No configurar credenciales/cookies CORS (`allow_credentials`), ya que la API usa tokens Bearer en header y no cookies.

## Decisions

1. **Usar `CORSMiddleware` de Starlette** (viene con FastAPI, sin dependencias nuevas). Alternativa (middleware propio) descartada por ser código adicional sin beneficio.
   - `allow_origins`: lista desde `settings.CORS_ORIGINS` (valor por defecto: los dos orígenes de desarrollo).
   - `allow_methods`: `["GET", "POST", "PUT", "DELETE", "OPTIONS"]`.
   - `allow_headers`: `["Authorization", "Content-Type"]`.
   - `allow_credentials=False` (tokens Bearer, no cookies).

2. **Configurable por entorno**: nueva propiedad/settings `CORS_ORIGINS` como lista en `config.py` (`list[str]` vía pydantic-settings). Se documenta en `.env.example`.

3. **Registro del middleware en `main.py`** después de crear la app (los middleware de Starlette se aplican en orden de creación; CORS debe responder antes de que la ruta devuelva 405, Starlette lo maneja en la preflight).

## Risks / Trade-offs

- [Permitir orígenes por defecto en producción] → Los valores por defecto son de desarrollo; en producción se setea `CORS_ORIGINS` explícitamente.
- [Preflight con métodos limitados] → Los métodos listados cubren toda la API actual (CRUD + login). Si se agregan métodos nuevos (PATCH/POST de otros recursos), se revisa la lista.
- [Tests existentes] → TestClient no genera preflights; los tests actuales no se ven afectados.

## Migration Plan

- Agregar settings `CORS_ORIGINS`, registrar el middleware y reiniciar el servidor (`python -m uvicorn app.main:app --reload`). Sin migraciones de DB.
