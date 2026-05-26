from repositories.firestore_repository import FirestoreStoryRepository, make_story_id as _make_story_id


def make_story_id(url: str, title: str):
    return _make_story_id({"url": url, "title": title})


def save_story(story: dict):
    return FirestoreStoryRepository().save_story(story)
