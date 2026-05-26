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

It pulls stories from Ghanaian news websites using Firebase scheduled sync, source-specific APIs/RSS feeds, and BeautifulSoup fallback scraping. AI-facing backend capabilities are exposed through a FastMCP server.

## Current Features

The MVP currently has:

- React Native frontend
- FastMCP backend interface
- Firebase scheduled sync function
- Source-specific news retrieval with BeautifulSoup fallback scraping
- Ghanaian news sources: Citi Newsroom, MyJoyOnline, and Graphic Online
- Search functionality
- Source/news agency filtering
- Story details screen
- Logo and branding

## Backend Records

Stories are saved in the Firestore `stories` collection. Dawuro uses the story URL, or the title when no URL exists, to create a stable SHA-256 document ID so repeat syncs update the same record instead of creating duplicates.

MCP scraper runs save to the separate `mcpStories` collection by default. This keeps MCP extraction/testing separate from the production app feed until those records are reviewed or intentionally promoted into `stories`.

Tracked topics are saved in the separate `trackedTopics` collection. Topic tracking currently accepts a `user_id` value and defaults to `default` until Firebase Auth or another identity layer is connected.

Saved story fields:

- `title`
- `summary`
- `source`
- `category`
- `url`
- `createdAt`
- `updatedAt`
- `publishedAt`

The `createdAt` field is only set when a story is first saved. The `updatedAt` field refreshes every time Dawuro sees the story again. The `publishedAt` field is preserved when the source provides a publication date.

Sync runs are recorded in the Firestore `syncLogs` collection with:

- `message`
- `count`
- `ranAt`

## Demo Routine

Start the local MCP server from `backend-mobile`:

```bash
uv run python mcp_server.py
```

Before demos, manually refresh Firestore with the latest scraped stories by calling the `run_news_sync` MCP tool from an MCP client or inspector.

You can sync one source/news agency at a time by passing a `source` value such as `citi`, `myjoy`, or `graphic`.
The MCP sync tool writes to `mcpStories` by default. Pass `collection_name: "stories"` only when you intentionally want MCP sync output to update the production app feed.

Recommended MCP review flow:

```text
run_news_sync
        ↓
review_mcp_stories
        ↓
promote_mcp_story_to_production
        ↓
mobile app sees promoted story in stories
```

Use `promote_mcp_stories_to_production` only after reviewing a batch of MCP-scraped stories.

The deployed Firebase scheduled function syncs production `stories` automatically every 3 hours.

To refresh the safer MCP review collection from the deployed Firebase backend, call the `manual_sync` function after deployment. This writes to `mcpStories`, not production `stories`.

```text
https://<region>-<project-id>.cloudfunctions.net/manual_sync?limit=10
```

You can refresh one source with:

```text
https://<region>-<project-id>.cloudfunctions.net/manual_sync?limit=10&source=citi
```

If `MANUAL_SYNC_TOKEN` is set in the function environment, pass it as a bearer token or `token` query parameter.

After reviewing cloud-synced `mcpStories`, promote approved stories into production with the MCP promotion tools.

## Workflow Gap Analysis - May 25, 2026

This section captures the current gaps found while comparing the repo against `dawuro_frontend_backend_workflow_may252026.pdf`.

### What Matches the Workflow

- The local MCP backend exists in `backend-mobile/mcp_server.py`.
- The local scraper exists in `backend-mobile/scrapers.py`.
- The shared Firestore save path exists in `backend-mobile/repositories/firestore_repository.py`.
- The Firebase scheduled backend exists in `backend-mobile/functions/main.py`.
- The cloud scraper/save implementation exists in `backend-mobile/functions/news_sync.py`.
- The frontend reads from the Firestore `stories` collection in `frontend-mobile/src/lib/stories.ts`.
- The frontend saves stories to the `savedStories` collection.
- The cloud scheduler writes sync records to the `syncLogs` collection.

### Gaps to Work On Later

- Update workflow documentation paths. The PDF references `frontend-mobile/app/index.tsx` and `frontend-mobile/lib/stories.ts`, but the current repo uses `frontend-mobile/src/app/(tabs)/index.tsx` and `frontend-mobile/src/lib/stories.ts`.
- Decide what to do with the frontend refresh tab. `frontend-mobile/src/app/(tabs)/refresh.tsx` exists but currently returns `null`.
- Consider date coverage for fallback-scraped stories. Stories from WordPress APIs and RSS feeds can include `publishedAt`, but stories found through HTML fallback scraping usually do not.

Recommended next improvement: decide whether the frontend refresh tab should call a safe refresh workflow, show sync status, or stay hidden.

## MCP Tools

```text
get_latest_news
search_news
get_article_details
get_news_by_category
get_related_news_articles
list_news_categories
list_news_sources
run_news_sync
review_mcp_stories
promote_mcp_story_to_production
promote_mcp_stories_to_production
summarize_news_article
extract_article_key_points
explain_news_story
create_morning_briefing
compare_news_coverage
track_news_topic
get_tracked_news_topics
remove_tracked_news_topic
find_news_timeline_for_topic
get_personalized_news_briefing
get_news_trending_topics
recommend_news_articles
check_news_scraper_status
validate_news_article_data
```

## Frontend MCP Bridge

The mobile app keeps reading the production feed directly from Firestore. AI actions use a separate MCP bridge URL when configured:

```text
EXPO_PUBLIC_MCP_BRIDGE_URL=https://your-mcp-bridge.example.com
```

The first wired frontend action is article summarization on the story detail screen. If `EXPO_PUBLIC_MCP_BRIDGE_URL` is not set, the app hides the MCP-powered action and continues working as a normal Firestore news app.

## MCP Prompts

```text
morning_briefing_prompt
summarize_article_prompt
compare_coverage_prompt
explain_background_prompt
tracked_topic_briefing_prompt
```

## Current MCP Progress

```text
Phase 1: Basic news tools              done
Phase 2: MCP scrape review/promotion   done
Phase 3: Summary/briefing tools        started
Phase 4: Topic tracking tools          started
Phase 5: Recommendations/trending      started
Phase 6: Admin/maintenance tools       started
Phase 7: Frontend MCP bridge           started
Phase 8: Frontend AI accessories       started
```

Available source values:

```text
citi
myjoy
graphic
```

## App Architecture

```text
React Native frontend
        ↓
Firestore stories collection
        ↑
FastMCP backend + Firebase scheduled function
        ↓
Source APIs/RSS feeds + BeautifulSoup fallback scraper
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
