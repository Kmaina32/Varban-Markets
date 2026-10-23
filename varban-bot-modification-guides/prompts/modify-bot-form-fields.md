# Modify Bot Form — Fields and UX Specification

## Form layout
Use a two-column desktop layout and a single-column mobile layout. Keep the form compact, professional and consistent with Varban Markets' trading terminal. Avoid decorative emojis, gradients that reduce readability, and ambiguous labels.

### Section A — Identity and state
- Bot name (read-only unless renamed through a separate permission)
- Bot strategy / description (read-only)
- Enabled toggle
- Trading mode: Backtest / Paper
- Live mode: locked status with readiness checklist; only server-authorized users can request promotion
- Configuration version and last modified timestamp

### Section B — Markets
- Market category multi-select: XAUUSD, Forex, Crypto, Stocks, Indices, Synthetic indices
- Symbols multi-select populated from the authenticated market-data provider
- Timeframes multi-select populated from supported provider intervals
- Session timezone selector where applicable (IANA timezone, provider timezone shown)
- Session start/end where strategy needs a session

Never allow a user to type arbitrary instrument symbols and assume they are tradeable. A symbol must resolve to a verified platform instrument record.

### Section C — Strategy settings
Render bot-specific fields from a versioned allowlist schema. Field widgets:
- Boolean: toggle/checkbox
- Enum: select
- Integer: numeric input with min/max/step
- Decimal: numeric input with units and precision
- Time/timezone: validated time controls
- Symbol/timeframe: provider-backed multi-select
- Text: only for notes; not for executable logic

Show helper text, units, defaults, permitted range and validation message for each field. Do not expose internal fields or accept unknown keys.

### Section D — Risk settings (show effective policy)
- Risk per trade (% of equity): default 0.25%, hard cap from server policy (starter cap 0.5%)
- Minimum reward/risk
- Max trades per bot per day
- Max open positions (read-only if global)
- Daily loss limit (read-only if global)
- Max spread / slippage (instrument-specific)
- Stop-loss required: always on for automated entries
- Take-profit policy
- Correlation/exposure limit for multi-market bot
- Kill-switch status (display only; user cannot disable it through AI)
- Clear note that these are risk controls, not guarantees

Do not allow the bot's own config to raise a global maximum or weaken account-level restrictions.

### Section E — AI modification
- Prompt label: “Describe the behaviour you want to change”
- Multiline textarea, placeholder: “Example: Require 1.2 ATR displacement and cap this bot at two trades per day.”
- Optional “Apply to” select: this bot only / selected instruments, if supported
- “Generate proposal” button
- AI result panel: summary, assumptions, warnings, fields changed, tests/backtests recommended
- Before/after diff for every field
- “Apply changes” and “Cancel” buttons
- Never auto-save an AI proposal without explicit confirmation

### Section F — Validation and deployment
- Schema validation status
- Data/instrument compatibility status
- Unit test status
- Backtest required status
- Paper-test status
- Config version created
- Promotion approval status
- Live readiness checklist from server, not AI

## Save workflow
1. Load current config and schema from server.
2. User changes fields manually or asks AI to propose a patch.
3. AI response is validated server-side against the schema and hard risk policy.
4. UI presents exact before/after diff and warnings.
5. User confirms.
6. Server saves immutable config version and audit event.
7. Run tests/backtest; paper mode remains the default.
8. Promotion requires a separate permission and server-side readiness gate.

## API proposal
- `GET /api/bots` — bots the authenticated user can access
- `GET /api/bots/:botId/config` — current config and schema
- `POST /api/bots/:botId/propose-change` — AI proposal; no persistence
- `POST /api/bots/:botId/validate-change` — server validation
- `POST /api/bots/:botId/apply-change` — authenticated, authorized, confirmed patch; creates a new version
- `POST /api/bots/:botId/backtest` — queues a backtest job
- `GET /api/bots/:botId/versions` — config version history
- `POST /api/bots/:botId/promote` — separate gated promotion workflow; never a direct AI action

Every endpoint must verify session, role, ownership, CSRF protections where applicable, schema and rate limits. Apply-change must use optimistic concurrency (`expectedVersion`) to prevent overwriting a newer config.
