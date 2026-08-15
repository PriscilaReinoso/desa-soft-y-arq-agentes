---
name: mcp-builder
description: >-
  Guía y procedimiento paso a paso para construir, extender, probar y depurar servidores MCP (Model Context Protocol), incluyendo herramientas (tools), recursos (resources) y prompts.
---

# MCP Server Builder & Test Guide

Esta habilidad guía al agente en el diseño, implementación y prueba de servidores MCP compatibles con la especificación del Model Context Protocol.

---

## 🛠️ Estructura Estándar de un Servidor MCP

Al crear o modificar un servidor MCP en Node.js/TypeScript o Python:

1. **Definición del Servidor**:
   - Inicializar el servidor MCP registrando el nombre y la versión.
   - Declarar las capacidades: `tools`, `resources`, `prompts`.

2. **Registro de Herramientas (`tools`)**:
   - Cada herramienta debe especificar:
     - `name`: Nombre descriptivo en `snake_case`.
     - `description`: Explicación clara de la función y cuándo invocarla.
     - `inputSchema`: Esquema JSON Schema / Zod que defina rigurosamente cada propiedad y cuáles son requeridas.

3. **Manejo de Respuestas**:
   - Formato de retorno estándar:
     ```json
     {
       "content": [
         {
           "type": "text",
           "text": "Resultado o respuesta estructurada"
         }
       ]
     }
     ```
   - Si ocurre un error capturado, retornar `isError: true` en el contenido o estructura del protocolo.

---

## 📋 Checklist para Crear una Nueva Herramienta MCP

1. **Definir el caso de uso y firma**:
   - ¿Qué entradas necesita? ¿Cuál es el tipo de datos?
2. **Implementar el Handler**:
   - Validar las entradas contra el esquema.
   - Ejecutar la lógica de negocio o integración externa.
   - Manejar excepciones limpiamente sin romper el proceso stdio/HTTP.
3. **Prueba de Funcionamiento**:
   - Probar el servidor con `@modelcontextprotocol/inspector` o mediante scripts de prueba.
   - Registrar la herramienta en `mcp_config.json` para probar la invocación directa desde Antigravity.

---

## 🧪 Comandos Útiles para Verificación

- **MCP Inspector (Node.js)**:
  ```bash
  npx @modelcontextprotocol/inspector node dist/index.js
  ```
- **Verificación de build**:
  ```bash
  npm run build
  ```
