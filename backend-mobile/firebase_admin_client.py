import hashlib
import json
import os

import firebase_admin
from firebase_admin import credentials, firestore


def get_firebase_credentials():
    firebase_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")

    if firebase_json:
        return credentials.Certificate(json.loads(firebase_json))

    service_account_path = os.getenv(
        "FIREBASE_SERVICE_ACCOUNT_PATH",
        "firebase-service-account.json",
    )
    return credentials.Certificate(service_account_path)


if not firebase_admin._apps:
    cred = get_firebase_credentials()
    firebase_admin.initialize_app(cred)

db = firestore.client()


def make_story_id(url: str, title: str):
    unique_text = url or title
    return hashlib.sha256(unique_text.encode("utf-8")).hexdigest()


def save_story(story: dict):
    stories_ref = db.collection("stories")

    story_id = make_story_id(
        story.get("url", ""),
        story.get("title", ""),
    )

    doc_ref = stories_ref.document(story_id)
    snapshot = doc_ref.get()

    story_data = {
        "title": story.get("title", ""),
        "summary": story.get("summary", ""),
        "source": story.get("source", ""),
        "category": story.get("category", "News"),
        "url": story.get("url", ""),
        "updatedAt": firestore.SERVER_TIMESTAMP,
    }

    if not snapshot.exists:
        story_data["createdAt"] = firestore.SERVER_TIMESTAMP

    if story.get("publishedAt"):
        story_data["publishedAt"] = story["publishedAt"]

    doc_ref.set(story_data, merge=True)

    return story_id
