/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type LanguageId =
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'html'
  | 'css'
  | 'json'
  | 'markdown'
  | 'rust'
  | 'go'
  | 'cpp'
  | 'sql'
  | 'plaintext';

export interface FileItem {
  id: string;
  name: string;
  path: string;
  content: string;
  language: LanguageId;
  isFolder?: boolean;
  children?: FileItem[];
  isModified?: boolean;
  originalContent?: string;
  isStaged?: boolean;
}

export interface TabItem {
  id: string;
  fileId: string;
  filePath: string;
  title: string;
  language: LanguageId;
  isModified: boolean;
  isDiff?: boolean;
  isPreview?: boolean;
  isMarkdown?: boolean;
}

export type SidebarView =
  | 'explorer'
  | 'search'
  | 'git'
  | 'debug'
  | 'extensions'
  | 'settings'
  | 'ai'
  | null;

export type BottomPanelTab =
  | 'terminal'
  | 'debug-console'
  | 'problems'
  | 'output'
  | 'ai-checker'
  | 'performance';

export interface Breakpoint {
  id: string;
  fileId: string;
  filePath: string;
  lineNumber: number;
  enabled: boolean;
  condition?: string;
}

export interface DebugFrame {
  id: string;
  functionName: string;
  fileId: string;
  fileName: string;
  lineNumber: number;
}

export interface DebugVariable {
  name: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function' | 'undefined';
  children?: DebugVariable[];
}

export interface DebugWatch {
  id: string;
  expression: string;
  value: string;
  error?: boolean;
}

export type DebugStatus = 'idle' | 'running' | 'paused' | 'stopped';

export interface GitCommit {
  id: string;
  hash: string;
  shortHash: string;
  message: string;
  author: string;
  timestamp: string;
  branch: string;
  filesChanged: number;
}

export interface Extension {
  id: string;
  name: string;
  displayName: string;
  version: string;
  publisher: string;
  description: string;
  icon: string;
  category: 'Themes' | 'Linters' | 'Formatters' | 'Languages' | 'Tools';
  downloads: string;
  rating: number;
  installed: boolean;
  enabled: boolean;
  themeId?: string;
}

export interface ProblemItem {
  id: string;
  fileId: string;
  filePath: string;
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  source: string;
}

export interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'success' | 'info';
  text: string;
  timestamp?: string;
}

export interface TerminalTab {
  id: string;
  title: string;
  lines: TerminalLine[];
  history: string[];
  historyIndex: number;
  workingDir: string;
}

export interface CloudDevice {
  id: string;
  name: string;
  platform: 'iPhone' | 'Android' | 'iPad' | 'Mac' | 'Windows' | 'Linux';
  lastSynced: string;
  isCurrent: boolean;
}

export interface UserSettings {
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  theme: string;
  minimap: boolean;
  lineNumbers: boolean;
  autoSave: boolean;
  formatOnSave: boolean;
  touchKeyboardPosition: 'bottom' | 'floating';
  vimMode: boolean;
  bracketMatching: boolean;
  autoIndent: boolean;
}

export interface AICheckIssue {
  id: string;
  line: number;
  column?: number;
  severity: 'error' | 'warning' | 'info';
  category: 'bug' | 'security' | 'performance' | 'syntax' | 'style';
  title: string;
  message: string;
  suggestedFix?: string;
  replacementCode?: string;
  originalCode?: string;
}

export interface AICheckResult {
  fileId: string;
  filePath: string;
  filename: string;
  summary: string;
  score: number;
  metrics: {
    maintainability: number;
    security: number;
    performance: number;
    reliability: number;
  };
  issues: AICheckIssue[];
  improvedCode?: string;
  checkedAt: string;
}

