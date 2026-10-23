# Bot 2 — Trend Continuation

## Purpose
Trade pullbacks that resume an established trend. A moving-average relationship is a filter, not a guarantee of future direction.

## Entry logic
Long candidate:
1. Fast EMA is above slow EMA.
2. Price pulls back toward the configured trend reference.
3. A completed candle confirms renewed upward movement, for example by closing above the prior candle high.
4. Stop and target are calculated and pass the shared risk gate.

Short candidate is the inverse.

## Modify Bot fields
| Field | Type | Suggested default | Validation |
|---|---|---|---|
| Enabled / mode | Toggle / select | Off / Paper | Live requires readiness approval |
| Symbols / timeframes | Multi-select | User-selected | Must be enabled by provider |
| Fast EMA period | Integer | 50 | 2–200 |
| Slow EMA period | Integer | 200 | Must exceed fast period; 10–500 |
| Pullback tolerance | Number, ATR | 0.35 | 0–3 ATR |
| Confirmation rule | Select | Close beyond previous candle | Allowlisted rule |
| ATR period | Integer | 14 | 5–100 |
| Stop model | Select | Beyond pullback swing | Allowlisted rule |
| Stop buffer | Number, ATR | 0.2 | 0–2 ATR |
| Target model | Select | Fixed R multiple | Fixed R / swing level / ATR multiple |
| Target R or ATR multiple | Number | 2 | 1–10 |
| Minimum reward/risk | Number | 1.5 | 1–10 |
| Max trades per day | Integer | 3 | 0–20 |
| Signal expiry | Minutes | 15 | 1–1440 |
| Spread/volatility filters | Numeric/toggle | Provider-defined | Enforce instrument units |

## Natural-language examples
- “Use EMA 20 and EMA 100 instead of EMA 50 and EMA 200.”
- “Require the pullback to come within 0.2 ATR of the fast EMA.”
- “Only accept signals when the confirmation candle closes above the previous high.”
- “Set the target to 2.5R but keep the shared risk limit unchanged.”

## AI modification constraints
The AI may adjust strategy parameters, symbols, timeframes and allowlisted entry/exit choices. It cannot increase risk beyond the platform's hard limits or remove the server-side risk gate.

## Tests
- Fast/slow EMA ordering for long and short.
- Insufficient candle history produces no signal.
- No entry when trend filter conflicts.
- Confirmation must occur on a completed candle.
- Stop/target direction and R:R validated.
- Test choppy, trending, gap and stale-data conditions.
