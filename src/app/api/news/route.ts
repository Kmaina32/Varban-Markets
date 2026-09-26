
import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileOverview Institutional News Proxy.
 * Handles server-side fetching from Free News API to prevent CORS errors and protect API keys.
 */

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');
  const NEWS_API_KEY = "e4a3422407487dd7ddce70f77e0ea1c94fb32d41cf941c02d7bc4e8605a52e7f";
  const BASE_URL = "https://api.freenewsapi.io/v1";

  // Build the upstream URL
  let url = `${BASE_URL}/news?language=en&order_by=recent`;
  
  if (query && query.length > 2) {
    // Search only in title for high relevance as per documentation
    url += `&in_title=${encodeURIComponent(query)}`;
  } else {
    // Default institutional context
    url += `&in_title=${encodeURIComponent('Fed Market Stocks Gold Crypto')}`;
  }

  try {
    const res = await fetch(url, {
      headers: {
        'x-api-key': NEWS_API_KEY
      },
      // Ensure we don't cache forever to keep the feed fresh
      next: { revalidate: 300 }
    });

    if (!res.ok) {
      const errData = await res.json();
      return NextResponse.json({ error: errData.error || 'Upstream Error' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("News Proxy Failure:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
