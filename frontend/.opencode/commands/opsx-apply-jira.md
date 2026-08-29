---
description: "Poner el issue de Jira en 'En curso' y aplicar las tareas de un change de OpenSpec"
---

Transicionar el issue de Jira asociado al change a **"En curso"** y luego
ejecutar el flujo de implementación de OpenSpec (apply).

**$ARGUMENTS**

Nombre del change de OpenSpec (p. ej. `/opsx-apply-jira add-auth`). Si se
omite, inferirlo del contexto o preguntar.

Pasos:

1. Cargar la skill `jira`.
2. Resolver el change (si es ambiguo, usar `openspec list --json` y preguntar).
3. Leer `openspec/changes/<change>/jira.yaml`:
   - Si no existe: avisar que el change no tiene issue vinculado, ofrecer
      `/jira <change>` y continuar con el apply (soft-fail).
   - Si `state` ya es `in_progress` o `done`: no transicionar de nuevo.
4. Si hay issue vinculado y `state: created`: transicionarlo a "En curso"
   (sección "Transicionar estado de un issue" de la skill) y actualizar
   `state: in_progress` en `jira.yaml`.
5. Cargar la skill `openspec-apply-change` y seguir su procedimiento completo
   (selección, status, instructions apply, lectura de contextFiles,
   implementación de tareas y marcado `- [x]`).
6. **Al finalizar el apply**, si hay issue vinculado: comentar el issue en
   Jira con el detalle de lo realizado usando `addCommentToJiraIssue`
   (markdown). El comentario debe incluir:
   - Resumen de qué se implementó.
   - Archivos creados/modificados (rutas relativas).
   - Endpoints agregados o modificados, si aplica.
   - Migraciones de Alembic generadas, si aplica.
   - Resultado de los tests (comando ejecutado y resumen: pasados/fallidos).

**Guardrails**

- No bloquear el apply si Jira no responde: avisar y seguir.
- Si el comentario en Jira falla, avisar y continuar (soft-fail); no repetir
  el intento más de una vez.
- Respetar la idempotencia: si el issue ya está en "En curso", no transicionar.
- El flujo de implementación es el de la skill `openspec-apply-change`; este
  comando solo agrega la transición previa del estado en Jira y el comentario
  final con el detalle de lo realizado.
