import { useState, useEffect, useRef } from "react";
import { Algorithm, AlgorithmStep, AlgorithmCategory } from "../types";
import { buildDefaultGraph } from "../algorithms/graph";
import ArrayVisualizer from "./ArrayVisualizer";
import GraphVisualizer from "./GraphVisualizer";
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from "lucide-react";

interface Props {
  algorithms: Algorithm[];
  initialData: number[];
}

interface AlgState {
  steps: AlgorithmStep[];
  stepIdx: number;
}

const GRAPH_CATEGORIES: AlgorithmCategory[] = ["graph", "tree"];

export default function CompareView({ algorithms, initialData }: Props) {
  const [states, setStates] = useState<AlgState[]>([]);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(300);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const statesRef = useRef(states);
  statesRef.current = states;
  const maxVal = Math.max(...initialData, 1);
  const graph = buildDefaultGraph();

  useEffect(() => {
    const target = initialData[Math.floor(initialData.length / 2)];
    const newStates = algorithms.map((alg) => {
      if (alg.isCustom) {
        return {
          steps: [
            {
              array: [...initialData],
              message: `> ${alg.name} — custom, no visualization`,
            },
          ],
          stepIdx: 0,
        };
      }
      const isGraph = GRAPH_CATEGORIES.includes(alg.category);
      const extra =
        alg.category === "searching" ? target : isGraph ? { graph } : undefined;
      return { steps: alg.generate([...initialData], extra), stepIdx: 0 };
    });
    setStates(newStates);
    setPlaying(false);
  }, [algorithms, initialData]);

  const allDone =
    states.length > 0 && states.every((s) => s.stepIdx >= s.steps.length - 1);

  function stepAll() {
    setStates((prev) =>
      prev.map((s) => ({
        ...s,
        stepIdx: Math.min(s.stepIdx + 1, s.steps.length - 1),
      })),
    );
  }

  function reset() {
    setPlaying(false);
    setStates((prev) => prev.map((s) => ({ ...s, stepIdx: 0 })));
  }

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        if (statesRef.current.every((s) => s.stepIdx >= s.steps.length - 1)) {
          setPlaying(false);
          return;
        }
        stepAll();
      }, speed);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, speed]);

  if (states.length === 0) return null;

  const isSingleItem = algorithms.length === 1;

  return (
    <div className="flex flex-col h-full gap-3">
      {isSingleItem && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-neon-amber/5 border border-neon-amber/20 rounded-md">
          <span className="text-neon-amber/70 text-[10px] font-mono">
            &gt; Select more algorithms above to compare side-by-side (up to 4)
          </span>
        </div>
      )}
      <div
        className="grid gap-3 flex-1 min-h-0"
        style={{
          gridTemplateColumns: isSingleItem
            ? "minmax(0, 560px)"
            : `repeat(${algorithms.length}, minmax(0,1fr))`,
          justifyContent: isSingleItem ? "center" : undefined,
        }}
      >
        {algorithms.map((alg, i) => {
          const s = states[i];
          if (!s) return null;
          const step = s.steps[s.stepIdx] ?? s.steps[0];
          const isGraph =
            GRAPH_CATEGORIES.includes(alg.category) && !alg.isCustom;
          return (
            <div
              key={alg.id}
              className="bg-terminal-900 rounded-lg terminal-border flex flex-col overflow-hidden min-h-[200px]"
            >
              <div className="px-3 py-2 border-b border-neon-cyan/10 flex items-center justify-between">
                <span className="text-[12px] font-mono font-semibold text-neon-cyan">
                  {alg.name}
                </span>
                <span className="text-[10px] text-slate-700 font-mono">
                  {s.stepIdx + 1}/{s.steps.length}
                </span>
              </div>
              <div className="flex-1 p-1 min-h-0">
                {isGraph ? (
                  <GraphVisualizer step={step} graph={graph} />
                ) : (
                  <ArrayVisualizer step={step} maxValue={maxVal} />
                )}
              </div>
              {step.message && (
                <div className="px-3 py-1.5 border-t border-neon-cyan/10">
                  <p className="text-[10px] text-slate-500 font-mono truncate">
                    <span className="text-neon-cyan/30 mr-1">&gt;</span>
                    {step.message}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-2 py-2">
        <button onClick={reset} className="btn-terminal p-2">
          <SkipBack size={15} />
        </button>
        <button
          onClick={() => setPlaying((p) => !p)}
          className="btn-primary flex items-center gap-2"
        >
          {playing ? <Pause size={15} /> : <Play size={15} />}
          {playing ? "Pause" : "Run"}
        </button>
        <button
          onClick={stepAll}
          disabled={allDone}
          className="btn-terminal p-2 disabled:opacity-30"
        >
          <SkipForward size={15} />
        </button>
        <button onClick={reset} className="btn-terminal p-2">
          <RotateCcw size={13} />
        </button>
        <div className="flex items-center gap-2 ml-3">
          <span className="text-[10px] font-mono text-slate-600">SPEED</span>
          <input
            type="range"
            min={50}
            max={1000}
            step={50}
            value={1050 - speed}
            onChange={(e) => setSpeed(1050 - Number(e.target.value))}
            className="w-20 accent-[#00e5ff]"
          />
        </div>
      </div>
    </div>
  );
}
