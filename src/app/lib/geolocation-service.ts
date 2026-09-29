/**
 * @fileOverview Institutional Geolocation Service.
 * Uses browser-based geolocation (requiring permission) for coordinates,
 * and high-speed free endpoints for IP and Country resolution.
 */

export interface GeolocationData {
  ip: string;
  country_name: string;
  country_code: string;
  city: string;
  latitude: number;
  longitude: number;
  location?: {
    country_flag_emoji?: string;
    calling_code?: string;
  };
  security?: {
    threat_level: string;
  };
}

/**
 * Requests device permission and detects location using coordinates and IP.
 * Fallback to IP-only lookup if browser geolocation is denied.
 */
export async function detectLocation(): Promise<GeolocationData | null> {
  return new Promise(async (resolve) => {
    // 1. Concurrent fetch for IP (Always needed)
    let publicIp = "---";
    try {
      const ipRes = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipRes.json();
      publicIp = ipData.ip;
    } catch (e) {
      console.warn("IP lookup failed");
    }

    // 2. Check for Geolocation API support
    if (typeof window === 'undefined' || !navigator.geolocation) {
      return resolve(await fallbackIpLookup(publicIp));
    }

    // 3. Request Browser/Device Permission
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Reverse geocode to get country
          const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          const geoData = await geoRes.json();

          resolve({
            ip: publicIp,
            country_name: geoData.countryName,
            country_code: geoData.countryCode,
            city: geoData.city || geoData.locality,
            latitude,
            longitude,
            location: {
              country_flag_emoji: "", // Flag mapping happens UI side or via secondary lookup
              calling_code: ""
            },
            security: { threat_level: "low" }
          });
        } catch (err) {
          resolve(await fallbackIpLookup(publicIp));
        }
      },
      async () => {
        // Permission denied or error - fallback to network IP geolocation
        resolve(await fallbackIpLookup(publicIp));
      },
      { timeout: 5000 }
    );
  });
}

/**
 * Fallback service using IP-based geolocation (no permission needed)
 */
async function fallbackIpLookup(ip: string): Promise<GeolocationData | null> {
  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await res.json();
    if (data.error) return null;

    return {
      ip: data.ip,
      country_name: data.country_name,
      country_code: data.country_code,
      city: data.city,
      latitude: data.latitude,
      longitude: data.longitude,
      location: {
        country_flag_emoji: "",
        calling_code: data.country_calling_code?.replace('+', '')
      },
      security: { threat_level: "low" }
    };
  } catch (e) {
    return null;
  }
}
