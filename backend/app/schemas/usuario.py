import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UsuarioCreate(BaseModel):
    nombre: str = Field(min_length=1, max_length=100)
    apellido: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    role_id: uuid.UUID


class UsuarioUpdate(BaseModel):
    nombre: str | None = Field(default=None, min_length=1, max_length=100)
    apellido: str | None = Field(default=None, min_length=1, max_length=100)
    email: EmailStr | None = None
    password: str | None = Field(default=None, min_length=6, max_length=128)
    role_id: uuid.UUID | None = None
    activo: bool | None = None


class UsuarioOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    nombre: str
    apellido: str
    email: EmailStr
    role_id: uuid.UUID
    activo: bool
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None = None