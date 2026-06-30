import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol') || 'SOLUSDT';
  const limit = searchParams.get('limit') || '20';

  try {
    const res = await fetch(
      `https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=${limit}`,
      { next: { revalidate: 2 } }
    );
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch depth' }, { status: 500 });
  }
}
