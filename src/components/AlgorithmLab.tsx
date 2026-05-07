import { useState, useEffect, useRef, useCallback } from "react";
import {
  FlaskConical,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  Loader,
  Code2,
  Info,
  GripVertical,
  BarChart2,
  GitBranch,
  Grid2X2,
  Type as TypeIcon,
} from "lucide-react";
import { AlgorithmStep, Graph } from "../types";
import ArrayVisualizer from "./ArrayVisualizer";
import GraphVisualizer from "./GraphVisualizer";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Props {
  onBack: () => void;
}

type Lang =
  | "javascript"
  | "typescript"
  | "python"
  | "java"
  | "go"
  | "rust"
  | "cpp";

interface LangMeta {
  label: string;
  badge: string;
  accent: string;
  placeholder: string;
  runnableInBrowser: boolean;
  hint?: string;
}

// ─── Vis-mode types ───────────────────────────────────────────────────────────

type VisMode = "array" | "graph" | "grid" | "text";

interface VisMeta {
  label: string;
  icon: React.ReactNode;
  accent: string;
  inputLabel: string;
  inputPlaceholder: string;
  multilineInput?: boolean;
  hint: string;
}

/** Superset of AlgorithmStep — adds grid and text fields for new modes */
interface LabStep extends AlgorithmStep {
  grid?: number[][];
  text?: string;
  activeChars?: number[];
  matchedChars?: number[];
}

// ─── Language catalogue ───────────────────────────────────────────────────────

const LANGS: Record<Lang, LangMeta> = {
  javascript: {
    label: "JavaScript",
    badge: "JS",
    accent: "text-neon-amber",
    placeholder: "// Write your generate(data) function here",
    runnableInBrowser: true,
  },
  typescript: {
    label: "TypeScript",
    badge: "TS",
    accent: "text-neon-blue",
    placeholder: "// TypeScript — type annotations are stripped before running",
    runnableInBrowser: true,
    hint: "Type annotations & interfaces are stripped. The function must be named generate(data).",
  },
  python: {
    label: "Python",
    badge: "PY",
    accent: "text-neon-green",
    placeholder: "# Write your generate(data) function here",
    runnableInBrowser: true,
    hint: "Runs via Pyodide (WebAssembly). First run downloads ~8 MB — subsequent runs are instant.",
  },
  java: {
    label: "Java",
    badge: "JAVA",
    accent: "text-neon-red",
    placeholder:
      "// Java — pseudocode reference only (not executable in browser)",
    runnableInBrowser: false,
    hint: "Java cannot run directly in the browser. Use this pane as a reference/pseudocode editor.",
  },
  go: {
    label: "Go",
    badge: "GO",
    accent: "text-neon-cyan",
    placeholder:
      "// Go — pseudocode reference only (not executable in browser)",
    runnableInBrowser: false,
    hint: "Go cannot run directly in the browser. Use this pane as a reference/pseudocode editor.",
  },
  rust: {
    label: "Rust",
    badge: "RS",
    accent: "text-neon-amber",
    placeholder:
      "// Rust — pseudocode reference only (not executable in browser)",
    runnableInBrowser: false,
    hint: "Rust WASM is possible but requires a build step outside this tool. Use this as a reference editor.",
  },
  cpp: {
    label: "C++",
    badge: "C++",
    accent: "text-neon-pink",
    placeholder:
      "// C++ — pseudocode reference only (not executable in browser)",
    runnableInBrowser: false,
    hint: "C++ cannot run directly in the browser. Use this pane as a reference/pseudocode editor.",
  },
};

// ─── Vis-mode catalogue ───────────────────────────────────────────────────────

const VIS_MODES: Record<VisMode, VisMeta> = {
  array: {
    label: "Array",
    icon: <BarChart2 size={13} />,
    accent: "text-neon-cyan",
    inputLabel: "Numbers",
    inputPlaceholder: "5, 3, 8, 1, 9, 2, 7, 4, 6",
    hint:
      "generate(data: number[]) → Step[]\n" +
      "Step: { array, comparingIndices?, swappedIndices?, sortedIndices?, activeIndices?, pivot?, message? }",
  },
  graph: {
    label: "Graph",
    icon: <GitBranch size={13} />,
    accent: "text-neon-amber",
    inputLabel: "Edges",
    inputPlaceholder: "0-1 1-2 2-3 3-4 4-0 0-3",
    hint:
      "generate(data: {nodes:number, edges:[number,number][]}) → Step[]\n" +
      "Step: { currentNode?, visitedNodes?, path?, queueOrStack?, message? }",
  },
  grid: {
    label: "Grid",
    icon: <Grid2X2 size={13} />,
    accent: "text-neon-green",
    inputLabel: "Grid rows",
    inputPlaceholder: "0 0 1 0\n0 0 0 0\n1 0 0 1\n0 0 0 0",
    multilineInput: true,
    hint:
      "generate(data: number[][]) → Step[]  (0=free, 1=wall)\n" +
      "Step: { grid: number[][], message? }\n" +
      "Cell values in step.grid: 0=empty 1=wall 2=visited 3=path 4=current 5=start 6=end",
  },
  text: {
    label: "Text",
    icon: <TypeIcon size={13} />,
    accent: "text-neon-pink",
    inputLabel: "String",
    inputPlaceholder: "hello world",
    hint:
      "generate(data: string) → Step[]\n" +
      "Step: { text: string, activeChars?: number[], matchedChars?: number[], message? }",
  },
};

// ─── Code templates ───────────────────────────────────────────────────────────

