import hashlib
from html import unescape
from urllib.parse import urljoin
import xml.etree.ElementTree as ET

import requests
from bs4 import BeautifulSoup
from firebase_admin import firestore


GHANA_SOURCES = {
    "citi": "https://citinewsroom.com/",
    "myjoy": "https://www.myjoyonline.com/",
    "graphic": "https://www.graphic.com.gh/",
}

SOURCE_PAGES = {
    "citi": [
        "https://citinewsroom.com/",
        "https://citinewsroom.com/news/",
        "https://citinewsroom.com/top-stories/",
    ],
    "myjoy": ["https://www.myjoyonline.com/"],
    "graphic": ["https://www.graphic.com.gh/"],
}

WORDPRESS_API_SOURCES = {
    "citi": "https://citinewsroom.com/wp-json/wp/v2/posts",
    "myjoy": "https://www.myjoyonline.com/wp-json/wp/v2/posts",
}

RSS_FEED_SOURCES = {
    "graphic": [
        "https://www.graphic.com.gh/news.html?format=feed&type=rss",
        "https://www.graphic.com.gh/general-news.html?format=feed&type=rss",
        "https://www.graphic.com.gh/news/general-news.html?format=feed&type=rss",
    ],
}

BAD_EXTENSIONS = (
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".svg",
    ".mp4",
    ".mp3",
    ".wav",
    ".pdf",
    ".zip",
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


def clean_text(value: str) -> str:
    text = value or ""

    if "<" not in text and "&" not in text:
        return text.strip()

    return BeautifulSoup(unescape(text), "html.parser").get_text(" ", strip=True)


def make_story_id(story: dict) -> str:
    unique_text = story.get("url") or story.get("title", "")
    return hashlib.sha256(unique_text.encode("utf-8")).hexdigest()


def scrape_wordpress_posts(source: str, limit: int = 10) -> list[dict]:
    api_url = WORDPRESS_API_SOURCES.get(source)

    if not api_url:
        return []

    headers = {"User-Agent": "Mozilla/5.0"}

    try:
        response = requests.get(
            api_url,
            headers=headers,
            params={
                "per_page": limit,
                "_fields": "date,link,title,excerpt",
            },
            timeout=15,
        )
        response.raise_for_status()
        posts = response.json()
    except Exception as error:
        print(f"Failed to scrape {source} WordPress API: {error}")
        return []

    stories = []

    for post in posts:
        title = clean_text(post.get("title", {}).get("rendered", ""))

        if not title:
            continue

        summary = clean_text(post.get("excerpt", {}).get("rendered", "")) or title

        stories.append(
            {
                "title": title,
                "summary": summary,
                "url": post.get("link", ""),
                "source": source,
                "category": "News",
                "publishedAt": post.get("date"),
            }
        )

    return stories


def scrape_rss_posts(source: str, limit: int = 10) -> list[dict]:
    feed_urls = RSS_FEED_SOURCES.get(source, [])
    headers = {"User-Agent": "Mozilla/5.0"}
    stories = []
    seen_urls = set()

    for feed_url in feed_urls:
        if len(stories) >= limit:
            break

        try:
            response = requests.get(feed_url, headers=headers, timeout=15)
            response.raise_for_status()
            root = ET.fromstring(response.content)
        except Exception as error:
            print(f"Failed to scrape {source} RSS feed {feed_url}: {error}")
            continue

        for item in root.findall("./channel/item"):
            title = clean_text(item.findtext("title", ""))
            url = item.findtext("link", "").strip()

            if not title or not url or url in seen_urls:
                continue

            seen_urls.add(url)
            stories.append(
                {
                    "title": title,
                    "summary": clean_text(item.findtext("description", "")) or title,
                    "url": url,
                    "source": source,
                    "category": "News",
                    "publishedAt": item.findtext("pubDate"),
                }
            )

            if len(stories) >= limit:
                break

    return stories


def scrape_source(source: str, limit: int = 10) -> dict:
    if source not in GHANA_SOURCES:
        return {
            "error": f"Unknown source '{source}'. Available sources: {', '.join(GHANA_SOURCES)}"
        }

    base_url = GHANA_SOURCES[source]
    source_urls = SOURCE_PAGES.get(source, [base_url])
    headers = {"User-Agent": "Mozilla/5.0"}

    try:
        stories = scrape_wordpress_posts(source, limit)

        if not stories:
            stories = scrape_rss_posts(source, limit)

        seen_urls = set()

        for story in stories:
            seen_urls.add(story.get("url", ""))

        for source_url in source_urls:
            if len(stories) >= limit:
                break

            response = requests.get(source_url, headers=headers, timeout=15)
            response.raise_for_status()

            soup = BeautifulSoup(response.content, "html.parser")

            for link in soup.find_all("a", href=True):
                title = link.get_text(" ", strip=True)
                href = link.get("href", "")

                if not title or len(title) < 25:
                    continue

                if href.lower().endswith(BAD_EXTENSIONS):
                    continue

                full_url = urljoin(source_url, href)

                if any(keyword in full_url.lower() for keyword in BAD_KEYWORDS):
                    continue

                if full_url in seen_urls:
                    continue

                seen_urls.add(full_url)
                stories.append(
                    {
                        "title": title,
                        "summary": title,
                        "url": full_url,
                        "source": source,
                        "category": "News",
                    }
                )

                if len(stories) >= limit:
                    break

        return {
            "source": source,
            "url": base_url,
            "total_stories": len(stories),
            "stories": stories,
        }
    except Exception as error:
        return {"error": f"Failed to scrape {source}: {error}"}


def scrape_all_sources(limit: int = 10) -> dict:
    return {source: scrape_source(source, limit) for source in GHANA_SOURCES}


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


def scrape_news(limit_per_source: int = 10) -> list[dict]:
    stories = []

    for source in GHANA_SOURCES:
        result = scrape_source(source, limit_per_source)

        if "error" in result:
            print(result["error"])
            continue

        stories.extend(result.get("stories", [])[:limit_per_source])

    return stories


def save_story(db, story: dict, collection_name: str = "stories") -> str:
    story_id = make_story_id(story)
    story_ref = db.collection(collection_name).document(story_id)
    snapshot = story_ref.get()

    story_data = {
        "title": story.get("title", ""),
        "summary": story.get("summary", ""),
        "source": story.get("source", ""),
        "category": story.get("category", "News"),
        "url": story.get("url", ""),
        "updatedAt": firestore.SERVER_TIMESTAMP,
        "scrapedAt": firestore.SERVER_TIMESTAMP,
    }

    if not snapshot.exists:
        story_data["createdAt"] = firestore.SERVER_TIMESTAMP

    if story.get("publishedAt"):
        story_data["publishedAt"] = story["publishedAt"]

    story_ref.set(story_data, merge=True)
    return story_id
