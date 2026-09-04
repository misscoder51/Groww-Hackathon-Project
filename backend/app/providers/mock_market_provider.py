from typing import List, Optional
from datetime import datetime, timedelta, timezone
import random
from app.schemas.domain import StockMetadata, HistoricalPrice, CorporateAction, MarketEvent
from app.providers.market_data_provider import MarketDataProvider

class MockMarketProvider(MarketDataProvider):
    def __init__(self):
        self.chaos_mode = False
        self.scenario = "all" # Can be: normal, stock_specific, sector_wide, unusual_volume, corporate_action, api_failure, all
        self.base_time = datetime.now(timezone.utc)
        # Seed deterministic data
        random.seed(42)
        
        self.metadata = {
            "TCS": StockMetadata(ticker="TCS", company_name="Tata Consultancy Services", sector_id="IT", beta_coefficient=1.1, avg_30d_volume=2000000),
            "INFY": StockMetadata(ticker="INFY", company_name="Infosys", sector_id="IT", beta_coefficient=1.2, avg_30d_volume=3000000),
            "RELIANCE": StockMetadata(ticker="RELIANCE", company_name="Reliance Industries", sector_id="ENERGY", beta_coefficient=1.0, avg_30d_volume=5000000),
            "HDFCBANK": StockMetadata(ticker="HDFCBANK", company_name="HDFC Bank", sector_id="BANKING", beta_coefficient=1.3, avg_30d_volume=4500000),
            "ITC": StockMetadata(ticker="ITC", company_name="ITC Limited", sector_id="FMCG", beta_coefficient=0.8, avg_30d_volume=6000000),
        }

    def get_stock_metadata(self, ticker: str) -> Optional[StockMetadata]:
        if self.chaos_mode or self.scenario == "api_failure":
            raise ConnectionError("Chaos mode active: Provider unavailable")
        return self.metadata.get(ticker)

    def _generate_deterministic_prices(self, ticker: str, start: datetime, end: datetime) -> List[HistoricalPrice]:
        prices = []
        current_time = start
        base_price = 1000.0 if ticker != "RELIANCE" else 2500.0
        
        # We need the events to happen between start and end (which is usually last 6 hours)
        # So we trigger changes at end - 3 hours.
        event_time = end - timedelta(hours=3)
        
        while current_time <= end:
            # Deterministic noise based on time and ticker
            random.seed(f"{ticker}_{current_time.isoformat()}")
            noise = (random.random() - 0.5) * 5
            price = base_price + noise
            volume = self.metadata[ticker].avg_30d_volume / 24 # roughly hourly volume
            
            if current_time >= event_time:
                # Apply scenario logic
                if self.scenario in ["stock_specific", "all"] and ticker == "TCS":
                    price = base_price * 0.958 # -4.2%
                    
                if self.scenario in ["unusual_volume", "all"] and ticker == "RELIANCE":
                    volume = self.metadata[ticker].avg_30d_volume * 3.1 / 24 # 3.1x volume
                    price = base_price * 1.031 # +3.1%
                    
                if self.scenario in ["sector_wide", "all"] and ticker in ["TCS", "INFY"]:
                    if ticker == "INFY":
                        price = base_price * 0.981 # -1.9%
                    elif ticker == "TCS" and self.scenario == "sector_wide":
                        # If only sector wide, TCS also moves down ~1.8%
                        price = base_price * 0.982
                        
                if self.scenario in ["corporate_action", "all"] and ticker == "ITC":
                    price = base_price * 0.90 # 10% drop due to dividend ex-date

            prices.append(HistoricalPrice(
                ticker=ticker,
                timestamp=current_time,
                open=price,
                high=price + 2,
                low=price - 2,
                close=price,
                volume=int(volume)
            ))
            current_time += timedelta(hours=1)
        return prices

    def get_historical_prices(self, ticker: str, start_time: datetime, end_time: datetime) -> List[HistoricalPrice]:
        if self.chaos_mode or self.scenario == "api_failure":
            raise ConnectionError("Chaos mode active: Provider unavailable")
        return self._generate_deterministic_prices(ticker, start_time, end_time)

    def get_latest_price(self, ticker: str) -> Optional[HistoricalPrice]:
        if self.chaos_mode or self.scenario == "api_failure":
            raise ConnectionError("Chaos mode active: Provider unavailable")
        prices = self._generate_deterministic_prices(ticker, datetime.now(timezone.utc) - timedelta(hours=1), datetime.now(timezone.utc))
        return prices[-1] if prices else None

    def get_corporate_actions(self, ticker: str, start_time: datetime, end_time: datetime) -> List[CorporateAction]:
        if self.chaos_mode or self.scenario == "api_failure":
            raise ConnectionError("Chaos mode active: Provider unavailable")
        actions = []
        if self.scenario in ["corporate_action", "all"] and ticker == "ITC":
            actions.append(CorporateAction(
                ticker="ITC",
                action_type="Dividend",
                effective_date=end_time - timedelta(hours=2),
                description="Special Dividend Ex-Date"
            ))
        return actions

    def get_market_events(self, ticker: Optional[str] = None, sector: Optional[str] = None, start_time: Optional[datetime] = None) -> List[MarketEvent]:
        if self.chaos_mode or self.scenario == "api_failure":
            raise ConnectionError("Chaos mode active: Provider unavailable")
        events = []
        if self.scenario in ["stock_specific", "all"] and ticker == "TCS":
            events.append(MarketEvent(
                ticker="TCS",
                sector="IT",
                event_type="News",
                timestamp=datetime.now(timezone.utc) - timedelta(hours=4),
                title="Weak guidance update",
                description="TCS reports weaker than expected forward guidance.",
                source="NewsFeed",
                confidence="High"
            ))
        return events
