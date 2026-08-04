import { NextResponse } from 'next/server';
import { getAnalytics } from '@/lib/searchapi';

export async function GET() {
  const analytics = getAnalytics();
  return NextResponse.json(analytics);
}
