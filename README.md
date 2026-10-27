# VARBAN MARKETS — INSTITUTIONAL TRADING PROTOCOL

<div align="center">
  <img src="/assets/logo2.png" alt="Varban Markets Logo" width="300" />
  <p><em>Professional electronic trading protocol for advanced derivatives and synthetic markets.</em></p>
</div>

---

## 1. PLATFORM ARCHITECTURE

Varban Markets is a high-performance financial workspace engineered for deterministic execution and total capital integrity. The system is divided into specialized nodes for standard assets, synthetic indices, and decentralized exchange.

### A. TRADING HUBS
*   **Standard Terminal**: Professional execution environment for Forex, Crypto, and Equities with integrated TradingView technical analysis.
*   **Derived Hub**: A specialized environment for **Synthetic Volatility Indices (V10-V100)**, powered by a deterministic random-walk engine.
*   **Exchange Hub**: Direct Buy/Sell swap interface with real-time market discovery and trend visualization.
*   **Mobile Terminal**: Optimized touch-first experience with a 5-column bottom navigation and instant SELL/BUY action triggers.

### B. THE "INSTITUTIONAL WHITE" DESIGN SYSTEM
The platform utilizes a high-contrast, professional aesthetic defined by:
*   **Smooth Geometry**: Universal `1.25rem` radius on all cards, buttons, and inputs for a modern, fluid user experience.
*   **Branded Typography**: Strictly upright hierarchy using Inter (Interface) and IBM Plex Sans (Display).
*   **Color Hierarchy**: Institutional Blue (`#0055FF`) for primary actions, Growth Green (`#16835B`) for successful outcomes, and Risk Red (`#C43D3D`) for directional bias.

---

## 2. TECHNOLOGY MATRIX

### CORE STACK
*   **Framework**: Next.js 15 (App Router) with React 19.
*   **Infrastructure**: Google Firebase (Unified Identity & Real-time Firestore Ledger).
*   **Storage**: Cloudflare R2 (S3-Compatible Decentralized Document Storage).
*   **Intelligence**: Google Gemini 1.5 via Genkit 1.x for automated support and reporting.
*   **Security**: Google reCAPTCHA Enterprise & Twilio Verify (SMS OTP Handshake).

### DATA NODES
*   **Market Data**: Multi-node failover proxy (Twelve Data -> Coinbase CDP -> Binance Public -> Alpha Vantage).
*   **Synthetic Engine**: Proprietary deterministic algorithm generating sub-second price ticks anchored by server-side secrets.
*   **Settlement**: 100% automated clearing with instant balance provisioning.

---

## 3. ADMINISTRATIVE OVERSIGHT
The platform includes a restricted **Root Authority** hub for comprehensive monitoring:
*   **User Directory**: Entity management and role authority control.
*   **Financial Queues**: Verification nodes for manual TxHash audits and remittance dispatch.
*   **Market Controls**: Global halt switches and synthetic engine parameter configuration.
*   **Audit Ledger**: Immutable, append-only security event log for all administrative actions.

---

## 4. STATUS TRACKER
- [x] **Institutional Design**: Completed (Smooth borders, white theme).
- [x] **Mobile Terminal**: Operational (5-column alignment, fast-buy/sell).
- [x] **Exchange Hub**: Operational (Asset swaps, sparklines).
- [x] **Derived Hub**: Operational (V10-V100 deterministic feed).
- [x] **Secure Auth**: Completed (Firebase + Google OAuth + SMS OTP).
- [x] **Admin Suite**: Completed (Ledger, KYC, Withdrawals).

---
*Operational Ledger Status: Synchronized, Verified & Locked.*
