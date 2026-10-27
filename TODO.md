# Varban Markets — Development TODO & Missing Features Inventory

---

## 1. Non-Working / Static Buttons & Functional Triggers

### A. Security & Verification Pages (`/security`, `/verification`, `/account`)
- [x] **Phone Verification**: [COMPLETED] Twilio Verify OTP handshake active.
- [x] **2FA Toggle**: [COMPLETED] Functional with mandatory verified phone requirement.
- [x] **Identity Verification**: [COMPLETED] Multi-step KYC pipeline with client-side liveness checks.
- [x] **Account Hub**: [COMPLETED] Consolidated profile, security, and display settings into `/client/account`.
- [x] **Investor Profile**: [COMPLETED] Mandatory 12-field regulatory questionnaire with Firestore persistence.

### B. Trading Terminal (`/terminal`)
- [ ] **One-Click Trading Toggle**: Needs a UI switch to bypass the "Risk Pre-Verification" confirmation dialog for high-frequency execution.
- [ ] **Early Option Cashout**: The "Close" button in the portfolio manager needs to implement the 35% stake refund logic and mark positions as `earlyExit=true`.
- [x] **Terminal Feature Tour**: [COMPLETED] Spotlight-driven tutorial system for high-speed execution modules.
- [x] **Resizable Layout**: [COMPLETED] Professional resizable panels using react-resizable-panels.
- [x] **Mobile Terminal**: [COMPLETED] 5-column touch-first navigation with SELL/BUY action triggers.
- [x] **Standard vs Derived**: [COMPLETED] Physical separation of standard assets and synthetic volatility indices.

### C. Watchlist & Portfolio (`/watchlist`, `/portfolio`)
- [x] **Watchlist `Add Asset` Button**: [COMPLETED] Dynamic search modal with real-time Firestore persistence.
- [x] **Export Trade History**: [COMPLETED] `[ Export CSV ]` helper and download trigger on `/client/history` page.
- [x] **Performance Curve**: [COMPLETED] Real-time asset allocation and performance curve visualization nodes.

---

## 2. Unconnected & Missing Backend Features

### A. Real-Time Market Data Stream
- [x] **Multi-Source Failover Proxy**: [COMPLETED] Secure server route with Coinbase CDP, Twelve Data, and Alpha Vantage failover nodes.
- [x] **Synthetic Engine**: [COMPLETED] Proprietary deterministic algorithm generating sub-second price ticks.
- [ ] **WebSocket Data Connection**: Price updates currently rely on polling every 3 seconds. Need a live WebSocket connection (e.g. Binance / Polygon.io WS) for sub-second chart ticks in the Standard Terminal.

### B. Global Accessibility & Infrastructure
- [x] **Institutional White Overhaul**: [COMPLETED] Complete replacement of black containers with rounded (1.25rem) institutional white design system.
- [x] **Exchange Hub**: [COMPLETED] High-fidelity asset swap interface with sparkline visualization.
- [x] **Mobile PWA**: [COMPLETED] High-fidelity favicon and home screen icon synchronization for mobile installers.
- [ ] **Real Order Execution Matcher**: Option contract settlement is simulated client-side/practice. Needs server-side Admin SDK logic for authoritative price verification and real balance settlement.

---

## 3. Prioritized Implementation Roadmap

1. **Phase 1 (Identity & Core)**: [COMPLETED] Firebase migration, KYC upload, and security triggers.
2. **Phase 2 (Administration)**: [COMPLETED] Admin withdrawal/deposit queues and user authority management.
3. **Phase 3 (Workspace)**: [COMPLETED] Watchlist management, CSV export, and localized AI Assistant.
4. **Phase 4 (Redesign & SEO)**: [COMPLETED] Institutional White design system, smooth borders, and SEO metadata.
5. **Phase 5 (Market Nodes)**: [COMPLETED] Exchange Hub, Derived Hub, and Synthetic Engine integration.
6. **Phase 6 (Infrastructure)**: [IN PROGRESS] Real-money settlement endpoints and WebSocket data node.
7. **Phase 7 (Native)**: [PENDING] Finalize Windows Native Application distribution and auto-update node.

*Status: Phase 6 - Active. Synthetic Engine deployed; real-money settlement node pending.*
