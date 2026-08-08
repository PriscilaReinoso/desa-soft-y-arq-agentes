import uuid

from sqlalchemy.orm import Session

from app.core.database import utcnow
from app.exceptions.base import BadRequestError, ConflictError, NotFoundError
from app.models.articulo import Articulo
from app.repositories.articulo_repository import ArticuloRepository
from app.repositories.categoria_repository import CategoriaRepository
from app.schemas.articulo import ArticuloCreate, ArticuloUpdate


class ArticuloService:
    def __init__(self, db: Session):
        self.repository = ArticuloRepository(db)
        self.categoria_repository = CategoriaRepository(db)

    def list(self, skip: int = 0, limit: int = 100) -> list[Articulo]:
        return self.repository.list(skip=skip, limit=limit)

    def get(self, articulo_id: uuid.UUID) -> Articulo:
        articulo = self.repository.get(articulo_id)
        if articulo is None:
            raise NotFoundError(detail="Artículo no encontrado")
        return articulo

    def _validate_categoria(self, categoria_id: uuid.UUID) -> None:
        if self.categoria_repository.get(categoria_id) is None:
            raise BadRequestError(detail="La categoría no existe o está eliminada")

    def create(self, data: ArticuloCreate) -> Articulo:
        self._validate_categoria(data.categoria_id)
        if self.repository.get_by_nombre(data.nombre) is not None:
            raise ConflictError(detail="Ya existe un artículo con ese nombre")
        articulo = Articulo(
            nombre=data.nombre,
            descripcion=data.descripcion,
            categoria_id=data.categoria_id,
        )
        return self.repository.add(articulo)

    def update(self, articulo_id: uuid.UUID, data: ArticuloUpdate) -> Articulo:
        articulo = self.get(articulo_id)
        if data.categoria_id is not None:
            self._validate_categoria(data.categoria_id)
            articulo.categoria_id = data.categoria_id
        if data.nombre is not None:
            existing = self.repository.get_by_nombre(data.nombre)
            if existing is not None and existing.id != articulo.id:
                raise ConflictError(detail="Ya existe un artículo con ese nombre")
            articulo.nombre = data.nombre
        if data.descripcion is not None:
            articulo.descripcion = data.descripcion
        return self.repository.update(articulo)

    def delete(self, articulo_id: uuid.UUID) -> None:
        articulo = self.get(articulo_id)
        articulo.deleted_at = utcnow()
        self.repository.soft_delete(articulo)
