import { AlgorithmStep, Algorithm } from '../types';

function snap(
  array: number[],
  opts: Partial<Omit<AlgorithmStep, 'array'>> & { message?: string }
): AlgorithmStep {
  return { array: [...array], ...opts };
}

export function bubbleSortSteps(arr: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const a = [...arr];
  const sorted: number[] = [];

  for (let i = 0; i < a.length - 1; i++) {
    for (let j = 0; j < a.length - i - 1; j++) {
      steps.push(snap(a, { comparingIndices: [j, j + 1], sortedIndices: [...sorted], message: `Comparing a[${j}]=${a[j]} and a[${j+1}]=${a[j+1]}` }));
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        steps.push(snap(a, { swappedIndices: [j, j + 1], sortedIndices: [...sorted], message: `Swapped a[${j}] and a[${j+1}]` }));
      }
    }
    sorted.unshift(a.length - 1 - i);
  }
  sorted.unshift(0);
  steps.push(snap(a, { sortedIndices: [...sorted], message: 'Sorted!' }));
  return steps;
}

export function selectionSortSteps(arr: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const a = [...arr];
  const sorted: number[] = [];

  for (let i = 0; i < a.length - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < a.length; j++) {
      steps.push(snap(a, { comparingIndices: [minIdx, j], activeIndices: [i], sortedIndices: [...sorted], message: `Looking for min: comparing a[${minIdx}]=${a[minIdx]} with a[${j}]=${a[j]}` }));
      if (a[j] < a[minIdx]) minIdx = j;
    }
    if (minIdx !== i) {
      [a[i], a[minIdx]] = [a[minIdx], a[i]];
      steps.push(snap(a, { swappedIndices: [i, minIdx], sortedIndices: [...sorted], message: `Swapped a[${i}] and a[${minIdx}]` }));
    }
    sorted.push(i);
  }
  sorted.push(a.length - 1);
  steps.push(snap(a, { sortedIndices: [...sorted], message: 'Sorted!' }));
  return steps;
}

export function insertionSortSteps(arr: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const a = [...arr];

  for (let i = 1; i < a.length; i++) {
    const key = a[i];
    let j = i - 1;
    steps.push(snap(a, { activeIndices: [i], message: `Inserting a[${i}]=${key}` }));
    while (j >= 0 && a[j] > key) {
      steps.push(snap(a, { comparingIndices: [j, j + 1], message: `a[${j}]=${a[j]} > ${key}, shift right` }));
      a[j + 1] = a[j];
      steps.push(snap(a, { swappedIndices: [j, j + 1], message: `Shifted a[${j}] right` }));
      j--;
    }
    a[j + 1] = key;
    steps.push(snap(a, { sortedIndices: Array.from({ length: i + 1 }, (_, k) => k), message: `Placed ${key} at position ${j + 1}` }));
  }
  steps.push(snap(a, { sortedIndices: Array.from({ length: a.length }, (_, k) => k), message: 'Sorted!' }));
  return steps;
}

export function mergeSortSteps(arr: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const a = [...arr];

  function merge(array: number[], l: number, m: number, r: number) {
    const left = array.slice(l, m + 1);
    const right = array.slice(m + 1, r + 1);
    let i = 0, j = 0, k = l;
    while (i < left.length && j < right.length) {
      steps.push(snap(array, { comparingIndices: [l + i, m + 1 + j], activeIndices: Array.from({ length: r - l + 1 }, (_, x) => l + x), message: `Merging: comparing ${left[i]} and ${right[j]}` }));
      if (left[i] <= right[j]) { array[k++] = left[i++]; }
      else { array[k++] = right[j++]; }
      steps.push(snap(array, { activeIndices: Array.from({ length: r - l + 1 }, (_, x) => l + x), message: 'Merging...' }));
    }
    while (i < left.length) { array[k++] = left[i++]; steps.push(snap(array, { activeIndices: Array.from({ length: r - l + 1 }, (_, x) => l + x) })); }
    while (j < right.length) { array[k++] = right[j++]; steps.push(snap(array, { activeIndices: Array.from({ length: r - l + 1 }, (_, x) => l + x) })); }
  }

  function mergeSort(array: number[], l: number, r: number) {
    if (l >= r) return;
    const m = Math.floor((l + r) / 2);
    mergeSort(array, l, m);
    mergeSort(array, m + 1, r);
    merge(array, l, m, r);
  }

  mergeSort(a, 0, a.length - 1);
  steps.push(snap(a, { sortedIndices: Array.from({ length: a.length }, (_, k) => k), message: 'Sorted!' }));
  return steps;
}

