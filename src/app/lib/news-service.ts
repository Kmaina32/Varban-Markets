/**
 * @fileOverview Institutional News Data Service.
 * Interfaces with the Free News API to fetch real-time financial headlines.
 */

const NEWS_API_KEY = "e4a3422407487dd7ddce70f77e0ea1c94fb32d41cf941c02d7bc4e8605a52e7f";
const BASE_URL = "https://api.freenewsapi.io/v1";

export interface NewsItem {
  uuid: string;
  title: string;
  published_at: string;
  publisher: string;
}

/**
 * Fetches recent news articles from the Free News API.
 * Optimized for financial relevance by searching specific market keywords if no query is provided.
 * @param query Optional search term for specific assets or topics.
 */
export async function fetchMarketNews(query?: string): Promise<NewsItem[]> {
  try {
    // Search only in title for higher relevance as per API documentation
    let url = `${BASE_URL}/news?language=en&order_by=recent`;
    
    if (query && query.length > 2) {
      // Handle pairs like BTC/USD or symbols with slashes
      const cleanQuery = query.split('/')[0].trim();
      url += `&in_title=${encodeURIComponent(cleanQuery)}`;
    } else {
      // Default to general financial market context if no specific asset is requested
      url += `&in_title=${encodeURIComponent('Fed Market Stocks Gold Crypto')}`;
    }
    
    const res = await fetch(url, {
      headers: {
        'x-api-key': NEWS_API_KEY
      },
      next: { revalidate: 300 } // Cache for 5 minutes (300 seconds)
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      console.warn("News API response error:", errorData);
      return [];
    }
    
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error("News synchronization failed:", error);
    return [];
  }
}
