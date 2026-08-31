"""Database connection and query module for Hardware Store (Ferretería) MCP Server.

Provides connection execution with psycopg3 dict_row mapping and clean exception handling.
"""

from typing import Any, Dict, List, Optional

import psycopg
from psycopg.rows import dict_row

from .config import get_connection_string


def execute_query(query: str, params: Optional[tuple | dict] = None) -> List[Dict[str, Any]]:
    """Executes a SQL SELECT query against PostgreSQL and returns a list of dictionaries.

    Args:
        query: SQL string to execute.
        params: Parameters to substitute in the SQL query.

    Returns:
        List of dictionaries representing rows.

    Raises:
        RuntimeError: If connection or SQL execution fails.
    """

    conn_str = get_connection_string()

    try:
        with psycopg.connect(
            conn_str,
            row_factory=dict_row
        ) as conn:
            with conn.cursor() as cur:
                cur.execute(query, params or ())
                rows = cur.fetchall()

                result = []

                for row in rows:
                    row_dict = {}

                    for k, v in dict(row).items():
                        if hasattr(v, "isoformat"):
                            row_dict[k] = v.isoformat()
                        elif hasattr(v, "__float__"):
                            row_dict[k] = float(v)
                        else:
                            row_dict[k] = v

                    result.append(row_dict)

                return result

    except psycopg.Error as err:
        raise RuntimeError(
            f"Error de base de datos PostgreSQL: {err}. "
            "Verifica que el contenedor de Docker esté iniciado "
            "(`docker compose up -d`)."
        ) from err
