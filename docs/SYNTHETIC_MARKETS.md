# Building Our Own Volatility and Derived Markets

How Varban's own indices (Volatility 10, 25, 50, 75, 100) and the contracts traded on them work, how to run them, and what is still to build. Written to match the code in this repo.

---

## 1. What we built

| Piece | What it does | Where |
|---|---|---|
| Price engine | Makes the price of each index, one tick at a time | `src/app/lib/synthetic/engine.ts` |
| Server secret and settings | Holds the secret key, reads admin settings | `src/app/lib/server/synthetic-server.ts` |
| Price feed API | Gives signed-in users the ticks that have already happened | `src/app/api/synthetic/ticks/route.ts` |
| Live feed hook | Loads history, then pulls each new tick | `src/app/lib/synthetic/use-synthetic-feed.ts` |
| Contracts | Buying, settling and refunding (practice account) | `src/app/lib/synthetic/contracts.ts` |
| Practice wallet | The practice balance, kept in the browser | `src/app/lib/demo-wallet.ts` |
| Trade ticket | Rise/Fall, Even/Odd, Over/Under, Matches/Differs | `src/components/terminal/DerivedTradeControls.tsx` |
| Chart | Live tick line and candles | `src/components/terminal/SyntheticChart.tsx` |
| Digit stats | Last digit of the latest 100 prices | `src/components/terminal/DigitStats.tsx` |
| Trades list | Running and finished trades | `src/components/terminal/ContractsPanel.tsx` |
| Phone drawers | Order drawer and Trades drawer | `src/components/terminal/BottomSheet.tsx`, `src/app/client/terminal/page.tsx` |
| Admin page | Controls for each index | `src/app/admin/synthetic-markets/page.tsx` |

---

## 2. The golden rules

1. **Admins control the algorithm, never the outcome.** They set how big the moves are, any trend, how fast prices update, the house margin, stake limits and contract lengths. There is no control to set a price or to change the result of a trade. Anything like that would be rigging, and it would break the trust and the licence conditions the business depends on.
2. **Prices are made on the server, and nobody can see ahead.** The secret key never leaves the server, and the feed refuses to return any tick that has not happened yet.
3. **Payouts come from maths, not from a fixed table.** Every payout is worked out from the true chance of winning plus the admin's house margin. This closes loopholes such as paying a flat 85% on a bet that wins 90% of the time.
4. **Every price can be recomputed.** The same secret, index and tick number always give the same price, so any contract can be checked later.

---

## 3. The price engine

### 3.1 The price path

Each index is a random walk. Tick `n` is made from tick `n-1`:

```
price[n] = round2( price[n-1] * exp( drift - sigma^2/2 + sigma * z[n] ) )
```

- `z[n]` is a standard normal number made from a keyed hash of `(secret, tick number)` using Box-Muller.
- `sigma` per tick = `(volatility / 100) * sqrt(tickSeconds / secondsPerYear)`. So "Volatility 100" means about 100% a year.
- `drift` per tick = `(driftPctPerHour / 100) * tickSeconds / 3600`.
- Prices are rounded to 2 decimals. Carrying the rounded value forward removes any tiny maths differences between machines.

### 3.2 Ticks and time

- Tick number = `floor(serverTimeMs / tickMs)`. The **server clock** decides what "now" is.
- Default tick is 1 second. Admins can choose 0.5, 1, 2 or 5 seconds.

### 3.3 Anchors (why the chart never jumps)

Each index starts from an `anchorTick` and `anchorPrice`. When an admin saves new settings, the admin page re-anchors at the live price, so the chart carries on smoothly with the new behaviour.

- The server keeps a saved price every 4096 ticks, so asking for the last few minutes is fast.
- If an index has not been restarted for about 20 million ticks (around 230 days at 1 tick a second), the server returns "needs to be re-started" and the admin page shows a **Restart** button.

### 3.4 Starting prices

