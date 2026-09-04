from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class UserSession(BaseModel):
    user_id: str
    last_viewed_at: datetime
    watchlist_tickers: List[str]

class StockMetadata(BaseModel):
    ticker: str
    company_name: str
    sector_id: str
    beta_coefficient: float
    avg_30d_volume: float

class HistoricalPrice(BaseModel):
    ticker: str
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: int

class CorporateAction(BaseModel):
    ticker: str
    action_type: str
    effective_date: datetime
    description: str

class MarketEvent(BaseModel):
    ticker: Optional[str] = None
    sector: Optional[str] = None
    event_type: str
    timestamp: datetime
    title: str
    description: str
    source: str
    confidence: str # High, Medium, Low
