from __future__ import annotations
import uuid

from sqlalchemy.orm import Session

from app.core.database import utcnow
from app.core.security import hash_password
from app.exceptions.base import BadRequestError, ConflictError, NotFoundError
from app.models.usuario import Usuario
from app.repositories.usuario_repository import UsuarioRepository
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate
from app.services.rol_service import RolService


class UsuarioService:
    def __init__(self, db: Session):
        self.repository = UsuarioRepository(db)
        self.rol_service = RolService(db)

    def _validar_rol(self, role_id: uuid.UUID) -> None:
        try:
            self.rol_service.get(role_id)
        except NotFoundError:
            raise BadRequestError(detail="El rol indicado no existe") from None

    def list(self, skip: int = 0, limit: int = 100) -> list[Usuario]:
        return self.repository.list(skip=skip, limit=limit)

    def get(self, usuario_id: uuid.UUID) -> Usuario:
        usuario = self.repository.get(usuario_id)
        if usuario is None:
            raise NotFoundError(detail="Usuario no encontrado")
        return usuario

    def create(self, data: UsuarioCreate) -> Usuario:
        self._validar_rol(data.role_id)
        normalized_username = data.username.lower()
        normalized_email = data.email.lower()
        if self.repository.get_by_username(normalized_username) is not None:
            raise ConflictError(detail="Ya existe un usuario con ese username")
        if self.repository.get_by_email(normalized_email) is not None:
            raise ConflictError(detail="Ya existe un usuario con ese email")
        usuario = Usuario(
            nombre=data.nombre,
            apellido=data.apellido,
            username=normalized_username,
            email=normalized_email,
            password_hash=hash_password(data.password),
            role_id=data.role_id,
        )
        return self.repository.add(usuario)

    def update(self, usuario_id: uuid.UUID, data: UsuarioUpdate) -> Usuario:
        usuario = self.get(usuario_id)
        if data.role_id is not None:
            self._validar_rol(data.role_id)
            usuario.role_id = data.role_id
        if data.username is not None:
            normalized_username = data.username.lower()
            existing = self.repository.get_by_username(normalized_username)
            if existing is not None and existing.id != usuario.id:
                raise ConflictError(detail="Ya existe un usuario con ese username")
            usuario.username = normalized_username
        if data.email is not None:
            normalized_email = data.email.lower()
            existing = self.repository.get_by_email(normalized_email)
            if existing is not None and existing.id != usuario.id:
                raise ConflictError(detail="Ya existe un usuario con ese email")
            usuario.email = normalized_email
        if data.nombre is not None:
            usuario.nombre = data.nombre
        if data.apellido is not None:
            usuario.apellido = data.apellido
        if data.password is not None:
            usuario.password_hash = hash_password(data.password)
        if data.activo is not None:
            usuario.activo = data.activo
        return self.repository.update(usuario)

    def delete(self, usuario_id: uuid.UUID) -> None:
        usuario = self.get(usuario_id)
        usuario.deleted_at = utcnow()
        self.repository.soft_delete(usuario)