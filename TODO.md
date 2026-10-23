
# Varban Markets — Development TODO & Missing Features Inventory

---

## 1. Non-Working / Static Buttons & Functional Triggers

### A. Security & Verification Pages (`/security`, `/verification`, `/account`)
- [x] **`/verification` Upload Buttons**: Wired to trigger "Pending" status update and user notification alerts.
- [x] **`/security` "Change Password" Button**: Wired to Firebase Auth `sendPasswordResetEmail` flow.
- [x] **`/security` "Log Out Everywhere Else" Button**: Wired to force token refresh and remote session revocation UX.
- [x] **Account Hub Integration**: Consolidated profile, security, and display settings into `/client/account`.
- [x] **`/security` 2FA Toggle**: Fully functional toggle synced with Firestore `preferences.mfaEnabled` state.
- [x] **Investor Profile**: Mandatory 12-field regulatory questionnaire with Firestore persistence.

### B. Trading Terminal (`/terminal`)
- [x] **Mobile Command Bar**: Trio-node trigger system (BUY/LEDGER/SELL) for high-velocity mobile execution.
- [x] **Left-Side Command Drawer**: Professional slide-in configuration drawer for mobile screens to reduce chart congestion.
- [x] **Full-Page Ledger Drawer**: Integrated settlement archive and active exposure manager for mobile.
- [x] **Advanced Charting**: Enabled side toolbar, drawing tools, and symbol switching within the TradingView Advanced Widget.
- [ ] **One-Click Trading Toggle**: Needs a UI switch to bypass the "Risk Pre-Verification" confirmation dialog.
- [ ] **Early Option Cashout**: Implement 35% stake refund logic and mark positions as `earlyExit=true`.
- [x] **Terminal Feature Tour**: Spotlight-driven tutorial system for high-speed execution modules.
- [x] **Universal Clock**: Real-time clock with selectable timezone persistence.
- [x] **Resizable Layout**: Implemented professional resizable panels for chart, ledger, and utility sections.

---

## 2. Unconnected & Missing Backend Features

### A. Real-Time Market Data Stream
- [x] **Multi-Source Failover Proxy**: Secure server route with Coinbase CDP, Twelve Data, and Alpha Vantage nodes.
- [ ] **WebSocket Data Connection**: Need a live WebSocket connection (e.g. Binance / Polygon.io WS) for sub-second chart ticks.
- [ ] **Real Order Execution Matcher**: Needs a server-side Cloud Function for authoritative price verification.

### B. Global Accessibility & SEO
- [x] **Multilingual Protocol**: Full i18n support for 5 global languages (EN, FR, ES, PT, ZH-CN).
- [x] **SEO Metadata Matrix**: Granular metadata and sitelink optimization for all nodes.
- [x] **Institutional AI Assistant**: Localized, context-aware chatbot using Genkit and Gemini.

### C. Funding & Infrastructure
- [x] **M-Pesa Express (Daraja API)**: Integrated real-time STK Push and callback listener for KES deposits.
- [x] **Airtel Money (USSD Push)**: Integrated Airtel Kenya Collection API for mobile deposits.
- [ ] **IP Whitelisting**: Configure the Server IP Allowed List in the Daraja/Airtel portals using the diagnostic endpoint `/api/diag/my-ip`.
- [x] **Institutional Branding**: Deployed `pwa.png` favicon and updated official gateway logos.
- [x] **Transaction Receipts**: PDF generation engine for institutional settlement proof.

---

## 3. UI Component Library
- [x] **High-Visibility Account Switch**: Refined haptic motion profile and color-coded state tracking (Real/Demo).
- [x] **TanStack Table v9**: High-performance data grid system across all ledgers.
- [x] **Skeleton Shimmers**: High-fidelity placeholder loaders for data synchronization.

---

## 4. Prioritized Implementation Roadmap

1. **Phase 1 (Identity & Core)**: [COMPLETED] Firebase migration and security triggers.
2. **Phase 2 (Administration)**: [COMPLETED] Admin queues and user authority management.
3. **Phase 3 (Workspace)**: [COMPLETED] Watchlist management, CSV export, and localized AI Assistant.
4. **Phase 4 (Redesign & SEO)**: [COMPLETED] Institutional White design system and SEO matrix.
5. **Phase 5 (Performance)**: [COMPLETED] TanStack Table v9 and resizable panels.
6. **Phase 6 (Infrastructure)**: [IN PROGRESS] Mobile Money settlement listeners [DONE], IP Whitelisting, and Server-side workers.

*Status: Phase 6 - In Progress. Airtel Money and Universal Branding Overhaul Completed.*
