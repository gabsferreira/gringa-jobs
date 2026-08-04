'use client';

import { useState } from 'react';

interface Episode {
  number: number;
  title: string;
  format: 'short' | 'long' | 'article';
  duration: string;
  hook: string;
  outline: string[];
  codeDemo: string;
  cta: string;
}

const VIDEO_SERIES: Episode[] = [
  {
    number: 1,
    title: "I Built a Job Board in 2 Hours Using Google Jobs API",
    format: 'long',
    duration: '12-15 min',
    hook: "Most job boards scrape data illegally. What if you could get structured job data from Google Jobs... legally?",
    outline: [
      "Cold open: Show the finished product working",
      "The problem: Job data is fragmented and hard to aggregate",
      "Introduce SearchApi's google_jobs engine",
      "Live coding: Set up Next.js + first API call",
      "Show the raw response - explain the structure",
      "Build the UI: Job cards with company, salary, apply links",
      "Add filters: role type, region, recency",
      "Deploy to Vercel in 60 seconds",
      "Recap: What we built, API calls used, total cost"
    ],
    codeDemo: "Full job search app with filters, from zero to deployed",
    cta: "Get 100 free API calls to build your own"
  },
  {
    number: 2,
    title: "Finding Hidden Jobs on Company Career Pages",
    format: 'long',
    duration: '10-12 min',
    hook: "The best jobs never make it to LinkedIn. They're buried in Greenhouse, Lever, and Ashby pages. Here's how to find them.",
    outline: [
      "Cold open: Show jobs found that aren't on any job board",
      "Why companies post to ATS before job boards",
      "The trick: site: operator + google engine",
      "Live coding: Build the ATS scanner query",
      "Parse results: Extract job title, company from messy URLs",
      "Add the eligibility classifier (teaser for next video)",
      "Side-by-side: Jobs found via ATS vs google_jobs",
      "When to use which engine"
    ],
    codeDemo: "ATS deep scan feature using site: operators",
    cta: "Try the google engine for career page discovery"
  },
  {
    number: 3,
    title: "Stop Wasting API Calls: Caching Strategies That Actually Work",
    format: 'long',
    duration: '8-10 min',
    hook: "I reduced my SearchApi costs by 60% with one simple pattern. Here's exactly how.",
    outline: [
      "Show the analytics dashboard: cache hit rate in action",
      "Why caching matters for SERP APIs (data doesn't change every second)",
      "The 15-minute TTL sweet spot for job data",
      "Live coding: Implement in-memory cache with Map",
      "Add cache key generation from query params",
      "Show before/after: API calls saved",
      "Advanced: Redis for production, cache invalidation strategies",
      "The /api/v1/me endpoint: Monitor your usage in real-time"
    ],
    codeDemo: "Full caching layer with TTL and analytics tracking",
    cta: "Build cost-aware applications from day one"
  },
  {
    number: 4,
    title: "Retry Logic That Won't Get You Rate Limited",
    format: 'short',
    duration: '60-90 sec',
    hook: "Your API calls will fail. Here's how to handle it without getting banned.",
    outline: [
      "The problem: 429s and 5xx errors happen",
      "Wrong way: Immediate retry (makes it worse)",
      "Right way: Exponential backoff (1s, 2s, 4s)",
      "Show the code in 30 seconds",
      "Bonus: Track retries in your analytics"
    ],
    codeDemo: "Retry wrapper with exponential backoff",
    cta: "Link to full video on production-ready API clients"
  },
  {
    number: 5,
    title: "Building a Job Eligibility Classifier with Regex",
    format: 'long',
    duration: '10-12 min',
    hook: "90% of 'remote' jobs aren't actually available to you. Let's fix that with code.",
    outline: [
      "The frustration: Applying to jobs that reject your location",
      "Positive signals: 'Brazil', 'LATAM', 'worldwide', 'Deel'",
      "Negative signals: 'US only', 'work authorization', 'W2'",
      "Live coding: Build the scoring system",
      "Edge cases: 'Remote US' vs 'Remote (US timezone)'",
      "Testing: Write unit tests for the classifier",
      "Show it working: Jobs sorted by eligibility",
      "Ideas to extend: LLM-based classification"
    ],
    codeDemo: "Regex-based eligibility classifier with unit tests",
    cta: "Get structured job data to build your own filters"
  },
  {
    number: 6,
    title: "3 SearchApi Engines You're Not Using (But Should)",
    format: 'short',
    duration: '60 sec',
    hook: "Everyone knows Google Search. Here are 3 engines that solve real problems.",
    outline: [
      "google_jobs: Structured job data with salaries",
      "google_trends: See what developers are searching for",
      "youtube: Find video content for any topic",
      "Teaser: Full videos on each coming soon"
    ],
    codeDemo: "Quick hits showing each engine's response",
    cta: "100+ engines available, start with these 3"
  },
  {
    number: 7,
    title: "Real-Time API Analytics Dashboard with Next.js",
    format: 'long',
    duration: '12-15 min',
    hook: "Your users should see how much of their quota they've used. Here's how to build it.",
    outline: [
      "Show the finished dashboard (this project's analytics)",
      "The /api/v1/me endpoint: What it returns",
      "Handle free tier vs paid: Different response shapes",
      "Live coding: Build the React component",
      "Add local metrics: Cache hits, response times",
      "Polish: Collapsible UI, loading states, error handling",
      "Bonus: Trigger refresh after each search"
    ],
    codeDemo: "Full analytics dashboard component",
    cta: "Monitor your SearchApi usage in real-time"
  }
];

