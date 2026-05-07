import { AlgorithmStep } from "../types";

interface Props {
  step?: AlgorithmStep;
  maxValue: number;
}

export default function ArrayVisualizer({ step, maxValue }: Props) {
  const arr = step?.array ?? [];
  const active = new Set(step?.activeIndices ?? []);
  const sorted = new Set(step?.sortedIndices ?? []);
  const swapped = new Set(step?.swappedIndices ?? []);
  const comparing = new Set(step?.comparingIndices ?? []);
  const pivot = step?.pivot;

  function barStyle(i: number): { bg: string; shadow: string } {
    if (pivot === i)
      return {
        bg: "bg-neon-amber",
        shadow: "shadow-[0_0_16px_rgba(251,191,36,0.6)]",
      };
    if (swapped.has(i))
      return {
        bg: "bg-neon-red",
        shadow: "shadow-[0_0_16px_rgba(255,71,87,0.6)]",
      };
    if (comparing.has(i))
      return {
        bg: "bg-neon-cyan",
        shadow: "shadow-[0_0_16px_rgba(0,229,255,0.5)]",
      };
    if (sorted.has(i))
      return {
        bg: "bg-neon-green",
        shadow: "shadow-[0_0_12px_rgba(0,255,136,0.4)]",
      };
    if (active.has(i))
      return {
        bg: "bg-neon-blue",
        shadow: "shadow-[0_0_12px_rgba(59,130,246,0.4)]",
      };
    return { bg: "bg-terminal-600", shadow: "" };
  }

  if (arr.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-600 text-sm font-mono">
        <span className="text-neon-cyan/40">&gt;_</span> No data to visualize
      </div>
    );
  }

  return (
    <div className="flex items-end justify-center gap-[2px] h-full px-4 pb-4 pt-3">
      {arr.map((val, i) => {
        const heightPct = Math.max(3, (val / maxValue) * 100);
        const style = barStyle(i);
        return (
          <div
            key={i}
            className="flex flex-col items-center gap-0.5 flex-1 min-w-0"
            style={{ height: "100%", justifyContent: "flex-end" }}
          >
            <span className="text-[8px] text-slate-600 font-mono truncate hidden lg:block">
              {val}
            </span>
            <div
              className={`w-full rounded-t-[1px] transition-all duration-150 ${style.bg} ${style.shadow}`}
              style={{ height: `${heightPct}%` }}
            />
          </div>
        );
      })}
    </div>
  );
}
