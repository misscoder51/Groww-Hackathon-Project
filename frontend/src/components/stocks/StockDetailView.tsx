import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { StockHistoryResponse } from "@/types";
import { ChevronLeft, Calculator, Activity, Info } from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  ReferenceDot,
} from "recharts";

export const StockDetailView = ({
  ticker,
  onBack,
}: {
  ticker: string;
  onBack: () => void;
}) => {
  const [data, setData] = useState<StockHistoryResponse | null>(null);
  const [range, setRange] = useState<"1D" | "1W" | "1M">("1M");
  const [loading, setLoading] = useState(true);

  const [investAmount, setInvestAmount] = useState<string>("25000");
  const [historicalAmount, setHistoricalAmount] = useState<string>("10000");

  useEffect(() => {
    setLoading(true);
    api
      .getStockHistory(ticker, range)
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(console.error);
  }, [ticker, range]);

  const formatPercent = (val: number) =>
    (val >= 0 ? "+" : "") + (val * 100).toFixed(2) + "%";

  if (loading && !data) {
    return (
      <div className="p-10 text-center animate-pulse text-gray-500 dark:text-slate-400">
        Loading {ticker}...
      </div>
    );
  }

  if (!data || !data.history || data.history.length === 0) return null;

  const currentPrice = data.history[data.history.length - 1].price;
  const firstPrice = data.history[0].price;
  const deltaRaw = currentPrice - firstPrice;
  const deltaPct = firstPrice !== 0 ? deltaRaw / firstPrice : 0;
  const isPositive = deltaPct >= 0;

  // Scaling calculations for clean axis limits
  const prices = data.history.map((p) => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceSpread = Math.max(maxPrice - minPrice, 5);
  const yMin = Math.floor(minPrice - priceSpread * 0.08);
  const yMax = Math.ceil(maxPrice + priceSpread * 0.08);

  const latestPoint = data.history[data.history.length - 1];

  // Calculators
  const investVal = parseFloat(investAmount) || 0;
  const shares = currentPrice > 0 ? Math.floor(investVal / currentPrice) : 0;
  const remaining = investVal - shares * currentPrice;

  const histVal = parseFloat(historicalAmount) || 0;
  const histShares = firstPrice > 0 ? histVal / firstPrice : 0;
  const histCurrentVal = histShares * currentPrice;
  const histReturn = histCurrentVal - histVal;
  const histReturnPct = histVal > 0 ? (histCurrentVal - histVal) / histVal : 0;

  const rangeLabel =
    range === "1D" ? "Past 24 Hours" : range === "1W" ? "Past 7 Days" : "Past 30 Days";

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-8 py-8 space-y-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Stocks
      </button>

      {/* Stock Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100 tracking-tight">
            {data.ticker}
          </h1>
          <p className="text-gray-500 dark:text-slate-400 font-medium mt-1">
            {data.company}
          </p>
        </div>
        <div className="sm:text-right">
          <div className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-slate-100">
            ₹{currentPrice.toFixed(2)}
          </div>
          <div
            className={`text-lg font-semibold tracking-tight ${
              isPositive
                ? "text-teal-600 dark:text-teal-400"
                : "text-red-500 dark:text-red-400"
            }`}
          >
            {formatPercent(deltaPct)}
            <span className="text-xs ml-2 font-normal opacity-80">
              ({rangeLabel})
            </span>
          </div>
        </div>
      </div>

      {/* Historical Chart */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          {/* Range Selector */}
          <div className="flex items-center gap-1.5 bg-gray-100/70 dark:bg-slate-800/70 p-1 rounded-xl">
            {(["1D", "1W", "1M"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  range === r
                    ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 shadow-sm"
                    : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Period Return Badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 dark:text-slate-500 hidden sm:inline">
              {rangeLabel} Return:
            </span>
            <span
              className={`text-xs sm:text-sm font-bold px-2.5 py-1 rounded-full border ${
                isPositive
                  ? "bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-900/40 text-teal-700 dark:text-teal-400"
                  : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400"
              }`}
            >
              {isPositive ? "+" : ""}
              ₹{deltaRaw.toFixed(2)} ({formatPercent(deltaPct)})
            </span>
          </div>
        </div>

        {/* Recharts Area */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data.history}
              margin={{ top: 12, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={isPositive ? "#0d9488" : "#ef4444"}
                    stopOpacity={0.25}
                  />
                  <stop
                    offset="95%"
                    stopColor={isPositive ? "#0d9488" : "#ef4444"}
                    stopOpacity={0.01}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
                className="dark:stroke-slate-800"
              />
              <XAxis
                dataKey="timestamp"
                tickLine={false}
                axisLine={false}
                stroke="#94a3b8"
                fontSize={11}
                minTickGap={range === "1M" ? 50 : range === "1W" ? 35 : 25}
                tickFormatter={(timestamp: string) => {
                  const d = new Date(timestamp);
                  if (range === "1D") {
                    return d.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                  }
                  if (range === "1W") {
                    return d.toLocaleDateString([], {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    });
                  }
                  return d.toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <YAxis
                domain={[yMin, yMax]}
                orientation="right"
                tickLine={false}
                axisLine={false}
                stroke="#94a3b8"
                fontSize={11}
                tickFormatter={(val: number) => `₹${Math.round(val)}`}
              />
              {/* Baseline Reference Line */}
              <ReferenceLine
                y={firstPrice}
                stroke="#94a3b8"
                strokeDasharray="4 4"
                strokeWidth={1}
                label={{
                  value: `Period Start: ₹${firstPrice.toFixed(0)}`,
                  position: "insideTopLeft",
                  fill: "#94a3b8",
                  fontSize: 10,
                }}
              />
              {/* Current Price Dot */}
              {latestPoint && (
                <ReferenceDot
                  x={latestPoint.timestamp}
                  y={latestPoint.price}
                  r={5}
                  fill={isPositive ? "#0d9488" : "#ef4444"}
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              )}
              <Tooltip
                cursor={{
                  stroke: "#94a3b8",
                  strokeWidth: 1,
                  strokeDasharray: "3 3",
                }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const pt = payload[0].payload;
                    const date = new Date(pt.timestamp);
                    const ptPrice = Number(pt.price);
                    const vsStart =
                      firstPrice !== 0 ? ((ptPrice - firstPrice) / firstPrice) * 100 : 0;
                    return (
                      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-lg rounded-xl p-3 text-xs">
                        <div className="text-sm font-bold text-gray-900 dark:text-slate-100 mb-0.5">
                          ₹{ptPrice.toFixed(2)}
                        </div>
                        <div className="text-gray-500 dark:text-slate-400 mb-1">
                          {date.toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}{" "}
                          at{" "}
                          {date.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <div
                          className={`font-semibold ${
                            vsStart >= 0
                              ? "text-teal-600 dark:text-teal-400"
                              : "text-red-500 dark:text-red-400"
                          }`}
                        >
                          vs Start: {vsStart >= 0 ? "+" : ""}
                          {vsStart.toFixed(2)}%
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={isPositive ? "#0d9488" : "#ef4444"}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPrice)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 1M Context Clarification Note */}
        {range === "1M" && Math.abs(deltaPct) > 0.005 && (
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 flex items-start gap-2 text-xs text-gray-500 dark:text-slate-400">
            <Info className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
            <p>
              <strong className="text-gray-700 dark:text-slate-300">
                1M Overview:
              </strong>{" "}
              {data.ticker} held a consistent baseline (~₹{firstPrice.toFixed(0)}) throughout the month. The movement at the right edge reflects the latest session catalyst ({formatPercent(deltaPct)}).
            </p>
          </div>
        )}
      </div>

      {/* Context Insight */}
      {data.context && data.context.classification !== "unchanged" && (
        <div className="bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/50 p-6 rounded-xl shadow-sm">
          <h3 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Activity className="w-4 h-4" /> NoCap Insight
          </h3>
          <p className="text-gray-900 dark:text-slate-100 font-medium mb-4">
            {data.company} is{" "}
            {data.context.delta_stock < 0 ? "falling" : "rising"}{" "}
            {Math.abs(data.context.alpha) > 0.01 ? "more than" : "in line with"}{" "}
            the {data.context.catalyst?.sector || "sector"}.
          </p>
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div>
              <span className="text-gray-500 dark:text-slate-400 block mb-1">
                Stock Move
              </span>
              <span
                className={`font-bold ${
                  data.context.delta_stock >= 0
                    ? "text-teal-600 dark:text-teal-400"
                    : "text-red-500 dark:text-red-400"
                }`}
              >
                {formatPercent(data.context.delta_stock)}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-slate-400 block mb-1">
                Sector Move
              </span>
              <span className="font-bold text-gray-700 dark:text-slate-300">
                {formatPercent(data.context.delta_sector)}
              </span>
            </div>
            {data.context.catalyst && (
              <div className="pl-6 border-l border-gray-200 dark:border-slate-700">
                <span className="text-gray-500 dark:text-slate-400 block mb-1">
                  Catalyst
                </span>
                <span className="font-semibold text-gray-900 dark:text-slate-200">
                  {data.context.catalyst.title}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Calculators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold text-gray-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Calculator className="w-4 h-4" /> Investment Calculator
          </h3>
          <label className="block text-sm text-gray-500 dark:text-slate-400 mb-2">
            How much do you want to invest?
          </label>
          <div className="relative mb-6">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400 font-medium">
              ₹
            </span>
            <input
              type="number"
              value={investAmount}
              onChange={(e) => setInvestAmount(e.target.value)}
              className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg pl-8 pr-4 py-2.5 font-semibold text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-800">
            <span className="text-gray-500 dark:text-slate-400 text-sm">
              Whole shares
            </span>
            <span className="font-bold text-gray-900 dark:text-slate-100">
              {shares}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-500 dark:text-slate-400 text-sm">
              Remaining cash
            </span>
            <span className="font-bold text-gray-900 dark:text-slate-100">
              ₹{remaining.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold text-gray-900 dark:text-slate-100 mb-4">
            Historical Return ({range})
          </h3>
          <label className="block text-sm text-gray-500 dark:text-slate-400 mb-2">
            What if I invested earlier?
          </label>
          <div className="relative mb-6">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400 font-medium">
              ₹
            </span>
            <input
              type="number"
              value={historicalAmount}
              onChange={(e) => setHistoricalAmount(e.target.value)}
              className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg pl-8 pr-4 py-2.5 font-semibold text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-800">
            <span className="text-gray-500 dark:text-slate-400 text-sm">
              Hypothetical historical value
            </span>
            <span className="font-bold text-gray-900 dark:text-slate-100">
              ₹{histCurrentVal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-500 dark:text-slate-400 text-sm">
              Historical return
            </span>
            <span
              className={`font-bold ${
                histReturn >= 0
                  ? "text-teal-600 dark:text-teal-400"
                  : "text-red-500 dark:text-red-400"
              }`}
            >
              {histReturn >= 0 ? "+" : ""}₹{Math.abs(histReturn).toFixed(2)} (
              {formatPercent(histReturnPct)})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