const ARTICLE_SERIES: Episode[] = [
  {
    number: 1,
    title: "Building a Niche Job Board with SearchApi: A Complete Guide",
    format: 'article',
    duration: '15 min read',
    hook: "Step-by-step tutorial with code samples for the entire Gringa Jobs project",
    outline: [
      "Introduction: Why niche job boards win",
      "Architecture overview with diagram",
      "Setting up SearchApi with Next.js",
      "Using google_jobs for structured data",
      "ATS scanning with google engine",
      "Building the eligibility classifier",
      "Cost optimization: Caching and monitoring",
      "Deployment and next steps"
    ],
    codeDemo: "Complete GitHub repository walkthrough",
    cta: "Clone the repo and customize for your niche"
  },
  {
    number: 2,
    title: "Google Jobs API vs LinkedIn API: A Developer's Comparison",
    format: 'article',
    duration: '8 min read',
    hook: "Honest comparison with code examples and pricing breakdown",
    outline: [
      "The job data landscape in 2024",
      "Google Jobs via SearchApi: Pros and cons",
      "LinkedIn API: Access restrictions and limitations",
      "Code comparison: Same query, different APIs",
      "Pricing analysis: Cost per 1000 jobs",
      "Data quality comparison",
      "Recommendation: When to use which"
    ],
    codeDemo: "Side-by-side API response comparison",
    cta: "Try SearchApi's google_jobs engine free"
  },
  {
    number: 3,
    title: "5 Mistakes Developers Make When Using SERP APIs",
    format: 'article',
    duration: '6 min read',
    hook: "Learn from my mistakes so you don't burn through your API quota",
    outline: [
      "Mistake 1: No caching (and how to add it)",
      "Mistake 2: Ignoring rate limits (exponential backoff)",
      "Mistake 3: Not validating inputs (Zod to the rescue)",
      "Mistake 4: Hardcoding queries (make them dynamic)",
      "Mistake 5: No monitoring (the /api/v1/me endpoint)",
      "Bonus: The 15-minute cache TTL sweet spot"
    ],
    codeDemo: "Code fixes for each mistake",
    cta: "Build production-ready from day one"
  }
];

