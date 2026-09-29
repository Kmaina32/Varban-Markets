import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileOverview Institutional News Proxy.
 * Delivers refined, real-time market intelligence without intermediate storage.
 * Standardizes error responses for predictable client handling.
 */

const CURRENTS_API_KEY = process.env.CURRENTS_NEWS_API_KEY;
const FREE_NEWS_API_KEY = process.env.FREE_NEWS_API_KEY;

// High-precision market search matrix focusing on requested high-volatility drivers
const DEFAULT_MARKET_QUERY = "(forex OR crypto OR 'stock forex trading' OR 'Donald Trump' OR 'Dangote Oil' OR 'Asian markets' OR 'US markets' OR 'European markets')";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const queryParam = searchParams.get('query');
  const categoryParam = searchParams.get('category');
  
  let activeQuery = (queryParam && queryParam.trim().length > 1) ? queryParam.trim() : DEFAULT_MARKET_QUERY;
  if (categoryParam && categoryParam !== 'all') {
    activeQuery = `(${activeQuery}) AND ${categoryParam}`;
  }

  try {
    // Node 1: Currents API (Primary)
    if (CURRENTS_API_KEY) {
      const currentsUrl = new URL("https://api.currentsapi.services/v1/search");
      currentsUrl.searchParams.set('language', 'en');
      currentsUrl.searchParams.set('query', activeQuery);

      const res = await fetch(currentsUrl.toString(), {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${CURRENTS_API_KEY}` },
        next: { revalidate: 600 } 
      });

      if (res.ok) {
        const data = await res.json();
        if (data.status === "ok" && Array.isArray(data.news)) {
          return NextResponse.json({ 
            data: data.news.map((item: any) => ({
              uuid: item.id,
              title: item.title,
              published_at: item.published,
              publisher: item.author || 'Financial Press',
              description: item.description,
              url: item.url,
              image: (item.image && item.image !== 'None') ? item.image : 'https://picsum.photos/seed/news/800/450',
              category: Array.isArray(item.category) ? item.category : [item.category].filter(Boolean)
            }))
          });
        }
      }
    }

    // Node 2: Free News API (Failover)
    if (FREE_NEWS_API_KEY) {
      const freeNewsUrl = new URL("https://api.freenewsapi.io/v1/news");
      freeNewsUrl.searchParams.set('language', 'en');
      freeNewsUrl.searchParams.set('in_title', activeQuery);

      const res = await fetch(freeNewsUrl.toString(), {
        headers: { 'x-api-key': FREE_NEWS_API_KEY },
        next: { revalidate: 600 }
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.data)) {
          return NextResponse.json({
            data: data.data.map((item: any) => ({
              uuid: item.uuid,
              title: item.title,
              published_at: item.published_at,
              publisher: item.publisher || 'Market Node',
              url: `https://api.freenewsapi.io/v1/details?uuid=${item.uuid}`, // Proxy link
              category: ['Market Update']
            }))
          });
        }
      }
    }

    return NextResponse.json({ 
      status: "200", 
      data: [], 
      msg: "Intelligence nodes synchronized but no relevant records detected." 
    });

  } catch (e: any) {
    return NextResponse.json({ 
      status: "500", 
      msg: "Internal Intelligence Node Failure",
      details: e.message 
    }, { status: 500 });
  }
}
