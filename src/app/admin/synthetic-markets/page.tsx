'use client';

/**
 * @fileOverview Admin: the algorithm that runs our own indices (Volatility 10-100).
 * Admins set how big the price moves are, any trend, how often prices update, the house margin,
 * stake limits and contract lengths. They never set individual prices or outcomes: the price path
 * is generated on the server from a secret key, and contract payouts are worked out from the true
 * chance of winning plus the margin set here.
 */

import { useEffect, useMemo, useState } from 'react';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';
import { Activity, Save, Loader2, RefreshCw, Info } from 'lucide-react';
import AuthedLayout from '@/components/layout/AuthedLayout';
import { Card } from '@/components/ui/card';
import { useUser, useFirestore } from '@/firebase';
import { useSyntheticConfig, useSyntheticFeed } from '@/app/lib/synthetic/use-synthetic-feed';
import { mergeSyntheticConfig, quote, SyntheticIndexConfig, DEFAULT_SYNTHETIC_CONFIG } from '@/app/lib/synthetic/engine';
import { cn } from '@/app/lib/utils';

const label = 'text-xs font-bold text-[#0A0A0A] block mb-1';
const input = 'w-full text-sm px-3 py-2.5 bg-[#F7F7F5] border border-[#E4E4E4] focus:outline-none focus:border-[#0055FF]';
const help = 'text-[11px] text-[#6B7280] mt-1 leading-snug';

function Toggle({ on, onChange, text, hint }: { on: boolean; onChange: (v: boolean) => void; text: string; hint: string }) {
  return (
    <button type="button" onClick={() => onChange(!on)} className="flex items-start gap-3 text-left w-full" aria-pressed={on}>
      <span className={cn('mt-0.5 w-10 h-6 rounded-full shrink-0 p-0.5 transition-colors', on ? 'bg-[#16835B]' : 'bg-[#D1D5DB]')}>
        <span className={cn('block w-5 h-5 bg-white rounded-full transition-transform shadow', on && 'translate-x-4')} />
      </span>
      <span>
        <span className="text-sm font-bold text-[#0A0A0A] block">{text}</span>
        <span className={help}>{hint}</span>
      </span>
    </button>
  );
}

