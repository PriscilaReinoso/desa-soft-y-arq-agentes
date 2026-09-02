from __future__ import annotations
import uuid
from datetime import datetime, timedelta
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.core.database import utcnow
from app.models.articulo import Articulo
from app.models.venta import VentaCabecera, VentaDetalle
from app.schemas.venta import PeriodoVentas


def _relaciones_cargadas():
    return (
        selectinload(VentaCabecera.detalles)
        .selectinload(VentaDetalle.articulo)
        .selectinload(Articulo.categoria),
        selectinload(VentaCabecera.detalles).selectinload(VentaDetalle.medida),
    )


def _inicio_dia(fecha: datetime) -> datetime:
    return fecha.replace(hour=0, minute=0, second=0, microsecond=0)


def _inicio_semana(fecha: datetime) -> datetime:
    inicio = _inicio_dia(fecha)
    return inicio - timedelta(days=inicio.weekday())


def rango_periodo(periodo: PeriodoVentas, ahora: datetime | None = None) -> tuple[datetime, datetime]:
    hoy = _inicio_dia(ahora or utcnow())
    limite_superior = hoy + timedelta(days=1)
    if periodo is PeriodoVentas.dia:
        return hoy, limite_superior
    if periodo is PeriodoVentas.semana:
        return _inicio_semana(hoy), limite_superior
    if periodo is PeriodoVentas.mes:
        return hoy.replace(day=1), limite_superior
    return hoy.replace(month=1, day=1), limite_superior


class VentaRepository:
    def __init__(self, db: Session):
        self.db = db

    def list(self, skip: int = 0, limit: int = 100) -> list[VentaCabecera]:
        stmt = (
            select(VentaCabecera)
            .options(*_relaciones_cargadas())
            .where(VentaCabecera.deleted_at.is_(None))
            .order_by(VentaCabecera.numero)
            .offset(skip)
            .limit(limit)
        )
        return list(self.db.scalars(stmt).all())

    def get(self, venta_id: uuid.UUID) -> VentaCabecera | None:
        stmt = (
            select(VentaCabecera)
            .options(*_relaciones_cargadas())
            .where(VentaCabecera.id == venta_id, VentaCabecera.deleted_at.is_(None))
        )
        return self.db.scalar(stmt)

    def get_by_numero(self, numero: int) -> VentaCabecera | None:
        stmt = (
            select(VentaCabecera)
            .options(*_relaciones_cargadas())
            .where(VentaCabecera.numero == numero, VentaCabecera.deleted_at.is_(None))
        )
        return self.db.scalar(stmt)

    def next_numero(self) -> int:
        max_numero = self.db.scalar(select(func.max(VentaCabecera.numero)))
        return (max_numero or 0) + 1

    def resumen_por_periodo(self, desde: datetime, hasta: datetime) -> tuple[Decimal, int]:
        stmt = select(
            func.coalesce(func.sum(VentaCabecera.total), 0),
            func.count(VentaCabecera.id),
        ).where(
            VentaCabecera.aprobado.is_(True),
            VentaCabecera.deleted_at.is_(None),
            VentaCabecera.fecha >= desde,
            VentaCabecera.fecha < hasta,
        )
        total, cantidad = self.db.execute(stmt).one()
        return Decimal(str(total)), int(cantidad)

    def add_flush(self, venta: VentaCabecera) -> VentaCabecera:
        self.db.add(venta)
        self.db.flush()
        self.db.refresh(venta)
        return venta

    def update(self, venta: VentaCabecera) -> VentaCabecera:
        self.db.add(venta)
        self.db.commit()
        self.db.refresh(venta)
        return venta

    def commit(self) -> None:
        self.db.commit()

    def soft_delete(self, venta: VentaCabecera) -> None:
        self.db.add(venta)
        self.db.commit()
