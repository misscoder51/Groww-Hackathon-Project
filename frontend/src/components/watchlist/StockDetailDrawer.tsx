import { useState, useEffect } from "react";
import { StockDetailResponse } from "@/types";
import { api } from "@/lib/api";
import { X, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer, Tooltip, ReferenceLine } from "recharts";

export const StockDetailDrawer = ({ ticker, onClose }: { ticker: string | null, onClose: () => void }) => {
  const [detail, setDetail] = useState<StockDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ticker) {
      setDetail(null);
      return;
    }

    const loadDetail = async () => {
      setLoading(true);
      try {
        const data = await api.getStockDetail(ticker);
        setDetail(data);
      } catch (err) {
        console.error("Failed to load stock details:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [ticker]);

  const formatPercent = (val: number) => (val >= 0 ? "+" : "") + (val * 100).toFixed(2) + "%";
  
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
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="fixed inset-0 z-50 flex justify-end bg-gray-900/20 dark:bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div 
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-full sm:w-[480px] h-full bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <div className="sticky top-0 z-10 flex justify-between items-center p-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-100 dark:border-slate-800">
                <button onClick={onClose} className="p-2 -ml-2 text-gray-400 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {loading ? (
                <div className="p-8 space-y-6 animate-pulse">
                  <div className="h-8 bg-gray-100 dark:bg-slate-800 rounded-lg w-1/3"></div>
                  <div className="h-4 bg-gray-100 dark:bg-slate-800 rounded-lg w-1/4"></div>
                  <div className="h-32 bg-gray-50 dark:bg-slate-800/50 rounded-xl mt-8"></div>
                  <div className="h-24 bg-gray-50 dark:bg-slate-800/50 rounded-xl"></div>
                </div>
              ) : detail ? (
                <div className="p-6 space-y-10">
                  {/* Header */}
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-slate-100">{detail.ticker}</h2>
                    <p className="text-gray-500 dark:text-slate-400 font-medium">{detail.company}</p>
                    <div className="mt-6 flex items-baseline gap-4">
                      <span className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-slate-100">
                        ₹{detail.current_price.toFixed(2)}
                      </span>
                      <span className={`text-lg font-semibold tracking-tight ${detail.raw_delta >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-red-500 dark:text-red-400'}`}>
                        {formatPercent(detail.raw_delta)}
                      </span>
                    </div>
                  </div>

                  {/* WHY YOU'RE SEEING THIS */}
                  <div className="bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/50 p-6 rounded-xl shadow-sm">
                    <h3 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3">Why this moved</h3>
                    <p className="text-gray-700 dark:text-slate-300 text-base leading-relaxed">
                      {getSoWhat(detail)}
                    </p>
                  </div>

                  {/* WHAT THE ENGINE SEES */}
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5" /> What we're seeing
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm p-4 rounded-lg">
                        <div className="mt-0.5"><div className={`w-2 h-2 rounded-full ${Math.abs(detail.alpha) > 0.02 ? 'bg-amber-500' : 'bg-gray-300 dark:bg-slate-600'}`} /></div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-slate-200">{Math.abs(detail.alpha) > 0.02 ? "Stock-specific weakness/strength" : "Moving in line with its sector"}</p>
                          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                            {Math.abs(detail.alpha) > 0.02 ? "The stock is showing price action that cannot be fully explained by broader market trends." : "Most of this movement is explained by broader trends."}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm p-4 rounded-lg">
                        <div className="mt-0.5"><div className={`w-2 h-2 rounded-full ${detail.volume_ratio > 1.5 ? 'bg-amber-500' : 'bg-gray-300 dark:bg-slate-600'}`} /></div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-slate-200">{detail.volume_ratio > 1.5 ? "Unusually high trading activity" : "Normal trading volume"}</p>
                          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                            {detail.volume_ratio > 1.5 ? `Trading volume is ${detail.volume_ratio.toFixed(1)}x normal levels.` : "Volume is consistent with typical trading days."}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm p-4 rounded-lg">
                        <div className="mt-0.5"><div className={`w-2 h-2 rounded-full ${detail.catalyst || detail.corporate_action ? 'bg-amber-500' : 'bg-gray-300 dark:bg-slate-600'}`} /></div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-slate-200">{detail.catalyst ? "Catalyst identified" : detail.corporate_action ? "Corporate action active" : "No known catalyst"}</p>
                          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                            {detail.catalyst ? "We found recent news that helps explain this move." : detail.corporate_action ? "A scheduled corporate event is affecting the price." : "We haven't identified any specific news causing this move."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ATTENTION TRACE */}
                  <div className="border-t border-gray-100 dark:border-slate-800 pt-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        See the numbers
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-400 dark:text-slate-500">ATTENTION SCORE</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-slate-100">{detail.attention_score} <span className="text-sm font-normal text-gray-400 dark:text-slate-500">/ 100</span></span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm font-mono opacity-80 hover:opacity-100 transition-opacity">
                      <div className="flex justify-between py-1 border-b border-gray-100 dark:border-slate-800">
                        <span className="text-gray-500 dark:text-slate-400">Raw move</span>
                        <span className={`font-medium ${detail.raw_delta >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-red-500 dark:text-red-400'}`}>{formatPercent(detail.raw_delta)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-100 dark:border-slate-800">
                        <span className="text-gray-500 dark:text-slate-400">Sector</span>
                        <span className="text-gray-700 dark:text-slate-300">{formatPercent(detail.sector_delta)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-100 dark:border-slate-800">
                        <span className="text-gray-500 dark:text-slate-400">Beta</span>
                        <span className="text-gray-700 dark:text-slate-300">{detail.beta.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-100 dark:border-slate-800">
                        <span className="text-gray-500 dark:text-slate-400">Alpha</span>
                        <span className={`font-medium ${detail.alpha >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-red-500 dark:text-red-400'}`}>{formatPercent(detail.alpha)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-100 dark:border-slate-800">
                        <span className="text-gray-500 dark:text-slate-400">Volume</span>
                        <span className="text-gray-700 dark:text-slate-300">{detail.volume_ratio.toFixed(2)}x</span>
                      </div>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="pt-4">
                    <div className="h-56 w-full rounded-xl bg-white dark:bg-slate-950 border border-transparent dark:border-slate-800">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={detail.raw_delta >= 0 ? "#0d9488" : "#ef4444"} stopOpacity={0.1}/>
                              <stop offset="95%" stopColor={detail.raw_delta >= 0 ? "#0d9488" : "#ef4444"} stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <Tooltip 
                            cursor={{ stroke: '#6b7280', strokeWidth: 1, strokeDasharray: '3 3' }}
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm rounded-lg p-2 text-xs font-semibold text-gray-900 dark:text-slate-100">
                                    ₹{Number(payload[0].value).toFixed(2)}
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <ReferenceLine y={detail.baseline_price} stroke="#d1d5db" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Your last check', fill: '#9ca3af', fontSize: 11 }} />
                          <Area type="monotone" dataKey="price" stroke={detail.raw_delta >= 0 ? "#0d9488" : "#ef4444"} strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="text-red-500 font-medium">Failed to load data.</div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
