---
name: jira-create
description: Crear, consultar, vincular a un change de OpenSpec (jira.yaml) y transicionar estados de issues de Jira en el proyecto Inventario Ferreteria (IF). Use when the user asks to create a Jira issue/ticket/tarea/historia, list Jira projects, get issue types, create subtasks or epics, link a change to a Jira issue, or transition/change the status of an issue (En curso / In Progress / Finalizado / Done). Not for reading Jira relationships or graphs (use the jira MCP teamwork graph tools for that).
---

# Creación de issues en Jira (proyecto IF)

Procedimiento para crear y consultar issues en el proyecto **Inventario
Ferreteria** (`IF`) usando la API REST de Jira Cloud.

## Configuración (variables de entorno)

- `JIRA_API_TOKEN` — token de API de Jira (ya configurado como variable de
  entorno de usuario en Windows).
- `JIRA_SITE_URL` — URL del sitio.
- `JIRA_EMAIL` — email de la cuenta de Jira.

Las tres variables son obligatorias para autenticar contra la API REST.

## Autenticación

La API REST de Jira usa HTTP Basic con `email:token`. En PowerShell:

```powershell
$basic = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("$env:JIRA_EMAIL`:$env:JIRA_API_TOKEN"))
$headers = @{ Authorization = "Basic $basic" }

# JIRA_SITE_URL puede traer o no el esquema; normalizar para evitar doble "https://"
$site = "$env:JIRA_SITE_URL" -replace '^https?://', ''
$base = "https://${site}/rest/api/3"
```

Usar `$site` (sin esquema) al construir URLs públicas, p. ej.
`https://${site}/browse/<KEY>`.

## Datos del proyecto

- Project key: `IF` (Inventario Ferreteria).
- Tipos de issue disponibles:

| Tipo     | id    |
| -------- | ----- |
| Tarea    | 10009 |
| Historia | 10010 |
| Función  | 10011 |
| Error    | 10012 |
| Epic     | 10008 |
| Subtarea | 10007 |

## Pasos

1. **Confirmar el pedido**: derivar resumen (y descripción opcional) del
   pedido del usuario. Preguntar si hay ambigüedad sobre el tipo de issue o el
   contenido; por defecto usar `Tarea`.

2. **Verificar credenciales** (si falla un 401/403):
   ```powershell
   Invoke-RestMethod -Uri "$base/project" -Method Get -Headers $headers
   ```

3. **Crear el issue**:
   ```powershell
   $body = @{
     fields = @{
       project    = @{ key = "IF" }
       issuetype  = @{ name = "Tarea" }
       summary    = "<resumen>"
       description = @{
         type = "doc"; version = 1;
         content = @(
           @{ type = "paragraph"; content = @(
             @{ type = "text"; text = "<descripcion>" }
           ) }
         )
       }
     }
   } | ConvertTo-Json -Depth 10

   $r = Invoke-RestMethod -Uri "$base/issue" -Method Post `
     -Headers ($headers + @{ "Content-Type" = "application/json" }) `
     -Body ([Text.Encoding]::UTF8.GetBytes($body))
   ```
   - Enviar el body como `[Text.Encoding]::UTF8.GetBytes(...)` para preservar
     tildes y caracteres del español.

4. **Devolver la URL del issue creado**:
   ```
   https://${site}/browse/<KEY>
   ```

## Crear una Historia vinculada a un Epic

Para el ciclo spec↔Jira, cada change se asocia a una **Historia**. Si no se
indica el Epic padre, consultarlo automáticamente:

1. **Resolver el parent (Epic)** si no se especifica:
   ```powershell
   # "IF" es palabra reservada en JQL: citarla. Usar /search/jql (el endpoint
   # clásico /search devuelve 410 en este sitio).
   $jql = 'project = "IF" AND issuetype = Epic AND statusCategory != done ORDER BY created DESC'
   $body = @{ jql = $jql; maxResults = 10; fields = @("summary") } | ConvertTo-Json -Depth 5
   $epics = (Invoke-RestMethod -Uri "$base/search/jql" -Method Post `
     -Headers ($headers + @{ "Content-Type" = "application/json" }) `
     -Body ([Text.Encoding]::UTF8.GetBytes($body))).issues
   ```
   - Exactamente 1 epic abierto → usarlo como parent.
   - Varios → preguntar al usuario cuál elegir.
   - Ninguno → avisar y crear la Historia sin parent (o preguntar si crear un Epic).