/** Array-mode templates (one per language) */
const ARRAY_TEMPLATES: Record<Lang, string> = {
  javascript: `/**
 * Algorithm Lab — JavaScript / Array mode
 *
 * @param {number[]} data   Input array
 * @returns {Step[]}
 *
 * Step: { array, comparingIndices?, swappedIndices?, sortedIndices?,
 *         activeIndices?, pivot?, message? }
 */
function generate(data) {
  const steps = [];
  const a = [...data];

  for (let i = 0; i < a.length - 1; i++) {
    for (let j = 0; j < a.length - i - 1; j++) {
      steps.push({
        array: [...a],
        comparingIndices: [j, j + 1],
        message: \`Comparing a[\${j}]=\${a[j]} and a[\${j+1}]=\${a[j+1]}\`,
      });
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        steps.push({
          array: [...a],
          swappedIndices: [j, j + 1],
          message: \`Swapped → a[\${j}]=\${a[j]}\`,
        });
      }
    }
  }

  steps.push({ array: [...a], sortedIndices: a.map((_, k) => k), message: "Done!" });
  return steps;
}`,

  typescript: `/**
 * Algorithm Lab — TypeScript / Array mode
 * (type annotations are stripped before execution)
 */
interface Step {
  array: number[];
  message?: string;
  activeIndices?: number[];
  sortedIndices?: number[];
  swappedIndices?: number[];
  comparingIndices?: number[];
  pivot?: number;
}

function generate(data: number[]): Step[] {
  const steps: Step[] = [];
  const a: number[] = [...data];

  for (let i = 0; i < a.length - 1; i++) {
    for (let j = 0; j < a.length - i - 1; j++) {
      steps.push({ array: [...a], comparingIndices: [j, j + 1],
        message: \`Comparing a[\${j}]=\${a[j]} and a[\${j+1}]=\${a[j+1]}\` });
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        steps.push({ array: [...a], swappedIndices: [j, j + 1],
          message: \`Swapped → a[\${j}]=\${a[j]}\` });
      }
    }
  }

  steps.push({ array: [...a], sortedIndices: a.map((_, k) => k), message: "Done!" });
  return steps;
}`,

  python: `"""
Algorithm Lab — Python / Array mode  (runs via Pyodide / WebAssembly)

generate(data: list[int]) → list[dict]
  Step keys: array, message, comparing_indices, swapped_indices,
             sorted_indices, active_indices, pivot
"""

def generate(data):
    steps = []
    a = list(data)

    for i in range(len(a) - 1):
        for j in range(len(a) - i - 1):
            steps.append({
                "array": list(a),
                "comparing_indices": [j, j + 1],
                "message": f"Comparing a[{j}]={a[j]} and a[{j+1}]={a[j+1]}",
            })
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
                steps.append({
                    "array": list(a),
                    "swapped_indices": [j, j + 1],
                    "message": f"Swapped → a[{j}]={a[j]}",
                })

    steps.append({"array": list(a), "sorted_indices": list(range(len(a))), "message": "Done!"})
    return steps`,

  java: `/**
 * Algorithm Lab — Java (pseudocode / reference only)
 * Cannot run directly in the browser.
 */
import java.util.*;

public class MyAlgorithm {

    public static List<Map<String, Object>> generate(int[] data) {
        List<Map<String, Object>> steps = new ArrayList<>();
        int[] a = data.clone();

        for (int i = 0; i < a.length - 1; i++) {
            for (int j = 0; j < a.length - i - 1; j++) {
                Map<String, Object> step = new HashMap<>();
                step.put("array", a.clone());
                step.put("comparingIndices", new int[]{j, j + 1});
                step.put("message", "Comparing a[" + j + "]=" + a[j] + " and a[" + (j+1) + "]=" + a[j+1]);
                steps.add(step);
                if (a[j] > a[j + 1]) {
                    int tmp = a[j]; a[j] = a[j + 1]; a[j + 1] = tmp;
                    Map<String, Object> swap = new HashMap<>();
                    swap.put("array", a.clone());
                    swap.put("swappedIndices", new int[]{j, j + 1});
                    swap.put("message", "Swapped");
                    steps.add(swap);
                }
            }
        }
        Map<String, Object> done = new HashMap<>();
        done.put("array", a.clone());
        done.put("message", "Done!");
        steps.add(done);
        return steps;
    }
}`,

  go: `// Algorithm Lab — Go (pseudocode / reference only)
package main

import "fmt"

type Step struct {
    Array            []int  \`json:"array"\`
    Message          string \`json:"message,omitempty"\`
    ComparingIndices []int  \`json:"comparingIndices,omitempty"\`
    SwappedIndices   []int  \`json:"swappedIndices,omitempty"\`
    SortedIndices    []int  \`json:"sortedIndices,omitempty"\`
}

func generate(data []int) []Step {
    steps := []Step{}
    a := make([]int, len(data))
    copy(a, data)
    for i := 0; i < len(a)-1; i++ {
        for j := 0; j < len(a)-i-1; j++ {
            snap := make([]int, len(a)); copy(snap, a)
            steps = append(steps, Step{Array: snap, ComparingIndices: []int{j, j+1},
                Message: fmt.Sprintf("Comparing [%d]=%d and [%d]=%d", j, a[j], j+1, a[j+1])})
            if a[j] > a[j+1] {
                a[j], a[j+1] = a[j+1], a[j]
                snap2 := make([]int, len(a)); copy(snap2, a)
                steps = append(steps, Step{Array: snap2, SwappedIndices: []int{j, j+1}, Message: "Swapped"})
            }
        }
    }
    idx := make([]int, len(a))
    for k := range idx { idx[k] = k }
    steps = append(steps, Step{Array: a, SortedIndices: idx, Message: "Done!"})
    return steps
}`,

  rust: `// Algorithm Lab — Rust (pseudocode / reference only)
use serde::Serialize;

#[derive(Serialize, Clone)]
struct Step {
    array: Vec<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    message: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    comparing_indices: Option<Vec<usize>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    swapped_indices: Option<Vec<usize>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    sorted_indices: Option<Vec<usize>>,
}

pub fn generate(data: &[i64]) -> Vec<Step> {
    let mut steps = vec![];
    let mut a = data.to_vec();
    for i in 0..a.len().saturating_sub(1) {
        for j in 0..a.len() - i - 1 {
            steps.push(Step { array: a.clone(),
                message: Some(format!("Comparing [{}]={} and [{}]={}", j, a[j], j+1, a[j+1])),
                comparing_indices: Some(vec![j, j+1]),
                swapped_indices: None, sorted_indices: None });
            if a[j] > a[j+1] {
                a.swap(j, j+1);
                steps.push(Step { array: a.clone(), message: Some("Swapped".to_string()),
                    comparing_indices: None, swapped_indices: Some(vec![j, j+1]), sorted_indices: None });
            }
        }
    }
    let sorted: Vec<usize> = (0..a.len()).collect();
    steps.push(Step { array: a, message: Some("Done!".to_string()),
        comparing_indices: None, swapped_indices: None, sorted_indices: Some(sorted) });
    steps
}`,

  cpp: `// Algorithm Lab — C++ (pseudocode / reference only)
#include <vector>
#include <string>
#include <numeric>
using namespace std;

struct Step {
    vector<int> array;
    string message;
    vector<int> comparingIndices;
    vector<int> swappedIndices;
    vector<int> sortedIndices;
};

vector<Step> generate(vector<int> data) {
    vector<Step> steps;
    vector<int> a = data;
    for (int i = 0; i < (int)a.size()-1; i++) {
        for (int j = 0; j < (int)a.size()-i-1; j++) {
            steps.push_back({a, "Comparing "+to_string(a[j])+" and "+to_string(a[j+1]), {j,j+1}, {}, {}});
            if (a[j] > a[j+1]) {
                swap(a[j], a[j+1]);
                steps.push_back({a, "Swapped", {}, {j,j+1}, {}});
            }
        }
    }
    vector<int> idx(a.size()); iota(idx.begin(), idx.end(), 0);
    steps.push_back({a, "Done!", {}, {}, idx});
    return steps;
}`,
};

