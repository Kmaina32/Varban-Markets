
# Varban Markets — Development TODO & Missing Features Inventory

---

## 1. Non-Working / Static Buttons & Functional Triggers

### A. Security & Verification Pages (`/security`, `/verification`, `/account`)
- [x] **`/verification` Upload Buttons**: Wired to trigger "Pending" status update and user notification alerts.
- [x] **`/security` "Change Password" Button**: Wired to Firebase Auth `sendPasswordResetEmail` flow.
- [x] **`/security` "Log Out Everywhere Else" Button**: Wired to force token refresh and remote session revocation UX.
- [x] **Account Hub Integration**: Consolidated profile, security, and display settings into `/account`.
- [ ] **`/security` 2FA Toggle**: Currently shows a static "ON" badge. Needs a TOTP QR code generator, secret key provisioning, and a full authenticator app setup workflow.
- [x] **Investor Profile**: Mandatory 12-field regulatory questionnaire with Firestore persistence.

### B. Trading Terminal (`/terminal`)
- [ ] **One-Click Trading Toggle**: Needs a UI switch to bypass the "Risk Pre-Verification" confirmation dialog for high-frequency execution.
- [ ] **Early Option Cashout**: The "Close" button in the portfolio manager needs to implement the 35% stake refund logic and mark positions as `earlyExit=true`.
- [x] **Terminal Feature Tour**: Spotlight-driven tutorial system for high-speed execution modules.
- [x] **Universal Clock**: Real-time clock with selectable timezone persistence (UTC-8 to UTC+8).
- [ ] **TradingView Technical Indicators Toolbar**: RSI, MACD, Moving Averages, and Bollinger Bands overlay controls are not yet wired to direct chart indicator controls.

### C. Watchlist & Portfolio (`/watchlist`, `/portfolio`)
- [x] **Watchlist `Add Asset` Button**: Dynamic search modal to add new currency pairs/crypto to user's custom watchlist.
- [x] **Watchlist `Remove Asset` Button**: Delete trigger to remove tracked instrument from the persistent registry.
- [x] **Export Trade History**: `[ Export CSV ]` helper and download trigger on `/history` page.
- [x] **Portfolio Visualization**: Real-time asset allocation and performance curve placeholders.

---

## 2. Unconnected & Missing Backend Features

### A. Real-Time Market Data Stream
- [x] **Multi-Source Failover Proxy**: Secure server route with Coinbase CDP, Twelve Data, and Alpha Vantage failover nodes.
- [ ] **WebSocket Data Connection**: Price updates currently rely on polling every 3 seconds (`fetchLivePrice`). Need a live WebSocket connection (e.g. Binance / Polygon.io WS) for sub-second chart ticks.
- [ ] **Real Order Execution Matcher**: Option contract settlement is simulated client-side. Needs a server-side Cloud Function / backend cron worker for authoritative price verification and payout settlement.

### B. Global Accessibility & SEO
- [x] **Multilingual Protocol**: Full i18n support for 5 global languages (EN, FR, ES, PT, ZH-CN).
- [x] **SEO Metadata Matrix**: Granular metadata and sitelink optimization for all primary landing and auth nodes.
- [x] **Institutional AI Assistant**: Localized, context-aware chatbot using Genkit and Gemini.

---

## 3. Windows Native App (Electron) Implementation Roadmap

- [x] **Native Build Pipeline**: Configured `electron-builder` for production-ready `.nsis` installers.
- [x] **Multi-Monitor Logic**: Implemented `command:detach-chart` IPC listener and window spawning.
- [x] **Biometric Bridge**: Connected `VarbanNative.requestBiometricAuth` for simulated Windows Hello handshakes.
- [ ] **Auto-Update Node**: Setup an AWS S3 or R2 bucket for hosting the `latest.yml` file for background updates.
- [ ] **Code Signing**: Procure and integrate a Windows SSL Certificate for "Verified Publisher" status.

---

## 4. Prioritized Implementation Roadmap

1. **Phase 1 (Identity & Core)**: [COMPLETED] Firebase migration, KYC upload, and security triggers.
2. **Phase 2 (Administration)**: [COMPLETED] Admin withdrawal/deposit queues and user authority management.
3. **Phase 3 (Workspace)**: [COMPLETED] Watchlist management, CSV export, and localized AI Assistant.
4. **Phase 4 (Redesign & SEO)**: [COMPLETED] Institutional White design system, SEO metadata matrix, and System Registry documentation.
5. **Phase 5 (Performance)**: [IN PROGRESS] Implement authentic TOTP 2FA, wire one-click trading, and finalize terminal logic.
6. **Phase 6 (Infrastructure)**: Upgrade to real-time WebSockets and server-side settlement workers.
7. **Phase 7 (Native)**: Finalize Windows Native Application distribution and auto-update node.

*Status: Phase 5 - Execution Hardening.*
