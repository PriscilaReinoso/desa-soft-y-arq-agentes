# AGENTS.md

Instrucciones globales para los agentes de opencode en el frontend del
**Sistema de Gestión de Inventario para Ferretería**.

## Descripción del proyecto

Front end para la gestión de inventario de una ferretería. Administra
artículos, depósitos, ventas, proveedores y listas de precios; expone
vistas del inventario, preventas y presupuestos (exportables a PDF), se integrara con un
asistente inteligente para consultas sobre inventario, productos similares y
sugerencias de compra.
Se comunicara con el backend (Python y FastAPI) por la URL http://127.0.0.1:8000. El swagger es http://127.0.0.1:8000/docs

## Stack tecnológico

- React  
- TypeScript  
- Vite  
- TanStack Query.  
- React Hook Form.  
- Material UI. 
- Docker para contenerización.

## Estructura del proyecto

```

```

## Convenciones

- paleta cálida-neutra (azul pizarra #4A6B8A + ambar #C8763A), 
- tipografia Nunito para máxima legibilidad, JetBrains Mono para datos numéricos
- fondo #F5F3EF que evita el blanco duro.

## Arquitectura

La aplicación sigue una arquitectura por capas:

Accion en Navegador (React)
    ↓
HTTP Request
    ↓
Router (FastAPI)


## Seguridad

- Utiliza autenticacion con JWT para todos los endpoint definidos excepto para el login.
- Nunca escribir secretos o claves en código ni en archivos versionados.
- No registrar claves de API ni tokens en logs.
- `JWT_SECRET` y credenciales de base de datos van por variables de entorno
  (`.env` no versionado).

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

