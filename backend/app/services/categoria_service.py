import uuid

from sqlalchemy.orm import Session

from app.core.database import utcnow
from app.exceptions.base import ConflictError, NotFoundError
from app.models.categoria import Categoria
from app.repositories.categoria_repository import CategoriaRepository
from app.schemas.categoria import CategoriaCreate, CategoriaUpdate


class CategoriaService:
    def __init__(self, db: Session):
        self.repository = CategoriaRepository(db)

    def list(self, skip: int = 0, limit: int = 100) -> list[Categoria]:
        return self.repository.list(skip=skip, limit=limit)

    def get(self, categoria_id: uuid.UUID) -> Categoria:
        categoria = self.repository.get(categoria_id)
        if categoria is None:
            raise NotFoundError(detail="Categoría no encontrada")
        return categoria

    def create(self, data: CategoriaCreate) -> Categoria:
        if self.repository.get_by_nombre(data.nombre) is not None:
            raise ConflictError(detail="Ya existe una categoría con ese nombre")
        categoria = Categoria(nombre=data.nombre, descripcion=data.descripcion)
        return self.repository.add(categoria)

    def update(self, categoria_id: uuid.UUID, data: CategoriaUpdate) -> Categoria:
        categoria = self.get(categoria_id)
        if data.nombre is not None:
            existing = self.repository.get_by_nombre(data.nombre)
            if existing is not None and existing.id != categoria.id:
                raise ConflictError(detail="Ya existe una categoría con ese nombre")
            categoria.nombre = data.nombre
        if data.descripcion is not None:
            categoria.descripcion = data.descripcion
        return self.repository.update(categoria)

    def delete(self, categoria_id: uuid.UUID) -> None:
        categoria = self.get(categoria_id)
        categoria.deleted_at = utcnow()
        self.repository.soft_delete(categoria)
