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


def get_categories(
    sample_size: int = 100,
    collection_name: str = DEFAULT_STORIES_COLLECTION,
    repository: FirestoreStoryRepository | None = None,
) -> list[dict[str, Any]]:
    repository = repository or FirestoreStoryRepository(collection_name=collection_name)
    stories = repository.list_latest(limit=sample_size)
    category_counts: dict[str, int] = {}

    for story in stories:
        category = story.get("category") or "News"
        category_counts[category] = category_counts.get(category, 0) + 1

    return [
        {"category": category, "count": count}
        for category, count in sorted(category_counts.items())
    ]


def get_articles_by_category(
    category: str,
    limit: int = 20,
    collection_name: str = DEFAULT_STORIES_COLLECTION,
    repository: FirestoreStoryRepository | None = None,
) -> list[dict[str, Any]]:
    repository = repository or FirestoreStoryRepository(collection_name=collection_name)
    category_lower = category.lower().strip()

    if not category_lower:
        return []

    stories = repository.list_latest(limit=100)
    matches = [
        story
        for story in stories
        if story.get("category", "News").lower() == category_lower
    ]
    return matches[:limit]


def get_related_articles(
    article_id: str,
    limit: int = 5,
    collection_name: str = DEFAULT_STORIES_COLLECTION,
    repository: FirestoreStoryRepository | None = None,
) -> list[dict[str, Any]]:
    repository = repository or FirestoreStoryRepository(collection_name=collection_name)
    article = repository.get_by_id(article_id)

    if article is None:
        return []

    title_terms = {
        term.lower()
        for term in article.get("title", "").split()
        if len(term) > 3
    }
    candidates = repository.list_latest(limit=100)
    scored_candidates = []

    for candidate in candidates:
        if candidate.get("id") == article_id:
            continue

        score = 0

        if candidate.get("category") == article.get("category"):
            score += 3

        if candidate.get("source") == article.get("source"):
            score += 1

        candidate_terms = {
            term.lower()
            for term in candidate.get("title", "").split()
            if len(term) > 3
        }
        score += len(title_terms.intersection(candidate_terms))

        if score > 0:
            scored_candidates.append((score, candidate))

    scored_candidates.sort(key=lambda item: item[0], reverse=True)
    return [candidate for _, candidate in scored_candidates[:limit]]
