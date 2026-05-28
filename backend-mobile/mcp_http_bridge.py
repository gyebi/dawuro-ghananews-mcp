import argparse
import inspect
import json
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any, Callable
from urllib.parse import urlparse

import mcp_server


TOOL_NAMES = [
    "get_latest_news",
    "search_news",
    "get_article_details",
    "get_news_by_category",
    "get_related_news_articles",
    "list_news_categories",
    "list_news_sources",
    "run_news_sync",
    "review_mcp_stories",
    "promote_mcp_story_to_production",
    "promote_mcp_stories_to_production",
    "summarize_news_article",
    "extract_article_key_points",
    "explain_news_story",
    "create_morning_briefing",
    "compare_news_coverage",
    "track_news_topic",
    "get_tracked_news_topics",
    "remove_tracked_news_topic",
    "find_news_timeline_for_topic",
    "get_personalized_news_briefing",
    "get_news_trending_topics",
    "recommend_news_articles",
    "check_news_scraper_status",
    "validate_news_article_data",
]

TOOL_REGISTRY: dict[str, Callable[..., Any]] = {
    name: getattr(mcp_server, name)
    for name in TOOL_NAMES
}


class BridgeError(Exception):
    def __init__(self, status_code: int, message: str):
        self.status_code = status_code
        self.message = message
        super().__init__(message)


def _json_default(value: Any) -> str:
    if hasattr(value, "isoformat"):
        return value.isoformat()

    return str(value)


def _read_json(handler: BaseHTTPRequestHandler) -> dict[str, Any]:
    content_length = int(handler.headers.get("Content-Length", "0"))

    if content_length == 0:
        return {}

    try:
        return json.loads(handler.rfile.read(content_length).decode("utf-8"))
    except json.JSONDecodeError as exc:
        raise BridgeError(400, "Request body must be valid JSON.") from exc


def _auth_token() -> str | None:
    token = os.getenv("MCP_BRIDGE_TOKEN", "").strip()
    return token or None


def _is_authorized(handler: BaseHTTPRequestHandler) -> bool:
    token = _auth_token()

    if token is None:
        return True

    expected_header = f"Bearer {token}"
    return handler.headers.get("Authorization") == expected_header


def _call_tool(tool_name: str, arguments: dict[str, Any]) -> Any:
    tool = TOOL_REGISTRY.get(tool_name)

    if tool is None:
        raise BridgeError(404, f"Unknown MCP tool '{tool_name}'.")

    try:
        signature = inspect.signature(tool)
        accepted_arguments = {
            key: value
            for key, value in arguments.items()
            if key in signature.parameters
        }
        return tool(**accepted_arguments)
    except BridgeError:
        raise
    except TypeError as exc:
        raise BridgeError(400, str(exc)) from exc


class McpBridgeHandler(BaseHTTPRequestHandler):
    server_version = "DawuroMcpBridge/0.1"

    def _send_json(self, status_code: int, payload: dict[str, Any] | list[Any]) -> None:
        response_body = json.dumps(payload, default=_json_default).encode("utf-8")

        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(response_body)))
        self.send_header("Access-Control-Allow-Origin", os.getenv("MCP_BRIDGE_CORS_ORIGIN", "*"))
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.end_headers()
        self.wfile.write(response_body)

    def do_OPTIONS(self) -> None:
        self._send_json(204, {})

    def do_GET(self) -> None:
        path = urlparse(self.path).path

        if path == "/health":
            self._send_json(200, {"ok": True, "service": "dawuro-mcp-bridge"})
            return

        if path == "/tools":
            if not _is_authorized(self):
                self._send_json(401, {"error": "Unauthorized."})
                return

            self._send_json(200, {"tools": sorted(TOOL_REGISTRY)})
            return

        self._send_json(404, {"error": "Not found."})

    def do_POST(self) -> None:
        try:
            if not _is_authorized(self):
                raise BridgeError(401, "Unauthorized.")

            path = urlparse(self.path).path

            if not path.startswith("/tools/"):
                raise BridgeError(404, "Not found.")

            tool_name = path.removeprefix("/tools/").strip("/")

            if not tool_name:
                raise BridgeError(400, "Tool name is required.")

            payload = _read_json(self)
            arguments = payload.get("arguments", {})

            if not isinstance(arguments, dict):
                raise BridgeError(400, "The 'arguments' field must be an object.")

            result = _call_tool(tool_name, arguments)
            self._send_json(200, {"result": result})
        except BridgeError as exc:
            self._send_json(exc.status_code, {"error": exc.message})
        except Exception as exc:
            self._send_json(500, {"error": str(exc)})

    def log_message(self, format: str, *args: Any) -> None:
        if os.getenv("MCP_BRIDGE_QUIET_LOGS") == "1":
            return

        super().log_message(format, *args)


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the Dawuro MCP HTTP bridge.")
    parser.add_argument("--host", default=os.getenv("MCP_BRIDGE_HOST", "127.0.0.1"))
    parser.add_argument(
        "--port",
        type=int,
        default=int(os.getenv("PORT", os.getenv("MCP_BRIDGE_PORT", "8787"))),
    )
    args = parser.parse_args()

    server = ThreadingHTTPServer((args.host, args.port), McpBridgeHandler)
    print(f"Dawuro MCP bridge listening on http://{args.host}:{args.port}")
    server.serve_forever()


if __name__ == "__main__":
    main()
