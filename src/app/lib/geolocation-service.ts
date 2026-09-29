/**
 * @fileOverview Institutional Geolocation Service.
 * Interfaces with the internal geolocation proxy to provide location intelligence.
 */

export interface GeolocationData {
  ip: string;
  continent_name: string;
  country_name: string;
  country_code: string;
  region_name: string;
  city: string;
  zip: string;
  latitude: number;
  longitude: number;
  location?: {
    country_flag: string;
    country_flag_emoji: string;
    calling_code: string;
  };
  security?: {
    is_proxy: boolean;
    threat_level: string;
  };
}

/**
 * Detects the current session's geographical location using IP intelligence.
 * Returns null if the service is unavailable or the request fails.
 */
export async function detectLocation(): Promise<GeolocationData | null> {
  try {
    const res = await fetch('/api/geolocation');
    if (!res.ok) return null;
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.warn("Geolocation handshake failed:", error);
    return null;
  }
}
