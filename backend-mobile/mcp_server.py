import json
from typing import Any

from mcp.server.fastmcp import FastMCP

from repositories.firestore_repository import DEFAULT_STORIES_COLLECTION, MCP_STORIES_COLLECTION
from services.briefing_service import compare_coverage, create_briefing
from services.news_service import get_article_by_id, get_latest_articles, search_articles
from services.promotion_service import promote_mcp_stories, promote_mcp_story
from services.recommendation_service import get_trending_topics, recommend_articles
from services.scraper_service import list_sources, sync_latest_stories
from services.summary_service import explain_article, extract_key_points, summarize_article
from services.topic_service import (
    DEFAULT_USER_ID,
    find_timeline_for_topic,
    get_personalized_briefing,
    get_tracked_topics,
    remove_tracked_topic,
    track_topic,
)


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


@mcp.tool()
def summarize_news_article(
    article_id: str,
    style: str = "short",
    collection_name: str = DEFAULT_STORIES_COLLECTION,
) -> dict[str, Any]:
    """Summarize one Dawuro article with short, detailed, or whatsapp style output."""
    article = get_article_by_id(article_id, collection_name=collection_name)

    if article is None:
        return {"error": f"Article '{article_id}' was not found."}

    return summarize_article(article, style=style)


@mcp.tool()
def extract_article_key_points(
    article_id: str,
    limit: int = 4,
    collection_name: str = DEFAULT_STORIES_COLLECTION,
) -> dict[str, Any]:
    """Extract key points from one Dawuro article."""
    article = get_article_by_id(article_id, collection_name=collection_name)

    if article is None:
        return {"error": f"Article '{article_id}' was not found."}

    return {
        "articleId": article_id,
        "title": article.get("title", "Untitled story"),
        "keyPoints": extract_key_points(article, limit=limit),
    }


@mcp.tool()
def explain_news_story(
    article_id: str,
    collection_name: str = DEFAULT_STORIES_COLLECTION,
) -> dict[str, Any]:
    """Explain one Dawuro story with context questions and why-it-matters framing."""
    article = get_article_by_id(article_id, collection_name=collection_name)

    if article is None:
        return {"error": f"Article '{article_id}' was not found."}

    return explain_article(article)


@mcp.tool()
def create_morning_briefing(
    limit: int = 20,
    collection_name: str = DEFAULT_STORIES_COLLECTION,
) -> dict[str, Any]:
    """Create a categorized Dawuro morning briefing from recent stories."""
    articles = get_latest_articles(limit=limit, collection_name=collection_name)
    return create_briefing(articles, title="Dawuro Morning Briefing")


@mcp.tool()
def compare_news_coverage(
    query: str,
    limit: int = 12,
    collection_name: str = DEFAULT_STORIES_COLLECTION,
) -> dict[str, Any]:
    """Compare how different Dawuro sources are covering a topic."""
    articles = search_articles(query=query, limit=limit, collection_name=collection_name)
    return compare_coverage(query=query, articles=articles)


@mcp.tool()
def track_news_topic(topic: str, user_id: str = DEFAULT_USER_ID) -> dict[str, Any]:
    """Track a news topic for later personalized Dawuro briefings."""
    return track_topic(topic=topic, user_id=user_id)


@mcp.tool()
def get_tracked_news_topics(user_id: str = DEFAULT_USER_ID) -> list[dict[str, Any]]:
    """List tracked Dawuro news topics for a user."""
    return get_tracked_topics(user_id=user_id)


@mcp.tool()
def remove_tracked_news_topic(topic_id: str) -> dict[str, Any]:
    """Remove one tracked Dawuro topic by tracked topic ID."""
    return remove_tracked_topic(topic_id=topic_id)


@mcp.tool()
def find_news_timeline_for_topic(
    topic: str,
    limit: int = 10,
    collection_name: str = DEFAULT_STORIES_COLLECTION,
) -> dict[str, Any]:
    """Find recent Dawuro stories matching a topic and present them as a timeline."""
    return find_timeline_for_topic(
        topic=topic,
        limit=limit,
        collection_name=collection_name,
    )


@mcp.tool()
def get_personalized_news_briefing(
    user_id: str = DEFAULT_USER_ID,
    per_topic_limit: int = 5,
    collection_name: str = DEFAULT_STORIES_COLLECTION,
) -> dict[str, Any]:
    """Create a Dawuro briefing from a user's tracked topics."""
    return get_personalized_briefing(
        user_id=user_id,
        per_topic_limit=per_topic_limit,
        collection_name=collection_name,
    )


@mcp.tool()
def get_news_trending_topics(
    limit: int = 10,
    sample_size: int = 100,
    collection_name: str = DEFAULT_STORIES_COLLECTION,
) -> list[dict[str, Any]]:
    """Find likely trending topics from recent Dawuro stories."""
    return get_trending_topics(
        limit=limit,
        sample_size=sample_size,
        collection_name=collection_name,
    )


@mcp.tool()
def recommend_news_articles(
    topic: str | None = None,
    user_id: str = DEFAULT_USER_ID,
    limit: int = 10,
    collection_name: str = DEFAULT_STORIES_COLLECTION,
) -> dict[str, Any]:
    """Recommend Dawuro articles from a topic or a user's tracked topics."""
    return recommend_articles(
        topic=topic,
        user_id=user_id,
        limit=limit,
        collection_name=collection_name,
    )


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


@mcp.resource("dawuro://topics/tracked")
def tracked_topics_resource() -> str:
    """Tracked Dawuro news topics for the default user."""
    return json.dumps(get_tracked_topics(), default=str)


@mcp.resource("dawuro://topics/trending")
def trending_topics_resource() -> str:
    """Likely trending topics from recent Dawuro stories."""
    return json.dumps(get_trending_topics(), default=str)


@mcp.prompt()
def morning_briefing_prompt() -> str:
    return (
        "Create a concise Dawuro morning briefing from the latest Ghana news. "
        "Group stories by category, name the source for each story, explain why each section matters, "
        "and avoid sensational language."
    )


@mcp.prompt()
def summarize_article_prompt(title: str = "this article") -> str:
    return (
        f"Summarize {title} for a Ghanaian news reader. Include a short summary, "
        "3-5 key points, why it matters, the source, and a neutral WhatsApp-ready version."
    )


@mcp.prompt()
def compare_coverage_prompt(topic: str) -> str:
    return (
        f"Compare Ghanaian news coverage of {topic}. Identify which sources reported it, "
        "what facts overlap, what details differ, and what remains uncertain."
    )


@mcp.prompt()
def explain_background_prompt(topic: str) -> str:
    return (
        f"Explain the background of {topic} for a reader who wants context, not opinion. "
        "Use plain language, separate confirmed facts from interpretation, and suggest follow-up questions."
    )


@mcp.prompt()
def tracked_topic_briefing_prompt(topic: str) -> str:
    return (
        f"Create a concise Dawuro update for the tracked topic {topic}. "
        "Use recent matching stories, identify the sources, explain the timeline, "
        "and end with what the reader should watch next."
    )


if __name__ == "__main__":
    mcp.run()
