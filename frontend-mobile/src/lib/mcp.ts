const mcpBridgeUrl = process.env.EXPO_PUBLIC_MCP_BRIDGE_URL?.replace(/\/$/, "");

type McpToolArguments = Record<string, unknown>;

export type ArticleSummary = {
  title: string;
  source: string;
  style: string;
  summary: string;
  keyPoints: string[];
  url?: string;
};

export function isMcpBridgeConfigured() {
  return Boolean(mcpBridgeUrl);
}

function normalizeMcpResponse<T>(payload: unknown): T {
  if (
    payload &&
    typeof payload === "object" &&
    "result" in payload
  ) {
    return (payload as { result: T }).result;
  }

  return payload as T;
}

export async function callMcpTool<T>(
  toolName: string,
  args: McpToolArguments = {}
): Promise<T> {
  if (!mcpBridgeUrl) {
    throw new Error("MCP bridge URL is not configured.");
  }

  const response = await fetch(`${mcpBridgeUrl}/tools/${toolName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tool: toolName,
      arguments: args,
    }),
  });

  if (!response.ok) {
    throw new Error(`MCP tool call failed with status ${response.status}.`);
  }

  return normalizeMcpResponse<T>(await response.json());
}

export function summarizeNewsArticle(
  articleId: string,
  style: "short" | "detailed" | "whatsapp" = "short"
) {
  return callMcpTool<ArticleSummary>("summarize_news_article", {
    article_id: articleId,
    style,
    collection_name: "stories",
  });
}
