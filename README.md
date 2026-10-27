# VARBAN MARKETS — INSTITUTIONAL TRADING PROTOCOL

<div align="center">
  <img src="/assets/logo2.png" alt="Varban Markets Logo" width="300" />
  <p><em>Professional electronic trading protocol for advanced derivatives and synthetic markets.</em></p>
</div>

---

## 1. PLATFORM ARCHITECTURE

Varban Markets is a high-performance financial workspace engineered for deterministic execution and total capital integrity. The system is divided into specialized nodes for standard assets, synthetic indices, and direct exchange.

### A. TRADING HUBS
*   **Standard Terminal**: Professional execution environment for Forex, Crypto, and Equities with integrated TradingView technical analysis and a refined 5-panel layout.
*   **Derived Hub**: A specialized environment for **Synthetic Volatility Indices (V10-V100)**, powered by a proprietary deterministic random-walk engine. Features sub-second tick-line charting and specialized contract types (Rise/Fall, Even/Odd).
*   **Exchange Hub**: Direct Buy/Sell swap interface with real-time market discovery, trend visualization (sparklines), and quick-stake liquidity allocation.
*   **Mobile Terminal**: Optimized touch-first experience featuring a standardized 5-column bottom navigation and instant Action Triggers (SELL/BUY) for high-speed execution.

### B. THE "INSTITUTIONAL WHITE" DESIGN SYSTEM
The platform utilizes a high-contrast, professional aesthetic defined by:
*   **Smooth Geometry**: Universal `1.25rem` radius on all cards, buttons, and inputs for a modern, fluid user experience.
*   **Branded Typography**: Strictly upright hierarchy using Inter (Interface) and IBM Plex Sans (Display). No italics.
*   **Color Hierarchy**: 
    *   Institutional Blue (`#0055FF`) for primary actions and titles.
    *   Growth Green (`#16835B`) for successful outcomes and synthetic subtitles.
    *   Risk Red (`#C43D3D`) for directional bias and warnings.
*   **Transparent Interactions**: Refined header dropdowns with transparent backgrounds and high-fidelity asset indicators.

---

## 2. TECHNOLOGY MATRIX

### CORE STACK
*   **Framework**: Next.js 15 (App Router) with React 19.
*   **Data Handling**: TanStack Table v9 for institutional-grade data grids and ledgers.
*   **Infrastructure**: Google Firebase (Identity & Real-time Firestore Ledger).
*   **Storage**: Cloudflare R2 (S3-Compatible Decentralized Document Storage).
*   **Intelligence**: Google Gemini 1.5 via Genkit 1.x for automated support and error reporting.

### DATA NODES
*   **Market Data**: Multi-node failover proxy (Twelve Data -> Coinbase CDP -> Binance Public -> Alpha Vantage).
*   **Synthetic Engine**: Proprietary deterministic algorithm generating sub-second price ticks anchored by server-side secrets. 100% auditable random walk path.
*   **Settlement**: 100% automated clearing with instant balance provisioning and cryptographic hash proofing.

---

## 3. ADMINISTRATIVE OVERSIGHT
The platform includes a restricted **Root Authority** hub for comprehensive monitoring:
*   **User Directory**: Entity management and role authority control with TanStack v9.
*   **Financial Queues**: Verification nodes for manual TxHash audits and remittance dispatch.
*   **Market Controls**: Global halt switches and synthetic engine parameter configuration (volatility, drift, house margin).
*   **Audit Ledger**: Immutable, append-only security event log for all administrative and system actions.

---

## 4. STATUS TRACKER
- [x] **Institutional Design**: Finalized (Smooth borders, 1.25rem radius, white theme).
- [x] **Mobile Terminal**: Operational (5-column alignment, fast-action SELL/BUY).
- [x] **Exchange Hub**: Operational (Asset swaps, sparklines, dynamic filters).
- [x] **Derived Hub**: Operational (V10-V100 deterministic feed, custom light-mode chart).
- [x] **Market Selector**: Refined (Transparent UI, Blue/Green typography, circular icons).
- [x] **Secure Auth**: Completed (Firebase + Google OAuth + SMS OTP).
- [x] **Admin Suite**: Completed (Ledger, KYC, Withdrawals, AI Control).

---
*Operational Ledger Status: Synchronized, Verified & Locked.*
