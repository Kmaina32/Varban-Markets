import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileOverview Institutional News Proxy with Resilient Error Handling & Retry Policy.
 * Logic: Implements exponential backoff for 5xx errors and propagates 4xx errors predictably.
 * Default Filter: Prioritize market-moving sectors (Forex, Crypto, Stocks, Markets).
 */

const CURRENTS_API_KEY = process.env.CURRENTS_NEWS_API_KEY || "OSVWG7fkMI86yl-mRSR49GrBA2_SoY0SwcQ9_82d2n-e0CWZ";
const BASE_URL = "https://api.currentsapi.services/v1";

// Institutional Default Filter: Prioritize market-moving sectors
const DEFAULT_MARKET_QUERY = "(forex OR crypto OR stocks OR markets OR commodities OR indices OR inflation OR central bank)";

async function fetchWithRetry(url: string, options: RequestInit, retries = 2, backoff = 500): Promise<Response> {
  try {
    const response = await fetch(url, options);
    
    // Retry only on 5xx (Server Errors) - 4xx errors are considered final (client-side issues)
    if (response.status >= 500 && retries > 0) {
      console.warn(`Upstream node error ${response.status}. Retrying in ${backoff}ms...`);
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
  
  if (!CURRENTS_API_KEY) {
    return NextResponse.json({ 
      status: "500", 
      msg: "System Configuration Error",
      details: { message: "News feed token missing from environment." }
    }, { status: 500 });
  }

  const endpoint = `${BASE_URL}/search`;
  const url = new URL(endpoint);
  
  url.searchParams.set('language', 'en');
  
  const activeQuery = (query && query.trim().length > 1) 
    ? query.trim() 
    : DEFAULT_MARKET_QUERY;

  url.searchParams.set('query', activeQuery);

  try {
    const res = await fetchWithRetry(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CURRENTS_API_KEY}`,
        'Accept': 'application/json'
      },
      next: { revalidate: 600 } // 10 minute institutional cache
    });

    const data = await res.json();

    if (!res.ok) {
      console.error(`News Node Protocol Error [${res.status}]:`, data.msg || 'Unknown');
      return NextResponse.json({
        status: res.status.toString(),
        msg: data.msg || "Upstream Handshake Failure",
        details: data.details || {}
      }, { status: res.status });
    }

    if (data.status !== "ok" || !data.news) {
      return NextResponse.json({ data: [] });
    }

    const mappedData = data.news.map((item: any) => ({
      uuid: item.id,
      title: item.title,
      published_at: item.published,
      publisher: item.author || 'Financial Press',
      description: item.description,
      url: item.url,
      image: item.image,
      category: Array.isArray(item.category) ? item.category : [item.category].filter(Boolean)
    }));

    return NextResponse.json({ data: mappedData });
  } catch (error) {
    console.error("Critical News Proxy Handshake Failure:", error);
    return NextResponse.json({ 
      status: "503", 
      msg: "Service Unavailable",
      details: { message: "The news intelligence node is currently unreachable." }
    }, { status: 503 });
  }
}
