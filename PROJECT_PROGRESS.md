# Dawuro MCP Project Progress

This file tracks progress against `dawuro_mcp_conversation_and_rework_plan.pdf`.

Last updated: May 26, 2026

## Current Summary

```text
Backend MCP migration:      75-80% complete
Frontend AI experience:     30-40% complete
Production readiness:       10-15% complete
Overall PDF/product plan:   55-60% complete
```

Dawuro now has a FastMCP backend with tools, resources, prompts, staging collections, review/promotion flow, Firebase sync support, and first frontend AI surfaces. The major remaining work is deploying a real MCP bridge, completing user-facing AI workflows, and hardening for production.

## Architecture Now

```text
News websites
    -> shared scraper logic
    -> Firebase scheduled sync writes to stories
    -> mobile app reads stories

MCP sync/manual review
    -> writes to mcpStories
    -> review_mcp_stories
    -> promote approved records into stories

FastMCP server
    -> tools/resources/prompts
    -> frontend uses MCP bridge when configured
```

## Firestore Collections

```text
stories        Production app feed.
mcpStories     MCP/manual sync staging and review collection.
savedStories   User-saved stories.
syncLogs       Sync run records.
trackedTopics  Topic tracking data.
```

## PDF Execution Plan Status

| PDF Step | Status | Notes |
| --- | --- | --- |
| Step 1: Freeze and document current code | Mostly done | Repo was inspected, README updated, and this tracker now records current progress. |
| Step 2: Remove API responsibility from backend logic | Mostly done | Logic moved into service/repository modules. Scraper duplication was reduced by making `functions/news_sync.py` canonical. |
| Step 3: Create FastMCP server | Done | `backend-mobile/mcp_server.py` exists and imports successfully. |
| Step 4: Replace API endpoints with MCP tools | Done for core behavior | Latest news, search, details, categories, related articles, source listing, sync, promotion, and admin tools are exposed. |
| Step 5: Add MCP resources | Mostly done | Latest articles, MCP latest articles, article details, sources, categories, tracked topics, and trending topics are registered. |
| Step 6: Add MCP prompts | Started | Briefing, summary, compare coverage, background, and tracked topic prompts exist. More prompt polish can come later. |
| Step 7: Redesign frontend communication | Started | Added configurable `EXPO_PUBLIC_MCP_BRIDGE_URL` client layer. A real deployed bridge is still needed. |
| Step 8: Add AI-first frontend features | Started | Story AI actions and Briefing Desk tab exist behind MCP bridge config. |
| Step 9: Remove FastAPI completely | Mostly done | Active FastAPI app was removed and direct FastAPI dependency replaced with `mcp`. |
| Step 10: Production hardening | Not started | Auth, rate limits, permissions, monitoring, deployment strategy, and security rules review still needed. |

## Completed Backend Work

- Replaced local FastAPI app with FastMCP foundation.
- Added shared Firestore repository.
- Added service modules:
  - `news_service.py`
  - `scraper_service.py`
  - `promotion_service.py`
  - `summary_service.py`
  - `briefing_service.py`
  - `topic_service.py`
  - `recommendation_service.py`
  - `admin_service.py`
- Added MCP staging collection behavior:
  - MCP sync defaults to `mcpStories`.
  - Production app still reads `stories`.
- Added promotion workflow from `mcpStories` to `stories`.
- Consolidated scraper implementation.
- Added `scrapedAt` to saved story records.
- Added safe Firebase `manual_sync` that writes to `mcpStories`.
- Kept Firebase scheduled sync writing to production `stories`.

## Current MCP Tools

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

## Current MCP Resources

```text
dawuro://articles/latest
dawuro://mcp/articles/latest
dawuro://articles/{article_id}
dawuro://sources
dawuro://categories
dawuro://topics/tracked
dawuro://topics/trending
```

## Current MCP Prompts

```text
morning_briefing_prompt
summarize_article_prompt
compare_coverage_prompt
explain_background_prompt
tracked_topic_briefing_prompt
```

## Completed Frontend Work

- Kept normal feed reading from Firestore `stories`.
- Added frontend MCP bridge module:
  - `frontend-mobile/src/lib/mcp.ts`
- Added `EXPO_PUBLIC_MCP_BRIDGE_URL` to `.env.example`.
- Added story detail AI actions behind the MCP bridge:
  - Summary
  - Points
  - Explain
  - Related
- Turned the old refresh tab into a Briefing Desk:
  - Morning Briefing
  - Trending Topics
- Refreshed frontend visual design with a cleaner, denser newsroom style.

## Pending Frontend Work

- Deploy or implement the actual MCP HTTP bridge expected by `EXPO_PUBLIC_MCP_BRIDGE_URL`.
- Add Ask Dawuro chat/assistant interface.
- Add frontend topic tracking UI.
- Add compare coverage UI.
- Add personalized briefing UI.
- Decide final behavior for refresh/manual sync in the app.
- Add loading, empty, and error states for all AI panels after real bridge testing.

## Pending Backend/Cloud Work

- Deploy and test Firebase `manual_sync`.
- Decide auth strategy for `manual_sync`.
- Add authentication for remote MCP bridge.
- Add rate limiting and tool permissions.
- Add structured logging and monitoring.
- Add timeout handling around scraper calls.
- Review Firestore security rules.
- Decide whether `mcpStories` promotion should be manual-only or admin-gated.

## Important Safety Decisions

- `stories` is the production mobile feed.
- `mcpStories` is the MCP/manual review collection.
- MCP sync and Firebase `manual_sync` write to `mcpStories` by default.
- Firebase scheduled sync still writes to `stories`.
- Promotion into `stories` is explicit through MCP promotion tools.

## Recent Local Commits

```text
f3c7a9d Add frontend AI briefing desk
61176c7 Add story AI action controls
d131d50 Refresh mobile app visual design
b71e3f9 Add frontend MCP bridge summary action
b7ea518 Add MCP admin maintenance tools
0383a7d Add safe manual Firebase sync
2e55d2d Consolidate scraper implementation
3e5eaee Add MCP category and related article tools
2d7dd4e Add MCP trending topic recommendations
8915ca0 Add MCP topic tracking tools
e7e4b61 Add MCP summary briefing and coverage tools
699f010 Add MCP story promotion workflow
```

## Next Recommended Step

Implement or deploy the MCP HTTP bridge that the frontend expects at:

```text
EXPO_PUBLIC_MCP_BRIDGE_URL
```

Without that bridge, the mobile app can still read Firestore and display the normal feed, but MCP-powered frontend actions remain hidden or unavailable.
