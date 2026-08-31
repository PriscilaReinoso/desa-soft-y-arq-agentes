## Context

Los servicios ya tienen sus `Dockerfile` en subdirectorios: `backend/`
(FastAPI, puerto 8000, conecta a PostgreSQL por variables `DB_*`),
`frontend/` (Node→Nginx, puerto 80, build-time `VITE_API_BASE_URL`),
`bot-chat/` (FastAPI multi-agente, puerto 8001, spawns `mcp-server`, persiste
conversaciones en `/app/bot-chat/conversaciones` y lee `POSTGRES_*`). El
`docker-compose.yml` raíz actual es el de backend de IF-28 (context incorrecto)
y existe además un compose autocontenido en `mcp-server/`. Ver `proposal.md`
(Why) para la motivación.

## Goals / Non-Goals

**Goals:**
- `docker-compose.yml` a nivel raíz que orqueste frontend, backend y bot-chat.
- Una única base de datos PostgreSQL compartida, levantada primero, con
  persistencia en volumen.
- Credenciales sin exponer: valores predefinidos/default o `.env`, sin texto
  plano en el archivo versionado.
- Convención `POSTGRES_*` como única fuente de credenciales de la BD, usada
  tanto por backend como por bot-chat (misma BD, mismo host).
- Volumen para las conversaciones del bot-chat.

**Non-Goals:**
- No se modifican los `Dockerfile` existentes ni el código de los servicios
  (IF-29 es sólo el compose root).
- No se integra el compose autocontenido de `mcp-server/`; mcp-server ya vive
  dentro de la imagen de bot-chat.

## Decisions

- **Compose a nivel raíz (una carpeta atrás de los subdirectorios)**
  El archivo vive en la raíz del workspace, tal como pide el issue. Es el
  punto de entrada único `docker compose up`.

- **Build contexts por servicio**
  `backend` y `frontend` usan `build.context` propio (`./backend`,
  `./frontend`) con su `Dockerfile`, porque copian rutas relativas a su
  carpeta.
  `bot-chat` usa `build.context: ./bot-chat` (no la raíz completa) más un
  contexto adicional nombrado para `mcp-server` (`additional_contexts:
  mcp-server: ./mcp-server`), porque su `Dockerfile` necesita tanto los
  fuentes de bot-chat como los de mcp-server (`src/server.py` +
  `requirements.txt`). En el Dockerfile la copia de mcp-server usa
  `COPY --from=mcp-server / /app/mcp-server/`.
  Para que ese contexto adicional no arrastre ruido (venv, tests, docs) se
  agregó `mcp-server/.dockerignore` (BuildKit respeta el `.dockerignore` de
  cada contexto).

- **Una única BD compartida con credenciales `POSTGRES_*`**
  El servicio `db` (PostgreSQL) define `POSTGRES_USER`, `POSTGRES_PASSWORD`,
  `POSTGRES_DB` interpolados (default + `.env`) y publica
  `ports: "5433:5432"` para poder conectarse desde el host
  (p. ej. DBeaver en `localhost:5433`). Backend y bot-chat consumen
  esa misma fuente:
  - `bot-chat` lee `POSTGRES_HOST`/`POSTGRES_PORT`/`POSTGRES_DB`/
    `POSTGRES_USER`/`POSTGRES_PASSWORD` → apuntan a `db`.
  - `backend` lee `DB_*`; el compose mapea `DB_HOST=db`,
    `DB_USER=${POSTGRES_USER}`, `DB_PASSWORD=${POSTGRES_PASSWORD}`,
    `DB_NAME=${POSTGRES_DB}`, `DB_PORT=5432`, de modo que ambas apps apuntan a
    la **misma** base sin duplicar credenciales y sin depender de nombres de
    variables distintos en la fuente.
  Resultado: "mismo nombre `POSTGRES_*`" como fuente de verdad y misma BD para
  ambos.
  Alternativa descartada: dos ambientes con credenciales duplicadas → riesgo
  de desincronización.

- **`depends_on` con healthcheck**
  El servicio `db` usa `pg_isready` como healthcheck; `backend` y `bot-chat`
  declaran `depends_on: db: condition: service_healthy`, garantizando que la
  BD esté lista antes de arrancar los servicios dependientes (primer paso).

- **Volúmenes**
  `postgres_data` → `/var/lib/postgresql/data` (persistencia de la BD) y
  `conv_data` → `/app/bot-chat/conversaciones` (persistencia de conversaciones).
  Coherente con `bot-chat/chat.py` (`CONVERSATIONS_DIR = "./conversaciones"`).

- **Exposición de puertos**
  `backend` → `8000:8000`, `bot-chat` → `8001:8001`, `frontend` → `80:80`.
  La BD no se expone al host salvo necesidad de debugging (accesible vía la
  red interna del compose).

- **Inicialización de la BD con `init.sql` (raíz)**
  El servicio `db` monta `./init.sql` (bind-mount de solo lectura) en
  `/docker-entrypoint-initdb.d/init.sql`, mecanismo nativo de la imagen
  postgres que ejecuta scripts SQL automáticamente la **primera vez** que se
  crea el volumen (sólo arranque inicial). El `init.sql` vive **a la misma
  altura que el compose** (raíz del workspace).
  El `init.sql` del mcp-server (`mcp-server/docker/init.sql`) se **desestima**:
  no se reutiliza ni se copia. El archivo raíz se define distinto, alineado al
  schema compartido en español del backend.
  Alternativa descartada: reutilizar el `init.sql` de `mcp-server` → schema en
  inglés que no coincide con el modelado del backend.

## Risks / Trade-offs

- [`JWT_SECRET` requerido por el backend (>=32 chars) rompe el arranque si queda default] → Mitigación: el compose interpola `JWT_SECRET` desde `.env`; documentar que el `.env` local lo provee.
- [El `.env` raíz está vacío en el repo; los defaults `POSTGRES_PASSWORD` serían débiles en producción] → Mitigación: en el compose se usan defaults sólo para desarrollo; advertir que en producción se sobrescriben por `.env` no versionado.
- [db compartida: schema del backend (Alembic) y datos de `init.sql` conviven en la misma BD] → Mitigación: el `init.sql` raíz inserta valores de catálogo del backend (schema en español) y se ejecuta al primer arranque; su contenido debe ser compatible con las tablas creadas por la migración del backend.
- [CORS del backend y bot-chat apuntan a localhost:5173; el frontend en contenedor sirve en `:80`] → Mitigación: el frontend hace build-time `VITE_API_BASE_URL` hacia el host `:8000`; se mantiene la config pública default sin cambiar código.

## Migration Plan

- Sustituir el `docker-compose.yml` raíz (hoy el de backend de IF-28) por el
  nuevo compose multi-servicio.
- Crear `./init.sql` en la raíz con los valores de inicio.
- Rollback: restaurar el compose previo (versionado en git) si falla la
  orquestación.

## Open Questions

- Omitido: el contenido exacto del `init.sql` raíz (qué tablas/valores
  inserta) se define durante `apply`, alineado con el schema en español del
  backend y la BD compartida. No cambia la estructura del compose.
