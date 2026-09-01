"""Hardware Store (Ferretería) MCP Server entry point.

Creates the FastMCP server, registers the inventory tools exposed to the
AI agent, and starts the server over STDIO.
"""

from fastmcp import FastMCP

from app.tools import inventory as inventory_tools
from app.tools import semantic_search as semantic_search_tools

mcp = FastMCP("Ferreteria Inventory MCP Server")


def register_tools() -> None:
    """Registers the inventory tools on the MCP server instance."""
    mcp.tool()(inventory_tools.search_products)
    mcp.tool()(inventory_tools.get_product_details)
    mcp.tool()(inventory_tools.check_low_stock)
    mcp.tool()(inventory_tools.list_categories)
    mcp.tool()(inventory_tools.get_stock_inventory)
    mcp.tool()(semantic_search_tools.semantic_search)


register_tools()

if __name__ == "__main__":
    mcp.run()
