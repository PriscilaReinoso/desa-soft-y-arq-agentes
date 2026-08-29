import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.proveedor_categoria import ProveedorCategoria


class ProveedorCategoriaRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_by_proveedor(self, proveedor_id: uuid.UUID) -> list[ProveedorCategoria]:
        stmt = (
            select(ProveedorCategoria)
            .where(
                ProveedorCategoria.proveedor_id == proveedor_id,
                ProveedorCategoria.deleted_at.is_(None),
            )
            .order_by(ProveedorCategoria.categoria_id)
        )
        return list(self.db.scalars(stmt).all())

    def add_flush(self, asociacion: ProveedorCategoria) -> ProveedorCategoria:
        self.db.add(asociacion)
        self.db.flush()
        self.db.refresh(asociacion)
        return asociacion

    def soft_delete(self, asociacion: ProveedorCategoria) -> None:
        self.db.add(asociacion)
        self.db.commit()
