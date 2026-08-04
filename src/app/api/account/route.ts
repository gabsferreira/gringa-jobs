import { NextResponse } from 'next/server';

interface SearchApiAccount {
  account: {
    current_month_usage: number;
    monthly_allowance: number;
    remaining_credits: number;
  };
  api_usage: {
    searches_this_hour: number;
    hourly_rate_limit: number;
  };
  subscription: {
    period_start: string;
    period_end: string;
  };
}

export async function GET() {
  const apiKey = process.env.SEARCHAPI_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'SEARCHAPI_KEY not configured' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch('https://www.searchapi.io/api/v1/me', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `SearchApi error: ${errorText}` },
        { status: response.status }
      );
    }

    const data: SearchApiAccount = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
