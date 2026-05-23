# Dawuro Ghana News

Dawuro is a Ghana-focused, user-driven news app that helps people quickly find and read news from trusted Ghanaian sources.

The idea comes from the traditional dawuro, also known as the gong-gong, which was used in communities to announce important messages. In the same way, the app acts as a modern digital dawuro: it brings important Ghanaian news and updates directly to users.

## App Summary

Dawuro lets users browse, search, and filter Ghanaian news based on what they care about. The app loads default latest news, but users can also search for specific topics like:

- Education
- Politics
- Business
- Black Stars
- Cedi
- Health
- Entertainment

It pulls stories from Ghanaian news websites using a FastAPI backend and BeautifulSoup scraper.

## Current Features

The MVP currently has:

- React Native frontend
- FastAPI backend
- BeautifulSoup scraper
- Ghanaian news sources
- Search functionality
- Source filtering
- Story details screen
- Logo and branding

## Demo Routine

Before demos, manually refresh Firestore with the latest scraped stories:

```bash
curl -X POST "http://localhost:8000/news/sync?limit=10"
```

This keeps `createdAt` as the first time Dawuro saved a story, refreshes `updatedAt` when Dawuro sees it again, and preserves `publishedAt` when an article date is available.

Later, replace this manual habit with an automatic scheduled sync job.

## App Architecture

```text
React Native frontend
        ↓
FastAPI backend
        ↓
BeautifulSoup scraper
        ↓
Ghanaian news websites
```

## Main User Flow

```text
User opens Dawuro
        ↓
Latest Ghana news loads
        ↓
User selects a source or searches a topic
        ↓
App fetches matching stories
        ↓
User taps a story
        ↓
Story details page opens
        ↓
User can open the full article
```

## Simple Investor-Style Pitch

Dawuro is a personalized Ghanaian news discovery app that helps users find the stories that matter to them. Inspired by the traditional gong-gong used for public announcements, Dawuro brings trusted Ghanaian news into one simple, searchable mobile experience.
