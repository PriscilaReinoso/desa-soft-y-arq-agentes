---
description: "Poner el issue de Jira en 'Finalizado' y archivar un change de OpenSpec"
---

Transicionar el issue de Jira asociado al change a **"Finalizado"** y luego
ejecutar el flujo de archivado de OpenSpec (archive).

**$ARGUMENTS**

Nombre del change de OpenSpec (p. ej. `/opsx-archive-jira add-auth`). Si se
omite, inferirlo del contexto o preguntar.

Pasos:

1. Cargar la skill `jira-create`.
2. Resolver el change (si es ambiguo, usar `openspec list --json` y preguntar;
   mostrar solo changes activos, no archivados).
3. Leer `openspec/changes/<change>/jira.yaml`:
   - Si no existe: avisar que el change no tiene issue vinculado y continuar
     con el archive (soft-fail).
   - Si `state` ya es `done`: no transicionar de nuevo.
4. Si hay issue vinculado y `state` no es `done`: transicionarlo a "Finalizado"
   (sección "Transicionar estado de un issue" de la skill) y actualizar
   `state: done` en `jira.yaml` **antes** de mover la carpeta.
5. Cargar la skill `openspec-archive-change` y seguir su procedimiento completo
   (verificación de artefactos/tareas, sync de delta specs y `mv` de la carpeta
   a `openspec/changes/archive/`). `jira.yaml` se archiva junto con la carpeta.

**Guardrails**

- No bloquear el archive si Jira no responde: avisar y seguir.
- Respetar la idempotencia: si el issue ya está en "Finalizado", no transicionar.
- El flujo de archivado es el de la skill `openspec-archive-change`; este
  comando solo agrega la transición previa del estado en Jira.
