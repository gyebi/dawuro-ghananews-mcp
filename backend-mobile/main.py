from fastapi import FastAPI
from scrapers import scrape_source, scrape_all_sources, search_sources, GHANA_SOURCES

app = FastAPI(title="Dawuro Ghana News API")


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