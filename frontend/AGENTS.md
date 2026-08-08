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
- Docker para contenerización.

## Estructura del proyecto

```

```

## Convenciones

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
   - Las specs definen el comportamiento esperado (WHAT), no la
     implementación (HOW).
   - `openspec validate <change> --strict` debe pasar antes de implementar.

2. **Jira (si aplica)** — crear la Historia con el skill `jira-create` (o
   `/jira-create <change>`) y vincularla en `jira.yaml`.

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
- Skill `jira-create`: crear, vincular y transicionar issues de Jira en el
  proyecto Inventario Ferreteria.
- Los comandos `/opsx-*` documentados en este archivo se ejecutan con los
  skills correspondientes (no dependen de comandos locales).

## Integración con Jira

El proyecto Jira **Inventario Ferreteria** tiene el key `IF`. Para operar
contra la API REST de Jira se usan variables de entorno de usuario:

- `JIRA_API_TOKEN` — token de API de Jira.
- `JIRA_SITE_URL` — URL del sitio.
- `JIRA_EMAIL` — email de la cuenta de Jira.

La autenticación es HTTP Basic con `email:token` contra
`https://<JIRA_SITE_URL>/rest/api/3`. `JIRA_SITE_URL` puede incluir o no el
esquema `https://`; normalizarlo (quitar `https?://`) antes de construir URLs
para evitar dobles esquemas. Para crear issues usar la skill `jira-create` (o
el comando `/jira-create`). No exponer estas variables en logs ni en archivos
versionados.

### Ciclo de vida spec ↔ Jira

Cada change de OpenSpec se asocia a un issue de Jira (Historia). El vínculo se
guarda en `openspec/changes/<change>/jira.yaml`:

```yaml
key: IF-<X>
state: created   # created | in_progress | done
```

No guardar la URL en `jira.yaml`; derivarla de `JIRA_SITE_URL` normalizado
(`https://<site-normalizado>/browse/IF-<X>`) cuando se necesite mostrar.

Flujo:

1. `/opsx-propose <change>` — crea la spec (no toca Jira).
2. `/jira-create <change>` — crea la **Historia** (padre = Epic consultado si
   no se especifica), estado inicial "Por hacer" y escribe `jira.yaml`.
3. `/opsx-apply-jira <change>` — transiciona el issue a **"En curso"** y luego
   ejecuta el flujo `apply` de OpenSpec.
4. **Validación con el usuario** — reportar resultados y esperar la
   confirmación explícita de que el cambio está completo y aceptado.
5. `/opsx-archive-jira <change>` — **solo tras la validación del usuario**:
   transiciona el issue a **"Finalizado"** y luego ejecuta el flujo `archive`
   de OpenSpec. `jira.yaml` se archiva junto con la carpeta del change.

Reglas:

- Los comandos `/opsx-apply` y `/opsx-archive` (sin Jira) siguen existiendo
  para cambios sin issue asociado.
- Si no hay `jira.yaml`, apply/archive avisan y continúan (soft-fail).
- Idempotencia: si el issue ya está en el estado objetivo, no se transiciona.
- Transiciones por `statusCategory.key` (`indeterminate` → "En curso",
  `done` → "Finalizado"), robusto a idiomas.
- El archive nunca se auto-ejecuta: requiere validación previa del usuario.

## Seguridad

- Nunca escribir secretos o claves en código ni en archivos versionados.
- No registrar claves de API ni tokens en logs.
- `JWT_SECRET` y credenciales de base de datos van por variables de entorno
  (`.env` no versionado).
