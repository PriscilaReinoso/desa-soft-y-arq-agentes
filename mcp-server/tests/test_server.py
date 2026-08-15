"""Integration unit tests for Ferretería MCP Server."""

import asyncio
import unittest
from src.server import (
    search_products,
    get_product_details,
    check_low_stock,
    list_categories,
    get_stock_movements,
    mcp,
)


class TestFerreteriaMCPServer(unittest.TestCase):

    def test_mcp_tools_registration(self):
        """Verify all 5 tools are registered on the FastMCP server instance."""
        tools = asyncio.run(mcp.list_tools())
        tool_names = [tool.name for tool in tools]
        expected_tools = [
            "search_products",
            "get_product_details",
            "check_low_stock",
            "list_categories",
            "get_stock_movements",
        ]
        for expected in expected_tools:
            self.assertIn(expected, tool_names)

    def test_tool_invocations_graceful_error_or_success(self):
        """Verify calling tool handlers returns valid dict structure without unhandled crashes."""
        res_categories = list_categories()
        self.assertIn("status", res_categories)

        res_search = search_products(query="Martillo")
        self.assertIn("status", res_search)

        res_details = get_product_details(sku="HM-MAR-001")
        self.assertIn("status", res_details)

        res_low_stock = check_low_stock()
        self.assertIn("status", res_low_stock)

        res_movements = get_stock_movements(product_id=1)
        self.assertIn("status", res_movements)


if __name__ == "__main__":
    unittest.main()