/** Graph-mode templates (runnable langs only) */
const GRAPH_TEMPLATES: Partial<Record<Lang, string>> = {
  javascript: `/**
 * Algorithm Lab — JavaScript / Graph mode
 *
 * @param {{ nodes: number, edges: [number, number][] }} data
 * @returns {Step[]}
 *
 * Step: { currentNode?, visitedNodes?, queueOrStack?, path?, message? }
 *   currentNode   — cyan (currently processing)
 *   visitedNodes  — blue
 *   path          — green (ordered path from start to a node)
 *   queueOrStack  — shown in legend
 */
function generate(data) {
  const { nodes, edges } = data;
  const adj = Array.from({ length: nodes }, () => []);
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); }

  const steps = [];
  const visited = new Set();
  const queue = [0];
  visited.add(0);

  while (queue.length > 0) {
    const node = queue.shift();
    steps.push({
      currentNode: node,
      visitedNodes: [...visited],
      queueOrStack: [...queue],
      message: \`Visiting node \${node}  |  queue: [\${queue.join(', ')}]\`,
    });
    for (const nb of adj[node]) {
      if (!visited.has(nb)) { visited.add(nb); queue.push(nb); }
    }
  }

  steps.push({ visitedNodes: [...visited], message: \`BFS complete — \${visited.size} nodes visited\` });
  return steps;
}`,

  typescript: `/**
 * Algorithm Lab — TypeScript / Graph mode
 */
interface GraphData { nodes: number; edges: [number, number][]; }
interface Step {
  currentNode?: number;
  visitedNodes?: number[];
  queueOrStack?: number[];
  path?: number[];
  message?: string;
}

function generate(data: GraphData): Step[] {
  const { nodes, edges } = data;
  const adj: number[][] = Array.from({ length: nodes }, () => []);
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); }

  const steps: Step[] = [];
  const visited = new Set<number>();
  const queue: number[] = [0];
  visited.add(0);

  while (queue.length > 0) {
    const node = queue.shift()!;
    steps.push({ currentNode: node, visitedNodes: [...visited], queueOrStack: [...queue],
      message: \`Visiting node \${node}  |  queue: [\${queue.join(', ')}]\` });
    for (const nb of adj[node]) {
      if (!visited.has(nb)) { visited.add(nb); queue.push(nb); }
    }
  }

  steps.push({ visitedNodes: [...visited], message: \`BFS complete — \${visited.size} nodes visited\` });
  return steps;
}`,

  python: `"""
Algorithm Lab — Python / Graph mode

generate(data: dict) → list[dict]
  data = { "nodes": int, "edges": list[list[int]] }

Step keys: current_node, visited_nodes, queue_or_stack, path, message
"""

def generate(data):
    nodes = data["nodes"]
    edges = data["edges"]
    adj = [[] for _ in range(nodes)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)

    steps = []
    visited = set()
    queue = [0]
    visited.add(0)

    while queue:
        node = queue.pop(0)
        steps.append({
            "current_node": node,
            "visited_nodes": list(visited),
            "queue_or_stack": list(queue),
            "message": f"Visiting node {node}  |  queue: {queue}",
        })
        for nb in adj[node]:
            if nb not in visited:
                visited.add(nb)
                queue.append(nb)

    steps.append({"visited_nodes": list(visited), "message": f"BFS complete — {len(visited)} nodes visited"})
    return steps`,
};

/** Grid-mode templates (runnable langs only) */
const GRID_TEMPLATES: Partial<Record<Lang, string>> = {
  javascript: `/**
 * Algorithm Lab — JavaScript / Grid mode
 * BFS pathfinding on a 2-D grid
 *
 * @param {number[][]} data   0 = free, 1 = wall
 * @returns {Step[]}          Each step has a 'grid' snapshot
 *
 * Cell values you can write into grid snapshots:
 *   0 = empty (dark)   1 = wall (grey)
 *   2 = visited (blue) 3 = path (green)
 *   4 = current (cyan) 5 = start (amber) 6 = end (red)
 */
function generate(data) {
  const rows = data.length, cols = data[0].length;
  const grid = data.map(r => [...r]);
  const steps = [];

  const start = [0, 0], end = [rows - 1, cols - 1];
  grid[start[0]][start[1]] = 5;
  grid[end[0]][end[1]] = 6;

  const queue = [start];
  const visited = new Set([\`\${start[0]},\${start[1]}\`]);
  const parent = {};
  const dirs = [[0,1],[1,0],[0,-1],[-1,0]];

  while (queue.length > 0) {
    const [r, c] = queue.shift();
    const snap = grid.map(row => [...row]);
    if (snap[r][c] !== 5) snap[r][c] = 4;
    steps.push({ grid: snap, message: \`Visiting (\${r},\${c})\` });
    if (r === end[0] && c === end[1]) break;
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      const key = \`\${nr},\${nc}\`;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols
          && !visited.has(key) && data[nr][nc] === 0) {
        visited.add(key);
        parent[key] = \`\${r},\${c}\`;
        grid[nr][nc] = 2;
        queue.push([nr, nc]);
      }
    }
  }

  // Trace back path
  const endKey = \`\${end[0]},\${end[1]}\`;
  if (parent[endKey] !== undefined) {
    const finalGrid = data.map(r => [...r]);
    finalGrid[start[0]][start[1]] = 5;
    finalGrid[end[0]][end[1]] = 6;
    let cur = endKey;
    while (cur) {
      const [pr, pc] = cur.split(',').map(Number);
      if (finalGrid[pr][pc] !== 5 && finalGrid[pr][pc] !== 6) finalGrid[pr][pc] = 3;
      cur = parent[cur];
    }
    steps.push({ grid: finalGrid, message: 'Path found!' });
  } else {
    steps.push({ grid: grid.map(r => [...r]), message: 'No path.' });
  }

  return steps;
}`,

  typescript: `/**
 * Algorithm Lab — TypeScript / Grid mode
 */
interface Step { grid: number[][]; message?: string; }

function generate(data: number[][]): Step[] {
  const rows = data.length, cols = data[0].length;
  const grid = data.map(r => [...r]);
  const steps: Step[] = [];

  const start: [number,number] = [0, 0], end: [number,number] = [rows-1, cols-1];
  grid[start[0]][start[1]] = 5;
  grid[end[0]][end[1]] = 6;

  const queue: [number,number][] = [start];
  const visited = new Set([\`\${start[0]},\${start[1]}\`]);
  const parent: Record<string, string> = {};
  const dirs: [number,number][] = [[0,1],[1,0],[0,-1],[-1,0]];

  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    const snap = grid.map(row => [...row]);
    if (snap[r][c] !== 5) snap[r][c] = 4;
    steps.push({ grid: snap, message: \`Visiting (\${r},\${c})\` });
    if (r === end[0] && c === end[1]) break;
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc, key = \`\${nr},\${nc}\`;
      if (nr>=0 && nr<rows && nc>=0 && nc<cols && !visited.has(key) && data[nr][nc]===0) {
        visited.add(key); parent[key] = \`\${r},\${c}\`; grid[nr][nc] = 2; queue.push([nr,nc]);
      }
    }
  }

  const endKey = \`\${end[0]},\${end[1]}\`;
  if (parent[endKey]) {
    const finalGrid = data.map(r => [...r]);
    finalGrid[start[0]][start[1]] = 5; finalGrid[end[0]][end[1]] = 6;
    let cur: string | undefined = endKey;
    while (cur) {
      const [pr, pc] = cur.split(',').map(Number);
      if (finalGrid[pr][pc] !== 5 && finalGrid[pr][pc] !== 6) finalGrid[pr][pc] = 3;
      cur = parent[cur];
    }
    steps.push({ grid: finalGrid, message: 'Path found!' });
  }
  return steps;
}`,

  python: `"""
Algorithm Lab — Python / Grid mode

generate(data: list[list[int]]) → list[dict]
  0=free, 1=wall
  Step: { "grid": list[list[int]], "message": str }
  Cell values: 0=empty 1=wall 2=visited 3=path 4=current 5=start 6=end
"""

def generate(data):
    rows, cols = len(data), len(data[0])
    grid = [list(row) for row in data]
    steps = []

    grid[0][0] = 5
    grid[rows-1][cols-1] = 6

    queue = [(0, 0)]
    visited = {(0, 0)}
    parent = {}
    dirs = [(0,1),(1,0),(0,-1),(-1,0)]

    while queue:
        r, c = queue.pop(0)
        snap = [list(row) for row in grid]
        if snap[r][c] != 5:
            snap[r][c] = 4
        steps.append({"grid": snap, "message": f"Visiting ({r},{c})"})
        if r == rows-1 and c == cols-1:
            break
        for dr, dc in dirs:
            nr, nc = r+dr, c+dc
            if 0<=nr<rows and 0<=nc<cols and (nr,nc) not in visited and data[nr][nc]==0:
                visited.add((nr,nc))
                parent[(nr,nc)] = (r,c)
                grid[nr][nc] = 2
                queue.append((nr,nc))

    end = (rows-1, cols-1)
    if end in parent:
        final = [list(row) for row in data]
        final[0][0] = 5
        final[rows-1][cols-1] = 6
        cur = end
        while cur in parent:
            pr, pc = cur
            if final[pr][pc] not in (5, 6):
                final[pr][pc] = 3
            cur = parent[cur]
        steps.append({"grid": final, "message": "Path found!"})
    else:
        steps.append({"grid": grid, "message": "No path."})
    return steps`,
};

