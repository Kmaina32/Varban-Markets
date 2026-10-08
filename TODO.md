
# Varban Markets — Development TODO & Missing Features Inventory

---

## 1. Non-Working / Static Buttons & Functional Triggers

### A. Security & Verification Pages (`/security`, `/verification`, `/account`)
- [x] **`/verification` Upload Buttons**: wired to trigger "Pending" status update and user notification alerts.
- [x] **`/security` "Change Password" Button**: Wired to Firebase Auth `sendPasswordResetEmail` flow.
- [x] **`/security` "Log Out Everywhere Else" Button**: Wired to force token refresh and remote session revocation UX.
- [ ] **`/security` 2FA Toggle**: Shows static "ON" badge without a TOTP QR code generator, secret key provisioning, or authenticator app setup workflow.
- [x] **`/account` Profile Edit Buttons**: Fully editable form fields for first name, middle name, last name, phone, and country with Firestore persistence & feedback.

### B. Trading Terminal (`/terminal`)
- [x] **One-Click Trading Toggle**: Toggle button bypasses the "Risk Pre-Verification" confirmation dialog for fast scalping. Highlighted in blue when active.
- [x] **Early Option Cashout / Sell Contract Button**: "Cashout 35%" button on active positions closes contract early, credits 35% of stake back to balance, marks position as earlyExit=true.
- [x] **Terminal Feature Tour**: Spotlight-driven tutorial system for high-speed execution modules.
- [x] **Native Detachment**: "Detach Chart" button (only visible in Native Windows App) pops chart into a new system window.
- [ ] **TradingView Technical Indicators Toolbar**: RSI, MACD, Moving Averages, and Bollinger Bands overlay controls are not wired to chart indicator controls.
- [ ] **Order Cancellation**: In `/orders`, there is no `[ Cancel Order ]` button to revoke active limit/stop orders before execution.

### C. Watchlist & Portfolio (`/watchlist`, `/portfolio`)
- [x] **Watchlist `Add Asset` Button**: Dynamic search modal to add new currency pairs/crypto to user's custom watchlist in Firestore directly on `/watchlist`.
- [x] **Watchlist `Remove Asset` Button**: Delete trigger to remove tracked instrument from Firestore collection.
- [x] **Export Trade History**: `[ Export CSV ]` helper and download trigger on `/history` page.
- [x] **Dashboard Feature Tour**: Spotlight-driven tutorial system for portfolio metrics and watchlist.

---

## 2. Unconnected & Missing Backend Features

### A. Real-Time Market Data Stream
- [x] **Server-Side News Proxy**: Secure server route for Currents API to prevent CORS errors and protect keys.
- [ ] **WebSocket Data Connection**: Price updates currently rely on polling every 3 seconds (`fetchLivePrice`). Need a live WebSocket connection (e.g. Binance / Polygon.io / Finnhub WS) for sub-second chart ticks.
- [ ] **Real Order Execution Matcher**: Automated option contract settlement is simulated client-side via `setTimeout` after 18 seconds. Needs a server-side Cloud Function / backend cron worker for authoritative price verification and payout settlement.

---

## 3. Windows Native App (Electron) Implementation Roadmap

- [x] **Native Build Pipeline**: Configured `electron-builder` in `package.json` for production-ready `.nsis` installers.
- [x] **Multi-Monitor Logic**: Implemented `command:detach-chart` IPC listener and window spawning for external displays.
- [x] **Biometric Bridge**: Connected `VarbanNative.requestBiometricAuth` to secure IPC handlers in the main process.
- [ ] **Auto-Update Node**: Setup an AWS S3 or R2 bucket for hosting the `latest.yml` file for background updates.
- [ ] **Code Signing**: Procure and integrate a Windows SSL Certificate for "Verified Publisher" status.

---

## 4. Prioritized Implementation Roadmap

1. **Phase 1 (Immediate)**: [COMPLETED] Wire `/verification` document upload and `/security` password change triggers.
2. **Phase 2**: [COMPLETED] Build `/admin/withdrawals` and `/admin/deposits` approval queues to process pending user cashier requests.
3. **Phase 3**: [COMPLETED] Add `/account` editable profile form, `/watchlist` dynamic Add Asset search modal, and `/history` CSV export.
4. **Phase 4**: [COMPLETED] Wire `/security` logout everywhere button, add terminal one-click trading toggle & early cashout, build `/admin/kyc-approvals` verification desk and `/admin/audit-logs` immutable event log.
5. **Phase 5 (Market Intelligence & UX)**: [COMPLETED] Build `/news` hub with server proxy, implement spotlight tutorials for Dashboard/Terminal, and enforce Zero-AI deterministic protocol.
6. **Phase 6**: Implement server-side Webhooks for Paystack & Crypto gateways.
7. **Phase 7**: Upgrade Terminal data pipeline to real-time WebSockets and server-side trade settlement workers.
8. **Phase 8**: [IN PROGRESS] Finalize Windows Native Application and distribution node.
