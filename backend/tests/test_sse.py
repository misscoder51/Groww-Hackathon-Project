import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.api.endpoints import market_provider

client = TestClient(app)

def test_sse_endpoint():
    market_provider.scenario = "stock_specific"
    with client.stream("GET", "/api/attention-stream") as response:
        assert response.status_code == 200
        assert "text/event-stream" in response.headers["content-type"]
        for line in response.iter_lines():
            if line and line.startswith("data: "):
                assert "TCS" in line
                break
