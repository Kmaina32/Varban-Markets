import { NextRequest, NextResponse } from "next/server";
import { AuthError, verifyUser, VerifiedUser } from "@/app/lib/server/verify-admin";
import { loadSyntheticConfig, seriesFor } from "@/app/lib/server/synthetic-server";
import { MAX_CATCH_UP_TICKS } from "@/app/lib/synthetic/engine";

export const dynamic = "force-dynamic";

const MAX_RANGE = 900;

// Token checks go to Google, so remember a good result briefly (polling runs about once a second).
const seen = new Map<string, { user: VerifiedUser; until: number }>();
async function cachedUser(req: NextRequest): Promise<VerifiedUser> {
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const hit = token && seen.get(token);
  if (hit && hit.until > Date.now()) return hit.user;
  const user = await verifyUser(req);
  if (seen.size > 500) seen.clear();
  seen.set(token, { user, until: Date.now() + 60_000 });
  return user;
}

/**
 * GET /api/synthetic/ticks?symbol=V10&count=300     -> the latest ticks
 * GET /api/synthetic/ticks?symbol=V10&from=123&to=130 -> a specific range (never beyond "now")
 * The server clock decides what "now" is, and no future tick is ever returned.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await cachedUser(req);
    const cfgAll = await loadSyntheticConfig(user);
    const symbol = (req.nextUrl.searchParams.get("symbol") || "").toUpperCase();
    const cfg = cfgAll.indices[symbol];
    if (!cfg || !cfg.enabled) return NextResponse.json({ error: "This market is not available right now." }, { status: 404 });

    const nowMs = Date.now();
    const nowTick = Math.floor(nowMs / cfg.tickMs);
    if (nowTick - cfg.anchorTick > MAX_CATCH_UP_TICKS) {
      return NextResponse.json({ error: "This market needs to be re-started by an administrator." }, { status: 409 });
    }

    const q = req.nextUrl.searchParams;
    let to = Math.min(nowTick, Number(q.get("to")) || nowTick);
    let from: number;
    if (q.get("from")) from = Math.floor(Number(q.get("from")));
    else from = to - Math.min(MAX_RANGE, Math.max(1, Math.floor(Number(q.get("count")) || 300))) + 1;
    if (!Number.isFinite(from) || !Number.isFinite(to)) return NextResponse.json({ error: "Bad range." }, { status: 400 });
    from = Math.max(from, to - MAX_RANGE + 1);

    const ticks = seriesFor(cfg).range(from, to);
    return NextResponse.json(
      { symbol, tickMs: cfg.tickMs, nowTick, serverTime: nowMs, tradingEnabled: cfg.tradingEnabled, ticks },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e: any) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    if (e?.message === "ANCHOR_TOO_OLD") return NextResponse.json({ error: "This market needs to be re-started by an administrator." }, { status: 409 });
    return NextResponse.json({ error: "Could not load prices." }, { status: 500 });
  }
}
