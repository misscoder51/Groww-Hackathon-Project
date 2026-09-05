import { MarketStory } from "@/types";
import { BarChart2, Globe, TrendingDown } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const MarketStories = ({ stories }: { stories: MarketStory[] }) => {
  return (
    <div className="flex flex-col gap-6">
      {stories.map(story => (
        <MarketStoryCard key={story.title} story={story} />
      ))}
    </div>
  );
};

const MarketStoryCard = ({ story }: { story: MarketStory }) => {
  const [expanded, setExpanded] = useState(false);
  const isSector = story.type === 'SECTOR';
  
  const getContextType = () => {
    if (isSector) return 'SECTOR-WIDE';
    if (story.type === 'MACRO') return 'MARKET-WIDE';
    return 'STOCK-SPECIFIC';
  };
  
  return (
    <div className="border border-gray-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 bg-white dark:bg-slate-900 shadow-none flex flex-col gap-3 transition-colors hover:border-gray-300 dark:hover:border-slate-700">
      <div className="flex items-center gap-1.5">
        {isSector ? <BarChart2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" /> : <Globe className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />}
        <h3 className="font-medium text-[11px] tracking-wider text-gray-500 dark:text-slate-400 uppercase">{getContextType()}</h3>
      </div>
      
      <div>
        <p className="text-gray-900 dark:text-slate-100 font-semibold text-base mb-1">{story.title}</p>
        <p className="text-gray-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">{story.description}</p>
      </div>
      
      <div className="pt-1">
        <button 
          onClick={() => setExpanded(!expanded)}
          className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors flex items-center gap-1"
        >
          {expanded ? "Hide affected stocks ↑" : `${story.affected.length} ${story.affected.length === 1 ? 'stock' : 'stocks'} in your watchlist affected ↓`}
        </button>
        
        <AnimatePresence>
          {expanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 flex flex-wrap gap-2 pt-1 pb-1">
                {story.affected.map(ticker => (
                  <div key={ticker} className="px-2.5 py-1 bg-gray-50 dark:bg-slate-800 rounded text-xs font-medium text-gray-800 dark:text-slate-200 border border-gray-200 dark:border-slate-700">
                    {ticker}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
