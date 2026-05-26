from typing import Any

from repositories.firestore_repository import DEFAULT_STORIES_COLLECTION, FirestoreStoryRepository
from scrapers import GHANA_SOURCES, scrape_source


REQUIRED_STORY_FIELDS = [
    "title",
    "summary",
    "source",
    "category",
    "url",
]


def check_scraper_status(limit_per_source: int = 3) -> dict[str, Any]:
    source_results = []

    for source_id in GHANA_SOURCES:
        result = scrape_source(source_id, limit=limit_per_source)

        if "error" in result:
            source_results.append(
                {
                    "source": source_id,
                    "status": "error",
                    "message": result["error"],
                    "storyCount": 0,
                }
            )
            continue

        story_count = len(result.get("stories", []))
        source_results.append(
            {
                "source": source_id,
                "status": "ok" if story_count else "empty",
                "message": "Stories found" if story_count else "No stories found",
                "storyCount": story_count,
            }
        )

    return {
        "status": "ok"
        if all(result["status"] == "ok" for result in source_results)
        else "needs_attention",
        "sources": source_results,
    }


def validate_article_data(
    limit: int = 50,
    collection_name: str = DEFAULT_STORIES_COLLECTION,
) -> dict[str, Any]:
    repository = FirestoreStoryRepository(collection_name=collection_name)
    stories = repository.list_latest(limit=limit)
    invalid_stories = []

    for story in stories:
        missing_fields = [
            field
            for field in REQUIRED_STORY_FIELDS
            if not story.get(field)
        ]

        if missing_fields:
            invalid_stories.append(
                {
                    "articleId": story.get("id"),
                    "title": story.get("title", ""),
                    "missingFields": missing_fields,
                }
            )

    return {
        "collection": collection_name,
        "checkedCount": len(stories),
        "invalidCount": len(invalid_stories),
        "validCount": len(stories) - len(invalid_stories),
        "invalidStories": invalid_stories,
    }
