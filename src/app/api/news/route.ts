import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileOverview Institutional News Proxy (Hardened).
 * Adheres strictly to Free News API OpenAPI v3.1.1.
 * Fetches data from https://api.freenewsapi.io/v1/news
 */

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');
  const NEWS_API_KEY = process.env.FREE_NEWS_API_KEY;
  const BASE_URL = "https://api.freenewsapi.io/v1";

  if (!NEWS_API_KEY) {
    console.error("News Proxy Error: API Key configuration missing from environment.");
    return NextResponse.json({ error: 'News feed configuration missing' }, { status: 500 });
  }

  // Determine filtering based on provided documentation
  // Default: language=en, country=US, order_by=recent
  let url = `${BASE_URL}/news?language=en&country=US&order_by=recent`;
  
  if (query && query.trim().length > 2) {
    // Search behavior for in_title: Up to 5 tokens are processed
    // q, in_subtitle, and in_body are deprecated/removed
    url += `&in_title=${encodeURIComponent(query.trim())}`;
  } else {
    // Default broad market context for institutional relevance
    url += `&in_title=${encodeURIComponent('Markets Stocks Crypto Economy')}`;
  }

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': NEWS_API_KEY,
        'Accept': 'application/json'
      },
      next: { revalidate: 300 } // Server-side revalidation for fetch cache
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.warn(`Upstream News API Error (${res.status}):`, errorData);
      return NextResponse.json({ 
        error: errorData.error || 'Upstream news node unreachable',
        status: res.status 
      }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("News Proxy Handshake Failure:", error);
    return NextResponse.json({ error: 'Internal server handshake failure' }, { status: 500 });
  }
}
