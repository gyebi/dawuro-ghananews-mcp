import hashlib
import os

import firebase_admin
from firebase_admin import credentials, firestore

if not firebase_admin._apps:
    service_account_path = os.getenv(
        "FIREBASE_SERVICE_ACCOUNT_PATH",
        "firebase-service-account.json",
    )
    cred = credentials.Certificate(service_account_path)
    firebase_admin.initialize_app(cred)

db = firestore.client()


def make_story_id(url: str, title: str):
    unique_text = url or title
    return hashlib.sha256(unique_text.encode("utf-8")).hexdigest()


def save_story(story: dict):
    stories_ref = db.collection("stories")

    story_id = make_story_id(
        story.get("url", ""),
        story.get("title", "")
    )

    doc_ref = stories_ref.document(story_id)

    doc_ref.set(
        {
            "title": story.get("title", ""),
            "summary": story.get("summary", ""),
            "source": story.get("source", ""),
            "category": story.get("category", "News"),
            "url": story.get("url", ""),
            "createdAt": firestore.SERVER_TIMESTAMP,
            "updatedAt": firestore.SERVER_TIMESTAMP,
        },
        merge=True,
    )

    return story_id
