import { AttentionScoreResult } from "@/types";

export const AttentionCard = ({ item, onClick }: { item: AttentionScoreResult, onClick: () => void }) => {
  const isPositive = item.delta_stock >= 0;
  const isMajor = item.classification === 'major_change';
  
  const formatPercent = (val: number) => (val >= 0 ? "+" : "") + (val * 100).toFixed(1) + "%";
  
  const getWhy = () => {
    if (item.catalyst) return `${item.ticker} is moving on news: "${item.catalyst.title}".`;
    if (item.has_corporate_action) return `A scheduled corporate action is affecting the price.`;
    if (item.volume_ratio > 2) return `Trading volume is ${item.volume_ratio.toFixed(1)}× normal.`;
    return `The stock is moving with the broader sector without a specific news catalyst.`;
  };

  const getUnusual = () => {
    if (Math.abs(item.alpha) > 0.02) return `Yes. ${item.ticker} is moving significantly more than the sector average.`;
    if (item.volume_ratio > 2) return `Yes. The trading activity is highly abnormal.`;
    return `No. This move is generally in line with normal volatility and sector trends.`;
  };

  const getMatters = () => {
    if (Math.abs(item.alpha) > 0.02) return `The move appears largely stock-specific rather than only sector-wide.`;
    if (item.volume_ratio > 2) return `This is an unusual move, but the precise cause is not yet confirmed.`;
    return `The system flagged this due to cumulative sector weakness or broad market correlation.`;
  };

  return (
    <div className={`w-full text-left p-6 rounded-xl border transition-all duration-200 group flex flex-col gap-6
        ${isMajor 
          ? 'bg-neutral-900 border-red-500/20 hover:border-red-500/40' 
          : 'bg-neutral-950 border-neutral-800 hover:border-neutral-600'}`}
    >
      <div className="flex items-start justify-between border-b border-neutral-800/50 pb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-xl font-bold tracking-tight text-white">{item.ticker}</h3>
            {isMajor && <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-red-500/10 text-red-400 rounded-sm">Major</span>}
            {!isMajor && <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-orange-500/10 text-orange-400 rounded-sm">Moderate</span>}
          </div>
          <p className="text-sm font-medium text-neutral-300">{item.catalyst?.title || (item.volume_ratio > 2 ? 'Unusually high trading activity' : 'Significant price movement')}</p>
        </div>
        <div className={`text-xl font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          {formatPercent(item.delta_stock)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
        <div>
          <span className="block text-xs font-semibold text-neutral-500 mb-1">WHY?</span>
          <p className="text-neutral-300 leading-relaxed">{getWhy()}</p>
        </div>
        <div>
          <span className="block text-xs font-semibold text-neutral-500 mb-1">IS THIS UNUSUAL?</span>
          <p className="text-neutral-300 leading-relaxed">{getUnusual()}</p>
        </div>
        <div>
          <span className="block text-xs font-semibold text-neutral-500 mb-1">WHY IT MATTERS</span>
          <p className="text-neutral-300 leading-relaxed">{getMatters()}</p>
        </div>
      </div>

      <div className="pt-2">
        <button 
          onClick={onClick}
          className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 group/btn"
        >
          Understand this move <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
        </button>
      </div>
    </div>
  );
};
