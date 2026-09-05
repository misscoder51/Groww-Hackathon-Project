import asyncio
from unittest.mock import MagicMock
from datetime import datetime, timedelta, timezone
from app.api.endpoints import attention_stream, market_provider, session_store, DEFAULT_USER

def test_sse_endpoint():
    market_provider.scenario = "stock_specific"
    session = session_store.get_session(DEFAULT_USER)
    if session:
        session.last_viewed_at = datetime.now(timezone.utc) - timedelta(hours=6)
        session_store.create_or_update_session(session)
        
    async def run_check():
        req = MagicMock()
        resp = await attention_stream(req)
        assert resp.status_code == 200
        assert resp.media_type == "text/event-stream"
        
        async for chunk in resp.body_iterator:
            assert chunk.startswith("data: ")
            assert "TCS" in chunk
            break

    asyncio.run(run_check())
