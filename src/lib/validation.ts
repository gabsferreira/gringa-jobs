import { z } from 'zod';

/**
 * Valid role types for job searches
 */
export const RoleTypeSchema = z.enum([
  'frontend',
  'backend',
  'fullstack',
  'devops',
  'data',
  'mobile',
  'qa',
  'devrel',
  'any',
]);

/**
 * Valid region types for job searches
 */
export const RegionTypeSchema = z.enum([
  'brazil',
  'latam',
  'worldwide',
  'americas',
]);

/**
 * Valid recency options for ATS scans
 */
export const RecencySchema = z.enum([
  'last_week',
  'last_month',
  'all',
]);

/**
 * Schema for /api/jobs query parameters
 */
export const JobsQuerySchema = z.object({
  role: RoleTypeSchema.default('any'),
  region: RegionTypeSchema.default('latam'),
  page_token: z.string().optional(),
});

/**
 * Schema for /api/ats-scan query parameters
 */
export const AtsScanQuerySchema = z.object({
  region: RegionTypeSchema.default('latam'),
  recency: RecencySchema.default('last_week'),
});

/**
 * Parse and validate query parameters from URLSearchParams
 * Returns the validated data or throws a ZodError
 */
export function parseJobsQuery(searchParams: URLSearchParams) {
  return JobsQuerySchema.parse({
    role: searchParams.get('role') || undefined,
    region: searchParams.get('region') || undefined,
    page_token: searchParams.get('page_token') || undefined,
  });
}

/**
 * Parse and validate ATS scan query parameters
 */
export function parseAtsScanQuery(searchParams: URLSearchParams) {
  return AtsScanQuerySchema.parse({
    region: searchParams.get('region') || undefined,
    recency: searchParams.get('recency') || undefined,
  });
}

/**
 * Format Zod errors into a user-friendly message
 */
export function formatZodError(error: z.ZodError): string {
  const issues = error.issues.map(issue => {
    const path = issue.path.join('.');
    return `${path}: ${issue.message}`;
  });
  return `Validation error: ${issues.join(', ')}`;
}
