"""Reusable business logic for inventory queries.

Encapsulates the SQL queries against the current database schema (articulo,
categoria, inventario, medida, espacio, deposito, proveedor) so that the MCP
tools stay thin and the logic can be reused and tested independently.
"""

from typing import Any, Dict, List, Optional

from app.core.database import execute_query


def search_products(
    query: str = "", category_id: Optional[str] = None, limit: int = 20
) -> List[Dict[str, Any]]:
    """Returns articles matching a text query and/or category from the current schema."""
    sql = """
        SELECT
            a.id, a.nombre, a.descripcion, a.categoria_id,
            c.nombre AS categoria_nombre
        FROM articulo a
        LEFT JOIN categoria c ON a.categoria_id = c.id
        WHERE 1=1
    """
    params: List[Any] = []

    if query.strip():
        sql += " AND (a.nombre ILIKE %s OR a.descripcion ILIKE %s)"
        pattern = f"%{query.strip()}%"
        params.extend([pattern, pattern])

    if category_id:
        sql += " AND a.categoria_id = %s"
        params.append(category_id)

    sql += " ORDER BY a.nombre ASC LIMIT %s"
    params.append(limit)

    return execute_query(sql, tuple(params))


def get_product_details(product_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Returns an article with its inventory variants (stock, price and location).

    Returns None when the article does not exist.
    """
    article_sql = """
        SELECT
            a.id, a.nombre, a.descripcion, a.categoria_id,
            c.nombre AS categoria_nombre
        FROM articulo a
        LEFT JOIN categoria c ON a.categoria_id = c.id
        WHERE a.id = %s
    """
    articles = execute_query(article_sql, (product_id,))
    if not articles:
        return None

    article = articles[0]

    inventory_sql = """
        SELECT
            i.id, i.articulo_id, i.stock, i.minimo_stock, i.precio_venta,
            i.fila, i.columna,
            m.unidad_medida, m.medida AS medida_nombre,
            e.tipo AS espacio_tipo, e.descripcion AS espacio_descripcion,
            d.nombre AS deposito_nombre
        FROM inventario i
        LEFT JOIN medida m ON i.medida_id = m.id
        LEFT JOIN espacio e ON i.espacio_id = e.id
        LEFT JOIN deposito d ON e.deposito_id = d.id
        WHERE i.articulo_id = %s
    """
    article["inventario"] = execute_query(inventory_sql, (product_id,))
    return article


def check_low_stock() -> List[Dict[str, Any]]:
    """Returns inventory variants whose stock is at or below their minimum stock."""
    sql = """
        SELECT
            i.id, a.id AS articulo_id, a.nombre AS articulo_nombre,
            i.stock, i.minimo_stock,
            (i.minimo_stock - i.stock) AS deficit,
            m.medida, m.unidad_medida,
            d.nombre AS deposito_nombre, e.tipo AS espacio_tipo, i.fila, i.columna
        FROM inventario i
        JOIN articulo a ON i.articulo_id = a.id
        LEFT JOIN medida m ON i.medida_id = m.id
        LEFT JOIN espacio e ON i.espacio_id = e.id
        LEFT JOIN deposito d ON e.deposito_id = d.id
        WHERE i.stock <= i.minimo_stock
        ORDER BY deficit DESC, a.nombre ASC
    """
    return execute_query(sql)


def list_categories() -> List[Dict[str, Any]]:
    """Returns all categories from the current schema."""
    return execute_query("SELECT id, nombre, descripcion FROM categoria ORDER BY nombre ASC")


def get_stock_inventory(
    article_id: Optional[str] = None, limit: int = 50
) -> List[Dict[str, Any]]:
    """Returns the current stock of inventory variants, optionally filtered by article."""
    sql = """
        SELECT
            i.id, i.articulo_id, a.nombre AS articulo_nombre,
            i.stock, i.minimo_stock, i.precio_venta,
            m.medida, m.unidad_medida,
            d.nombre AS deposito_nombre, e.tipo AS espacio_tipo, i.fila, i.columna
        FROM inventario i
        JOIN articulo a ON i.articulo_id = a.id
        LEFT JOIN medida m ON i.medida_id = m.id
        LEFT JOIN espacio e ON i.espacio_id = e.id
        LEFT JOIN deposito d ON e.deposito_id = d.id
        WHERE 1=1
    """
    params: List[Any] = []

    if article_id:
        sql += " AND i.articulo_id = %s"
        params.append(article_id)

    sql += " ORDER BY a.nombre ASC, m.medida ASC LIMIT %s"
    params.append(limit)

    return execute_query(sql, tuple(params))
