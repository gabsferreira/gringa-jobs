export type VerdictType = 'yes' | 'likely' | 'unclear' | 'unlikely';

export interface Verdict {
  verdict: VerdictType;
  score: number;
  reasons: string[];
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string | null;
  via: string | null;
  description: string;
  extensions: string[];
  applyLink: string | null;
  source: 'google_jobs' | 'ats_search';
  query: string;
  verdict: Verdict;
}

export interface JobsResponse {
  jobs: Job[];
  nextPageToken: string | null;
  query: string;
  fromCache: boolean;
  requestCount: number;
}

export interface StatsResponse {
  requestCount: number;
  cacheSize: number;
  hasApiKey: boolean;
}

export interface SearchApiJobsResponse {
  jobs?: Array<{
    title?: string;
    company_name?: string;
    location?: string;
    via?: string;
    description?: string;
    extensions?: string[];
    detected_extensions?: Record<string, unknown>;
    apply_link?: string;
    apply_links?: Array<{ link?: string }>;
    sharing_link?: string;
  }>;
  pagination?: {
    next_page_token?: string;
  };
}

export interface SearchApiGoogleResponse {
  organic_results?: Array<{
    title?: string;
    link?: string;
    snippet?: string;
    source?: string;
    domain?: string;
  }>;
}

export type RoleType = 'frontend' | 'backend' | 'fullstack' | 'devops' | 'data' | 'mobile' | 'qa' | 'devrel' | 'any';
export type RegionType = 'brazil' | 'latam' | 'worldwide' | 'americas';
export type RecencyType = 'last_week' | 'last_month' | 'all';
