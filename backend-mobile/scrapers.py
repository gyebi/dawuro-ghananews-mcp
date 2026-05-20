import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin


GHANA_SOURCES = {
    "citi": "https://citinewsroom.com/",
    "myjoy": "https://www.myjoyonline.com/",
    "graphic": "https://www.graphic.com.gh/",
}


BAD_EXTENSIONS = (
    ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg",
    ".mp4", ".mp3", ".wav", ".pdf", ".zip"
)

BAD_KEYWORDS = [
    "facebook.com",
    "twitter.com",
    "x.com",
    "instagram.com",
    "youtube.com",
    "whatsapp",
    "mailto:",
    "tel:",
    "/wp-content/",
    "/tag/",
    "/category/",
    "/author/",
]


def scrape_source(source: str, limit: int = 10) -> dict:
    if source not in GHANA_SOURCES:
        return {
            "error": f"Unknown source '{source}'. Available sources: {', '.join(GHANA_SOURCES)}"
        }

    base_url = GHANA_SOURCES[source]

    headers = {
        "User-Agent": "Mozilla/5.0"
    }

    try:
        response = requests.get(base_url, headers=headers, timeout=15)
        response.raise_for_status()

        soup = BeautifulSoup(response.content, "html.parser")
        stories = []
        seen_urls = set()

        for link in soup.find_all("a", href=True):
            title = link.get_text(" ", strip=True)
            href = link.get("href", "")

            if not title or len(title) < 25:
                continue

            if href.lower().endswith(BAD_EXTENSIONS):
                continue

            full_url = urljoin(base_url, href)

            if any(keyword in full_url.lower() for keyword in BAD_KEYWORDS):
                continue

            if full_url in seen_urls:
                continue

            seen_urls.add(full_url)

            stories.append({
                "title": title,
                "url": full_url,
                "source": source,
            })

            if len(stories) >= limit:
                break

        return {
            "source": source,
            "url": base_url,
            "total_stories": len(stories),
            "stories": stories,
        }

    except Exception as e:
        return {
            "error": f"Failed to scrape {source}: {str(e)}"
        }


def scrape_all_sources(limit: int = 10) -> dict:
    results = {}

    for source in GHANA_SOURCES:
        results[source] = scrape_source(source, limit)

    return results


def search_sources(query: str, limit: int = 10) -> dict:
    query_lower = query.lower()
    matches = []

    for source in GHANA_SOURCES:
        result = scrape_source(source, limit=20)

        if "error" in result:
            continue

        for story in result.get("stories", []):
            if query_lower in story.get("title", "").lower():
                matches.append(story)

            if len(matches) >= limit:
                break

        if len(matches) >= limit:
            break

    return {
        "query": query,
        "total_results": len(matches),
        "stories": matches,
    }