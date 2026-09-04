from typing import List, Dict, Any, Optional
import math
from datetime import datetime
from app.schemas.domain import StockMetadata, HistoricalPrice, CorporateAction, MarketEvent

class AttentionScoreResult:
    def __init__(self, ticker: str, delta_stock: float, delta_sector: float, 
                 alpha: float, volume_ratio: float, has_corporate_action: bool,
                 catalyst: Optional[MarketEvent], score: int, classification: str):
        self.ticker = ticker
        self.delta_stock = delta_stock
        self.delta_sector = delta_sector
        self.alpha = alpha
        self.volume_ratio = volume_ratio
        self.has_corporate_action = has_corporate_action
        self.catalyst = catalyst
        self.score = score
        self.classification = classification

class AttentionEngine:
    def calculate_alpha(self, delta_stock: float, beta: float, delta_sector: float) -> float:
        """
        Noise-adjusted alpha: alpha = delta_stock - (beta * delta_sector)
        """
        return delta_stock - (beta * delta_sector)

    def calculate_attention(self, 
                            ticker: str,
                            current_price: float, 
                            baseline_price: float,
                            sector_current: float,
                            sector_baseline: float,
                            beta: float,
                            current_volume: float,
                            avg_volume: float,
                            corporate_actions: List[CorporateAction],
                            events: List[MarketEvent]) -> AttentionScoreResult:
        
        # 1. Deltas
        delta_stock = (current_price - baseline_price) / baseline_price if baseline_price else 0
        delta_sector = (sector_current - sector_baseline) / sector_baseline if sector_baseline else 0
        
        # 2. Alpha
        alpha = self.calculate_alpha(delta_stock, beta, delta_sector)
        
        # 3. Volume Ratio
        volume_ratio = current_volume / avg_volume if avg_volume else 1.0
        
        # 4. Corporate Action Filter
        has_corp_action = len(corporate_actions) > 0
        
        # 5. Catalyst
        primary_catalyst = events[0] if events else None
        
        # 6. Attention Score
        if has_corp_action:
            score = 0
        else:
            # Simple transparent scoring
            # Base score from alpha (e.g., 5% alpha -> 50 points)
            alpha_score = abs(alpha) * 1000 
            # Bonus for unusual volume (e.g., 3x volume -> 20 points)
            volume_score = max(0, volume_ratio - 1) * 10
            # Bonus for catalyst
            event_score = 15 if primary_catalyst else 0
            
            score = min(100, int(alpha_score + volume_score + event_score))
            
        # 7. Classification
        if score > 40:
            classification = "major_change"
        elif score > 15:
            classification = "moderate_change"
        else:
            classification = "unchanged"
            
        return AttentionScoreResult(
            ticker=ticker,
            delta_stock=delta_stock,
            delta_sector=delta_sector,
            alpha=alpha,
            volume_ratio=volume_ratio,
            has_corporate_action=has_corp_action,
            catalyst=primary_catalyst,
            score=score,
            classification=classification
        )
