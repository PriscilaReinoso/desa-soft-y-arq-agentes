import uuid

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.categoria import CategoriaOut


class ProveedorCreate(BaseModel):
    nombre: str = Field(min_length=1, max_length=100)
    apellido: str = Field(min_length=1, max_length=100)
    telefono: str = Field(min_length=1, max_length=30)
    direccion: str | None = Field(default=None, max_length=255)
    categoria_ids: list[uuid.UUID] = []


class ProveedorUpdate(BaseModel):
    nombre: str | None = Field(default=None, min_length=1, max_length=100)
    apellido: str | None = Field(default=None, min_length=1, max_length=100)
    telefono: str | None = Field(default=None, min_length=1, max_length=30)
    direccion: str | None = Field(default=None, max_length=255)
    categoria_ids: list[uuid.UUID] | None = None


class ProveedorOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    nombre: str
    apellido: str
    telefono: str
    direccion: str | None
    categorias: list[CategoriaOut]
