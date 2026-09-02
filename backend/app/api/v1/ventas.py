import uuid

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_usuario, require_roles
from app.exceptions.base import NotFoundError
from app.models.usuario import Usuario
from app.schemas.venta import PeriodoVentas, ResumenVentasOut, VentaCabeceraOut, VentaCreate, VentaUpdate
from app.services.venta_service import VentaService

router = APIRouter(
    prefix="/ventas",
    tags=["ventas"],
    dependencies=[Depends(get_current_usuario)],
)


def _resolver_venta(service: VentaService, identificador: str):
    try:
        return service.get(uuid.UUID(identificador))
    except ValueError:
        try:
            return service.get_by_numero(int(identificador))
        except ValueError:
            raise NotFoundError(detail="Venta no encontrada") from None


@router.get("", response_model=list[VentaCabeceraOut])
def list_ventas(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return VentaService(db).list(skip=skip, limit=limit)


@router.post("", response_model=VentaCabeceraOut, status_code=status.HTTP_201_CREATED)
def create_venta(
    data: VentaCreate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("ADMIN")),
):
    return VentaService(db).create(data)


@router.get("/estadisticas", response_model=ResumenVentasOut)
def resumen_ventas(
    periodo: PeriodoVentas = PeriodoVentas.mes,
    db: Session = Depends(get_db),
):
    return VentaService(db).obtener_resumen(periodo)


@router.get("/{identificador}", response_model=VentaCabeceraOut)
def get_venta(identificador: str, db: Session = Depends(get_db)):
    return _resolver_venta(VentaService(db), identificador)


@router.put("/{venta_id}", response_model=VentaCabeceraOut)
def update_venta(
    venta_id: uuid.UUID,
    data: VentaUpdate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("ADMIN")),
):
    return VentaService(db).update(venta_id, data)


@router.delete("/{venta_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_venta(
    venta_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("ADMIN")),
):
    VentaService(db).delete(venta_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
