# Design: migracion-alembic-compose

## Context

El compose raíz levanta `db`, `backend`, `frontend` y `bot-chat`. El backend
arranca directamente uvicorn (`CMD` en `backend/Dockerfile`) sin ejecutar
migraciones. El `init.sql` montado en `/docker-entrypoint-initdb.d/` solo corre
la primera vez que se crea el volumen y está completamente comentado, por lo
que las tablas de PostgreSQL no se crean (issue IF-30). Ya existen 12 scripts
de migración en `backend/alembic/versions/` y el `Dockerfile` del backend copia
`alembic.ini` y `alembic/` a la imagen. Ver proposal.md para el porqué.

## Goals / Non-Goals

**Goals:**
- Ejecutar `alembic upgrade head` contra la base de datos compartida antes de
  que el backend sirva tráfico.
- Garantizar el orden `db (healthy) → migrate (completado) → backend`.
- Mantener la migración idempotente y configurada por variables de entorno.
- Sin tocar el código de la aplicación ni reconstruir la imagen del backend
  para este propósito.

**Non-Goals:**
- No modificar la lógica de la aplicación ni alterar los scripts de migración
  existentes (esquema).
- No vincular los datos por defecto (roles, usuario admin) a una revisión de
  alembic: la carga de datos vive en `init.sql`, no en una migración de datos.
- No manejar migraciones de bot-chat (usa su propio esquema/fuentes).

## Decisions

- **D1 — Servicio `migrate` en el compose en lugar de migrar en el arranque
  del backend.**
  - Por qué: separa la responsabilidad de la migración de la imagen de
    aplicación, evita cambios de imagen vulnerable/solo de orquestación, y
    permite ordenar dependencias explícitamente. Elegido por el usuario.
  - Alternativa descartada: modificar el `CMD` del backend a un wrapper que
    corra `alembic upgrade head && uvicorn ...` (acopla migración y app en el
    mismo contenedor y oscurece el orden).
- **D2 — `migrate` reutiliza la imagen del backend.**
  - La imagen ya incluye `alembic.ini`, `alembic/` y dependencias. Se
    sobreescribe `command`/`entrypoint` para ejecutar `alembic upgrade head`.
  - Reduce duplicación: no hace falta una imagen de migración propia.
- **D3 — El backend espera con `condition: service_completed_successfully`.**
  - El backend solo arranca cuando `migrate` finaliza con `exit 0`,
    eliminando la carrera entre migración y arranque de uvicorn.
  - `migrate` depende de `db` con `condition: service_healthy`.
- **D4 — Misma configuración de base de datos por variables de entorno.**
  - `migrate` recibe `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
    igual que el backend, derivadas de `POSTGRES_*` en el compose. Sin
    secretos en archivos versionados.
- **D5 — Los datos por defecto (roles y usuario admin) viven en `init.sql`,
  no en alembic.**
  - Por qué: el usuario exige que los valores por defecto (roles `ADMIN`/
    `CONSULTOR` y el usuario `admin`) no queden asociados a una revisión de
    alembic. Alembic es responsable únicamente del esquema.
  - Se eliminó la migración de datos `20260830_0001` y `init.sql` quedó con
    solo INSERTs idempotentes (`ON CONFLICT DO NOTHING`). Como el esquema ya
    no tiene `default` de servidor para `created_at`/`updated_at`
    (`20260805_0001` los define NOT NULL sin default), los INSERTs proveen
    `now()` explícitamente.
- **D6 — El servicio `migrate` ejecuta esquema + semillas en orden.**
  - Se quitó el mount de `init.sql` en `/docker-entrypoint-initdb.d/` (que
    correría antes de existir las tablas). Ahora `migrate` corre
    `alembic upgrade head && psql ... -f /init.sql`.
  - Se agregó `postgresql-client` a la imagen runtime del backend (reutilizada
    por `migrate`) para disponer de `psql`.
  - Idempotente: si las tablas ya existen y las semillas ya cargadas,
    `alembic` no re-aplica nada y `psql` devuelve `INSERT 0 0`.

## Risks / Trade-offs

- [El servicio `migrate` falla (red, DB no lista, script con error)] → Mitigación: depende de `db healthy`; el backend espera su terminación correcta, por lo que no arranca sobre un esquema incompleto; logs del servicio `migrate` visibles con `docker compose logs`.
- [Migración racing con el arranque remoto de la BD] → Mitigación: `depends_on: db (service_healthy)` garantiza que Postgres acepta conexiones antes de migrar.
- [Ligero retraso de arranque por correr migraciones en cada `up`] → Término aceptado: la idempotencia de alembic hace cada pasada corta cuando no hay cambios.
