
import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileOverview Institutional News Proxy (Hardened).
 * Adheres strictly to Free News API v1.0.0 documentation.
 * Fetches data from https://api.freenewsapi.io/v1/news
 */

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');
  
  // Use the specific key provided by the user
  const NEWS_API_KEY = process.env.FREE_NEWS_API_KEY;
  const BASE_URL = "https://api.freenewsapi.io/v1";

  if (!NEWS_API_KEY) {
    console.error("News Proxy Error: FREE_NEWS_API_KEY missing from .env");
    return NextResponse.json({ error: 'News feed configuration missing' }, { status: 500 });
  }

  // Base parameters: language=en, country=US, order_by=recent
  // Using URL object for clean construction
  const url = new URL(`${BASE_URL}/news`);
  url.searchParams.set('language', 'en');
  url.searchParams.set('country', 'US');
  url.searchParams.set('order_by', 'recent');
  
  if (query && query.trim().length > 2) {
    // Search behavior for in_title: Up to 5 tokens
    url.searchParams.set('in_title', query.trim());
  } else {
    // Default institutional context
    url.searchParams.set('in_title', 'Market Stocks Crypto');
  }

  try {
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'x-api-key': NEWS_API_KEY,
        'Accept': 'application/json'
      },
      // Cache for 5 minutes to respect rate limits
      next: { revalidate: 300 }
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.warn(`Upstream News API Error (${res.status}):`, errorText);
      return NextResponse.json({ 
        error: 'Upstream news node reported an error',
        status: res.status 
      }, { status: res.status });
    }

    const data = await res.json();
    
    // Validate response structure before passing to client
    if (!data || !data.data) {
      return NextResponse.json({ data: [] });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("News Proxy Handshake Failure:", error);
    return NextResponse.json({ error: 'Internal server handshake failure' }, { status: 500 });
  }
}
