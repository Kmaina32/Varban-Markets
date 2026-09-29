import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileOverview Institutional News Proxy with Multi-Node Redundancy.
 * Refined for high-impact trading headlines (Forex, Crypto, Geopolitics, Commodities).
 */

const CURRENTS_API_KEY = process.env.CURRENTS_NEWS_API_KEY;
const FREE_NEWS_API_KEY = process.env.FREE_NEWS_API_KEY;

// High-precision trading intelligence query covering global timelines and specific movers
const DEFAULT_MARKET_QUERY = "(forex OR crypto OR 'stock forex trading' OR 'Donald Trump' OR 'Dangote Oil' OR 'US markets' OR 'Asian markets' OR 'European markets' OR commodities OR indices OR inflation)";

async function fetchWithRetry(url: string, options: RequestInit, retries = 2, backoff = 500): Promise<Response> {
  try {
    const response = await fetch(url, options);
    if (response.status >= 500 && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    return response;
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw error;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');
  
  // Use professional pre-search query if no specific asset is requested
  const activeQuery = (query && query.trim().length > 1) ? query.trim() : DEFAULT_MARKET_QUERY;

  if (!CURRENTS_API_KEY) {
    return NextResponse.json({ 
      status: "500", 
      msg: "Configuration Error",
      details: { message: "Primary news intelligence key is missing from environment." }
    }, { status: 500 });
  }

  // 1. Try Primary Node: Currents API (Institutional v1 Search)
  try {
    const currentsUrl = new URL("https://api.currentsapi.services/v1/search");
    currentsUrl.searchParams.set('language', 'en');
    currentsUrl.searchParams.set('query', activeQuery);

    const res = await fetchWithRetry(currentsUrl.toString(), {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${CURRENTS_API_KEY}`, 'Accept': 'application/json' },
      next: { revalidate: 600 } // 10 minute institutional cache
    });

    if (res.ok) {
      const data = await res.json();
      if (data.status === "ok" && data.news) {
        return NextResponse.json({
          data: data.news.map((item: any) => ({
            uuid: item.id,
            title: item.title,
            published_at: item.published,
            publisher: item.author || 'Financial Press',
            description: item.description,
            url: item.url,
            image: item.image,
            category: Array.isArray(item.category) ? item.category : [item.category].filter(Boolean)
          }))
        });
      }
    }
  } catch (e) {
    console.warn("Primary News Node (Currents) Failed, falling back to secondary...");
  }

  // 2. Try Secondary Node: Free News API (Tier-2 Fallback)
  if (FREE_NEWS_API_KEY) {
    try {
      const freeNewsUrl = new URL("https://api.freenewsapi.io/v1/news");
      freeNewsUrl.searchParams.set('language', 'en');
      // Simple keyword extractor for secondary node title-only search
      const simpleKeyword = activeQuery.includes('OR') ? 'forex trading' : activeQuery;
      freeNewsUrl.searchParams.set('in_title', simpleKeyword);

      const res = await fetch(freeNewsUrl.toString(), {
        headers: { 'x-api-key': FREE_NEWS_API_KEY }
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({
          data: data.data.map((item: any) => ({
            uuid: item.uuid,
            title: item.title,
            published_at: item.published_at,
            publisher: item.publisher || 'Global Finance News',
            description: item.title,
            url: `https://freenewsapi.io/news/${item.uuid}`,
            image: null,
            category: ['Market Update']
          }))
        });
      }
    } catch (e) {
      console.error("Secondary News Node Failure:", e);
    }
  }

  return NextResponse.json({ 
    status: "503", 
    msg: "Service Unavailable",
    details: { message: "All news intelligence nodes are currently unreachable." }
  }, { status: 503 });
}
