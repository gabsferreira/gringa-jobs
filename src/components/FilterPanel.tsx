'use client';

import { RoleType, RegionType } from '@/lib/types';
import Spinner from './Spinner';
import styles from './FilterPanel.module.css';

export type DatePostedType = '24h' | 'last_week' | '30_days' | 'all';

interface FilterPanelProps {
  selectedRole: RoleType;
  selectedRegion: RegionType;
  selectedDatePosted: DatePostedType;
  onRoleChange: (role: RoleType) => void;
  onRegionChange: (region: RegionType) => void;
  onDatePostedChange: (date: DatePostedType) => void;
  onSearch: () => void;
  onAtsScan: () => void;
  isLoading: boolean;
  isScanning: boolean;
}

const ROLES: { value: RoleType; label: string }[] = [
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'fullstack', label: 'Full Stack' },
  { value: 'devops', label: 'DevOps' },
  { value: 'data', label: 'Data' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'qa', label: 'QA' },
  { value: 'devrel', label: 'DevRel' },
  { value: 'any', label: 'Any' },
];

const REGIONS: { value: RegionType; label: string }[] = [
  { value: 'brazil', label: 'Brazil' },
  { value: 'latam', label: 'LATAM' },
  { value: 'americas', label: 'Americas' },
  { value: 'worldwide', label: 'Worldwide' },
];

const DATE_OPTIONS: { value: DatePostedType; label: string }[] = [
  { value: '24h', label: '24h' },
  { value: 'last_week', label: 'Last week' },
  { value: '30_days', label: '30 days' },
  { value: 'all', label: 'Any time' },
];

function getRoleLabel(role: RoleType): string {
  return ROLES.find(r => r.value === role)?.label || role;
}

function getRegionLabel(region: RegionType): string {
  return REGIONS.find(r => r.value === region)?.label || region;
}

function getDateLabel(date: DatePostedType): string {
  return DATE_OPTIONS.find(d => d.value === date)?.label || date;
}

function countActiveFilters(role: RoleType, region: RegionType, date: DatePostedType): number {
  let count = 0;
  if (role !== 'any') count++;
  if (region !== 'worldwide') count++;
  if (date !== 'all') count++;
  return count;
}

