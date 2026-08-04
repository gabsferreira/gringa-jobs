import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { scanAts, getStats } from '@/lib/searchapi';
import { mockJobs } from '@/data/mock-jobs';
import { parseAtsScanQuery, formatZodError } from '@/lib/validation';

export async function GET(request: NextRequest) {
  // Validate query parameters
  let params;
  try {
    params = parseAtsScanQuery(request.nextUrl.searchParams);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: formatZodError(error), requestCount: getStats().requestCount },
        { status: 400 }
      );
    }
    throw error;
  }

  const { region, recency } = params;

  // Check if API key is configured
  const stats = getStats();
  if (!stats.hasApiKey) {
    // Return filtered mock data when no API key
    const atsJobs = mockJobs.filter(job => job.source === 'ats_search' || job.via);
    return NextResponse.json({
      jobs: atsJobs.length > 0 ? atsJobs : mockJobs.slice(0, 3),
      query: 'mock ATS scan (no API key)',
      fromCache: false,
      requestCount: stats.requestCount,
    });
  }

  try {
    const result = await scanAts(region, recency);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const status = message.includes('429') ? 429 : 500;
    return NextResponse.json(
      { error: message, requestCount: getStats().requestCount },
      { status }
    );
  }
}
