# Varban Markets — Development TODO & Missing Features Inventory

---

## 1. Non-Working / Static Buttons & Functional Triggers

### A. Security & Verification Pages (`/security`, `/verification`, `/account`)
- [x] **Phone Verification**: [COMPLETED] Twilio Verify OTP handshake active.
- [x] **2FA Toggle**: Functional with mandatory verified phone requirement.
- [x] **Identity Verification**: [COMPLETED] Multi-step KYC pipeline with client-side liveness checks.
- [x] **Account Hub**: Consolidated profile, security, and display settings into `/client/account`.
- [x] **Investor Profile**: Mandatory 12-field regulatory questionnaire with Firestore persistence.

### B. Trading Terminal (`/terminal`)
- [ ] **One-Click Trading Toggle**: Needs a UI switch to bypass the "Risk Pre-Verification" confirmation dialog for high-frequency execution.
- [ ] **Early Option Cashout**: The "Close" button in the portfolio manager needs to implement the 35% stake refund logic and mark positions as `earlyExit=true`.
- [x] **Terminal Feature Tour**: Spotlight-driven tutorial system for high-speed execution modules.
- [x] **Resizable Layout**: Professional resizable panels using react-resizable-panels.
- [x] **Mobile Drawer**: Consolidated side-drawer navigation for restricted viewport devices.

### C. Watchlist & Portfolio (`/watchlist`, `/portfolio`)
- [x] **Watchlist `Add Asset` Button**: Dynamic search modal with real-time Firestore persistence.
- [x] **Export Trade History**: `[ Export CSV ]` helper and download trigger on `/client/history` page.
- [x] **Performance Curve**: Real-time asset allocation and performance curve visualization nodes.

---

## 2. Unconnected & Missing Backend Features

### A. Real-Time Market Data Stream
- [x] **Multi-Source Failover Proxy**: Secure server route with Coinbase CDP, Twelve Data, and Alpha Vantage failover nodes.
- [ ] **WebSocket Data Connection**: Price updates currently rely on polling every 3 seconds. Need a live WebSocket connection (e.g. Binance / Polygon.io WS) for sub-second chart ticks.
- [ ] **Real Order Execution Matcher**: Option contract settlement is simulated client-side. Needs a server-side Cloud Function / backend cron worker for authoritative price verification.

### B. Global Accessibility & Infrastructure
- [x] **Twilio Verify Node**: Live SMS verification active for international phone validation.
- [x] **Mobile Money Gateways**: M-Pesa STK Push and Airtel USSD Push nodes provisioned for Kenyan markets.
- [x] **PWA Manifest**: High-fidelity favicon and home screen icon synchronization for mobile installers.
- [x] **Institutional White Overhaul**: Complete replacement of black containers with high-contrast institutional white design system.

---

## 3. Prioritized Implementation Roadmap

1. **Phase 1 (Identity & Core)**: [COMPLETED] Firebase migration, KYC upload, and security triggers.
2. **Phase 2 (Administration)**: [COMPLETED] Admin withdrawal/deposit queues and user authority management.
3. **Phase 3 (Workspace)**: [COMPLETED] Watchlist management, CSV export, and localized AI Assistant.
4. **Phase 4 (Redesign & SEO)**: [COMPLETED] Institutional White design system, SEO metadata matrix, and PWA manifest.
5. **Phase 5 (Performance)**: [COMPLETED] Implement TanStack Table v9, resizable panels, and dynamic face-api loading.
6. **Phase 6 (Infrastructure)**: [IN PROGRESS] Mobile Money settlement listeners and WebSocket tick data node.
7. **Phase 7 (Native)**: Finalize Windows Native Application distribution and auto-update node.

*Status: Phase 6 - Active. Mobile Money gateways provisioned; listener nodes pending.*
