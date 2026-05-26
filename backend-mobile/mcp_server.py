import json
from typing import Any

from mcp.server.fastmcp import FastMCP

from repositories.firestore_repository import DEFAULT_STORIES_COLLECTION, MCP_STORIES_COLLECTION
from services.news_service import get_article_by_id, get_latest_articles, search_articles
from services.promotion_service import promote_mcp_stories, promote_mcp_story
from services.scraper_service import list_sources, sync_latest_stories


mcp = FastMCP("Dawuro")


@mcp.tool()
def get_latest_news(
    limit: int = 20,
    source: str | None = None,
    collection_name: str = DEFAULT_STORIES_COLLECTION,
) -> list[dict[str, Any]]:
    """Get the latest Dawuro news articles from Firestore."""
    return get_latest_articles(limit=limit, source=source, collection_name=collection_name)


@mcp.tool()
def search_news(
    query: str,
    limit: int = 10,
    collection_name: str = DEFAULT_STORIES_COLLECTION,
) -> list[dict[str, Any]]:
    """Search Dawuro stories by topic, keyword, source, or category."""
    return search_articles(query=query, limit=limit, collection_name=collection_name)


@mcp.tool()
def get_article_details(
    article_id: str,
    collection_name: str = DEFAULT_STORIES_COLLECTION,
) -> dict[str, Any]:
    """Fetch one Dawuro article by Firestore document ID."""
    article = get_article_by_id(article_id, collection_name=collection_name)

    if article is None:
        return {"error": f"Article '{article_id}' was not found."}

    return article


@mcp.tool()
def list_news_sources() -> list[dict[str, str]]:
    """List Ghanaian news sources currently configured for Dawuro."""
    return list_sources()


@mcp.tool()
def run_news_sync(
    limit: int = 10,
    source: str | None = None,
    collection_name: str = MCP_STORIES_COLLECTION,
) -> dict[str, Any]:
    """Scrape configured news sources and save the latest stories to Firestore."""
    return sync_latest_stories(source=source, limit=limit, collection_name=collection_name)


@mcp.tool()
def review_mcp_stories(limit: int = 20, source: str | None = None) -> list[dict[str, Any]]:
    """Review recently scraped MCP stories before promotion to the production feed."""
    return get_latest_articles(limit=limit, source=source, collection_name=MCP_STORIES_COLLECTION)


@mcp.tool()
def promote_mcp_story_to_production(story_id: str) -> dict[str, Any]:
    """Promote one reviewed MCP story from mcpStories into the production stories collection."""
    return promote_mcp_story(story_id=story_id)


@mcp.tool()
def promote_mcp_stories_to_production(story_ids: list[str]) -> dict[str, Any]:
    """Promote multiple reviewed MCP stories from mcpStories into the production stories collection."""
    return promote_mcp_stories(story_ids=story_ids)


@mcp.resource("dawuro://articles/latest")
def latest_articles_resource() -> str:
    """Latest Dawuro articles."""
    return json.dumps(get_latest_articles(limit=20), default=str)


@mcp.resource("dawuro://mcp/articles/latest")
def latest_mcp_articles_resource() -> str:
    """Latest unreviewed or reviewed MCP-scraped articles."""
    return json.dumps(
        get_latest_articles(limit=20, collection_name=MCP_STORIES_COLLECTION),
        default=str,
    )


@mcp.resource("dawuro://articles/{article_id}")
def article_resource(article_id: str) -> str:
    """One Dawuro article by Firestore document ID."""
    return json.dumps(get_article_details(article_id), default=str)


@mcp.resource("dawuro://sources")
def sources_resource() -> str:
    """Configured Dawuro news sources."""
    return json.dumps(list_sources(), default=str)


if __name__ == "__main__":
    mcp.run()
