## 1. Dockerfile del backend

- [x] 1.1 Crear el `Dockerfile` multi-stage basado en Python 3.12 que instale dependencias desde `requirements.txt` en una etapa de build
- [x] 1.2 Copiar solo el código necesario de `app/` y `alembic/` a la etapa final
- [x] 1.3 Definir `EXPOSE` del puerto HTTP y el entrypoint `uvicorn app.main:app` para arrancar la API
- [x] 1.4 Verificar que el `Dockerfile` no embebe secretos ni copia `.env` al import de la imagen

## 2. .dockerignore

- [x] 2.1 Crear `.dockerignore` excluyendo `.env`, `__pycache__/`, `*.pyc`, `.venv/`, `.git/`, `tests/`, `.pytest_cache/` y otros artefactos del contexto de build
- [x] 2.2 Confirmar que `.env` queda fuera del contexto de build

## 3. Docker Compose

- [x] 3.1 Crear/completar `docker-compose.yml` con un servicio `db` (PostgreSQL) y un servicio `backend` construido desde el `Dockerfile`
- [x] 3.2 Configurar el servicio `backend` para recibir la configuración (BD, JWT, CORS) por variables de entorno/`env_file`, sin credenciales reales en texto plano
- [x] 3.3 Apuntar `DB_HOST` del backend al nombre del servicio `db` y conectar ambos por la red interna del compose
- [x] 3.4 Mapear el puerto HTTP del backend al puerto del host

## 4. Verificación

- [x] 4.1 Verificar que el build de la imagen no incluye `.env` ni secretos (inspección de la imagen/contexto)
- [x] 4.2 Validar que el arranque del compose levanta backend y PostgreSQL sin credenciales hardcodeadas
