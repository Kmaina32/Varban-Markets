# Varban Markets — Bot Modification Guides

This documentation defines how users can modify the five Varban Markets strategy bots through a **Modify Bot** form assisted by AI.

## Files
- `bots/01-bm-liquidity-sweep.md` — BM Liquidity Sweep
- `bots/02-trend-continuation.md` — Trend Continuation
- `bots/03-breakout-retest.md` — Breakout & Retest
- `bots/04-mean-reversion.md` — Mean Reversion
- `bots/05-momentum-scanner.md` — Multi-Market Momentum Scanner
- `prompts/modify-bot-system-prompt.md` — system prompt for the AI modification assistant
- `prompts/modify-bot-form-fields.md` — suggested form fields, validation and UX
- `prompts/modify-bot-output-schema.json` — proposed structured AI output contract
- `prompts/modify-bot-form-ai-prompt.md` — prompt to give a coding AI to implement the form

## Product principles
1. The AI proposes a **configuration change**, not arbitrary code execution.
2. Show a before/after diff and plain-language explanation before applying a change.
3. Validate values on the server, not only in the browser.
4. Never let AI disable global risk controls, authorization, the kill switch, audit logs, or execution safety gates.
5. Changes to strategy logic require versioning, tests and backtesting before promotion.
6. Live execution must remain locked until the production execution service and all readiness checks have been implemented and verified.
7. Keep the AI away from secrets, API keys, raw SQL, shell commands and direct database writes.
8. Store the user's natural-language request, proposed configuration, approver, validation result and resulting version in an audit log.

## Recommended user workflow
1. Open a bot and select **Modify Bot**.
2. Edit structured fields or describe the desired behaviour in plain language.
3. AI returns a typed configuration patch plus explanation, warnings and tests to run.
4. Server validates patch against the bot's allowlisted schema and risk policy.
5. UI shows a diff; user confirms or cancels.
6. Save a new configuration version. Run backtest, then paper trading.
7. Promote to live only if a human with appropriate permissions approves and all server-side live-readiness gates pass.

## Important
These guides describe strategy behaviour and configuration. They do not promise returns or establish that any strategy is profitable. The BM manual-derived strategy is a proposed implementation of the manual's concepts; the exact session timezone and definitions must be confirmed against Varban's actual market-data source.
