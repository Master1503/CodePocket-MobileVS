/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FileItem, AICheckResult, AICheckIssue, ProblemItem } from '../types/vscode.ts';

/**
 * Fallback static analyzer used if server-side Gemini endpoint is unreachable
 * or if running without network access.
 */
function runClientSideHeuristicCheck(file: FileItem, checkType: string): AICheckResult {
  const lines = (file.content || '').split('\n');
  const issues: AICheckIssue[] = [];
  const lowerCode = (file.content || '').toLowerCase();

  // 1. Security checks
  if (checkType === 'all' || checkType === 'security') {
    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      if (line.includes('eval(')) {
        issues.push({
          id: `ai-sec-eval-${lineNum}`,
          line: lineNum,
          column: line.indexOf('eval(') + 1,
          severity: 'error',
          category: 'security',
          title: 'Dangerous use of eval()',
          message: 'eval() can execute arbitrary code strings and leads to code injection vulnerabilities.',
          suggestedFix: 'Replace eval() with JSON.parse() or a dedicated safe parser.',
          originalCode: line.trim(),
          replacementCode: line.replace(/eval\((.*?)\)/g, 'JSON.parse($1)'),
        });
      }
      if (line.includes('innerHTML')) {
        issues.push({
          id: `ai-sec-innerhtml-${lineNum}`,
          line: lineNum,
          column: line.indexOf('innerHTML') + 1,
          severity: 'warning',
          category: 'security',
          title: 'Direct innerHTML assignment (XSS risk)',
          message: 'Directly assigning to innerHTML can expose the application to cross-site scripting (XSS).',
          suggestedFix: 'Use textContent or sanitized DOM nodes instead of raw innerHTML.',
          originalCode: line.trim(),
          replacementCode: line.replace(/\.innerHTML\s*=/g, '.textContent ='),
        });
      }
      if (line.includes('password') && (line.includes('="') || line.includes("='")) && !line.includes('env')) {
        issues.push({
          id: `ai-sec-hardcoded-secret-${lineNum}`,
          line: lineNum,
          column: 1,
          severity: 'warning',
          category: 'security',
          title: 'Potential hardcoded credential',
          message: 'Possible sensitive token or password hardcoded directly in source code.',
          suggestedFix: 'Extract secrets to environment variables (e.g., process.env).',
          originalCode: line.trim(),
        });
      }
    });
  }

  // 2. Bug & logic checks
  if (checkType === 'all' || checkType === 'bugs') {
    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      const trimmed = line.trim();

      // Check loose equality
      if (/[^=!]==[^=]/.test(trimmed) && (file.language === 'javascript' || file.language === 'typescript')) {
        issues.push({
          id: `ai-bug-eqeq-${lineNum}`,
          line: lineNum,
          column: line.indexOf('==') + 1,
          severity: 'warning',
          category: 'bug',
          title: 'Loose equality check (`==`)',
          message: 'Loose equality can lead to unintended coercion bugs (e.g. `0 == ""` is true).',
          suggestedFix: 'Use strict equality (`===`) instead.',
          originalCode: line.trim(),
          replacementCode: line.replace(/([^=!])==([^=])/g, '$1===$2'),
        });
      }

      // Check accidental assignment in if statement
      if (/\bif\s*\(\s*[a-zA-Z0-9_$]+\s*=[^=]/.test(trimmed)) {
        issues.push({
          id: `ai-bug-assign-in-cond-${lineNum}`,
          line: lineNum,
          column: 1,
          severity: 'error',
          category: 'bug',
          title: 'Assignment within condition statement',
          message: 'Assignment inside an if condition usually indicates a typo for comparison.',
          suggestedFix: 'Change `=` to `===` in the condition.',
          originalCode: line.trim(),
          replacementCode: line.replace(/=([^=])/g, '===$1'),
        });
      }
    });
  }

  // 3. Performance checks
  if (checkType === 'all' || checkType === 'performance') {
    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      if (line.includes('.forEach(') && (line.includes('await ') || line.includes('async '))) {
        issues.push({
          id: `ai-perf-foreach-async-${lineNum}`,
          line: lineNum,
          column: line.indexOf('.forEach') + 1,
          severity: 'warning',
          category: 'performance',
          title: 'Asynchronous forEach loop',
          message: 'Array.forEach does not wait for async promises to resolve, leading to unhandled concurrency.',
          suggestedFix: 'Use `for...of` or `Promise.all(array.map(...))` to sequence asynchronous calls properly.',
          originalCode: line.trim(),
        });
      }
      if (line.includes('delete ') && (file.language === 'javascript' || file.language === 'typescript')) {
        issues.push({
          id: `ai-perf-delete-${lineNum}`,
          line: lineNum,
          column: line.indexOf('delete') + 1,
          severity: 'info',
          category: 'performance',
          title: 'Use of delete operator de-optimizes hidden classes',
          message: 'The `delete` operator mutates the object hidden class in V8 engines, hurting execution speed.',
          suggestedFix: 'Set the key to undefined or use object destructuring instead.',
          originalCode: line.trim(),
        });
      }
    });
  }

  // 4. Style & Syntax checks
  if (checkType === 'all') {
    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      if (line.includes('var ') && (file.language === 'javascript' || file.language === 'typescript')) {
        issues.push({
          id: `ai-style-var-${lineNum}`,
          line: lineNum,
          column: line.indexOf('var ') + 1,
          severity: 'info',
          category: 'style',
          title: 'Use of legacy `var` declaration',
          message: '`var` has function scope and hoisting anomalies. Use block-scoped `let` or `const`.',
          suggestedFix: 'Replace `var` with `const` or `let`.',
          originalCode: line.trim(),
          replacementCode: line.replace(/\bvar\s+/g, 'const '),
        });
      }
    });
  }

  // Calculate score based on issues
  let score = 100;
  issues.forEach((i) => {
    if (i.severity === 'error') score -= 15;
    else if (i.severity === 'warning') score -= 8;
    else score -= 3;
  });
  score = Math.max(20, Math.min(100, score));

  return {
    fileId: file.id,
    filePath: file.path,
    filename: file.name,
    summary:
      issues.length === 0
        ? 'No critical defects or vulnerabilities detected. Code demonstrates good conventions and structure.'
        : `Identified ${issues.length} potential improvement${issues.length === 1 ? '' : 's'} across security, logic correctness, and performance.`,
    score,
    metrics: {
      maintainability: Math.max(40, score - 5),
      security: issues.some((i) => i.category === 'security') ? 60 : 95,
      performance: issues.some((i) => i.category === 'performance') ? 65 : 92,
      reliability: issues.some((i) => i.severity === 'error') ? 55 : 90,
    },
    issues,
    checkedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  };
}

