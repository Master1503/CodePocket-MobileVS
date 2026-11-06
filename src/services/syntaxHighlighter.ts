/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Prism from 'prismjs';
// Import language components
import 'prismjs/components/prism-typescript.js';
import 'prismjs/components/prism-python.js';
import 'prismjs/components/prism-json.js';
import 'prismjs/components/prism-markdown.js';
import 'prismjs/components/prism-c.js';
import 'prismjs/components/prism-cpp.js';
import 'prismjs/components/prism-rust.js';
import 'prismjs/components/prism-go.js';
import 'prismjs/components/prism-sql.js';
import 'prismjs/components/prism-bash.js';
import { LanguageId } from '../types/vscode.ts';

export function getPrismLanguage(lang: LanguageId): string {
  switch (lang) {
    case 'javascript':
      return 'javascript';
    case 'typescript':
      return 'typescript';
    case 'python':
      return 'python';
    case 'html':
      return 'markup';
    case 'css':
      return 'css';
    case 'json':
      return 'json';
    case 'markdown':
      return 'markdown';
    case 'rust':
      return 'rust';
    case 'go':
      return 'go';
    case 'cpp':
      return 'cpp';
    case 'sql':
      return 'sql';
    default:
      return 'plaintext';
  }
}

export function highlightCode(code: string, language: LanguageId): string {
  const prismLangName = getPrismLanguage(language);
  const grammar = Prism.languages[prismLangName];
  if (!grammar) {
    return escapeHtml(code);
  }
  try {
    return Prism.highlight(code, grammar, prismLangName);
  } catch {
    return escapeHtml(code);
  }
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function detectLanguageFromFilename(filename: string): LanguageId {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js':
    case 'mjs':
    case 'cjs':
    case 'jsx':
      return 'javascript';
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'py':
      return 'python';
    case 'html':
    case 'htm':
    case 'svg':
      return 'html';
    case 'css':
    case 'scss':
    case 'less':
      return 'css';
    case 'json':
      return 'json';
    case 'md':
    case 'markdown':
      return 'markdown';
    case 'rs':
      return 'rust';
    case 'go':
      return 'go';
    case 'cpp':
    case 'cc':
    case 'cxx':
    case 'hpp':
    case 'h':
      return 'cpp';
    case 'sql':
      return 'sql';
    default:
      return 'plaintext';
  }
}

export function getLanguageCommentSyntax(lang: LanguageId): { prefix: string; suffix?: string } {
  switch (lang) {
    case 'python':
      return { prefix: '# ' };
    case 'html':
      return { prefix: '<!-- ', suffix: ' -->' };
    case 'css':
      return { prefix: '/* ', suffix: ' */' };
    case 'sql':
      return { prefix: '-- ' };
    default:
      return { prefix: '// ' };
  }
}
