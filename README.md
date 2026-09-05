# NoCap

### A smarter market watchlist that tells you what changed, why it matters, and what deserves your attention.

NoCap is a smart market watchlist built for the **Groww engineering challenge**.

Traditional watchlists tell you how much a stock moved. NoCap goes one step further by understanding the context behind that movement and anchoring it to the user's **last reviewed session**.

Instead of making users scan dozens of stocks and news updates, NoCap answers three simple questions:

> **What changed since I last checked?**
> **Why did it change?**
> **Does it actually matter?**

---

## 🚀 Core Idea

NoCap acts as an **attention layer over the market**.

When a user returns to the application, the system compares current market conditions against their previous session, filters out normal market noise, ranks meaningful changes, and presents only the events worth investigating.

This helps both beginners and experienced users spend less time scanning information and more time understanding it.

---

## ✨ Key Features

### 🧠 Session-Aware Watchlist

The system stores the user's `last_viewed_at` timestamp and uses it as the baseline for future comparisons.

A user returning after several hours or days sees what changed **since they actually last checked**, rather than an arbitrary midnight or 24-hour comparison.

### 🔇 Noise-Cancelled Attention

A stock may fall simply because its entire sector fell.

NoCap compares the stock's movement against its sector using a beta-adjusted calculation to estimate how much of the move is actually stock-specific.

This helps distinguish:

* Market-wide movement
* Sector-wide movement
* Stock-specific movement

### 📊 Unusual Volume Detection

Current trading activity is compared with a historical baseline.

For example:

> RELIANCE is up 3.1% while trading at 3.1× normal volume.

This can elevate a stock's attention level even when no confirmed catalyst is available.

### 🛡️ Corporate-Action Protection

Not every large price movement represents a genuine market event.

NoCap detects known corporate actions such as dividends or splits and suppresses misleading panic classifications while preserving the underlying movement and context.

### 💡 Plain-English Explanations

Important changes are explained through simple concepts such as:

**Why**
What caused or may have caused the movement.

**Signal**
Whether the movement is unusual relative to the market or sector.

**Impact**
Why the change deserves attention.

Technical calculations remain available for users who want to understand the underlying reasoning.

### ⚡ Live Mode

NoCap supports Server-Sent Events (SSE) to deliver meaningful attention updates without requiring a full page refresh.

The stream avoids repeatedly sending identical events and only surfaces relevant changes.

### 🧯 Resilient Market Data

The system uses a circuit breaker and stale-data fallback.

If the market-data provider fails, NoCap can continue serving the latest known usable state while clearly marking the data as stale.

### 📈 Stock Exploration

The separate **Stocks** experience allows users to:

* Search the available stock universe
* View current prices
* Explore 1D, 1W and 1M historical movement
* Inspect contextual market insights
* Calculate whole shares and remaining cash for an investment amount
* Estimate hypothetical historical returns

### 👁️ Explicit No-Change Feedback

NoCap does not create unnecessary FOMO.

When nothing meaningful happened, it explicitly tells the user:

> **Nothing else needs your attention.**

This confirms that the system intentionally filtered out the noise.

---

## 🏗️ Architecture

```text
                         ┌─────────────────────────┐
                         │       Next.js App       │
                         │ React + TypeScript      │
                         │ Tailwind + Recharts     │
                         └────────────┬────────────┘
                                      │
                                 REST / SSE
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │       FastAPI API       │
                         │        Python           │
                         └────────────┬────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              │                       │                       │
              ▼                       ▼                       ▼
      ┌───────────────┐      ┌────────────────┐      ┌─────────────────┐
      │ Attention     │      │ Session Store  │      │ Market Provider │
      │ Engine        │      │ SQLite         │      │ Mock / Abstract │
      │               │      │                │      │                 │
      │ Delta         │      │ last_viewed_at │      │ Deterministic   │
      │ Alpha         │      │ Watchlist      │      │ Scenarios       │
      │ Volume        │      │                │      │                 │
      │ Scoring       │      │                │      │                 │
      └───────────────┘      └────────────────┘      └─────────────────┘
              │                       │                       │
              └───────────────────────┼───────────────────────┘
                                      ▼
                         ┌─────────────────────────┐
                         │ Circuit Breaker +      │
                         │ Stale Data Fallback    │
                         └─────────────────────────┘
```

