export type AlgorithmCategory = 'sorting' | 'searching' | 'graph' | 'tree' | 'dynamic' | 'other';

export interface Complexity {
  best: string;
  average: string;
  worst: string;
  space: string;
}

export interface AlgorithmStep {
  array?: number[];
  activeIndices?: number[];
  sortedIndices?: number[];
  swappedIndices?: number[];
  comparingIndices?: number[];
  visitedNodes?: number[];
  currentNode?: number;
  queueOrStack?: number[];
  path?: number[];
  message?: string;
  pivot?: number;
  graphEdges?: [number, number][];
}

export interface Algorithm {
  id: string;
  name: string;
  category: AlgorithmCategory;
  description: string;
  complexity: Complexity;
  generate: (data: number[], extra?: unknown) => AlgorithmStep[];
  isCustom?: boolean;
}

export interface GraphNode {
  id: number;
  x: number;
  y: number;
  label: string;
}

export interface GraphEdge {
  from: number;
  to: number;
  weight?: number;
}

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  adjacency: number[][];
}
