# Context - Smart Market Watchlist

"Context" is a smart market watchlist for the Groww hackathon. It replaces the traditional price-feed watchlist with an "Attention Inbox" that answers three questions:
1. What changed since I last checked?
2. Why did it change?
3. Does it deserve my attention?

## Architecture
- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, Lucide React, Framer Motion
- **Backend**: Python, FastAPI, Pydantic, Pandas, NumPy
- **Database/State**: SQLite (persistent data), Redis (session state)

## Scaling Decisions
- **Session Anchoring**: The mathematical engine compares prices strictly against the user's `last_viewed_at` baseline rather than generic 24hr windows.
- **Circuit Breaker**: Resilient to external API failures. Uses stale data caching gracefully.
- **Isolated Mathematics**: The Attention Engine handles beta-adjusted alpha and anomaly scoring without tight coupling to the data layer.

## Setup Instructions

### Backend
1. `cd backend`
2. `python -m venv venv`
3. `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux)
4. `pip install -r requirements.txt` *(Make sure to pip freeze if missing)*
5. Run tests: `pytest tests/`
6. Run server: `uvicorn app.main:app --reload --port 8000`

### Frontend
1. `cd frontend`
2. `npm install`
3. Run server: `npm run dev`

The frontend runs on `http://localhost:3000` and the backend on `http://localhost:8000`.

## Testing Chaos Mode
Send a POST request to toggle the mock API failure:
```bash
curl -X POST http://localhost:8000/api/chaos/toggle -H "Content-Type: application/json" -d '{"enabled": true}'
```
