# AGENTS.md

Instrucciones globales para los agentes de opencode en el backend del
**Sistema de Gestión de Inventario para Ferretería**.

## Descripción del proyecto

API REST para la gestión de inventario de una ferretería. Administra
artículos, depósitos, ventas, proveedores y listas de precios; expone
módulos de preventas y presupuestos (exportables a PDF), se integrara con un
asistente inteligente para consultas sobre inventario, productos similares y
sugerencias de compra.
Dentro de \docs hay mas definicion util de la funcionalidad.

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

## Seguridad

- Utiliza autenticacion con JWT para todos los endpoint definidos excepto para el login.
- Nunca escribir secretos o claves en código ni en archivos versionados.
- No registrar claves de API ni tokens en logs.
- `JWT_SECRET` y credenciales de base de datos van por variables de entorno
  (`.env` no versionado).

## Herramientas disponibles

- Skills de SDD/OpenSpec en `.opencode/skills/`: `openspec-propose`,
  `openspec-apply-change`, `openspec-update-change`, `openspec-sync-specs`,
  `openspec-archive-change`, `openspec-explore`.
- Skill `jira`: crear, consultar (lectura vía MCP), buscar, vincular y
  transicionar issues de Jira en el proyecto Inventario Ferreteria.
- Los comandos `/opsx-*` documentados en este archivo se ejecutan con los
  skills correspondientes (no dependen de comandos locales).

## Integración con Jira

El proyecto Jira **Inventario Ferreteria** tiene el key `IF`. Todas las
operaciones (leer, buscar, crear, vincular y transicionar issues) se hacen con
las **herramientas MCP de Jira**; no llamar a la API REST directamente. La
autenticación la maneja el servidor MCP.

- Obtener el `cloudId` y la URL del sitio con `getAccessibleAtlassianResources`
  y usarlos en el resto de las herramientas.
- URLs públicas de issues: `<url-del-sitio>/browse/IF-<X>` (derivadas, nunca
  hardcodeadas).
- Para operar issues usar la skill `jira` (o los comandos `/jira`,
  `/opsx-propose-jira`).

### Operaciones vía MCP

- **Leer**: `getJiraIssue` (issue completo), `getTeamworkGraphContext` /
  `getTeamworkGraphObject` (relaciones, Epic padre).
- **Buscar**: `searchJiraIssuesUsingJql` (JQL) y `search` (texto libre).
- **Crear/editar**: `createJiraIssue` (con `parent` para Historia bajo Epic o
  subtareas), `editJiraIssue`.
- **Transicionar**: `getTransitionsForJiraIssue` + `transitionJiraIssue`,
  eligiendo por `statusCategory.key`.
- **Vincular**: `createIssueLink` (entre issues) y `addTeamworkGraphContext`
  (remote links, best-effort).
- Si una herramienta MCP falla, avisar al usuario y continuar con soft-fail.

### Ciclo de vida spec ↔ Jira

Cada change de OpenSpec se asocia a un issue de Jira (Historia). El vínculo se
guarda en `openspec/changes/<change>/jira.yaml`:

```yaml
key: IF-<X>
state: created   # created | in_progress | done
```

No guardar la URL en `jira.yaml`; derivarla del `url` del sitio devuelto por
`getAccessibleAtlassianResources` (`<url>/browse/IF-<X>`) cuando se necesite
mostrar.

Flujo:

1. `/opsx-propose <change>` — crea la spec (no toca Jira).
   - Variante: `/opsx-propose-jira <change> <IF-X>` — genera la propuesta a
     partir de un issue existente, escribe `jira.yaml` y crea un remote link
     best-effort (no transiciona estados).
2. `/jira <change>` — crea la **Historia** (padre = Epic consultado si
   no se especifica), estado inicial "Por hacer" y escribe `jira.yaml`.
3. `/opsx-apply-jira <change>` — transiciona el issue a **"En curso"** y luego
   ejecuta el flujo `apply` de OpenSpec. Al finalizar, comenta el issue con el
   detalle de lo realizado (archivos, endpoints, migraciones y resultado de
   los tests).
4. **Validación con el usuario** — reportar resultados y esperar la
   confirmación explícita de que el cambio está completo y aceptado.
5. `/opsx-archive-jira <change>` — **solo tras la validación del usuario**:
   comenta que se finalizaron las validaciones de lo desarrollado y que se
   cierra el issue, lo transiciona a **"Finalizado"** y luego ejecuta el flujo
   `archive` de OpenSpec. `jira.yaml` se archiva junto con la carpeta del
   change.

Reglas:

- Los comandos `/opsx-apply` y `/opsx-archive` (sin Jira) siguen existiendo
  para cambios sin issue asociado.
- Si no hay `jira.yaml`, apply/archive avisan y continúan (soft-fail).
- Idempotencia: si el issue ya está en el estado objetivo, no se transiciona.
- Transiciones por `statusCategory.key` (`indeterminate` → "En curso",
  `done` → "Finalizado"), robusto a idiomas.
- Comentarios vía `addCommentToJiraIssue` (markdown); si fallan, avisar y
  continuar (soft-fail), sin duplicar el comentario de cierre.
- El archive nunca se auto-ejecuta: requiere validación previa del usuario.

