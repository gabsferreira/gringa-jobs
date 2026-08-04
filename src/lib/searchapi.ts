import {
  Job,
  SearchApiJobsResponse,
  SearchApiGoogleResponse,
  RoleType,
  RegionType,
} from './types';
import { classifyEligibility } from './classifier';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const SEARCHAPI_BASE = 'https://www.searchapi.io/api/v1/search';
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

// ============================================================================
// Analytics Tracking (with file persistence)
// ============================================================================

export interface Analytics {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  requestsByEngine: Record<string, number>;
  totalResponseTime: number;
  averageResponseTime: number;
  errors: number;
  retries: number;
  estimatedCost: number; // Based on free tier (100 requests)
}

const ANALYTICS_FILE = join(process.cwd(), '.analytics.json');
const COST_PER_REQUEST = 0.004; // $0.40 / 100 requests on paid plans

function loadAnalytics(): Analytics {
  try {
    if (existsSync(ANALYTICS_FILE)) {
      const data = readFileSync(ANALYTICS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch {
    // If file is corrupted, start fresh
  }
  return {
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    requestsByEngine: {},
    totalResponseTime: 0,
    averageResponseTime: 0,
    errors: 0,
    retries: 0,
    estimatedCost: 0,
  };
}

function saveAnalytics(): void {
  try {
    writeFileSync(ANALYTICS_FILE, JSON.stringify(analytics, null, 2));
  } catch {
    // Silently fail if we can't write (e.g., read-only filesystem)
  }
}

const analytics: Analytics = loadAnalytics();

function trackRequest(engine: string, responseTime: number): void {
  analytics.totalRequests++;
  analytics.cacheMisses++;
  analytics.requestsByEngine[engine] = (analytics.requestsByEngine[engine] || 0) + 1;
  analytics.totalResponseTime += responseTime;
  analytics.averageResponseTime = analytics.totalResponseTime / analytics.cacheMisses;
  analytics.estimatedCost = analytics.cacheMisses * COST_PER_REQUEST;
  saveAnalytics();
}

function trackCacheHit(): void {
  analytics.cacheHits++;
  saveAnalytics();
}

function trackError(): void {
  analytics.errors++;
  saveAnalytics();
}

function trackRetry(): void {
  analytics.retries++;
  saveAnalytics();
}

export function getAnalytics(): Analytics & { cacheHitRate: number } {
  const totalAttempts = analytics.cacheHits + analytics.cacheMisses;
  const cacheHitRate = totalAttempts > 0 ? (analytics.cacheHits / totalAttempts) * 100 : 0;
  return {
    ...analytics,
    cacheHitRate,
  };
}

export function resetAnalytics(): void {
  analytics.totalRequests = 0;
  analytics.cacheHits = 0;
  analytics.cacheMisses = 0;
  analytics.requestsByEngine = {};
  analytics.totalResponseTime = 0;
  analytics.averageResponseTime = 0;
  analytics.errors = 0;
  analytics.retries = 0;
  analytics.estimatedCost = 0;
  saveAnalytics();
}

// ============================================================================
// Cache Management
// ============================================================================

const cache = new Map<string, { data: unknown; timestamp: number }>();

function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  trackCacheHit();
  return entry.data as T;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, timestamp: Date.now() });
}

// ============================================================================
// Query Configuration
// ============================================================================

const ROLE_QUERIES: Record<RoleType, string> = {
  frontend: 'frontend engineer',
  backend: 'backend engineer',
  fullstack: 'full stack engineer',
  devops: 'devops engineer',
  data: 'data engineer',
  mobile: 'mobile engineer',
  qa: 'qa engineer',
  devrel: 'developer advocate OR developer relations OR devrel',
  any: 'software engineer',
};

const REGION_QUERIES: Record<RegionType, string> = {
  brazil: 'remote {role} brazil',
  latam: 'remote {role} latam',
  worldwide: 'remote {role} worldwide OR "work from anywhere"',
  americas: 'remote {role} americas',
};

const ATS_SITES = 'site:jobs.ashbyhq.com OR site:boards.greenhouse.io OR site:jobs.lever.co OR site:apply.workable.com';

const ATS_NAMES: Record<string, string> = {
  'jobs.ashbyhq.com': 'Ashby',
  'boards.greenhouse.io': 'Greenhouse',
  'jobs.lever.co': 'Lever',
  'apply.workable.com': 'Workable',
};

// ============================================================================
// Job Normalization
// ============================================================================

function generateJobId(title: string, company: string): string {
  const raw = `${title}${company}`.toLowerCase().replace(/\W+/g, '');
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).slice(0, 12);
}

function normalizeGoogleJob(
  job: NonNullable<SearchApiJobsResponse['jobs']>[number],
  query: string
): Job {
  const title = job.title || 'Untitled';
  const company = job.company_name || 'Unknown';

  const normalized: Job = {
    id: generateJobId(title, company),
    title,
    company,
    location: job.location || null,
    via: (job.via || '').replace(/^via\s+/i, '').trim() || null,
    description: job.description || '',
    extensions: job.extensions || [],
    applyLink: job.apply_link || job.apply_links?.[0]?.link || job.sharing_link || null,
    source: 'google_jobs',
    query,
    verdict: { verdict: 'unclear', score: 0, reasons: [] },
  };

  normalized.verdict = classifyEligibility(normalized);
  return normalized;
}

