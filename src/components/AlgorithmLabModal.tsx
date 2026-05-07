import { useState, useCallback } from "react";
import {
  X,
  FlaskConical,
  Play,
  AlertCircle,
  CheckCircle,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Code2,
} from "lucide-react";
import { Algorithm, AlgorithmCategory, AlgorithmStep } from "../types";
import ArrayVisualizer from "./ArrayVisualizer";

interface Props {
  onClose: () => void;
  onAdded: (alg: Algorithm) => void;
}

const CATEGORIES: AlgorithmCategory[] = [
  "sorting",
  "searching",
  "graph",
  "tree",
  "dynamic",
  "other",
];

const DEFAULT_TEST_INPUT = "5, 3, 8, 1, 9, 2, 7, 4, 6";

const CODE_TEMPLATE = `/**
 * Algorithm Lab — implement your generate() function
 *
 * @param {number[]} data  Input array of numbers
 * @returns {Step[]}       Array of visualization steps
 *
 * Step shape:
 * {
 *   array: number[]           — required: current array state
 *   message?: string          — description text
 *   activeIndices?: number[]  — blue bars
 *   sortedIndices?: number[]  — green bars
 *   swappedIndices?: number[] — red bars
 *   comparingIndices?: number[] — cyan bars
 *   pivot?: number            — amber bar (index)
 * }
 */
function generate(data) {
  const steps = [];
  const a = [...data];

  for (let i = 0; i < a.length - 1; i++) {
    for (let j = 0; j < a.length - i - 1; j++) {
      steps.push({
        array: [...a],
        comparingIndices: [j, j + 1],
        message: \`Comparing a[\${j}]=\${a[j]} and a[\${j+1}]=\${a[j+1]}\`
      });
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        steps.push({
          array: [...a],
          swappedIndices: [j, j + 1],
          message: \`Swapped a[\${j}] ↔ a[\${j+1}]\`
        });
      }
    }
  }

  steps.push({
    array: [...a],
    sortedIndices: a.map((_, k) => k),
    message: 'Done!'
  });

  return steps;
}`;

const MAX_STEPS = 5000;

function runUserCode(
  code: string,
  data: number[],
): { steps: AlgorithmStep[]; error: string | null } {
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function(
      "data",
      `"use strict";
${code}
if (typeof generate !== 'function') {
  throw new Error('No generate() function found. Please define: function generate(data) { ... }');
}
const result = generate(data);
if (!Array.isArray(result)) throw new Error('generate() must return an array of steps.');
return result;`,
    );
    const steps = fn([...data]) as AlgorithmStep[];
    if (steps.length === 0) {
      return { steps: [], error: "generate() returned 0 steps." };
    }
    return {
      steps: steps.slice(0, MAX_STEPS),
      error:
        steps.length > MAX_STEPS
          ? `Truncated to ${MAX_STEPS} steps (was ${steps.length})`
          : null,
    };
  } catch (e) {
    return { steps: [], error: e instanceof Error ? e.message : String(e) };
  }
}

function parseInput(str: string): number[] {
  return str
    .split(/[\s,]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n) && n >= 1 && n <= 9999);
}

