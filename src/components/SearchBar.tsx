'use client';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <input
      type="search"
      placeholder="Search by title, company, or keywords..."
      value={value}
      onChange={e => onChange(e.target.value)}
      className="flex-1 min-w-[200px] bg-bg-secondary border border-border rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-accent"
    />
  );
}
