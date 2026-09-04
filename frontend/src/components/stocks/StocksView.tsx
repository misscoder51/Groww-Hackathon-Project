import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { StockListItem } from "@/types";
import { Search, ChevronLeft } from "lucide-react";
import { StockDetailView } from "./StockDetailView";

export const StocksView = () => {
  const [stocks, setStocks] = useState<StockListItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listStocks().then(data => {
      setStocks(data);
      setLoading(false);
    }).catch(console.error);
  }, []);

  if (selectedTicker) {
    return <StockDetailView ticker={selectedTicker} onBack={() => setSelectedTicker(null)} />;
  }

  const filtered = stocks.filter(s => s.ticker.toLowerCase().includes(search.toLowerCase()) || s.company.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 tracking-tight">Explore Stocks</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-2">Search and analyze companies using Context intelligence.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500" />
        <input 
          type="text" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search stocks..." 
          className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl pl-12 pr-4 py-3 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-500 shadow-sm transition-shadow"
        />
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 dark:bg-slate-800 rounded-xl"></div>)}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(stock => (
            <button 
              key={stock.ticker}
              onClick={() => setSelectedTicker(stock.ticker)}
              className="w-full text-left p-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-slate-700 transition-all flex justify-between items-center group"
            >
              <div>
                <h3 className="font-bold text-gray-900 dark:text-slate-100 text-lg">{stock.ticker}</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">{stock.company}</p>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900 dark:text-slate-100 text-lg">₹{stock.current_price.toFixed(2)}</div>
                <div className="text-teal-600 dark:text-teal-400 group-hover:translate-x-1 transition-transform inline-block">→</div>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-10 text-gray-500 dark:text-slate-400">
              No stocks found matching your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
