import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileOverview Institutional News Proxy (Currents API Integration).
 * Optimized for high-speed delivery with automated market sector filtering.
 * Defaults to Forex, Crypto, Stocks, and Markets intelligence if no query is provided.
 */

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');
  
  // Authoritative Token
  const CURRENTS_API_KEY = "OSVWG7fkMI86yl-mRSR49GrBA2_SoY0SwcQ9_82d2n-e0CWZ";
  const BASE_URL = "https://api.currentsapi.services/v1";

  // Institutional Default Filter: Prioritize market-moving sectors
  const DEFAULT_MARKET_QUERY = "(forex OR crypto OR stocks OR markets OR " +
                                "commodities OR indices OR inflation OR central bank)";

  if (!CURRENTS_API_KEY) {
    return NextResponse.json({ error: 'News feed configuration missing' }, { status: 500 });
  }

  /**
   * We use the /search endpoint exclusively to support the targeted 
   * default market query and user-specific asset searches.
   */
  const endpoint = `${BASE_URL}/search`;
  const url = new URL(endpoint);
  
  url.searchParams.set('language', 'en');
  
  // If user provided a specific asset search, use it. 
  // Otherwise, use our institutional market filter.
  const activeQuery = (query && query.trim().length > 1) 
    ? query.trim() 
    : DEFAULT_MARKET_QUERY;

  url.searchParams.set('query', activeQuery);

  try {
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `${CURRENTS_API_KEY}`,
        'Accept': 'application/json'
      },
      // 10 minute institutional cache
      next: { revalidate: 600 }
    });

    if (!res.ok) {
      console.error(`News Node Error: ${res.status}`);
      return NextResponse.json({ error: 'Upstream node reported an error' }, { status: res.status });
    }

    const data = await res.json();
    
    if (data.status !== "ok" || !data.news) {
      return NextResponse.json({ data: [] });
    }

    const mappedData = mapNews(data.news);

    return NextResponse.json({ data: mappedData });
  } catch (error) {
    console.error("News Proxy Handshake Failure:", error);
    return NextResponse.json({ error: 'Internal server handshake failure' }, { status: 500 });
  }
}

/**
 * Maps Currents API fields to our internal NewsItem schema.
 */
function mapNews(news: any[]) {
  if (!news) return [];
  return news.map((item: any) => ({
    uuid: item.id,
    title: item.title,
    published_at: item.published,
    publisher: item.author || 'Financial Press',
    description: item.description,
    url: item.url,
    image: item.image,
    category: Array.isArray(item.category) ? item.category : [item.category].filter(Boolean)
  }));
}
