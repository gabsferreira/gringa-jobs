# Gringa Jobs - Complete Project Guide

## What is this project?

Gringa Jobs is a job board web application that helps people based in Brazil find remote tech jobs they can actually apply to. The key problem it solves: **no job API tells you "Brazilians can apply"** - that information is hidden in the job description text.

This app collects remote jobs from multiple sources and automatically classifies them based on eligibility for Brazilian candidates.

## How it works

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           User Interface                                │
│              (Next.js React app with filters and job cards)             │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            API Routes                                   │
│                                                                         │
│   /api/jobs        → Search Google Jobs via SearchApi                   │
│   /api/ats-scan    → Scan ATS sites (Greenhouse, Lever, etc.)          │
│   /api/stats       → Request counter and cache status                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          SearchApi.io                                   │
│                                                                         │
│   • Google Jobs API  → Aggregated job listings with full descriptions  │
│   • Google Search    → Direct search on ATS career pages               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      Eligibility Classifier                             │
│                                                                         │
│   Analyzes job text for signals like:                                   │
│   ✅ "LATAM", "Brazil", "worldwide", "Deel", "contractor"              │
│   ❌ "US only", "W2", "authorized to work in the US"                   │
│                                                                         │
│   Returns: yes | likely | unclear | unlikely                            │
└─────────────────────────────────────────────────────────────────────────┘
```

## Project Structure

```
ginga-jobs/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx            # Root layout with metadata
│   │   ├── page.tsx              # Main page (job search UI)
│   │   ├── globals.css           # Tailwind + dark theme colors
│   │   └── api/
│   │       ├── jobs/route.ts     # Google Jobs search endpoint
│   │       ├── ats-scan/route.ts # ATS deep scan endpoint
│   │       └── stats/route.ts    # API usage stats
│   │
│   ├── components/               # React components
│   │   ├── FilterButtons.tsx     # Role & region filter buttons
│   │   ├── JobCard.tsx           # Individual job card with badge
│   │   ├── JobList.tsx           # List of job cards
│   │   ├── SearchBar.tsx         # Text search input
│   │   ├── Spinner.tsx           # Loading spinner
│   │   └── VerdictChips.tsx      # Eligibility filter chips
│   │
│   ├── lib/                      # Core logic
│   │   ├── types.ts              # TypeScript interfaces
│   │   ├── searchapi.ts          # SearchApi client + caching
│   │   └── classifier.ts         # Eligibility classification
│   │
│   └── data/
│       └── mock-jobs.ts          # Mock data for testing
│
├── .env.example                  # Environment variables template
├── .env.local                    # Your actual API key (gitignored)
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## Key Files Explained

### `src/lib/searchapi.ts`
The SearchApi client that:
- Makes requests to SearchApi.io (Google Jobs and Google Search)
- Implements a 15-minute in-memory cache to save API requests
- Normalizes responses into a consistent Job format
- Tracks request count for the session

### `src/lib/classifier.ts`
The eligibility classifier that:
- Scans job text for positive signals (Brazil, LATAM, worldwide, Deel, etc.)
- Scans for negative signals (US only, W2, work authorization required)
- Calculates a score and returns a verdict (yes/likely/unclear/unlikely)

### `src/app/page.tsx`
The main React page that:
- Manages filter state (role, region, verdict, search query)
- Fetches jobs from API routes
- Renders the UI with all components

---

## Setting Up Your SearchApi Key

### Step 1: Get a free API key

1. Go to [https://www.searchapi.io](https://www.searchapi.io)
2. Click "Get Started Free" or "Sign Up"
3. Create an account (no credit card required)
4. You'll get **100 free requests** to start

### Step 2: Find your API key

1. After signing up, go to your dashboard
2. Look for "API Key" or "API Keys" section
3. Copy your API key (it looks like a long string of letters and numbers)

### Step 3: Add the key to your project

Create a `.env.local` file in the project root:

```bash
# From the project directory
cp .env.example .env.local
```

Edit `.env.local` and replace the placeholder with your actual key:

```env
SEARCHAPI_KEY=your_actual_api_key_here
```

For example:
```env
SEARCHAPI_KEY=abc123def456ghi789jkl012mno345
```

### Step 4: Restart the development server

```bash
# Stop the server (Ctrl+C) if running, then:
npm run dev
```

### Step 5: Verify it's working

1. Open http://localhost:3000
2. The yellow "Using mock data" badge should disappear
3. Click "Search Jobs" - you should see real job listings
4. The "API Requests" counter will increase with each search

---

## How API Requests Work

| Action | Requests Used |
|--------|---------------|
| Click "Search Jobs" | 1 request |
| Click "Load More" | 1 request |
| Click "ATS Deep Scan" | 1 request |
| Repeat same search (within 15 min) | 0 requests (cached) |

**Free tier**: 100 requests total
**Paid plans**: Start at $40/month for 10,000 requests

---

## Eligibility Classification Details

The classifier analyzes job descriptions and assigns scores:

### Positive Signals (increase score)
| Signal | Score | Example |
|--------|-------|---------|
| Mentions Brazil/Brasil | +3 | "Open to candidates in Brazil" |
| Mentions LATAM | +3 | "Remote position for LATAM" |
| Worldwide/global remote | +3 | "Work from anywhere" |
| Mentions Americas | +2 | "Americas timezone preferred" |
| UTC-3/GMT-3 timezone | +2 | "UTC-3 to UTC-5 overlap" |
| EOR/contractor keywords | +2 | "We hire via Deel" |

### Negative Signals (decrease score)
| Signal | Score | Example |
|--------|-------|---------|
| US only | -4 | "United States only" |
| Work authorization required | -4 | "Must be authorized to work in the US" |
| W2 contract | -3 | "W2 employment" |
| Europe only | -3 | "EU-based candidates only" |
| Residence requirement | -4 | "Must reside in Canada" |

### Verdict Mapping
| Score | Verdict | Meaning |
|-------|---------|---------|
| >= 3 | **Yes** | Brazilian can definitely apply |
| >= 2 | **Likely** | Probably eligible |
| >= 0 | **Unclear** | Needs manual review |
| < 0 | **Unlikely** | Probably not eligible |

---

## Running the Project

### Development
```bash
npm run dev
# Open http://localhost:3000
```

### Production Build
```bash
npm run build
npm start
```

### Type Checking
```bash
npm run lint
```

---

## Tips for Using the App

1. **Start with LATAM region** - Most jobs explicitly open to LATAM will mention it
2. **Use ATS Deep Scan** - Finds jobs directly on company career pages that Google Jobs might miss
3. **Filter by "Yes" verdict** - These are the safest bets
4. **Read "Likely" jobs carefully** - They usually work but double-check the requirements
5. **Use text search** - Filter by specific technologies like "React" or "Node.js"

---

## Troubleshooting

### "Using mock data" badge won't go away
- Make sure `.env.local` exists (not `.env.example`)
- Check that the key has no extra spaces or quotes
- Restart the dev server after adding the key

### "SearchApi error 401"
- Your API key is invalid or expired
- Go to SearchApi dashboard and regenerate the key

### "SearchApi error 429"
- You've hit the rate limit
- Wait a few minutes or upgrade your plan

### Jobs not loading
- Check browser console for errors
- Verify your internet connection
- Try a different search query
