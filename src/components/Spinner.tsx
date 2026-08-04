export default function Spinner({ className = '' }: { className?: string }) {
  return (
    <div
      className={`w-4 h-4 border-2 border-transparent border-t-current rounded-full animate-spin ${className}`}
    />
  );
}
