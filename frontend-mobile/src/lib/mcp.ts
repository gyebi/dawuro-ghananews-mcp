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

export type ArticleKeyPoints = {
  articleId: string;
  title: string;
  keyPoints: string[];
};

export type StoryExplanation = {
  title: string;
  source: string;
  category: string;
  whatHappened: string;
  whyItMatters: string;
  questionsToAsk: string[];
};

export type RelatedArticle = {
  id: string;
  title: string;
  summary: string;
  source: string;
  category: string;
  url?: string;
};

export type BriefingStory = ArticleSummary;

export type BriefingSection = {
  category: string;
  count: number;
  stories: BriefingStory[];
};

export type MorningBriefing = {
  title: string;
  totalStories: number;
  sections: BriefingSection[];
};

export type TrendingTopic = {
  topic: string;
  score: number;
  sourceCount: number;
  sources: string[];
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

export function extractArticleKeyPoints(articleId: string, limit = 4) {
  return callMcpTool<ArticleKeyPoints>("extract_article_key_points", {
    article_id: articleId,
    limit,
    collection_name: "stories",
  });
}

export function explainNewsStory(articleId: string) {
  return callMcpTool<StoryExplanation>("explain_news_story", {
    article_id: articleId,
    collection_name: "stories",
  });
}

export function getRelatedNewsArticles(articleId: string, limit = 4) {
  return callMcpTool<RelatedArticle[]>("get_related_news_articles", {
    article_id: articleId,
    limit,
    collection_name: "stories",
  });
}

export function createMorningBriefing(limit = 20) {
  return callMcpTool<MorningBriefing>("create_morning_briefing", {
    limit,
    collection_name: "stories",
  });
}

export function getNewsTrendingTopics(limit = 10) {
  return callMcpTool<TrendingTopic[]>("get_news_trending_topics", {
    limit,
    collection_name: "stories",
  });
}
