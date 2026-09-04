from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from datetime import datetime, timedelta
from app.providers.mock_market_provider import MockMarketProvider
from app.services.attention_engine import AttentionEngine
from app.services.circuit_breaker import CircuitBreaker
from pydantic import BaseModel
import random

router = APIRouter()

# Dependency Injection
market_provider = MockMarketProvider()
attention_engine = AttentionEngine()
circuit_breaker = CircuitBreaker()

class ChaosToggleRequest(BaseModel):
    enabled: bool

class SessionResponse(BaseModel):
    user_id: str
    last_viewed_at: datetime
    watchlist_tickers: List[str]

@router.post("/chaos/toggle")
def toggle_chaos(request: ChaosToggleRequest):
    market_provider.chaos_mode = request.enabled
    return {"chaos_mode": market_provider.chaos_mode}

@router.get("/session", response_model=SessionResponse)
def get_session():
    # Mocking Redis session state for now
    # We pretend the user last checked 6 hours ago
    return SessionResponse(
        user_id="user_123",
        last_viewed_at=datetime.utcnow() - timedelta(hours=6),
        watchlist_tickers=["TCS", "INFY", "RELIANCE", "HDFCBANK", "ITC"]
    )

@router.get("/attention-inbox")
def get_attention_inbox():
    # 1. Get session (baseline)
    session = get_session()
    baseline_time = session.last_viewed_at
    current_time = datetime.utcnow()
    
    # 2. Check Circuit Breaker
    is_stale = False
    if not circuit_breaker.can_execute():
        is_stale = True
        # normally we'd return latest DB cache
        
    results = []
    
    for ticker in session.watchlist_tickers:
        try:
            # Simulate API call to provider
            meta = market_provider.get_stock_metadata(ticker)
            if not meta:
                continue
                
            historical = market_provider.get_historical_prices(ticker, baseline_time, current_time)
            if not historical:
                continue
                
            baseline_price = historical[0].close
            current_price = historical[-1].close
            current_volume = historical[-1].volume
            
            # Mock sector data
            sector_baseline = 1000.0
            sector_current = 992.0 if meta.sector_id == "IT" else 1005.0 # mock IT weakness
            
            actions = market_provider.get_corporate_actions(ticker, baseline_time, current_time)
            events = market_provider.get_market_events(ticker=ticker, sector=meta.sector_id, start_time=baseline_time)
            
            score_result = attention_engine.calculate_attention(
                ticker=ticker,
                current_price=current_price,
                baseline_price=baseline_price,
                sector_current=sector_current,
                sector_baseline=sector_baseline,
                beta=meta.beta_coefficient,
                current_volume=current_volume,
                avg_volume=meta.avg_30d_volume / 24, # hourly avg
                corporate_actions=actions,
                events=events
            )
            
            results.append(score_result)
            circuit_breaker.record_success()
            
        except Exception as e:
            circuit_breaker.record_failure()
            is_stale = True
            
    if is_stale:
        # Return whatever we can, flagged as stale
        return {"is_stale": True, "results": results, "message": "Market data provider is degraded. Showing cached data."}
        
    return {
        "is_stale": False,
        "results": [r.__dict__ for r in results],
        "summary": {
            "major_changes": len([r for r in results if r.classification == 'major_change']),
            "moderate_changes": len([r for r in results if r.classification == 'moderate_change']),
            "unchanged": len([r for r in results if r.classification == 'unchanged'])
        }
    }
