from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


class DomainError(Exception):
    """Error de dominio raíz para todos los errores de negocio."""

    status_code = 500
    detail = "Error interno"

    def __init__(self, detail: str | None = None):
        self.detail = detail or self.detail
        super().__init__(self.detail)


class NotFoundError(DomainError):
    status_code = 404
    detail = "Recurso no encontrado"


class ConflictError(DomainError):
    status_code = 409
    detail = "Conflicto con el estado actual del recurso"


class BadRequestError(DomainError):
    status_code = 400
    detail = "Solicitud inválida"


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(DomainError)
    async def domain_error_handler(request: Request, exc: DomainError) -> JSONResponse:
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        return JSONResponse(status_code=422, content={"detail": exc.errors()})