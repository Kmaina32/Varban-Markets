# Bot 3 — Breakout & Retest

## Purpose
Identify a close outside a recent consolidation boundary followed by a retest that holds or rejects the broken level.

## Entry logic
Long:
1. Calculate resistance from a configurable completed-candle lookback.
2. A candle closes above resistance.
3. A later candle retests resistance within a tolerance and closes back above it.
4. Optional volume/spread filters pass.
5. Stop, target and risk gate pass.

Short is the inverse at support. Avoid treating a wick alone as a confirmed breakout.

## Modify Bot fields
| Field | Type | Suggested default | Validation |
|---|---|---|---|
| Enabled / mode | Toggle / select | Off / Paper | Live requires readiness approval |
| Symbols / timeframes | Multi-select | User-selected | Provider-supported |
| Range lookback | Integer bars | 20 | 5–300 |
| Breakout confirmation | Select | Candle close beyond level | Allowlisted rule |
| Retest tolerance | Number, ATR | 0.2 | 0–2 ATR |
| Retest expiry | Integer bars | 5 | 1–50 |
| Minimum breakout distance | Number, ATR | 0.1 | 0–3 ATR |
| Volume filter | Toggle | Off unless reliable volume exists | Must use provider-supported volume |
| Relative volume threshold | Number | 1.2 | 0.5–10 when enabled |
| Stop model | Select | Beyond retest swing | Allowlisted rule |
| Target model | Select | Fixed 2R | Fixed R / measured range / swing |
| Target R | Number | 2 | 1–10 |
| Minimum reward/risk | Number | 1.5 | 1–10 |
| Max trades per day | Integer | 3 | 0–20 |
| Signal expiry | Minutes | 15 | 1–1440 |

## Natural-language examples
- “Increase the range lookback to 40 candles.”
- “Require the retest within 0.15 ATR and expire it after three candles.”
- “Enable the volume filter only for symbols with reliable volume data.”
- “Reject breakouts if the close is less than 0.2 ATR beyond resistance.”

## AI modification constraints
Do not allow AI to fabricate volume for FX or synthetic instruments. If volume is unavailable or not meaningful, disable the volume filter and disclose why. Do not silently change the target or stop model.

## Tests
- Close beyond boundary required.
- Retest must happen within expiry.
- False breakout closing back inside range rejected.
- Volume unavailable is handled safely.
- Duplicate setup is suppressed.
- Gap and high-spread scenarios are rejected when configured.