| Index | Volatility | Start price |
|---|---|---|
| V10 | 10 | 6,000 |
| V25 | 25 | 2,400 |
| V50 | 50 | 1,200 |
| V75 | 75 | 600,000 |
| V100 | 100 | 1,000 |

Change these in `DEFAULT_SYNTHETIC_CONFIG` in `engine.ts`. Keep the price high enough that a normal move is bigger than the 0.01 price step, or the chart will look blocky at low volatility.

---

## 4. Contracts

A contract is a bet with a fixed length measured in ticks. The **entry price** is the latest tick when you buy. The **exit price** is the tick `entry + length`.

| Contract | You win if | Chance of winning |
|---|---|---|
| Rise | exit price is higher than entry | about 50% (adjusted for trend and ties) |
| Fall | exit price is lower than entry | about 50% (adjusted for trend and ties) |
| Even | last digit of the exit price is even | 50% |
| Odd | last digit is odd | 50% |
| Over *d* | last digit is greater than *d* | (9 - d) / 10 |
| Under *d* | last digit is less than *d* | d / 10 |
| Matches *d* | last digit equals *d* | 10% |
| Differs *d* | last digit is not *d* | 90% |

"Last digit" means the second decimal of the price, for example 1,008.83 gives 3.

A flat finish (exit equals entry) loses for both Rise and Fall. The pricing takes the chance of an exact tie out of both sides.

### 4.1 Pricing

```
payout multiplier = (1 - houseEdge) / probabilityOfWinning     (capped at the admin's maximum)
```

The multiplier is the total paid back per $1 staked, including the stake. With a 4% margin, Even pays 1.92x and Matches pays 9.5x (the cap).

Over 9 and Under 0 can never win, so they are not offered.

### 4.2 Testing results

The engine was tested over 200,000 ticks:

- The price moves matched the intended size (ratio 1.00).
- Last digits were evenly spread (about 10% each).
- Return to player was 96.1% on Rise and 95.9% on Over 3, against 96% expected with a 4% margin.

---

## 5. Admin controls

Page: `/admin/synthetic-markets`. Settings are saved in Firestore at `settings/synthetic_markets`. Signed-in users can read them, only admins can write them.

| Control | What it does |
|---|---|
| Show in the terminal | Hides the market from everyone |
| Allow new trades | Pauses buying; the chart and running trades carry on |
| Price swings (volatility) | Size of the moves, 1 to 300 |
| Trend (% per hour) | Pushes the price up or down over time, -5 to 5; payouts adjust automatically |
| New price every | 0.5, 1, 2 or 5 seconds |
| House margin (%) | Share of stakes the platform keeps on average, 1 to 20 |
| Smallest and largest stake | Limits per contract |
| Biggest payout multiple | Upper limit on a single win |
| Contract lengths | List of lengths in ticks, for example `1, 5, 10, 30, 60` |
| Restart market | Starts again from the starting price; trades still running are refunded |

Every save writes an entry to `adminLogs` with the admin's email and the new values.

Changing the tick speed or restarting means trades still running cannot be matched to a price, so they are **refunded** after about two minutes.

---

## 6. Security model

- **Secret key.** `SYNTHETIC_ENGINE_SECRET` is a server environment variable (16 or more characters). It is never sent to the browser and never saved in Firestore. In production, if it is missing the feed returns "not switched on". A fixed development key is used only when `NODE_ENV` is not `production`.
- **Feed.** `GET /api/synthetic/ticks` needs a signed-in user (Firebase ID token). It returns at most 900 ticks per request and never returns a tick after the current one.
- **Settings.** The server reads the admin settings using the caller's own token, so Firestore rules still apply. Every value is clamped by `mergeSyntheticConfig`, so a bad or tampered document cannot break the engine.
- **Rotating the key.** Changing the secret changes every future price. Do it only together with a restart of all markets, and only when no trades are running.

---

## 7. Setting it up

