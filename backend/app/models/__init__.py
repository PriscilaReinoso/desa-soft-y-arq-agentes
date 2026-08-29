from app.models.articulo import Articulo
from app.models.categoria import Categoria
from app.models.deposito import Deposito
from app.models.espacio import Espacio
from app.models.inventario import Inventario
from app.models.lista_precios import ListaPrecios
from app.models.medida import Medida
from app.models.metodo_pago import MetodoPago
from app.models.presupuesto import PresupuestoCabecera, PresupuestoDetalle
from app.models.proveedor import Proveedor
from app.models.proveedor_categoria import ProveedorCategoria
from app.models.rol import Rol
from app.models.usuario import Usuario
from app.models.venta import VentaCabecera, VentaDetalle

__all__ = [
    "Articulo",
    "Categoria",
    "Deposito",
    "Espacio",
    "Inventario",
    "ListaPrecios",
    "Medida",
    "MetodoPago",
    "PresupuestoCabecera",
    "PresupuestoDetalle",
    "Proveedor",
    "ProveedorCategoria",
    "Rol",
    "Usuario",
    "VentaCabecera",
    "VentaDetalle",
]