The system keeps responsibilities separated through a **session-store abstraction** and a **market-provider abstraction**, allowing the underlying storage or market-data source to be replaced without rewriting the core attention logic.

---

## 🧮 Attention Engine

The main calculations are deterministic and independently testable.

### Session Delta

```text
delta_stock =
(current_price - baseline_price) / baseline_price
```

### Sector-Adjusted Alpha

```text
alpha =
delta_stock - (beta × delta_sector)
```

`beta` represents the stock's sensitivity to its sector benchmark.

### Volume Ratio

```text
volume_ratio =
current_volume / baseline_average_volume
```

These signals contribute to the final **Attention Score**, which is mapped into:

* **Major**
* **Moderate**
* **Unchanged**

Corporate-action information can override or downgrade an otherwise misleading attention classification.

---

## 🧪 Deterministic Demo Scenarios

The mock market provider includes reproducible scenarios for development and judging:

| Scenario           | Demonstrates                                |
| ------------------ | ------------------------------------------- |
| `normal`           | Normal market noise and unchanged stocks    |
| `stock_specific`   | Large stock-specific movement               |
| `sector_wide`      | Broad sector movement                       |
| `unusual_volume`   | Unusual volume without a confirmed catalyst |
| `corporate_action` | Movement caused by a corporate action       |
| `api_failure`      | Provider failure and stale-data fallback    |

These scenarios make the application's important behaviors easy to demonstrate and test consistently.

---

## 🔌 API

Core API endpoints include:

```text
GET  /api/session
GET  /api/attention-inbox
GET  /api/stocks
GET  /api/stocks/{ticker}
GET  /api/stocks/{ticker}/history
GET  /api/market-stories
GET  /api/attention-stream
GET  /health

POST /api/session/acknowledge
POST /api/session/watchlist
POST /api/scenario
POST /api/chaos/toggle
```

FastAPI also exposes interactive API documentation.

---

## 🛠️ Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* Framer Motion
* Recharts
* Lucide React

### Backend

* Python
* FastAPI
* Pydantic
* Pandas
* NumPy
* SQLite

### Realtime & Reliability

* Server-Sent Events (SSE)
* Circuit Breaker
* Stale Data Fallback
* Provider Abstraction

### Testing

* Pytest
* TypeScript type checking
* Next.js production builds

---

## 🧪 Testing & Verification

The project includes automated tests for:

* Attention Engine calculations
* Session-delta behavior
* Alpha calculations
* Corporate-action handling
* Watchlist persistence
* SSE behavior
* Stale-data fallback
* API reliability

The frontend is also validated through TypeScript checking and production builds.

---

## 🎬 Demo Flow

A typical NoCap demonstration:

1. Open **My Watchlist**.
2. Show the user's session baseline.
3. Surface only meaningful changes.
4. Open a stock to understand why it moved.
5. Inspect broader Market Stories.
6. Switch to **Stocks** to explore price history.
7. Use the investment and historical-return calculators.
8. Enable **Live Mode**.
9. Trigger a deterministic market scenario.
10. Demonstrate stale-data recovery through the failure scenario.

---

## 🔐 Security & Scope

NoCap currently uses deterministic mock market data for the hackathon.

No real trades are executed.

Secrets and environment-specific configuration are kept outside version control and should be supplied through environment variables.

The project is intentionally designed as a **hackathon-quality end-to-end prototype**, while keeping its architecture extensible for future production components such as a real market-data provider.

---

## 🌱 Why NoCap?

Most investing interfaces solve information scarcity by showing users more information.

NoCap approaches the problem differently:

> **The market already gives you enough information.
> The real problem is knowing what deserves your attention.**

NoCap is designed to help users:

**Scan less. Understand more.**

---

### Built for the Groww Engineering Challenge
