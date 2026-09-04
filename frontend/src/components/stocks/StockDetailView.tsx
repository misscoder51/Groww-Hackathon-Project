import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { StockHistoryResponse } from "@/types";
import { ChevronLeft, Calculator, Activity } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const StockDetailView = ({ ticker, onBack }: { ticker: string; onBack: () => void }) => {
  const [data, setData] = useState<StockHistoryResponse | null>(null);
  const [range, setRange] = useState("1M");
  const [loading, setLoading] = useState(true);
  
  const [investAmount, setInvestAmount] = useState<string>("25000");
  const [historicalAmount, setHistoricalAmount] = useState<string>("10000");

  useEffect(() => {
    setLoading(true);
    api.getStockHistory(ticker, range).then(d => {
      setData(d);
      setLoading(false);
    }).catch(console.error);
  }, [ticker, range]);

  const formatPercent = (val: number) => (val >= 0 ? "+" : "") + (val * 100).toFixed(2) + "%";

  if (loading && !data) {
    return <div className="p-10 text-center animate-pulse text-gray-500 dark:text-slate-400">Loading {ticker}...</div>;
  }

  if (!data) return null;

  const currentPrice = data.history[data.history.length - 1].price;
  const firstPrice = data.history[0].price;
  const deltaRaw = currentPrice - firstPrice;
  const deltaPct = deltaRaw / firstPrice;
  const isPositive = deltaPct >= 0;

  // Calculators
  const investVal = parseFloat(investAmount) || 0;
  const shares = Math.floor(investVal / currentPrice);
  const remaining = investVal - (shares * currentPrice);

  const histVal = parseFloat(historicalAmount) || 0;
  const histShares = histVal / firstPrice;
  const histCurrentVal = histShares * currentPrice;
  const histReturn = histCurrentVal - histVal;
  const histReturnPct = histVal > 0 ? (histCurrentVal - histVal) / histVal : 0;

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-8 py-8 space-y-8">
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300">
        <ChevronLeft className="w-4 h-4" /> Back to Stocks
      </button>

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100 tracking-tight">{data.ticker}</h1>
          <p className="text-gray-500 dark:text-slate-400 font-medium">{data.company}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-slate-100">₹{currentPrice.toFixed(2)}</div>
          <div className={`text-lg font-semibold tracking-tight ${isPositive ? 'text-teal-600 dark:text-teal-400' : 'text-red-500 dark:text-red-400'}`}>
            {formatPercent(deltaPct)}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          {["1D", "1W", "1M"].map(r => (
            <button 
              key={r} 
              onClick={() => setRange(r)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${range === r ? 'bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.history} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? "#0d9488" : "#ef4444"} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={isPositive ? "#0d9488" : "#ef4444"} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="timestamp" hide />
              <YAxis domain={['auto', 'auto']} hide />
              <Tooltip 
                cursor={{ stroke: '#6b7280', strokeWidth: 1, strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const date = new Date(payload[0].payload.timestamp);
                    return (
                      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm rounded-lg p-3">
                        <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">₹{Number(payload[0].value).toFixed(2)}</div>
                        <div className="text-xs text-gray-500 dark:text-slate-400">{date.toLocaleDateString()} {date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="price" stroke={isPositive ? "#0d9488" : "#ef4444"} strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Context Insight */}
      {data.context && data.context.classification !== 'unchanged' && (
        <div className="bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/50 p-6 rounded-xl shadow-sm mt-8">
          <h3 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Activity className="w-4 h-4" /> Context Insight
          </h3>
          <p className="text-gray-900 dark:text-slate-100 font-medium mb-4">
            {data.company} is {data.context.delta_stock < 0 ? 'falling' : 'rising'} {Math.abs(data.context.alpha) > 0.01 ? 'more than' : 'in line with'} the {data.context.catalyst?.sector || 'IT'} sector.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <div>
              <span className="text-gray-500 dark:text-slate-400 block mb-1">Stock Move</span>
              <span className={`font-bold ${data.context.delta_stock >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-red-500 dark:text-red-400'}`}>{formatPercent(data.context.delta_stock)}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-slate-400 block mb-1">Sector Move</span>
              <span className="font-bold text-gray-700 dark:text-slate-300">{formatPercent(data.context.delta_sector)}</span>
            </div>
            {data.context.catalyst && (
              <div className="pl-6 border-l border-gray-200 dark:border-slate-700">
                <span className="text-gray-500 dark:text-slate-400 block mb-1">Catalyst</span>
                <span className="font-semibold text-gray-900 dark:text-slate-200">{data.context.catalyst.title}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Calculators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold text-gray-900 dark:text-slate-100 mb-4 flex items-center gap-2"><Calculator className="w-4 h-4" /> Investment Calculator</h3>
          <label className="block text-sm text-gray-500 dark:text-slate-400 mb-2">How much do you want to invest?</label>
          <div className="relative mb-6">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400 font-medium">₹</span>
            <input type="number" value={investAmount} onChange={e => setInvestAmount(e.target.value)} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg pl-8 pr-4 py-2.5 font-semibold text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none" />
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-800">
            <span className="text-gray-500 dark:text-slate-400 text-sm">Whole shares</span>
            <span className="font-bold text-gray-900 dark:text-slate-100">{shares}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-500 dark:text-slate-400 text-sm">Remaining cash</span>
            <span className="font-bold text-gray-900 dark:text-slate-100">₹{remaining.toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold text-gray-900 dark:text-slate-100 mb-4">Historical Return ({range})</h3>
          <label className="block text-sm text-gray-500 dark:text-slate-400 mb-2">What if I invested earlier?</label>
          <div className="relative mb-6">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400 font-medium">₹</span>
            <input type="number" value={historicalAmount} onChange={e => setHistoricalAmount(e.target.value)} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg pl-8 pr-4 py-2.5 font-semibold text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none" />
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-800">
            <span className="text-gray-500 dark:text-slate-400 text-sm">Hypothetical historical value</span>
            <span className="font-bold text-gray-900 dark:text-slate-100">₹{histCurrentVal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-500 dark:text-slate-400 text-sm">Historical return</span>
            <span className={`font-bold ${histReturn >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-red-500 dark:text-red-400'}`}>
              {histReturn >= 0 ? '+' : ''}₹{Math.abs(histReturn).toFixed(2)} ({formatPercent(histReturnPct)})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};