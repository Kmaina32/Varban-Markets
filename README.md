
# VARBAN MARKETS — INSTITUTIONAL SYSTEM DOCUMENTATION

## PLATFORM OVERVIEW
Varban Markets is a professional electronic trading protocol engineered for advanced derivatives and synthetic markets. The workspace utilizes a high-precision institutional design system tuned for deterministic results and total financial integrity.

---

## 1. CORE ARCHITECTURE MATRIX

### A. DATA INFRASTRUCTURE (SUPABASE)
*   **Profiles & Identity**: Real-time synchronization of trader metadata using Supabase Auth and PostgreSQL triggers.
*   **Financial Ledger**: Immutable transactional records for deposits, withdrawals, and trade settlements.
*   **Watchlist Persistence**: Cloud-synced asset tracking across all device nodes.
*   **Database Setup**: 
    1. Open your Supabase Dashboard.
    2. Go to the **SQL Editor**.
    3. Copy the entire content of `SUPABASE_SETUP.sql` (found in the root directory).
    4. Click **Run** to provision the schema and RLS policies.
    5. This resolves the "column not found" errors by adding Investor Profile fields.

### B. ADVANCED CHARTING (TRADINGVIEW)
*   **Pro Widget**: Integration of the TradingView Advanced Charting Widget for institutional analysis.
*   **Tools & Indicators**: Full support for RSI, EMA, Bollinger Bands, and professional drawing tools.

### C. MULTI-SOURCE MARKET DATA FAILOVER
*   **Primary Feed**: Twelve Data (Institutional API).
*   **Tier-1 Nodes**: Coinbase CDP Integration for high-precision major assets (BTC, ETH, SOL).
*   **Fail-Safe Chain**: Alpha Vantage (Forex/Stocks) and Finnhub (Global Equities).

### D. PROFILE ENFORCEMENT
*   **KYC Protocol**: Access to the Trading Terminal and Wallet is strictly restricted until the Physical Address and Investor Profile (Net Worth, Income, Source of Wealth) are completed.
*   **Regulatory Alignment**: Ensures compliance with Saint Lucia jurisdiction standards for electronic financial brokers.

---

## 2. ENVIRONMENT SETUP REQUIRED
The following keys must be populated in `.env` to enable full platform functionality:

- **Supabase**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- **Market Data**: `FINNHUB_API_KEY`, `ALPHA_VANTAGE_API_KEY`, `TWELVE_DATA_API_KEY`, `POLYGON_API_KEY`.
- **Storage**: `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`.

---

## 3. PRODUCTION STATUS TRACKER
- [x] **Institutional White Design System**: High-contrast, minimalist UI with brand-blue and gold accents.
- [x] **Advanced Charting**: Full TradingView terminal integration.
- [x] **Profile Enforcement**: Physical address and regulatory data required for terminal/wallet access.
- [x] **Supabase Migration**: Core identity and financial ledger synchronized with idempotent RLS scripts.
- [x] **Idempotent Database Setup**: Root script `SUPABASE_SETUP.sql` handles initial provisioning and schema patches.

---
*Operational Ledger Status: Finalized, Synchronized & Build Optimized.*
