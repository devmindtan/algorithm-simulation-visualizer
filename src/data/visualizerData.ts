import { AlgorithmCategory } from "../types";

export const GRAPH_CATEGORIES: AlgorithmCategory[] = ["graph", "tree"];

export const DEFAULT_ARRAY_SIZE = 20;
export const DEFAULT_ARRAY_MAX = 100;
export const DEFAULT_SPEED = 350;

export function generateRandomArray(
  size: number,
  max = DEFAULT_ARRAY_MAX,
): number[] {
  return Array.from(
    { length: size },
    () => Math.floor(Math.random() * max) + 5,
  );
}

export function pickMiddleTarget(data: number[]): number {
  return data[Math.floor(data.length / 2)] ?? 0;
}
