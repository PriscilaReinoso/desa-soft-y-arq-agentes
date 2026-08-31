## Why

Los servicios del sistema (frontend, backend y bot-chat) ya cuentan con sus
`Dockerfile` por separado, pero no existe un `docker-compose` a nivel raíz que
los orqueste a todos junto con la base de datos compartida. Así, no hay una
forma reproducible de levantar el stack completo desde un solo comando. El
compose raíz actual es apenas el de backend (context incorrecto) y queda
fuera del alcance real del sistema multi-servicio.

Fuente del requerimiento: issue **IF-29** "generar compose"
(https://reinoso-yesica-priscila.atlassian.net/browse/IF-29).

## What Changes

- Crear/completar un `docker-compose.yml` **a nivel raíz** (una carpeta atrás
  de `frontend/`, `backend/`, `mcp-server/` y `bot-chat/`).
- El compose invoca los Dockerfiles existentes de `frontend`, `backend` y
  `bot-chat` (build contexts: propios para los tres; bot-chat agrega un
  contexto adicional `mcp-server` porque su Dockerfile necesita ambos
  árboles).
- No expone contraseñas: usa valores predefinidos/default (interpolación de
  variables) y credenciales vía `.env`, sin secretos en texto plano.
- Levanta la base de datos compartida por backend y bot-chat como primer
  paso (servicio `db` con healthcheck y `depends_on`).
- La base de datos es **una única BD compartida** por backend y bot-chat,
  persistida en un volumen.
- La conexión compartida usa la convención de variables `POSTGRES_*` (mismo
  nombre para backend y bot-chat, apuntando al mismo host y database).
- Las conversaciones de bot-chat se persisten en un volumen.
- Se agrega un `init.sql` a la misma altura que el compose para insertar
  valores al iniciar la base de datos (se ejecuta al primer arranque del
  servicio `db`).

## Capabilities

### New Capabilities

- `docker-orquestacion`: capacidad de levantar todo el stack (frontend,
  backend, bot-chat y la base de datos compartida) con un único
  `docker-compose` raíz, sin exponer credenciales y con persistencia en
  volúmenes para la BD y las conversaciones del bot.

### Modified Capabilities

## Impact

- `docker-compose.yml` (raíz del workspace): reescrito (actualmente es el
  compose de backend de IF-28).
- No cambian los `Dockerfile` de frontend ni backend. `bot-chat/Dockerfile`
  ajusta su `COPY` para usar el contexto adicional `mcp-server`, y se agrega
  `mcp-server/.dockerignore` para mantener liviano ese contexto.
- Servicios del compose: `db` (PostgreSQL, publica `5433:5432` para conexión
  desde el host), `backend`, `frontend`, `bot-chat`.
- Variables de entorno: convención `POSTGRES_*` compartida entre backend y
  bot-chat; `VITE_API_BASE_URL` para el frontend.
- Volúmenes: uno para la BD (`postgres_data`) y uno para las conversaciones
  del bot (`conv_data`).
- `init.sql`: nuevo, en la raíz (a la misma altura que el compose), montado en
  `db` para insertar valores iniciales (no se reutiliza el de `mcp-server`).
