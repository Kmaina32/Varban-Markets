
# VARBAN MARKETS — SYSTEM PAGES & ARCHITECTURE DOCUMENTATION

## 1. PUBLIC MARKETING SUITE
- **`/` (Home)**: Primary landing node featuring hero slideshow, live market tape, mobile app showcase, and risk disclaimer.
- **`/how-it-works`**: Educational roadmap of the trading lifecycle.
- **`/markets`**: Global market registry with live pricing.
- **`/technology`**: Platform infrastructure overview.
- **`/about`**: Corporate profile and mission.
- **`/protection`**: Detailed breakdown of capital protection standards.

## 2. AUTHENTICATION FUNNEL
- **`/login`**: Secure session entry.
- **`/register`**: Global onboarding form with geo-location detection.

## 3. TRADING APPLICATION (WORKSPACE)
Restricted pages for active traders, featuring real-time data synchronization.
- **`/dashboard`**: Unified portfolio overview.
- **`/terminal`**: High-performance TradingView workspace.
- **`/news`**: Real-time market intelligence hub.
- **`/portfolio`**: Asset allocation and performance tracking.
- **`/wallet`**: Centralized capital hub for deposits and withdrawals.
- **`/watchlist`**: Prioritized instrument registry.

## 4. ACCOUNT HUB
- **`/account?tab=profile`**: Identity and mandatory Investor Profile (KYC).
- **`/account?tab=verification`**: 3-Slot KYC pipeline for document upload.
- **`/account?tab=security`**: Session management and 2FA.
- **`/account?tab=display`**: Personalization of currency and language.

## 5. ADMINISTRATIVE OVERSIGHT
Restricted to Root Authority entities.
- **`/admin`**: Global platform metrics.
- **`/admin/users`**: Directory and authority management.
- **`/admin/kyc-approvals`**: Document verification desk.
- **`/admin/deposits`**: TxHash verification queue.
- **`/admin/withdrawals`**: Remittance dispatch queue.
- **`/admin/audit-logs`**: Immutable security event log.
