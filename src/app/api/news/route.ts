import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';

/**
 * @fileOverview Institutional News Proxy with Automated Firestore Caching.
 * Refined for high-impact trading headlines (Forex, Crypto, Stocks, Donald Trump, Dangote Oil).
 * Implements a robust "Fetch-and-Archive" protocol for internal analysis.
 */

// Provided API Key as fallback if environment variable is missing
const FALLBACK_KEY = "OSVWG7fkMI86yl-mRSR49GrBA2_SoY0SwcQ9_82d2n-e0CWZ";
const CURRENTS_API_KEY = process.env.CURRENTS_NEWS_API_KEY || FALLBACK_KEY;

// High-precision trading intelligence matrix
const DEFAULT_MARKET_QUERY = "(forex OR crypto OR 'stock forex trading' OR 'Donald Trump' OR 'Dangote Oil' OR 'Asian markets' OR 'US markets' OR 'European markets' OR commodities OR indices OR inflation)";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const queryParam = searchParams.get('query');
  const categoryParam = searchParams.get('category');
  
  let activeQuery = (queryParam && queryParam.trim().length > 1) ? queryParam.trim() : DEFAULT_MARKET_QUERY;
  
  // Refine query with category if selected
  if (categoryParam && categoryParam !== 'all') {
    activeQuery = `(${activeQuery}) AND ${categoryParam}`;
  }

  try {
    const currentsUrl = new URL("https://api.currentsapi.services/v1/search");
    currentsUrl.searchParams.set('language', 'en');
    currentsUrl.searchParams.set('query', activeQuery);

    const res = await fetch(currentsUrl.toString(), {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${CURRENTS_API_KEY}`,
        'Accept': 'application/json' 
      },
      next: { revalidate: 600 } 
    });

    if (!res.ok) {
      const errorData = await res.json();
      return NextResponse.json({ 
        status: res.status.toString(), 
        msg: "Upstream Node Error",
        details: errorData
      }, { status: res.status });
    }

    const data = await res.json();
    
    if (data.status === "ok" && data.news) {
      const mappedNews = data.news.map((item: any) => ({
        uuid: item.id,
        title: item.title,
        published_at: item.published,
        publisher: item.author || 'Financial Press',
        description: item.description,
        url: item.url,
        image: (item.image && item.image !== 'None') ? item.image : 'https://picsum.photos/seed/news/800/450',
        category: Array.isArray(item.category) ? item.category : [item.category].filter(Boolean),
        syncedAt: new Date().toISOString()
      }));

      // Background synchronization with Firestore
      // We initialize inside the check to ensure it only runs on valid news data
      try {
        const { db } = initializeFirebase();
        // Limit sync to top results for performance
        const syncItems = mappedNews.slice(0, 10);
        
        for (const article of syncItems) {
          const cacheRef = doc(db, "news_cache", article.uuid);
          await setDoc(cacheRef, article, { merge: true });
        }
      } catch (syncError) {
        console.warn("Intelligence Persistence Delay:", syncError);
        // We continue anyway so the feed is delivered even if DB write is slow
      }

      return NextResponse.json({ data: mappedNews });
    }

    return NextResponse.json({ 
      status: "200", 
      data: [], 
      msg: "No matching intelligence records found." 
    });

  } catch (e: any) {
    console.error("Critical News Proxy Failure:", e);
    return NextResponse.json({ 
      status: "500", 
      msg: "Internal Proxy Failure",
      error: e.message 
    }, { status: 500 });
  }
}
