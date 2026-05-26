from datetime import datetime, timezone

import firebase_admin
from firebase_admin import firestore, initialize_app
from firebase_functions import scheduler_fn
from firebase_functions.core import init
from news_sync import save_story, scrape_news


db = None


@init
def initialize() -> None:
    get_db()


def get_db():
    global db

    if db is None:
        if not firebase_admin._apps:
            initialize_app()

        db = firestore.client()

    return db


@scheduler_fn.on_schedule(schedule="every 3 hours")
def sync_news(event: scheduler_fn.ScheduledEvent) -> None:
    db = get_db()
    stories = scrape_news()
    saved_ids = [save_story(db, story) for story in stories]

    db.collection("syncLogs").add(
        {
            "message": "Dawuro scheduled sync ran successfully",
            "count": len(saved_ids),
            "ranAt": datetime.now(timezone.utc).isoformat(),
        }
    )

    print(f"Dawuro scheduled sync saved {len(saved_ids)} stories")
