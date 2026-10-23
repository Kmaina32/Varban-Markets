# Coding-AI Prompt — Build the Modify Bot Form

You are a senior full-stack engineer working on Varban Markets, a professional trading platform. Implement a production-minded **Modify Bot** form for five rule-based bots. Follow the existing repository conventions and inspect the current code before editing. Do not replace unrelated pages or redesign the whole app.

## Bots
1. `bm-liquidity-sweep`
2. `trend-continuation`
3. `breakout-retest`
4. `mean-reversion`
5. `momentum-scanner`

Read the matching files under `bots/` for bot-specific fields and behaviour. Use `prompts/modify-bot-system-prompt.md` for AI constraints and `prompts/modify-bot-output-schema.json` for the response contract.

## Required UI
- A professional responsive form using the project's existing component library, styling and form-validation patterns.
- Sections: Identity/State, Markets, Strategy Settings, Risk Policy, AI Modification, Validation/Deployment.
- Generate strategy-specific fields from typed, versioned allowlist schemas. Do not accept arbitrary field names or arbitrary code.
- Market symbols and timeframes must come from verified platform metadata; show unsupported instruments as unavailable rather than assuming support.
- AI textarea: “Describe the behaviour you want to change”.
- Buttons: Generate Proposal, Apply Changes, Cancel, Reset to Saved Version, View Version History, Run Backtest, Start Paper Test. Only render actions that have real backend handlers; don't create decorative buttons.
- AI result shows summary, warnings, assumptions, exact before/after field diff and tests to run.
- User must explicitly confirm before saving an AI-proposed patch.
- Show pending/failed/success states and accessible error messages.
- Keep paper/backtest as defaults. Live mode is locked unless a server endpoint confirms every readiness check.

## API contract
Use these server endpoints, adapting to the project's existing routing conventions if necessary:
- GET `/api/bots`
- GET `/api/bots/:botId/config`
- POST `/api/bots/:botId/propose-change`
- POST `/api/bots/:botId/validate-change`
- POST `/api/bots/:botId/apply-change`
- POST `/api/bots/:botId/backtest`
- GET `/api/bots/:botId/versions`
- POST `/api/bots/:botId/promote`

If an endpoint does not exist, implement a clearly typed server route with auth, validation, rate limiting and audit logging, or label the feature as unavailable until backend support is added. Never fake a successful API call.

## Security requirements
- Server-side auth and authorization on every route.
- Enforce account ownership / role permissions.
- Validate AI JSON against the JSON Schema and a bot-specific allowlist on the server.
- Apply only known fields; reject unknown keys and wrong types/ranges.
- Keep provider credentials and AI keys server-side.
- AI cannot change global risk policy, account identity, order permissions, audit logging, kill switch, idempotency or live readiness.
- Never execute generated code, SQL, shell commands or natural-language instructions.
- Save a new immutable config version and audit event, using expected-version concurrency checks.
- Require stop-loss and valid stop/target geometry for trade-producing strategies.
- AI must not assert profitability or fabricate backtest results.
- Do not allow promotion to live until production order execution, market-data freshness, position reconciliation, duplicate-order protection, kill switch, instrument specs, audit logs, backtest review and demo soak tests are confirmed by the server.

## Deliverables
1. Implemented page/component and typed schema definitions.
2. Server-side proposal validation and apply-change flow.
3. Unit tests for form validation, AI response parsing, authorization and risk-policy immutability.
4. Clear list of any integration endpoints that still require the existing Varban internal trading engine.
5. Run the project's available lint, typecheck and test commands; report actual results, never claim tests passed without running them.
