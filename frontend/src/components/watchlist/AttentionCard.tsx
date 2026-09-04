import { AttentionScoreResult } from "@/types";
import { TrendingDown, TrendingUp, AlertTriangle, Info } from "lucide-react";

export const AttentionCard = ({ item, onClick }: { item: AttentionScoreResult, onClick: () => void }) => {
  const isPositive = item.delta_stock >= 0;
  const isMajor = item.classification === 'major_change';
  
  const formatPercent = (val: number) => (val * 100).toFixed(1) + "%";
  
  return (
    <button 
      onClick={onClick}
      className={`w-full text-left p-4 sm:p-5 rounded-xl border transition-all duration-200 group flex flex-col sm:flex-row sm:items-center gap-4
        ${isMajor 
          ? 'bg-neutral-900 border-red-500/20 hover:border-red-500/40 hover:bg-neutral-800' 
          : 'bg-neutral-950 border-neutral-800 hover:border-neutral-600 hover:bg-neutral-900'}`}
    >
      <div className="flex-shrink-0 flex items-center justify-between sm:w-48">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${isMajor ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-orange-500'}`} />
          <div>
            <h3 className="text-lg font-bold tracking-tight text-white">{item.ticker}</h3>
            {isMajor && <span className="text-[10px] uppercase font-bold tracking-wider text-red-400">Major</span>}
          </div>
        </div>
        <div className={`text-lg font-semibold flex items-center gap-1 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {isPositive ? "+" : ""}{formatPercent(item.delta_stock)}
        </div>
      </div>

      <div className="flex-1 space-y-1 text-sm sm:pl-6 sm:border-l border-neutral-800">
        {item.catalyst ? (
          <p className="text-neutral-200">{item.catalyst.title}</p>
        ) : item.volume_ratio > 2 ? (
          <p className="text-neutral-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            Unusual volume spike ({item.volume_ratio.toFixed(1)}x normal)
          </p>
        ) : (
          <p className="text-neutral-400 flex items-center gap-2">
            <Info className="w-4 h-4" />
            {item.delta_sector < -0.01 && item.delta_stock < 0 ? "Broad sector weakness" : "Unusual relative movement"}
          </p>
        )}
      </div>
    </button>
  );
};
