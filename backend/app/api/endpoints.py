from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta, timezone
from app.providers.mock_market_provider import MockMarketProvider
from app.services.attention_engine import AttentionEngine
from app.services.circuit_breaker import CircuitBreaker
from app.services.session_engine import SessionStore
from app.schemas.domain import UserSession
from pydantic import BaseModel
import random

router = APIRouter()

# Dependency Injection
market_provider = MockMarketProvider()
attention_engine = AttentionEngine()
circuit_breaker = CircuitBreaker()
session_store = SessionStore()

# Seed a default session if not exists
DEFAULT_USER = "user_123"
if not session_store.get_session(DEFAULT_USER):
    session_store.create_or_update_session(UserSession(
        user_id=DEFAULT_USER,
        last_viewed_at=datetime.now(timezone.utc) - timedelta(hours=6),
        watchlist_tickers=["TCS", "INFY", "RELIANCE", "HDFCBANK", "ITC"]
    ))

class ChaosToggleRequest(BaseModel):
    enabled: bool

class ScenarioRequest(BaseModel):
    scenario: str

@router.post("/chaos/toggle")
def toggle_chaos(request: ChaosToggleRequest):
    market_provider.chaos_mode = request.enabled
    return {"chaos_mode": market_provider.chaos_mode}

@router.post("/scenario")
def set_scenario(request: ScenarioRequest):
    market_provider.scenario = request.scenario
    return {"scenario": market_provider.scenario}

@router.get("/session")
def get_session():
    session = session_store.get_session(DEFAULT_USER)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

def compute_stock_attention(ticker: str, baseline_time: datetime, current_time: datetime) -> Optional[Any]:
    meta = market_provider.get_stock_metadata(ticker)
    if not meta: return None
        
    historical = market_provider.get_historical_prices(ticker, baseline_time, current_time)
    if not historical or len(historical) < 2: return None
        
    baseline_price = historical[0].close
    current_price = historical[-1].close
    current_volume = historical[-1].volume
    
    # Mock sector data properly
    sector_baseline = 1000.0
    sector_current = 1000.0
    if market_provider.scenario in ["sector_wide", "all"] and meta.sector_id == "IT":
        sector_current = 985.0 # -1.5% sector move
    elif meta.sector_id == "IT":
        sector_current = 998.0 # Normal small noise

    actions = market_provider.get_corporate_actions(ticker, baseline_time, current_time)
    events = market_provider.get_market_events(ticker=ticker, sector=meta.sector_id, start_time=baseline_time)
    
    return attention_engine.calculate_attention(
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

@router.get("/attention-inbox")
def get_attention_inbox():
    session = session_store.get_session(DEFAULT_USER)
    baseline_time = session.last_viewed_at
    current_time = datetime.now(timezone.utc)
    
    is_stale = False
    if not circuit_breaker.can_execute():
        is_stale = True
        
    results = []
    
    for ticker in session.watchlist_tickers:
        try:
            res = compute_stock_attention(ticker, baseline_time, current_time)
            if res:
                results.append(res)
            circuit_breaker.record_success()
        except Exception as e:
            circuit_breaker.record_failure()
            is_stale = True
            
    if is_stale:
        return {"is_stale": True, "results": [r.__dict__ for r in results] if results else [], "message": "Market data provider is degraded. Showing cached data.", "summary": {"major_changes": 0, "moderate_changes": 0, "unchanged": 0}}
        
    return {
        "is_stale": False,
        "results": [r.__dict__ for r in results],
        "summary": {
            "major_changes": len([r for r in results if r.classification == 'major_change']),
            "moderate_changes": len([r for r in results if r.classification == 'moderate_change']),
            "unchanged": len([r for r in results if r.classification == 'unchanged'])
        }
    }

@router.post("/session/acknowledge")
def acknowledge_session():
    current_time = datetime.now(timezone.utc)
    session_store.update_last_viewed(DEFAULT_USER, current_time)
    return {"status": "success", "last_viewed_at": current_time}

@router.get("/stocks/{ticker}")
def get_stock(ticker: str):
    session = session_store.get_session(DEFAULT_USER)
    baseline_time = session.last_viewed_at
    current_time = datetime.now(timezone.utc)
    
    try:
        meta = market_provider.get_stock_metadata(ticker)
        if not meta: raise HTTPException(status_code=404, detail="Not found")
        
        res = compute_stock_attention(ticker, baseline_time, current_time)
        if not res: raise HTTPException(status_code=500, detail="Could not compute")
        
        historical = market_provider.get_historical_prices(ticker, baseline_time, current_time)
        
        return {
            "ticker": ticker,
            "company": meta.company_name,
            "current_price": historical[-1].close,
            "baseline_price": historical[0].close,
            "raw_delta": res.delta_stock,
            "sector_delta": res.delta_sector,
            "beta": meta.beta_coefficient,
            "alpha": res.alpha,
            "volume_ratio": res.volume_ratio,
            "attention_score": res.score,
            "classification": res.classification,
            "corporate_action": res.has_corporate_action,
            "catalyst": res.catalyst.__dict__ if res.catalyst else None,
            "stale": False
        }
    except Exception as e:
        return {"stale": True, "error": str(e)}

@router.get("/market-stories")
def get_market_stories():
    if market_provider.chaos_mode or market_provider.scenario == "api_failure":
        return {"stories": [], "stale": True}
        
    stories = []
    if market_provider.scenario in ["sector_wide", "all"]:
        stories.append({
            "title": "IT SECTOR WEAKNESS",
            "description": "The IT sector is down 1.5%. TCS and INFY are underperforming.",
            "type": "sector",
            "affected": ["TCS", "INFY"]
        })
    if market_provider.scenario in ["stock_specific", "all"]:
        stories.append({
            "title": "TCS GUIDANCE",
            "description": "TCS drops 4.2% on weak guidance, underperforming sector.",
            "type": "stock",
            "affected": ["TCS"]
        })
    if market_provider.scenario in ["unusual_volume", "all"]:
        stories.append({
            "title": "RELIANCE VOLUME SPIKE",
            "description": "Reliance trading at 3x normal volume.",
            "type": "stock",
            "affected": ["RELIANCE"]
        })
    return {"stories": stories, "stale": False}
