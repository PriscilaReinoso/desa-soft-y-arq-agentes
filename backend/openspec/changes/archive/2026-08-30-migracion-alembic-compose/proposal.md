# Proposal: migracion-alembic-compose

## Why

Al levantar el stack con `docker-compose`, el backend arranca directamente el
servidor uvicorn sin ejecutar las migraciones de alembic. Como el mecanismo de
inicialización por `init.sql` (`/docker-entrypoint-initdb.d/`) solo corre la
primera vez que se crea el volumen y actualmente está completamente comentado,
las tablas de PostgreSQL **no se crean**, generando errores por falta de
tablas/datos (issue IF-30).

## What Changes

- Agregar un servicio `migrate` en el `docker-compose.yml` raíz que ejecute
  `alembic upgrade head` contra la base de datos compartida antes de que
  arranque el backend.
- El servicio `migrate` usa la misma imagen del backend (que ya incluye
  `alembic.ini`, la carpeta `alembic/` y las dependencias con alembic y
  psycopg2) y recibe la misma configuración de base de datos por variables de
  entorno.
- Orden correcto de arranque: `db` (healthy) → `migrate` (completa con éxito)
  → `backend`.
- El backend espera a que `migrate` termine correctamente
  (`service_completed_successfully`) antes de levantar uvicorn.
- La migración es idempotente: alembic registra la versión en `alembic_version`
  y no re-ejecuta lo ya aplicado.

## Capabilities

### New Capabilities
- `migracion-alembic`: ejecución de las migraciones de esquema (alembic) sobre
  la base de datos compartida dentro del compose, antes de que la API sirva
  tráfico, de forma reproducible e idempotente.

### Modified Capabilities
<!-- Sin cambios de requerimientos a nivel spec en capacidades existentes. -->

## Impact

- `docker-compose.yml` (raíz): nuevo servicio `migrate` y ajuste del
  `depends_on` del backend para ordenar la migración.
- No se modifica la imagen del backend (`backend/Dockerfile`) ni el código de
  la aplicación: la migración se dispara como un servicio de orquestación.
- Depende de que los scripts de migración en `backend/alembic/versions/` ya
  existan y generen el esquema (ya están presentes).
- Sin secretos: las credenciales siguen viniendo de variables de entorno no
  versionadas.
