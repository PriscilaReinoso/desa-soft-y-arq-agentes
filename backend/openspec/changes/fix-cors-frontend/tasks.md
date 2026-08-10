## 1. Configuración

- [x] 1.1 Agregar `CORS_ORIGINS: list[str]` en `app/core/config.py` con valor por defecto `["http://localhost:5173", "http://127.0.0.1:5173"]`
- [x] 1.2 Documentar `CORS_ORIGINS` en `.env.example`

## 2. Middleware

- [x] 2.1 Registrar `CORSMiddleware` en `app/main.py` con `allow_origins=settings.CORS_ORIGINS`, métodos `["GET", "POST", "PUT", "DELETE", "OPTIONS"]` y headers `["Authorization", "Content-Type"]`

## 3. Verificación

- [x] 3.1 Agregar test del preflight `OPTIONS /api/v1/auth/login` con origen autorizado (200 + cabeceras CORS)
- [x] 3.2 Agregar test de origen no autorizado (sin cabecera `Access-Control-Allow-Origin`)
- [x] 3.3 Ejecutar `python -m pytest tests -q` y confirmar que toda la suite pasa
- [x] 3.4 Verificar contra el servidor en ejecución que `OPTIONS /api/v1/auth/login` responde 200 con cabeceras CORS
