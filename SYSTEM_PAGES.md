
# VARBAN MARKETS — SYSTEM PAGES & ARCHITECTURE DOCUMENTATION

## 1. PUBLIC MARKETING SUITE
These pages provide the corporate landing experience and onboarding funnel for retail and institutional traders.

- **`/` (Home)**: Primary landing node featuring hero slideshow, live market tape, mobile app showcase, and risk disclaimer.
- **`/how-it-works`**: Educational roadmap of the trading lifecycle from registration to settlement.
- **`/markets`**: Global market registry with live pricing for Forex, Crypto, Equities, and Commodities.
- **`/technology`**: Platform infrastructure overview detailing execution latency and system reliability.
- **`/about`**: Corporate profile including executive leadership, monthly volumes, and mission statement.
- **`/protection`**: Detailed breakdown of segregated accounts, negative balance protection, and regulatory oversight.
- **`/contact`**: Public support gateway with office locations and direct inquiry form.

## 2. TRADING ACCOUNTS & CONDITIONS (MEGA-MENU)
Accessible via the "Trading" dropdown, these pages define account types and trading requirements.

### Accounts:
- **`/accounts/standard`**: Detailed specifications for the retail-standard account (min deposit, spreads, etc.).
- **`/accounts/professional`**: Institutional series for high-volume traders with raw spreads and API access.
- **`/accounts/demo`**: Risk-free practice sandbox with $10,000 in virtual funds.

### Conditions:
- **`/how-it-works/payments`**: Comprehensive guide to deposit/withdrawal methods, clearing speeds, and fees.
- **`/terms/fees`**: Transparent ledger of all platform charges, including network fees and conversion rates.
- **`/protection`**: Institutional security standards (Segregation, Cold Storage, Auditability).
- **`/terms/order-execution`**: Technical policy on latency benchmarks, execution logic, and bonus turnover rules.

## 3. AUTHENTICATION FUNNEL
- **`/login`**: Secure session entry with Google OAuth and Passkey options.
- **`/register`**: Global onboarding form with geo-location detection and regulatory declarations.
- **`/forgot-password`**: Password recovery node via verified email link.

## 4. TRADING APPLICATION (WORKSPACE)
Restricted pages for active traders, featuring real-time data synchronization.

- **`/dashboard`**: Unified portfolio overview with wealth snapshots and recent activity feed.
- **`/terminal`**: High-performance workspace featuring TradingView charting and instant execution tickets.
- **`/news`**: Real-time market intelligence hub with sector-specific intelligence filters.
- **`/portfolio`**: Asset allocation visualization and historical performance curve.
- **`/positions`**: Live management node for open contracts and defined-risk exposure.
- **`/wallet`**: Centralized capital hub for deposits, withdrawals, and immutable receipt generation.
- **`/watchlist`**: Prioritized registry of user-tracked financial instruments.
- **`/history`**: Searchable archive of all closed execution records.

## 5. ACCOUNT HUB
- **`/account?tab=profile`**: Identity and metadata management.
- **`/account?tab=verification`**: 3-Slot KYC pipeline for document upload and biometric capture.
- **`/account?tab=security`**: Session management, password modification, and 2FA provisioning.
- **`/account?tab=display`**: Personalization of currency, language, and timezone.

## 6. ADMINISTRATIVE OVERSIGHT
Restricted to root authority entities (Admins).

- **`/admin`**: Global platform metrics and real-time registration feed.
- **`/admin/users`**: Directory for managing entity identities and authority levels.
- **`/admin/kyc-approvals`**: Document verification desk for manual audit of KYC evidence.
- **`/admin/deposits`**: Queue for verifying blockchain TxHashes and provisioning capital.
- **`/admin/withdrawals`**: Queue for approving and dispatching outgoing remittances.
- **`/admin/transactions`**: Platform-wide immutable financial ledger.
- **`/admin/markets`**: Global control center for instrument availability and feed status.
- **`/admin/audit-logs`**: Append-only log of all administrative and security events.

---
*Operational Registry Status: Synchronized & Verified.*
