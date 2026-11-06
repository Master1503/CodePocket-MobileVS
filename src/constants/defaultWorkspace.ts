/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FileItem } from '../types/vscode.ts';

export const INITIAL_WORKSPACE: FileItem[] = [
  {
    id: 'f-readme',
    name: 'README.md',
    path: '/README.md',
    language: 'markdown',
    content: `# CodePocket - Visual Studio Code for Mobile

Welcome to **CodePocket**, the desktop-class IDE re-engineered for mobile touchscreens, tablets, and external keyboards!

## 🚀 Key Features

- **Multi-Language Syntax Highlighting**: JavaScript, TypeScript, Python, HTML/CSS, Rust, Go, C++, SQL, JSON, and Markdown.
- **Interactive Debugger**: Set breakpoints by tapping the line number in the gutter. Step Over (\`F10\`), Step Into (\`F11\`), Step Out, inspect Local Variables, watch custom expressions, and evaluate REPL code in the Debug Console.
- **Git Source Control**: Full diff viewer (side-by-side or inline), staged/unstaged changes, commit history, branch switcher, and cloud push/pull sync.
- **Terminal Emulator**: Multi-tab bash terminal with real command execution (\`ls\`, \`cat\`, \`node\`, \`python\`, \`git\`, \`npm\`, \`clear\`).
- **Touch-Optimized Accessory Bar**: Quick keyboard row with brackets, operators, indentation, undo/redo, and arrows above your virtual keyboard.
- **Live HTML/JS Runner**: Live preview your web apps in a tab right inside the editor!
- **Extensions Marketplace**: Install themes (One Dark, Dracula, Tokyo Night, Monokai), linters, formatters, and Vim keybindings.
- **Cloud Sync**: Pair and sync across your phone, tablet, and desktop with real-time sync codes or JSON snapshots.

## ⌨️ Desktop Shortcuts Supported
- \`Ctrl / Cmd + P\` : Quick Open File
- \`Ctrl / Cmd + Shift + P\` : Command Palette
- \`Ctrl / Cmd + B\` : Toggle Primary Sidebar
- \`Ctrl / Cmd + \`\` : Toggle Terminal Dock
- \`Ctrl / Cmd + S\` : Save File
- \`F5\` : Start / Continue Debugging
- \`F10\` : Step Over
- \`Ctrl / Cmd + /\` : Toggle Comment
`,
    originalContent: `# CodePocket - Visual Studio Code for Mobile

Welcome to **CodePocket**, the desktop-class IDE re-engineered for mobile touchscreens, tablets, and external keyboards!

## 🚀 Key Features

- **Multi-Language Syntax Highlighting**: JavaScript, TypeScript, Python, HTML/CSS, Rust, Go, C++, SQL, JSON, and Markdown.
- **Interactive Debugger**: Set breakpoints by tapping the line number in the gutter. Step Over (\`F10\`), Step Into (\`F11\`), Step Out, inspect Local Variables, watch custom expressions, and evaluate REPL code in the Debug Console.
- **Git Source Control**: Full diff viewer (side-by-side or inline), staged/unstaged changes, commit history, branch switcher, and cloud push/pull sync.
- **Terminal Emulator**: Multi-tab bash terminal with real command execution (\`ls\`, \`cat\`, \`node\`, \`python\`, \`git\`, \`npm\`, \`clear\`).
- **Touch-Optimized Accessory Bar**: Quick keyboard row with brackets, operators, indentation, undo/redo, and arrows above your virtual keyboard.
- **Live HTML/JS Runner**: Live preview your web apps in a tab right inside the editor!
- **Extensions Marketplace**: Install themes (One Dark, Dracula, Tokyo Night, Monokai), linters, formatters, and Vim keybindings.
- **Cloud Sync**: Pair and sync across your phone, tablet, and desktop with real-time sync codes or JSON snapshots.

## ⌨️ Desktop Shortcuts Supported
- \`Ctrl / Cmd + P\` : Quick Open File
- \`Ctrl / Cmd + Shift + P\` : Command Palette
- \`Ctrl / Cmd + B\` : Toggle Primary Sidebar
- \`Ctrl / Cmd + \`\` : Toggle Terminal Dock
- \`Ctrl / Cmd + S\` : Save File
- \`F5\` : Start / Continue Debugging
- \`F10\` : Step Over
- \`Ctrl / Cmd + /\` : Toggle Comment
`,
    isModified: false,
  },
  {
    id: 'f-index-html',
    name: 'index.html',
    path: '/index.html',
    language: 'html',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Mobile Web Preview</title>
  <link rel="stylesheet" href="styles/app.css" />
</head>
<body>
  <div class="card">
    <div class="badge">Live Preview</div>
    <h1>Touch-First Mobile IDE</h1>
    <p>This page runs live inside CodePocket! Tap below to interact:</p>
    
    <div class="counter-box">
      <span id="counter-value">0</span>
      <div class="btn-group">
        <button id="dec-btn" class="btn secondary">-1</button>
        <button id="inc-btn" class="btn primary">+1</button>
        <button id="reset-btn" class="btn outline">Reset</button>
      </div>
    </div>
  </div>

  <script>
    let count = 0;
    const valueEl = document.getElementById('counter-value');
    document.getElementById('inc-btn').addEventListener('click', () => {
      count++;
      valueEl.innerText = count;
    });
    document.getElementById('dec-btn').addEventListener('click', () => {
      count--;
      valueEl.innerText = count;
    });
    document.getElementById('reset-btn').addEventListener('click', () => {
      count = 0;
      valueEl.innerText = count;
    });
  </script>
</body>
</html>`,
    originalContent: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Mobile Web Preview</title>
  <link rel="stylesheet" href="styles/app.css" />
</head>
<body>
  <div class="card">
    <div class="badge">Live Preview</div>
    <h1>Touch-First Mobile IDE</h1>
    <p>This page runs live inside CodePocket! Tap below to interact:</p>
    
    <div class="counter-box">
      <span id="counter-value">0</span>
      <div class="btn-group">
        <button id="dec-btn" class="btn secondary">-1</button>
        <button id="inc-btn" class="btn primary">+1</button>
        <button id="reset-btn" class="btn outline">Reset</button>
      </div>
    </div>
  </div>

  <script>
    let count = 0;
    const valueEl = document.getElementById('counter-value');
    document.getElementById('inc-btn').addEventListener('click', () => {
      count++;
      valueEl.innerText = count;
    });
    document.getElementById('dec-btn').addEventListener('click', () => {
      count--;
      valueEl.innerText = count;
    });
    document.getElementById('reset-btn').addEventListener('click', () => {
      count = 0;
      valueEl.innerText = count;
    });
  </script>
</body>
</html>`,
    isModified: false,
  },
  {
    id: 'folder-src',
    name: 'src',
    path: '/src',
    language: 'plaintext',
    content: '',
    isFolder: true,
    children: [
      {
        id: 'f-game-engine',
        name: 'gameEngine.js',
        path: '/src/gameEngine.js',
        language: 'javascript',
        content: `/**
 * Interactive Game Engine Demo
 * Perfect for testing the interactive Debugger (Breakpoints & Step Execution)!
 */

function calculateScore(level, enemiesDefeated, bonuses) {
  let baseScore = level * 100;
  let combatMultiplier = 1.5;
  
  // Set a breakpoint here on line 10 to inspect variables!
  let combatScore = enemiesDefeated * 50 * combatMultiplier;
  let bonusTotal = 0;

  for (let i = 0; i < bonuses.length; i++) {
    bonusTotal += bonuses[i];
  }

  const finalScore = baseScore + combatScore + bonusTotal;
  console.log(\`Level \${level} Complete! Total: \${finalScore}\`);
  return finalScore;
}

function runSimulation() {
  console.log("=== Starting Simulation ===");
  const activeLevel = 3;
  const defeated = 8;
  const powerUps = [100, 250, 50];

  const result = calculateScore(activeLevel, defeated, powerUps);
  console.log("Simulation finished. High score saved: " + result);
  return result;
}

// Execute simulation
runSimulation();
`,
        originalContent: `/**
 * Interactive Game Engine Demo
 * Perfect for testing the interactive Debugger (Breakpoints & Step Execution)!
 */

function calculateScore(level, enemiesDefeated, bonuses) {
  let baseScore = level * 100;
  let combatMultiplier = 1.5;
  
  // Set a breakpoint here on line 10 to inspect variables!
  let combatScore = enemiesDefeated * 50 * combatMultiplier;
  let bonusTotal = 0;

  for (let i = 0; i < bonuses.length; i++) {
    bonusTotal += bonuses[i];
  }

  const finalScore = baseScore + combatScore + bonusTotal;
  console.log(\`Level \${level} Complete! Total: \${finalScore}\`);
  return finalScore;
}

function runSimulation() {
  console.log("=== Starting Simulation ===");
  const activeLevel = 3;
  const defeated = 8;
  const powerUps = [100, 250, 50];

  const result = calculateScore(activeLevel, defeated, powerUps);
  console.log("Simulation finished. High score saved: " + result);
  return result;
}

// Execute simulation
runSimulation();
`,
        isModified: false,
      },
      {
        id: 'f-math-tools',
        name: 'math_tools.py',
        path: '/src/math_tools.py',
        language: 'python',
        content: `"""
Python Mathematical Utilities
Run with 'python src/math_tools.py' in the integrated Terminal!
"""

def fibonacci_sequence(n):
    """Generate the first n Fibonacci numbers."""
    if n <= 0:
        return []
    sequence = [0, 1]
    while len(sequence) < n:
        next_val = sequence[-1] + sequence[-2]
        sequence.append(next_val)
    return sequence[:n]

def is_prime(num):
    """Check if a number is prime."""
    if num < 2:
        return False
    for i in range(2, int(num ** 0.5) + 1):
        if num % i == 0:
            return False
    return True

if __name__ == "__main__":
    print("--- Fibonacci (first 10 numbers) ---")
    fibs = fibonacci_sequence(10)
    print("Result:", fibs)
    
    print("\\n--- Prime Check (1 to 25) ---")
    primes = [x for x in range(1, 26) if is_prime(x)]
    print("Primes found:", primes)
`,
        originalContent: `"""
Python Mathematical Utilities
Run with 'python src/math_tools.py' in the integrated Terminal!
"""

def fibonacci_sequence(n):
    """Generate the first n Fibonacci numbers."""
    if n <= 0:
        return []
    sequence = [0, 1]
    while len(sequence) < n:
        next_val = sequence[-1] + sequence[-2]
        sequence.append(next_val)
    return sequence[:n]

def is_prime(num):
    """Check if a number is prime."""
    if num < 2:
        return False
    for i in range(2, int(num ** 0.5) + 1):
        if num % i == 0:
            return False
    return True

if __name__ == "__main__":
    print("--- Fibonacci (first 10 numbers) ---")
    fibs = fibonacci_sequence(10)
    print("Result:", fibs)
    
    print("\\n--- Prime Check (1 to 25) ---")
    primes = [x for x in range(1, 26) if is_prime(x)]
    print("Primes found:", primes)
`,
        isModified: false,
      },
      {
        id: 'f-types',
        name: 'types.ts',
        path: '/src/types.ts',
        language: 'typescript',
        content: `export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: 'developer' | 'architect' | 'reviewer';
  preferences: {
    theme: string;
    touchAssistance: boolean;
    autoSaveIntervalMs: number;
  };
}

export type ApiResponse<T> = {
  status: 'success' | 'error';
  data?: T;
  errorMessage?: string;
  timestamp: number;
};

export async function fetchUser(userId: string): Promise<ApiResponse<UserProfile>> {
  return {
    status: 'success',
    data: {
      id: userId,
      username: 'mobile_coder',
      email: 'coder@pocketcode.dev',
      role: 'developer',
      preferences: {
        theme: 'One Dark Pro',
        touchAssistance: true,
        autoSaveIntervalMs: 5000,
      },
    },
    timestamp: Date.now(),
  };
}
`,
        originalContent: `export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: 'developer' | 'architect' | 'reviewer';
  preferences: {
    theme: string;
    touchAssistance: boolean;
    autoSaveIntervalMs: number;
  };
}

export type ApiResponse<T> = {
  status: 'success' | 'error';
  data?: T;
  errorMessage?: string;
  timestamp: number;
};

export async function fetchUser(userId: string): Promise<ApiResponse<UserProfile>> {
  return {
    status: 'success',
    data: {
      id: userId,
      username: 'mobile_coder',
      email: 'coder@pocketcode.dev',
      role: 'developer',
      preferences: {
        theme: 'One Dark Pro',
        touchAssistance: true,
        autoSaveIntervalMs: 5000,
      },
    },
    timestamp: Date.now(),
  };
}
`,
        isModified: false,
      },
      {
        id: 'f-rust',
        name: 'main.rs',
        path: '/src/main.rs',
        language: 'rust',
        content: `// Rust High-Performance Module
fn main() {
    println!("Hello from Rust on mobile!");
    
    let numbers: Vec<i32> = (1..=10).collect();
    let squares: Vec<i32> = numbers.iter().map(|&x| x * x).collect();
    
    println!("Vector squares: {:?}", squares);
}
`,
        originalContent: `// Rust High-Performance Module
fn main() {
    println!("Hello from Rust on mobile!");
    
    let numbers: Vec<i32> = (1..=10).collect();
    let squares: Vec<i32> = numbers.iter().map(|&x| x * x).collect();
    
    println!("Vector squares: {:?}", squares);
}
`,
        isModified: false,
      },
      {
        id: 'f-cpp',
        name: 'algorithm.cpp',
        path: '/src/algorithm.cpp',
        language: 'cpp',
        content: `#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> data = {42, 17, 89, 5, 23};
    std::sort(data.begin(), data.end());

    std::cout << "Sorted elements: ";
    for (int n : data) {
        std::cout << n << " ";
    }
    std::cout << std::endl;
    return 0;
}
`,
        originalContent: `#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> data = {42, 17, 89, 5, 23};
    std::sort(data.begin(), data.end());

    std::cout << "Sorted elements: ";
    for (int n : data) {
        std::cout << n << " ";
    }
    std::cout << std::endl;
    return 0;
}
`,
        isModified: false,
      },
    ],
  },
  {
    id: 'folder-styles',
    name: 'styles',
    path: '/styles',
    language: 'plaintext',
    content: '',
    isFolder: true,
    children: [
      {
        id: 'f-app-css',
        name: 'app.css',
        path: '/styles/app.css',
        language: 'css',
        content: `body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #0f172a;
  color: #f8fafc;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
  padding: 1rem;
}

.card {
  background: #1e293b;
  border-radius: 16px;
  padding: 24px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
  text-align: center;
  border: 1px solid #334155;
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 9999px;
  background: #0284c7;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 12px;
}

.counter-box {
  margin-top: 24px;
  background: #0f172a;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #334155;
}

#counter-value {
  font-size: 48px;
  font-weight: 700;
  color: #38bdf8;
  display: block;
  margin-bottom: 16px;
}

.btn-group {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.btn {
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn.primary { background: #0ea5e9; color: white; }
.btn.secondary { background: #475569; color: white; }
.btn.outline { background: transparent; border: 1px solid #64748b; color: #94a3b8; }
`,
        originalContent: `body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #0f172a;
  color: #f8fafc;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
  padding: 1rem;
}

.card {
  background: #1e293b;
  border-radius: 16px;
  padding: 24px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
  text-align: center;
  border: 1px solid #334155;
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 9999px;
  background: #0284c7;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 12px;
}

.counter-box {
  margin-top: 24px;
  background: #0f172a;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #334155;
}

#counter-value {
  font-size: 48px;
  font-weight: 700;
  color: #38bdf8;
  display: block;
  margin-bottom: 16px;
}

.btn-group {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.btn {
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn.primary { background: #0ea5e9; color: white; }
.btn.secondary { background: #475569; color: white; }
.btn.outline { background: transparent; border: 1px solid #64748b; color: #94a3b8; }
`,
        isModified: false,
      },
    ],
  },
  {
    id: 'folder-db',
    name: 'database',
    path: '/database',
    language: 'plaintext',
    content: '',
    isFolder: true,
    children: [
      {
        id: 'f-query-sql',
        name: 'schema.sql',
        path: '/database/schema.sql',
        language: 'sql',
        content: `-- Database Schema Definition
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  is_synced BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Query active projects
SELECT u.username, p.title, p.updated_at
FROM users u
INNER JOIN projects p ON u.id = p.user_id
WHERE p.is_synced = true
ORDER BY p.updated_at DESC;
`,
        originalContent: `-- Database Schema Definition
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  is_synced BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Query active projects
SELECT u.username, p.title, p.updated_at
FROM users u
INNER JOIN projects p ON u.id = p.user_id
WHERE p.is_synced = true
ORDER BY p.updated_at DESC;
`,
        isModified: false,
      },
    ],
  },
  {
    id: 'f-config-json',
    name: 'config.json',
    path: '/config.json',
    language: 'json',
    content: `{
  "appName": "CodePocket",
  "version": "1.0.0",
  "environment": "production",
  "editor": {
    "tabSize": 2,
    "wordWrap": true,
    "minimap": true,
    "fontSize": 14,
    "theme": "one-dark-pro"
  },
  "git": {
    "autoFetch": true,
    "defaultBranch": "main",
    "cloudSync": true
  }
}
`,
    originalContent: `{
  "appName": "CodePocket",
  "version": "1.0.0",
  "environment": "production",
  "editor": {
    "tabSize": 2,
    "wordWrap": true,
    "minimap": true,
    "fontSize": 14,
    "theme": "one-dark-pro"
  },
  "git": {
    "autoFetch": true,
    "defaultBranch": "main",
    "cloudSync": true
  }
}
`,
    isModified: false,
  },
];

export const INITIAL_GIT_COMMITS = [
  {
    id: 'c-1',
    hash: 'a38f901bce471829d2b7',
    shortHash: 'a38f901',
    message: 'feat: initialize CodePocket mobile IDE workspace with multi-language support',
    author: 'Shane Ash <shaneash15@gmail.com>',
    timestamp: '1 hour ago',
    branch: 'main',
    filesChanged: 7,
  },
  {
    id: 'c-2',
    hash: '6fe31289dcbb01940ac3',
    shortHash: '6fe3128',
    message: 'feat(debugger): integrate interactive breakpoints & variable scopes',
    author: 'Shane Ash <shaneash15@gmail.com>',
    timestamp: '35 minutes ago',
    branch: 'main',
    filesChanged: 3,
  },
];
