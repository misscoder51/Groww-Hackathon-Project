import { MarketStory } from "@/types";
import { BarChart2, Globe, TrendingDown } from "lucide-react";
import { useState } from "react";

export const MarketStories = ({ stories }: { stories: MarketStory[] }) => {
  return (
    <div className="space-y-4">
      {stories.map((story, i) => (
        <StoryCard key={i} story={story} />
      ))}
    </div>
  );
};

const StoryCard = ({ story }: { story: MarketStory }) => {
  const [expanded, setExpanded] = useState(false);
  const isSector = story.type === 'sector';
  const isMacro = story.type === 'macro';
  
  const getContextType = () => {
    if (isSector) return "SECTOR-WIDE";
    if (isMacro) return "MARKET-WIDE";
    return "STOCK-SPECIFIC";
  };
  
  return (
    <div className="border border-neutral-800 rounded-xl p-6 bg-neutral-950 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        {isSector ? <BarChart2 className="w-4 h-4 text-emerald-400" /> : <Globe className="w-4 h-4 text-emerald-400" />}
        <h3 className="font-semibold text-xs tracking-widest text-neutral-400">{getContextType()}</h3>
      </div>
      
      <div>
        <p className="text-white font-medium text-lg mb-1">{story.title}</p>
        <p className="text-neutral-400 text-sm leading-relaxed">{story.description}</p>
      </div>
      
      <div className="pt-2">
        <button 
          onClick={() => setExpanded(!expanded)}
          className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          {expanded ? "Hide affected stocks ↑" : `${story.affected.length} ${story.affected.length === 1 ? 'stock' : 'stocks'} in your watchlist ${story.affected.length === 1 ? 'is' : 'are'} affected ↓`}
        </button>
        
        {expanded && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {story.affected.map(ticker => (
              <div key={ticker} className="px-3 py-2 bg-neutral-900 rounded-lg text-sm flex items-center justify-between border border-neutral-800/50">
                <span className="font-semibold text-white">{ticker}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
