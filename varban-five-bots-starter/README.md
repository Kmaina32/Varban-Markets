# Varban Markets — Five Strategy Engine Starter

This is an integration-ready TypeScript scaffold for five deterministic strategy modules, shared risk checks, a TradingView chart bridge, and unit tests.

## Safety status
- Live execution is **disabled** by default.
- `InternalExecutionAdapter` is an interface, not a real exchange/broker.
- `PaperExecutionAdapter` is a local simulation only.
- Do not enable live trading until a real order/position service, authenticated market-data feed, instrument specifications, server-side account authorization, kill switch, reconciliation, and independent backtest review are implemented.

## Strategies
1. `bmLiquiditySweep`: Asian-session range sweep, rejection, displacement and structure confirmation.
2. `trendContinuation`: EMA trend filter + pullback.
3. `breakoutRetest`: confirmed range breakout + retest.
4. `meanReversion`: Bollinger-style band + RSI extreme with trend guard.
5. `momentumScanner`: multi-market momentum ranking.

These are rule-based examples, not validated profitable strategies. The BM strategy follows the uploaded manual's process, but session times, supply/demand detection and structure-shift definitions must be configured and validated for the platform's data.

## Install
```bash
npm install
npm test
npm run typecheck
```

## Integrate into Varban Markets
- Mount the UI using `BotDashboard` or adapt its components to your existing design system.
- Feed closed candles from your authorized data provider into `evaluateStrategy`.
- Persist bot configs, signals, orders, positions and audit logs in your server-side database.
- Implement `InternalExecutionAdapter` against Varban's actual order-management service.
- Use a persistent worker/queue for continuous processing; do not rely on browser timers or short-lived serverless requests.
- Only allow live mode after all safety checks in `LiveExecutionGate` are satisfied.

## TradingView
`TradingViewBridge` sends strategy markers/levels to a chart adapter callback. TradingView chart libraries do not themselves supply all market data or execute trades. Use your licensed chart integration and a separate authorized data/execution backend. Never expose provider secrets in the browser.

## Default risk policy
Example conservative defaults: 0.25% equity risk per trade, 1% daily loss stop, 3 open positions, 3 trades per bot per day, 2:1 minimum reward/risk. These are configurable examples, not recommendations or guarantees.
