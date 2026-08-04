---
description: "Crear un issue de Jira en el proyecto Inventario Ferreteria (IF)"
---

Cargar la skill `jira-create` y crear un issue de Jira en el proyecto
Inventario Ferreteria (`IF`) a partir del siguiente pedido:

**$ARGUMENTS**

Pasos:

1. Cargar la skill `jira-create` y seguir su procedimiento.
2. Derivar del pedido el resumen del issue (y descripción si aplica).
3. Si el pedido no especifica el tipo de issue, usar `Tarea`.
4. Crear el issue con la API REST de Jira usando `JIRA_EMAIL`,
   `JIRA_API_TOKEN` y `JIRA_SITE_URL`.
5. Devolver la URL del issue creado (formato
   `https://<sitio>/browse/<KEY>`).
