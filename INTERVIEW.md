# Gringa Jobs - Project Overview

A job search aggregator built specifically for Brazilian developers looking for remote positions at international companies.

## The Problem

Brazilian developers searching for remote international jobs face a fragmented landscape:
- Job boards mix local and international positions
- "Remote" often means US-only or requires work authorization
- Company career pages (Greenhouse, Lever, Ashby) are scattered and hard to track

## The Solution

Gringa Jobs uses **SearchApi** to aggregate and classify remote jobs, filtering for positions that explicitly accept candidates from Brazil/LATAM.

## SearchApi Integration

### Engines Used

| Engine | Purpose | Why |
|--------|---------|-----|
| `google_jobs` | Primary job search | Structured data with salary, location, and apply links |
| `google` | ATS Deep Scan | Finds jobs directly on Greenhouse, Lever, Ashby, Workable career pages |

### Smart Query Construction

```
# Google Jobs query
remote {role} latam OR brazil OR worldwide

# ATS Deep Scan query
(site:jobs.ashbyhq.com OR site:boards.greenhouse.io OR site:jobs.lever.co)
remote engineer ("Brazil" OR "LATAM")
```

The ATS scan is particularly valuable because it surfaces jobs that may not appear on traditional job boards yet.

## Cost Optimization

Built with API cost awareness from day one:

| Feature | Implementation | Impact |
|---------|----------------|--------|
| **15-min cache** | In-memory cache with TTL | ~40-60% fewer API calls |
| **Account dashboard** | Real-time usage via `/api/v1/me` | Users see remaining credits |
| **Retry with backoff** | Exponential backoff on 429/5xx | Handles rate limits gracefully |

The dashboard shows real SearchApi account data, demonstrating integration beyond just search.

## Eligibility Classifier

A regex-based scoring system that classifies jobs into:

- **Yes** (score >= 3): Explicitly mentions Brazil, LATAM, Deel, worldwide
- **Maybe** (score 1-2): Remote but region unclear
- **No** (score <= -2): US-only, requires work authorization, W2 employment

This saves users time by surfacing the most relevant opportunities first.

## Tech Stack

- **Next.js 15** with App Router and TypeScript
- **Tailwind CSS** for styling
- **Zod** for API input validation
- **Jest** for unit testing (30 tests for the classifier)

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend                          │
│  (React components, filters, analytics dashboard)    │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│                 Next.js API Routes                   │
│  /api/jobs    /api/ats-scan    /api/account         │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│              SearchApi Client                        │
│  - Caching layer (15 min TTL)                       │
│  - Retry logic (exponential backoff)                │
│  - Analytics tracking                                │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│                  SearchApi.io                        │
│  google_jobs engine  |  google engine               │
└─────────────────────────────────────────────────────┘
```

## Key Files

| File | Description |
|------|-------------|
| `src/lib/searchapi.ts` | SearchApi client with caching, retry, analytics |
| `src/lib/classifier.ts` | Job eligibility scoring algorithm |
| `src/lib/validation.ts` | Zod schemas for API input validation |
| `src/components/AnalyticsDashboard.tsx` | Real-time account usage display |

## Running the Project

```bash
# Install dependencies
npm install

# Add your SearchApi key
echo "SEARCHAPI_KEY=your_key_here" > .env.local

# Start development server
npm run dev

# Run tests
npm test
```

## What I'd Build Next

With more time, I would add:

1. **Search Analytics API integration** - Show historical usage trends
2. **Webhook notifications** - Alert users when new matching jobs appear
3. **Job deduplication** - Cross-reference google_jobs and ATS results
4. **Saved searches** - Let users save and rerun queries

---

*Built as a prototype to demonstrate SearchApi integration patterns for job search applications.*
