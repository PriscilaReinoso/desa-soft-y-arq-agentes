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

Utiliza autenticacion con JWT para todos los endpoint definidos excepto para el login.

Este proyecto trabaja con desarrollo guiado por especificaciones
(Spec-Driven Development). Todo cambio en el sistema (feature, fix o
refactor) se gestiona como un **change** de OpenSpec bajo
`openspec/changes/<change>/` y sigue el ciclo que se detalla abajo.
**Ninguna fase se salta y el archive de un change requiere validación
explícita del usuario.**

### Ciclo de vida de un change

1. **Propose** — crear los artefactos del change (proposal, specs, design,
   tasks) con el skill `openspec-propose` (o `/opsx-propose <change>`).
   - Variante Jira: si el requerimiento ya existe como issue de Jira,
     usar `/opsx-propose-jira <change> <IF-X>`, que genera la propuesta a
     partir del issue y lo vincula en `jira.yaml`.
   - Las specs definen el comportamiento esperado (WHAT), no la
     implementación (HOW).
   - `openspec validate <change> --strict` debe pasar antes de implementar.

2. **Jira (si aplica)** — crear la Historia con el skill `jira` (o
   `/jira <change>`) y vincularla en `jira.yaml`.

3. **Apply / Implementación** — ejecutar las tareas de `tasks.md` con el
   skill `openspec-apply-change` (o `/opsx-apply-jira <change>`). Reglas:
   - Leer el archivo objetivo y su contexto antes de editar.
   - Implementar siguiendo la arquitectura por capas y las convenciones.
   - Ejecutar los tests antes y después (`python -m pytest tests -q`) y
     verificar que no se rompan otras partes del proyecto.
   - La implementación DEBE cumplir la spec. Si surge un cambio de
     comportamiento, actualizar la spec y las tasks antes de seguir (skill
     `openspec-update-change`); no implementar requisitos fuera de la spec.

4. **Validación con el usuario** — reportar qué se implementó (archivos,
   endpoints, migraciones) y el resultado de los tests. **Esperar la
   validación/confirmación explícita del usuario antes de continuar.**

5. **Sync de specs** — con el skill `openspec-sync-specs`, fusionar las
   delta specs en `openspec/specs/<capability>/spec.md`.

6. **Archive** — con el skill `openspec-archive-change` (o
   `/opsx-archive-jira <change>`):
   - **NUNCA archivar sin validación previa del usuario.** El archive se
     ejecuta solo tras la confirmación explícita de que el cambio está
     completo y aceptado.
   - Antes de archivar: verificar que los artefactos y las tasks están
     completos y que las specs quedaron sincronizadas.
   - Variante Jira: transicionar el issue a **"Finalizado"** y archivar
     `jira.yaml` junto con la carpeta del change.

### Reglas de oro

- **Un change = una unidad de trabajo.** Archivar cierra y acepta el trabajo;
  los cambios de comportamiento posteriores se tratan como changes nuevos
  (volver a Propose).
- **No editar código fuera de un change** salvo que el usuario lo pida
  explícitamente; si el cambio puntual afecta comportamiento, crear o
  actualizar la spec correspondiente.
- **Nunca auto-archivar.** Si no hay confirmación del usuario, el change
  permanece activo y se pregunta antes de archivar.
- No ejecutar `git commit` ni `git push` salvo que el usuario lo pida.

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

## Seguridad

- Nunca escribir secretos o claves en código ni en archivos versionados.
- No registrar claves de API ni tokens en logs.
- `JWT_SECRET` y credenciales de base de datos van por variables de entorno
  (`.env` no versionado).
