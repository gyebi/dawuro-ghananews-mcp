import hashlib
import json
import os
from typing import Any

import firebase_admin
from firebase_admin import credentials, firestore, initialize_app


_db = None
DEFAULT_STORIES_COLLECTION = "stories"
MCP_STORIES_COLLECTION = "mcpStories"


def _get_firebase_credentials():
    firebase_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")

    if firebase_json:
        return credentials.Certificate(json.loads(firebase_json))

    service_account_path = os.getenv(
        "FIREBASE_SERVICE_ACCOUNT_PATH",
        "firebase-service-account.json",
    )
    return credentials.Certificate(service_account_path)


def get_db():
    global _db

    if _db is None:
        if not firebase_admin._apps:
            initialize_app(_get_firebase_credentials())

        _db = firestore.client()

    return _db


def make_story_id(story: dict[str, Any]) -> str:
    unique_text = story.get("url") or story.get("title", "")
    return hashlib.sha256(unique_text.encode("utf-8")).hexdigest()


def _serialize_firestore_value(value):
    if hasattr(value, "isoformat"):
        return value.isoformat()

    return value


def _serialize_story(story_id: str, data: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": story_id,
        **{key: _serialize_firestore_value(value) for key, value in data.items()},
    }


class FirestoreStoryRepository:
    def __init__(self, db=None, collection_name: str = DEFAULT_STORIES_COLLECTION):
        self.db = db or get_db()
        self.collection_name = collection_name

    def _collection(self):
        return self.db.collection(self.collection_name)

    def list_latest(self, limit: int = 20, source: str | None = None) -> list[dict[str, Any]]:
        query = (
            self._collection()
            .order_by("createdAt", direction=firestore.Query.DESCENDING)
            .limit(limit)
        )
        snapshots = query.stream()
        stories = [_serialize_story(snapshot.id, snapshot.to_dict() or {}) for snapshot in snapshots]

        if source:
            stories = [story for story in stories if story.get("source") == source]

        return stories

    def get_by_id(self, story_id: str) -> dict[str, Any] | None:
        snapshot = self._collection().document(story_id).get()

        if not snapshot.exists:
            return None

        return _serialize_story(snapshot.id, snapshot.to_dict() or {})

    def search(self, query: str, limit: int = 10) -> list[dict[str, Any]]:
        query_lower = query.lower().strip()

        if not query_lower:
            return []

        stories = self.list_latest(limit=100)
        matches = [
            story
            for story in stories
            if query_lower in story.get("title", "").lower()
            or query_lower in story.get("summary", "").lower()
            or query_lower in story.get("category", "").lower()
            or query_lower in story.get("source", "").lower()
        ]
        return matches[:limit]

    def save_story(self, story: dict[str, Any]) -> str:
        story_id = make_story_id(story)
        story_ref = self._collection().document(story_id)
        snapshot = story_ref.get()

        story_data = {
            "title": story.get("title", ""),
            "summary": story.get("summary", ""),
            "source": story.get("source", ""),
            "category": story.get("category", "News"),
            "url": story.get("url", ""),
            "updatedAt": firestore.SERVER_TIMESTAMP,
            "scrapedAt": firestore.SERVER_TIMESTAMP,
        }

        if not snapshot.exists:
            story_data["createdAt"] = firestore.SERVER_TIMESTAMP

        if story.get("publishedAt"):
            story_data["publishedAt"] = story["publishedAt"]

        story_ref.set(story_data, merge=True)
        return story_id
