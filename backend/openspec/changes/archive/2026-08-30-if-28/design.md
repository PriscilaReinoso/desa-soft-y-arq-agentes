## Context

El backend es una API FastAPI (Python 3.12) que lee su configuración desde
`.env` vía `pydantic-settings` (`app/core/config.py`): `DB_HOST`, `DB_PORT`,
`DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `JWT_ALGORITHM`,
`JWT_EXPIRES_MINUTES`, `CORS_ORIGINS`. `requirements.txt` ya está definido.
Actualmente `Dockerfile` y `docker-compose.yml` existen pero vacíos, y no hay
`.dockerignore`. `JWT_SECRET` exige mínimo 32 caracteres (validación en
`config.py`), por lo que un valor de ejemplo corto rompería el arranque.
Ver `proposal.md` (Why) para la motivación.

## Goals / Non-Goals

**Goals:**
- Imagen reproducible del backend (multi-stage, instalación de dependencias).
- Configuración únicamente por variables de entorno; sin secretos embebidos.
- `.dockerignore` para mantener el contexto de build limpio y evitar fugas.
- Entrypoint `uvicorn app.main:app`.
- `docker-compose.yml` funcional que orqueste API + PostgreSQL.

**Non-Goals:**
- No se implementan migraciones automáticas de BD en el inicio del contenedor
  (queda a criterio de la operación; sólo se garantiza compatibilidad).
- No se integra pgvector en la imagen (no está en `requirements.txt`).
- No se abordan secretos externos (Vault, Docker secrets); scope = `.env`.

## Decisions

- **Build multi-stage (browser de deps → runtime liviano)**
  Usar imagen base Python 3.12. Primera etapa instala/build de dependencias;
  etapa final copia solo el código y las deps, `EXPOSE` del puerto HTTP y
  arranca con `uvicorn app.main:app`. Runtime reducido y reproducible.
  Alternativa descartada: imagen única sin multi-stage (imagen más grande,
  sin capa separada de dependencias para mejor cacheo).

- **Secretos solo por variables de entorno**
  El contenedor NO copia `.env` al interior (el `.dockerignore` lo excluye).
  La configuración llega por `-e`/`environment` del compose o `env_file`.
  Coherente con `pydantic-settings` que lee variables de entorno sobre `.env`.
  Alternativa descartada: `COPY .env` — rechazada por exponer credenciales en
  la imagen y en capas del build.

- **Puerto expuesto dedicado**
  Definir un puerto HTTP para la API (p. ej. 8000) en `EXPOSE` y en el compose,
  mapeándolo a un puerto del host. CORS se mantiene configurable por env.

- **`docker-compose.yml` con servicio de BD**
  Servicio `db` (postgres) + servicio `backend`. El backend apunta su
  `DB_HOST` al nombre del servicio de BD y recibe credenciales por
  `environment`/`env_file`; nunca hardcodea contraseñas en texto plano.
  Network interna del compose para la comunicación.

- **`.dockerignore`**
  Excluir `.env`, `__pycache__/`, `*.pyc`, `.venv/`, `.git/`, `tests/`,
  `.pytest_cache/`, `docs/`, etc., para reducir el contexto de build y evitar
  fugas de credenciales.

## Risks / Trade-offs

- [`JWT_SECRET` de ejemplo rompe el arranque (validación ≥32 chars)] → Mitigación: documentar en el compose/README que `JWT_SECRET` real se provee por `env_file`/`.env`; el compose referencia un `.env` local no versionado.
- [Credenciales en `docker-compose.yml` versionado] → Mitigación: usar variables interpoladas de `${VAR}` o `env_file`; nunca valores literales reales.
- [`psycopg2-binary` tal vez requiera build tools en algunas imágenes slimm] → Mitigación: el multi-stage instala dependencias del sistema necesarias en la etapa de build antes de `pip install`.
- [CORS por default apunta a localhost frontend] → Mitigación: configurable por `CORS_ORIGINS` env, no modificado.
