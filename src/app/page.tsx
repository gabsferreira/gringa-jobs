'use client';

import { useState, useEffect, useMemo } from 'react';
import { Job, RoleType, RegionType, VerdictType, JobsResponse, StatsResponse } from '@/lib/types';
import { VERDICT_ORDER } from '@/lib/classifier';
import FilterPanel, { DatePostedType } from '@/components/FilterPanel';
import JobList from '@/components/JobList';
import VerdictChips from '@/components/VerdictChips';
import SearchBar from '@/components/SearchBar';
import Spinner from '@/components/Spinner';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';

type VerdictFilter = VerdictType | 'all';

export default function Home() {
  // Filter state
  const [selectedRole, setSelectedRole] = useState<RoleType>('any');
  const [selectedRegion, setSelectedRegion] = useState<RegionType>('latam');
  const [selectedVerdict, setSelectedVerdict] = useState<VerdictFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [datePosted, setDatePosted] = useState<DatePostedType>('last_week');

  // Data state
  const [jobs, setJobs] = useState<Job[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [requestCount, setRequestCount] = useState(0);
  const [hasApiKey, setHasApiKey] = useState(true);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [fromCache, setFromCache] = useState(false);
  const [analyticsRefresh, setAnalyticsRefresh] = useState(0);

  // Check API status on mount
  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then((data: StatsResponse) => {
        setHasApiKey(data.hasApiKey);
        setRequestCount(data.requestCount);
      })
      .catch(console.error);
  }, []);

  // Filter and sort jobs
  const filteredJobs = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return jobs
      .filter(job => {
        if (selectedVerdict !== 'all' && job.verdict.verdict !== selectedVerdict) {
          return false;
        }
        if (query) {
          const searchText = `${job.title} ${job.company} ${job.description || ''}`.toLowerCase();
          if (!searchText.includes(query)) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => VERDICT_ORDER[a.verdict.verdict] - VERDICT_ORDER[b.verdict.verdict]);
  }, [jobs, selectedVerdict, searchQuery]);

  // Search jobs
  const searchJobs = async (pageToken?: string) => {
    if (pageToken) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setError(null);
    }

    try {
      const params = new URLSearchParams({
        role: selectedRole,
        region: selectedRegion,
      });
      if (pageToken) {
        params.append('page_token', pageToken);
      }

      const res = await fetch(`/api/jobs?${params}`);
      const data: JobsResponse = await res.json();

      if (!res.ok) {
        throw new Error((data as { error?: string }).error || 'Failed to fetch jobs');
      }

      if (pageToken) {
        setJobs(prev => [...prev, ...data.jobs]);
      } else {
        setJobs(data.jobs);
        setSelectedVerdict('all');
      }

      setNextPageToken(data.nextPageToken);
      setRequestCount(data.requestCount);
      setFromCache(data.fromCache);
      setHasSearched(true);
      setAnalyticsRefresh(prev => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Map datePosted to API recency format
  const getRecencyParam = (date: DatePostedType): string => {
    switch (date) {
      case '24h': return 'last_day';
      case 'last_week': return 'last_week';
      case '30_days': return 'last_month';
      case 'all': return 'all';
      default: return 'last_week';
    }
  };

  // ATS deep scan
  const scanAts = async () => {
    setIsScanning(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        region: selectedRegion,
        recency: getRecencyParam(datePosted),
      });

      const res = await fetch(`/api/ats-scan?${params}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to scan ATS sites');
      }

      setJobs(data.jobs);
      setNextPageToken(null);
      setSelectedVerdict('all');
      setRequestCount(data.requestCount);
      setFromCache(data.fromCache);
      setHasSearched(true);
      setAnalyticsRefresh(prev => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-4xl mx-auto px-5 py-8 pb-20">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-white">Gringa Jobs</h1>
            <a
              href="/content-plan"
              className="text-sm px-4 py-2 bg-bg-secondary border border-border rounded-lg text-gray-300 hover:border-accent hover:text-accent transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Content Plan
            </a>
          </div>
          <p className="text-gray-400 mb-4">
            Remote tech jobs that people based in Brazil can apply to
          </p>
          <div className="flex gap-3 flex-wrap">
            <span className="text-xs px-3 py-1.5 rounded-full bg-bg-secondary border border-border text-gray-400">
              API Requests: {requestCount}
            </span>
            {fromCache && (
              <span className="text-xs px-3 py-1.5 rounded-full bg-bg-secondary border border-accent text-accent">
                Cached
              </span>
            )}
            {!hasApiKey && (
              <span className="text-xs px-3 py-1.5 rounded-full bg-yellow/15 border border-yellow text-yellow">
                Using mock data
              </span>
            )}
          </div>
        </header>

        {/* Filters */}
        <section className="mb-6">
          <FilterPanel
            selectedRole={selectedRole}
            selectedRegion={selectedRegion}
            selectedDatePosted={datePosted}
            onRoleChange={setSelectedRole}
            onRegionChange={setSelectedRegion}
            onDatePostedChange={setDatePosted}
            onSearch={() => searchJobs()}
            onAtsScan={scanAts}
            isLoading={isLoading}
            isScanning={isScanning}
          />
        </section>

        {/* Results Filters */}
        {hasSearched && (
          <section className="flex flex-wrap gap-4 items-center mb-6">
            <VerdictChips selected={selectedVerdict} onChange={setSelectedVerdict} />
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </section>
        )}

        {/* Results */}
        <section>
          {error && (
            <div className="bg-red/15 border border-red rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-red text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                !
              </div>
              <h3 className="text-red font-semibold mb-2">Something went wrong</h3>
              <p className="text-gray-400 text-sm">{error}</p>
            </div>
          )}

          {!error && !hasSearched && (
            <div className="text-center py-16 text-gray-400">
              <svg
                className="w-16 h-16 mx-auto mb-6 opacity-50"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <h3 className="text-xl font-semibold text-white mb-3">Find your next remote job</h3>
              <p className="mb-2">
                Select a role and region above, then click <strong className="text-white">Search Jobs</strong> to find opportunities.
              </p>
              <p className="text-sm opacity-80">
                Use <strong className="text-white">ATS Deep Scan</strong> to find jobs directly on company career pages.
              </p>
            </div>
          )}

          {!error && hasSearched && <JobList jobs={filteredJobs} />}
        </section>

        {/* Load More */}
        {nextPageToken && !error && (
          <div className="text-center mt-6">
            <button
              onClick={() => searchJobs(nextPageToken)}
              disabled={isLoadingMore}
              className="px-6 py-3 bg-bg-secondary border border-border text-white font-medium rounded-lg hover:border-accent-dim disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center gap-2 mx-auto"
            >
              {isLoadingMore ? <Spinner /> : null}
              <span>Load More</span>
            </button>
          </div>
        )}

        {/* Results Info */}
        {hasSearched && filteredJobs.length > 0 && (
          <div className="text-center mt-6 text-sm text-gray-500">
            Showing {filteredJobs.length} of {jobs.length} jobs
          </div>
        )}

        {/* Analytics Dashboard */}
        <div className="mt-8">
          <AnalyticsDashboard refreshTrigger={analyticsRefresh} />
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>
            Prototype built with{' '}
            <a
              href="https://www.searchapi.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              SearchApi
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
