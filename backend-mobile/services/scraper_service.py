from typing import Any

from repositories.firestore_repository import FirestoreStoryRepository, MCP_STORIES_COLLECTION
from scrapers import GHANA_SOURCES, scrape_all_sources, scrape_source


def list_sources() -> list[dict[str, str]]:
    return [{"id": source_id, "url": url} for source_id, url in GHANA_SOURCES.items()]


def scrape_latest(source: str | None = None, limit: int = 10) -> dict[str, Any]:
    if source:
        return {source: scrape_source(source, limit)}

    return scrape_all_sources(limit)


def sync_latest_stories(
    source: str | None = None,
    limit: int = 10,
    collection_name: str = MCP_STORIES_COLLECTION,
    repository: FirestoreStoryRepository | None = None,
) -> dict[str, Any]:
    repository = repository or FirestoreStoryRepository(collection_name=collection_name)
    results = scrape_latest(source=source, limit=limit)
    saved_story_ids = []

    for source_result in results.values():
        if "error" in source_result:
            continue

        for story in source_result.get("stories", []):
            saved_story_ids.append(repository.save_story(story))

    return {
        "message": "Stories saved to Firestore",
        "collection": collection_name,
        "count": len(saved_story_ids),
        "storyIds": saved_story_ids,
    }
