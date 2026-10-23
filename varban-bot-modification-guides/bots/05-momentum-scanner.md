# Bot 5 — Multi-Market Momentum Scanner

## Purpose
Rank eligible instruments by recent momentum, trend alignment and volatility, then produce a signal for instruments that meet the configured rules. Ranking is not a promise that the top-ranked instrument will continue.

## Entry logic
- Calculate lookback return.
- Require price and moving-average alignment.
- Apply symbol eligibility, spread, data freshness and volatility checks.
- Set a volatility-adjusted stop and target.
- Rank candidates by a documented score and enforce portfolio correlation/exposure limits before order creation.

## Modify Bot fields
| Field | Type | Suggested default | Validation |
|---|---|---|---|
| Enabled / mode | Toggle / select | Off / Paper | Live requires readiness approval |
| Market groups | Multi-select | Selected groups | Only licensed/available instruments |
| Symbols / timeframes | Multi-select | User-selected | Provider-supported |
| Momentum lookback | Integer bars | 20 | 2–300 |
| Minimum absolute return | Percentage | 0.4% | Bounded per market |
| Fast EMA period | Integer | 20 | 2–200 |
| Slow EMA period | Integer | 50 | Must exceed fast; 5–500 |
| ATR period | Integer | 14 | 5–100 |
| Stop distance | Number, ATR | 1.5 | 0.5–5 ATR |
| Target distance | Number, ATR | 3.0 | 0.5–15 ATR |
| Maximum candidates per scan | Integer | 10 | 1–100 |
| Minimum liquidity / max spread | Instrument-specific | Provider-defined | Reject if data unavailable |
| Correlation limit | Number | Admin-defined | Must use calculated, timestamp-aligned returns |
| Max open positions | Integer | 3 | Cannot exceed platform-wide cap |
| Max trades per day | Integer | 3 per bot | 0–20 |
| Minimum reward/risk | Number | 1.5 | 1–10 |

## Natural-language examples
- “Scan forex and crypto on 15-minute and 1-hour timeframes.”
- “Raise the minimum momentum threshold from 0.4% to 0.7%.”
- “Limit the scanner to the top five candidates per scan.”
- “Reject any candidate if spread or fresh market data cannot be verified.”

## AI modification constraints
Momentum thresholds are not comparable across all asset classes without normalization. The AI must not apply a single assumed liquidity or volume rule to every market. Do not open correlated positions beyond the portfolio limit.

## Tests
- Correct return window and sign.
- Trend alignment required.
- Unsupported symbols excluded.
- Missing volume/spread data follows configured fail-safe policy.
- Ranking is deterministic for the same data.
- Correlated exposure and max-position limits are enforced.
