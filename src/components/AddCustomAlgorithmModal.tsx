import { useState } from 'react';
import { X, Plus, AlertCircle, Terminal } from 'lucide-react';
import { Algorithm, AlgorithmCategory } from '../types';

interface Props {
  onClose: () => void;
  onAdded: (alg: Algorithm) => void;
}

const CATEGORIES: AlgorithmCategory[] = ['sorting', 'searching', 'graph', 'tree', 'dynamic', 'other'];

export default function AddCustomAlgorithmModal({ onClose, onAdded }: Props) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<AlgorithmCategory>('other');
  const [description, setDescription] = useState('');
  const [best, setBest] = useState('O(?)');
  const [avg, setAvg] = useState('O(?)');
  const [worst, setWorst] = useState('O(?)');
  const [space, setSpace] = useState('O(?)');
  const [error, setError] = useState('');

  function handleSave() {
    if (!name.trim()) { setError('Algorithm name is required.'); return; }
    if (!description.trim()) { setError('Description is required.'); return; }
    setError('');

    const alg: Algorithm = {
      id: `custom-${Date.now()}-${name.trim().replace(/\s+/g, '-').toLowerCase()}`,
      name: name.trim(),
      category,
      description: description.trim(),
      complexity: {
        best: best.trim(),
        average: avg.trim(),
        worst: worst.trim(),
        space: space.trim(),
      },
      generate: () => [],
      isCustom: true,
    };

    onAdded(alg);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-terminal-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-terminal-900 terminal-border rounded-lg w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-neon-cyan/10">
          <div className="flex items-center gap-2">
            <Terminal size={16} className="text-neon-cyan" />
            <h2 className="text-base font-display font-semibold text-white">Add Custom Algorithm</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-terminal-800 text-slate-500 hover:text-white transition-all">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-[10px] font-mono text-slate-600 mb-1.5 uppercase tracking-widest">Algorithm Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tim Sort"
              className="w-full bg-terminal-800 border border-neon-cyan/15 rounded-md px-3 py-2.5 text-sm font-mono text-slate-200 placeholder-slate-700 focus:outline-none focus:border-neon-cyan/40 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-600 mb-1.5 uppercase tracking-widest">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as AlgorithmCategory)}
              className="w-full bg-terminal-800 border border-neon-cyan/15 rounded-md px-3 py-2.5 text-sm font-mono text-slate-200 focus:outline-none focus:border-neon-cyan/40 transition-colors"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-600 mb-1.5 uppercase tracking-widest">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe how the algorithm works..."
              className="w-full bg-terminal-800 border border-neon-cyan/15 rounded-md px-3 py-2.5 text-sm font-mono text-slate-200 placeholder-slate-700 focus:outline-none focus:border-neon-cyan/40 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-600 mb-2 uppercase tracking-widest">Complexity</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Best Case', value: best, setter: setBest, placeholder: 'O(n log n)' },
                { label: 'Average Case', value: avg, setter: setAvg, placeholder: 'O(n log n)' },
                { label: 'Worst Case', value: worst, setter: setWorst, placeholder: 'O(n^2)' },
                { label: 'Space', value: space, setter: setSpace, placeholder: 'O(1)' },
              ].map(({ label, value, setter, placeholder }) => (
                <div key={label}>
                  <label className="block text-[9px] font-mono text-slate-700 mb-1">{label}</label>
                  <input
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-terminal-850 border border-neon-cyan/10 rounded-md px-3 py-2 text-sm font-mono text-neon-cyan/80 placeholder-slate-700 focus:outline-none focus:border-neon-cyan/30 transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-neon-red text-sm bg-neon-red/5 border border-neon-red/15 rounded-md px-3 py-2 font-mono">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-neon-cyan/10">
          <button onClick={onClose} className="btn-terminal text-xs">Cancel</button>
          <button onClick={handleSave} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={14} />
            Add Algorithm
          </button>
        </div>
      </div>
    </div>
  );
}
