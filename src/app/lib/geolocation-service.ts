/**
 * @fileOverview Institutional Geolocation Service.
 * Interfaces with the internal geolocation proxy to provide location intelligence.
 * Strictly adheres to the IPstack detailed schema for Location and Language metadata.
 */

export interface Language {
  code: string;
  name: string;
  native: string;
}

export interface LocationData {
  geoname_id: number;
  capital: string;
  languages: Language[];
  country_flag: string;
  country_flag_emoji: string;
  country_flag_emoji_unicode: string;
  calling_code: string;
  is_eu: boolean;
}

export interface GeolocationData {
  ip: string;
  hostname?: string;
  type: string;
  continent_code: string;
  continent_name: string;
  country_code: string;
  country_name: string;
  region_code: string;
  region_name: string;
  city: string;
  zip: string;
  latitude: number;
  longitude: number;
  location: LocationData;
  time_zone?: {
    id: string;
    current_time: string;
    gmt_offset: number;
    code: string;
    is_daylight_saving: boolean;
  };
  currency?: {
    code: string;
    name: string;
    plural: string;
    symbol: string;
    symbol_native: string;
  };
  security?: {
    is_proxy: boolean;
    proxy_type: string | null;
    is_crawler: boolean;
    crawler_name: string | null;
    crawler_type: string | null;
    is_tor: boolean;
    threat_level: string;
    threat_types: string[] | null;
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
    
    // Validate required fields based on IPstack success response
    if (data.ip && data.location) {
      return data as GeolocationData;
    }
    
    return null;
  } catch (error) {
    console.warn("Geolocation handshake failed:", error);
    return null;
  }
}
