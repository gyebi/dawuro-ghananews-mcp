from typing import Any

from firebase_admin import firestore

from repositories.firestore_repository import (
    DEFAULT_STORIES_COLLECTION,
    MCP_STORIES_COLLECTION,
    FirestoreStoryRepository,
)


def promote_mcp_story(
    story_id: str,
    source_collection: str = MCP_STORIES_COLLECTION,
    target_collection: str = DEFAULT_STORIES_COLLECTION,
) -> dict[str, Any]:
    source_repository = FirestoreStoryRepository(collection_name=source_collection)
    target_repository = FirestoreStoryRepository(collection_name=target_collection)
    promoted_story_id = source_repository.copy_story_to(
        story_id,
        target_repository,
        extra_fields={
            "promotedFrom": source_collection,
            "promotedAt": firestore.SERVER_TIMESTAMP,
        },
    )

    if promoted_story_id is None:
        return {
            "status": "not_found",
            "message": f"Story '{story_id}' was not found in {source_collection}.",
            "sourceCollection": source_collection,
            "targetCollection": target_collection,
        }

    source_repository.update_story(
        story_id,
        {
            "promotionStatus": "promoted",
            "promotedTo": target_collection,
            "promotedStoryId": promoted_story_id,
            "promotedAt": firestore.SERVER_TIMESTAMP,
        },
    )

    return {
        "status": "promoted",
        "sourceStoryId": story_id,
        "promotedStoryId": promoted_story_id,
        "sourceCollection": source_collection,
        "targetCollection": target_collection,
    }


def promote_mcp_stories(
    story_ids: list[str],
    source_collection: str = MCP_STORIES_COLLECTION,
    target_collection: str = DEFAULT_STORIES_COLLECTION,
) -> dict[str, Any]:
    results = [
        promote_mcp_story(
            story_id=story_id,
            source_collection=source_collection,
            target_collection=target_collection,
        )
        for story_id in story_ids
    ]
    promoted = [result for result in results if result["status"] == "promoted"]

    return {
        "status": "completed",
        "requestedCount": len(story_ids),
        "promotedCount": len(promoted),
        "sourceCollection": source_collection,
        "targetCollection": target_collection,
        "results": results,
    }
