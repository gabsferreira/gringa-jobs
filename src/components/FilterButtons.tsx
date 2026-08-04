'use client';

import { RoleType, RegionType } from '@/lib/types';

interface FilterButtonsProps {
  selectedRole: RoleType;
  selectedRegion: RegionType;
  onRoleChange: (role: RoleType) => void;
  onRegionChange: (region: RegionType) => void;
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
  { value: 'worldwide', label: 'Worldwide' },
  { value: 'americas', label: 'Americas' },
];

export default function FilterButtons({
  selectedRole,
  selectedRegion,
  onRoleChange,
  onRegionChange,
}: FilterButtonsProps) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Role
        </label>
        <div className="flex flex-wrap gap-2">
          {ROLES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onRoleChange(value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedRole === value
                  ? 'bg-accent text-gray-900'
                  : 'bg-bg-primary border border-border text-white hover:border-accent-dim'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Region
        </label>
        <div className="flex flex-wrap gap-2">
          {REGIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onRegionChange(value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedRegion === value
                  ? 'bg-accent text-gray-900'
                  : 'bg-bg-primary border border-border text-white hover:border-accent-dim'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
