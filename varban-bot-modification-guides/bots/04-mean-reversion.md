# Bot 4 — Mean Reversion

## Purpose
Look for a move back toward a statistical mean after price reaches an extreme and then re-enters a volatility band. This strategy can perform poorly in strong trends.

## Entry logic
Long:
1. Calculate rolling mean and standard deviation.
2. Prior completed candle closes below the lower band.
3. A new completed candle closes back inside the band.
4. RSI and trend-strength guards pass.
5. Target is normally the mean; stop is beyond the recent extreme plus a buffer.

Short is the inverse at the upper band.

## Modify Bot fields
| Field | Type | Suggested default | Validation |
|---|---|---|---|
| Enabled / mode | Toggle / select | Off / Paper | Live requires readiness approval |
| Symbols / timeframes | Multi-select | User-selected | Provider-supported |
| Band period | Integer | 20 | 5–200 |
| Band width | Number, standard deviations | 2.0 | 0.5–4 |
| RSI period | Integer | 14 | 2–100 |
| Long RSI threshold | Number | 35 | 5–50 |
| Short RSI threshold | Number | 65 | 50–95 |
| Trend guard | Toggle | On | Do not remove global risk gates |
| Trend threshold | Number, ATR-normalized | Calibrated | Positive, bounded |
| Stop model | Select | Beyond recent extreme | Allowlisted |
| Target model | Select | Rolling mean | Mean / fixed R / volatility target |
| Minimum reward/risk | Number | 1.5 | 1–10 |
| Max trades per day | Integer | 3 | 0–20 |
| Signal expiry | Minutes | 15 | 1–1440 |

## Natural-language examples
- “Use a 30-period band and 10-period RSI.”
- “Set the long RSI threshold to 30 and the short threshold to 70.”
- “Keep the trend guard enabled and target the rolling mean.”
- “Disable this strategy for instruments whose spread is greater than the configured limit.”

## AI modification constraints
AI must explain that extreme RSI or band touches are not sufficient by themselves. If the user asks to remove the trend guard, present the risk and require explicit confirmation; platform-wide protections remain non-removable.

## Tests
- Band re-entry required.
- RSI thresholds applied to the correct side.
- Strong-trend guard blocks entries.
- Zero standard deviation produces no signal.
- Mean target is correctly placed relative to entry.
- Gap, volatility spike and stale-data cases.
