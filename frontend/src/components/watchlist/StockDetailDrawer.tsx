"use client";

import { useEffect, useState } from "react";
import { StockDetailResponse } from "@/types";
import { api } from "@/lib/api";
import { X, TrendingUp, TrendingDown, Info, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts";

export const StockDetailDrawer = ({ ticker, onClose }: { ticker: string | null, onClose: () => void }) => {
  const [detail, setDetail] = useState<StockDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ticker) {
      setLoading(true);
      api.getStockDetail(ticker).then(data => {
        setDetail(data);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    } else {
      setDetail(null);
    }
  }, [ticker]);

  const formatPercent = (val: number) => (val * 100).toFixed(2) + "%";
  
  // Create mock chart data using the actual baseline and current
  const chartData = detail ? [
    { time: 'Baseline', price: detail.baseline_price },
    { time: 'Mid', price: detail.baseline_price + (detail.current_price - detail.baseline_price) * 0.3 },
    { time: 'Current', price: detail.current_price }
  ] : [];

  const getSoWhat = (d: StockDetailResponse) => {
    if (d.catalyst) {
      return `${d.company} is moving on news: "${d.catalyst.title}". The system flagged this because it is moving significantly more than other stocks in its sector.`;
    }
    if (d.volume_ratio > 2) {
      return `${d.company} is experiencing unusually high trading activity (${d.volume_ratio.toFixed(1)}x normal), but we have not identified a specific news event causing it.`;
    }
    if (Math.abs(d.alpha) > 0.02) {
      return `${d.company} is ${d.raw_delta < 0 ? 'falling' : 'rising'} significantly more than its sector average. This indicates the movement is specific to this company rather than a general market trend.`;
    }
    return `Most of this movement is explained by broader trends in the sector.`;
  };

  return (
    <AnimatePresence>
      {ticker && (
        <motion.div key="drawer-wrapper" className="fixed inset-0 z-50">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute inset-y-0 right-0 w-full sm:w-[500px] bg-neutral-950 border-l border-neutral-800 overflow-y-auto"
          >
            <div className="p-6">
              <button onClick={onClose} className="p-2 bg-neutral-900 rounded-full text-neutral-400 hover:text-white mb-6">
                <X className="w-5 h-5" />
              </button>

              {loading ? (
                <div className="animate-pulse space-y-6">
                  <div className="h-6 bg-neutral-800 rounded w-1/3" />
                  <div className="h-24 bg-neutral-800 rounded" />
                </div>
              ) : detail ? (
                <div className="space-y-8">
                  
                  {/* Header */}
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white">{detail.ticker}</h2>
                    <p className="text-neutral-400 text-sm">{detail.company}</p>
                    
                    <div className="mt-4 flex items-baseline gap-3">
                      <span className="text-3xl font-semibold tracking-tight text-white">₹{detail.current_price.toFixed(2)}</span>
                      <span className={`text-lg font-medium ${detail.raw_delta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {detail.raw_delta >= 0 ? '+' : ''}{formatPercent(detail.raw_delta)}
                      </span>
                    </div>
                  </div>

                  {/* WHY YOU'RE SEEING THIS */}
                  <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
                    <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Why you're seeing this</h3>
                    <p className="text-neutral-200 text-base leading-relaxed">
                      {getSoWhat(detail)}
                    </p>
                  </div>

                  {/* WHAT THE ENGINE SEES */}
                  <div>
                    <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5" /> What the engine sees
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 bg-neutral-950 border border-neutral-800/50 p-4 rounded-lg">
                        <div className="mt-0.5"><div className={`w-2 h-2 rounded-full ${Math.abs(detail.alpha) > 0.02 ? 'bg-orange-500' : 'bg-neutral-600'}`} /></div>
                        <div>
                          <p className="text-sm font-medium text-white">{Math.abs(detail.alpha) > 0.02 ? "Moving independently from its sector" : "Moving in line with its sector"}</p>
                          <p className="text-xs text-neutral-400 mt-1">
                            {Math.abs(detail.alpha) > 0.02 ? "The stock is showing price action that cannot be fully explained by broader market trends." : "Most of this movement is explained by broader trends."}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 bg-neutral-950 border border-neutral-800/50 p-4 rounded-lg">
                        <div className="mt-0.5"><div className={`w-2 h-2 rounded-full ${detail.volume_ratio > 1.5 ? 'bg-orange-500' : 'bg-neutral-600'}`} /></div>
                        <div>
                          <p className="text-sm font-medium text-white">{detail.volume_ratio > 1.5 ? "Unusually high trading activity" : "Normal trading volume"}</p>
                          <p className="text-xs text-neutral-400 mt-1">
                            {detail.volume_ratio > 1.5 ? `Trading volume is ${detail.volume_ratio.toFixed(1)}x normal levels.` : "Volume is consistent with typical trading days."}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 bg-neutral-950 border border-neutral-800/50 p-4 rounded-lg">
                        <div className="mt-0.5"><div className={`w-2 h-2 rounded-full ${detail.catalyst || detail.corporate_action ? 'bg-orange-500' : 'bg-neutral-600'}`} /></div>
                        <div>
                          <p className="text-sm font-medium text-white">{detail.catalyst ? "Catalyst identified" : detail.corporate_action ? "Corporate action active" : "No known catalyst"}</p>
                          <p className="text-xs text-neutral-400 mt-1">
                            {detail.catalyst ? "We found recent news that helps explain this move." : detail.corporate_action ? "A scheduled corporate event is affecting the price." : "We haven't identified any specific news causing this move."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ATTENTION TRACE */}
                  <div className="border-t border-neutral-900 pt-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                        Technical Attention Trace
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-neutral-500">SCORE</span>
                        <span className="text-lg font-bold text-white">{detail.attention_score}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm font-mono opacity-70 hover:opacity-100 transition-opacity">
                      <div className="flex justify-between py-1 border-b border-neutral-800/50">
                        <span className="text-neutral-500">Raw price move</span>
                        <span className={`font-medium ${detail.raw_delta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatPercent(detail.raw_delta)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-neutral-800/50">
                        <span className="text-neutral-500">Sector move</span>
                        <span className="text-neutral-300">{formatPercent(detail.sector_delta)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-neutral-800/50">
                        <span className="text-neutral-500">Beta</span>
                        <span className="text-neutral-300">{detail.beta.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-neutral-800/50">
                        <span className="text-neutral-500">Noise-adjusted alpha</span>
                        <span className={`font-medium ${detail.alpha >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatPercent(detail.alpha)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-neutral-800/50">
                        <span className="text-neutral-500">Volume ratio</span>
                        <span className="text-neutral-300">{detail.volume_ratio.toFixed(2)}x</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-neutral-500">Corp Action / Catalyst</span>
                        <span className="text-neutral-300">{Number(detail.corporate_action)} / {Number(!!detail.catalyst)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="pt-2">
                    <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Price Action</h3>
                    <div className="h-48 w-full border border-neutral-800 rounded-xl p-3 bg-black">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={detail.raw_delta >= 0 ? "#10b981" : "#ef4444"} stopOpacity={0.2}/>
                              <stop offset="95%" stopColor={detail.raw_delta >= 0 ? "#10b981" : "#ef4444"} stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#262626', fontSize: '12px' }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(value: any) => [`₹${Number(value).toFixed(2)}`, 'Price']}
                          />
                          <ReferenceLine y={detail.baseline_price} stroke="#404040" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Your last check', fill: '#737373', fontSize: 11 }} />
                          <Area type="monotone" dataKey="price" stroke={detail.raw_delta >= 0 ? "#10b981" : "#ef4444"} strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="text-red-400">Failed to load data.</div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
