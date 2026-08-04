---
name: jira-create
description: Crear y consultar issues de Jira en el proyecto Inventario Ferreteria (IF). Use when the user asks to create a Jira issue/ticket/tarea/historia, list Jira projects, get issue types, create subtasks or epics, or link/relate Jira work items. Not for reading Jira relationships or graphs (use the jira MCP teamwork graph tools for that).
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
$base = "https://$env:JIRA_SITE_URL/rest/api/3"
```

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
   https://$env:JIRA_SITE_URL/browse/<KEY>
   ```

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
