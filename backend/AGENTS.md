# AGENTS.md

Instrucciones globales para los agentes de opencode en el backend del
**Sistema de Gestión de Inventario para Ferretería**.

## Descripción del proyecto

API REST para la gestión de inventario de una ferretería. Administra
artículos, depósitos, ventas, proveedores y listas de precios; expone
módulos de preventas y presupuestos (exportables a PDF), se integrara con un
asistente inteligente para consultas sobre inventario, productos similares y
sugerencias de compra.

## Stack tecnológico

- Python 3.12, FastAPI, Pydantic v2.
- SQLAlchemy 2.0 (ORM) + Alembic (migraciones).
- PostgreSQL con pgvector (búsqueda semántica del asistente).
- Autenticación JWT con roles `ADMIN` y `CONSULTOR`.
- Pytest para pruebas.
- Docker para contenerización.

## Estructura del proyecto

```
app/
  main.py              # Punto de entrada de FastAPI. Inicializa la aplicación y registra los routers.
  api/
    v1/                # Endpoints REST organizados por versión (users.py, auth.py, products.py, etc.).
  models/              # Modelos SQLAlchemy que representan las tablas de PostgreSQL.
  schemas/             # Modelos Pydantic para validación de requests y responses.
  services/            # Lógica de negocio. Coordina reglas de negocio y llamadas a repositorios.
  repositories/        # Capa de acceso a datos. Encapsula las consultas a la base de datos (opcional).
  core/
    config.py          # Configuración de la aplicación y variables de entorno.
    database.py        # Configuración del motor SQLAlchemy, sesiones y conexión a PostgreSQL.
    security.py        # Autenticación, JWT, hashing de contraseñas y utilidades de seguridad.
    dependencies.py    # Dependencias reutilizables para inyección en FastAPI.
  exceptions/          # Excepciones personalizadas y manejadores globales de errores.
  middleware/          # Middlewares personalizados (logging, auditoría, autenticación, etc.).
  utils/               # Funciones auxiliares y utilidades (CSV, Excel, PDF, emails, helpers, etc.).
alembic/               # Migraciones y control de versiones del esquema de la base de datos.
tests/                 # Pruebas unitarias e integración con pytest.
.env                   # Variables de entorno para desarrollo (no versionar).
.env.example           # Ejemplo de variables de entorno requeridas.
Dockerfile             # Imagen Docker de la aplicación.
docker-compose.yml     # Orquestación de servicios (API, PostgreSQL, pgAdmin, etc.).
README.md              # Documentación del proyecto e instrucciones de instalación.
```

## Convenciones

- Nombres descriptivos en español; entidades de dominio en español:
- Modelos en singular (`class Articulo`), tablas en singular (`articulo`).
- Esquema de bases de datos dentro de docs/db_schemma.md
- Comentarios solo cuando aportan valor; no repetir el código.
- Mantener cada archivo con una única responsabilidad.
- No escribir secretos en código ni en archivos versionados; usar variables
  de entorno.

## Arquitectura

La aplicación sigue una arquitectura por capas:

HTTP Request
    ↓
Router (FastAPI)
    ↓
Service (Reglas de negocio)
    ↓
Repository (Acceso a datos)
    ↓
SQLAlchemy
    ↓
PostgreSQL

Los routers nunca deben acceder directamente a la base de datos.
Toda regla de negocio pertenece a Services.
Repositories únicamente realizan operaciones CRUD y consultas.

## Flujo de trabajo

1. Leer el archivo objetivo y su contexto antes de editar.
2. Seguir las convenciones de estructura y de nombres.
3. Ejecutar los tests del backend antes y después de los cambios.
4. Verificar que no se rompan otras partes del proyecto.
5. No ejecutar `git commit` ni `git push` salvo que el usuario lo pida.

## Comandos útiles

- Instalar dependencias: `pip install -r requirements.txt`.
- Correr la API localmente: `uvicorn app.main:app --reload`.
- Ejecutar tests: `pytest`.
- Generar migración: `alembic revision --autogenerate -m "<descripcion>"`.
- Aplicar migraciones: `alembic upgrade head`.


## Herramientas disponibles

- Subagentes en `.opencode/agent/`: revisores y diseñadores especializados en
  el backend.
- Skills en `.opencode/skill/`: blueprints para migraciones
  Alembic y tests pytest.
- Comandos personalizados en `.opencode/command/`.
- Skill `jira-create` y comando `/jira-create`: crear, vincular y transicionar
  issues de Jira en el proyecto Inventario Ferreteria.

## Integración con Jira

El proyecto Jira **Inventario Ferreteria** tiene el key `IF`. Para operar
contra la API REST de Jira se usan variables de entorno de usuario:

- `JIRA_API_TOKEN` — token de API de Jira.
- `JIRA_SITE_URL` — URL del sitio.
- `JIRA_EMAIL` — email de la cuenta de Jira.

La autenticación es HTTP Basic con `email:token` contra
`https://<JIRA_SITE_URL>/rest/api/3`. `JIRA_SITE_URL` puede incluir o no el
esquema `https://`; normalizarlo (quitar `https?://`) antes de construir URLs
para evitar dobles esquemas. Para crear issues usar la skill `jira-create` (o
el comando `/jira-create`). No exponer estas variables en logs ni en archivos
versionados.

### Ciclo de vida spec ↔ Jira

Cada change de OpenSpec se asocia a un issue de Jira (Historia). El vínculo se
guarda en `openspec/changes/<change>/jira.yaml`:

```yaml
key: IF-<X>
state: created   # created | in_progress | done
```

No guardar la URL en `jira.yaml`; derivarla de `JIRA_SITE_URL` normalizado
(`https://<site-normalizado>/browse/IF-<X>`) cuando se necesite mostrar.

Flujo:

1. `/opsx-propose <change>` — crea la spec (no toca Jira).
2. `/jira-create <change>` — crea la **Historia** (padre = Epic consultado si
   no se especifica), estado inicial "Por hacer" y escribe `jira.yaml`.
3. `/opsx-apply-jira <change>` — transiciona el issue a **"En curso"** y luego
   ejecuta el flujo `apply` de OpenSpec.
4. `/opsx-archive-jira <change>` — transiciona el issue a **"Finalizado"** y
   luego ejecuta el flujo `archive` de OpenSpec. `jira.yaml` se archiva junto
   con la carpeta del change.

Reglas:

- Los comandos `/opsx-apply` y `/opsx-archive` (sin Jira) siguen existiendo
  para cambios sin issue asociado.
- Si no hay `jira.yaml`, apply/archive avisan y continúan (soft-fail).
- Idempotencia: si el issue ya está en el estado objetivo, no se transiciona.
- Transiciones por `statusCategory.key` (`indeterminate` → "En curso",
  `done` → "Finalizado"), robusto a idiomas.

## Seguridad

- Nunca escribir secretos o claves en código ni en archivos versionados.
- No registrar claves de API ni tokens en logs.
- `JWT_SECRET` y credenciales de base de datos van por variables de entorno
  (`.env` no versionado).
