from fastapi import FastAPI

from app.api.v1 import roles, usuarios
from app.core.config import settings
from app.exceptions.base import register_exception_handlers

app = FastAPI(title=settings.APP_NAME)

register_exception_handlers(app)

app.include_router(roles.router, prefix=settings.API_V1_PREFIX)
app.include_router(usuarios.router, prefix=settings.API_V1_PREFIX)