1. Add `SYNTHETIC_ENGINE_SECRET` (a long random string) in Vercel for Production and Preview, then redeploy.
2. Deploy `firestore.rules` (the existing `settings/{id}` rule already fits: signed-in read, admin write).
3. Sign in as an admin, open **Our Own Markets**, and press **Save changes** once on each index. This writes the first settings and anchors each index.
4. Open the terminal, pick V10 to V100, switch to the practice account and place a test trade.

Local development works without setting the secret. To test with your own settings without Firestore, set `SYNTHETIC_CONFIG_JSON` in the environment (ignored in production).

---

## 8. Practice account today, real money next

**Today:** contracts run on the practice account. The practice balance and the trades list are kept in the browser. Settlement uses the server's price for the exit tick. The ticket tells real-money users that these markets are practice-only for now.

**Why not real money yet:** `firestore.rules` stops users changing their own `balance` and `equity`, which is correct. That means a browser cannot pay out a win. Real money needs the server to do the buying and settling.

### 8.1 What to build for real money

1. **Server credentials.** Add a Firebase service account (for example `FIREBASE_SERVICE_ACCOUNT` env variable) and the Admin SDK on the server.
2. **Buy endpoint** `POST /api/derived/buy`. Check the user, the account status (setup finished), the stake limits, the market is open and the balance. Then, in one Firestore transaction, take the stake off `balance` and create `users/{uid}/positions/{id}` with entry tick, entry price, contract type, digit, length, payout multiplier and the margin used. The **server** picks the entry tick and price; never trust the browser for them.
3. **Settle endpoint or job** `POST /api/derived/settle`. For every open contract whose exit tick has passed, recompute the exit price on the server, decide win or loss, and in one transaction mark the position settled and pay out. Run it from a scheduled function every few seconds, and also when the user opens the terminal, so a closed browser never leaves a trade hanging.
4. **Ledger.** Write a `transactions` entry for each stake and each payout, so the platform ledger always balances.
5. **Rules.** Make `positions` read-only for users (`allow read`, no `write`) once the server owns them.
6. **Limits.** Add per-user and per-market exposure caps (maximum open stake, maximum loss per day) and a platform-wide cap so a lucky streak cannot empty the pool.
7. **Reconciliation.** A daily report: stakes in, payouts out, actual margin against the configured margin, per index.

Build in this order: server credentials, buy, settle, ledger, rules, limits, then switch the ticket's `practiceOnly` flag off for approved accounts.

---

## 9. Testing

- **Engine.** Check that the same secret and tick always give the same price, that a different secret gives different prices, that random access gives the same price as stepping, and that the long-run return to player matches `1 - houseEdge`.
- **Feed.** Check that a future range returns no ticks, a disabled market returns 404, a missing login returns 401 and a request for 5,000 ticks returns 900.
- **Admin.** Save a change and confirm the chart carries on without a jump; change the tick speed and confirm a running trade is refunded.
- **Phone.** At 390px wide, check the chart fills the screen, **Trade** opens the drawer, **Trades** opens the trades drawer, dragging the handle down closes it, and the buy buttons stay in reach.

---

## 10. Known limits

- Practice balance and trades live in the browser, so clearing site data resets them.
- Prices have 2 decimals; very low volatility on a low-priced index can look blocky.
- A market must be restarted by an admin after about 230 days.
- The browser clock is used to estimate "now" in a few admin steps; the server clock always decides prices.
- Rise/Fall pricing uses a normal-distribution approximation. It matched the simulation within 0.1% in testing.

---

## 11. Before going live with real money

- Offering binary-style and synthetic products to retail clients is regulated in many places. Check the licence you hold and the countries you serve before launching real-money trading on these markets.
- Publish plain rules: how prices are made, the house margin, and how contracts are settled.
- Consider publishing the settled price list (tick number and price) a day after it happens, so players can verify results.
- Add responsible-trading tools: stake limits, loss limits and cool-off periods.
