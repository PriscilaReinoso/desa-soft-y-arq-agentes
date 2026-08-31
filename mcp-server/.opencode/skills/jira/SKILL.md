---
name: jira
description: Crear, consultar (leer), buscar, vincular a un change de OpenSpec (jira.yaml) y transicionar estados de issues de Jira en el proyecto Inventario Ferreteria (IF). Use when the user asks to create a Jira issue/ticket/tarea/historia, read or search issues (resumen, descripción, estado, relaciones), list Jira projects, get issue types, create subtasks or epics, link a change to a Jira issue, or transition/change the status of an issue (En curso / In Progress / Finalizado / Done). Todas las operaciones vía herramientas MCP de Jira (sin API REST directa).
---

# Jira — proyecto Inventario Ferreteria (`IF`)

Procedimiento para crear, consultar, buscar, vincular y transicionar issues del
proyecto **Inventario Ferreteria** (`IF`) usando **exclusivamente las
herramientas MCP de Jira**. No usar la API REST directamente (nada de
`Invoke-RestMethod`, tokens ni Basic auth): el servidor MCP maneja la
autenticación.

## Mapa de operaciones → herramientas MCP

| Operación | Herramienta MCP |
| --- | --- |
| Descubrir sitio/cloudId | `getAccessibleAtlassianResources` |
| Leer un issue (resumen, descripción, estado) | `getJiraIssue` |
| Relaciones/contexto de un issue (Epic padre, vínculos) | `getTeamworkGraphContext` + `getTeamworkGraphObject` |
| Buscar issues (JQL) | `searchJiraIssuesUsingJql` |
| Búsqueda por texto libre | `search` (Rovo Search) |
| Listar proyectos visibles | `getVisibleJiraProjects` |
| Tipos de issue del proyecto | `getJiraProjectIssueTypesMetadata` |
| Campos de un tipo de issue | `getJiraIssueTypeMetaWithFields` |
| Crear issue (Historia/Epic/Tarea/Subtarea) | `createJiraIssue` |
| Editar campos de un issue | `editJiraIssue` |
| Transiciones disponibles | `getTransitionsForJiraIssue` |
| Transicionar estado | `transitionJiraIssue` |
| Vínculos entre issues | `createIssueLink` / `getIssueLinkTypes` |
| Comentarios | `addCommentToJiraIssue` |
| Remote link issue ↔ repo/change | `addTeamworkGraphContext` |
| Buscar accountId de un usuario | `lookupJiraAccountId` |

## Sitio y cloudId

1. Llamar `getAccessibleAtlassianResources` → devuelve la lista de sitios con
   `id` (cloudId UUID) y `url`.
2. Usar ese `cloudId` en todas las demás herramientas MCP.
3. URLs públicas de issues: `<url>/browse/<KEY>` (derivar del `url` del sitio;
   no hardcodear).

## Datos del proyecto

- Project key: `IF` (Inventario Ferreteria).
- Tipos de issue disponibles (verificar con `getJiraProjectIssueTypesMetadata`
  si hace falta):

| Tipo     | id    |
| -------- | ----- |
| Tarea    | 10009 |
| Historia | 10010 |
| Función  | 10011 |
| Error    | 10012 |
| Epic     | 10008 |
| Subtarea | 10007 |

## Leer issues

- `getJiraIssue` con `issueIdOrKey` (`IF-<X>`) y `cloudId`:
  - Devuelve resumen, descripción (markdown por defecto), estado, tipo,
    prioridad, asignado, etc.
  - Usar `fields` para limitar campos (p. ej. `["summary", "description",
    "status"]`) o `"*all"` para todo.
  - Para comentarios, incluir `"comment"` en `fields`.
- Para relaciones (Epic padre, work items vinculados, remote links):
  `getTeamworkGraphContext` con `objectType: "JiraWorkItem"` y
  `objectIdentifier: "IF-<X>"`; luego hidratar entidades relevantes con
  `getTeamworkGraphObject`.

## Buscar issues

- **JQL**: `searchJiraIssuesUsingJql` con `cloudId` y `jql`. Ejemplos:
  - Epics abiertos del proyecto:
    `project = "IF" AND issuetype = Epic AND statusCategory != done ORDER BY created DESC`
    ("IF" es palabra reservada en JQL: citarla).
  - Issues de un tipo con estado específico:
    `project = "IF" AND issuetype = Historia AND statusCategory != done`
  - Con `searchResultMode: "count"` solo si se necesita el total.
- **Texto libre**: `search` (Rovo Search) cuando el usuario da palabras sueltas
  en vez de criterios estructurados.

## Crear issues

Usar `createJiraIssue`:

