
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

---

## 2. SECURITY & STORAGE INFRASTRUCTURE

### A. GEOLOCATION NODE
**Endpoint:** `/api/geolocation`  
**Method:** `GET`  
**Description:** High-precision IP and physical location resolution with security threat assessment.

### B. R2 STORAGE PROTOCOL (S3 Compatible)
**Endpoint:** `/api/storage/presigned-url`  
**Method:** `POST`  
**Description:** Generates time-limited authorized upload tokens for KYC document transmission directly to Cloudflare R2.
