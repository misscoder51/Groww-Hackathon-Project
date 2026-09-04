from app.services.attention_engine import AttentionEngine
from app.schemas.domain import CorporateAction, MarketEvent
from datetime import datetime

def test_alpha_calculation():
    engine = AttentionEngine()
    # stock moved 5%, sector moved 2%, beta is 1.5
    # alpha = 0.05 - (1.5 * 0.02) = 0.05 - 0.03 = 0.02
    alpha = engine.calculate_alpha(0.05, 1.5, 0.02)
    assert abs(alpha - 0.02) < 0.0001

def test_attention_scoring():
    engine = AttentionEngine()
    
    # 1. Normal unchanged stock
    res = engine.calculate_attention(
        "TEST", current_price=101, baseline_price=100, 
        sector_current=101, sector_baseline=100, beta=1.0,
        current_volume=1000, avg_volume=1000, corporate_actions=[], events=[]
    )
    assert res.classification == "unchanged"
    
    # 2. Corporate action false alarm
    ca = CorporateAction(ticker="TEST", action_type="Dividend", effective_date=datetime.utcnow(), description="Test")
    res = engine.calculate_attention(
        "TEST", current_price=90, baseline_price=100, 
        sector_current=100, sector_baseline=100, beta=1.0,
        current_volume=10000, avg_volume=1000, corporate_actions=[ca], events=[]
    )
    assert res.score == 0
    assert res.classification == "unchanged"

def test_major_change():
    engine = AttentionEngine()
    event = MarketEvent(event_type="News", timestamp=datetime.utcnow(), title="Test", description="Test", source="Test", confidence="High")
    res = engine.calculate_attention(
        "TEST", current_price=110, baseline_price=100, # 10% move
        sector_current=100, sector_baseline=100, beta=1.0, # sector 0%
        current_volume=3000, avg_volume=1000, # 3x volume
        corporate_actions=[], events=[event]
    )
    assert res.classification == "major_change"
    assert res.score > 50
