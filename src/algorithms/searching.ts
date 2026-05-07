import { AlgorithmStep, Algorithm } from '../types';

export function linearSearchSteps(arr: number[], target: number): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  for (let i = 0; i < arr.length; i++) {
    steps.push({ array: [...arr], activeIndices: [i], message: `Checking a[${i}]=${arr[i]} — target=${target}` });
    if (arr[i] === target) {
      steps.push({ array: [...arr], sortedIndices: [i], message: `Found ${target} at index ${i}!` });
      return steps;
    }
  }
  steps.push({ array: [...arr], message: `${target} not found in array.` });
  return steps;
}

export function binarySearchSteps(arr: number[], target: number): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const sorted = [...arr].sort((a, b) => a - b);
  let lo = 0, hi = sorted.length - 1;
  steps.push({ array: [...sorted], message: 'Array must be sorted. Starting binary search...' });

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const range = Array.from({ length: hi - lo + 1 }, (_, k) => lo + k);
    steps.push({ array: [...sorted], activeIndices: [mid], comparingIndices: [lo, hi], message: `lo=${lo}, hi=${hi}, mid=${mid}, a[mid]=${sorted[mid]}` });
    if (sorted[mid] === target) {
      steps.push({ array: [...sorted], sortedIndices: [mid], message: `Found ${target} at index ${mid}!` });
      return steps;
    } else if (sorted[mid] < target) {
      lo = mid + 1;
      steps.push({ array: [...sorted], activeIndices: range, message: `${sorted[mid]} < ${target}, search right half` });
    } else {
      hi = mid - 1;
      steps.push({ array: [...sorted], activeIndices: range, message: `${sorted[mid]} > ${target}, search left half` });
    }
  }
  steps.push({ array: [...sorted], message: `${target} not found.` });
  return steps;
}

export const SEARCHING_ALGORITHMS: Algorithm[] = [
  {
    id: 'linear-search',
    name: 'Linear Search',
    category: 'searching',
    description: 'Sequentially checks each element until the target is found or the list ends. Simple and works on unsorted data.',
    complexity: { best: 'O(1)', average: 'O(n)', worst: 'O(n)', space: 'O(1)' },
    generate: (data, extra) => linearSearchSteps(data, (extra as number) ?? data[Math.floor(data.length / 2)]),
  },
  {
    id: 'binary-search',
    name: 'Binary Search',
    category: 'searching',
    description: 'Works on sorted arrays by repeatedly halving the search interval. Extremely efficient for large datasets.',
    complexity: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)', space: 'O(1)' },
    generate: (data, extra) => binarySearchSteps(data, (extra as number) ?? data[Math.floor(data.length / 2)]),
  },
];
