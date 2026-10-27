# VARBAN MARKETS — INSTITUTIONAL SYSTEM DOCUMENTATION

## PLATFORM OVERVIEW
Varban Markets is a professional electronic trading protocol engineered for advanced derivatives and synthetic markets. The workspace utilizes a high-precision institutional design system tuned for deterministic results and total financial integrity.

---

## 1. CORE ARCHITECTURE MATRIX

### A. IDENTITY & DATA INFRASTRUCTURE (GOOGLE FIREBASE)
*   **Authentication**: Secure session management using Firebase Auth, featuring Google OAuth 2.0 and reCAPTCHA Enterprise protection.
*   **Institutional Ledger (Firestore)**: Real-time synchronization of trader metadata, open positions, and financial history using Cloud Firestore.
*   **Multi-Node Sync**: Real-time listeners ensure sub-second updates across the Trading Terminal and Portfolio Dashboard.

### B. SECURITY & VERIFICATION (TWILIO)
*   **OTP Handshake**: Integrated Twilio Verify for high-precision SMS identity validation.
*   **MFA Enforcement**: Mandatory 2FA for withdrawals and critical account mutations.
*   **Phone Verification**: Real-time E.164 validation via Twilio node.

### C. ADVANCED CHARTING (TRADINGVIEW)
*   **Pro Widget**: Integration of the TradingView Advanced Charting Widget for institutional analysis.
*   **Tools & Indicators**: Full support for RSI, EMA, Bollinger Bands, and professional drawing tools.

### D. MULTI-SOURCE MARKET DATA FAILOVER
*   **Primary Feed**: Twelve Data (Institutional API).
*   **Tier-1 Nodes**: Coinbase CDP Integration for high-precision major assets (BTC, ETH, SOL).
*   **Fail-Safe Chain**: Alpha Vantage (Forex/Stocks) and Finnhub (Global Equities).

### E. GLOBAL ACCESSIBILITY (i18n)
*   **5-Language Protocol**: Full platform localization for English, French, Spanish, Portuguese, and Simplified Chinese (zh-CN).
*   **Multilingual AI**: Localized AI Assistant capable of responding in the user's active locale.

---

## 2. PRODUCTION STATUS TRACKER
- [x] **Institutional White Design System**: High-contrast, minimalist UI with brand-blue accents.
- [x] **Firebase Migration**: Core identity and financial ledger synchronized via Firestore.
- [x] **Twilio OTP Integration**: Live SMS verification node for identity validation.
- [x] **Google reCAPTCHA Enterprise**: Bot prevention active on login and registration nodes.
- [x] **Google OAuth 2.0**: Social sign-in and registration fully integrated.
- [x] **Universal Localization**: 100% translation coverage for 5 global languages.

---
*Operational Ledger Status: Synchronized & Verified.*
