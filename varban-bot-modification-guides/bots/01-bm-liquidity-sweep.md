# Bot 1 — BM Liquidity Sweep

## Purpose
Identify a possible reversal after price sweeps a defined session range boundary, rejects the move, displaces, and confirms a short-term market-structure shift.

This bot is based on the concepts in the BM Simple Strategy manual: session range, liquidity sweep, supply/demand context, displacement, market-structure confirmation, planned invalidation and risk discipline. Do not claim a setup is guaranteed. A sweep or structure shift can fail.

## Supported configuration
- Enabled / paused
- Trading mode: backtest, paper; live only after server-side readiness approval
- Instruments and allowed timeframes
- Session definition and timezone
- Range lookback / session range boundaries
- Sweep buffer in ticks or ATR fraction
- Displacement threshold
- Structure confirmation lookback
- Stop buffer
- Target model and minimum reward/risk
- Maximum signals/trades per day
- Signal expiry
- Optional filters: spread, volatility, session days

## Entry logic
### Long candidate
1. Calculate the configured session range high and low from completed candles.
2. Price trades below the range low by the configured sweep buffer.
3. A completed candle closes back above the range low, showing rejection.
4. Bullish displacement meets the configured ATR threshold.
5. A defined bullish structure confirmation occurs, such as a close above recent swing highs.
6. The resulting entry, stop and target pass risk validation.

### Short candidate
Apply the inverse logic above the session high: sweep, close back below, bearish displacement, bearish structure confirmation, then risk validation.

No entry should be generated from an unclosed candle unless the user explicitly selects an intrabar mode and the engine supports/reconciles it safely. Closed-candle processing is the recommended default.

## Exits
- Stop: beyond the sweep extreme plus configured buffer.
- Target: select one allowed model, such as opposite side of session range, session midpoint, fixed R multiple, or a validated swing level.
- Optional break-even/trailing rules must be explicitly configured and tested.
- Cancel a pending signal if it expires or the setup is invalidated before execution.

## Modify Bot form fields
| Field | Type | Suggested default | Validation |
|---|---|---|---|
| Bot name | Text | BM Liquidity Sweep | 3–48 chars |
| Enabled | Toggle | Off | Permission required to enable |
| Mode | Select | Paper | Live hidden/locked until readiness checks pass |
| Symbols | Multi-select | XAUUSD | Only enabled provider symbols |
| Timeframes | Multi-select | 5m, 15m | Provider-supported intervals |
| Session timezone | IANA timezone | Provider timezone | Must be valid IANA timezone |
| Session start / end | Time | Admin-configured | Start differs from end; handle overnight sessions |
| Range method | Select | Session high/low | Allowlisted methods only |
| Range lookback | Integer bars | 24 | 8–300 |
| Sweep buffer | Number | 0.1 ATR | 0–2 ATR |
| Displacement threshold | Number | 0.8 ATR | 0.1–5 ATR |
| Structure lookback | Integer bars | 4 | 2–30 |
| Stop buffer | Number | 0.15 ATR | 0–2 ATR |
| Target model | Select | Opposite range boundary | Allowlisted target methods |
| Fixed target R | Number | 2.0 | 1–10 when fixed-R selected |
| Minimum reward/risk | Number | 1.5 | 1–10 |
| Max trades per day | Integer | 3 | 0–20 |
| Signal expiry | Minutes | 15 | 1–1440 |
| Max spread | Number/ticks | Provider-defined | Must be compatible with instrument |
| Allowed weekdays | Multi-select | Weekdays | At least one day |
| Notes | Text | Empty | Max 500 chars |

## Natural-language examples
- “Require a stronger displacement of at least 1.2 ATR and keep every other setting unchanged.”
- “Use the opposite side of the session range as the target, but reject any setup below 2:1 reward-to-risk.”
- “Only scan XAUUSD on 5-minute and 15-minute candles during the configured London session.”
- “Reduce the maximum number of trades to two per day.”

## What AI may change
Only fields in the allowlisted bot schema. AI must return a patch and explain its impact. It must not change account equity, broker permissions, position ownership, the global kill switch, or the server's live-execution gate.

## Validation and tests
- Session timezone and daylight-saving handling.
- No use of incomplete candles by default.
- Sweep must cross a range boundary and close back inside.
- Displacement and structure confirmation must both be satisfied.
- Stops are on the correct side of entry.
- Target is on the correct side of entry and meets minimum R:R.
- Duplicate signals for the same instrument/timeframe/candle are suppressed.
- Test long, short, no-sweep, false-breakout and missing-data cases.