function IndexCard({ saved }: { saved: SyntheticIndexConfig }) {
  const { user } = useUser();
  const db = useFirestore();
  const feed = useSyntheticFeed(saved.symbol, true);
  const [draft, setDraft] = useState<SyntheticIndexConfig>(saved);
  const [durations, setDurations] = useState(saved.durationsTicks.join(', '));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Pick up changes saved elsewhere, but never overwrite what the admin is typing.
  const savedKey = JSON.stringify(saved);
  useEffect(() => { setDraft(saved); setDurations(saved.durationsTicks.join(', ')); }, [savedKey]);

  const dirty = useMemo(() => {
    const parsed = durations.split(',').map((x) => Number(x.trim())).filter((n) => n > 0);
    return JSON.stringify({ ...draft, durationsTicks: parsed }) !== JSON.stringify(saved);
  }, [draft, durations, saved]);

  const set = <K extends keyof SyntheticIndexConfig>(k: K, v: SyntheticIndexConfig[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const numField = (k: keyof SyntheticIndexConfig) => (e: React.ChangeEvent<HTMLInputElement>) => set(k, Number(e.target.value) as any);

  const needsRestart = !!feed.error && /re-started/i.test(feed.error);
  const tickSpeedChanged = draft.tickMs !== saved.tickMs;

  // Example prices so the admin can see what the margin does.
  const exampleRise = quote('RISE', 0, 5, mergeSyntheticConfig({ indices: { [saved.symbol]: draft } }).indices[saved.symbol], feed.latest?.p);
  const exampleMatch = quote('MATCH', 5, 5, draft);

  const save = async (restart = false) => {
    if (!db || !user || busy) return;
    setBusy(true);
    setMsg(null);
    try {
      const parsed = durations.split(',').map((x) => Math.round(Number(x.trim()))).filter((n) => n >= 1 && n <= 3600);
      const clean = mergeSyntheticConfig({ indices: { [saved.symbol]: { ...draft, durationsTicks: parsed } } }).indices[saved.symbol];
      const now = Date.now();
      // Re-anchor at the live price so the chart never jumps when settings change.
      const anchorPrice = restart || !feed.latest ? DEFAULT_SYNTHETIC_CONFIG.indices[saved.symbol].anchorPrice : feed.latest.p;
      const next: SyntheticIndexConfig = { ...clean, anchorTick: Math.floor(now / clean.tickMs), anchorPrice };
      await setDoc(
        doc(db, 'settings', 'synthetic_markets'),
        { indices: { [saved.symbol]: next }, updatedAt: new Date(now).toISOString(), updatedBy: user.email || '' },
        { merge: true }
      );
      await addDoc(collection(db, 'adminLogs'), {
        timestamp: new Date(),
        adminEmail: user.email || '--',
        actionType: restart ? 'SYNTHETIC_MARKET_RESTART' : 'SYNTHETIC_MARKET_UPDATE',
        targetUser: saved.symbol,
        details: `${saved.symbol}: volatility ${next.volatility}, trend ${next.driftPctPerHour}%/h, tick ${next.tickMs}ms, margin ${next.houseEdgePct}%, trading ${next.tradingEnabled ? 'on' : 'off'}, visible ${next.enabled ? 'yes' : 'no'}`,
        status: 'Success',
      });
      setMsg({ ok: true, text: restart ? 'Market restarted.' : 'Saved. New settings are live for everyone now.' });
    } catch {
      setMsg({ ok: false, text: 'Could not save. Check that you are signed in as an administrator and try again.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="bg-white border-[#E4E4E4] shadow-sm overflow-hidden">
      <div className="p-4 md:p-5 border-b border-[#E4E4E4] flex flex-wrap items-center justify-between gap-3 bg-[#F7F7F5]">
        <div>
          <h3 className="text-base font-bold text-[#0A0A0A]">{saved.name}</h3>
          <p className="text-xs text-[#6B7280]">{saved.symbol}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-[#6B7280]">Live price</p>
          <p className="text-xl font-bold font-mono text-[#0055FF]">{feed.latest ? feed.latest.p.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '—'}</p>
        </div>
      </div>

      <div className="p-4 md:p-5 space-y-5">
        {feed.error && (
          <p role="alert" className="p-3 text-xs bg-[#C43D3D]/5 border border-[#C43D3D]/30 text-[#C43D3D] font-bold flex flex-wrap items-center gap-3">
            {feed.error}
            {needsRestart && (
              <button onClick={() => save(true)} disabled={busy} className="px-3 py-1.5 bg-[#0055FF] text-white hover:bg-[#0044cc]">Restart this market</button>
            )}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Toggle on={draft.enabled} onChange={(v) => set('enabled', v)} text="Show in the terminal" hint="Switch off to hide this market from everyone." />
          <Toggle on={draft.tradingEnabled} onChange={(v) => set('tradingEnabled', v)} text="Allow new trades" hint="Switch off to pause buying. The chart keeps running and running trades still finish." />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className={label} htmlFor={`${saved.symbol}-vol`}>Price swings (volatility)</label>
            <input id={`${saved.symbol}-vol`} type="number" min={1} max={300} step={1} className={input} value={draft.volatility} onChange={numField('volatility')} />
            <p className={help}>How big the moves are. Higher means bigger, faster moves. 1 to 300.</p>
          </div>
          <div>
            <label className={label} htmlFor={`${saved.symbol}-drift`}>Trend (% per hour)</label>
            <input id={`${saved.symbol}-drift`} type="number" min={-5} max={5} step={0.1} className={input} value={draft.driftPctPerHour} onChange={numField('driftPctPerHour')} />
            <p className={help}>0 keeps the price neutral. Payouts adjust by themselves so a trend is never a loophole.</p>
          </div>
          <div>
            <label className={label} htmlFor={`${saved.symbol}-tick`}>New price every</label>
            <select id={`${saved.symbol}-tick`} className={input} value={draft.tickMs} onChange={(e) => set('tickMs', Number(e.target.value))}>
              {[500, 1000, 2000, 5000].map((ms) => <option key={ms} value={ms}>{ms / 1000} {ms === 1000 ? 'second' : 'seconds'}</option>)}
            </select>
            {tickSpeedChanged && <p className="text-[11px] text-[#C9A227] font-bold mt-1">Changing this refunds any trade still running.</p>}
          </div>
          <div>
            <label className={label} htmlFor={`${saved.symbol}-edge`}>House margin (%)</label>
            <input id={`${saved.symbol}-edge`} type="number" min={1} max={20} step={0.5} className={input} value={draft.houseEdgePct} onChange={numField('houseEdgePct')} />
            <p className={help}>The share of stakes the platform keeps on average over many trades. 1 to 20.</p>
          </div>
          <div>
            <label className={label} htmlFor={`${saved.symbol}-min`}>Smallest stake ($)</label>
            <input id={`${saved.symbol}-min`} type="number" min={0.35} step={0.5} className={input} value={draft.minStake} onChange={numField('minStake')} />
          </div>
          <div>
            <label className={label} htmlFor={`${saved.symbol}-max`}>Largest stake ($)</label>
            <input id={`${saved.symbol}-max`} type="number" min={1} step={10} className={input} value={draft.maxStake} onChange={numField('maxStake')} />
          </div>
          <div>
            <label className={label} htmlFor={`${saved.symbol}-cap`}>Biggest payout multiple</label>
            <input id={`${saved.symbol}-cap`} type="number" min={1.1} max={50} step={0.5} className={input} value={draft.maxPayoutMultiplier} onChange={numField('maxPayoutMultiplier')} />
            <p className={help}>Upper limit on what a single win can pay per $1 staked.</p>
          </div>
          <div className="sm:col-span-2">
            <label className={label} htmlFor={`${saved.symbol}-dur`}>Contract lengths (in ticks)</label>
            <input id={`${saved.symbol}-dur`} className={input} value={durations} onChange={(e) => setDurations(e.target.value)} />
            <p className={help}>Separate with commas, for example 1, 5, 10, 30, 60.</p>
          </div>
        </div>

        <div className="p-3 bg-[#0055FF]/5 border border-[#0055FF]/20 text-xs text-[#0A0A0A] space-y-1">
          <p className="flex items-center gap-2 font-bold"><Info className="w-4 h-4 text-[#0055FF]" /> What players will see with these settings</p>
          <p>A $10 Rise over 5 ticks pays back ${exampleRise.allowed ? (10 * exampleRise.payoutMultiplier).toFixed(2) : '—'}. A $10 Matches bet pays ${exampleMatch.allowed ? (10 * exampleMatch.payoutMultiplier).toFixed(2) : '—'}.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => save(false)}
            disabled={!dirty || busy}
            className="inline-flex items-center gap-2 px-5 py-3 bg-[#0055FF] text-white text-sm font-bold hover:bg-[#0044cc] disabled:opacity-40 transition-colors"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save changes
          </button>
          <button
            onClick={() => { if (confirm('Restart this market from its starting price? Trades still running will be refunded.')) save(true); }}
            disabled={busy}
            className="inline-flex items-center gap-2 px-4 py-3 border border-[#E4E4E4] text-[#6B7280] text-sm font-bold hover:border-[#0055FF] hover:text-[#0055FF] transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Restart market
          </button>
          {msg && <p role="status" className={cn('text-xs font-bold', msg.ok ? 'text-[#16835B]' : 'text-[#C43D3D]')}>{msg.text}</p>}
        </div>
      </div>
    </Card>
  );
}

export default function SyntheticMarketsAdminPage() {
  const { config, loading } = useSyntheticConfig();
  return (
    <AuthedLayout title="Our own markets" subtitle="Volatility indices">
      <div className="max-w-5xl mx-auto space-y-6 pb-16">
        <div>
          <h2 className="text-xl font-bold text-[#0A0A0A] flex items-center gap-2"><Activity className="w-5 h-5 text-[#0055FF]" /> Our own markets</h2>
          <p className="text-sm text-[#6B7280] mt-1 max-w-2xl leading-relaxed">
            These are the Volatility indices we run ourselves. You control how they behave and what they pay. Prices are made on the server and
            cannot be seen in advance, and every payout is worked out from the true chance of winning plus the margin you set, so changes here stay fair to players.
          </p>
        </div>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#6B7280]" /></div>
        ) : (
          Object.values(config.indices).map((c) => <IndexCard key={c.symbol} saved={c} />)
        )}
      </div>
    </AuthedLayout>
  );
}
