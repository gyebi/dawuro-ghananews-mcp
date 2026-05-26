import re
from collections import Counter
from typing import Any

from repositories.firestore_repository import DEFAULT_STORIES_COLLECTION
from services.news_service import get_latest_articles, search_articles
from services.summary_service import summarize_article
from services.topic_service import DEFAULT_USER_ID, get_tracked_topics


STOP_WORDS = {
    "about",
    "after",
    "again",
    "against",
    "also",
    "amid",
    "from",
    "ghana",
    "ghanaian",
    "have",
    "into",
    "more",
    "news",
    "over",
    "says",
    "that",
    "their",
    "this",
    "with",
    "will",
}


def _tokens(text: str) -> list[str]:
    return [
        token
        for token in re.findall(r"[a-zA-Z][a-zA-Z-]{2,}", text.lower())
        if token not in STOP_WORDS
    ]


def _article_text(article: dict[str, Any]) -> str:
    return " ".join(
        str(value)
        for value in [
            article.get("title", ""),
            article.get("summary", ""),
            article.get("category", ""),
            article.get("source", ""),
        ]
        if value
    )


def get_trending_topics(
    limit: int = 10,
    sample_size: int = 100,
    collection_name: str = DEFAULT_STORIES_COLLECTION,
) -> list[dict[str, Any]]:
    articles = get_latest_articles(limit=sample_size, collection_name=collection_name)
    counts = Counter()
    sources_by_topic: dict[str, set[str]] = {}

    for article in articles:
        article_tokens = set(_tokens(_article_text(article)))
        source = article.get("source", "Unknown")

        for token in article_tokens:
            counts[token] += 1
            sources_by_topic.setdefault(token, set()).add(source)

    return [
        {
            "topic": topic,
            "score": score,
            "sourceCount": len(sources_by_topic.get(topic, set())),
            "sources": sorted(sources_by_topic.get(topic, set())),
        }
        for topic, score in counts.most_common(limit)
    ]


def recommend_articles(
    topic: str | None = None,
    user_id: str = DEFAULT_USER_ID,
    limit: int = 10,
    collection_name: str = DEFAULT_STORIES_COLLECTION,
) -> dict[str, Any]:
    candidate_topics = []

    if topic:
        candidate_topics.append(topic)
    else:
        candidate_topics.extend(
            tracked_topic.get("topic", "")
            for tracked_topic in get_tracked_topics(user_id=user_id)
        )

    if not candidate_topics:
        articles = get_latest_articles(limit=limit, collection_name=collection_name)
        return {
            "strategy": "latest",
            "userId": user_id,
            "topic": None,
            "recommendations": [
                summarize_article(article, style="short")
                for article in articles
            ],
        }

    recommendations_by_id = {}

    for candidate_topic in candidate_topics:
        for article in search_articles(
            query=candidate_topic,
            limit=limit,
            collection_name=collection_name,
        ):
            article_id = article.get("id") or article.get("url") or article.get("title")
            recommendations_by_id[article_id] = {
                **summarize_article(article, style="short"),
                "articleId": article.get("id"),
                "matchedTopic": candidate_topic,
            }

            if len(recommendations_by_id) >= limit:
                break

        if len(recommendations_by_id) >= limit:
            break

    return {
        "strategy": "topic",
        "userId": user_id,
        "topic": topic,
        "trackedTopicCount": len(candidate_topics) if not topic else 0,
        "recommendations": list(recommendations_by_id.values())[:limit],
    }