export default function AlgorithmLabModal({ onClose, onAdded }: Props) {
  const [code, setCode] = useState(CODE_TEMPLATE);
  const [testInputStr, setTestInputStr] = useState(DEFAULT_TEST_INPUT);
  const [runResult, setRunResult] = useState<{
    steps: AlgorithmStep[];
    error: string | null;
    truncated: boolean;
  } | null>(null);
  const [previewIdx, setPreviewIdx] = useState(0);
  const [showRef, setShowRef] = useState(false);

  // Metadata
  const [name, setName] = useState("");
  const [category, setCategory] = useState<AlgorithmCategory>("sorting");
  const [description, setDescription] = useState("");
  const [best, setBest] = useState("O(?)");
  const [avg, setAvg] = useState("O(?)");
  const [worst, setWorst] = useState("O(?)");
  const [space, setSpace] = useState("O(?)");
  const [saveError, setSaveError] = useState("");

  const handleTabKey = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const el = e.currentTarget;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const newVal =
          el.value.substring(0, start) + "  " + el.value.substring(end);
        setCode(newVal);
        requestAnimationFrame(() => {
          el.selectionStart = el.selectionEnd = start + 2;
        });
      }
    },
    [],
  );

  function handleRun() {
    const data = parseInput(testInputStr);
    if (data.length < 2) {
      setRunResult({
        steps: [],
        error: "Test input needs at least 2 valid numbers (1–9999).",
        truncated: false,
      });
      return;
    }
    const { steps, error } = runUserCode(code, data);
    const truncated = error?.startsWith("Truncated") ?? false;
    setRunResult({ steps, error: truncated ? null : error, truncated });
    setPreviewIdx(0);
  }

  function handleSave() {
    if (!name.trim()) {
      setSaveError("Algorithm name is required.");
      return;
    }
    if (!runResult || runResult.steps.length === 0) {
      setSaveError("Run your algorithm successfully before saving.");
      return;
    }
    setSaveError("");

    const capturedCode = code;
    const alg: Algorithm = {
      id: `lab-${Date.now()}-${name.trim().replace(/\s+/g, "-").toLowerCase()}`,
      name: name.trim(),
      category,
      description: description.trim() || `Custom algorithm: ${name.trim()}`,
      complexity: {
        best: best.trim() || "O(?)",
        average: avg.trim() || "O(?)",
        worst: worst.trim() || "O(?)",
        space: space.trim() || "O(?)",
      },
      generate: (data) => {
        const { steps, error } = runUserCode(capturedCode, data);
        if (error) return [{ array: [...data], message: `Error: ${error}` }];
        return steps;
      },
      isCustom: false,
    };

    onAdded(alg);
    onClose();
  }

  const previewSteps = runResult?.steps ?? [];
  const previewStep = previewSteps[previewIdx];
  const previewMax = Math.max(
    ...(parseInput(testInputStr).length ? parseInput(testInputStr) : [100]),
    1,
  );

  return (
    <div
      className="fixed inset-0 bg-terminal-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-terminal-900 terminal-border rounded-lg w-full max-w-5xl h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neon-cyan/10 shrink-0">
          <div className="flex items-center gap-2">
            <FlaskConical size={16} className="text-neon-cyan" />
            <h2 className="text-base font-display font-semibold text-white">
              Algorithm Lab
            </h2>
            <span className="text-[10px] font-mono text-slate-600 ml-1">
              --experimental
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-slate-700 hidden sm:block">
              ⚠ Code runs in your browser. Do not paste untrusted scripts.
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-terminal-800 text-slate-500 hover:text-white transition-all"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 flex gap-0 overflow-hidden">
          {/* Left: Code editor */}
          <div className="flex flex-col flex-1 min-w-0 border-r border-neon-cyan/10">
            {/* Step reference toggle */}
            <button
              onClick={() => setShowRef((v) => !v)}
              className="flex items-center gap-2 px-4 py-2 border-b border-neon-cyan/10 hover:bg-terminal-800/50 transition-colors"
            >
              <Code2 size={12} className="text-slate-600" />
              <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">
                Step Reference
              </span>
              {showRef ? (
                <ChevronUp size={11} className="text-slate-700 ml-auto" />
              ) : (
                <ChevronDown size={11} className="text-slate-700 ml-auto" />
              )}
            </button>
            {showRef && (
              <div className="px-4 py-3 bg-terminal-950/60 border-b border-neon-cyan/10 text-[10px] font-mono text-slate-600 leading-relaxed shrink-0">
                <span className="text-neon-cyan/50">interface</span> Step {"{"}{" "}
                <span className="text-neon-green/60">array</span>
                <span className="text-slate-700">: number[]</span>
                {"  "}
                <span className="text-neon-green/60">message</span>
                <span className="text-slate-700">?: string</span>
                {"  "}
                <span className="text-neon-blue/60">activeIndices</span>
                <span className="text-slate-700">?: number[]</span>
                {"  "}
                <span className="text-neon-green/60">sortedIndices</span>
                <span className="text-slate-700">?: number[]</span>
                {"  "}
                <span className="text-neon-red/60">swappedIndices</span>
                <span className="text-slate-700">?: number[]</span>
                {"  "}
                <span className="text-neon-cyan/60">comparingIndices</span>
                <span className="text-slate-700">?: number[]</span>
                {"  "}
                <span className="text-neon-amber/60">pivot</span>
                <span className="text-slate-700">?: number {"}"}</span>
              </div>
            )}

            {/* Textarea */}
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleTabKey}
              spellCheck={false}
              className="flex-1 min-h-0 w-full bg-terminal-950 px-4 py-3 text-[12px] font-mono text-slate-300 resize-none focus:outline-none leading-relaxed placeholder-slate-700"
              style={{ tabSize: 2 }}
            />

            {/* Test row */}
            <div className="border-t border-neon-cyan/10 p-3 flex items-center gap-2 shrink-0 flex-wrap">
              <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest shrink-0">
                INPUT
              </span>
              <input
                value={testInputStr}
                onChange={(e) => setTestInputStr(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRun()}
                placeholder="5, 3, 8, 1, 9, 2"
                className="flex-1 min-w-[140px] bg-terminal-800 border border-neon-cyan/15 rounded px-3 py-1.5 text-[11px] font-mono text-slate-200 placeholder-slate-700 focus:outline-none focus:border-neon-cyan/40"
              />
              <button
                onClick={handleRun}
                className="btn-primary flex items-center gap-1.5 text-xs py-1.5 shrink-0"
              >
                <Play size={12} />
                Run Test
              </button>
              {runResult && (
                <button
                  onClick={() => {
                    setRunResult(null);
                    setPreviewIdx(0);
                  }}
                  className="btn-terminal p-1.5 shrink-0"
                  title="Clear result"
                >
                  <RotateCcw size={12} />
                </button>
              )}
              {runResult && !runResult.error && runResult.steps.length > 0 && (
                <span className="text-[10px] font-mono text-neon-green/70 flex items-center gap-1 shrink-0">
                  <CheckCircle size={11} />
                  {runResult.steps.length} steps
                  {runResult.truncated && (
                    <span className="text-neon-amber/60 ml-1">
                      (truncated to {MAX_STEPS})
                    </span>
                  )}
                </span>
              )}
              {runResult?.error && (
                <span className="text-[10px] font-mono text-neon-red/70 flex items-center gap-1 min-w-0">
                  <AlertCircle size={11} className="shrink-0" />
                  <span className="truncate">{runResult.error}</span>
                </span>
              )}
            </div>
          </div>

          {/* Right: Preview + Metadata */}
          <div className="w-72 shrink-0 flex flex-col overflow-y-auto">
            {/* Preview visualizer */}
            <div className="p-3 border-b border-neon-cyan/10 shrink-0">
              <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mb-2">
                Preview
              </p>
              {previewSteps.length > 0 && previewStep ? (
                <>
                  <div className="h-28 bg-terminal-950 rounded-md border border-neon-cyan/10 overflow-hidden mb-2">
                    <ArrayVisualizer step={previewStep} maxValue={previewMax} />
                  </div>
                  <div className="text-[10px] font-mono text-slate-600 truncate mb-2">
                    <span className="text-neon-cyan/30 mr-1">&gt;</span>
                    {previewStep.message ?? "—"}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPreviewIdx((p) => Math.max(0, p - 1))}
                      disabled={previewIdx === 0}
                      className="btn-terminal p-1.5 disabled:opacity-30"
                    >
                      ‹
                    </button>
                    <span className="text-[10px] font-mono text-slate-700 flex-1 text-center">
                      {previewIdx + 1} / {previewSteps.length}
                    </span>
                    <button
                      onClick={() =>
                        setPreviewIdx((p) =>
                          Math.min(previewSteps.length - 1, p + 1),
                        )
                      }
                      disabled={previewIdx >= previewSteps.length - 1}
                      className="btn-terminal p-1.5 disabled:opacity-30"
                    >
                      ›
                    </button>
                  </div>
                </>
              ) : (
                <div className="h-28 bg-terminal-950 rounded-md border border-neon-cyan/10 flex items-center justify-center">
                  <span className="text-[11px] font-mono text-slate-700">
                    Run test to preview
                  </span>
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="p-3 space-y-3 flex-1">
              <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">
                Save to Library
              </p>

              <div>
                <label className="block text-[9px] font-mono text-slate-700 mb-1 uppercase tracking-widest">
                  Name *
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Algorithm"
                  className="w-full bg-terminal-800 border border-neon-cyan/15 rounded px-3 py-2 text-[11px] font-mono text-slate-200 placeholder-slate-700 focus:outline-none focus:border-neon-cyan/40"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono text-slate-700 mb-1 uppercase tracking-widest">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as AlgorithmCategory)
                  }
                  className="w-full bg-terminal-800 border border-neon-cyan/15 rounded px-3 py-2 text-[11px] font-mono text-slate-200 focus:outline-none focus:border-neon-cyan/40"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-mono text-slate-700 mb-1 uppercase tracking-widest">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Describe the algorithm..."
                  className="w-full bg-terminal-800 border border-neon-cyan/15 rounded px-3 py-2 text-[11px] font-mono text-slate-200 placeholder-slate-700 focus:outline-none focus:border-neon-cyan/40 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Best", val: best, set: setBest, ph: "O(n log n)" },
                  { label: "Average", val: avg, set: setAvg, ph: "O(n log n)" },
                  { label: "Worst", val: worst, set: setWorst, ph: "O(n²)" },
                  { label: "Space", val: space, set: setSpace, ph: "O(1)" },
                ].map(({ label, val, set, ph }) => (
                  <div key={label}>
                    <label className="block text-[9px] font-mono text-slate-700 mb-1">
                      {label}
                    </label>
                    <input
                      value={val}
                      onChange={(e) => set(e.target.value)}
                      placeholder={ph}
                      className="w-full bg-terminal-850 border border-neon-cyan/10 rounded px-2 py-1.5 text-[11px] font-mono text-neon-cyan/70 placeholder-slate-700 focus:outline-none focus:border-neon-cyan/30"
                    />
                  </div>
                ))}
              </div>

              {saveError && (
                <div className="flex items-center gap-2 text-neon-red/70 text-[11px] bg-neon-red/5 border border-neon-red/15 rounded px-3 py-2 font-mono">
                  <AlertCircle size={12} />
                  {saveError}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-4 border-t border-neon-cyan/10 shrink-0">
          <span className="text-[10px] font-mono text-slate-700 hidden md:block">
            Tip: Tab = indent · Enter = run test · Max{" "}
            {MAX_STEPS.toLocaleString()} steps
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={onClose} className="btn-terminal text-xs">
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <FlaskConical size={14} />
              Save to Library
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
