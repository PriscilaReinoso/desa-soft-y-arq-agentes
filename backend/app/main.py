from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import articulos, auth, categorias, depositos, espacios, inventario, medidas, roles, usuarios
from app.core.config import settings
from app.exceptions.base import register_exception_handlers

app = FastAPI(title=settings.APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

register_exception_handlers(app)

app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(roles.router, prefix=settings.API_V1_PREFIX)
app.include_router(usuarios.router, prefix=settings.API_V1_PREFIX)
app.include_router(categorias.router, prefix=settings.API_V1_PREFIX)
app.include_router(articulos.router, prefix=settings.API_V1_PREFIX)
app.include_router(medidas.router, prefix=settings.API_V1_PREFIX)
app.include_router(depositos.router, prefix=settings.API_V1_PREFIX)
app.include_router(espacios.router, prefix=settings.API_V1_PREFIX)
app.include_router(inventario.router, prefix=settings.API_V1_PREFIX)