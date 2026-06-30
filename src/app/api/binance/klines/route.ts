import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol') || 'SOLUSDT';
  const interval = searchParams.get('interval') || '1m';
  const limit = searchParams.get('limit') || '100';

  try {
    const res = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`,
      { next: { revalidate: 5 } } // Cache for 5 seconds
    );
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch klines' }, { status: 500 });
  }
}
