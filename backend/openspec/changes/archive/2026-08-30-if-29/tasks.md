## 1. Servicio de base de datos compartida

- [x] 1.1 Definir en el compose raíz el servicio `db` (PostgreSQL) con credenciales `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` interpoladas (default + `.env`), sin contraseñas en texto plano
- [x] 1.1b Publicar `5433:5432` en `db` para permitir conexión desde el host (p. ej. DBeaver: host `localhost`, puerto `5433`)
- [x] 1.2 Agregar healthcheck `pg_isready` al servicio `db`
- [x] 1.3 Configurar un volumen para la persistencia de la base de datos (`postgres_data` → `/var/lib/postgresql/data`)

## 2. Servicios de aplicación

- [x] 2.1 Definir el servicio `backend` con `build.context: ./backend` y su `Dockerfile`, exponiendo `8000:8000`
- [x] 2.2 Configurar el servicio `backend` con `depends_on: db: condition: service_healthy` y mapear su conexión (`DB_HOST=db`, `DB_USER/DB_PASSWORD/DB_NAME` desde las `POSTGRES_*` compartidas, `JWT_SECRET` desde `.env`)
- [x] 2.3 Definir el servicio `frontend` con `build.context: ./frontend` y su `Dockerfile`, exponiendo `80:80` y pasando `VITE_API_BASE_URL` como build arg
- [x] 2.4 Definir el servicio `bot-chat` con `build.context: ./bot-chat`, `additional_contexts: mcp-server: ./mcp-server` y su `Dockerfile` (que copia bot-chat y mcp-server vía `--from=mcp-server`), exponiendo `8001:8001`. Se agrega `mcp-server/.dockerignore` para evitar arrastrar `venv` y archivos no necesarios al contexto adicional
- [x] 2.5 Configurar el servicio `bot-chat` con `depends_on: db: condition: service_healthy` y las variables `POSTGRES_*` apuntando al mismo host y base compartida

## 3. Inicialización de la base de datos (init.sql)

- [x] 3.1 Crear `./init.sql` en la raíz (a la misma altura que el compose) con valores de inicio, coherente con el schema en español del backend (sin reutilizar el `init.sql` de `mcp-server`)
- [x] 3.2 Montar `./init.sql` en el servicio `db` (`./init.sql:/docker-entrypoint-initdb.d/init.sql:ro`) para que se ejecute al primer arranque

## 4. Persistencia de conversaciones y volúmenes

- [x] 4.1 Configurar el volumen de conversaciones del bot-chat (`conv_data` → `/app/bot-chat/conversaciones`)
- [x] 4.2 Declarar los volúmenes `postgres_data` y `conv_data` en la sección `volumes` del compose

## 5. Verificación

- [x] 5.1 Validar `docker compose config` del compose raíz (sin errores de sintaxis, credenciales default coherentes)
- [x] 5.2 Confirmar que el compose levanta la BD antes que backend y bot-chat (healthcheck + `depends_on`) y que no expone contraseñas en texto plano
- [x] 5.3 Confirmar que al primer arranque se ejecuta el `init.sql` y se insertan los valores de inicio