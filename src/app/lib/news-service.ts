/**
 * @fileOverview Institutional News Data Service.
 * Interfaces with the internal News Proxy with expanded error telemetry.
 */

export interface NewsItem {
  uuid: string;
  title: string;
  published_at: string;
  publisher: string;
  description?: string;
  url?: string;
  image?: string;
  category?: string[];
}

export interface NewsResponse {
  data?: NewsItem[];
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Fetches recent news articles from the platform news proxy.
 * Implements granular error parsing for the UI layer.
 * @param query Optional search term for specific assets or topics.
 */
export async function fetchMarketNews(query?: string): Promise<NewsResponse> {
  try {
    const endpoint = `/api/news${query ? `?query=${encodeURIComponent(query)}` : ''}`;
    const res = await fetch(endpoint);
    const json = await res.json();
    
    if (!res.ok) {
      return {
        error: {
          code: json.status || res.status.toString(),
          message: json.msg || "Unable to synchronize news feed."
        }
      };
    }
    
    return { data: json.data || [] };
  } catch (error) {
    console.error("News Synchronization Failed:", error);
    return {
      error: {
        code: "CONNECTION_FAILURE",
        message: "Failed to establish a secure link with the news node."
      }
    };
  }
}
