import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { searchJobs, getStats } from '@/lib/searchapi';
import { mockJobs } from '@/data/mock-jobs';
import { parseJobsQuery, formatZodError } from '@/lib/validation';

export async function GET(request: NextRequest) {
  // Validate query parameters
  let params;
  try {
    params = parseJobsQuery(request.nextUrl.searchParams);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: formatZodError(error), requestCount: getStats().requestCount },
        { status: 400 }
      );
    }
    throw error;
  }

  const { role, region, page_token: pageToken } = params;

  // Check if API key is configured
  const stats = getStats();
  if (!stats.hasApiKey) {
    // Return mock data when no API key
    return NextResponse.json({
      jobs: mockJobs,
      nextPageToken: null,
      query: 'mock data (no API key)',
      fromCache: false,
      requestCount: stats.requestCount,
    });
  }

  try {
    const result = await searchJobs(role, region, pageToken);
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
