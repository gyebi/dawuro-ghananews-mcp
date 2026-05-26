from collections import defaultdict
from typing import Any

from services.summary_service import summarize_article


def create_briefing(articles: list[dict[str, Any]], title: str = "Dawuro Briefing") -> dict[str, Any]:
    grouped_articles: dict[str, list[dict[str, Any]]] = defaultdict(list)

    for article in articles:
        grouped_articles[article.get("category", "News")].append(article)

    sections = []

    for category, category_articles in grouped_articles.items():
        summaries = [
            summarize_article(article, style="short")
            for article in category_articles[:5]
        ]
        sections.append(
            {
                "category": category,
                "count": len(category_articles),
                "stories": summaries,
            }
        )

    return {
        "title": title,
        "totalStories": len(articles),
        "sections": sections,
    }


def compare_coverage(query: str, articles: list[dict[str, Any]]) -> dict[str, Any]:
    by_source: dict[str, list[dict[str, Any]]] = defaultdict(list)

    for article in articles:
        by_source[article.get("source", "Unknown")].append(article)

    return {
        "query": query,
        "sourceCount": len(by_source),
        "sources": [
            {
                "source": source,
                "storyCount": len(source_articles),
                "stories": [
                    summarize_article(article, style="short")
                    for article in source_articles[:3]
                ],
            }
            for source, source_articles in by_source.items()
        ],
    }
