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
      return `${d.company} is moving on news: "${d.catalyst.title}". The Attention Engine flagged this due to a significant alpha of ${formatPercent(d.alpha)} against its sector.`;
    }
    if (d.volume_ratio > 2) {
      return `${d.company} is moving sharply with unusually high volume (${d.volume_ratio.toFixed(1)}x normal), but no confirmed catalyst has been identified.`;
    }
    if (Math.abs(d.alpha) > 0.02) {
      return `${d.company} is moving significantly more than the sector average, indicating that this move is stock-specific and not fully explained by broader market trends.`;
    }
    return `This movement is primarily in line with the sector's performance (Beta: ${d.beta}).`;
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

                  {/* SO WHAT */}
                  <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl">
                    <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Why you're seeing this</h3>
                    <p className="text-neutral-300 text-sm leading-relaxed">
                      {getSoWhat(detail)}
                    </p>
                  </div>

                  {/* Chart */}
                  <div className="h-40 w-full border border-neutral-800 rounded-xl p-3 bg-black">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={detail.raw_delta >= 0 ? "#10b981" : "#ef4444"} stopOpacity={0.2}/>
                            <stop offset="95%" stopColor={detail.raw_delta >= 0 ? "#10b981" : "#ef4444"} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#262626', fontSize: '12px' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <ReferenceLine y={detail.baseline_price} stroke="#404040" strokeDasharray="3 3" />
                        <Area type="monotone" dataKey="price" stroke={detail.raw_delta >= 0 ? "#10b981" : "#ef4444"} strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* ATTENTION TRACE */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5" /> Attention Trace
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-neutral-500">SCORE</span>
                        <span className="text-lg font-bold text-white">{detail.attention_score}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-1.5 border-b border-neutral-800/50">
                        <span className="text-neutral-400">Price move</span>
                        <span className={`font-medium ${detail.raw_delta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatPercent(detail.raw_delta)}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-neutral-800/50">
                        <span className="text-neutral-400">Sector move</span>
                        <span className="text-neutral-200">{formatPercent(detail.sector_delta)}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-neutral-800/50">
                        <span className="text-neutral-400">Beta</span>
                        <span className="text-neutral-200">{detail.beta.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-neutral-800/50">
                        <span className="text-neutral-400">Noise-adjusted alpha</span>
                        <span className={`font-medium ${detail.alpha >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatPercent(detail.alpha)}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-neutral-800/50">
                        <span className="text-neutral-400">Volume</span>
                        <span className={detail.volume_ratio > 1.5 ? 'text-orange-400 font-medium' : 'text-neutral-200'}>{detail.volume_ratio.toFixed(1)}x normal</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-neutral-800/50">
                        <span className="text-neutral-400">Corporate action</span>
                        <span className="text-neutral-200">{detail.corporate_action ? 'Active' : 'None'}</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-neutral-400">Catalyst</span>
                        <span className="text-neutral-200">{detail.catalyst ? 'Found' : 'None'}</span>
                      </div>
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
