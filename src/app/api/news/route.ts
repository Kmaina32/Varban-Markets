import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileOverview Institutional News Proxy (Currents API Integration).
 * Optimized for high-speed delivery without intermediary persistence.
 */

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');
  
  // Authoritative Token provided by user
  const CURRENTS_API_KEY = "OSVWG7fkMI86yl-mRSR49GrBA2_SoY0SwcQ9_82d2n-e0CWZ";
  const BASE_URL = "https://api.currentsapi.services/v1";

  if (!CURRENTS_API_KEY) {
    return NextResponse.json({ error: 'News feed configuration missing' }, { status: 500 });
  }

  const isSearch = query && query.trim().length > 2;
  const endpoint = isSearch ? `${BASE_URL}/search` : `${BASE_URL}/latest-news`;
  
  const url = new URL(endpoint);
  url.searchParams.set('language', 'en');
  
  if (isSearch) {
    url.searchParams.set('keywords', query!.trim());
  }

  try {
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `${CURRENTS_API_KEY}`,
        'Accept': 'application/json'
      },
      next: { revalidate: 600 }
    });

    if (!res.ok) {
      console.error(`News Node Error: ${res.status}`);
      return NextResponse.json({ error: 'Upstream node reported an error' }, { status: res.status });
    }

    const data = await res.json();
    
    if (data.status !== "ok" || !data.news) {
      // If search returns nothing, fallback to latest news
      if (isSearch) {
        const fallbackRes = await fetch(`${BASE_URL}/latest-news?language=en`, {
          headers: { 'Authorization': CURRENTS_API_KEY }
        });
        const fallbackData = await fallbackRes.json();
        return NextResponse.json({ data: mapNews(fallbackData.news) });
      }
      return NextResponse.json({ data: [] });
    }

    const mappedData = mapNews(data.news);

    return NextResponse.json({ data: mappedData });
  } catch (error) {
    console.error("News Proxy Handshake Failure:", error);
    return NextResponse.json({ error: 'Internal server handshake failure' }, { status: 500 });
  }
}

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
