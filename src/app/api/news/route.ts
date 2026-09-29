
import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileOverview Institutional News Proxy (Currents API Integration).
 * Optimized for secure server-side execution and Bearer token authentication.
 * Adheres to documentation at https://api.currentsapi.services/v1
 */

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');
  
  // Currents API requires a dedicated key.
  const CURRENTS_API_KEY = process.env.CURRENTS_NEWS_API_KEY;
  const BASE_URL = "https://api.currentsapi.services/v1";

  if (!CURRENTS_API_KEY) {
    console.error("News Proxy Error: CURRENTS_NEWS_API_KEY missing from .env");
    return NextResponse.json({ error: 'News feed configuration missing' }, { status: 500 });
  }

  // Determine endpoint: use /search if query is provided, otherwise /latest-news
  const isSearch = query && query.trim().length > 2;
  const endpoint = isSearch ? `${BASE_URL}/search` : `${BASE_URL}/latest-news`;
  
  const url = new URL(endpoint);
  url.searchParams.set('language', 'en');
  
  // Currents API latest-news focuses on region/language. Search handles keywords.
  if (isSearch) {
    url.searchParams.set('keywords', query!.trim());
  } else {
    // Default institutional context for latest-news
    url.searchParams.set('country', 'US');
  }

  try {
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CURRENTS_API_KEY}`,
        'Accept': 'application/json'
      },
      // Cache for 10 minutes to respect rate limits
      next: { revalidate: 600 }
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.warn(`Upstream Currents API Error (${res.status}):`, errorText);
      return NextResponse.json({ 
        error: 'Upstream news node reported an error',
        status: res.status 
      }, { status: res.status });
    }

    const data = await res.json();
    
    // Currents API returns status "ok" and an array in "news"
    if (data.status !== "ok" || !data.news) {
      return NextResponse.json({ data: [] });
    }

    // Transform Currents API format to internal Varban NewsItem format
    // This maintains backward compatibility with existing UI components
    const mappedData = data.news.map((item: any) => ({
      uuid: item.id,
      title: item.title,
      published_at: item.published,
      publisher: item.author || 'Financial Press'
    }));

    return NextResponse.json({ data: mappedData });
  } catch (error) {
    console.error("News Proxy Handshake Failure:", error);
    return NextResponse.json({ error: 'Internal server handshake failure' }, { status: 500 });
  }
}