export function quickSortSteps(arr: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const a = [...arr];

  function partition(array: number[], low: number, high: number): number {
    const pivotVal = array[high];
    steps.push(snap(array, { pivot: high, activeIndices: Array.from({ length: high - low + 1 }, (_, k) => low + k), message: `Pivot = ${pivotVal}` }));
    let i = low - 1;
    for (let j = low; j < high; j++) {
      steps.push(snap(array, { comparingIndices: [j, high], pivot: high, message: `Comparing a[${j}]=${array[j]} with pivot=${pivotVal}` }));
      if (array[j] <= pivotVal) {
        i++;
        [array[i], array[j]] = [array[j], array[i]];
        if (i !== j) steps.push(snap(array, { swappedIndices: [i, j], pivot: high, message: `Swapped a[${i}] and a[${j}]` }));
      }
    }
    [array[i + 1], array[high]] = [array[high], array[i + 1]];
    steps.push(snap(array, { swappedIndices: [i + 1, high], message: `Placed pivot at ${i + 1}` }));
    return i + 1;
  }

  function quickSort(array: number[], low: number, high: number) {
    if (low < high) {
      const pi = partition(array, low, high);
      quickSort(array, low, pi - 1);
      quickSort(array, pi + 1, high);
    }
  }

  quickSort(a, 0, a.length - 1);
  steps.push(snap(a, { sortedIndices: Array.from({ length: a.length }, (_, k) => k), message: 'Sorted!' }));
  return steps;
}

export function heapSortSteps(arr: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const a = [...arr];
  const n = a.length;

  function heapify(array: number[], size: number, root: number) {
    let largest = root;
    const l = 2 * root + 1;
    const r = 2 * root + 2;
    if (l < size) {
      steps.push(snap(array, { comparingIndices: [largest, l], message: `Heapify: comparing a[${largest}]=${array[largest]} and a[${l}]=${array[l]}` }));
      if (array[l] > array[largest]) largest = l;
    }
    if (r < size) {
      steps.push(snap(array, { comparingIndices: [largest, r], message: `Heapify: comparing a[${largest}]=${array[largest]} and a[${r}]=${array[r]}` }));
      if (array[r] > array[largest]) largest = r;
    }
    if (largest !== root) {
      [array[root], array[largest]] = [array[largest], array[root]];
      steps.push(snap(array, { swappedIndices: [root, largest], message: `Swapped a[${root}] and a[${largest}]` }));
      heapify(array, size, largest);
    }
  }

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(a, n, i);
  steps.push(snap(a, { activeIndices: Array.from({ length: n }, (_, k) => k), message: 'Max-heap built!' }));

  const sorted: number[] = [];
  for (let i = n - 1; i > 0; i--) {
    [a[0], a[i]] = [a[i], a[0]];
    sorted.unshift(i);
    steps.push(snap(a, { swappedIndices: [0, i], sortedIndices: [...sorted], message: `Extracted max, placed at ${i}` }));
    heapify(a, i, 0);
  }
  sorted.unshift(0);
  steps.push(snap(a, { sortedIndices: [...sorted], message: 'Sorted!' }));
  return steps;
}

export const SORTING_ALGORITHMS: Algorithm[] = [
  {
    id: 'bubble-sort',
    name: 'Bubble Sort',
    category: 'sorting',
    description: 'Repeatedly steps through the list comparing adjacent pairs and swapping them if they are in the wrong order. Simple but inefficient for large datasets.',
    complexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
    generate: (data) => bubbleSortSteps(data),
  },
  {
    id: 'selection-sort',
    name: 'Selection Sort',
    category: 'sorting',
    description: 'Finds the minimum element from the unsorted portion and places it at the beginning. Makes at most n-1 swaps.',
    complexity: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
    generate: (data) => selectionSortSteps(data),
  },
  {
    id: 'insertion-sort',
    name: 'Insertion Sort',
    category: 'sorting',
    description: 'Builds the sorted array one element at a time by inserting each element into its correct position. Efficient for small or nearly-sorted arrays.',
    complexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
    generate: (data) => insertionSortSteps(data),
  },
  {
    id: 'merge-sort',
    name: 'Merge Sort',
    category: 'sorting',
    description: 'Divides the array in half, recursively sorts each half, then merges them back together. Consistent O(n log n) performance.',
    complexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)' },
    generate: (data) => mergeSortSteps(data),
  },
  {
    id: 'quick-sort',
    name: 'Quick Sort',
    category: 'sorting',
    description: 'Selects a pivot element and partitions the array around it, then recursively sorts the sub-arrays. Very fast in practice.',
    complexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)', space: 'O(log n)' },
    generate: (data) => quickSortSteps(data),
  },
  {
    id: 'heap-sort',
    name: 'Heap Sort',
    category: 'sorting',
    description: 'Builds a max-heap from the array and repeatedly extracts the maximum element to produce a sorted array.',
    complexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(1)' },
    generate: (data) => heapSortSteps(data),
  },
];
