FROM python:3.12-slim

WORKDIR /app

COPY bot-chat/ /app/bot-chat/
COPY mcp-server/ /app/mcp-server/

RUN pip install --no-cache-dir \
    -r /app/bot-chat/requirements.txt \
    -r /app/mcp-server/requirements.txt

WORKDIR /app/bot-chat

EXPOSE 8001

CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8001"]
