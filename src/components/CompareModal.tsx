import { useState } from 'react';
import { X, BarChart2 } from 'lucide-react';
import { Algorithm } from '../types';
import CompareView from './CompareView';

interface Props {
  currentAlgorithm: Algorithm;
  sameCategory: Algorithm[];
  onClose: () => void;
}

function generateArray(size: number): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 95) + 5);
}

export default function CompareModal({ currentAlgorithm, sameCategory, onClose }: Props) {
  const [selected, setSelected] = useState<string[]>([currentAlgorithm.id]);
  const [data] = useState(() => generateArray(18));

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.length > 1 ? prev.filter((x) => x !== id) : prev
        : prev.length < 4 ? [...prev, id] : prev
    );
  }

  const selectedAlgs = sameCategory.filter((a) => selected.includes(a.id));

  return (
    <div className="fixed inset-0 bg-terminal-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-terminal-900 terminal-border rounded-lg w-full max-w-5xl h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-neon-cyan/10">
          <div className="flex items-center gap-2">
            <BarChart2 size={16} className="text-neon-cyan" />
            <h2 className="text-base font-display font-semibold text-white">Compare Algorithms</h2>
            <span className="text-[10px] font-mono text-slate-600 ml-2">--side-by-side</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-terminal-800 text-slate-500 hover:text-white transition-all">
            <X size={16} />
          </button>
        </div>

        <div className="px-5 pt-4 pb-3 border-b border-neon-cyan/10">
          <p className="text-[10px] font-mono text-slate-600 mb-2">Select up to 4 algorithms (same category):</p>
          <div className="flex flex-wrap gap-2">
            {sameCategory.map((alg) => (
              <button
                key={alg.id}
                onClick={() => toggle(alg.id)}
                className={`px-3 py-1.5 rounded-md text-[11px] font-mono transition-all duration-200 border ${
                  selected.includes(alg.id)
                    ? 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30 box-glow-cyan'
                    : 'bg-terminal-800 text-slate-500 border-terminal-600 hover:text-slate-300'
                }`}
              >
                {alg.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-h-0 p-5">
          <CompareView algorithms={selectedAlgs} initialData={data} />
        </div>
      </div>
    </div>
  );
}
