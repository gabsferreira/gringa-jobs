import { Verdict, VerdictType } from './types';

interface Rule {
  pattern: RegExp;
  weight: number;
  reason: string;
}

const POSITIVE_RULES: Rule[] = [
  { pattern: /\bbrazil\b|\bbrasil\b/i, weight: 3, reason: 'mentions Brazil' },
  { pattern: /\blatam\b|latin america/i, weight: 3, reason: 'mentions LATAM' },
  { pattern: /south america/i, weight: 2, reason: 'mentions South America' },
  { pattern: /\bamericas\b/i, weight: 2, reason: 'mentions Americas' },
  { pattern: /worldwide|work from anywhere|anywhere in the world|fully remote, global|global remote/i, weight: 3, reason: 'global remote' },
  { pattern: /utc\s*[-−–]\s*3|gmt\s*[-−–]\s*3/i, weight: 2, reason: 'compatible timezone (UTC-3)' },
  { pattern: /\bdeel\b|remote\.com|\boyster\b|contractor agreement|\bpj\b/i, weight: 2, reason: 'hires via EOR/contractor' },
];

const NEGATIVE_RULES: Rule[] = [
  { pattern: /us[- ]?only|usa only|united states only/i, weight: -4, reason: 'US only' },
  { pattern: /authorized to work in the (us|u\.s\.|united states)/i, weight: -4, reason: 'requires US work authorization' },
  { pattern: /\bw-?2\b/i, weight: -3, reason: 'W2 contract (US)' },
  { pattern: /(eu|europe)[- ]?only|based in europe/i, weight: -3, reason: 'Europe only' },
  { pattern: /must (be located|reside|be based) in (the )?(us|u\.s\.|united states|canada|europe|uk)/i, weight: -4, reason: 'requires residence outside Brazil' },
  { pattern: /(pst|est|cet)\s*(business hours|working hours|overlap of [6-9])/i, weight: -1, reason: 'strict timezone requirement' },
  { pattern: /no visa sponsorship/i, weight: -1, reason: 'no sponsorship (may indicate local role)' },
];

export function classifyEligibility(job: {
  title?: string;
  location?: string | null;
  description?: string;
  extensions?: string[];
}): Verdict {
  const text = [
    job.title || '',
    job.location || '',
    job.description || '',
    ...(job.extensions || []),
  ].join(' ').toLowerCase();

  let score = 0;
  const reasons: string[] = [];

  for (const rule of [...POSITIVE_RULES, ...NEGATIVE_RULES]) {
    if (rule.pattern.test(text)) {
      score += rule.weight;
      reasons.push(rule.reason);
    }
  }

  let verdict: VerdictType;
  if (score >= 3) {
    verdict = 'yes';
  } else if (score >= 2) {
    verdict = 'likely';
  } else if (score >= 0) {
    verdict = 'unclear';
  } else {
    verdict = 'unlikely';
  }

  return { verdict, score, reasons };
}

export const VERDICT_LABELS: Record<VerdictType, string> = {
  yes: 'Brazilian can apply',
  likely: 'Likely eligible',
  unclear: 'Unclear',
  unlikely: 'Unlikely eligible',
};

export const VERDICT_ORDER: Record<VerdictType, number> = {
  yes: 0,
  likely: 1,
  unclear: 2,
  unlikely: 3,
};
