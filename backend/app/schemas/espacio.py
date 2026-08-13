import uuid

from pydantic import BaseModel, ConfigDict, Field


class EspacioCreate(BaseModel):
    tipo: str | None = Field(default=None, max_length=50)
    descripcion: str | None = None
    deposito_id: uuid.UUID
    max_fila: int = Field(ge=0)
    max_columna: int = Field(ge=0)


class EspacioUpdate(BaseModel):
    tipo: str | None = Field(default=None, max_length=50)
    descripcion: str | None = None
    deposito_id: uuid.UUID | None = None
    max_fila: int | None = Field(default=None, ge=0)
    max_columna: int | None = Field(default=None, ge=0)


class EspacioOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tipo: str | None
    descripcion: str | None
    deposito_id: uuid.UUID
    max_fila: int | None
    max_columna: int | None
