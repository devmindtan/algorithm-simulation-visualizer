import { AlgorithmStep, Graph } from '../types';

interface Props {
  step: AlgorithmStep;
  graph: Graph;
}

export default function GraphVisualizer({ step, graph }: Props) {
  const visited = new Set(step.visitedNodes ?? []);
  const path = new Set(step.path ?? []);
  const current = step.currentNode;
  const queueOrStack = step.queueOrStack ?? [];

  function nodeFill(id: number): string {
    if (id === current) return '#00e5ff';
    if (path.has(id)) return '#00ff88';
    if (visited.has(id)) return '#3b82f6';
    return '#1e3040';
  }

  function nodeStroke(id: number): string {
    if (id === current) return '#00e5ff';
    if (path.has(id)) return '#00ff88';
    if (visited.has(id)) return '#3b82f6';
    return '#2a4258';
  }

  function edgeStroke(from: number, to: number): string {
    const pathArr = step.path ?? [];
    const fromIdx = pathArr.indexOf(from);
    const toIdx = pathArr.indexOf(to);
    if (fromIdx !== -1 && toIdx !== -1 && Math.abs(fromIdx - toIdx) === 1) return '#00ff88';
    if (visited.has(from) && visited.has(to)) return '#3b82f6';
    return '#1e3040';
  }

  function edgeGlow(from: number, to: number): string | undefined {
    const pathArr = step.path ?? [];
    const fromIdx = pathArr.indexOf(from);
    const toIdx = pathArr.indexOf(to);
    if (fromIdx !== -1 && toIdx !== -1 && Math.abs(fromIdx - toIdx) === 1) return '4px 0 12px rgba(0,255,136,0.4)';
    if (visited.has(from) && visited.has(to)) return '2px 0 8px rgba(59,130,246,0.3)';
    return undefined;
  }

  return (
    <div className="flex flex-col h-full">
      <svg viewBox="0 0 600 380" className="flex-1 w-full" style={{ maxHeight: 'calc(100% - 44px)' }}>
        {graph.edges.map((edge, i) => {
          const from = graph.nodes[edge.from];
          const to = graph.nodes[edge.to];
          return (
            <line
              key={i}
              x1={from.x} y1={from.y}
              x2={to.x} y2={to.y}
              stroke={edgeStroke(edge.from, edge.to)}
              strokeWidth="2.5"
              strokeLinecap="round"
              className="transition-all duration-300"
              style={{ filter: edgeGlow(edge.from, edge.to) ? `drop-shadow(${edgeGlow(edge.from, edge.to)})` : undefined }}
            />
          );
        })}
        {graph.nodes.map((node) => (
          <g key={node.id} className="transition-all duration-300">
            <circle
              cx={node.x} cy={node.y} r={22}
              fill={nodeFill(node.id)}
              stroke={nodeStroke(node.id)}
              strokeWidth="2"
              className="transition-all duration-300"
              style={{
                filter: node.id === current
                  ? 'drop-shadow(0 0 12px rgba(0,229,255,0.7)) drop-shadow(0 0 24px rgba(0,229,255,0.3))'
                  : path.has(node.id)
                  ? 'drop-shadow(0 0 8px rgba(0,255,136,0.5))'
                  : visited.has(node.id)
                  ? 'drop-shadow(0 0 6px rgba(59,130,246,0.4))'
                  : undefined,
              }}
            />
            <text
              x={node.x} y={node.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill="white"
              fontSize="13"
              fontWeight="700"
              fontFamily="'JetBrains Mono', monospace"
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>

      <div className="h-11 flex items-center gap-5 px-4 border-t border-neon-cyan/10 text-[11px] font-mono text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-neon-cyan shadow-[0_0_6px_rgba(0,229,255,0.6)]" />
          <span>Current</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-neon-green shadow-[0_0_6px_rgba(0,255,136,0.6)]" />
          <span>Path</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-neon-blue shadow-[0_0_6px_rgba(59,130,246,0.6)]" />
          <span>Visited</span>
        </div>
        {queueOrStack.length > 0 && (
          <div className="ml-auto flex items-center gap-1.5">
            <span className="text-slate-600">Q/S:</span>
            <span className="text-neon-cyan/80">[{queueOrStack.join(', ')}]</span>
          </div>
        )}
      </div>
    </div>
  );
}
