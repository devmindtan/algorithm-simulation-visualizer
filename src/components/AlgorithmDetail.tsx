import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Algorithm, AlgorithmStep } from "../types";
import { buildDefaultGraph } from "../algorithms/graph";
import {
  GRAPH_CATEGORIES,
  DEFAULT_ARRAY_SIZE,
  DEFAULT_SPEED,
  generateRandomArray,
  pickMiddleTarget,
} from "../data/visualizerData";
import ArrayVisualizer from "./ArrayVisualizer";
import GraphVisualizer from "./GraphVisualizer";
import ComplexityBadge from "./ComplexityBadge";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Shuffle,
  BarChart2,
  Terminal,
  Gauge,
  Hash,
  Pencil,
  Check,
  X,
} from "lucide-react";

interface Props {
  algorithm: Algorithm;
  onCompare: () => void;
}

const EMPTY_STEP: AlgorithmStep = { array: [], message: "Ready" };

function fmtArray(nums: number[]): string {
  if (nums.length === 0) return "—";
  return nums.join(", ");
}

export default function AlgorithmDetail({ algorithm, onCompare }: Props) {
  const [steps, setSteps] = useState<AlgorithmStep[]>([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const [arraySize, setArraySize] = useState(DEFAULT_ARRAY_SIZE);
  const [rawData, setRawData] = useState<number[]>([]);
  const [searchTarget, setSearchTarget] = useState<number>(0);
  // Custom input state
  const [editingInput, setEditingInput] = useState(false);
  const [customInputStr, setCustomInputStr] = useState("");
  const [inputError, setInputError] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepsRef = useRef(steps);
  stepsRef.current = steps;

  const isGraph = GRAPH_CATEGORIES.includes(algorithm.category);
  const isCustom = algorithm.isCustom;
  const graph = useMemo(() => buildDefaultGraph(), []);

  const buildSteps = useCallback(
    (data: number[], target: number): AlgorithmStep[] => {
      if (isCustom) {
        return [
          {
            array: data,
            message: `> ${algorithm.name} — custom algorithm (no step visualization). See complexity info above.`,
          },
        ];
      }
      const extra =
        algorithm.category === "searching"
          ? target
          : isGraph
            ? { graph }
            : undefined;
      return algorithm.generate(data, extra);
    },
    [algorithm, graph, isCustom, isGraph],
  );

  function randomize() {
    const data = generateRandomArray(arraySize);
    setRawData(data);
    const target = pickMiddleTarget(data);
    setSearchTarget(target);
    setSteps(buildSteps(data, target));
    setStepIdx(0);
    setPlaying(false);
    setEditingInput(false);
  }

  function applyCustomInput() {
    const nums = customInputStr
      .split(/[\s,]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n) && n >= 1 && n <= 9999)
      .slice(0, 100);
    if (nums.length < 2) {
      setInputError("Need at least 2 valid numbers (1–9999). Max 100 values.");
      return;
    }
    setInputError("");
    setRawData(nums);
    const target = pickMiddleTarget(nums);
    setSearchTarget(target);
    setSteps(buildSteps(nums, target));
    setStepIdx(0);
    setPlaying(false);
    setEditingInput(false);
  }

  useEffect(() => {
    const data = generateRandomArray(arraySize);
    setRawData(data);
    const target = pickMiddleTarget(data);
    setSearchTarget(target);
    setSteps(buildSteps(data, target));
    setStepIdx(0);
    setPlaying(false);
  }, [algorithm, arraySize, buildSteps]);

  const currentStep = steps[stepIdx] ?? steps[0] ?? EMPTY_STEP;
  const isDone = stepIdx >= steps.length - 1;

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setStepIdx((prev) => {
          if (prev >= stepsRef.current.length - 1) {
            setPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, speed]);

  const maxVal = Math.max(...(rawData.length ? rawData : [100]), 1);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-5 border-b border-neon-cyan/10 relative">
        <div className="scanline-overlay" />
        <div className="flex items-start justify-between gap-4 relative">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Terminal size={14} className="text-neon-cyan/50" />
              <span className="text-[10px] font-mono text-neon-cyan/40 uppercase tracking-widest">
                {algorithm.category} // {algorithm.id}
              </span>
            </div>
            <h1 className="text-2xl font-display font-bold text-white tracking-tight glow-cyan">
              {algorithm.name}
            </h1>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed max-w-2xl font-mono">
              {algorithm.description}
            </p>
          </div>
          <button
            onClick={onCompare}
            className="btn-terminal shrink-0 flex items-center gap-2"
          >
            <BarChart2 size={14} />
            Compare
          </button>
        </div>

        {/* Complexity Row */}
        <div className="flex items-center gap-8 mt-5 flex-wrap relative">
          <ComplexityBadge label="Best" value={algorithm.complexity.best} />
          <ComplexityBadge
            label="Average"
            value={algorithm.complexity.average}
          />
          <ComplexityBadge label="Worst" value={algorithm.complexity.worst} />
          <ComplexityBadge
            label="Space"
            value={algorithm.complexity.space}
            color="slate"
          />
        </div>
      </div>

      {/* Visualizer */}
      <div className="flex-1 mx-6 my-4 bg-terminal-900 rounded-lg terminal-border overflow-hidden relative grid-bg">
        <div className="scanline-overlay" />
        <div className="relative w-full h-full">
          {isGraph && !isCustom ? (
            <GraphVisualizer step={currentStep} graph={graph} />
          ) : (
            <ArrayVisualizer step={currentStep} maxValue={maxVal} />
          )}
        </div>
      </div>

      {/* IO Panel */}
      <div className="mx-6 mb-2 rounded-md border border-neon-cyan/10 bg-terminal-900/60">
        {isGraph ? (
          <div className="flex items-center gap-4 px-4 py-2 flex-wrap">
            <span className="text-[9px] font-mono text-slate-700 uppercase tracking-widest shrink-0">
              PATH
            </span>
            <span className="text-[11px] font-mono text-neon-green/80 flex-1 min-w-0 truncate">
              {(currentStep.path ?? []).length > 0
                ? (currentStep.path ?? []).join(" → ")
                : "—"}
            </span>
            {(currentStep.queueOrStack ?? []).length > 0 && (
              <>
                <span className="text-[9px] font-mono text-slate-700 uppercase tracking-widest shrink-0">
                  {algorithm.id === "dfs" ? "STACK" : "QUEUE"}
                </span>
                <span className="text-[11px] font-mono text-neon-amber/70 shrink-0">
                  [{(currentStep.queueOrStack ?? []).join(", ")}]
                </span>
              </>
            )}
          </div>
        ) : (
          <>
            {/* INPUT row */}
            <div className="px-4 py-2 border-b border-neon-cyan/5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] font-mono text-slate-700 uppercase tracking-widest shrink-0">
                  INPUT
                </span>
                <span className="text-[9px] font-mono text-slate-700/50">
                  ({rawData.length} values)
                </span>
                {!isCustom && !editingInput && (
                  <button
                    onClick={() => {
                      setCustomInputStr(rawData.join(", "));
                      setInputError("");
                      setEditingInput(true);
                    }}
                    className="p-0.5 rounded hover:bg-neon-cyan/10 text-slate-700 hover:text-neon-cyan/70 transition-colors ml-auto"
                    title="Edit input"
                  >
                    <Pencil size={10} />
                  </button>
                )}
                {editingInput && (
                  <div className="ml-auto flex items-center gap-1">
                    <button
                      onClick={applyCustomInput}
                      className="p-0.5 rounded hover:bg-neon-green/10 text-neon-green/70 hover:text-neon-green transition-colors"
                      title="Apply (Enter)"
                    >
                      <Check size={12} />
                    </button>
                    <button
                      onClick={() => {
                        setEditingInput(false);
                        setInputError("");
                      }}
                      className="p-0.5 rounded hover:bg-neon-red/10 text-slate-600 hover:text-neon-red/70 transition-colors"
                      title="Cancel (Esc)"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
              {editingInput ? (
                <>
                  <textarea
                    autoFocus
                    rows={3}
                    value={customInputStr}
                    onChange={(e) => {
                      setCustomInputStr(e.target.value);
                      setInputError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        applyCustomInput();
                      }
                      if (e.key === "Escape") {
                        setEditingInput(false);
                        setInputError("");
                      }
                    }}
                    placeholder="e.g. 5, 3, 8, 1, 9, 2, 7 — max 1000 values"
                    className="w-full bg-terminal-800 border border-neon-cyan/25 rounded px-2 py-1.5 text-[11px] font-mono text-slate-200 placeholder-slate-700 focus:outline-none focus:border-neon-cyan/50 resize-none"
                  />
                  {inputError && (
                    <p className="text-[10px] text-neon-red/70 font-mono mt-1">
                      ⚠ {inputError}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-[11px] font-mono text-slate-500 leading-relaxed break-words">
                  {fmtArray(rawData)}
                </p>
              )}
            </div>
            {/* OUTPUT row */}
            <div className="px-4 py-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] font-mono text-slate-700 uppercase tracking-widest shrink-0">
                  OUTPUT
                </span>
                {(currentStep.sortedIndices ?? []).length > 0 && (
                  <span className="text-[9px] font-mono text-neon-green/50 ml-auto">
                    ✓ {(currentStep.sortedIndices ?? []).length}/
                    {rawData.length} sorted
                  </span>
                )}
              </div>
              <p className="text-[11px] font-mono text-neon-cyan/60 leading-relaxed break-words">
                {fmtArray(currentStep.array ?? [])}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Step Message */}
      <div className="mx-6 mb-3 px-4 py-2.5 bg-terminal-900/80 rounded-md border border-neon-cyan/10 flex items-center gap-3 font-mono relative">
        <div className="w-1.5 h-1.5 rounded-full bg-neon-cyan shrink-0 animate-pulse-glow" />
        <p className="text-[13px] text-slate-400 flex-1 min-w-0 truncate">
          <span className="text-neon-cyan/50 mr-1">&gt;</span>
          {currentStep?.message ?? "Ready"}
        </p>
        <span className="text-[11px] text-slate-700 shrink-0">
          {stepIdx + 1}/{steps.length}
        </span>
      </div>

      {/* Controls */}
      <div className="px-6 pb-5 flex flex-col gap-3">
        {/* Playback */}
        <div className="flex items-center gap-1.5 justify-center">
          <button
            onClick={() => {
              setStepIdx(0);
              setPlaying(false);
            }}
            className="btn-terminal p-2.5"
            title="Start"
          >
            <SkipBack size={15} />
          </button>
          <button
            onClick={() => setStepIdx((p) => Math.max(0, p - 1))}
            className="btn-terminal p-2.5"
            title="Step back"
          >
            <RotateCcw size={13} />
          </button>
          <button
            onClick={() => {
              if (isDone) {
                setStepIdx(0);
                setPlaying(true);
              } else {
                setPlaying((p) => !p);
              }
            }}
            className="btn-primary flex items-center gap-2 min-w-[110px] justify-center"
          >
            {playing ? <Pause size={15} /> : <Play size={15} />}
            {playing ? "Pause" : isDone ? "Replay" : "Run"}
          </button>
          <button
            onClick={() => setStepIdx((p) => Math.min(steps.length - 1, p + 1))}
            disabled={isDone}
            className="btn-terminal p-2.5 disabled:opacity-30"
            title="Step forward"
          >
            <SkipForward size={13} />
          </button>
          <button
            onClick={() => {
              setStepIdx(steps.length - 1);
              setPlaying(false);
            }}
            className="btn-terminal p-2.5"
            title="End"
          >
            <SkipForward size={15} />
          </button>
        </div>

        {/* Settings */}
        <div className="flex items-center gap-5 justify-center flex-wrap text-sm">
          {!isGraph && !isCustom && (
            <>
              <div className="flex items-center gap-2">
                <Hash size={12} className="text-slate-600" />
                <span className="text-slate-600 text-[11px] font-mono">
                  SIZE
                </span>
                <input
                  type="range"
                  min={5}
                  max={60}
                  value={arraySize}
                  onChange={(e) => setArraySize(Number(e.target.value))}
                  className="w-20 accent-[#00e5ff]"
                />
                <span className="text-neon-cyan/70 font-mono text-xs w-5">
                  {arraySize}
                </span>
              </div>
              <button
                onClick={randomize}
                className="btn-terminal flex items-center gap-1.5 text-xs py-1.5"
              >
                <Shuffle size={11} />
                Shuffle
              </button>
            </>
          )}
          {algorithm.category === "searching" && (
            <div className="flex items-center gap-2">
              <span className="text-slate-600 text-[11px] font-mono">
                TARGET
              </span>
              <span className="text-neon-green font-mono text-xs font-semibold glow-green">
                {searchTarget}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Gauge size={12} className="text-slate-600" />
            <span className="text-slate-600 text-[11px] font-mono">SPEED</span>
            <input
              type="range"
              min={50}
              max={900}
              step={50}
              value={950 - speed}
              onChange={(e) => setSpeed(950 - Number(e.target.value))}
              className="w-20 accent-[#00e5ff]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