/** Text-mode templates (runnable langs only) */
const TEXT_TEMPLATES: Partial<Record<Lang, string>> = {
  javascript: `/**
 * Algorithm Lab — JavaScript / Text mode
 * Naive pattern search example
 *
 * @param {string} data   Input string to search in
 * @returns {Step[]}
 *
 * Step: { text: string, activeChars?: number[], matchedChars?: number[], message? }
 *   activeChars   — cyan characters (currently comparing)
 *   matchedChars  — green characters (confirmed match)
 */
function generate(data) {
  const text = data;
  const pattern = 'lo';   // ← change me

  const steps = [];
  const n = text.length, m = pattern.length;

  for (let i = 0; i <= n - m; i++) {
    let j = 0;
    while (j < m && text[i + j] === pattern[j]) j++;

    const checking = Array.from({ length: j + 1 }, (_, k) => i + k).filter(k => k < n);
    if (j === m) {
      steps.push({
        text,
        matchedChars: Array.from({ length: m }, (_, k) => i + k),
        activeChars: [],
        message: \`✓ Match found at index \${i}\`,
      });
    } else {
      steps.push({
        text,
        activeChars: checking,
        matchedChars: [],
        message: \`Checking position \${i}: matched \${j}/\${m} chars\`,
      });
    }
  }

  steps.push({ text, activeChars: [], matchedChars: [], message: 'Search complete.' });
  return steps;
}`,

  typescript: `/**
 * Algorithm Lab — TypeScript / Text mode
 */
interface Step {
  text: string;
  activeChars?: number[];
  matchedChars?: number[];
  message?: string;
}

function generate(data: string): Step[] {
  const text = data;
  const pattern = 'lo';   // ← change me

  const steps: Step[] = [];
  const n = text.length, m = pattern.length;

  for (let i = 0; i <= n - m; i++) {
    let j = 0;
    while (j < m && text[i + j] === pattern[j]) j++;
    const checking = Array.from({ length: j + 1 }, (_, k) => i + k).filter(k => k < n);
    if (j === m) {
      steps.push({ text, matchedChars: Array.from({ length: m }, (_, k) => i + k),
        activeChars: [], message: \`✓ Match found at index \${i}\` });
    } else {
      steps.push({ text, activeChars: checking, matchedChars: [],
        message: \`Checking position \${i}: matched \${j}/\${m} chars\` });
    }
  }

  steps.push({ text, activeChars: [], matchedChars: [], message: 'Search complete.' });
  return steps;
}`,

  python: `"""
Algorithm Lab — Python / Text mode

generate(data: str) → list[dict]
Step: { "text": str, "active_chars": list[int], "matched_chars": list[int], "message": str }
"""

def generate(data):
    text = data
    pattern = 'lo'   # ← change me
    steps = []
    n, m = len(text), len(pattern)

    for i in range(n - m + 1):
        j = 0
        while j < m and text[i+j] == pattern[j]:
            j += 1
        checking = [i+k for k in range(j+1) if i+k < n]
        if j == m:
            steps.append({
                "text": text,
                "matched_chars": [i+k for k in range(m)],
                "active_chars": [],
                "message": f"Match found at index {i}!",
            })
        else:
            steps.append({
                "text": text,
                "active_chars": checking,
                "matched_chars": [],
                "message": f"Checking position {i}: matched {j}/{m}",
            })

    steps.append({"text": text, "active_chars": [], "matched_chars": [], "message": "Search complete."})
    return steps`,
};

function getTemplate(mode: VisMode, lang: Lang): string {
  if (mode !== "array" && LANGS[lang].runnableInBrowser) {
    const map = { graph: GRAPH_TEMPLATES, grid: GRID_TEMPLATES, text: TEXT_TEMPLATES };
    return map[mode][lang] ?? ARRAY_TEMPLATES[lang];
  }
  return ARRAY_TEMPLATES[lang];
}

// ─── Pyodide singleton ────────────────────────────────────────────────────────

let pyodideInstance: unknown = null;
let pyodideLoading = false;
let pyodideCallbacks: Array<(py: unknown) => void> = [];

async function loadPyodide(): Promise<unknown> {
  if (pyodideInstance) return pyodideInstance;
  if (pyodideLoading) {
    return new Promise((resolve) => pyodideCallbacks.push(resolve));
  }
  pyodideLoading = true;

  if (!document.getElementById("pyodide-script")) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.id = "pyodide-script";
      script.src = "https://cdn.jsdelivr.net/pyodide/v0.26.1/full/pyodide.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Pyodide script"));
      document.head.appendChild(script);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const py = await (window as any).loadPyodide();
  pyodideInstance = py;
  pyodideLoading = false;
  pyodideCallbacks.forEach((cb) => cb(py));
  pyodideCallbacks = [];
  return py;
}

// ─── Strip TypeScript types (very lightweight) ────────────────────────────────

function stripTypes(ts: string): string {
  return ts
    .replace(/^import\s+.*?;?\s*$/gm, "")
    .replace(/^export\s+/gm, "")
    .replace(/^(interface|type)\s+\w+[\s\S]*?^}/gm, "")
    .replace(/:\s*[\w<>[\]|&,\s.]+(?=[,)=;\n{])/g, "")
    .replace(/<[^>()]*>/g, "")
    .replace(/\bas\s+\w+/g, "");
}

// ─── Normalise Python snake_case step keys → camelCase ───────────────────────

function normalisePythonStep(raw: Record<string, unknown>): LabStep {
  return {
    array: (raw.array ?? raw.arr ?? undefined) as number[] | undefined,
    message: (raw.message ?? raw.msg ?? "") as string,
    activeIndices: (raw.active_indices ?? raw.activeIndices ?? []) as number[],
    sortedIndices: (raw.sorted_indices ?? raw.sortedIndices ?? []) as number[],
    swappedIndices: (raw.swapped_indices ?? raw.swappedIndices ?? []) as number[],
    comparingIndices: (raw.comparing_indices ?? raw.comparingIndices ?? []) as number[],
    pivot: raw.pivot as number | undefined,
    // graph
    visitedNodes: (raw.visited_nodes ?? raw.visitedNodes ?? undefined) as number[] | undefined,
    currentNode: (raw.current_node ?? raw.currentNode ?? undefined) as number | undefined,
    queueOrStack: (raw.queue_or_stack ?? raw.queueOrStack ?? undefined) as number[] | undefined,
    path: (raw.path ?? undefined) as number[] | undefined,
    // grid
    grid: (raw.grid ?? undefined) as number[][] | undefined,
    // text
    text: (raw.text ?? undefined) as string | undefined,
    activeChars: (raw.active_chars ?? raw.activeChars ?? undefined) as number[] | undefined,
    matchedChars: (raw.matched_chars ?? raw.matchedChars ?? undefined) as number[] | undefined,
  };
}

