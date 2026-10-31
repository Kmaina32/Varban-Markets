
import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileOverview Finnhub Webhook Handler.
 * Receives and acknowledges real-time market data events and news updates.
 * Security: Validates the X-Finnhub-Secret header to ensure authenticity.
 */

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-finnhub-secret');
  
  // Set FINNHUB_WEBHOOK_SECRET in the Vercel project settings.
  const VALID_SECRET = process.env.FINNHUB_WEBHOOK_SECRET;

  if (!VALID_SECRET || secret !== VALID_SECRET) {
    console.warn("Unauthorized Webhook Attempt: Invalid Finnhub Secret Header");
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = await req.json();

    // Log the event for administrative auditing
    // In a production environment, this would trigger position settlements or news alerts
    console.log(`[Webhook Received] Finnhub Event: ${payload.type || 'unknown'}`);

    // REQUIRED: Return 2xx status code instantly to acknowledge receipt
    return NextResponse.json({ 
      status: 'acknowledged',
      timestamp: Date.now()
    }, { status: 200 });

  } catch (error) {
    console.error("Webhook processing error:", error);
    // Always acknowledge if the request reached our server and secret was valid
    return NextResponse.json({ status: 'error' }, { status: 200 });
  }
}

/**
 * Handle GET requests (ping) from Finnhub if they perform health checks
 */
export async function GET() {
  return NextResponse.json({ status: 'active', platform: 'Varban Markets' }, { status: 200 });
}