function normalizeAtsResult(
  result: NonNullable<SearchApiGoogleResponse['organic_results']>[number],
  query: string
): Job | null {
  const link = result.link || '';
  const atsEntry = Object.entries(ATS_NAMES).find(([domain]) => link.includes(domain));

  if (!atsEntry) return null;

  let title = result.title || 'Untitled';
  let company = result.source || atsEntry[1];

  if (title.includes('@')) {
    const parts = title.split('@');
    title = parts[0].trim();
    company = parts[1]?.trim() || company;
  } else if (title.includes(' - ')) {
    const parts = title.split(' - ');
    title = parts[0].trim();
    if (parts[1] && !parts[1].toLowerCase().includes('career')) {
      company = parts[1].trim();
    }
  }

  const normalized: Job = {
    id: generateJobId(title, link),
    title,
    company,
    location: null,
    via: atsEntry[1],
    description: result.snippet || '',
    extensions: [],
    applyLink: link,
    source: 'ats_search',
    query,
    verdict: { verdict: 'unclear', score: 0, reasons: [] },
  };

  normalized.verdict = classifyEligibility(normalized);
  return normalized;
}

// ============================================================================
// API Client with Retry Logic
// ============================================================================

/**
 * Sleep for a given number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if an error is retryable (rate limit or server error)
 */
function isRetryableError(status: number): boolean {
  return status === 429 || (status >= 500 && status < 600);
}

/**
 * Fetch from SearchApi with retry logic and exponential backoff
 */
async function fetchSearchApi<T>(params: Record<string, string>): Promise<{ data: T; fromCache: boolean }> {
  const apiKey = process.env.SEARCHAPI_KEY;

  if (!apiKey) {
    throw new Error('SEARCHAPI_KEY not configured');
  }

  const url = new URL(SEARCHAPI_BASE);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value);
    }
  }

  const cacheKey = url.toString();
  const cached = getFromCache<T>(cacheKey);
  if (cached) {
    return { data: cached, fromCache: true };
  }

  const engine = params.engine || 'unknown';
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      trackRetry();
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1);
      console.log(`[SearchApi] Retry attempt ${attempt}/${MAX_RETRIES - 1}, waiting ${delay}ms...`);
      await sleep(delay);
    }

    const startTime = Date.now();

    try {
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text();

        if (isRetryableError(response.status) && attempt < MAX_RETRIES - 1) {
          console.log(`[SearchApi] Retryable error ${response.status}, will retry...`);
          lastError = new Error(`SearchApi error ${response.status}: ${errorText}`);
          continue;
        }

        trackError();
        throw new Error(`SearchApi error ${response.status}: ${errorText}`);
      }

      const data = await response.json() as T;

      trackRequest(engine, responseTime);
      setCache(cacheKey, data);

      return { data, fromCache: false };
    } catch (error) {
      if (error instanceof Error && error.message.includes('SearchApi error')) {
        throw error;
      }

      // Network error, retry
      lastError = error as Error;
      if (attempt < MAX_RETRIES - 1) {
        console.log(`[SearchApi] Network error, will retry: ${lastError.message}`);
        continue;
      }
    }
  }

  trackError();
  throw lastError || new Error('SearchApi request failed after retries');
}

// ============================================================================
// Public API Functions
// ============================================================================

export async function searchJobs(
  role: RoleType = 'any',
  region: RegionType = 'latam',
  pageToken?: string
): Promise<{ jobs: Job[]; nextPageToken: string | null; query: string; fromCache: boolean; requestCount: number }> {
  const roleQuery = ROLE_QUERIES[role] || ROLE_QUERIES.any;
  const regionTemplate = REGION_QUERIES[region] || REGION_QUERIES.latam;
  const query = regionTemplate.replace('{role}', roleQuery);

  const params: Record<string, string> = {
    engine: 'google_jobs',
    q: query,
    gl: 'us',
    hl: 'en',
  };

  if (pageToken) {
    params.next_page_token = pageToken;
  }

  const { data, fromCache } = await fetchSearchApi<SearchApiJobsResponse>(params);
  const jobs = (data.jobs || []).map(job => normalizeGoogleJob(job, query));

  return {
    jobs,
    nextPageToken: data.pagination?.next_page_token || null,
    query,
    fromCache,
    requestCount: analytics.cacheMisses,
  };
}

export async function scanAts(
  region: RegionType = 'latam',
  recency: string = 'last_week'
): Promise<{ jobs: Job[]; query: string; fromCache: boolean; requestCount: number }> {
  let regionTerms: string;
  switch (region) {
    case 'brazil':
      regionTerms = '"Brazil" OR "Brasil"';
      break;
    case 'worldwide':
      regionTerms = '"worldwide" OR "work from anywhere" OR "global"';
      break;
    case 'americas':
      regionTerms = '"Americas" OR "North America" OR "South America"';
      break;
    case 'latam':
    default:
      regionTerms = '"Brazil" OR "LATAM" OR "Latin America"';
  }

  const query = `(${ATS_SITES}) remote engineer (${regionTerms})`;

  const params: Record<string, string> = {
    engine: 'google',
    q: query,
    gl: 'us',
    hl: 'en',
  };

  if (recency && recency !== 'all') {
    params.time_period = recency;
  }

  const { data, fromCache } = await fetchSearchApi<SearchApiGoogleResponse>(params);
  const jobs = (data.organic_results || [])
    .map(result => normalizeAtsResult(result, query))
    .filter((job): job is Job => job !== null);

  return {
    jobs,
    query,
    fromCache,
    requestCount: analytics.cacheMisses,
  };
}

export function getStats(): { requestCount: number; cacheSize: number; hasApiKey: boolean } {
  return {
    requestCount: analytics.cacheMisses,
    cacheSize: cache.size,
    hasApiKey: !!process.env.SEARCHAPI_KEY,
  };
}
