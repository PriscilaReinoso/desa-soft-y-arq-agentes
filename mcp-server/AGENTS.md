# Antigravity Workspace Guidelines & Agent Rules

Bienvenido a la configuración de Antigravity para el desarrollo de **Servidores MCP (Model Context Protocol)** y **Arquitectura de Agentes con IA**.

## 🎯 Propósito del Proyecto
Este repositorio contiene la implementación y prácticas de servidores MCP y agentes inteligentes, enfocados en interoperabilidad, invocación de herramientas, gestión de contexto y desarrollo seguro.

---

## 📜 Reglas del Agente (Always-On Guidelines)

### 1. Principios de Arquitectura MCP
- **Específicos y Estructurados**: Las herramientas MCP (`tools`) deben tener nombres descriptivos en snake_case y esquemas de parámetros explícitos mediante JSON Schema / Zod.
- **Manejo de Errores Limpio**: Los errores en ejecuciones de herramientas deben devolverse dentro del payload de respuesta del protocolo (`isError: true` o mensajes claros) sin colapsar el proceso del servidor.
- **Sin Efectos Secundarios Ocultos**: Las herramientas de modificación o escrituras en sistema deben solicitar o requerir confirmación explícita según las directivas de seguridad.

### 2. Calidad de Código y Estilo
- **Documentación Completa**: Preservar y agregar JSDoc / Docstrings en cada handler de tool o recurso.
- **Tipado Estricto**: Usar TypeScript o Python con type hints rigurosos. Evitar tipos implícitos como `any`.
- **Verificación Práctica**: Todo cambio o nueva herramienta debe ser verificada antes de dar por completada la tarea mediante pruebas unitarias o scripts de prueba local.

### 3. Buenas Prácticas de Agentes con Antigravity
- **División de Tareas**: Delegar tareas pesadas o de investigación amplia a subagentes especificando un rol y propósito claro.
- **Uso de Skills**: Consultar las habilidades disponibles en `.agents/skills/` según la tarea requerida (`mcp-builder`, `agent-architect`).

---

## 🛠️ Herramientas y Subagentes Disponibles
- **Skills**:
  - [`mcp-builder`](.agents/skills/mcp-builder/SKILL.md): Guía paso a paso para construir, validar y probar herramientas y recursos MCP.
  - [`agent-architect`](.agents/skills/agent-architect/SKILL.md): Guía para diseño de arquitectura de agentes, prompts y patrones de orquestación.
- **Configuración MCP**: Configurado en `mcp_config.json`.
