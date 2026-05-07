# AlgoVis — Algorithm Simulation Visualizer

An interactive algorithm visualization engine built with React, TypeScript, and Tailwind CSS. Step through execution frame by frame, analyze time/space complexity, compare algorithms side by side, and experiment with your own algorithms in the built-in lab.

## 🔗 Live Demo

> **Live demo URL here:** (https://algorithm-simulation-visualizer-devmindtan.vercel.app)

---

## Features

### Algorithm Library

- **Sorting** — Bubble Sort, Merge Sort, Quick Sort, Heap Sort, Insertion Sort, Selection Sort, and more
- **Searching** — Linear Search, Binary Search
- **Graph** — BFS (Breadth-First Search), DFS (Depth-First Search)

### Visualization

- Animated bar chart for array-based algorithms
- Graph node/edge traversal visualization
- Color-coded state: comparing (cyan), swapping (red), sorted (green), active (blue), pivot (amber)
- Step-by-step playback with speed control
- IO panel showing current input array and algorithm output message

### Compare Mode

- Select up to 4 algorithms in the same category and run them side by side
- Synchronized playback for direct visual comparison

### Algorithm Lab

- Full-page coding environment — write a `generate(data)` function and watch it visualize in real time
- **Runnable languages:** JavaScript, TypeScript, Python (via Pyodide/WASM)
- **Reference editors:** Java, Go, Rust, C++ (pseudocode/planning — not executable in browser)
- Resizable preview panel (drag the divider)
- Auto-play on successful run, up to 5 000 steps
- Accepts up to 1 000 input values

---

## Tech Stack

| Layer          | Technology                            |
| -------------- | ------------------------------------- |
| Framework      | React 18 + TypeScript 5               |
| Build tool     | Vite 4                                |
| Styling        | Tailwind CSS 3 (custom design tokens) |
| Icons          | Lucide React                          |
| Python runtime | Pyodide v0.26.1 (WebAssembly)         |
| Fonts          | Space Grotesk · JetBrains Mono        |

---

## Getting Started

### Prerequisites

- Node.js ≥ 18

### Install & run

```bash
git clone https://github.com/your-username/algorithm-simulation-visualizer.git
cd algorithm-simulation-visualizer
npm install
npm run dev
```

Open [http://localhost:5175](http://localhost:5175) in your browser.

### Build for production

```bash
npm run build       # outputs to dist/
npm run preview     # preview the production build locally
```

### Type check

```bash
npm run typecheck
```

---

## Project Structure

```
src/
├── algorithms/        # Algorithm implementations (sorting, searching, graph)
├── components/
│   ├── AlgorithmDetail.tsx    # Main detail view with visualizer + IO panel
│   ├── AlgorithmLab.tsx       # Full-page coding lab
│   ├── ArrayVisualizer.tsx    # Bar chart visualizer
│   ├── CompareModal.tsx       # Algorithm comparison picker
│   ├── CompareView.tsx        # Side-by-side comparison layout
│   ├── ComplexityBadge.tsx    # O(n) badge component
│   ├── GraphVisualizer.tsx    # Graph traversal visualizer
│   └── Sidebar.tsx            # Left navigation
├── data/
│   └── visualizerData.ts      # Shared constants & helpers
├── types/
│   └── index.ts               # Shared TypeScript types
├── App.tsx
└── main.tsx
```

---

## Algorithm Lab — Quick Start

In the Lab, define a `generate(data)` function that returns an array of step objects:

```js
// JavaScript example
function generate(data) {
  const steps = [];
  const a = [...data];

  for (let i = 0; i < a.length - 1; i++) {
    for (let j = 0; j < a.length - i - 1; j++) {
      steps.push({
        array: [...a],
        comparingIndices: [j, j + 1],
        message: `Comparing ${a[j]} and ${a[j + 1]}`,
      });
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        steps.push({ array: [...a], swappedIndices: [j, j + 1] });
      }
    }
  }

  steps.push({
    array: [...a],
    sortedIndices: a.map((_, k) => k),
    message: "Done!",
  });
  return steps;
}
```

### Step object shape

| Field              | Type       | Description                            |
| ------------------ | ---------- | -------------------------------------- |
| `array`            | `number[]` | Current array state **(required)**     |
| `message`          | `string`   | Status text shown below the visualizer |
| `activeIndices`    | `number[]` | Blue bars                              |
| `sortedIndices`    | `number[]` | Green bars                             |
| `swappedIndices`   | `number[]` | Red bars                               |
| `comparingIndices` | `number[]` | Cyan bars                              |
| `pivot`            | `number`   | Index of pivot bar (amber)             |

> For Python, use `snake_case` keys (`comparing_indices`, `sorted_indices`, etc.) — both conventions are accepted.

---

## License

MIT
