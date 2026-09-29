
# VARBAN MARKETS — INSTITUTIONAL SYSTEM DOCUMENTATION

## PLATFORM OVERVIEW
Varban Markets is a professional electronic trading protocol engineered for advanced derivatives and synthetic markets. The workspace utilizes a high-precision institutional design system tuned for deterministic results and total financial integrity.

---

## 1. CORE ARCHITECTURE MATRIX

### A. MULTI-SOURCE MARKET DATA FAILOVER
*   **Primary Feed:** Twelve Data (Institutional API).
*   **Tier-1 Nodes:** Coinbase CDP Integration for majors; Polygon.io for Equities & Forex failover.
*   **Fail-Safe Chain:** Alpha Vantage (Forex/Stocks) and Finnhub (Global Equities).
*   **Zero-Config Fallback:** Binance Public API for uninterrupted crypto signals.

### B. NEWS INTELLIGENCE HUB
*   **Protocol:** Server-side secure proxy with Firestore caching.
*   **Targeted Intelligence:** Auto-filtered for Forex, Crypto, Donald Trump, and Dangote Oil.
*   **In-App Analysis:** Local report reading workspace via intelligence tokens.

### C. STORAGE & DECENTRALIZED ASSETS
*   **Infrastructure:** Cloudflare R2 Storage (WEUR) for encrypted KYC documents.
*   **Security:** Presigned URL protocol for authorized client-side uploads.
*   **Public URL:** https://pub-63afeebb70d44dbe9bb35647c48c062e.r2.dev

### D. DETERMINISTIC PROTOCOL (ZERO-AI)
*   **Execution:** 100% deterministic matching logic. No generative or speculative AI interference.
*   **Transparency:** Every transaction and settlement is logged in an immutable ledger.

---

## 2. DEVELOPER RESOURCES
- [Full API Documentation](./API_DOCS.md)
- [Design Style Guide](./SKILLS.md)
- [Backend Schema](./docs/backend.json)
- [Security Policy](./SECURITY.md)

---

## 3. PRODUCTION STATUS TRACKER
- [x] Institutional White Design System
- [x] Cloudflare R2 Storage Integration
- [x] Presigned URL KYC Upload Flow
- [x] Multi-Node Market Data Failover
- [x] In-App Intelligence Reports
- [x] Passkey Biometric Authentication
- [x] Automated Security Auditing (Dependabot)
- [x] Hardened Security Disclosure Policy

---
*Operational Ledger Status: Finalized, Synchronized & Locked.*