function FormatBadge({ format }: { format: 'short' | 'long' | 'article' }) {
  const styles = {
    short: 'bg-red/20 text-red border-red/30',
    long: 'bg-accent/20 text-accent border-accent/30',
    article: 'bg-blue/20 text-blue border-blue/30',
  };
  const labels = {
    short: 'YouTube Short',
    long: 'Long-form Video',
    article: 'Blog Article',
  };
  return (
    <span className={`text-xs px-2 py-1 rounded-full border ${styles[format]}`}>
      {labels[format]}
    </span>
  );
}

function EpisodeCard({ episode, defaultOpen = false }: { episode: Episode; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 text-left hover:bg-bg-hover transition-colors"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs text-gray-500">#{episode.number}</span>
              <FormatBadge format={episode.format} />
              <span className="text-xs text-gray-500">{episode.duration}</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{episode.title}</h3>
            <p className="text-sm text-gray-400 italic">"{episode.hook}"</p>
          </div>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 mt-1 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="px-5 pb-5 border-t border-border">
          <div className="mt-4 space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-accent mb-2">Outline</h4>
              <ol className="space-y-1">
                {episode.outline.map((item, i) => (
                  <li key={i} className="text-sm text-gray-300 flex gap-2">
                    <span className="text-gray-500 flex-shrink-0">{i + 1}.</span>
                    {item}
                  </li>
                ))}
              </ol>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-bg-primary rounded-lg p-3">
                <h4 className="text-xs font-semibold text-gray-400 mb-1">Live Code Demo</h4>
                <p className="text-sm text-white">{episode.codeDemo}</p>
              </div>
              <div className="bg-bg-primary rounded-lg p-3">
                <h4 className="text-xs font-semibold text-gray-400 mb-1">Call to Action</h4>
                <p className="text-sm text-accent">{episode.cta}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ContentPlanPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-4xl mx-auto px-5 py-12">
        {/* Hero */}
        <header className="mb-12">
          <div className="flex items-center gap-2 text-accent text-sm font-medium mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Content Strategy Proposal
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            "Build Real Things" Video Series
          </h1>
          <p className="text-xl text-gray-400 mb-6">
            A developer content series using this project as the foundation.
            Every video features working code. Every demo runs live.
          </p>
          <div className="flex flex-wrap gap-3">
            <div className="bg-bg-secondary border border-border rounded-lg px-4 py-2">
              <div className="text-2xl font-bold text-white">7</div>
              <div className="text-xs text-gray-400">Videos</div>
            </div>
            <div className="bg-bg-secondary border border-border rounded-lg px-4 py-2">
              <div className="text-2xl font-bold text-white">3</div>
              <div className="text-xs text-gray-400">Articles</div>
            </div>
            <div className="bg-bg-secondary border border-border rounded-lg px-4 py-2">
              <div className="text-2xl font-bold text-white">1</div>
              <div className="text-xs text-gray-400">Open Source Repo</div>
            </div>
          </div>
        </header>

        {/* Why This Works */}
        <section className="mb-12 bg-gradient-to-br from-accent/10 to-transparent border border-accent/20 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Why This Series Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Real, Working Code</h3>
                <p className="text-sm text-gray-400">Every demo runs live. The repo is public. No hand-waving.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Solves a Real Problem</h3>
                <p className="text-sm text-gray-400">Job search for LATAM devs. Relatable and useful beyond the tutorial.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Multiple Engines</h3>
                <p className="text-sm text-gray-400">Showcases google_jobs AND google engine. Shows API versatility.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Cost-Aware</h3>
                <p className="text-sm text-gray-400">Caching, monitoring, backoff. Production patterns developers trust.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Video Series */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Video Series</h2>
            <div className="flex gap-2">
              <span className="text-xs px-2 py-1 rounded-full bg-accent/20 text-accent border border-accent/30">
                5 Long-form
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-red/20 text-red border border-red/30">
                2 Shorts
              </span>
            </div>
          </div>
          <div className="space-y-4">
            {VIDEO_SERIES.map((episode, i) => (
              <EpisodeCard key={episode.number} episode={episode} defaultOpen={i === 0} />
            ))}
          </div>
        </section>

        {/* Article Series */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Article Series</h2>
            <span className="text-xs px-2 py-1 rounded-full bg-blue/20 text-blue border border-blue/30">
              3 Articles
            </span>
          </div>
          <div className="space-y-4">
            {ARTICLE_SERIES.map((episode) => (
              <EpisodeCard key={episode.number} episode={episode} />
            ))}
          </div>
        </section>

        {/* Content Calendar */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Suggested Release Cadence</h2>
          <div className="bg-bg-secondary border border-border rounded-xl p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <div className="text-3xl font-bold text-accent mb-1">Week 1-2</div>
                <div className="text-sm text-gray-400 mb-3">Launch Phase</div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-gray-300">
                    <span className="w-2 h-2 rounded-full bg-accent"></span>
                    Video #1: Job Board Build
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <span className="w-2 h-2 rounded-full bg-blue"></span>
                    Article #1: Complete Guide
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                    Open source the repo
                  </li>
                </ul>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent mb-1">Week 3-4</div>
                <div className="text-sm text-gray-400 mb-3">Deep Dives</div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-gray-300">
                    <span className="w-2 h-2 rounded-full bg-accent"></span>
                    Video #2: ATS Scanning
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <span className="w-2 h-2 rounded-full bg-accent"></span>
                    Video #3: Caching Strategies
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <span className="w-2 h-2 rounded-full bg-red"></span>
                    Short #4: Retry Logic
                  </li>
                </ul>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent mb-1">Week 5-6</div>
                <div className="text-sm text-gray-400 mb-3">Expansion</div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-gray-300">
                    <span className="w-2 h-2 rounded-full bg-accent"></span>
                    Video #5: Eligibility Classifier
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <span className="w-2 h-2 rounded-full bg-blue"></span>
                    Article #2: API Comparison
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <span className="w-2 h-2 rounded-full bg-red"></span>
                    Short #6: 3 Engines
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Metrics */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Success Metrics</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-bg-secondary border border-border rounded-xl p-4 text-center">
              <div className="text-sm text-gray-400 mb-1">Target Views</div>
              <div className="text-2xl font-bold text-white">10K+</div>
              <div className="text-xs text-gray-500">per long-form video</div>
            </div>
            <div className="bg-bg-secondary border border-border rounded-xl p-4 text-center">
              <div className="text-sm text-gray-400 mb-1">GitHub Stars</div>
              <div className="text-2xl font-bold text-white">500+</div>
              <div className="text-xs text-gray-500">on the demo repo</div>
            </div>
            <div className="bg-bg-secondary border border-border rounded-xl p-4 text-center">
              <div className="text-sm text-gray-400 mb-1">Signups</div>
              <div className="text-2xl font-bold text-white">Track</div>
              <div className="text-xs text-gray-500">via UTM links</div>
            </div>
            <div className="bg-bg-secondary border border-border rounded-xl p-4 text-center">
              <div className="text-sm text-gray-400 mb-1">Feedback</div>
              <div className="text-2xl font-bold text-white">Weekly</div>
              <div className="text-xs text-gray-500">comments to product</div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to Build in Public</h2>
          <p className="text-gray-400 mb-6 max-w-xl mx-auto">
            This content plan turns one working project into months of authentic developer content.
            Real code, real problems, real solutions.
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="/"
              className="px-6 py-3 bg-accent text-gray-900 font-semibold rounded-lg hover:brightness-110 transition-all"
            >
              See the Demo
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-bg-secondary border border-border text-white font-medium rounded-lg hover:border-accent transition-all"
            >
              View Source Code
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>
            Content strategy for{' '}
            <a
              href="https://www.searchapi.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              SearchApi
            </a>
            {' '}Developer Advocate role
          </p>
        </footer>
      </div>
    </div>
  );
}
