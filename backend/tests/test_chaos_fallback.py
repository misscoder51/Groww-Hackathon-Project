from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_chaos_fallback():
    # 1. Normal state should not be stale
    client.post("/api/chaos/toggle", json={"enabled": False})
    res = client.get("/api/attention-inbox")
    assert res.status_code == 200
    assert res.json()["is_stale"] == False
    
    # 2. Enable chaos
    client.post("/api/chaos/toggle", json={"enabled": True})
    
    # 3. First few requests might fail directly or be blocked by circuit breaker
    # The circuit breaker should eventually open and mark as stale
    for _ in range(4):
        res = client.get("/api/attention-inbox")
    
    assert res.status_code == 200
    assert res.json()["is_stale"] == True
    assert "results" in res.json()
    
    # Reset
    client.post("/api/chaos/toggle", json={"enabled": False})