- Parámetros base: `projectKey: "IF"`, `issueTypeName` (`Tarea`, `Historia`,
  `Epic`, `Subtarea`, ...), `summary`, `description` (texto o Markdown; se
  convierte solo).
- `parent`: key del Epic (para Historias) o de la Historia/Epic (para
  Subtareas).
- `assignee_account_id`: resolver antes con `lookupJiraAccountId` si se pide
  asignar.
- `additional_fields`: para prioridad, labels, componentes, fixVersions o
  custom fields (p. ej. `{"priority": {"name": "High"}}`).
- Estado inicial: el workflow asigna el inicial (típicamente "Por hacer"); no
  transicionar tras crear salvo pedido explícito.

### Crear una Historia vinculada a un Epic

Para el ciclo spec↔Jira, cada change se asocia a una **Historia**. Si no se
indica el Epic padre, resolverlo automáticamente:

1. Buscar epics abiertos con `searchJiraIssuesUsingJql` (JQL de la sección
   anterior).
   - Exactamente 1 epic abierto → usarlo como `parent`.
   - Varios → preguntar al usuario cuál elegir.
   - Ninguno → avisar y crear la Historia sin parent (o preguntar si crear un
     Epic).
2. Crear la Historia con `issueTypeName: "Historia"` y `parent` = key del
   Epic. El resumen deriva del change (p. ej. `CRUD de roles y usuarios
   (add-rol-usuario-crud)`) y la descripción referencia el change (ruta
   `openspec/changes/<name>/`).

## Transicionar estado de un issue

1. **Obtener transiciones disponibles**: `getTransitionsForJiraIssue`
   (devuelve id, nombre y estado destino con su categoría).
2. **Elegir la transición por categoría del estado destino** (robusto a
   idiomas):
   - "En curso" (In Progress): `statusCategory.key == "indeterminate"`;
     preferir la cuyo nombre matchee `curso|progress|doing`.
   - "Finalizado" (Done): `statusCategory.key == "done"`.
3. **Ejecutar**: `transitionJiraIssue` con el `transition.id` elegido.
4. **Actualizar `state` en `jira.yaml`** del change correspondiente
   (created → in_progress → done).

## Remote link vía MCP (best-effort)

Para dejar en Jira un enlace visible hacia el repo/change (complemento del
`jira.yaml`, que sigue siendo el vínculo canónico):

- Herramienta: `addTeamworkGraphContext`.
- `relationshipType`: `jira-work-item-links-jira-work-item-remote-link`.
- `objectIdentifier`: key o URL del issue (`IF-<X>`).
- `targetObjectIdentifier`: URL pública del recurso (repo, carpeta del change
  en el remoto, PR, etc.). No usar rutas locales de disco.
- `title`: etiqueta legible (p. ej. `OpenSpec change <nombre>`).

Si falla, avisar y continuar: el vínculo `jira.yaml` ya deja la asociación
registrada.

## Vincular un change (jira.yaml)

Tras crear (o resolver) el issue, escribir el vínculo dentro del change para
que los flujos de apply/archive lo encuentren:

`openspec/changes/<change-name>/jira.yaml`:

```yaml
key: IF-<X>
state: created   # created | in_progress | done
```

- **No guardar la URL en el archivo**: derivarla del `url` del sitio
  (`<url>/browse/<KEY>`) cuando se necesite mostrar.
- Si `jira.yaml` ya existe para el change, avisar y no recrear.
- Este archivo se archiva junto con la carpeta del change.
- Opcional (best-effort): crear además el remote link vía MCP (sección
  anterior).

## Operaciones útiles

- **Listar proyectos**: `getVisibleJiraProjects` → mostrar `key | name`.
- **Tipos de issue**: `getJiraProjectIssueTypesMetadata`.
- **Campos requeridos por tipo**: `getJiraIssueTypeMetaWithFields`
  (`requiredFieldsOnly: true`).
- **Vincular dos issues** (Blocks, Relates, etc.): `getIssueLinkTypes` y
  `createIssueLink` (inward = bloquea, outward = bloqueado).
- **Comentar progreso**: `addCommentToJiraIssue` (markdown).

## Guardrails

- Todas las operaciones van por herramientas MCP; no llamar a la API REST de
  Jira por cuenta propia.
- No incluir secretos en el resumen ni descripción de los issues.
- No crear issues sin un resumen claro; ante duda, preguntar al usuario.
- Idempotencia: si el issue ya está en el estado objetivo, no transicionar de
  nuevo; si `jira.yaml` ya existe, no recrear el vínculo.
- Soft-fail: si una herramienta MCP falla, avisar al usuario y continuar con
  el flujo de OpenSpec sin bloquearlo.
