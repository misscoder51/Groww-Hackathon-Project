import sqlite3
from datetime import datetime, timezone
import json
from typing import List, Optional
from app.schemas.domain import UserSession

class SessionStore:
    def __init__(self, db_path="data/market.db"):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS sessions (
                    user_id TEXT PRIMARY KEY,
                    last_viewed_at TEXT NOT NULL,
                    watchlist_tickers TEXT NOT NULL
                )
            """)
            conn.commit()

    def get_session(self, user_id: str) -> Optional[UserSession]:
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT user_id, last_viewed_at, watchlist_tickers FROM sessions WHERE user_id = ?", (user_id,))
            row = cursor.fetchone()
            if row:
                uid, lva, wlt = row
                return UserSession(
                    user_id=uid,
                    last_viewed_at=datetime.fromisoformat(lva),
                    watchlist_tickers=json.loads(wlt)
                )
            return None

    def create_or_update_session(self, session: UserSession):
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO sessions (user_id, last_viewed_at, watchlist_tickers)
                VALUES (?, ?, ?)
                ON CONFLICT(user_id) DO UPDATE SET
                    last_viewed_at=excluded.last_viewed_at,
                    watchlist_tickers=excluded.watchlist_tickers
            """, (session.user_id, session.last_viewed_at.isoformat(), json.dumps(session.watchlist_tickers)))
            conn.commit()

    def update_last_viewed(self, user_id: str, viewed_at: datetime):
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE sessions SET last_viewed_at = ? WHERE user_id = ?
            """, (viewed_at.isoformat(), user_id))
            conn.commit()
