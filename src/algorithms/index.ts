import { Algorithm } from '../types';
import { SORTING_ALGORITHMS } from './sorting';
import { SEARCHING_ALGORITHMS } from './searching';
import { GRAPH_ALGORITHMS } from './graph';

export const ALL_ALGORITHMS: Algorithm[] = [
  ...SORTING_ALGORITHMS,
  ...SEARCHING_ALGORITHMS,
  ...GRAPH_ALGORITHMS,
];

export { SORTING_ALGORITHMS, SEARCHING_ALGORITHMS, GRAPH_ALGORITHMS };
export { buildDefaultGraph, bfsSteps, dfsSteps } from './graph';
