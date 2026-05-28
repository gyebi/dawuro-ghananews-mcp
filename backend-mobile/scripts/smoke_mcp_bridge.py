import argparse
import json
import sys
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


def _request_json(
    url: str,
    token: str | None = None,
    method: str = "GET",
    payload: dict[str, Any] | None = None,
) -> tuple[int, dict[str, Any]]:
    headers = {"Accept": "application/json"}
    body = None

    if token:
        headers["Authorization"] = f"Bearer {token}"

    if payload is not None:
        body = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"

    request = Request(url, data=body, headers=headers, method=method)

    try:
        with urlopen(request, timeout=20) as response:
            response_body = response.read().decode("utf-8")
            return response.status, json.loads(response_body or "{}")
    except HTTPError as exc:
        response_body = exc.read().decode("utf-8")
        try:
            parsed_body = json.loads(response_body or "{}")
        except json.JSONDecodeError:
            parsed_body = {"error": response_body}

        return exc.code, parsed_body
    except URLError as exc:
        raise RuntimeError(f"Could not reach bridge: {exc.reason}") from exc


def _expect(condition: bool, message: str) -> None:
    if not condition:
        raise RuntimeError(message)


def main() -> int:
    parser = argparse.ArgumentParser(description="Smoke test the Dawuro MCP HTTP bridge.")
    parser.add_argument("--url", required=True, help="Bridge base URL, such as http://127.0.0.1:8787.")
    parser.add_argument("--token", help="Bridge bearer token, if MCP_BRIDGE_TOKEN is enabled.")
    parser.add_argument(
        "--skip-tool-call",
        action="store_true",
        help="Only test /health and /tools; skip POST /tools/list_news_sources.",
    )
    args = parser.parse_args()

    base_url = args.url.rstrip("/")

    health_status, health = _request_json(f"{base_url}/health")
    _expect(health_status == 200 and health.get("ok") is True, f"/health failed: {health_status} {health}")
    print("ok /health")

    tools_status, tools = _request_json(f"{base_url}/tools", token=args.token)
    _expect(tools_status == 200, f"/tools failed: {tools_status} {tools}")
    _expect("list_news_sources" in tools.get("tools", []), "list_news_sources is missing from /tools.")
    print(f"ok /tools ({len(tools.get('tools', []))} tools)")

    if not args.skip_tool_call:
        source_status, sources = _request_json(
            f"{base_url}/tools/list_news_sources",
            token=args.token,
            method="POST",
            payload={"arguments": {}},
        )
        _expect(source_status == 200, f"list_news_sources failed: {source_status} {sources}")
        _expect(sources.get("result"), "list_news_sources returned an empty result.")
        print("ok POST /tools/list_news_sources")

    print("bridge smoke test passed")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"bridge smoke test failed: {exc}", file=sys.stderr)
        raise SystemExit(1)
