import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * @fileOverview Institutional News Proxy (Currents API Integration).
 * Enhanced with mandatory Firestore persistence for the Analyze Full Report workspace.
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
        'Authorization': `${CURRENTS_API_KEY}`, // currents API standard
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

    const { db } = initializeFirebase();
    const mappedData = mapNews(data.news);

    // CRITICAL: Await persistence in serverless route to ensure data availability for /news/[id]
    await Promise.all(mappedData.map(async (article: any) => {
      try {
        await setDoc(doc(db, "news_cache", article.uuid), {
          ...article,
          syncedAt: new Date().toISOString()
        }, { merge: true });
      } catch (e) {
        // Log locally but don't halt the primary feed response
        console.warn("Failed to persist article to cache ledger:", article.uuid);
      }
    }));

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
