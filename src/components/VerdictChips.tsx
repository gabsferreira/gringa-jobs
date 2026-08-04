'use client';

import { VerdictType } from '@/lib/types';

type VerdictFilter = VerdictType | 'all';

interface VerdictChipsProps {
  selected: VerdictFilter;
  onChange: (verdict: VerdictFilter) => void;
}

const VERDICTS: { value: VerdictFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'yes', label: 'Yes' },
  { value: 'likely', label: 'Likely' },
  { value: 'unclear', label: 'Unclear' },
];

export default function VerdictChips({ selected, onChange }: VerdictChipsProps) {
  return (
    <div className="flex gap-2">
      {VERDICTS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            selected === value
              ? 'bg-accent text-gray-900'
              : 'bg-bg-secondary border border-border text-white hover:bg-bg-hover'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
