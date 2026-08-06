import uuid

from sqlalchemy.orm import Session

from app.core.database import utcnow
from app.exceptions.base import ConflictError, NotFoundError
from app.models.rol import Rol
from app.repositories.rol_repository import RolRepository
from app.schemas.rol import RolCreate, RolUpdate


class RolService:
    def __init__(self, db: Session):
        self.repository = RolRepository(db)

    def list(self, skip: int = 0, limit: int = 100) -> list[Rol]:
        return self.repository.list(skip=skip, limit=limit)

    def get(self, rol_id: uuid.UUID) -> Rol:
        rol = self.repository.get(rol_id)
        if rol is None:
            raise NotFoundError(detail="Rol no encontrado")
        return rol

    def create(self, data: RolCreate) -> Rol:
        if self.repository.get_by_nombre(data.nombre) is not None:
            raise ConflictError(detail="Ya existe un rol con ese nombre")
        rol = Rol(nombre=data.nombre, descripcion=data.descripcion)
        return self.repository.add(rol)

    def update(self, rol_id: uuid.UUID, data: RolUpdate) -> Rol:
        rol = self.get(rol_id)
        if data.nombre is not None:
            existing = self.repository.get_by_nombre(data.nombre)
            if existing is not None and existing.id != rol.id:
                raise ConflictError(detail="Ya existe un rol con ese nombre")
            rol.nombre = data.nombre
        if data.descripcion is not None:
            rol.descripcion = data.descripcion
        return self.repository.update(rol)

    def delete(self, rol_id: uuid.UUID) -> None:
        rol = self.get(rol_id)
        rol.deleted_at = utcnow()
        self.repository.soft_delete(rol)