// ─── Run helpers ──────────────────────────────────────────────────────────────

const MAX_STEPS = 5000;

async function runJS(code: string, data: unknown): Promise<LabStep[]> {
  // eslint-disable-next-line no-new-func
  const fn = new Function(
    "data",
    `"use strict";
${code}
if (typeof generate !== 'function') throw new Error('No generate() function found.');
const result = generate(data);
if (!Array.isArray(result)) throw new Error('generate() must return an array.');
return result;`,
  );
  // Deep-clone only if it's an array (don't clone strings)
  const input = Array.isArray(data) ? [...data] : data;
  const steps = fn(input) as LabStep[];
  return steps.slice(0, MAX_STEPS);
}

async function runTS(code: string, data: unknown): Promise<LabStep[]> {
  return runJS(stripTypes(code), data);
}

async function runPython(
  code: string,
  data: unknown,
  onStatus: (msg: string) => void,
): Promise<LabStep[]> {
  onStatus("Loading Python runtime (Pyodide)…");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const py = (await loadPyodide()) as any;
  onStatus("Running…");

  const fullCode = `
import json, sys

${code}

_data = ${JSON.stringify(data)}
_result = generate(_data)
_out = []
for _s in _result:
    _item = {}
    for _k, _v in _s.items():
        if isinstance(_v, (list, range)):
            _item[_k] = [list(r) if isinstance(r, (list, range)) else r for r in _v]
        else:
            _item[_k] = _v
    _out.append(_item)
json.dumps(_out)
`;
  const json = await py.runPythonAsync(fullCode);
  const raw = JSON.parse(json) as Record<string, unknown>[];
  return raw.slice(0, MAX_STEPS).map(normalisePythonStep);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseArrayInput(str: string): number[] {
  return str
    .split(/[\s,]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n) && n >= 1 && n <= 99999)
    .slice(0, 1000);
}

function parseGridInput(str: string): number[][] {
  return str
    .trim()
    .split("\n")
    .map((line) =>
      line
        .trim()
        .split(/[\s,]+/)
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n)),
    )
    .filter((row) => row.length > 0);
}

function parseLabGraphEdges(str: string): { nodes: number; edges: [number, number][] } {
  const edges: [number, number][] = [];
  const nodeSet = new Set<number>();
  const pairs = str.trim().split(/[\s\n]+/);
  for (const pair of pairs) {
    const parts = pair.split(/[-,]/);
    if (parts.length === 2) {
      const u = parseInt(parts[0]), v = parseInt(parts[1]);
      if (!isNaN(u) && !isNaN(v)) {
        edges.push([u, v]);
        nodeSet.add(u);
        nodeSet.add(v);
      }
    }
  }
  const nodeCount = nodeSet.size > 0 ? Math.max(...nodeSet) + 1 : 0;
  return { nodes: nodeCount, edges };
}

function buildLabGraph(edgeStr: string): Graph {
  const { nodes: nodeCount, edges } = parseLabGraphEdges(edgeStr);
  const r = Math.min(160, 45 + nodeCount * 14);
  const graphNodes = Array.from({ length: nodeCount }, (_, i) => {
    const angle = (i / Math.max(nodeCount, 1)) * 2 * Math.PI - Math.PI / 2;
    return { id: i, x: 300 + r * Math.cos(angle), y: 190 + r * Math.sin(angle), label: String(i) };
  });
  const adjacency: number[][] = Array.from({ length: nodeCount }, () => []);
  for (const [u, v] of edges) {
    if (u < nodeCount && v < nodeCount) { adjacency[u].push(v); adjacency[v].push(u); }
  }
  return { nodes: graphNodes, edges: edges.map(([from, to]) => ({ from, to })), adjacency };
}

function parseInputForMode(
  str: string,
  mode: VisMode,
): { data: unknown; error: string | null } {
  if (mode === "array") {
    const nums = parseArrayInput(str);
    if (nums.length < 2) return { data: null, error: "Need at least 2 numbers (1–99999)." };
    return { data: nums, error: null };
  }
  if (mode === "graph") {
    const parsed = parseLabGraphEdges(str);
    if (parsed.nodes === 0 || parsed.edges.length === 0)
      return { data: null, error: 'No valid edges. Use format: 0-1 1-2 2-3' };
    return { data: parsed, error: null };
  }
  if (mode === "grid") {
    const grid = parseGridInput(str);
    if (grid.length === 0) return { data: null, error: "Empty grid. Enter rows of 0s and 1s." };
    return { data: grid, error: null };
  }
  if (mode === "text") {
    if (str.trim().length === 0) return { data: null, error: "Input string is empty." };
    return { data: str, error: null };
  }
  return { data: str, error: null };
}

const DEFAULT_INPUTS: Record<VisMode, string> = {
  array: "5, 3, 8, 1, 9, 2, 7, 4, 6",
  graph: "0-1 1-2 2-3 3-4 4-0 0-3",
  grid: "0 0 1 0\n0 0 0 0\n1 0 0 1\n0 0 0 0",
  text: "hello world",
};

// ─── Inline visualizers ───────────────────────────────────────────────────────

const GRID_CELL_COLORS: Record<number, string> = {
  0: "bg-terminal-800 border-terminal-700",
  1: "bg-slate-600 border-slate-500",
  2: "bg-neon-blue/30 border-neon-blue/50",
  3: "bg-neon-green/40 border-neon-green/60",
  4: "bg-neon-cyan/50 border-neon-cyan",
  5: "bg-neon-amber/40 border-neon-amber/60",
  6: "bg-neon-red/40 border-neon-red/60",
};

