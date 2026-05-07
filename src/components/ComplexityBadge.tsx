interface Props {
  label: string;
  value: string;
  color?: 'green' | 'yellow' | 'red' | 'blue' | 'slate';
}

const colorMap = {
  green: 'bg-neon-green/10 text-neon-green border-neon-green/25 box-glow-green',
  yellow: 'bg-neon-amber/10 text-neon-amber border-neon-amber/25 box-glow-amber',
  red: 'bg-neon-red/10 text-neon-red border-neon-red/25',
  blue: 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/25 box-glow-cyan',
  slate: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

function classifyComplexity(val: string): 'green' | 'yellow' | 'red' | 'blue' | 'slate' {
  if (val.includes('O(1)') || val.includes('O(log')) return 'green';
  if (val.includes('O(n)') && !val.includes('O(n²)') && !val.includes('O(n log')) return 'yellow';
  if (val.includes('O(n log') || val.includes('O(V+E)')) return 'blue';
  if (val.includes('O(n²)') || val.includes('O(n³)') || val.includes('O(2^n)')) return 'red';
  return 'slate';
}

export default function ComplexityBadge({ label, value, color }: Props) {
  const c = color ?? classifyComplexity(value);
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-[9px] uppercase tracking-[0.2em] font-mono text-slate-600">{label}</span>
      <span className={`text-xs font-mono font-semibold px-3 py-1.5 rounded-md border ${colorMap[c]}`}>{value}</span>
    </div>
  );
}
