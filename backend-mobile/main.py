from firebase_admin_client import save_story
from fastapi import FastAPI
from scrapers import scrape_source, scrape_all_sources, search_sources, GHANA_SOURCES

app = FastAPI(title="Dawuro Ghana News API")

@app.get("/")
def root():
    return {"message": "Dawuro backend is running"}

@app.get("/")
def home():
    return {
        "app": "Dawuro",
        "message": "Ghana news API is running",
        "available_sources": list(GHANA_SOURCES.keys()),
        "endpoints": [
            "/news/latest",
            "/news/search?query=education",
            "/news/source/citi"
        ]
    }


@app.get("/news/latest")
def latest_news(limit: int = 10):
    return scrape_all_sources(limit)


@app.get("/news/search")
def search_news(query: str, limit: int = 10):
    return search_sources(query, limit)


@app.get("/news/source/{source}")
def source_news(source: str, limit: int = 10):
    return scrape_source(source, limit)

@app.post("/news/sync")
def sync_news_to_firestore(limit: int = 10):
    results = scrape_all_sources(limit)
    saved_story_ids = []

    for source_result in results.values():
        if "error" in source_result:
            continue

        for story in source_result.get("stories", []):
            story_id = save_story({
                "title": story.get("title", ""),
                "summary": story.get("summary", story.get("title", "")),
                "source": story.get("source", "Unknown"),
                "category": story.get("category", "News"),
                "url": story.get("url", ""),
                "publishedAt": story.get("publishedAt"),
            })

            saved_story_ids.append(story_id)

    return {
        "message": "Stories saved to Firestore",
        "count": len(saved_story_ids),
        "storyIds": saved_story_ids,
    }
