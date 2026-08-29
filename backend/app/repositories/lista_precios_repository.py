import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.articulo import Articulo
from app.models.categoria import Categoria
from app.models.lista_precios import ListaPrecios
from app.models.proveedor import Proveedor


def _relaciones_cargadas():
    return (
        selectinload(ListaPrecios.articulo).selectinload(Articulo.categoria),
        selectinload(ListaPrecios.medida),
        selectinload(ListaPrecios.proveedor),
    )


class ListaPreciosRepository:
    def __init__(self, db: Session):
        self.db = db

    def list(
        self,
        skip: int = 0,
        limit: int = 100,
        categoria_ids: list[uuid.UUID] | None = None,
        articulo_ids: list[uuid.UUID] | None = None,
        proveedor_id: uuid.UUID | None = None,
    ) -> list[ListaPrecios]:
        stmt = select(ListaPrecios).options(*_relaciones_cargadas()).where(ListaPrecios.deleted_at.is_(None))
        if proveedor_id is not None:
            stmt = stmt.where(ListaPrecios.proveedor_id == proveedor_id)
        if articulo_ids:
            stmt = stmt.where(ListaPrecios.articulo_id.in_(articulo_ids))
        if categoria_ids:
            stmt = stmt.join(Articulo, ListaPrecios.articulo_id == Articulo.id).where(
                Articulo.categoria_id.in_(categoria_ids)
            )
        stmt = stmt.order_by(ListaPrecios.proveedor_id, ListaPrecios.articulo_id).offset(skip).limit(limit)
        return list(self.db.scalars(stmt).all())

    def get(self, lista_precios_id: uuid.UUID) -> ListaPrecios | None:
        stmt = (
            select(ListaPrecios)
            .options(*_relaciones_cargadas())
            .where(ListaPrecios.id == lista_precios_id, ListaPrecios.deleted_at.is_(None))
        )
        return self.db.scalar(stmt)

    def get_by_combinacion(self, proveedor_id: uuid.UUID, articulo_id: uuid.UUID) -> ListaPrecios | None:
        stmt = select(ListaPrecios).where(
            ListaPrecios.proveedor_id == proveedor_id, ListaPrecios.articulo_id == articulo_id
        )
        return self.db.scalar(stmt)

    def contar_por_proveedor(self) -> list[tuple[Proveedor, int]]:
        stmt = (
            select(Proveedor, func.count(ListaPrecios.id))
            .join(ListaPrecios, ListaPrecios.proveedor_id == Proveedor.id)
            .where(ListaPrecios.deleted_at.is_(None), Proveedor.deleted_at.is_(None))
            .group_by(Proveedor.id)
            .order_by(func.count(ListaPrecios.id).desc(), Proveedor.nombre)
        )
        return [(proveedor, cantidad) for proveedor, cantidad in self.db.execute(stmt).all()]

    def contar_por_proveedor_y_categoria(self) -> list[tuple[Proveedor, Categoria, int]]:
        stmt = (
            select(Proveedor, Categoria, func.count(ListaPrecios.id))
            .select_from(ListaPrecios)
            .join(Proveedor, ListaPrecios.proveedor_id == Proveedor.id)
            .join(Articulo, ListaPrecios.articulo_id == Articulo.id)
            .join(Categoria, Articulo.categoria_id == Categoria.id)
            .where(ListaPrecios.deleted_at.is_(None))
            .group_by(Proveedor.id, Categoria.id)
            .order_by(Proveedor.nombre, Categoria.nombre)
        )
        return [(p, c, n) for p, c, n in self.db.execute(stmt).all()]

    def get_by_id_articulo_proveedor(
        self, proveedor_id: uuid.UUID, id_articulo_proveedor: str
    ) -> ListaPrecios | None:
        stmt = (
            select(ListaPrecios)
            .options(*_relaciones_cargadas())
            .where(
                ListaPrecios.proveedor_id == proveedor_id,
                ListaPrecios.id_articulo_proveedor == id_articulo_proveedor,
                ListaPrecios.deleted_at.is_(None),
            )
        )
        return self.db.scalar(stmt)

    def add_flush(self, lista_precios: ListaPrecios) -> ListaPrecios:
        self.db.add(lista_precios)
        self.db.flush()
        self.db.refresh(lista_precios)
        return lista_precios

    def update(self, lista_precios: ListaPrecios) -> ListaPrecios:
        self.db.add(lista_precios)
        self.db.commit()
        self.db.refresh(lista_precios)
        return lista_precios

    def commit(self) -> None:
        self.db.commit()

    def soft_delete(self, lista_precios: ListaPrecios) -> None:
        self.db.add(lista_precios)
        self.db.commit()
