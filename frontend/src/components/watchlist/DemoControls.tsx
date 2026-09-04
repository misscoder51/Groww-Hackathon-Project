import { useState } from "react";
import { api } from "@/lib/api";
import { X, PlayCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SCENARIOS = [
  { id: "normal", name: "Normal Market" },
  { id: "stock_specific", name: "Stock Specific (TCS)" },
  { id: "sector_wide", name: "Sector Wide (IT)" },
  { id: "unusual_volume", name: "Unusual Volume (Reliance)" },
  { id: "corporate_action", name: "Corporate Action (ITC)" },
  { id: "api_failure", name: "API Failure (Stale/Chaos)" },
  { id: "all", name: "All Events" },
];

export const DemoControls = ({ onClose, onReload }: { onClose: () => void, onReload: () => void }) => {
  const [active, setActive] = useState<string>("all");
  const [loading, setLoading] = useState(false);

  const applyScenario = async (id: string) => {
    setLoading(true);
    try {
      if (id === "api_failure") {
        await api.setChaos(true);
      } else {
        await api.setChaos(false);
        await api.setScenario(id);
      }
      setActive(id);
      await onReload();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-neutral-900 border border-neutral-800 p-4 rounded-2xl shadow-2xl max-w-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <PlayCircle className="w-4 h-4" /> Demo Controls
        </h3>
        <button onClick={onClose} className="text-neutral-500 hover:text-white"><X className="w-4 h-4" /></button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {SCENARIOS.map(s => (
          <button
            key={s.id}
            disabled={loading}
            onClick={() => applyScenario(s.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              active === s.id 
                ? 'bg-blue-500/20 border-blue-500/50 text-blue-300' 
                : 'bg-black border-neutral-800 text-neutral-400 hover:border-neutral-700'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>
      <p className="mt-3 text-[10px] text-neutral-600">These controls are for demo purposes only and would not exist in production.</p>
    </div>
  );
};
