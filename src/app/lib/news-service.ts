
/**
 * @fileOverview Institutional News Data Service.
 * Interfaces with the internal News Proxy to fetch real-time financial headlines.
 */

export interface NewsItem {
  uuid: string;
  title: string;
  published_at: string;
  publisher: string;
}

/**
 * Fetches recent news articles from the platform news proxy.
 * This prevents CORS errors and protects the API keys by keeping them on the server.
 * @param query Optional search term for specific assets or topics.
 */
export async function fetchMarketNews(query?: string): Promise<NewsItem[]> {
  try {
    // Use relative URL to hit our Next.js API route
    const endpoint = `/api/news${query ? `?query=${encodeURIComponent(query)}` : ''}`;
    
    const res = await fetch(endpoint);
    
    if (!res.ok) {
      const errorData = await res.json();
      console.warn("News Proxy Response Error:", errorData);
      return [];
    }
    
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error("News Synchronization Failed:", error);
    return [];
  }
}
