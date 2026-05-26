import re
from typing import Any


def _story_text(article: dict[str, Any]) -> str:
    return " ".join(
        value.strip()
        for value in [
            article.get("title", ""),
            article.get("summary", ""),
        ]
        if isinstance(value, str) and value.strip()
    )


def _sentences(text: str) -> list[str]:
    sentences = re.split(r"(?<=[.!?])\s+", text.strip())
    return [sentence.strip() for sentence in sentences if sentence.strip()]


def extract_key_points(article: dict[str, Any], limit: int = 4) -> list[str]:
    text = _story_text(article)
    sentences = _sentences(text)

    if not sentences and article.get("title"):
        return [article["title"]]

    points = sentences[:limit]

    if len(points) < limit and article.get("source"):
        points.append(f"Source: {article['source']}")

    if len(points) < limit and article.get("category"):
        points.append(f"Category: {article['category']}")

    return points[:limit]


def summarize_article(article: dict[str, Any], style: str = "short") -> dict[str, Any]:
    key_points = extract_key_points(article)
    title = article.get("title", "Untitled story")
    source = article.get("source", "Unknown source")
    url = article.get("url", "")

    if style == "whatsapp":
        summary = f"{title}\n\n" + "\n".join(f"- {point}" for point in key_points)
        if url:
            summary = f"{summary}\n\nRead more: {url}"
    elif style == "detailed":
        summary = " ".join(key_points)
    else:
        summary = key_points[0] if key_points else title

    return {
        "title": title,
        "source": source,
        "style": style,
        "summary": summary,
        "keyPoints": key_points,
        "url": url,
    }


def explain_article(article: dict[str, Any]) -> dict[str, Any]:
    title = article.get("title", "Untitled story")
    source = article.get("source", "Unknown source")
    category = article.get("category", "News")

    return {
        "title": title,
        "source": source,
        "category": category,
        "whatHappened": summarize_article(article, style="short")["summary"],
        "whyItMatters": (
            f"This is a {category.lower()} story from {source}. "
            "Review related coverage and source context before drawing conclusions."
        ),
        "questionsToAsk": [
            "Who is directly affected?",
            "Has another trusted source reported the same development?",
            "Is this a breaking update or part of a longer-running issue?",
        ],
    }
