import uuid

from fastapi import APIRouter, Depends, Response, status
from fastapi.responses import Response as FastAPIResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_usuario, require_roles
from app.exceptions.base import NotFoundError
from app.models.usuario import Usuario
from app.schemas.presupuesto import PresupuestoCabeceraOut, PresupuestoCreate, PresupuestoUpdate
from app.services.presupuesto_service import PresupuestoService

router = APIRouter(
    prefix="/presupuestos",
    tags=["presupuestos"],
    dependencies=[Depends(get_current_usuario)],
)


def _resolver_presupuesto(service: PresupuestoService, identificador: str):
    try:
        return service.get(uuid.UUID(identificador))
    except ValueError:
        try:
            return service.get_by_numero(int(identificador))
        except ValueError:
            raise NotFoundError(detail="Presupuesto no encontrado") from None


@router.get("", response_model=list[PresupuestoCabeceraOut])
def list_presupuestos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return PresupuestoService(db).list(skip=skip, limit=limit)


@router.post("", response_model=PresupuestoCabeceraOut, status_code=status.HTTP_201_CREATED)
def create_presupuesto(
    data: PresupuestoCreate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("ADMIN")),
):
    return PresupuestoService(db).create(data)


@router.get("/{identificador}/pdf")
def pdf_presupuesto(identificador: str, db: Session = Depends(get_db)):
    presupuesto = _resolver_presupuesto(PresupuestoService(db), identificador)
    pdf = PresupuestoService(db).generar_pdf(presupuesto_id=presupuesto.id)
    return FastAPIResponse(
        content=pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="presupuesto-{presupuesto.numero}.pdf"'},
    )


@router.get("/{identificador}", response_model=PresupuestoCabeceraOut)
def get_presupuesto(identificador: str, db: Session = Depends(get_db)):
    return _resolver_presupuesto(PresupuestoService(db), identificador)


@router.put("/{presupuesto_id}", response_model=PresupuestoCabeceraOut)
def update_presupuesto(
    presupuesto_id: uuid.UUID,
    data: PresupuestoUpdate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("ADMIN")),
):
    return PresupuestoService(db).update(presupuesto_id, data)


@router.delete("/{presupuesto_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_presupuesto(
    presupuesto_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("ADMIN")),
):
    PresupuestoService(db).delete(presupuesto_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
