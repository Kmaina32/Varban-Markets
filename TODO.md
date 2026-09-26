# Varban Markets — Development TODO & Missing Features Inventory

> [!NOTE]
> This document tracks all non-working buttons, static components, unconnected backend features, missing pages, and pending functional integrations in the Varban Markets repository.

---

## 1. Non-Working / Static Buttons & Functional Triggers

### A. Security & Verification Pages (`/security`, `/verification`, `/account`)
- [x] **`/verification` Upload Buttons**: wired to trigger "Pending" status update and user notification alerts.
- [x] **`/security` "Change Password" Button**: Wired to Firebase Auth `sendPasswordResetEmail` flow.
- [ ] **`/security` "Log Out Everywhere Else" Button**: Button is un-wired to session invalidation / token revoke backend service.
- [ ] **`/security` 2FA Toggle**: Shows static "ON" badge without a TOTP QR code generator, secret key provisioning, or authenticator app setup workflow.
- [ ] **`/account` Profile Edit Buttons**: No editable form fields or `updateProfile` triggers for changing display name, phone number, or address.

### B. Trading Terminal (`/terminal`)
- [ ] **One-Click Trading Toggle**: Missing toggle button to bypass the "Risk Pre-Verification" confirmation dialog for fast scalping.
- [ ] **Early Option Cashout / Sell Contract Button**: Missing ability to close active binary option position prior to expiry for a partial payout refund.
- [ ] **TradingView Technical Indicators Toolbar**: RSI, MACD, Moving Averages, and Bollinger Bands overlay controls are not wired to chart indicator controls.
- [ ] **Order Cancellation**: In `/orders`, there is no `[ Cancel Order ]` button to revoke active limit/stop orders before execution.

### C. Watchlist & Portfolio (`/watchlist`, `/portfolio`)
- [ ] **Watchlist `Add Asset` Button**: Dynamic search modal to add new currency pairs/crypto to user's custom watchlist in Firestore.
- [ ] **Watchlist `Remove Asset` Button**: Delete trigger to remove tracked instrument from Firestore collection.
- [ ] **Export Trade History**: `[ Export CSV ]` and `[ Download PDF ]` buttons on `/history` and `/transactions` pages.

---

## 2. Unconnected & Missing Backend Features

### A. Real-Time Market Data Stream
- [ ] **WebSocket Data Connection**: Price updates currently rely on polling every 3 seconds (`fetchLivePrice`). Need a live WebSocket connection (e.g. Binance / Polygon.io / Finnhub WS) for sub-second chart ticks.
- [ ] **Real Order Execution Matcher**: Automated option contract settlement is simulated client-side via `setTimeout` after 18 seconds. Needs a server-side Cloud Function / backend cron worker for authoritative price verification and payout settlement.

### B. Automated Financial Gateways & Webhooks
- [ ] **Paystack Webhook Verification**: Auto-confirm card deposits via server-side HTTP webhooks rather than client callback reliance.
- [ ] **Blockchain Gateway Webhooks**: Automated crypto deposit confirmations (NOWPayments / CoinPayments / Alchemy API webhooks) to credit user balances upon block confirmations without admin manual check.
- [ ] **Bank Transfer Routing API**: Instant automated fiat bank payout integration via Paystack Transfers API instead of logging pending tickets.

### C. User Authentication & Multi-Session Management
- [ ] **Email Verification Enforcement**: Require email link confirmation before enabling live capital deposits or trading.
- [ ] **Active Session Tracker**: Dynamic session table reading active IP addresses, user-agent strings, and login timestamps from Firebase Auth/Firestore.

---

## 3. Missing Pages & Routes

### A. Client Side Pages
- [ ] **`/kyc-submit`**: Dedicated document upload wizard with webcam selfie verification & ID capture.
- [ ] **`/p2p`**: Peer-to-peer fiat-crypto OTC exchange desk with escrow protection.
- [ ] **`/copy-trading`**: Strategy provider leaderboard, copy-trade allocation form, and performance analytics.
- [ ] **`/tournaments`**: Live trading contests, leaderboard standings, prize pools, and registration portal.
- [ ] **`/referral`**: Affiliate link generator, commission dashboard, referral tree tracker, and reward claiming.

### B. Admin Portal Sub-Pages
- [ ] **`/admin/withdrawals`**: Admin queue to review, approve, reject, or batch-process pending crypto and fiat withdrawal requests.
- [ ] **`/admin/deposits`**: Admin panel to inspect submitted TxHashes, verify on-chain balances, and credit user accounts.
- [ ] **`/admin/kyc-approvals`**: Document verification desk to review submitted user passports and utility bills.
- [ ] **`/admin/risk-limits`**: Dynamic control panel for global platform settings (max leverage, option return percentages, payout caps, maintenance modes).
- [ ] **`/admin/audit-logs`**: Immutable security log of all admin actions, balance adjustments, and platform alerts.

---

## 4. Prioritized Implementation Roadmap

1. **Phase 1 (Immediate)**: [COMPLETED] Wire `/verification` document upload and `/security` password change triggers.
2. **Phase 2**: Build `/admin/withdrawals` and `/admin/deposits` approval queues to process pending user cashier requests.
3. **Phase 3**: Implement server-side Webhooks for Paystack & Crypto gateways.
4. **Phase 4**: Upgrade Terminal data pipeline to real-time WebSockets and server-side trade settlement workers.
