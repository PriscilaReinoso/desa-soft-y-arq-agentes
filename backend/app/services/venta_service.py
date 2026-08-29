import uuid
from datetime import timedelta
from decimal import Decimal

from fastapi.exceptions import RequestValidationError
from sqlalchemy.orm import Session

from app.core.database import utcnow
from app.exceptions.base import BadRequestError, NotFoundError
from app.models.venta import VentaCabecera, VentaDetalle
from app.repositories.inventario_repository import InventarioRepository
from app.repositories.metodo_pago_repository import MetodoPagoRepository
from app.repositories.presupuesto_repository import PresupuestoRepository
from app.repositories.venta_repository import VentaRepository
from app.schemas.venta import ItemVenta, VentaCreate, VentaUpdate


def _validation_error(field: str, msg: str) -> RequestValidationError:
    return RequestValidationError(errors=[{"loc": ("body", field), "msg": msg, "type": "value_error"}])


class VentaService:
    def __init__(self, db: Session):
        self.db = db
        self.repository = VentaRepository(db)
        self.inventario_repository = InventarioRepository(db)
        self.presupuesto_repository = PresupuestoRepository(db)
        self.metodo_pago_repository = MetodoPagoRepository(db)

    def list(self, skip: int = 0, limit: int = 100) -> list[VentaCabecera]:
        return self.repository.list(skip=skip, limit=limit)

    def get(self, venta_id: uuid.UUID) -> VentaCabecera:
        venta = self.repository.get(venta_id)
        if venta is None:
            raise NotFoundError(detail="Venta no encontrada")
        return venta

    def get_by_numero(self, numero: int) -> VentaCabecera:
        venta = self.repository.get_by_numero(numero)
        if venta is None:
            raise NotFoundError(detail="Venta no encontrada")
        return venta

    def create(self, data: VentaCreate) -> VentaCabecera:
        try:
            detalles, cantidad, total = self._preparar_detalles(data.items, descontar_stock=data.aprobado)
            venta = VentaCabecera(
                numero=self.repository.next_numero(),
                presupuesto_id=self._validar_presupuesto(data.presupuesto_id),
                cantidad=cantidad,
                total=total,
                cliente=data.cliente,
                aprobado=data.aprobado,
            )
            venta.detalles = detalles
            self.repository.add_flush(venta)
            self.repository.commit()
            return venta
        except Exception:
            self.db.rollback()
            raise

    def update(self, venta_id: uuid.UUID, data: VentaUpdate) -> VentaCabecera:
        venta = self.get(venta_id)
        try:
            aprobado_antes = venta.aprobado
            aprobado_despues = data.aprobado if "aprobado" in data.model_fields_set else venta.aprobado

            if aprobado_antes:
                self._restaurar_stock(venta)

            if "items" in data.model_fields_set:
                detalles, cantidad, total = self._preparar_detalles(data.items, descontar_stock=False)
                self._reemplazar_detalles(venta, detalles)
                venta.cantidad = cantidad
                venta.total = total

            if "aprobado" in data.model_fields_set:
                venta.aprobado = data.aprobado
            if "cliente" in data.model_fields_set:
                venta.cliente = data.cliente
            if "presupuesto_id" in data.model_fields_set:
                venta.presupuesto_id = self._validar_presupuesto(data.presupuesto_id)

            if aprobado_antes and not aprobado_despues:
                self._validar_plazo(venta)

            if aprobado_despues:
                self._descontar_stock(venta.detalles)

            return self.repository.update(venta)
        except Exception:
            self.db.rollback()
            raise

    def delete(self, venta_id: uuid.UUID) -> None:
        venta = self.get(venta_id)
        self._validar_plazo(venta)
        if venta.aprobado:
            self._restaurar_stock(venta)
        venta.deleted_at = utcnow()
        self.repository.soft_delete(venta)

    def _preparar_detalles(
        self, items: list[ItemVenta], descontar_stock: bool = True
    ) -> tuple[list[VentaDetalle], int, Decimal]:
        detalles: list[VentaDetalle] = []
        cantidad_total = 0
        total = Decimal("0")
        for item in items:
            inventario = self.inventario_repository.get(item.inventario_id)
            if inventario is None:
                raise BadRequestError(detail="El ítem de inventario no existe o está eliminado")
            if item.cantidad > inventario.stock:
                raise _validation_error("items", "Stock insuficiente para la cantidad vendida")
            if item.metodo_pago_id is not None and self.metodo_pago_repository.get(item.metodo_pago_id) is None:
                raise BadRequestError(detail="El método de pago no existe o está eliminado")
            if descontar_stock:
                inventario.stock = inventario.stock - item.cantidad
            sub_total = (item.cantidad * inventario.precio_venta).quantize(Decimal("0.01"))
            cantidad_total += item.cantidad
            total += sub_total
            detalles.append(
                VentaDetalle(
                    articulo_id=inventario.articulo_id,
                    medida_id=inventario.medida_id,
                    cantidad=item.cantidad,
                    precio_venta=inventario.precio_venta,
                    sub_total=sub_total,
                    metodo_pago_id=item.metodo_pago_id,
                )
            )
        return detalles, cantidad_total, total.quantize(Decimal("0.01"))

    def _validar_presupuesto(self, presupuesto_id: uuid.UUID | None) -> uuid.UUID | None:
        if presupuesto_id is not None and self.presupuesto_repository.get(presupuesto_id) is None:
            raise BadRequestError(detail="El presupuesto no existe o está eliminado")
        return presupuesto_id

    def _restaurar_stock(self, venta: VentaCabecera) -> None:
        for detalle in venta.detalles:
            if detalle.deleted_at is not None:
                continue
            inventario = self.inventario_repository.get_by_combinacion(
                detalle.articulo_id, detalle.medida_id
            )
            if inventario is not None:
                inventario.stock = inventario.stock + detalle.cantidad

    def _reemplazar_detalles(self, venta: VentaCabecera, nuevos: list[VentaDetalle]) -> None:
        venta.detalles = nuevos

    def _descontar_stock(self, detalles: list[VentaDetalle]) -> None:
        for detalle in detalles:
            if detalle.deleted_at is not None:
                continue
            inventario = self.inventario_repository.get_by_combinacion(
                detalle.articulo_id, detalle.medida_id
            )
            if inventario is None:
                raise BadRequestError(detail="El ítem de inventario no existe o está eliminado")
            if detalle.cantidad > inventario.stock:
                raise _validation_error("items", "Stock insuficiente para la cantidad vendida")
            inventario.stock -= detalle.cantidad

    def _validar_plazo(self, venta: VentaCabecera) -> None:
        if utcnow() - venta.fecha > timedelta(days=7):
            raise BadRequestError(detail="La venta supera los 7 días y no puede modificarse")
