import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileOverview Institutional News Proxy.
 * Handles server-side fetching from Free News API to prevent CORS errors and protect API keys.
 * Aligned with OpenAPI v3.0.3 documentation.
 */

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');
  const NEWS_API_KEY = process.env.FREE_NEWS_API_KEY;
  const BASE_URL = "https://api.freenewsapi.io/v1";

  if (!NEWS_API_KEY) {
    console.error("News Proxy Error: Missing FREE_NEWS_API_KEY in environment.");
    return NextResponse.json({ error: 'API Configuration Error' }, { status: 500 });
  }

  // Build the upstream URL following the documented parameters
  // Supports: language, country, order_by, in_title
  let url = `${BASE_URL}/news?language=en&order_by=recent&country=US`;
  
  if (query && query.length > 2) {
    // Search only in title for high relevance as per Documentation section 'Search'
    url += `&in_title=${encodeURIComponent(query)}`;
  } else {
    // Default institutional context for a professional dashboard feed
    url += `&in_title=${encodeURIComponent('Markets Stocks Crypto Fed Economy')}`;
  }

  try {
    const res = await fetch(url, {
      headers: {
        'x-api-key': NEWS_API_KEY
      },
      // Ensure we don't cache forever to keep the feed fresh (5 minute revalidation)
      next: { revalidate: 300 }
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.warn("News Proxy Response Error:", errData);
      return NextResponse.json({ error: errData.error || 'Upstream Provider Error' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("News Proxy Fatal Failure:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
