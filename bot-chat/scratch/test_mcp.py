import asyncio
from mcp import ClientSession
from mcp.client.sse import sse_client
from langchain_mcp_adapters.tools import load_mcp_tools

async def main():
    url = "http://127.0.0.1:8000/mcp"
    print(f"Connecting to {url}...")
    async with sse_client(url) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            tools = await load_mcp_tools(session)
            print("Tools loaded:", len(tools))
            for t in tools:
                print("-", t.name)
                if t.name == "list_categories":
                    print("Invoking async...")
                    res = await t.ainvoke({})
                    print(res)

if __name__ == "__main__":
    asyncio.run(main())