2. **Crear la Historia** con `issuetype.name = "Historia"` y, si hay parent,
   agregar `parent = @{ key = "<EPIC_KEY>" }` en `fields`. El resumen deriva
   del change (p. ej. `CRUD de roles y usuarios (add-rol-usuario-crud)`) y la
   descripción referencia el change (ruta `openspec/changes/<name>/`).

3. **Estado inicial**: los issues se crean en el estado inicial del workflow
   del proyecto (típicamente "Por hacer").

## Vincular un change (jira.yaml)

Tras crear el issue, escribir el vínculo dentro del change para que los flujos
de apply/archive lo encuentren:

`openspec/changes/<change-name>/jira.yaml`:

```yaml
key: IF-<X>
state: created   # created | in_progress | done
```

- **No guardar la URL en el archivo**: la URL pública se deriva de
  `JIRA_SITE_URL` normalizado cuando se necesita mostrar
  (`https://${site}/browse/<KEY>`), para no hardcodear el sitio.
- Si `jira.yaml` ya existe para el change, avisar y no recrear.
- Este archivo se archiva junto con la carpeta del change.

## Transicionar estado de un issue

1. **Obtener transiciones disponibles**:
   ```powershell
   $t = Invoke-RestMethod -Uri "$base/issue/<KEY>/transitions" -Method Get -Headers $headers
   $t.transitions | Format-Table id, @{n="to";e={$_.to.name}}, @{n="category";e={$_.to.statusCategory.key}}
   ```

2. **Elegir la transición por `to.statusCategory.key`** (robusto a idiomas):
   - "En curso" (In Progress): `to.statusCategory.key -eq "indeterminate"`.
   - "Finalizado" (Done): `to.statusCategory.key -eq "done"`.

3. **Ejecutar la transición**:
   ```powershell
   # Preferir la transición "En curso"/"In Progress" por nombre si hay varias
   # con statusCategory "indeterminate"; fallback a la primera de esa categoría.
   $trans = $t.transitions | Where-Object { $_.to.statusCategory.key -eq "indeterminate" -and $_.to.name -match 'curso|progress|doing' } | Select-Object -First 1
   if (-not $trans) { $trans = $t.transitions | Where-Object { $_.to.statusCategory.key -eq "indeterminate" } | Select-Object -First 1 }
   if (-not $trans) { throw "No hay transición hacia el estado buscado" }
   $body = @{ transition = @{ id = "$($trans.id)" } } | ConvertTo-Json
   Invoke-RestMethod -Uri "$base/issue/<KEY>/transitions" -Method Post `
     -Headers ($headers + @{ "Content-Type" = "application/json" }) `
     -Body ([Text.Encoding]::UTF8.GetBytes($body))
   ```

4. **Actualizar `state` en `jira.yaml`** del change correspondiente
   (created → in_progress → done).

## Operaciones útiles

- **Listar proyectos**: `GET $base/project` → mostrar `key | name`.
- **Tipos de issue del proyecto**:
  `GET $base/issue/createmeta?projectKeys=IF&expand=projects.issuetypes.fields`
- **Crear subtarea**: `issuetype.name = "Subtarea"` y agregar
  `parent = @{ key = "<KEY_DEL_EPIC_O_HISTORIA>" }` en `fields`.
- **Crear epic**: `issuetype.name = "Epic"`.

## Relaciones entre work items

Para ver conectar issues entre sí (bloqueos, vínculos, a qué proyecto/goal
pertenecen) usar las herramientas MCP `getTeamworkGraphContext` /
`getTeamworkGraphObject`. No duplicar esa funcionalidad con la API REST.

## Guardrails

- No registrar el token ni el email en logs ni en archivos.
- No incluir secretos en el resumen ni descripción del issue.
- No crear issues sin un resumen claro; ante duda, preguntar al usuario.
- Idempotencia: si el issue ya está en el estado objetivo, no transicionar de
  nuevo; si `jira.yaml` ya existe, no recrear el vínculo.
- Soft-fail: si la API de Jira no responde o la transición falla, avisar al
  usuario y continuar con el flujo de OpenSpec sin bloquearlo.
