---
name: agent-architect
description: >-
  Guía para el diseño de arquitectura de agentes, definición de roles de subagentes, orquestación de tareas y gestión de contexto en Antigravity.
---

# Agent Architect & Task Decomposition Guide

Esta habilidad proporciona pautas para estructurar flujos de trabajo multi-agente y configurar subagentes eficientes.

---

## 🤖 Definición de Subagentes

Cuando un problema requiera especialización o procesamiento en paralelo, define subagentes específicos:

### Elementos clave de un Subagente:
1. **Name**: Identificador único en formato `kebab-case` (ej. `database-migration-agent`).
2. **Role**: Descripción del rol (ej. `Database Administrator & SQL Refactoring Specialist`).
3. **Description**: Breve resumen explicativo del propósito.
4. **System Prompt**: Instrucciones detalladas sobre la persona, límites de responsabilidad y formato de salida esperado.

---

## 🔀 Patrones de Orquestación

1. **Investigación Paralela (Scatter-Gather)**:
   - Invocar múltiples subagentes de tipo `research` o `self` para explorar carpetas o módulos independientes en paralelo.
   - Consolidar los resultados en el agente principal.

2. **Revisión / Par de Desarrollo (Pair Programming & Audit)**:
   - Un subagente implementa la funcionalidad.
   - Otro subagente revisa el código contra reglas de seguridad y estándares del proyecto.

3. **Ejecución Asíncrona en Segundo Plano**:
   - Lanzar tareas de compilación o servidor con `run_command` y continuar con el análisis mientras se ejecuta la tarea.

---

## 🎯 Buenas Prácticas de Prompting para Agentes
- **Instrucciones Claras y Concisas**: Evitar ambigüedades. Especificar precondiciones y criterios de éxito.
- **Herramientas Acotadas**: Dar a cada agente únicamente las herramientas que necesita para reducir espacio de contexto y evitar alucinaciones.
- **Verificación**: Cada subagente debe realizar la prueba de verificación de sus cambios antes de reportar finalización.
