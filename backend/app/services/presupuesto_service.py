from __future__ import annotations
import uuid
from decimal import Decimal
from io import BytesIO

from fastapi.exceptions import RequestValidationError
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Spacer, Table, TableStyle, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
from sqlalchemy.orm import Session

from app.core.database import utcnow
from app.exceptions.base import BadRequestError, NotFoundError
from app.models.presupuesto import PresupuestoCabecera, PresupuestoDetalle
from app.repositories.inventario_repository import InventarioRepository
from app.repositories.presupuesto_repository import PresupuestoRepository
from app.schemas.presupuesto import ItemPresupuesto, PresupuestoCreate, PresupuestoUpdate


def _validation_error(field: str, msg: str) -> RequestValidationError:
    return RequestValidationError(errors=[{"loc": ("body", field), "msg": msg, "type": "value_error"}])


class PresupuestoService:
    def __init__(self, db: Session):
        self.db = db
        self.repository = PresupuestoRepository(db)
        self.inventario_repository = InventarioRepository(db)

    def list(self, skip: int = 0, limit: int = 100) -> list[PresupuestoCabecera]:
        return self.repository.list(skip=skip, limit=limit)

    def get(self, presupuesto_id: uuid.UUID) -> PresupuestoCabecera:
        presupuesto = self.repository.get(presupuesto_id)
        if presupuesto is None:
            raise NotFoundError(detail="Presupuesto no encontrado")
        return presupuesto

    def get_by_numero(self, numero: int) -> PresupuestoCabecera:
        presupuesto = self.repository.get_by_numero(numero)
        if presupuesto is None:
            raise NotFoundError(detail="Presupuesto no encontrado")
        return presupuesto

    def create(self, data: PresupuestoCreate) -> PresupuestoCabecera:
        try:
            detalles, cantidad, total = self._calcular(data.items)
            cabecera = PresupuestoCabecera(
                numero=self.repository.next_numero(),
                cantidad=cantidad,
                total=total,
                cliente=data.cliente,
                aprobado=False,
                dias_valido=data.dias_valido,
            )
            cabecera.detalles = detalles
            self.repository.add_flush(cabecera)
            self.repository.commit()
            return cabecera
        except Exception:
            self.db.rollback()
            raise

    def update(self, presupuesto_id: uuid.UUID, data: PresupuestoUpdate) -> PresupuestoCabecera:
        presupuesto = self.get(presupuesto_id)
        try:
            if "items" in data.model_fields_set:
                detalles, cantidad, total = self._calcular(data.items)
                self._reemplazar_detalles(presupuesto, detalles)
                presupuesto.cantidad = cantidad
                presupuesto.total = total
            if "cliente" in data.model_fields_set:
                presupuesto.cliente = data.cliente
            if "dias_valido" in data.model_fields_set:
                presupuesto.dias_valido = data.dias_valido
            return self.repository.update(presupuesto)
        except Exception:
            self.db.rollback()
            raise

    def delete(self, presupuesto_id: uuid.UUID) -> None:
        presupuesto = self.get(presupuesto_id)
        presupuesto.deleted_at = utcnow()
        self.repository.soft_delete(presupuesto)

    def generar_pdf(self, presupuesto_id: uuid.UUID | None = None, numero: int | None = None) -> bytes:
        if numero is not None:
            presupuesto = self.repository.get_by_numero(numero)
        elif presupuesto_id is not None:
            presupuesto = self.repository.get(presupuesto_id)
        else:
            presupuesto = None
        if presupuesto is None:
            raise NotFoundError(detail="Presupuesto no encontrado")
        return self._build_pdf(presupuesto)

    def _calcular(self, items: list[ItemPresupuesto]) -> tuple[list[PresupuestoDetalle], int, Decimal]:
        detalles: list[PresupuestoDetalle] = []
        cantidad_total = 0
        total = Decimal("0")
        for item in items:
            inventario = self.inventario_repository.get(item.inventario_id)
            if inventario is None:
                raise BadRequestError(detail="El ítem de inventario no existe o está eliminado")
            sub_total = (item.cantidad * inventario.precio_venta).quantize(Decimal("0.01"))
            cantidad_total += item.cantidad
            total += sub_total
            detalles.append(
                PresupuestoDetalle(
                    articulo_id=inventario.articulo_id,
                    medida_id=inventario.medida_id,
                    cantidad=item.cantidad,
                    precio_venta=inventario.precio_venta,
                    sub_total=sub_total,
                )
            )
        return detalles, cantidad_total, total.quantize(Decimal("0.01"))

    def _reemplazar_detalles(self, presupuesto: PresupuestoCabecera, nuevos: list[PresupuestoDetalle]) -> None:
        presupuesto.detalles = nuevos

    def _build_pdf(self, presupuesto: PresupuestoCabecera) -> bytes:
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=15 * mm,
            leftMargin=15 * mm,
            topMargin=15 * mm,
            bottomMargin=15 * mm,
        )
        estilos = getSampleStyleSheet()
        elementos = [
            Paragraph("Presupuesto", estilos["Title"]),
            Spacer(1, 4 * mm),
            Paragraph(f"Número: {presupuesto.numero}", estilos["Heading4"]),
            Paragraph(f"Fecha: {presupuesto.fecha:%d/%m/%Y %H:%M}", estilos["Heading4"]),
            Paragraph(f"Cliente: {presupuesto.cliente or '-'}", estilos["Heading4"]),
            Paragraph(f"Válido por: {presupuesto.dias_valido or '-'} días", estilos["Heading4"]),
            Spacer(1, 6 * mm),
        ]
        datos = [["Artículo", "Medida", "Cantidad", "Precio", "Subtotal"]]
        for detalle in presupuesto.detalles:
            datos.append(
                [
                    detalle.articulo.nombre,
                    detalle.medida.medida,
                    str(detalle.cantidad),
                    str(detalle.precio_venta),
                    str(detalle.sub_total),
                ]
            )
        datos.append(["", "", "", "TOTAL", str(presupuesto.total)])
        tabla = Table(datos)
        tabla.setStyle(
            TableStyle(
                [
                    ("GRID", (0, 0), (-1, -2), 0.5, "grey"),
                    ("BACKGROUND", (0, 0), (-1, 0), "#d9d9d9"),
                    ("SPAN", (-2, -1), (-1, -1)),
                ]
            )
        )
        elementos.append(tabla)
        doc.build(elementos)
        return buffer.getvalue()