export default function FilterPanel({
  selectedRole,
  selectedRegion,
  selectedDatePosted,
  onRoleChange,
  onRegionChange,
  onDatePostedChange,
  onSearch,
  onAtsScan,
  isLoading,
  isScanning,
}: FilterPanelProps) {
  const activeCount = countActiveFilters(selectedRole, selectedRegion, selectedDatePosted);

  const summaryParts: string[] = [];
  if (selectedRole !== 'any') summaryParts.push(getRoleLabel(selectedRole));
  if (selectedRegion !== 'worldwide') summaryParts.push(getRegionLabel(selectedRegion));
  if (selectedDatePosted !== 'all') summaryParts.push(getDateLabel(selectedDatePosted));

  const summaryText = activeCount > 0
    ? `${activeCount} filter${activeCount > 1 ? 's' : ''} active \u2014 ${summaryParts.join(' \u00B7 ')}`
    : 'No filters active';

  return (
    <div
      className="w-full max-w-[960px] mx-auto flex flex-col gap-4 p-6 rounded-2xl border"
      style={{
        background: '#0F1A17',
        borderColor: '#1E2D28',
      }}
    >
      {/* Two-column grid */}
      <div className={styles.grid}>
        {/* Left column: ROLE */}
        <div
          className="flex flex-col gap-3.5 rounded-xl border"
          style={{
            background: '#0C1512',
            borderColor: '#1C2A25',
            padding: '18px 20px',
          }}
        >
          <div className="flex items-center justify-between">
            <span
              className="font-mono uppercase"
              style={{ fontSize: '10px', letterSpacing: '.16em', color: '#8FA39C' }}
            >
              Role
            </span>
            <span style={{ fontSize: '11px', color: '#55655F' }}>
              {getRoleLabel(selectedRole)}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {ROLES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => onRoleChange(value)}
                className="rounded-full border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  padding: '9px 15px',
                  fontSize: '13.5px',
                  background: selectedRole === value ? '#34E0A1' : '#16241F',
                  color: selectedRole === value ? '#06221A' : '#C7D6D0',
                  borderColor: selectedRole === value ? '#34E0A1' : '#26362F',
                  fontWeight: selectedRole === value ? 600 : 400,
                  // @ts-expect-error CSS custom property for focus ring offset
                  '--tw-ring-color': '#34E0A1',
                  '--tw-ring-offset-color': '#0C1512',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Right column: REGION + DATE POSTED stacked */}
        <div className="flex flex-col gap-4">
          {/* REGION sub-card */}
          <div
            className="flex flex-col gap-3.5 rounded-xl border"
            style={{
              background: '#0C1512',
              borderColor: '#1C2A25',
              padding: '18px 20px',
            }}
          >
            <span
              className="font-mono uppercase"
              style={{ fontSize: '10px', letterSpacing: '.16em', color: '#8FA39C' }}
            >
              Region
            </span>
            <div className="flex flex-wrap gap-2">
              {REGIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => onRegionChange(value)}
                  className="rounded-full border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{
                    padding: '9px 15px',
                    fontSize: '13.5px',
                    background: selectedRegion === value ? '#34E0A1' : '#16241F',
                    color: selectedRegion === value ? '#06221A' : '#C7D6D0',
                    borderColor: selectedRegion === value ? '#34E0A1' : '#26362F',
                    fontWeight: selectedRegion === value ? 600 : 400,
                    // @ts-expect-error CSS custom property for focus ring offset
                    '--tw-ring-color': '#34E0A1',
                    '--tw-ring-offset-color': '#0C1512',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* DATE POSTED sub-card */}
          <div
            className="flex flex-col gap-3.5 rounded-xl border"
            style={{
              background: '#0C1512',
              borderColor: '#1C2A25',
              padding: '18px 20px',
            }}
          >
            <span
              className="font-mono uppercase"
              style={{ fontSize: '10px', letterSpacing: '.16em', color: '#8FA39C' }}
            >
              Date Posted
            </span>
            <div className="flex flex-wrap gap-1.5">
              {DATE_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => onDatePostedChange(value)}
                  className="rounded-lg border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{
                    padding: '8px 14px',
                    fontSize: '13px',
                    background: selectedDatePosted === value ? '#34E0A1' : 'transparent',
                    color: selectedDatePosted === value ? '#06221A' : '#C7D6D0',
                    borderColor: selectedDatePosted === value ? '#34E0A1' : '#26362F',
                    fontWeight: selectedDatePosted === value ? 600 : 400,
                    // @ts-expect-error CSS custom property for focus ring offset
                    '--tw-ring-color': '#34E0A1',
                    '--tw-ring-offset-color': '#0C1512',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className={styles.actionBar}>
        <span style={{ fontSize: '12.5px', color: '#7E908A' }}>
          {summaryText}
        </span>
        <div className={styles.actionButtons}>
          <button
            onClick={onAtsScan}
            disabled={isLoading || isScanning}
            className="flex-1 rounded-[10px] border transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center gap-2 hover:border-[#3F544C]"
            style={{
              padding: '12px 22px',
              fontSize: '14px',
              background: 'transparent',
              borderColor: '#2B3C36',
              color: '#C7D6D0',
              // @ts-expect-error CSS custom property for focus ring offset
              '--tw-ring-color': '#34E0A1',
              '--tw-ring-offset-color': '#0F1A17',
            }}
          >
            {isScanning ? <Spinner /> : null}
            <span>ATS Deep Scan</span>
          </button>
          <button
            onClick={onSearch}
            disabled={isLoading || isScanning}
            className="flex-1 rounded-[10px] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center gap-2 hover:brightness-110"
            style={{
              padding: '12px 26px',
              fontSize: '14px',
              fontWeight: 600,
              background: '#34E0A1',
              color: '#06221A',
              // @ts-expect-error CSS custom property for focus ring offset
              '--tw-ring-color': '#34E0A1',
              '--tw-ring-offset-color': '#0F1A17',
            }}
          >
            {isLoading ? <Spinner /> : null}
            <span>Search Jobs</span>
          </button>
        </div>
      </div>
    </div>
  );
}
