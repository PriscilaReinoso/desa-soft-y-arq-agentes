# Tasks: migracion-alembic-compose

## 1. Configurar el servicio de migración

- [x] 1.1 Agregar servicio `migrate` en `docker-compose.yml` reutilizando el build de `./backend` (misma imagen, `environment` de DB derivada de `POSTGRES_*`)
- [x] 1.2 Sobreescribir `command`/`entrypoint` del servicio `migrate` para ejecutar `alembic upgrade head && psql ... -f /init.sql`
- [x] 1.3 Agregar `postgresql-client` a la imagen runtime del backend (reutilizada por `migrate`) para disponer de `psql`
- [x] 1.4 Montar `./init.sql:/init.sql:ro` en el servicio `migrate` y quitar el mount `/docker-entrypoint-initdb.d` del `db`

## 2. Ordenar el arranque

- [x] 2.1 Configurar `migrate` con `depends_on: db (condition: service_healthy)`
- [x] 2.2 Configurar el servicio `backend` para que dependa de `migrate` con `condition: service_completed_successfully`
- [x] 2.3 Verificar que el orden resultante sea `db (healthy) → migrate (exitoso) → backend`

## 3. Datos por defecto fuera de alembic

- [x] 3.1 Eliminar la migración de datos `20260830_0001_datos_iniciales_roles_y_admin.py`
- [x] 3.2 Dejar `init.sql` solo con INSERTs idempotentes (`ON CONFLICT DO NOTHING`) de roles y usuario admin, con `now()` explícito en timestamps
- [x] 3.3 Confirmar cabecera única de alembic (`20260824_0001`) tras eliminar la migración de datos

## 4. Validación

- [x] 4.1 Reconstruir el stack desde volumen limpio (`docker compose down -v && up --build`) y confirmar que `migrate` corre alembic + semillas y termina con éxito
- [x] 4.2 Verificar en PostgreSQL que las tablas de la base compartida se crearon y que `alembic_version` apunta a `20260824_0001` (datos no vinculados a versión)
- [x] 4.3 Verificar que las semillas (roles ADMIN/CONSULTOR y usuario admin) quedaron cargadas
- [x] 4.4 Confirmar idempotencia: volver a ejecutar `migrate` y comprobar que no re-aplica cambios ni duplica datos (`INSERT 0 0`)
- [x] 4.5 Verificar que el backend levanta uvicorn, responde HTTP 200 y el login con el usuario admin funciona
