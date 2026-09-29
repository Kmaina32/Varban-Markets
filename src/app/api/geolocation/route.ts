import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileOverview IPstack Geolocation Proxy.
 * Detects the requester's IP address and retrieves accurate location data.
 * Securely consumes the IPSTACK_API_KEY from environment variables.
 */

const IPSTACK_KEY = process.env.IPSTACK_API_KEY || "8f76637049449f193798939c3866164d"; // Fallback placeholder

export async function GET(req: NextRequest) {
  if (!IPSTACK_KEY) {
    return NextResponse.json({ 
      error: 'Geolocation provider not configured',
      status: '500'
    }, { status: 500 });
  }

  try {
    // requester lookup endpoint
    const url = `https://api.ipstack.com/check?access_key=${IPSTACK_KEY}&security=1`;
    
    const res = await fetch(url, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    const data = await res.json();

    if (data.success === false) {
      return NextResponse.json({ 
        error: data.error.info || 'Upstream provider error',
        code: data.error.code
      }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Geolocation Node Failure:", error);
    return NextResponse.json({ 
      error: 'Internal Geolocation Failure',
      details: error.message 
    }, { status: 500 });
  }
}