/**
 * Sends source code to server-side Gemini API endpoint
 */
export async function checkCodeWithAI(
  file: FileItem,
  checkType: 'all' | 'bugs' | 'security' | 'performance' = 'all'
): Promise<AICheckResult> {
  try {
    const res = await fetch('/api/ai/check-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: file.name,
        code: file.content,
        language: file.language,
        checkType,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        ...data,
        fileId: file.id,
        filePath: file.path,
        filename: file.name,
        checkedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
    }
  } catch (err) {
    console.warn('Server-side AI code check call failed, falling back to local analysis:', err);
  }

  // Fallback to local heuristic checks
  return runClientSideHeuristicCheck(file, checkType);
}

/**
 * Applies a specific AI fix to the file content
 */
export function applyAIFix(fileContent: string, issue: AICheckIssue): string {
  if (!issue.replacementCode) return fileContent;

  const lines = fileContent.split('\n');
  const targetIndex = issue.line - 1;

  if (targetIndex >= 0 && targetIndex < lines.length) {
    if (issue.originalCode && lines[targetIndex].includes(issue.originalCode)) {
      lines[targetIndex] = lines[targetIndex].replace(issue.originalCode, issue.replacementCode);
    } else {
      lines[targetIndex] = issue.replacementCode;
    }
    return lines.join('\n');
  }

  return fileContent;
}

/**
 * Converts AI check issues into ProblemItem format for the Problems view
 */
export function convertAIIssuesToProblems(result: AICheckResult): ProblemItem[] {
  return result.issues.map((issue) => ({
    id: `prob-ai-${result.fileId}-${issue.id}`,
    fileId: result.fileId,
    filePath: result.filePath,
    line: issue.line,
    column: issue.column || 1,
    message: `[AI ${issue.category.toUpperCase()}] ${issue.title}: ${issue.message}`,
    severity: issue.severity,
    source: 'Gemini AI',
  }));
}
