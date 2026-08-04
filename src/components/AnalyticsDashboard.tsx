'use client';

import { useState, useEffect } from 'react';

interface SearchApiAccount {
  account: {
    current_month_usage: number;
    monthly_allowance: number;
    remaining_credits: number;
  };
  api_usage: {
    searches_this_hour: number;
    hourly_rate_limit: number;
  };
  subscription?: {
    period_start: string;
    period_end: string;
  };
}

interface LocalAnalytics {
  cacheHits: number;
  cacheMisses: number;
  cacheHitRate: number;
  averageResponseTime: number;
  requestsByEngine: Record<string, number>;
  errors: number;
  retries: number;
}

interface AnalyticsDashboardProps {
  refreshTrigger?: number;
}

export default function AnalyticsDashboard({ refreshTrigger }: AnalyticsDashboardProps) {
  const [account, setAccount] = useState<SearchApiAccount | null>(null);
  const [localAnalytics, setLocalAnalytics] = useState<LocalAnalytics | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch real account data from SearchApi
    fetch('/api/account')
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setAccount(data);
          setError(null);
        }
      })
      .catch(err => setError(err.message));

    // Fetch local analytics (cache stats, response times)
    fetch('/api/analytics')
      .then(res => res.json())
      .then(setLocalAnalytics)
      .catch(console.error);
  }, [refreshTrigger]);

  if (error) {
    return (
      <div className="bg-bg-secondary border border-border rounded-xl p-4">
        <div className="text-sm text-gray-400">
          SearchApi Analytics unavailable: {error}
        </div>
      </div>
    );
  }

  if (!account) return null;

  // Free tier: monthly_allowance is 0, but remaining_credits shows what's left of 100
  const isFreeTeir = account.account.monthly_allowance === 0;
  const FREE_TIER_TOTAL = 100;

  const totalAllowance = isFreeTeir ? FREE_TIER_TOTAL : account.account.monthly_allowance;
  const usedCredits = isFreeTeir
    ? FREE_TIER_TOTAL - account.account.remaining_credits
    : account.account.current_month_usage;
  const usagePercent = (usedCredits / totalAllowance) * 100;

  const periodEnd = account.subscription?.period_end ? new Date(account.subscription.period_end) : null;
  const daysRemaining = periodEnd ? Math.ceil((periodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-bg-hover transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-accent font-semibold text-sm">SearchApi Account</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-accent/15 text-accent">
            {usedCredits.toLocaleString()} requests
          </span>
          {localAnalytics && localAnalytics.cacheHitRate > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue/15 text-blue">
              {localAnalytics.cacheHitRate.toFixed(0)}% cache hit
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-border">
          {/* Usage bar */}
          <div className="mt-4 mb-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{isFreeTeir ? 'Free Tier Usage' : 'Monthly Usage'}</span>
              <span>
                {usedCredits.toLocaleString()}/{totalAllowance.toLocaleString()} requests
              </span>
            </div>
            <div className="h-2 bg-bg-primary rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  usagePercent > 80 ? 'bg-red' : usagePercent > 50 ? 'bg-yellow' : 'bg-accent'
                }`}
                style={{ width: `${Math.min(100, usagePercent)}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {account.account.remaining_credits.toLocaleString()} requests remaining
              {daysRemaining && daysRemaining > 0 && ` (${daysRemaining} days left in period)`}
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              label={isFreeTeir ? 'Used' : 'This Month'}
              value={usedCredits.toLocaleString()}
              sublabel="total requests"
            />
            <StatCard
              label="This Hour"
              value={account.api_usage.searches_this_hour.toLocaleString()}
              sublabel={`of ${(account.api_usage.hourly_rate_limit / 1000).toFixed(0)}k limit`}
              highlight="blue"
            />
            <StatCard
              label="Remaining"
              value={account.account.remaining_credits.toLocaleString()}
              sublabel="credits left"
              highlight={account.account.remaining_credits < 100 ? 'red' : undefined}
            />
            {localAnalytics && (
              <StatCard
                label="Avg Response"
                value={`${localAnalytics.averageResponseTime.toFixed(0)}ms`}
                sublabel="response time"
                highlight="yellow"
              />
            )}
          </div>

          {/* Local cache stats */}
          {localAnalytics && (localAnalytics.cacheHits > 0 || localAnalytics.cacheMisses > 0) && (
            <div className="mt-4">
              <div className="text-xs text-gray-400 mb-2">Session Cache Stats</div>
              <div className="flex gap-2 flex-wrap">
                <span className="text-xs px-3 py-1 rounded-full bg-bg-primary border border-border text-gray-300">
                  Cache Hits: {localAnalytics.cacheHits}
                </span>
                <span className="text-xs px-3 py-1 rounded-full bg-bg-primary border border-border text-gray-300">
                  API Calls: {localAnalytics.cacheMisses}
                </span>
                {localAnalytics.cacheHitRate > 0 && (
                  <span className="text-xs px-3 py-1 rounded-full bg-blue/15 text-blue">
                    {localAnalytics.cacheHitRate.toFixed(1)}% saved
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Requests by engine */}
          {localAnalytics && Object.keys(localAnalytics.requestsByEngine).length > 0 && (
            <div className="mt-4">
              <div className="text-xs text-gray-400 mb-2">Requests by Engine</div>
              <div className="flex gap-2">
                {Object.entries(localAnalytics.requestsByEngine).map(([engine, count]) => (
                  <span
                    key={engine}
                    className="text-xs px-3 py-1 rounded-full bg-bg-primary border border-border text-gray-300"
                  >
                    {engine}: {count}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Errors and retries */}
          {localAnalytics && (localAnalytics.errors > 0 || localAnalytics.retries > 0) && (
            <div className="mt-4 flex gap-3">
              {localAnalytics.retries > 0 && (
                <span className="text-xs px-3 py-1 rounded-full bg-yellow/15 text-yellow">
                  {localAnalytics.retries} retries
                </span>
              )}
              {localAnalytics.errors > 0 && (
                <span className="text-xs px-3 py-1 rounded-full bg-red/15 text-red">
                  {localAnalytics.errors} errors
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  sublabel,
  highlight,
}: {
  label: string;
  value: string | number;
  sublabel: string;
  highlight?: 'blue' | 'yellow' | 'red';
}) {
  const highlightColors = {
    blue: 'text-blue',
    yellow: 'text-yellow',
    red: 'text-red',
  };

  return (
    <div className="bg-bg-primary rounded-lg p-3">
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className={`text-lg font-bold ${highlight ? highlightColors[highlight] : 'text-white'}`}>
        {value}
      </div>
      <div className="text-xs text-gray-500">{sublabel}</div>
    </div>
  );
}
