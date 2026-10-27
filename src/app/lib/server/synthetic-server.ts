import { firebaseConfig } from "@/firebase/config";
import { DEFAULT_SYNTHETIC_CONFIG, mergeSyntheticConfig, PriceSeries, keyFromSecret, SyntheticConfig, SyntheticIndexConfig } from "../synthetic/engine";
import { AuthError, VerifiedUser } from "./verify-admin";

/**
 * @fileOverview Server-only helpers for the synthetic markets: the secret key,
 * the admin-controlled settings, and cached price paths.
 */

export function engineKey(): number {
  const secret = process.env.SYNTHETIC_ENGINE_SECRET;
  if (secret && secret.length >= 16) return keyFromSecret(secret);
  if (process.env.NODE_ENV !== "production") {
    // Local development only. Never used in a production build.
    return keyFromSecret("varban-local-development-secret");
  }
  throw new AuthError("Synthetic markets are not switched on yet. The server secret has not been set.", 503);
}

type FsValue = any;
function fromFs(v: FsValue): any {
  if (v == null) return null;
  if ("stringValue" in v) return v.stringValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return v.doubleValue;
  if ("booleanValue" in v) return v.booleanValue;
  if ("timestampValue" in v) return v.timestampValue;
  if ("nullValue" in v) return null;
  if ("arrayValue" in v) return (v.arrayValue.values ?? []).map(fromFs);
  if ("mapValue" in v) return Object.fromEntries(Object.entries(v.mapValue.fields ?? {}).map(([k, x]) => [k, fromFs(x)]));
  return null;
}

let cached: { at: number; cfg: SyntheticConfig } | null = null;
const CONFIG_TTL_MS = 3000;

/** Admin settings, read with the caller's own token so Firestore rules still apply. */
export async function loadSyntheticConfig(user: VerifiedUser): Promise<SyntheticConfig> {
  if (cached && Date.now() - cached.at < CONFIG_TTL_MS) return cached.cfg;

  if (process.env.NODE_ENV !== "production" && process.env.SYNTHETIC_CONFIG_JSON) {
    const cfg = mergeSyntheticConfig(JSON.parse(process.env.SYNTHETIC_CONFIG_JSON));
    cached = { at: Date.now(), cfg };
    return cfg;
  }

  let res: Response;
  try {
    res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/settings/synthetic_markets`,
      { headers: { Authorization: `Bearer ${user.idToken}` }, cache: "no-store" }
    );
  } catch {
    throw new AuthError("The market settings could not be loaded. Please try again.", 503);
  }
  let cfg: SyntheticConfig;
  if (res.status === 404) cfg = mergeSyntheticConfig(DEFAULT_SYNTHETIC_CONFIG);
  else if (res.ok) {
    const doc = await res.json();
    cfg = mergeSyntheticConfig(Object.fromEntries(Object.entries(doc?.fields ?? {}).map(([k, v]) => [k, fromFs(v as FsValue)])));
  } else throw new AuthError("The market settings could not be loaded. Please try again.", 503);

  cached = { at: Date.now(), cfg };
  return cfg;
}

const series = new Map<string, PriceSeries>();

/** Price path for one index, reused until the admin changes its settings. */
export function seriesFor(cfg: SyntheticIndexConfig): PriceSeries {
  const sig = [cfg.symbol, cfg.volatility, cfg.driftPctPerHour, cfg.tickMs, cfg.anchorTick, cfg.anchorPrice].join("|");
  let s = series.get(sig);
  if (!s) {
    if (series.size > 40) series.clear();
    s = new PriceSeries(cfg, engineKey());
    series.set(sig, s);
  }
  return s;
}
