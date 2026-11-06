/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Breakpoint, DebugFrame, DebugVariable, DebugWatch, DebugStatus } from '../types/vscode.ts';

export interface DebugState {
  status: DebugStatus;
  activeFileId: string | null;
  activeLineNumber: number | null;
  currentStepIndex: number;
  frames: DebugFrame[];
  variables: DebugVariable[];
  watches: DebugWatch[];
  logs: string[];
}

export interface ExecutableStep {
  fileId: string;
  fileName: string;
  lineNumber: number;
  functionName: string;
  scopeVariables: Record<string, any>;
  logOutput?: string;
}

export function createDebugSimulation(fileId: string, fileName: string, code: string): ExecutableStep[] {
  // If it's the gameEngine.js file or general JS, build a realistic execution trace
  const lines = code.split('\n');
  const steps: ExecutableStep[] = [];

  if (fileId === 'f-game-engine' || fileName.includes('gameEngine')) {
    // Realistic execution flow for gameEngine.js:
    // Line 21: runSimulation()
    steps.push({
      fileId,
      fileName,
      lineNumber: 22,
      functionName: 'runSimulation',
      scopeVariables: {
        activeLevel: 'undefined',
        defeated: 'undefined',
        powerUps: 'undefined',
      },
      logOutput: '=== Starting Simulation ===',
    });

    steps.push({
      fileId,
      fileName,
      lineNumber: 23,
      functionName: 'runSimulation',
      scopeVariables: {
        activeLevel: 3,
        defeated: 'undefined',
        powerUps: 'undefined',
      },
    });

    steps.push({
      fileId,
      fileName,
      lineNumber: 24,
      functionName: 'runSimulation',
      scopeVariables: {
        activeLevel: 3,
        defeated: 8,
        powerUps: 'undefined',
      },
    });

    steps.push({
      fileId,
      fileName,
      lineNumber: 25,
      functionName: 'runSimulation',
      scopeVariables: {
        activeLevel: 3,
        defeated: 8,
        powerUps: [100, 250, 50],
      },
    });

    // Step into calculateScore
    steps.push({
      fileId,
      fileName,
      lineNumber: 7,
      functionName: 'calculateScore',
      scopeVariables: {
        level: 3,
        enemiesDefeated: 8,
        bonuses: [100, 250, 50],
        baseScore: 'undefined',
      },
    });

    steps.push({
      fileId,
      fileName,
      lineNumber: 8,
      functionName: 'calculateScore',
      scopeVariables: {
        level: 3,
        enemiesDefeated: 8,
        bonuses: [100, 250, 50],
        baseScore: 300,
        combatMultiplier: 'undefined',
      },
    });

    steps.push({
      fileId,
      fileName,
      lineNumber: 11,
      functionName: 'calculateScore',
      scopeVariables: {
        level: 3,
        enemiesDefeated: 8,
        bonuses: [100, 250, 50],
        baseScore: 300,
        combatMultiplier: 1.5,
        combatScore: 600,
        bonusTotal: 0,
      },
    });

    // Loop through bonuses
    steps.push({
      fileId,
      fileName,
      lineNumber: 14,
      functionName: 'calculateScore (loop i=0)',
      scopeVariables: {
        i: 0,
        bonusTotal: 100,
        combatScore: 600,
        baseScore: 300,
      },
    });

    steps.push({
      fileId,
      fileName,
      lineNumber: 14,
      functionName: 'calculateScore (loop i=1)',
      scopeVariables: {
        i: 1,
        bonusTotal: 350,
        combatScore: 600,
        baseScore: 300,
      },
    });

    steps.push({
      fileId,
      fileName,
      lineNumber: 14,
      functionName: 'calculateScore (loop i=2)',
      scopeVariables: {
        i: 2,
        bonusTotal: 400,
        combatScore: 600,
        baseScore: 300,
      },
    });

    steps.push({
      fileId,
      fileName,
      lineNumber: 17,
      functionName: 'calculateScore',
      scopeVariables: {
        baseScore: 300,
        combatScore: 600,
        bonusTotal: 400,
        finalScore: 1300,
      },
      logOutput: 'Level 3 Complete! Total: 1300',
    });

    steps.push({
      fileId,
      fileName,
      lineNumber: 28,
      functionName: 'runSimulation',
      scopeVariables: {
        result: 1300,
      },
      logOutput: 'Simulation finished. High score saved: 1300',
    });
  } else {
    // Dynamic generator for any other file!
    let lineIdx = 0;
    const mockVars: Record<string, any> = { runtime: 'V8-Mobile', iteration: 1 };
    for (const rawLine of lines) {
      lineIdx++;
      const trimmed = rawLine.trim();
      if (
        trimmed &&
        !trimmed.startsWith('//') &&
        !trimmed.startsWith('/*') &&
        !trimmed.startsWith('*') &&
        !trimmed.startsWith('#') &&
        !trimmed.startsWith('<!--') &&
        trimmed !== '{' &&
        trimmed !== '}'
      ) {
        if (trimmed.includes('=')) {
          const varName = trimmed.split('=')[0].replace(/let|const|var|let mut/g, '').trim();
          if (varName && /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(varName)) {
            mockVars[varName] = Math.floor(Math.random() * 50) + 1;
          }
        }
        steps.push({
          fileId,
          fileName,
          lineNumber: lineIdx,
          functionName: trimmed.slice(0, 24),
          scopeVariables: { ...mockVars, line: lineIdx },
          logOutput: trimmed.includes('console.log') || trimmed.includes('print')
            ? `> Line ${lineIdx}: ${trimmed.replace(/console\.log\(|print\(|\);|\)/g, '')}`
            : undefined,
        });
      }
    }
  }

  return steps;
}

export function formatVariableList(obj: Record<string, any>): DebugVariable[] {
  return Object.entries(obj).map(([key, val]) => {
    let type: DebugVariable['type'] = 'string';
    let displayVal = String(val);

    if (val === 'undefined' || val === undefined) {
      type = 'undefined';
      displayVal = 'undefined';
    } else if (typeof val === 'number') {
      type = 'number';
    } else if (typeof val === 'boolean') {
      type = 'boolean';
    } else if (Array.isArray(val)) {
      type = 'array';
      displayVal = `Array(${val.length}) [${val.join(', ')}]`;
    } else if (typeof val === 'object' && val !== null) {
      type = 'object';
      displayVal = JSON.stringify(val);
    }

    return {
      name: key,
      value: displayVal,
      type,
    };
  });
}

export function evaluateDebugExpression(expression: string, scopeVariables: Record<string, any>): string {
  const trimmed = expression.trim();
  if (!trimmed) return 'undefined';

  if (scopeVariables[trimmed] !== undefined) {
    const val = scopeVariables[trimmed];
    return typeof val === 'object' ? JSON.stringify(val) : String(val);
  }

  // Safe arithmetic evaluator
  try {
    const contextKeys = Object.keys(scopeVariables);
    const contextVals = Object.values(scopeVariables);
    // eslint-disable-next-line no-new-func
    const fn = new Function(...contextKeys, `"use strict"; return (${trimmed});`);
    const res = fn(...contextVals);
    return typeof res === 'object' ? JSON.stringify(res) : String(res);
  } catch (err: any) {
    return `ReferenceError: ${err.message || 'expression error'}`;
  }
}