function LabGridVisualizer({ step }: { step: LabStep }) {
  const grid = step.grid ?? [];
  if (grid.length === 0)
    return (
      <div className="flex items-center justify-center h-full text-slate-700 text-[11px] font-mono">
        No grid data
      </div>
    );
  const rows = grid.length;
  const cols = Math.max(...grid.map((r) => r.length), 1);
  const cellSize = Math.max(8, Math.min(36, Math.floor(Math.min(460 / cols, 340 / rows))));
  return (
    <div className="flex flex-col items-center justify-center h-full gap-2 p-3 overflow-auto">
      <div className="flex flex-col gap-0.5">
        {grid.map((row, r) => (
          <div key={r} className="flex gap-0.5">
            {row.map((cell, c) => (
              <div
                key={c}
                className={`rounded-sm border transition-all duration-100 ${
                  GRID_CELL_COLORS[cell] ?? GRID_CELL_COLORS[0]
                } ${cell === 4 ? "shadow-[0_0_6px_rgba(0,229,255,0.5)]" : ""}`}
                style={{ width: cellSize, height: cellSize }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex gap-3 flex-wrap justify-center">
        {([
          [5, "Start", "bg-neon-amber/40"],
          [6, "End", "bg-neon-red/40"],
          [4, "Current", "bg-neon-cyan/50"],
          [2, "Visited", "bg-neon-blue/30"],
          [3, "Path", "bg-neon-green/40"],
          [1, "Wall", "bg-slate-600"],
        ] as [number, string, string][]).map(([, label, color]) => (
          <div key={label} className="flex items-center gap-1">
            <div className={`w-2.5 h-2.5 rounded-sm ${color}`} />
            <span className="text-[9px] font-mono text-slate-600">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LabTextVisualizer({ step }: { step: LabStep }) {
  const text = step.text ?? "";
  const active = new Set(step.activeChars ?? []);
  const matched = new Set(step.matchedChars ?? []);
  return (
    <div className="flex flex-col h-full p-4 gap-4 justify-center items-center overflow-auto">
      <div className="flex flex-wrap gap-1 justify-center max-w-full">
        {Array.from(text).map((char, i) => {
          const isMatch = matched.has(i);
          const isActive = active.has(i);
          return (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <div
                className={`w-7 h-9 rounded flex items-center justify-center text-xs font-mono font-bold border transition-all duration-100 ${
                  isMatch
                    ? "bg-neon-green/25 border-neon-green/60 text-neon-green shadow-[0_0_6px_rgba(0,255,136,0.3)]"
                    : isActive
                      ? "bg-neon-cyan/20 border-neon-cyan/50 text-neon-cyan"
                      : char === " "
                        ? "bg-terminal-800/40 border-terminal-700/40 text-slate-700"
                        : "bg-terminal-800 border-terminal-700 text-slate-300"
                }`}
              >
                {char === " " ? "␣" : char}
              </div>
              <span className="text-[7px] font-mono text-slate-700">{i}</span>
            </div>
          );
        })}
      </div>
      <div className="flex gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded bg-neon-cyan/20 border border-neon-cyan/50" />
          <span className="text-[9px] font-mono text-slate-600">Checking</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded bg-neon-green/25 border border-neon-green/60" />
          <span className="text-[9px] font-mono text-slate-600">Matched</span>
        </div>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AlgorithmLab({ onBack }: Props) {
  const [visMode, setVisMode] = useState<VisMode>("array");
  const [lang, setLang] = useState<Lang>("javascript");
  const [code, setCode] = useState(getTemplate("array", "javascript"));
  const [testInputStr, setTestInputStr] = useState(DEFAULT_INPUTS["array"]);

  const [steps, setSteps] = useState<LabStep[]>([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(300);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [showHint, setShowHint] = useState(false);
  // labGraph is computed from the edge input string for graph-mode preview
  const [labGraph, setLabGraph] = useState<Graph>(() => buildLabGraph(DEFAULT_INPUTS["graph"]));

  const [previewWidth, setPreviewWidth] = useState(420);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepsRef = useRef(steps);
  stepsRef.current = steps;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(420);

  function handleDividerMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragStartWidth.current = previewWidth;

    function onMouseMove(ev: MouseEvent) {
      if (!isDragging.current) return;
      const delta = dragStartX.current - ev.clientX;
      setPreviewWidth(Math.max(260, Math.min(720, dragStartWidth.current + delta)));
    }

    function onMouseUp() {
      isDragging.current = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }

  const langMeta = LANGS[lang];
  const modeMeta = VIS_MODES[visMode];

  // Auto-play loop
  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setStepIdx((prev) => {
          if (prev >= stepsRef.current.length - 1) {
            setPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, speed]);

  const handleVisModeChange = useCallback(
    (m: VisMode) => {
      setVisMode(m);
      setCode(getTemplate(m, lang));
      setTestInputStr(DEFAULT_INPUTS[m]);
      setSteps([]);
      setStepIdx(0);
      setPlaying(false);
      setError(null);
      setStatusMsg("");
      if (m === "graph") setLabGraph(buildLabGraph(DEFAULT_INPUTS["graph"]));
    },
    [lang],
  );

  const handleLangChange = useCallback(
    (l: Lang) => {
      setLang(l);
      setCode(getTemplate(visMode, l));
      setSteps([]);
      setStepIdx(0);
      setPlaying(false);
      setError(null);
      setStatusMsg("");
    },
    [visMode],
  );

  const handleTabKey = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const el = e.currentTarget;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const newVal = el.value.substring(0, start) + "  " + el.value.substring(end);
        setCode(newVal);
        requestAnimationFrame(() => {
          el.selectionStart = el.selectionEnd = start + 2;
        });
      }
    },
    [],
  );

  async function handleRun() {
    const { data, error: parseError } = parseInputForMode(testInputStr, visMode);
    if (parseError || data === null) {
      setError(parseError ?? "Invalid input.");
      return;
    }

    // Rebuild labGraph from current edge string when running in graph mode
    if (visMode === "graph") setLabGraph(buildLabGraph(testInputStr));

    setRunning(true);
    setError(null);
    setSteps([]);
    setStepIdx(0);
    setPlaying(false);

    try {
      let result: LabStep[];
      if (lang === "python") {
        result = await runPython(code, data, setStatusMsg);
      } else if (lang === "typescript") {
        result = await runTS(code, data);
      } else if (lang === "javascript") {
        result = await runJS(code, data);
      } else {
        throw new Error(
          `${langMeta.label} cannot run directly in the browser. Use this pane as a reference/pseudocode editor.`,
        );
      }
      if (result.length === 0) throw new Error("generate() returned 0 steps.");
      setSteps(result);
      setStepIdx(0);
      setPlaying(true);
      setStatusMsg(
        `${result.length} steps generated${result.length >= MAX_STEPS ? ` (capped at ${MAX_STEPS})` : ""}`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatusMsg("");
    } finally {
      setRunning(false);
    }
  }

  const currentStep = steps[stepIdx] ?? steps[0];
  const allDone = steps.length > 0 && stepIdx >= steps.length - 1;
  // For array mode maxValue calculation
  const inputNums = visMode === "array" ? parseArrayInput(testInputStr) : [];
  const maxVal = Math.max(...(inputNums.length ? inputNums : [100]), 1);
  const graphParsed = visMode === "graph" ? parseLabGraphEdges(testInputStr) : null;
  const gridParsed = visMode === "grid" ? parseGridInput(testInputStr) : [];
  const inputCounter =
    visMode === "array"
      ? `${inputNums.length} values`
      : visMode === "graph"
        ? `${graphParsed?.nodes ?? 0} nodes, ${graphParsed?.edges.length ?? 0} edges`
        : visMode === "grid"
          ? `${gridParsed.length} rows`
          : `${testInputStr.length} chars`;

  return (
    <div className="flex flex-col h-full bg-terminal-950 overflow-hidden">
      {/* ── Top bar ── */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-neon-cyan/10 shrink-0 bg-terminal-900 flex-wrap">
        <button
          onClick={onBack}
          className="btn-terminal flex items-center gap-1.5 text-xs py-1.5 shrink-0"
        >
          <ChevronLeft size={13} />
          Back
        </button>

        <div className="flex items-center gap-2 ml-1">
          <FlaskConical size={15} className="text-neon-cyan" />
          <span className="font-display font-semibold text-white text-sm">
            Algorithm Lab
          </span>
          <span className="text-[9px] font-mono text-slate-600 bg-terminal-800 border border-neon-cyan/10 rounded px-1.5 py-0.5">
            EXPERIMENTAL
          </span>
        </div>

        {/* ── Vis-mode selector ── */}
        <div className="flex items-center gap-1 ml-3">
          <span className="text-[9px] font-mono text-slate-700 mr-1 uppercase tracking-widest">MODE</span>
          {(Object.keys(VIS_MODES) as VisMode[]).map((m) => {
            const vm = VIS_MODES[m];
            return (
              <button
                key={m}
                onClick={() => handleVisModeChange(m)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono font-semibold transition-all border ${
                  visMode === m
                    ? `${vm.accent} bg-terminal-800 border-neon-cyan/30`
                    : "text-slate-600 border-transparent hover:text-slate-400 hover:border-terminal-600"
                }`}
                title={vm.hint.split("\n")[0]}
              >
                {vm.icon}
                {vm.label}
              </button>
            );
          })}
        </div>

        {/* ── Language picker ── */}
        <div className="flex items-center gap-1 ml-3 flex-wrap">
          <span className="text-[9px] font-mono text-slate-700 mr-1 uppercase tracking-widest">LANG</span>
          {(Object.keys(LANGS) as Lang[]).map((l) => {
            const m = LANGS[l];
            return (
              <button
                key={l}
                onClick={() => handleLangChange(l)}
                className={`px-2.5 py-1 rounded text-[10px] font-mono font-semibold transition-all border ${
                  lang === l
                    ? `${m.accent} bg-terminal-800 border-neon-cyan/30`
                    : "text-slate-600 border-transparent hover:text-slate-400 hover:border-terminal-600"
                } ${!m.runnableInBrowser ? "opacity-60" : ""}`}
                title={m.runnableInBrowser ? m.label : `${m.label} — reference only`}
              >
                {m.badge}
                {!m.runnableInBrowser && <span className="ml-1 text-slate-700">†</span>}
              </button>
            );
          })}
        </div>

        {(langMeta.hint || modeMeta.hint) && (
          <button
            onClick={() => setShowHint((v) => !v)}
            className={`p-1.5 rounded transition-colors ml-1 ${showHint ? "text-neon-cyan bg-neon-cyan/10" : "text-slate-700 hover:text-slate-400"}`}
          >
            <Info size={13} />
          </button>
        )}

        <div className="ml-auto flex items-center gap-2 shrink-0">
          <span className="text-[9px] font-mono text-slate-700 hidden lg:block">
            ⚠ Code runs in your browser — do not paste untrusted scripts
          </span>
        </div>
      </div>

      {/* Hint banner */}
      {showHint && (
        <div className="mx-5 mt-2 px-4 py-2 bg-neon-cyan/5 border border-neon-cyan/15 rounded-md text-[11px] font-mono text-slate-500 flex items-start gap-2 shrink-0">
          <Info size={12} className="text-neon-cyan/50 shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <div className="text-neon-cyan/75">Mode contract</div>
            <pre className="whitespace-pre-wrap leading-relaxed text-slate-500">
              {modeMeta.hint}
            </pre>
            {langMeta.hint && (
              <p className="text-[10px] text-slate-600">{langMeta.hint}</p>
            )}
          </div>
        </div>
      )}

      {/* ── Main content: editor + preview ── */}
      <div className="flex flex-1 min-h-0 gap-0">
        {/* Left — Code editor */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Editor toolbar */}
          <div className="flex items-center gap-3 px-4 py-2 border-b border-neon-cyan/10 bg-terminal-900/50 shrink-0 flex-wrap">
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-700">
              <Code2 size={11} />
              <span className={modeMeta.accent}>{modeMeta.label}</span>
              <span className="text-slate-700">·</span>
              <span className={langMeta.accent}>{langMeta.label}</span>
              {!langMeta.runnableInBrowser && (
                <span className="text-neon-amber/50">— reference only</span>
              )}
            </div>

            {/* Test input */}
            <div className="flex items-center gap-2 ml-auto flex-wrap">
              <span className="text-[10px] font-mono text-slate-700 shrink-0">
                {modeMeta.inputLabel}
              </span>
              {modeMeta.multilineInput ? (
                <textarea
                  value={testInputStr}
                  onChange={(e) => setTestInputStr(e.target.value)}
                  placeholder={modeMeta.inputPlaceholder}
                  className="w-64 h-14 bg-terminal-800 border border-neon-cyan/15 rounded px-2.5 py-1.5 text-[11px] font-mono text-slate-200 placeholder-slate-700 focus:outline-none focus:border-neon-cyan/40 resize-none"
                />
              ) : (
                <input
                  value={testInputStr}
                  onChange={(e) => setTestInputStr(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRun()}
                  placeholder={modeMeta.inputPlaceholder}
                  className="w-56 bg-terminal-800 border border-neon-cyan/15 rounded px-2.5 py-1 text-[11px] font-mono text-slate-200 placeholder-slate-700 focus:outline-none focus:border-neon-cyan/40"
                />
              )}
              <span className="text-[9px] font-mono text-slate-700">
                {inputCounter}
              </span>

              <button
                onClick={handleRun}
                disabled={running || !langMeta.runnableInBrowser}
                className="btn-primary flex items-center gap-1.5 text-xs py-1.5 disabled:opacity-40"
              >
                {running ? (
                  <Loader size={12} className="animate-spin" />
                ) : (
                  <Play size={12} />
                )}
                {running ? "Running…" : "Run"}
              </button>
            </div>
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleTabKey}
            spellCheck={false}
            className="flex-1 min-h-0 w-full bg-terminal-950 px-5 py-4 text-[12px] font-mono text-slate-300 resize-none focus:outline-none leading-[1.7]"
            style={{ tabSize: 2 }}
          />

          {/* Status/error bar */}
          <div className="px-4 py-2 border-t border-neon-cyan/10 bg-terminal-900/40 shrink-0 min-h-[32px] flex items-center gap-2">
            {running && (
              <span className="text-[11px] font-mono text-neon-cyan/70 flex items-center gap-2">
                <Loader size={11} className="animate-spin" />
                {statusMsg || "Running…"}
              </span>
            )}
            {!running && error && (
              <span className="text-[11px] font-mono text-neon-red/80 flex items-center gap-2">
                <AlertCircle size={11} />
                {error}
              </span>
            )}
            {!running && !error && steps.length > 0 && (
              <span className="text-[11px] font-mono text-neon-green/70 flex items-center gap-2">
                <CheckCircle size={11} />
                {statusMsg}
              </span>
            )}
            {!running && !error && steps.length === 0 && (
              <span className="text-[11px] font-mono text-slate-700">
                {langMeta.runnableInBrowser
                  ? "Press Run to execute"
                  : "Reference editor — select JS/TS/Python to run"}
              </span>
            )}
          </div>
        </div>

        {/* Drag divider */}
        <div
          onMouseDown={handleDividerMouseDown}
          className="w-2 shrink-0 cursor-col-resize border-l border-r border-neon-cyan/10 hover:border-neon-cyan/30 flex items-center justify-center transition-colors group select-none"
        >
          <GripVertical
            size={12}
            className="text-neon-cyan/20 group-hover:text-neon-cyan/50 pointer-events-none"
          />
        </div>

        {/* Right — Preview */}
        <div
          className="shrink-0 flex flex-col bg-terminal-900/30"
          style={{ width: previewWidth }}
        >
          {/* Visualizer area */}
          <div className="flex-1 min-h-0 relative">
            {steps.length > 0 && currentStep ? (
              visMode === "array" ? (
                <ArrayVisualizer step={currentStep} maxValue={maxVal} />
              ) : visMode === "graph" ? (
                <GraphVisualizer
                  step={currentStep}
                  graph={labGraph}
                />
              ) : visMode === "grid" ? (
                <LabGridVisualizer step={currentStep} />
              ) : (
                <LabTextVisualizer step={currentStep} />
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-700">
                <FlaskConical size={28} className="opacity-30" />
                <span className="text-[11px] font-mono">
                  {langMeta.runnableInBrowser
                    ? "Run your algorithm to preview"
                    : "Select JS / TS / Python to run"}
                </span>
              </div>
            )}
          </div>

          {/* Step message */}
          {currentStep && (
            <div className="px-4 py-2 border-t border-neon-cyan/10 bg-terminal-900/60 shrink-0">
              <p className="text-[11px] font-mono text-slate-500 truncate">
                <span className="text-neon-cyan/30 mr-1">&gt;</span>
                {currentStep.message ?? "—"}
              </p>
            </div>
          )}

          {/* Playback controls */}
          <div className="px-4 py-3 border-t border-neon-cyan/10 bg-terminal-900/80 shrink-0 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 justify-center">
              <button
                onClick={() => {
                  setStepIdx(0);
                  setPlaying(false);
                }}
                className="btn-terminal p-2"
                title="Start"
              >
                <SkipBack size={13} />
              </button>
              <button
                onClick={() => setStepIdx((p) => Math.max(0, p - 1))}
                className="btn-terminal p-2"
                title="Step back"
              >
                <RotateCcw size={12} />
              </button>
              <button
                onClick={() => {
                  if (steps.length === 0) return;
                  if (allDone) {
                    setStepIdx(0);
                    setPlaying(true);
                  } else setPlaying((p) => !p);
                }}
                disabled={steps.length === 0}
                className="btn-primary flex items-center gap-2 min-w-[90px] justify-center text-xs disabled:opacity-30"
              >
                {playing ? <Pause size={13} /> : <Play size={13} />}
                {playing ? "Pause" : allDone ? "Replay" : "Play"}
              </button>
              <button
                onClick={() =>
                  setStepIdx((p) => Math.min(steps.length - 1, p + 1))
                }
                disabled={allDone || steps.length === 0}
                className="btn-terminal p-2 disabled:opacity-30"
                title="Step forward"
              >
                <SkipForward size={13} />
              </button>
              <button
                onClick={() => {
                  setStepIdx(steps.length - 1);
                  setPlaying(false);
                }}
                disabled={steps.length === 0}
                className="btn-terminal p-2 disabled:opacity-30"
                title="End"
              >
                <SkipForward size={13} />
              </button>
            </div>

            {/* Step counter + speed */}
            <div className="flex items-center justify-between gap-3 px-1">
              <span className="text-[10px] font-mono text-slate-700">
                {steps.length > 0
                  ? `${stepIdx + 1} / ${steps.length}`
                  : "— / —"}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-slate-700">
                  SPEED
                </span>
                <input
                  type="range"
                  min={30}
                  max={1000}
                  step={30}
                  value={1030 - speed}
                  onChange={(e) => setSpeed(1030 - Number(e.target.value))}
                  className="w-24 accent-[#00e5ff]"
                />
              </div>
            </div>

            {/* Current step data summary */}
            {currentStep && (
              <div className="rounded-md bg-terminal-950/60 border border-neon-cyan/8 px-3 py-2 space-y-1">
                {visMode === "array" && (
                  <>
                    <div className="flex gap-2">
                      <span className="text-[9px] font-mono text-slate-700 w-16 shrink-0 uppercase tracking-widest pt-0.5">
                        State
                      </span>
                      <p className="text-[10px] font-mono text-neon-cyan/60 leading-relaxed break-words flex-1">
                        [{(currentStep.array ?? []).join(", ")}]
                      </p>
                    </div>
                    {(currentStep.comparingIndices ?? []).length > 0 && (
                      <div className="flex gap-2">
                        <span className="text-[9px] font-mono text-neon-cyan/40 w-16 shrink-0 uppercase tracking-widest">
                          Cmp
                        </span>
                        <span className="text-[10px] font-mono text-neon-cyan/60">
                          {(currentStep.comparingIndices ?? [])
                            .map((i) => `[${i}]`)
                            .join(", ")}
                        </span>
                      </div>
                    )}
                    {(currentStep.swappedIndices ?? []).length > 0 && (
                      <div className="flex gap-2">
                        <span className="text-[9px] font-mono text-neon-red/40 w-16 shrink-0 uppercase tracking-widest">
                          Swap
                        </span>
                        <span className="text-[10px] font-mono text-neon-red/60">
                          {(currentStep.swappedIndices ?? [])
                            .map((i) => `[${i}]`)
                            .join(", ")}
                        </span>
                      </div>
                    )}
                  </>
                )}

                {visMode === "graph" && (
                  <>
                    <div className="flex gap-2">
                      <span className="text-[9px] font-mono text-slate-700 w-16 shrink-0 uppercase tracking-widest">
                        Node
                      </span>
                      <span className="text-[10px] font-mono text-neon-cyan/60">
                        {currentStep.currentNode ?? "-"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-[9px] font-mono text-slate-700 w-16 shrink-0 uppercase tracking-widest">
                        Seen
                      </span>
                      <span className="text-[10px] font-mono text-neon-blue/70">
                        [{(currentStep.visitedNodes ?? []).join(", ")}]
                      </span>
                    </div>
                    {(currentStep.queueOrStack ?? []).length > 0 && (
                      <div className="flex gap-2">
                        <span className="text-[9px] font-mono text-slate-700 w-16 shrink-0 uppercase tracking-widest">
                          Queue
                        </span>
                        <span className="text-[10px] font-mono text-neon-amber/70">
                          [{(currentStep.queueOrStack ?? []).join(", ")}]
                        </span>
                      </div>
                    )}
                  </>
                )}

                {visMode === "grid" && (
                  <div className="flex gap-2">
                    <span className="text-[9px] font-mono text-slate-700 w-16 shrink-0 uppercase tracking-widest">
                      Grid
                    </span>
                    <span className="text-[10px] font-mono text-neon-green/70">
                      {(currentStep.grid ?? []).length} x {(currentStep.grid ?? [])[0]?.length ?? 0}
                    </span>
                  </div>
                )}

                {visMode === "text" && (
                  <>
                    <div className="flex gap-2">
                      <span className="text-[9px] font-mono text-slate-700 w-16 shrink-0 uppercase tracking-widest">
                        Text
                      </span>
                      <span className="text-[10px] font-mono text-neon-pink/70 break-words">
                        {currentStep.text ?? ""}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-[9px] font-mono text-slate-700 w-16 shrink-0 uppercase tracking-widest">
                        Active
                      </span>
                      <span className="text-[10px] font-mono text-neon-cyan/70">
                        [{(currentStep.activeChars ?? []).join(", ")}]
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
