
# VARBAN MARKETS — INSTITUTIONAL API DOCUMENTATION

## 1. CORE DATA INFRASTRUCTURE

The Varban Markets platform utilizes a secure server-side proxy architecture to interface with global financial data providers. This ensures API key protection, request rate management, and cross-origin compatibility.

### A. MARKET DATA PROXY
**Endpoint:** `/api/market-data`  
**Method:** `GET`  
**Description:** Consolidated price feed with multi-node failover (Coinbase CDP -> Twelve Data -> Polygon -> Binance -> Finnhub).

**Parameters:**
- `symbol` (Required): The ticker symbol (e.g., `BTC/USD`, `EUR/USD`).
- `type`: `quote` (Live price) or `time_series` (OHLC data).
- `interval`: Timeframe for series (e.g., `1min`, `5min`, `1h`, `1day`).

**Example Response (Quote):**
```json
{
  "data": {
    "price": 64250.25,
    "change": 120.40,
    "percent": 0.19,
    "status": "Open",
    "timestamp": 1711215600000
  }
}
```

### B. INTELLIGENCE FEED (NEWS)
**Endpoint:** `/api/news`  
**Method:** `GET`  
**Description:** Real-time financial headlines refined for trading. Auto-prioritizes high-volatility drivers: Forex, Crypto, Donald Trump, Dangote Oil.

**Parameters:**
- `query`: Custom search term.
- `category`: `forex`, `crypto`, `business`, `politics`, `commodity`.

**Example Response:**
```json
{
  "data": [
    {
      "uuid": "...",
      "title": "Asian Markets Surge Following...",
      "publisher": "Financial Times",
      "published_at": "2026-03-23T12:00:00Z",
      "url": "..."
    }
  ]
}
```

---

## 2. SECURITY & STORAGE INFRASTRUCTURE

### A. GEOLOCATION NODE
**Endpoint:** `/api/geolocation`  
**Method:** `GET`  
**Description:** High-precision IP and physical location resolution with security threat assessment.

**Key Response Fields:**
- `ip`: Requesting IP address.
- `country_name`: Resolved jurisdiction.
- `security.threat_level`: Low / Medium / High.

### B. R2 STORAGE PROTOCOL (S3 Compatible)
**Endpoint:** `/api/storage/presigned-url`  
**Method:** `POST`  
**Description:** Generates time-limited authorized upload tokens for KYC document transmission directly to Cloudflare R2.

**Request Payload:**
```json
{
  "fileName": "passport_scan.jpg",
  "fileType": "image/jpeg"
}
```

---

## 3. ERROR PROTOCOLS

All platform endpoints utilize a deterministic error envelope to ensure predictable client-side handling.

| Status | Message | Description |
|--------|---------|-------------|
| 400 | Invalid Parameters | Malformed query or payload. |
| 401 | Unauthorized | Missing or expired session/key. |
| 429 | Quota Exceeded | Rate limit reached on data node. |
| 503 | Node Unreachable | Upstream provider timeout / maintenance. |

---
*Operational Ledger Status: Synchronized & Verified.*
