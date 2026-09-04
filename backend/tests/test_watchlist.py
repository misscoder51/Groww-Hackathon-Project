import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.api.endpoints import session_store, DEFAULT_USER

client = TestClient(app)

def test_watchlist_update_success():
    # 1. Get original session
    orig = session_store.get_session(DEFAULT_USER)
    assert orig is not None
    orig_time = orig.last_viewed_at

    # 2. Add valid ticker and remove one
    new_tickers = ["TCS", "HDFCBANK"]
    res = client.post("/api/session/watchlist", json={"tickers": new_tickers})
    assert res.status_code == 200
    assert res.json()["status"] == "success"
    assert res.json()["watchlist_tickers"] == new_tickers

    # 3. Verify persistence
    updated = session_store.get_session(DEFAULT_USER)
    assert updated.watchlist_tickers == new_tickers
    
    # 4. Verify last_viewed_at is unchanged
    assert updated.last_viewed_at == orig_time

def test_watchlist_empty_success():
    res = client.post("/api/session/watchlist", json={"tickers": []})
    assert res.status_code == 200
    assert res.json()["watchlist_tickers"] == []

def test_watchlist_duplicate_prevention():
    res = client.post("/api/session/watchlist", json={"tickers": ["TCS", "TCS", "INFY"]})
    assert res.status_code == 200
    assert res.json()["watchlist_tickers"] == ["TCS", "INFY"]

def test_watchlist_invalid_ticker():
    res = client.post("/api/session/watchlist", json={"tickers": ["TCS", "INVALID_STOCK"]})
    assert res.status_code == 400
    assert "Invalid or unknown ticker" in res.json()["detail"]

    # Verify state wasn't partially updated
    updated = session_store.get_session(DEFAULT_USER)
    assert "INVALID_STOCK" not in updated.watchlist_tickers
