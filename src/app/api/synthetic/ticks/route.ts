import { NextRequest, NextResponse } from "next/server";
import { verifyUser, AuthError } from "@/app/lib/server/verify-admin";
import { getPriceAtTick, DEFAULT_SYNTHETIC_CONFIGS } from "@/app/lib/synthetic/engine";

/**
 * @fileOverview Synthetic Tick Feed API.
 * Delivers deterministic prices to signed-in users.
 * Limits response to 900 ticks per request.
 */

const SECRET = process.env.SYNTHETIC_ENGINE_SECRET || "dev_default_secret_key_varban";

export async function GET(req: NextRequest) {
  try {
    await verifyUser(req);
    
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol");
    const fromTick = parseInt(searchParams.get("from") || "0");
    const count = Math.min(parseInt(searchParams.get("count") || "100"), 900);

    const config = DEFAULT_SYNTHETIC_CONFIGS[symbol];
    if (!config) return NextResponse.json({ error: "Market not found" }, { status: 404 });

    const now = Date.now();
    const currentTick = Math.floor(now / config.tickMs);

    const ticks = [];
    for (let i = 0; i < count; i++) {
      const tickIdx = fromTick + i;
      if (tickIdx > currentTick) break;
      
      ticks.push({
        tick: tickIdx,
        price: getPriceAtTick(SECRET, config, tickIdx),
        time: tickIdx * config.tickMs
      });
    }

    return NextResponse.json({ 
      symbol,
      currentTick,
      ticks 
    });

  } catch (e: any) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Feed node unreachable" }, { status: 500 });
  }
}
