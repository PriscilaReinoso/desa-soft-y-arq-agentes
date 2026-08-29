import uuid

from pydantic import BaseModel, ConfigDict, Field


class ArticuloCreate(BaseModel):
    nombre: str = Field(min_length=1, max_length=100)
    descripcion: str | None = None
    categoria_id: uuid.UUID


class ArticuloUpdate(BaseModel):
    nombre: str | None = Field(default=None, min_length=1, max_length=100)
    descripcion: str | None = None
    categoria_id: uuid.UUID | None = None


class ArticuloOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    nombre: str
    descripcion: str | None
    categoria_id: uuid.UUID | None
