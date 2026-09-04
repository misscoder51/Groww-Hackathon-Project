import { AttentionInboxResponse, MarketStoriesResponse, StockDetailResponse, UserSession } from "@/types";

const API_BASE = "http://localhost:8000/api";

export const api = {
  async getSession(): Promise<UserSession> {
    const res = await fetch(`${API_BASE}/session`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch session");
    return res.json();
  },
  
  async getInbox(): Promise<AttentionInboxResponse> {
    const res = await fetch(`${API_BASE}/attention-inbox`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch inbox");
    return res.json();
  },

  async getStockDetail(ticker: string): Promise<StockDetailResponse> {
    const res = await fetch(`${API_BASE}/stocks/${ticker}`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch stock detail");
    return res.json();
  },

  async getStories(): Promise<MarketStoriesResponse> {
    const res = await fetch(`${API_BASE}/market-stories`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch market stories");
    return res.json();
  },

  async acknowledgeSession(): Promise<void> {
    const res = await fetch(`${API_BASE}/session/acknowledge`, { 
      method: "POST",
      cache: 'no-store'
    });
    if (!res.ok) throw new Error("Failed to acknowledge");
  },

  async updateWatchlist(tickers: string[]): Promise<void> {
    const res = await fetch(`${API_BASE}/session/watchlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tickers })
    });
    if (!res.ok) throw new Error("Failed to update watchlist");
  },

  async setChaos(enabled: boolean): Promise<void> {
    await fetch(`${API_BASE}/chaos/toggle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled })
    });
  },

  async setScenario(scenario: string): Promise<void> {
    await fetch(`${API_BASE}/scenario`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenario })
    });
  },

  getEventSourceURL(): string {
    return `${API_BASE}/attention-stream`;
  },

  async listStocks(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/stocks`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch stocks");
    return res.json();
  },

  async getStockHistory(ticker: string, range: string): Promise<any> {
    const res = await fetch(`${API_BASE}/stocks/${ticker}/history?range=${range}`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch stock history");
    return res.json();
  }
};
