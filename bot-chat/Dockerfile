# Dockerfile del bot-chat.
#
# El bot-chat lanza el MCP server como proceso hijo por STDIO, por lo que este
# contenedor incluye tanto el codigo del bot-chat como el del mcp-server.
#
# Se construye desde docker-compose.yml de la raiz del workspace, que define:
#   context: ./bot-chat
#   additional_contexts: mcp-server: ./mcp-server
# De ahi que el mcp-server se copie con COPY --from=mcp-server (nombre del
# additional context de BuildKit), no como un path del context del bot-chat.

FROM python:3.12-slim

WORKDIR /app

# Codigo y dependencias del bot-chat
COPY . /app/bot-chat/
RUN pip install --no-cache-dir -r /app/bot-chat/requirements.txt

# Codigo y dependencias del MCP server (lo instancia el bot-chat por stdio)
COPY --from=mcp-server / /app/mcp-server/
RUN pip install --no-cache-dir -r /app/mcp-server/requirements.txt

WORKDIR /app/bot-chat

EXPOSE 8001

CMD ["uvicorn", "app.api:app", "--host", "0.0.0.0", "--port", "8001"]
