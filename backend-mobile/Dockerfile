FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV MCP_BRIDGE_HOST=0.0.0.0

WORKDIR /app

COPY pyproject.toml uv.lock ./

RUN pip install --no-cache-dir uv \
    && uv export --format requirements-txt --no-dev --no-hashes --output-file requirements.txt \
    && pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "mcp_http_bridge.py"]
