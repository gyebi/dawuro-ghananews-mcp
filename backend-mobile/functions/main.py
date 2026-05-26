import json
import os
from datetime import datetime, timezone

import firebase_admin
from firebase_admin import firestore, initialize_app
from firebase_functions import https_fn, scheduler_fn
from firebase_functions.core import init
from news_sync import save_story, scrape_news, scrape_source


db = None
PRODUCTION_STORIES_COLLECTION = "stories"
MCP_STORIES_COLLECTION = "mcpStories"


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


def _parse_limit(value: str | None, default: int = 10) -> int:
    if not value:
        return default

    try:
        return max(1, min(int(value), 50))
    except ValueError:
        return default


def _is_manual_sync_authorized(request: https_fn.Request) -> bool:
    expected_token = os.getenv("MANUAL_SYNC_TOKEN")

    if not expected_token:
        return True

    auth_header = request.headers.get("Authorization", "")
    bearer_token = auth_header.removeprefix("Bearer ").strip()
    query_token = request.args.get("token", "")
    return expected_token in {bearer_token, query_token}


def _run_sync(
    limit: int = 10,
    source: str | None = None,
    trigger: str = "manual",
    collection_name: str = PRODUCTION_STORIES_COLLECTION,
) -> dict:
    db = get_db()

    if source:
        result = scrape_source(source, limit)
        stories = [] if "error" in result else result.get("stories", [])
    else:
        stories = scrape_news(limit_per_source=limit)

    saved_ids = [
        save_story(db, story, collection_name=collection_name)
        for story in stories
    ]
    ran_at = datetime.now(timezone.utc).isoformat()

    db.collection("syncLogs").add(
        {
            "message": f"Dawuro {trigger} sync ran successfully",
            "count": len(saved_ids),
            "collection": collection_name,
            "source": source or "all",
            "ranAt": ran_at,
        }
    )

    return {
        "message": "Stories saved to Firestore",
        "collection": collection_name,
        "count": len(saved_ids),
        "source": source or "all",
        "ranAt": ran_at,
        "storyIds": saved_ids,
    }


@scheduler_fn.on_schedule(schedule="every 3 hours")
def sync_news(event: scheduler_fn.ScheduledEvent) -> None:
    result = _run_sync(
        trigger="scheduled",
        collection_name=PRODUCTION_STORIES_COLLECTION,
    )
    print(f"Dawuro scheduled sync saved {result['count']} stories")


@https_fn.on_request()
def manual_sync(request: https_fn.Request) -> https_fn.Response:
    if request.method not in {"GET", "POST"}:
        return https_fn.Response("Method not allowed", status=405)

    if not _is_manual_sync_authorized(request):
        return https_fn.Response("Unauthorized", status=401)

    limit = _parse_limit(request.args.get("limit"), default=10)
    source = request.args.get("source")
    result = _run_sync(
        limit=limit,
        source=source,
        trigger="manual",
        collection_name=MCP_STORIES_COLLECTION,
    )
    return https_fn.Response(
        json.dumps(result),
        status=200,
        mimetype="application/json",
    )
