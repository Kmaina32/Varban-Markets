# VARBAN MARKETS — INSTITUTIONAL SYSTEM DOCUMENTATION

## PLATFORM OVERVIEW
Varban Markets is a professional electronic trading protocol engineered for advanced derivatives and synthetic markets. The workspace utilizes a high-precision institutional design system tuned for deterministic results and total financial integrity.

---

## 1. CORE ARCHITECTURE MATRIX

### A. DATA INFRASTRUCTURE (SUPABASE)
*   **Profiles & Identity**: Real-time synchronization of trader metadata using Supabase Auth and PostgreSQL triggers.
*   **Financial Ledger**: Immutable transactional records for deposits, withdrawals, and trade settlements.
*   **Watchlist Persistence**: Cloud-synced asset tracking across all device nodes.

### B. MULTI-SOURCE MARKET DATA FAILOVER
*   **Primary Feed**: Twelve Data (Institutional API).
*   **Tier-1 Nodes**: Coinbase CDP Integration for majors (BTC, ETH); Polygon.io for Equities.
*   **Fail-Safe Chain**: Alpha Vantage (Forex) and Finnhub (Global Equities).
*   **Zero-Config Fallback**: Binance Public API for uninterrupted crypto signals.

### C. INTELLIGENCE & NEWS HUB
*   **Protocol**: Server-side secure proxy with caching to prevent key leakage and CORS issues.
*   **Contextual Feeds**: Real-time Headlines refined for high-volatility drivers (Digital Assets, Forex, Global Politics).
*   **AI Assistant**: Varban Assistant (Genkit/Gemini 1.5 Flash) for institutional support and platform navigation.

### D. DECENTRALIZED ASSETS (CLOUDFLARE R2)
*   **Infrastructure**: Cloudflare R2 Storage for encrypted KYC documents and biometric evidence.
*   **Security**: Presigned URL protocol for authorized client-side uploads directly to private buckets.

---

## 2. PRODUCTION STATUS TRACKER
- [x] **Institutional White Design System**: High-contrast, minimalist UI with brand-yellow accents.
- [x] **Supabase Migration**: Core data transitioned from Firestore to Supabase for enhanced performance.
- [x] **AI Chatbot**: Gemini-powered Varban Assistant integrated globally.
- [x] **Mobile Showcase**: Symmetrical value proposition section featuring high-fidelity device renders.
- [x] **Passkey Biometric Auth**: WebAuthn infrastructure for passwordless, secure session entry.
- [x] **Admin Oversight Desk**: Dedicated nodes for KYC review, deposit verification, and withdrawal dispatch.

---

## 3. DEVELOPER RESOURCES
- [Full API Documentation](./API_DOCS.md)
- [Design Style Guide](./SKILLS.md)
- [Implementation TODO](./TODO.md)
- [Security Policy](./SECURITY.md)

---
*Operational Ledger Status: Finalized, Synchronized & Locked.*
