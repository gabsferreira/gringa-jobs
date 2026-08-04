import { Job, VerdictType } from '@/lib/types';
import { VERDICT_LABELS } from '@/lib/classifier';

interface JobCardProps {
  job: Job;
}

const VERDICT_STYLES: Record<VerdictType, string> = {
  yes: 'bg-accent/15 text-accent',
  likely: 'bg-yellow/15 text-yellow',
  unclear: 'bg-blue/15 text-blue',
  unlikely: 'bg-red/15 text-red',
};

const NEGATIVE_KEYWORDS = ['US only', 'W2', 'Europe only', 'requires', 'no sponsorship', 'strict timezone'];

export default function JobCard({ job }: JobCardProps) {
  const verdictStyle = VERDICT_STYLES[job.verdict.verdict];
  const verdictLabel = VERDICT_LABELS[job.verdict.verdict];

  // Separate positive and negative reasons
  const positiveReasons: string[] = [];
  const negativeReasons: string[] = [];

  job.verdict.reasons.forEach(reason => {
    if (NEGATIVE_KEYWORDS.some(kw => reason.toLowerCase().includes(kw.toLowerCase()))) {
      negativeReasons.push(reason);
    } else {
      positiveReasons.push(reason);
    }
  });

  return (
    <article className="bg-bg-secondary border border-border rounded-xl p-5 hover:bg-bg-hover transition-colors">
      <div className="flex justify-between items-start gap-4 mb-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{job.title}</h3>
          <p className="text-accent text-sm">{job.company}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${verdictStyle}`}>
          {verdictLabel}
        </span>
      </div>

      {job.description && (
        <p className="text-gray-400 text-sm mb-3 line-clamp-3">{job.description}</p>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {job.location && (
          <span className="text-xs px-3 py-1 rounded-full border border-border text-gray-400">
            {job.location}
          </span>
        )}
        {job.via && (
          <span className="text-xs px-3 py-1 rounded-full border border-border text-gray-400">
            via {job.via}
          </span>
        )}
        {positiveReasons.slice(0, 2).map((reason, i) => (
          <span
            key={`pos-${i}`}
            className="text-xs px-3 py-1 rounded-full border border-accent-dim text-accent-dim"
          >
            {reason}
          </span>
        ))}
        {negativeReasons.slice(0, 2).map((reason, i) => (
          <span
            key={`neg-${i}`}
            className="text-xs px-3 py-1 rounded-full border border-red/40 text-red"
          >
            {reason}
          </span>
        ))}
      </div>

      {job.applyLink && (
        <a
          href={job.applyLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-accent text-gray-900 font-bold text-sm px-5 py-2.5 rounded-lg hover:brightness-110 transition-all"
        >
          Apply &rarr;
        </a>
      )}
    </article>
  );
}
