
import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileOverview Secure Market Data Proxy.
 * Handles server-side requests to Twelve Data to protect API credentials.
 */

const TWELVE_DATA_KEY = "48SDEBM5X6L6WBVV"; // Note: In production, move this to process.env.TWELVE_DATA_API_KEY
const BASE_URL = "https://api.twelvedata.com";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'time_series';
  const symbol = searchParams.get('symbol');
  const interval = searchParams.get('interval') || '1min';
  const outputsize = searchParams.get('outputsize') || '300';

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol required' }, { status: 400 });
  }

  // Normalize symbol for Twelve Data (e.g. BTCUSD -> BTC/USD)
  let providerSymbol = symbol;
  if (symbol.length === 6 && !symbol.includes('/')) {
    providerSymbol = `${symbol.substring(0, 3)}/${symbol.substring(3, 6)}`;
  }

  const params = new URLSearchParams({
    symbol: providerSymbol,
    interval: interval,
    outputsize: outputsize,
    apikey: TWELVE_DATA_KEY,
    order: 'asc'
  });

  try {
    const endpoint = type === 'quote' ? 'quote' : 'time_series';
    const response = await fetch(`${BASE_URL}/${endpoint}?${params.toString()}`);
    const data = await response.json();

    if (data.status === 'error') {
      return NextResponse.json({ error: data.message }, { status: 429 });
    }

    // Normalize response for Varban Client
    if (type === 'quote') {
      return NextResponse.json({
        data: {
          price: parseFloat(data.price || data.close || "0"),
          change: parseFloat(data.change || "0"),
          changePercent: parseFloat(data.percent_change || "0"),
          open: parseFloat(data.open || "0"),
          high: parseFloat(data.high || "0"),
          low: parseFloat(data.low || "0"),
          volume: parseFloat(data.volume || "0"),
          status: 'Open',
          timestamp: Date.now()
        }
      });
    }

    const bars = (data.values || []).map((v: any) => ({
      time: new Date(v.datetime).getTime() / 1000,
      open: parseFloat(v.open),
      high: parseFloat(v.high),
      low: parseFloat(v.low),
      close: parseFloat(v.close),
      volume: parseFloat(v.volume || "0")
    }));

    return NextResponse.json({ data: bars });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Signal Failure' }, { status: 500 });
  }
}
