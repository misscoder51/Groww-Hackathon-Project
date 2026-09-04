from typing import List, Optional
from datetime import datetime
from app.schemas.domain import StockMetadata, HistoricalPrice, CorporateAction, MarketEvent

class MarketDataProvider:
    def get_stock_metadata(self, ticker: str) -> Optional[StockMetadata]:
        raise NotImplementedError

    def get_historical_prices(self, ticker: str, start_time: datetime, end_time: datetime) -> List[HistoricalPrice]:
        raise NotImplementedError

    def get_latest_price(self, ticker: str) -> Optional[HistoricalPrice]:
        raise NotImplementedError

    def get_corporate_actions(self, ticker: str, start_time: datetime, end_time: datetime) -> List[CorporateAction]:
        raise NotImplementedError

    def get_market_events(self, ticker: Optional[str] = None, sector: Optional[str] = None, start_time: Optional[datetime] = None) -> List[MarketEvent]:
        raise NotImplementedError
