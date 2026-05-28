import hashlib
from typing import Any

from firebase_admin import firestore

from repositories.firestore_repository import DEFAULT_STORIES_COLLECTION, get_db
from services.news_service import get_latest_articles, search_articles
from services.summary_service import summarize_article


TRACKED_TOPICS_COLLECTION = "trackedTopics"
DEFAULT_USER_ID = "default"


def _normalize_topic(topic: str) -> str:
    return " ".join(topic.lower().strip().split())


def _topic_id(user_id: str, topic: str) -> str:
    unique_text = f"{user_id}:{_normalize_topic(topic)}"
    return hashlib.sha256(unique_text.encode("utf-8")).hexdigest()


def _timestamp_sort_value(value: Any) -> float:
    if hasattr(value, "timestamp"):
        return value.timestamp()

    return 0


class TopicService:
    def __init__(self, db=None, collection_name: str = TRACKED_TOPICS_COLLECTION):
        self.db = db or get_db()
        self.collection_name = collection_name

    def _collection(self):
        return self.db.collection(self.collection_name)

    def track_topic(self, topic: str, user_id: str = DEFAULT_USER_ID) -> dict[str, Any]:
        normalized_topic = _normalize_topic(topic)

        if not normalized_topic:
            return {"status": "error", "message": "Topic cannot be empty."}

        topic_id = _topic_id(user_id=user_id, topic=normalized_topic)
        topic_ref = self._collection().document(topic_id)
        snapshot = topic_ref.get()
        topic_data = {
            "topic": normalized_topic,
            "displayTopic": topic.strip(),
            "userId": user_id,
            "updatedAt": firestore.SERVER_TIMESTAMP,
        }

        if not snapshot.exists:
            topic_data["createdAt"] = firestore.SERVER_TIMESTAMP

        topic_ref.set(topic_data, merge=True)

        return {
            "status": "tracked",
            "topicId": topic_id,
            "topic": normalized_topic,
            "userId": user_id,
        }

    def get_tracked_topics(self, user_id: str = DEFAULT_USER_ID) -> list[dict[str, Any]]:
        snapshots = (
            self._collection()
            .where("userId", "==", user_id)
            .stream()
        )

        topics = [
            {
                "id": snapshot.id,
                **(snapshot.to_dict() or {}),
            }
            for snapshot in snapshots
        ]

        return sorted(
            topics,
            key=lambda topic: _timestamp_sort_value(
                topic.get("updatedAt") or topic.get("createdAt")
            ),
            reverse=True,
        )

    def remove_tracked_topic(self, topic_id: str) -> dict[str, Any]:
        topic_ref = self._collection().document(topic_id)
        snapshot = topic_ref.get()

        if not snapshot.exists:
            return {
                "status": "not_found",
                "message": f"Tracked topic '{topic_id}' was not found.",
            }

        topic_ref.delete()
        return {"status": "removed", "topicId": topic_id}


def track_topic(topic: str, user_id: str = DEFAULT_USER_ID) -> dict[str, Any]:
    return TopicService().track_topic(topic=topic, user_id=user_id)


def get_tracked_topics(user_id: str = DEFAULT_USER_ID) -> list[dict[str, Any]]:
    return TopicService().get_tracked_topics(user_id=user_id)


def remove_tracked_topic(topic_id: str) -> dict[str, Any]:
    return TopicService().remove_tracked_topic(topic_id=topic_id)


def find_timeline_for_topic(
    topic: str,
    limit: int = 10,
    collection_name: str = DEFAULT_STORIES_COLLECTION,
) -> dict[str, Any]:
    articles = search_articles(query=topic, limit=limit, collection_name=collection_name)

    return {
        "topic": topic,
        "count": len(articles),
        "timeline": [
            {
                "articleId": article.get("id"),
                "title": article.get("title"),
                "source": article.get("source"),
                "publishedAt": article.get("publishedAt"),
                "createdAt": article.get("createdAt"),
                "summary": summarize_article(article, style="short")["summary"],
            }
            for article in articles
        ],
    }


def get_personalized_briefing(
    user_id: str = DEFAULT_USER_ID,
    per_topic_limit: int = 5,
    collection_name: str = DEFAULT_STORIES_COLLECTION,
) -> dict[str, Any]:
    topics = get_tracked_topics(user_id=user_id)

    if not topics:
        latest_articles = get_latest_articles(limit=per_topic_limit, collection_name=collection_name)
        return {
            "userId": user_id,
            "trackedTopicCount": 0,
            "message": "No tracked topics found. Showing latest Dawuro stories instead.",
            "sections": [
                {
                    "topic": "Latest News",
                    "stories": [
                        summarize_article(article, style="short")
                        for article in latest_articles
                    ],
                }
            ],
        }

    sections = []

    for topic in topics:
        display_topic = topic.get("displayTopic") or topic.get("topic", "")
        articles = search_articles(
            query=topic.get("topic", display_topic),
            limit=per_topic_limit,
            collection_name=collection_name,
        )
        sections.append(
            {
                "topicId": topic.get("id"),
                "topic": display_topic,
                "storyCount": len(articles),
                "stories": [
                    summarize_article(article, style="short")
                    for article in articles
                ],
            }
        )

    return {
        "userId": user_id,
        "trackedTopicCount": len(topics),
        "sections": sections,
    }
