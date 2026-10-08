
# VARBAN MARKETS — INSTITUTIONAL SYSTEM DOCUMENTATION

## PLATFORM OVERVIEW
Varban Markets is a professional electronic trading protocol engineered for advanced derivatives and synthetic markets. The workspace utilizes a high-precision institutional design system tuned for deterministic results and total financial integrity.

---

## 1. CORE ARCHITECTURE MATRIX

### A. DATA INFRASTRUCTURE (SUPABASE)
*   **Profiles & Identity**: Real-time synchronization of trader metadata using Supabase Auth and PostgreSQL triggers.
*   **Financial Ledger**: Immutable transactional records for deposits, withdrawals, and trade settlements.
*   **Watchlist Persistence**: Cloud-synced asset tracking across all device nodes.
*   **Database Setup**: See `SUPABASE_SETUP.sql` for the complete schema and RLS security rules.

### B. ADVANCED CHARTING (TRADINGVIEW)
*   **Pro Widget**: Integration of the TradingView Advanced Charting Widget for institutional analysis.
*   **Tools & Indicators**: Full support for RSI, EMA, Bollinger Bands, and professional drawing tools.
*   **Deterministic Sync**: Branded terminal headers with real-time connectivity status and source verification.

### C. MULTI-SOURCE MARKET DATA FAILOVER
*   **Primary Feed**: Twelve Data (Institutional API).
*   **Tier-1 Nodes**: Coinbase CDP Integration for high-precision major assets (BTC, ETH, SOL).
*   **Fail-Safe Chain**: Alpha Vantage (Forex/Stocks) and Finnhub (Global Equities).
*   **Zero-Config Fallback**: Binance Public API for uninterrupted crypto signals.

### D. INTELLIGENCE & NEWS HUB
*   **Protocol**: Server-side secure proxy with caching to prevent key leakage and CORS issues.
*   **Internal Reader**: Contextual headlines refined for high-volatility drivers (Digital Assets, Forex, Global Politics) with in-app analysis reports.

### E. RESPONSIVE WORKSPACE
*   **Desktop Pro**: Resizable terminal panels for customized chart/ledger balance on computer screens.
*   **Mobile Side-Opening**: "Side opening page" architecture for Registry, Insights, and Positions to maximize chart visibility on mobile.
*   **Profile Enforcement**: Mandatory completion of physical address and investor profile before accessing trading nodes.

---

## 2. ENVIRONMENT SETUP REQUIRED
The following keys must be populated in `.env` to enable full platform functionality:

- **Supabase**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- **Genkit AI**: `GOOGLE_GENAI_API_KEY`.
- **Market Data**: `FINNHUB_API_KEY`, `ALPHA_VANTAGE_API_KEY`, `TWELVE_DATA_API_KEY`, `POLYGON_API_KEY`.
- **Storage**: `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`.

---

## 3. PRODUCTION STATUS TRACKER
- [x] **Institutional White Design System**: High-contrast, minimalist UI with brand-blue and gold accents.
- [x] **Advanced Charting**: Full TradingView terminal integration.
- [x] **Profile Enforcement**: Address and KYC data required for terminal/wallet access.
- [x] **Supabase Migration**: Core identity and financial ledger synchronized.
- [x] **Hardened Route Guards**: Deterministic unauthenticated redirection across all secure nodes.
- [x] **Admin Oversight Desk**: Dedicated nodes for KYC review, deposit verification, and withdrawal dispatch.

---
*Operational Ledger Status: Finalized, Synchronized & Build Optimized.*
