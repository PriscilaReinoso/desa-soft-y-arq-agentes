---
description: "Poner el issue de Jira en 'Finalizado' y archivar un change de OpenSpec"
---

Transicionar el issue de Jira asociado al change a **"Finalizado"** y luego
ejecutar el flujo de archivado de OpenSpec (archive).

**$ARGUMENTS**

Nombre del change de OpenSpec (p. ej. `/opsx-archive-jira add-auth`). Si se
omite, inferirlo del contexto o preguntar.

Pasos:

1. Cargar la skill `jira`.
2. Resolver el change (si es ambiguo, usar `openspec list --json` y preguntar;
   mostrar solo changes activos, no archivados).
3. Leer `openspec/changes/<change>/jira.yaml`:
   - Si no existe: avisar que el change no tiene issue vinculado y continuar
     con el archive (soft-fail).
   - Si `state` ya es `done`: no transicionar de nuevo.
4. Si hay issue vinculado y `state` no es `done`:
   - Comentar el issue con `addCommentToJiraIssue` (markdown) indicando que
     **se finalizaron las validaciones de lo desarrollado** (tests y
     verificación del usuario aprobadas) y que **se cierra el issue**.
   - Transicionarlo a "Finalizado" (sección "Transicionar estado de un issue"
     de la skill).
   - Actualizar `state: done` en `jira.yaml` **antes** de mover la carpeta.
5. Cargar la skill `openspec-archive-change` y seguir su procedimiento completo
   (verificación de artefactos/tareas, sync de delta specs y `mv` de la carpeta
   a `openspec/changes/archive/`). `jira.yaml` se archiva junto con la carpeta.

**Guardrails**

- No bloquear el archive si Jira no responde: avisar y seguir.
- Si el comentario en Jira falla, avisar y continuar (soft-fail); no repetir
  el intento más de una vez.
- Respetar la idempotencia: si el issue ya está en "Finalizado", no
  transicionar ni duplicar el comentario de cierre.
- El flujo de archivado es el de la skill `openspec-archive-change`; este
  comando solo agrega el comentario de cierre y la transición previa del
  estado en Jira.
