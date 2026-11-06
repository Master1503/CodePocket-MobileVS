/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FileItem, ProblemItem } from '../types/vscode.ts';

export function analyzeFileForProblems(file: FileItem): ProblemItem[] {
  const problems: ProblemItem[] = [];
  if (!file.content) return problems;

  const lines = file.content.split('\n');

  // JSON linting
  if (file.language === 'json') {
    try {
      JSON.parse(file.content);
    } catch (e: any) {
      const match = e.message.match(/line (\d+) column (\d+)/i) || e.message.match(/position (\d+)/i);
      let line = 1;
      let col = 1;
      if (match && match[1]) {
        line = parseInt(match[1], 10) || 1;
        col = parseInt(match[2], 10) || 1;
      }
      problems.push({
        id: `prob-${file.id}-json`,
        fileId: file.id,
        filePath: file.path,
        line,
        column: col,
        message: e.message,
        severity: 'error',
        source: 'json-schema',
      });
    }
    return problems;
  }

  // JS/TS linting
  if (file.language === 'javascript' || file.language === 'typescript') {
    let openBraces = 0;
    let openParens = 0;
    let openBrackets = 0;

    for (let i = 0; i < lines.length; i++) {
      const lineText = lines[i];
      const trimmed = lineText.trim();
      const lineNum = i + 1;

      // Check unbalanced brackets
      for (const char of lineText) {
        if (char === '{') openBraces++;
        if (char === '}') openBraces--;
        if (char === '(') openParens++;
        if (char === ')') openParens--;
        if (char === '[') openBrackets++;
        if (char === ']') openBrackets--;
      }

      // Check `var` usage
      if (/\bvar\s+[a-zA-Z_$]/.test(trimmed)) {
        problems.push({
          id: `prob-${file.id}-${lineNum}-var`,
          fileId: file.id,
          filePath: file.path,
          line: lineNum,
          column: lineText.indexOf('var') + 1,
          message: "Unexpected 'var', use 'let' or 'const' instead (no-var)",
          severity: 'warning',
          source: 'eslint',
        });
      }

      // Check console.log warning
      if (trimmed.includes('console.log(')) {
        problems.push({
          id: `prob-${file.id}-${lineNum}-console`,
          fileId: file.id,
          filePath: file.path,
          line: lineNum,
          column: lineText.indexOf('console.log') + 1,
          message: "Unexpected console statement (no-console)",
          severity: 'info',
          source: 'eslint',
        });
      }

      // Check double equals
      if (/[^=!]==[^=]/.test(trimmed)) {
        problems.push({
          id: `prob-${file.id}-${lineNum}-eqeq`,
          fileId: file.id,
          filePath: file.path,
          line: lineNum,
          column: 1,
          message: "Expected '===' and instead saw '==' (eqeqeq)",
          severity: 'warning',
          source: 'eslint',
        });
      }
    }

    if (openBraces !== 0) {
      problems.push({
        id: `prob-${file.id}-brace`,
        fileId: file.id,
        filePath: file.path,
        line: lines.length,
        column: 1,
        message: openBraces > 0 ? "Unclosed '{' block" : "Extra closing '}' found",
        severity: 'error',
        source: 'typescript',
      });
    }

    if (openParens !== 0) {
      problems.push({
        id: `prob-${file.id}-paren`,
        fileId: file.id,
        filePath: file.path,
        line: lines.length,
        column: 1,
        message: openParens > 0 ? "Unclosed '('" : "Extra closing ')' found",
        severity: 'error',
        source: 'typescript',
      });
    }
  }

  // Python linting
  if (file.language === 'python') {
    for (let i = 0; i < lines.length; i++) {
      const lineText = lines[i];
      const trimmed = lineText.trim();
      const lineNum = i + 1;

      if ((trimmed.startsWith('def ') || trimmed.startsWith('if ') || trimmed.startsWith('for ') || trimmed.startsWith('while ') || trimmed.startsWith('class ')) && !trimmed.endsWith(':')) {
        problems.push({
          id: `prob-${file.id}-${lineNum}-colon`,
          fileId: file.id,
          filePath: file.path,
          line: lineNum,
          column: lineText.length,
          message: "SyntaxError: expected ':' at end of statement",
          severity: 'error',
          source: 'flake8',
        });
      }

      if (lineText.length > 100) {
        problems.push({
          id: `prob-${file.id}-${lineNum}-length`,
          fileId: file.id,
          filePath: file.path,
          line: lineNum,
          column: 101,
          message: "E501 line too long (exceeds 100 characters)",
          severity: 'info',
          source: 'flake8',
        });
      }
    }
  }

  return problems;
}

export function getAllProblems(files: FileItem[]): ProblemItem[] {
  let all: ProblemItem[] = [];
  function recurse(items: FileItem[]) {
    for (const f of items) {
      if (!f.isFolder) {
        all = all.concat(analyzeFileForProblems(f));
      }
      if (f.children) {
        recurse(f.children);
      }
    }
  }
  recurse(files);
  return all;
}
