---
description: "Crear un issue de Jira (Historia) para un change de OpenSpec en el proyecto Inventario Ferreteria (IF) y vincularlo via jira.yaml"
---

Crear el issue de Jira asociado a un change de OpenSpec en el proyecto
Inventario Ferreteria (`IF`) y dejar el vínculo en
`openspec/changes/<change>/jira.yaml`.

**$ARGUMENTS**

Interpretar `$ARGUMENTS`:

- Si es un nombre de change existente (o se infiere del contexto), crear la
  **Historia** para ese change.
- Si se menciona un Epic (key o nombre), usarlo como parent; si no, consultarlo
  automáticamente (sección "Crear una Historia vinculada a un Epic" de la skill).
- Si `$ARGUMENTS` es otro pedido de issue (sin change), aplicar el
  comportamiento actual de la skill (tipo por defecto `Tarea`).

Pasos:

1. Cargar la skill `jira-create` y seguir su procedimiento.
2. Si aplica a un change: leer `openspec/changes/<change>/proposal.md` y
   `tasks.md` para derivar resumen y descripción.
3. Verificar que `openspec/changes/<change>/jira.yaml` no exista ya; si existe,
   avisar y no recrear.
4. Crear la **Historia** con parent = Epic consultado (si no se especificó),
   estado inicial del workflow ("Por hacer").
5. Escribir `jira.yaml` en el change con `key` y `state: created` (la URL no se
   guarda; se deriva de `JIRA_SITE_URL` al mostrarla).
6. Devolver la URL del issue creado (formato
   `https://<sitio>/browse/<KEY>`) y la ruta de `jira.yaml`.
