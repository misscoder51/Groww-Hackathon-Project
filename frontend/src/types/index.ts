export interface MarketEvent {
  ticker?: string;
  sector?: string;
  event_type: string;
  timestamp: string;
  title: string;
  description: string;
  source: string;
  confidence: string;
}

export interface AttentionScoreResult {
  ticker: string;
  delta_stock: number;
  delta_sector: number;
  alpha: number;
  volume_ratio: number;
  has_corporate_action: boolean;
  catalyst?: MarketEvent;
  score: number;
  classification: 'major_change' | 'moderate_change' | 'unchanged';
}

export interface AttentionInboxResponse {
  is_stale: boolean;
  results: AttentionScoreResult[];
  summary: {
    major_changes: number;
    moderate_changes: number;
    unchanged: number;
  };
  message?: string;
}

export interface UserSession {
  user_id: string;
  last_viewed_at: string;
  watchlist_tickers: string[];
}

export interface StockDetailResponse {
  ticker: string;
  company: string;
  current_price: number;
  baseline_price: number;
  raw_delta: number;
  sector_delta: number;
  beta: number;
  alpha: number;
  volume_ratio: number;
  attention_score: number;
  classification: string;
  corporate_action: boolean;
  catalyst?: MarketEvent;
  stale: boolean;
  error?: string;
}

export interface MarketStory {
  title: string;
  description: string;
  type: string;
  affected: string[];
}

export interface MarketStoriesResponse {
  stories: MarketStory[];
  stale: boolean;
}


export interface StockListItem {
  ticker: string;
  company: string;
  current_price: number;
  sector: string;
}

export interface StockHistoryResponse {
  ticker: string;
  company: string;
  history: { timestamp: string; price: number }[];
  context: AttentionScoreResult | null;
}
