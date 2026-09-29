import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * @fileOverview Institutional News Proxy (Currents API Integration).
 * Enhanced with automated Firestore persistence for full report analysis.
 */

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');
  
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
        'Authorization': `Bearer ${CURRENTS_API_KEY}`,
        'Accept': 'application/json'
      },
      next: { revalidate: 600 }
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Upstream node reported an error' }, { status: res.status });
    }

    const data = await res.json();
    
    if (data.status !== "ok" || !data.news) {
      return NextResponse.json({ data: [] });
    }

    const { db } = initializeFirebase();

    // Mapping and persistence logic
    const mappedData = data.news.map((item: any) => ({
      uuid: item.id,
      title: item.title,
      published_at: item.published,
      publisher: item.author || 'Financial Press',
      description: item.description,
      url: item.url,
      image: item.image,
      category: item.category
    }));

    // Background persistence to Firestore
    // This allows the /news/[id] page to find the article even if the API feed changes
    Promise.all(mappedData.map(async (article: any) => {
      try {
        await setDoc(doc(db, "news_cache", article.uuid), {
          ...article,
          syncedAt: new Date().toISOString()
        }, { merge: true });
      } catch (e) {
        console.warn("Failed to persist article to cache ledger:", article.uuid);
      }
    }));

    return NextResponse.json({ data: mappedData });
  } catch (error) {
    console.error("News Proxy Handshake Failure:", error);
    return NextResponse.json({ error: 'Internal server handshake failure' }, { status: 500 });
  }
}