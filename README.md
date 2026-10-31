# VARBAN MARKETS — INSTITUTIONAL TRADING PROTOCOL

<div align="center">
  <img src="/assets/logo2.png" alt="Varban Markets Logo" width="300" />
  <p><em>Professional electronic trading protocol for advanced derivatives and synthetic markets.</em></p>
</div>

---

## 1. PLATFORM ARCHITECTURE

Varban Markets is a high-performance financial workspace engineered for deterministic execution and total capital integrity. The system is divided into specialized nodes for standard assets, synthetic indices, and professional infrastructure.

### A. TRADING HUBS
*   **Standard Terminal**: Professional execution environment for Forex, Crypto, and Equities with integrated TradingView technical analysis and a refined 5-panel layout.
*   **Derived Hub**: A specialized environment for **Synthetic Volatility Indices (V10-V100)**, powered by a proprietary deterministic random-walk engine. Features sub-second tick-line charting and specialized contract types (Rise/Fall, Even/Odd).
*   **Exchange Hub**: Direct Buy/Sell swap interface with real-time market discovery, trend visualization (sparklines), and quick-stake liquidity allocation.
*   **Vps (Virtual private server )**: High-performance dedicated hosting for automated strategies. Features NVMe SSD tiers (NVMe 2-16), AMD EPYC cores, and sub-1ms connectivity to execution nodes.

### B. THE "INSTITUTIONAL WHITE" DESIGN SYSTEM
The platform utilizes a high-contrast, professional aesthetic defined by:
*   **Geometric Precision**: Standardized `0.75rem` (rounded-xl) radius across containers for a sharp, modern appearance.
*   **Branded Typography**: Strictly upright hierarchy using Inter (Interface) and IBM Plex Sans (Display). No italics.
*   **Color Hierarchy**: 
    *   Institutional Blue (`#0055FF`) for primary actions and risk highlights.
    *   Growth Green (`#16835B`) for successful outcomes and synthetic indicators.
    *   Risk Red (`#C43D3D`) for directional bias and warnings.
*   **Hover-Expand Navigation**: Sidebar expands on interaction to reveal detailed page descriptions and labels.

---

## 2. TECHNOLOGY MATRIX

### CORE STACK
*   **Framework**: Next.js 15 (App Router) with React 19.
*   **Infrastructure**: Google Firebase (Identity & Real-time Firestore Ledger).
*   **Storage**: Cloudflare R2 (S3-Compatible Decentralized Document Storage).
*   **Hosting**: Multi-node VPS architecture with AMD EPYC performance.
*   **Intelligence**: Google Gemini 1.5 via Genkit 1.x for automated support and error reporting.

### REGULATORY NODES
*   **Jurisdiction**: 100% Seychelles-based regulatory framework.
*   **Licensing**: Seychelles FSA Licensed (SD042), VASP Registered, and Data Protection compliant.
*   **Settlement**: Deterministic algorithm generating sub-second price ticks anchored by server-side secrets. 100% auditable random walk path.

---

## 3. ADMINISTRATIVE OVERSIGHT
The platform includes a restricted **Root Authority** hub for comprehensive monitoring:
*   **Admin Telemetry**: Real-time high-fidelity system monitors for CPU, DB Latency, and RAM (with 6s inactivity timeout).
*   **User Directory**: Entity management and role authority control with TanStack v9.
*   **Financial Queues**: Verification nodes for manual TxHash audits and remittance dispatch.
*   **Audit Ledger**: Immutable, append-only security event log for all administrative and system actions.

---

## 4. STATUS TRACKER
- [x] **Institutional Design**: Finalized (Sharpened borders, rounded-xl radius, white theme).
- [x] **Vps (Virtual private server )**: Operational (NVMe tiers, provisioning terminal, RDP dashboard).
- [x] **Seychelles Migration**: Completed (Removed UK jurisdiction, updated FSA License SD042).
- [x] **Mobile Terminal**: Operational (5-column alignment, fast-action SELL/BUY).
- [x] **Exchange Hub**: Operational (Asset swaps, sparklines, dynamic filters).
- [x] **Admin Telemetry**: Upgraded (High-fidelity visuals, dynamic RAM wave, auto-timeout).
- [x] **Secure Auth**: Completed (Firebase + Google OAuth + SMS OTP).
- [x] **Risk Disclosure**: Expanded (Counterparty, Algorithmic, and Technology clauses).

---
*Operational Ledger Status: Synchronized, Verified & Locked.*
