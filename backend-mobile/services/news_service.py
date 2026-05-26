from typing import Any

from repositories.firestore_repository import DEFAULT_STORIES_COLLECTION, FirestoreStoryRepository


def get_latest_articles(
    limit: int = 20,
    source: str | None = None,
    collection_name: str = DEFAULT_STORIES_COLLECTION,
    repository: FirestoreStoryRepository | None = None,
) -> list[dict[str, Any]]:
    repository = repository or FirestoreStoryRepository(collection_name=collection_name)
    return repository.list_latest(limit=limit, source=source)


def get_article_by_id(
    article_id: str,
    collection_name: str = DEFAULT_STORIES_COLLECTION,
    repository: FirestoreStoryRepository | None = None,
) -> dict[str, Any] | None:
    repository = repository or FirestoreStoryRepository(collection_name=collection_name)
    return repository.get_by_id(article_id)


def search_articles(
    query: str,
    limit: int = 10,
    collection_name: str = DEFAULT_STORIES_COLLECTION,
    repository: FirestoreStoryRepository | None = None,
) -> list[dict[str, Any]]:
    repository = repository or FirestoreStoryRepository(collection_name=collection_name)
    return repository.search(query=query, limit=limit)
