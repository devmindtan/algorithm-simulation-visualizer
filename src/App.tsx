import { useState } from "react";
import { Algorithm } from "./types";
import { ALL_ALGORITHMS } from "./algorithms";
import Sidebar from "./components/Sidebar";
import AlgorithmDetail from "./components/AlgorithmDetail";
import CompareModal from "./components/CompareModal";
import AlgorithmLab from "./components/AlgorithmLab";
import { Terminal, Cpu, Zap, ChevronRight } from "lucide-react";

function Welcome() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8 relative">
      <div className="scanline-overlay" />

      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-neon-cyan/15 to-neon-green/5 border border-neon-cyan/25 flex items-center justify-center box-glow-cyan">
          <Terminal size={32} className="text-neon-cyan" />
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-neon-green shadow-[0_0_12px_rgba(0,255,136,0.6)] animate-pulse-glow" />
      </div>

      <h2 className="text-4xl font-display font-bold text-white mb-3 tracking-tight">
        Algo<span className="text-neon-cyan glow-cyan">Vis</span>
      </h2>
      <p className="text-slate-500 max-w-md leading-relaxed mb-10 text-sm font-mono">
        Interactive algorithm visualization engine. Step through execution,
        analyze complexity, and compare algorithms side by side.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-xl">
        {[
          {
            label: "Sorting",
            desc: "Bubble, Merge, Quick, Heap...",
            color: "border-neon-cyan/20 text-neon-cyan",
            icon: <Cpu size={16} />,
          },
          {
            label: "Searching",
            desc: "Linear, Binary search",
            color: "border-neon-green/20 text-neon-green",
            icon: <Zap size={16} />,
          },
          {
            label: "Graph",
            desc: "BFS, DFS traversal",
            color: "border-neon-amber/20 text-neon-amber",
            icon: <Terminal size={16} />,
          },
        ].map((item) => (
          <div
            key={item.label}
            className={`bg-terminal-900 border rounded-lg p-4 text-left ${item.color}`}
          >
            <div className="flex items-center gap-2 mb-2">
              {item.icon}
              <span className="text-sm font-mono font-semibold">
                {item.label}
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-600">
              {item.desc}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex items-center gap-2 text-[11px] font-mono text-slate-700">
        <ChevronRight size={12} className="text-neon-cyan/30" />
        <span>Select an algorithm from the sidebar to begin</span>
        <span className="animate-blink text-neon-cyan/50">_</span>
      </div>
    </div>
  );
}

export default function App() {
  const [algorithms] = useState<Algorithm[]>(ALL_ALGORITHMS);
  const [selected, setSelected] = useState<Algorithm | null>(null);
  const [showCompare, setShowCompare] = useState(false);
  const [showLab, setShowLab] = useState(false);

  const sameCategory = selected
    ? algorithms.filter((a) => a.category === selected.category)
    : [];

  return (
    <div className="flex h-screen bg-terminal-950 font-display overflow-hidden grid-bg">
      <Sidebar
        algorithms={algorithms}
        selected={selected}
        onSelect={(alg) => {
          setSelected(alg);
          setShowCompare(false);
          setShowLab(false);
        }}
        onOpenLab={() => {
          setShowLab(true);
          setSelected(null);
          setShowCompare(false);
        }}
      />

      <main className="flex-1 overflow-hidden">
        {showLab ? (
          <AlgorithmLab onBack={() => setShowLab(false)} />
        ) : selected ? (
          <AlgorithmDetail
            key={selected.id}
            algorithm={selected}
            onCompare={() => setShowCompare(true)}
          />
        ) : (
          <Welcome />
        )}
      </main>

      {showCompare && selected && (
        <CompareModal
          currentAlgorithm={selected}
          sameCategory={sameCategory}
          onClose={() => setShowCompare(false)}
        />
      )}
    </div>
  );
}
