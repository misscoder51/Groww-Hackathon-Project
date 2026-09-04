"use client";

import { useEffect, useState } from "react";
import { AttentionInboxResponse, AttentionScoreResult } from "@/types";
import { AlertCircle, TrendingDown, TrendingUp, Info } from "lucide-react";
import { DitherWave } from "../ui/dither-wave";

export const AttentionInbox = () => {
  const [data, setData] = useState<AttentionInboxResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/attention-inbox")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-xl text-neutral-500">Scanning market changes...</div>
      </div>
    );
  }

  if (!data) return <div>Failed to load data.</div>;

  const { results, summary, is_stale, message } = data;
  const major = results.filter(r => r.classification === 'major_change');
  const moderate = results.filter(r => r.classification === 'moderate_change');

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
      {is_stale && (
        <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl text-orange-400 flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p>{message || "Showing cached data due to network instability."}</p>
        </div>
      )}

      <DitherWave className="rounded-3xl p-8 border border-neutral-800">
        <h1 className="text-4xl font-light tracking-tight mb-2">YOUR MARKET INBOX</h1>
        <p className="text-neutral-400 font-medium">Since you last checked</p>
      </DitherWave>

      <div className="pt-8 border-t border-neutral-800">
        <h2 className="text-xl font-medium mb-6">
          {summary.major_changes + summary.moderate_changes} things need your attention
        </h2>

        <div className="space-y-4">
          {major.map(item => <StockCard key={item.ticker} item={item} type="major" />)}
          {moderate.map(item => <StockCard key={item.ticker} item={item} type="moderate" />)}
        </div>
      </div>

      <div className="pt-8 border-t border-neutral-800 flex items-center gap-3 text-neutral-500">
        <Info className="w-5 h-5" />
        <p>{summary.unchanged} stocks showed no meaningful change.</p>
      </div>
    </div>
  );
};

const StockCard = ({ item, type }: { item: AttentionScoreResult, type: "major" | "moderate" }) => {
  const isPositive = item.delta_stock >= 0;
  const formatPercent = (val: number) => (val * 100).toFixed(1) + "%";
  
  return (
    <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${type === 'major' ? 'bg-red-500' : 'bg-orange-500'}`} />
          <h3 className="text-xl font-semibold">{item.ticker}</h3>
        </div>
        <div className={`text-xl font-medium flex items-center gap-2 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          {isPositive ? "+" : ""}{formatPercent(item.delta_stock)}
        </div>
      </div>

      <div className="space-y-2 text-sm text-neutral-400">
        {item.catalyst && (
          <p className="text-white font-medium">{item.catalyst.title}</p>
        )}
        {item.volume_ratio > 2 && (
          <p>Unusual volume ({item.volume_ratio.toFixed(1)}x normal)</p>
        )}
        {!item.catalyst && item.volume_ratio <= 2 && (
          <p>
            {item.delta_sector < -0.01 && item.delta_stock < 0 ? "Broad sector weakness" : "Unusual price movement"}
          </p>
        )}
      </div>
    </div>
  );
};
