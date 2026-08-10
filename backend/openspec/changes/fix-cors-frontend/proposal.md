## Why

El frontend (Vite dev server en `http://localhost:5173`) no puede iniciar sesión: el navegador bloquea la petición al backend (`http://127.0.0.1:8000`) porque la API responde `405 Method Not Allowed` a la preflight `OPTIONS` — el backend no configura `CORSMiddleware`. El endpoint de login existe y funciona (verificado con cliente HTTP), pero sin cabeceras `Access-Control-Allow-*` es inutilizable desde el navegador.

## What Changes

- Agregar middleware de CORS a la aplicación FastAPI (`app/main.py`) mediante `CORSMiddleware` de `starlette`.
- Permitir los orígenes del frontend de desarrollo: `http://localhost:5173` y `http://127.0.0.1:5173`.
- Permitir los métodos estándar de la API (`GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`) y las cabeceras necesarias (`Authorization`, `Content-Type`).
- Configurar los orígenes permitidos por variable de entorno (`CORS_ORIGINS`) con valor por defecto para desarrollo, para que la lista sea configurable sin tocar código.

## Capabilities

### New Capabilities
- `cors`: política de CORS de la API que habilita a los clientes autorizados (frontend de desarrollo) a consumir los endpoints desde el navegador, respondiendo correctamente a las preflights `OPTIONS`.

### Modified Capabilities
- `auth`: no cambia ningún requisito de login/protección; solo se habilita su consumo desde el navegador. No se requiere delta spec para `auth`.

## Impact

- `backend/app/main.py` — registro del middleware CORS.
- `backend/app/core/config.py` — nueva variable `CORS_ORIGINS` (lista de orígenes).
- `backend/.env.example` — documentar `CORS_ORIGINS`.
- Dependencia: `starlette` ya incluida en FastAPI; no se agregan dependencias nuevas.
- Tests: los tests existentes usan TestClient (mismo origen) y no se ven afectados; se agrega un test del preflight OPTIONS.
