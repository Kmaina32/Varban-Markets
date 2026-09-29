import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * @fileOverview Institutional News Proxy with Automated Firestore Caching.
 * Refined for high-impact trading headlines with multi-node redundancy.
 */

const CURRENTS_API_KEY = process.env.CURRENTS_NEWS_API_KEY;

// High-precision trading intelligence query
const DEFAULT_MARKET_QUERY = "(forex OR crypto OR 'stock forex trading' OR 'Donald Trump' OR 'Dangote Oil' OR 'US markets' OR 'Asian markets' OR 'European markets' OR commodities OR indices OR inflation)";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const queryParam = searchParams.get('query');
  const categoryParam = searchParams.get('category');
  
  let activeQuery = (queryParam && queryParam.trim().length > 1) ? queryParam.trim() : DEFAULT_MARKET_QUERY;
  
  // If a category is selected, refine the query
  if (categoryParam && categoryParam !== 'all') {
    activeQuery = `(${activeQuery}) AND ${categoryParam}`;
  }

  if (!CURRENTS_API_KEY) {
    return NextResponse.json({ 
      status: "500", 
      msg: "Configuration Error",
      details: { message: "Primary news intelligence key is missing." }
    }, { status: 500 });
  }

  try {
    const currentsUrl = new URL("https://api.currentsapi.services/v1/search");
    currentsUrl.searchParams.set('language', 'en');
    currentsUrl.searchParams.set('query', activeQuery);

    const res = await fetch(currentsUrl.toString(), {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${CURRENTS_API_KEY}`, 'Accept': 'application/json' },
      next: { revalidate: 600 } 
    });

    if (res.ok) {
      const data = await res.json();
      if (data.status === "ok" && data.news) {
        const { db } = initializeFirebase();
        
        const mappedNews = data.news.map((item: any) => ({
          uuid: item.id,
          title: item.title,
          published_at: item.published,
          publisher: item.author || 'Financial Press',
          description: item.description,
          url: item.url,
          image: item.image,
          category: Array.isArray(item.category) ? item.category : [item.category].filter(Boolean),
          syncedAt: new Date().toISOString()
        }));

        // Background synchronization with Firestore for internal reading
        // We use setDoc with merge: true to avoid duplicates and handle updates
        for (const article of mappedNews) {
          try {
            const cacheRef = doc(db, "news_cache", article.uuid);
            await setDoc(cacheRef, article, { merge: true });
          } catch (e) {
            console.error("Cache Sync Error:", e);
          }
        }

        return NextResponse.json({ data: mappedNews });
      }
    }

    return NextResponse.json({ status: "503", msg: "Upstream Error" }, { status: 503 });
  } catch (e) {
    return NextResponse.json({ status: "500", msg: "Internal Proxy Failure" }, { status: 500 });
  }
}
