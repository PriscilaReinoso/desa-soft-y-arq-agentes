## Why

El backend de la API (FastAPI + PostgreSQL) no cuenta con una imagen de
contenedor lista para ejecutarse en cualquier entorno. Se necesita un
`Dockerfile` del backend que no exponga contraseñas ni secretos, que tome
toda su configuración únicamente de variables de entorno (`.env`), y que
pueda usarse luego en un `docker-compose` final que levante también la base
de datos. Actualmente `Dockerfile` y `docker-compose.yml` existen como
archivos vacíos, por lo que no hay forma reproducible de ejecutar el sistema.

Fuente del requerimiento: issue **IF-28** "dockerizar backend"
(https://reinoso-yesica-priscila.atlassian.net/browse/IF-28).

## What Changes

- Generar el `Dockerfile` del backend (build multi-stage) basado en
  `requirements.txt`, que exponga únicamente el puerto HTTP de la API.
- No hardcodear credenciales dentro de la imagen: toda la configuración
  (BD, JWT, CORS) se inyecta por variables de entorno, coherente con
  `pydantic-settings`.
- No copiar `.env` al interior de la imagen; los secretos viven fuera del
  build (variables de entorno en tiempo de ejecución).
- Agregar `.dockerignore` para excluir `.env`, `__pycache__`, tests, `.git`
  y otros artefactos del contexto de build.
- El contenedor ejecuta la API con `uvicorn` (`app.main:app`) como entrypoint.
- Garantizar que la imagen resultante pueda utilizarse en un `docker-compose`
  posterior que levante además PostgreSQL (interfaz clara por variables de
  entorno, sin acoplar credenciales).

## Capabilities

### New Capabilities

- `docker-deploy`: capacidad de reconstructión y ejecución del backend como
  imagen de contenedor reproducible, configurable íntegramente por variables
  de entorno, sin exponer secretos en la imagen, y utilizable en un
  `docker-compose` junto a la base de datos.

### Modified Capabilities

## Impact

- `Dockerfile` (backend): archivo nuevo/completado (actualmente vacío).
- `docker-compose.yml`: archivo nuevo/completado (actualmente vacío), listo
  para orquestar API + PostgreSQL.
- `.dockerignore`: nuevo.
- No cambian rutas de la API ni módulos de `app/`.
- Dependencias: usa `requirements.txt` existente; sin nuevas librerías de
  runtime.
