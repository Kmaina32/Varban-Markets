import { NextRequest, NextResponse } from "next/server";
import { verifyUser, AuthError } from "@/app/lib/server/verify-admin";
import { getPriceRange, DEFAULT_SYNTHETIC_CONFIGS } from "@/app/lib/synthetic/engine";

/**
 * @fileOverview Synthetic Tick Feed API.
 * Delivers deterministic prices to signed-in users.
 * Optimized range fetching.
 */

const SECRET = process.env.SYNTHETIC_ENGINE_SECRET || "dev_default_secret_key_varban";

export async function GET(req: NextRequest) {
  try {
    await verifyUser(req);
    
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol");
    const fromTick = parseInt(searchParams.get("from") || "0");
    const count = Math.min(parseInt(searchParams.get("count") || "100"), 900);

    if (!symbol) return NextResponse.json({ error: "Symbol required" }, { status: 400 });

    const config = DEFAULT_SYNTHETIC_CONFIGS[symbol];
    if (!config) return NextResponse.json({ error: "Market not found" }, { status: 404 });

    const now = Date.now();
    const currentTick = Math.floor(now / config.tickMs);

    // Limit fromTick to currentTick
    const startTick = Math.min(fromTick, currentTick);
    
    // Get optimized range
    const ticks = getPriceRange(SECRET, config, startTick, count)
      .filter(t => t.tick <= currentTick);

    return NextResponse.json({ 
      symbol,
      currentTick,
      ticks 
    });

  } catch (e: any) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error("[Synthetic API Error]:", e);
    return NextResponse.json({ error: "Feed node unreachable" }, { status: 500 });
  }
}
