import { Algorithm, AlgorithmCategory } from "../types";
import {
  BarChart2,
  Search,
  GitBranch,
  Network,
  Layers,
  ChevronRight,
  Cpu,
  Terminal,
  Zap,
  FlaskConical,
} from "lucide-react";

interface SidebarProps {
  algorithms: Algorithm[];
  selected: Algorithm | null;
  onSelect: (alg: Algorithm) => void;
  onOpenLab: () => void;
}

const CATEGORY_META: Record<
  AlgorithmCategory,
  { label: string; icon: React.ReactNode; accent: string; glow: string }
> = {
  sorting: {
    label: "Sorting",
    icon: <BarChart2 size={14} />,
    accent: "text-neon-cyan",
    glow: "glow-cyan",
  },
  searching: {
    label: "Searching",
    icon: <Search size={14} />,
    accent: "text-neon-green",
    glow: "glow-green",
  },
  graph: {
    label: "Graph",
    icon: <GitBranch size={14} />,
    accent: "text-neon-amber",
    glow: "glow-amber",
  },
  tree: {
    label: "Tree",
    icon: <Network size={14} />,
    accent: "text-neon-pink",
    glow: "",
  },
  dynamic: {
    label: "Dynamic Prog.",
    icon: <Layers size={14} />,
    accent: "text-neon-blue",
    glow: "",
  },
  other: {
    label: "Other",
    icon: <Cpu size={14} />,
    accent: "text-slate-400",
    glow: "",
  },
};

const CATEGORY_ORDER: AlgorithmCategory[] = [
  "sorting",
  "searching",
  "graph",
  "tree",
  "dynamic",
  "other",
];

export default function Sidebar({
  algorithms,
  selected,
  onSelect,
  onOpenLab,
}: SidebarProps) {
  const grouped = CATEGORY_ORDER.reduce<Record<string, Algorithm[]>>(
    (acc, cat) => {
      const items = algorithms.filter((a) => a.category === cat);
      if (items.length > 0) acc[cat] = items;
      return acc;
    },
    {},
  );

  return (
    <aside className="w-72 bg-terminal-900 border-r border-neon-cyan/10 flex flex-col h-full relative overflow-hidden">
      <div className="scanline-overlay" />

      {/* Header */}
      <div className="relative p-5 border-b border-neon-cyan/10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-neon-cyan/20 to-neon-green/10 border border-neon-cyan/30 flex items-center justify-center box-glow-cyan">
            <Terminal size={16} className="text-neon-cyan" />
          </div>
          <div>
            <h1 className="text-white font-display font-bold text-lg tracking-tight">
              AlgoVis
            </h1>
            <p className="text-neon-cyan/50 text-[10px] font-mono tracking-widest uppercase">
              Algorithm Visualizer v1.0
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-3">
          <Zap size={10} className="text-neon-green animate-pulse-glow" />
          <span className="text-[10px] font-mono text-neon-green/60">
            {algorithms.length} algorithms loaded
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5 relative">
        {Object.entries(grouped).map(([cat, algs]) => {
          const meta = CATEGORY_META[cat as AlgorithmCategory];
          return (
            <div key={cat}>
              <div
                className={`flex items-center gap-2 px-2 mb-2 ${meta.accent}`}
              >
                {meta.icon}
                <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.2em]">
                  {meta.label}
                </span>
                <span className="ml-auto text-[10px] font-mono opacity-40">
                  {algs.length}
                </span>
              </div>
              <ul className="space-y-0.5">
                {algs.map((alg) => {
                  const isActive = selected?.id === alg.id;
                  return (
                    <li key={alg.id}>
                      <button
                        onClick={() => onSelect(alg)}
                        className={`w-full text-left px-3 py-2.5 rounded-md text-[13px] transition-all duration-200 flex items-center justify-between group font-mono ${
                          isActive
                            ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/25 box-glow-cyan"
                            : "text-slate-500 hover:text-slate-300 hover:bg-terminal-800 border border-transparent"
                        }`}
                      >
                        <span className="truncate">{alg.name}</span>
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          {alg.isCustom && (
                            <span className="text-[9px] bg-neon-amber/15 text-neon-amber border border-neon-amber/25 rounded px-1 py-0.5">
                              USR
                            </span>
                          )}
                          {isActive && (
                            <ChevronRight
                              size={12}
                              className="text-neon-cyan animate-pulse-glow"
                            />
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* Footer actions */}
      <div className="p-3 border-t border-neon-cyan/10 relative space-y-2">
        <button
          onClick={onOpenLab}
          className="w-full flex items-center gap-2.5 px-3 py-3 rounded-md text-sm font-mono transition-all duration-200 border border-neon-cyan/25 text-neon-cyan hover:border-neon-cyan/50 hover:bg-neon-cyan/8 bg-neon-cyan/5"
        >
          <FlaskConical size={15} />
          <span>Algorithm Lab</span>
          <span className="ml-auto text-[9px] bg-neon-cyan/15 border border-neon-cyan/25 rounded px-1.5 py-0.5 font-mono">
            NEW
          </span>
        </button>
      </div>
    </aside>
  );
}
