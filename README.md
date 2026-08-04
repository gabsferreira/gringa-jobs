# Gringa Jobs

Remote tech jobs that people based in Brazil can apply to.

## Overview

A job board web app that aggregates remote tech jobs and classifies them based on eligibility for Brazilian candidates. Built with Next.js 14, TypeScript, and Tailwind CSS.

Uses [SearchApi.io](https://www.searchapi.io) to fetch jobs from Google Jobs and scan ATS (Applicant Tracking System) sites directly.

### Features

- **Smart Search**: Filter by role (Frontend, Backend, DevOps, etc.) and region (Brazil, LATAM, Worldwide, Americas)
- **Eligibility Classification**: Automatic detection of jobs that accept Brazilian applicants based on text signals
- **ATS Deep Scan**: Direct search on Ashby, Greenhouse, Lever, and Workable career pages
- **Client-side Filtering**: Filter loaded results by eligibility verdict and free-text search
- **Caching**: 15-minute in-memory cache to minimize API requests

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **API**: SearchApi.io

## Setup

### Prerequisites

- Node.js 18 or higher

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Edit .env.local and add your SearchApi key
# Get a free key at https://www.searchapi.io (100 requests, no credit card)
```

### Running

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

Open http://localhost:3000 in your browser.

### Without API Key

The app includes mock data for testing. If `SEARCHAPI_KEY` is not set, it will automatically use mock data.

## API Routes

### `GET /api/jobs`

Search jobs via Google Jobs API.

| Parameter | Description | Default |
|-----------|-------------|---------|
| `role` | Job role: `frontend`, `backend`, `fullstack`, `devops`, `data`, `mobile`, `qa`, `any` | `any` |
| `region` | Target region: `brazil`, `latam`, `worldwide`, `americas` | `latam` |
| `page_token` | Pagination token from previous response | - |

### `GET /api/ats-scan`

Scan ATS sites directly via Google Search.

| Parameter | Description | Default |
|-----------|-------------|---------|
| `region` | Target region: `brazil`, `latam`, `worldwide`, `americas` | `latam` |
| `recency` | Time filter: `last_week`, `last_month`, `all` | `last_week` |

### `GET /api/stats`

Returns API usage stats.

## Eligibility Classification

Jobs are classified based on positive and negative signals in the job text:

**Positive signals** (increase score):
- Mentions Brazil/Brasil (+3)
- Mentions LATAM/Latin America (+3)
- Global remote keywords (+3)
- Mentions Americas (+2)
- Compatible timezone UTC-3 (+2)
- EOR/contractor mentions (Deel, Remote.com, Oyster) (+2)

**Negative signals** (decrease score):
- US only (-4)
- Requires US work authorization (-4)
- W2 contract (-3)
- Europe only (-3)
- Requires residence outside Brazil (-4)

**Verdict mapping**:
- Score >= 3: **Yes** (Brazilian can apply)
- Score >= 2: **Likely** (probably eligible)
- Score >= 0: **Unclear** (needs manual review)
- Score < 0: **Unlikely** (probably not eligible)

## Project Structure

```
ginga-jobs/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   └── api/
│   │       ├── jobs/route.ts
│   │       ├── ats-scan/route.ts
│   │       └── stats/route.ts
│   ├── components/
│   │   ├── FilterButtons.tsx
│   │   ├── JobCard.tsx
│   │   ├── JobList.tsx
│   │   ├── SearchBar.tsx
│   │   ├── Spinner.tsx
│   │   └── VerdictChips.tsx
│   ├── lib/
│   │   ├── types.ts
│   │   ├── searchapi.ts
│   │   └── classifier.ts
│   └── data/
│       └── mock-jobs.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── .env.example
└── README.md
```

## Costs

- **SearchApi free tier**: 100 requests (no credit card required)
- Each job search = 1 request
- Each ATS scan = 1 request
- Cached responses don't count (15-minute TTL)

## License

MIT
