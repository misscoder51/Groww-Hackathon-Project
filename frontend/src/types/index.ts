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
