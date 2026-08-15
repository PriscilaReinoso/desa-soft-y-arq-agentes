# Reglas de Desarrollo MCP & Seguridad

## 🔒 Seguridad e Integración
1. **Sanitización de Entradas**: Toda entrada recibida por una herramienta MCP debe ser validada contra esquemas de tipo estrictos.
2. **Sin Exposición de Secretos**: Las claves API o tokens de autenticación deben consumirse desde variables de entorno (`process.env` o `os.environ`), jamás harcodeadas en código ni enviadas en logs.
3. **Límites de Salida**: Si una herramienta retorna colecciones o datos masivos, implementar paginación o límites (`limit`, `offset`) para evitar saturar el contexto de los LLM.

## 📐 Estructura de Respuesta
- Retornar siempre respuestas en formato de objetos estructurados o Markdown claro.
- Incluir metadatos de ejecución (tiempo, estado, versión de API) si es relevante.
