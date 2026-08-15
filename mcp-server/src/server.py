"""Hardware Store (Ferretería) MCP Server.

Provides FastMCP tools to query products, categories, low stock alerts,
and stock movement logs from a PostgreSQL database.
"""

from typing import Any, Dict, List, Optional
from fastmcp import FastMCP
from db import execute_query

# Initialize FastMCP Server
mcp = FastMCP("Ferreteria Inventory MCP Server")


@mcp.tool()
def search_products(
    query: str = "", category_id: Optional[int] = None, limit: int = 20
) -> Dict[str, Any]:
    """Busca productos de ferretería por nombre, descripción, código SKU o ID de categoría.

    Args:
        query: Término de búsqueda parcial para coincidir con nombre, SKU o descripción.
        category_id: ID opcional de la categoría para filtrar.
        limit: Cantidad máxima de resultados a retornar (por defecto 20).

    Returns:
        Dict con la lista de productos coincidentes o mensaje de error.
    """
    try:
        sql = """
            SELECT 
                p.id, p.sku, p.name, p.description,
                c.name AS category_name,
                s.name AS supplier_name,
                p.unit_price, p.stock_quantity, p.min_stock_level, p.location_rack
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN suppliers s ON p.supplier_id = s.id
            WHERE 1=1
        """
        params: List[Any] = []

        if query.strip():
            sql += " AND (p.name ILIKE %s OR p.sku ILIKE %s OR p.description ILIKE %s)"
            pattern = f"%{query.strip()}%"
            params.extend([pattern, pattern, pattern])

        if category_id is not None:
            sql += " AND p.category_id = %s"
            params.append(category_id)

        sql += " ORDER BY p.name ASC LIMIT %s"
        params.append(limit)

        products = execute_query(sql, tuple(params))
        return {
            "status": "success",
            "total": len(products),
            "products": products,
        }
    except Exception as err:
        return {
            "status": "error",
            "isError": True,
            "message": str(err),
        }


@mcp.tool()
def get_product_details(
    product_id: Optional[int] = None, sku: Optional[str] = None
) -> Dict[str, Any]:
    """Obtiene la información detallada de un producto de ferretería por ID o SKU.

    Args:
        product_id: ID único del producto.
        sku: Código SKU del producto (ej: 'HM-MAR-001').

    Returns:
        Ficha completa del producto con precios, stock y datos de proveedor.
    """
    if product_id is None and not sku:
        return {
            "status": "error",
            "isError": True,
            "message": "Debe proporcionar al menos 'product_id' o 'sku'.",
        }

    try:
        sql = """
            SELECT 
                p.id, p.sku, p.name, p.description,
                p.category_id, c.name AS category_name,
                p.supplier_id, s.name AS supplier_name,
                p.unit_price, p.cost_price, p.stock_quantity, p.min_stock_level,
                p.location_rack, p.created_at, p.updated_at
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN suppliers s ON p.supplier_id = s.id
            WHERE 1=1
        """
        params: List[Any] = []

        if product_id is not None:
            sql += " AND p.id = %s"
            params.append(product_id)
        elif sku:
            sql += " AND p.sku = %s"
            params.append(sku.strip())

        results = execute_query(sql, tuple(params))
        if not results:
            return {
                "status": "not_found",
                "message": f"No se encontró ningún producto con product_id={product_id} o sku='{sku}'.",
            }

        return {
            "status": "success",
            "product": results[0],
        }
    except Exception as err:
        return {
            "status": "error",
            "isError": True,
            "message": str(err),
        }


@mcp.tool()
def check_low_stock() -> Dict[str, Any]:
    """Lista todos los productos cuyo stock actual sea menor o igual a su stock mínimo configurado.

    Returns:
        Dict con los artículos en condición crítica de repuesto/stock.
    """
    try:
        sql = """
            SELECT 
                p.id, p.sku, p.name, c.name AS category_name,
                p.stock_quantity, p.min_stock_level,
                (p.min_stock_level - p.stock_quantity) AS deficit,
                p.location_rack
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.stock_quantity <= p.min_stock_level
            ORDER BY deficit DESC, p.name ASC
        """
        critical_items = execute_query(sql)
        return {
            "status": "success",
            "low_stock_count": len(critical_items),
            "critical_products": critical_items,
        }
    except Exception as err:
        return {
            "status": "error",
            "isError": True,
            "message": str(err),
        }


@mcp.tool()
def list_categories() -> Dict[str, Any]:
    """Lista todas las categorías de productos registradas en la ferretería.

    Returns:
        Listado de categorías con ID, nombre y descripción.
    """
    try:
        sql = "SELECT id, name, description FROM categories ORDER BY id ASC"
        categories = execute_query(sql)
        return {
            "status": "success",
            "total": len(categories),
            "categories": categories,
        }
    except Exception as err:
        return {
            "status": "error",
            "isError": True,
            "message": str(err),
        }


@mcp.tool()
def get_stock_movements(product_id: int, limit: int = 20) -> Dict[str, Any]:
    """Consulta el historial de movimientos de entrada, salida o ajuste de stock para un producto.

    Args:
        product_id: ID del producto a consultar.
        limit: Cantidad de registros históricos a retornar.

    Returns:
        Historial cronológico de movimientos del producto.
    """
    try:
        sql = """
            SELECT 
                sm.id, sm.product_id, p.name AS product_name,
                sm.movement_type, sm.quantity, sm.reason, sm.created_at
            FROM stock_movements sm
            JOIN products p ON sm.product_id = p.id
            WHERE sm.product_id = %s
            ORDER BY sm.created_at DESC
            LIMIT %s
        """
        movements = execute_query(sql, (product_id, limit))
        return {
            "status": "success",
            "product_id": product_id,
            "total_movements": len(movements),
            "movements": movements,
        }
    except Exception as err:
        return {
            "status": "error",
            "isError": True,
            "message": str(err),
        }


if __name__ == "__main__":
    mcp.run()
