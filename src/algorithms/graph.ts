import { AlgorithmStep, Algorithm, Graph } from '../types';

export function buildDefaultGraph(): Graph {
  return {
    nodes: [
      { id: 0, x: 300, y: 60, label: '0' },
      { id: 1, x: 150, y: 180, label: '1' },
      { id: 2, x: 450, y: 180, label: '2' },
      { id: 3, x: 80, y: 300, label: '3' },
      { id: 4, x: 220, y: 300, label: '4' },
      { id: 5, x: 380, y: 300, label: '5' },
      { id: 6, x: 520, y: 300, label: '6' },
    ],
    edges: [
      { from: 0, to: 1 }, { from: 0, to: 2 },
      { from: 1, to: 3 }, { from: 1, to: 4 },
      { from: 2, to: 5 }, { from: 2, to: 6 },
    ],
    adjacency: [
      [1, 2], [0, 3, 4], [0, 5, 6],
      [1], [1], [2], [2],
    ],
  };
}

export function bfsSteps(graph: Graph, start: number): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const visited = new Set<number>();
  const queue: number[] = [start];
  visited.add(start);
  const path: number[] = [];

  steps.push({ visitedNodes: [...visited], queueOrStack: [...queue], message: `BFS start from node ${start}` });

  while (queue.length > 0) {
    const node = queue.shift()!;
    path.push(node);
    steps.push({ visitedNodes: [...visited], currentNode: node, queueOrStack: [...queue], path: [...path], message: `Visiting node ${node}` });

    for (const neighbor of graph.adjacency[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
        steps.push({ visitedNodes: [...visited], currentNode: node, queueOrStack: [...queue], path: [...path], message: `Enqueued neighbor ${neighbor}` });
      }
    }
  }
  steps.push({ visitedNodes: [...visited], path: [...path], message: `BFS complete. Order: ${path.join(' → ')}` });
  return steps;
}

export function dfsSteps(graph: Graph, start: number): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const visited = new Set<number>();
  const stack: number[] = [];
  const path: number[] = [];

  function dfs(node: number) {
    visited.add(node);
    stack.push(node);
    path.push(node);
    steps.push({ visitedNodes: [...visited], currentNode: node, queueOrStack: [...stack], path: [...path], message: `DFS visiting node ${node}` });

    for (const neighbor of graph.adjacency[node]) {
      if (!visited.has(neighbor)) {
        steps.push({ visitedNodes: [...visited], currentNode: node, queueOrStack: [...stack], path: [...path], message: `Exploring edge ${node} → ${neighbor}` });
        dfs(neighbor);
      }
    }
    stack.pop();
    steps.push({ visitedNodes: [...visited], currentNode: node, queueOrStack: [...stack], path: [...path], message: `Backtrack from node ${node}` });
  }

  steps.push({ visitedNodes: [], queueOrStack: [], message: `DFS start from node ${start}` });
  dfs(start);
  steps.push({ visitedNodes: [...visited], path: [...path], message: `DFS complete. Order: ${path.join(' → ')}` });
  return steps;
}

export const GRAPH_ALGORITHMS: Algorithm[] = [
  {
    id: 'bfs',
    name: 'BFS (Breadth-First Search)',
    category: 'graph',
    description: 'Explores all neighbors at the current depth before moving deeper. Uses a queue. Finds shortest path in unweighted graphs.',
    complexity: { best: 'O(V+E)', average: 'O(V+E)', worst: 'O(V+E)', space: 'O(V)' },
    generate: (_data, extra) => {
      const graph = (extra as { graph: Graph })?.graph ?? buildDefaultGraph();
      return bfsSteps(graph, 0);
    },
  },
  {
    id: 'dfs',
    name: 'DFS (Depth-First Search)',
    category: 'graph',
    description: 'Explores as far as possible along each branch before backtracking. Uses a stack (or recursion). Useful for topological sort, cycle detection.',
    complexity: { best: 'O(V+E)', average: 'O(V+E)', worst: 'O(V+E)', space: 'O(V)' },
    generate: (_data, extra) => {
      const graph = (extra as { graph: Graph })?.graph ?? buildDefaultGraph();
      return dfsSteps(graph, 0);
    },
  },
];
