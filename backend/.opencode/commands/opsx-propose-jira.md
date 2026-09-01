---
description: "Proponer un change de OpenSpec a partir de un issue de Jira existente y vincularlo via jira.yaml"
---

Generar la propuesta completa de OpenSpec (proposal, specs, design, tasks) para
un change, tomando como fuente de requerimientos un **issue de Jira
existente** del proyecto Inventario Ferreteria (`IF`), y dejar el vínculo en
`openspec/changes/<change>/jira.yaml`.

**$ARGUMENTS**

Nombre del change (kebab-case) y/o identificador del issue (`IF-<X>` o URL
`https://<sitio>/browse/IF-<X>`), en cualquier orden. Ejemplos:

- `/opsx-propose-jira add-auth IF-12`
- `/opsx-propose-jira IF-12`
- `/opsx-propose-jira add-auth`

Si falta el nombre del change, derivarlo del resumen del issue (kebab-case).
Si falta el issue, preguntar cuál usar (no inventar keys).

Pasos:

1. Cargar la skill `jira`.
2. **Leer el issue vía MCP**: `getAccessibleAtlassianResources` para obtener
   el `cloudId` y `getJiraIssue` con la key (`IF-<X>`) para extraer resumen,
   descripción y criterios de aceptación.
   - Si el issue no existe o la lectura falla, abortar e informar.
3. Resolver el nombre del change (argumento o derivado del resumen) y
   verificar idempotencia:
   - Si `openspec/changes/<change>/` ya existe: preguntar si continuar con ese
     change o elegir otro nombre.
   - Si `openspec/changes/<change>/jira.yaml` ya existe: avisar y no recrear.
4. **Ejecutar el flujo completo de la skill `openspec-propose`**
   (`new change` → `status --json` → `instructions <artifact>` → creación de
   artefactos en orden de dependencias → `status` final), usando el contenido
   del issue como fuente de requerimientos:
   - El resumen/descripción/criterios del issue alimentan `proposal.md`
     (qué & por qué), las delta specs (comportamiento esperado) y `tasks.md`.
   - Citar el issue de origen en `proposal.md` (key y URL pública derivada
     del sitio) como referencia del requerimiento.
   - Respetar todos los guardrails de `openspec-propose` (artefactos
     transitivamente requeridos, relectura de dependencias, etc.).
   - El nombre del cambio en `openspec/` debe ser el titulo del jira. 
5. Escribir `openspec/changes/<change>/jira.yaml`:
   ```yaml
   key: IF-<X>
   state: created
   ```
   (la URL no se guarda; se deriva del sitio al mostrarla).
6. Best-effort: crear remote link del issue hacia el repo/change con
   `addTeamworkGraphContext` (sección "Remote link vía MCP" de la skill). Si
   falla, avisar y continuar.
7. Reportar: change creado y ubicación, lista de artefactos generados, key y
   URL del issue vinculado.

**Guardrails**

- Este comando NO transiciona estados en Jira (eso lo hacen `/opsx-apply-jira`
  y `/opsx-archive-jira`); el issue conserva su estado actual.
- No bloquear la propuesta si el MCP de Jira no responde: si el issue es
  irrecuperable, pedir los requerimientos al usuario y continuar sin vínculo
  (sin escribir `jira.yaml`).
- Idempotencia: no recrear `jira.yaml` ni duplicar remote links.
- La implementación posterior sigue el ciclo normal: `/opsx-apply-jira
  <change>`, validación del usuario, sync y archive.
