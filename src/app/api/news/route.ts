
import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileOverview Institutional News Proxy (Hardened).
 * Adheres strictly to Free News API OpenAPI v3.1.1.
 */

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');
  const NEWS_API_KEY = process.env.FREE_NEWS_API_KEY;
  const BASE_URL = "https://api.freenewsapi.io/v1";

  if (!NEWS_API_KEY) {
    return NextResponse.json({ error: 'News feed configuration missing' }, { status: 500 });
  }

  // Determine filtering based on provided documentation
  // We use language=en and country=US as defaults for institutional relevance
  let url = `${BASE_URL}/news?language=en&order_by=recent&country=US`;
  
  if (query && query.trim().length > 2) {
    // documented search parameter: in_title
    url += `&in_title=${encodeURIComponent(query.trim())}`;
  } else {
    // Default broad market context for the registry
    url += `&in_title=${encodeURIComponent('Markets Stocks Crypto Fed Economy')}`;
  }

  try {
    const res = await fetch(url, {
      headers: {
        'x-api-key': NEWS_API_KEY
      },
      next: { revalidate: 300 } // 5-minute cache threshold
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return NextResponse.json({ 
        error: errorData.error || 'Upstream news node unreachable',
        status: res.status 
      }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("News Proxy Fatal Error:", error);
    return NextResponse.json({ error: 'Internal server handshake failure' }, { status: 500 });
  }
}
