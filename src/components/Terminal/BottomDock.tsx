/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Terminal as TerminalIcon,
  Bug,
  AlertCircle,
  FileText,
  X,
  Maximize2,
  Minimize2,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Activity,
} from 'lucide-react';
import {
  BottomPanelTab,
  FileItem,
  GitCommit,
  DebugVariable,
  ProblemItem,
  AICheckResult,
  AICheckIssue,
} from '../../types/vscode.ts';
import { TerminalView } from './TerminalView.tsx';
import { DebugConsoleView } from './DebugConsoleView.tsx';
import { ProblemsView } from './ProblemsView.tsx';
import { OutputView } from './OutputView.tsx';
import { PerformanceView } from './PerformanceView.tsx';
import { AICodeCheckerBottomTab } from '../AI/AICodeCheckerBottomTab.tsx';

interface BottomDockProps {
  activeTab: BottomPanelTab;
  onTabChange: (tab: BottomPanelTab) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  isMaximized: boolean;
  onToggleMaximize: () => void;
  files: FileItem[];
  gitBranch: string;
  gitCommits: GitCommit[];
  debugLogs: string[];
  debugVariables: DebugVariable[];
  problems: ProblemItem[];
  onSelectProblem: (filePath: string, line: number, column: number) => void;
  onClearDebugLogs?: () => void;
  onFileCreate?: (name: string, content: string) => void;
  onFileDelete?: (path: string) => void;
  onCommit?: (message: string) => void;
  onBranchChange?: (branch: string) => void;
  activeFile?: FileItem | null;
  aiResult?: AICheckResult | null;
  isCheckingAI?: boolean;
  onRunAICheck?: (file: FileItem, checkType: 'all' | 'bugs' | 'security' | 'performance') => void;
  onApplyAIFix?: (issue: AICheckIssue) => void;
  onApplyAllAIFixes?: (improvedCode: string) => void;
  onJumpToLine?: (line: number) => void;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  activeTab,
  onTabChange,
  isOpen,
  onToggleOpen,
  isMaximized,
  onToggleMaximize,
  files,
  gitBranch,
  gitCommits,
  debugLogs,
  debugVariables,
  problems,
  onSelectProblem,
  onClearDebugLogs,
  onFileCreate,
  onFileDelete,
  onCommit,
  onBranchChange,
  activeFile = null,
  aiResult = null,
  isCheckingAI = false,
  onRunAICheck,
  onApplyAIFix,
  onApplyAllAIFixes,
  onJumpToLine,
}) => {
  if (!isOpen) return null;

  const errorCount = problems.filter((p) => p.severity === 'error').length;
  const warningCount = problems.filter((p) => p.severity === 'warning').length;

  return (
    <div
      className={`flex flex-col w-full border-t border-[#3c3c3c] bg-[#181818] z-20 transition-all duration-200 ${
        isMaximized ? 'h-[75vh]' : 'h-64 sm:h-72'
      }`}
    >
      {/* Dock Tab Bar Header */}
      <div className="flex items-center justify-between px-2 bg-[#252526] border-b border-[#3c3c3c] select-none shrink-0 h-9">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none h-full">
          {/* AI Code Checker Tab */}
          <button
            type="button"
            onClick={() => onTabChange('ai-checker')}
            className={`flex items-center gap-1.5 px-3 h-full text-xs transition-colors border-b-2 cursor-pointer ${
              activeTab === 'ai-checker'
                ? 'border-[#991b1b] text-white font-medium bg-[#1e1e1e]'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Sparkles size={13} className="text-red-400" />
            <span>AI Checker</span>
            {aiResult && aiResult.issues.length > 0 && (
              <span className="bg-[#991b1b] text-white px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold">
                {aiResult.issues.length}
              </span>
            )}
          </button>

          {/* Problems Tab */}
          <button
            type="button"
            onClick={() => onTabChange('problems')}
            className={`flex items-center gap-1.5 px-3 h-full text-xs transition-colors border-b-2 cursor-pointer ${
              activeTab === 'problems'
                ? 'border-[#991b1b] text-white font-medium bg-[#1e1e1e]'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <AlertCircle size={13} className={errorCount > 0 ? 'text-rose-400' : 'text-gray-400'} />
            <span>Problems</span>
            {errorCount + warningCount > 0 && (
              <span className="bg-[#333] text-gray-200 px-1.5 py-0.2 rounded-full text-[10px] font-mono">
                {errorCount + warningCount}
              </span>
            )}
          </button>

          {/* Terminal Tab */}
          <button
            type="button"
            onClick={() => onTabChange('terminal')}
            className={`flex items-center gap-1.5 px-3 h-full text-xs transition-colors border-b-2 cursor-pointer ${
              activeTab === 'terminal'
                ? 'border-[#991b1b] text-white font-medium bg-[#1e1e1e]'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <TerminalIcon size={13} className="text-emerald-400" />
            <span>Terminal</span>
          </button>

          {/* Debug Console Tab */}
          <button
            type="button"
            onClick={() => onTabChange('debug-console')}
            className={`flex items-center gap-1.5 px-3 h-full text-xs transition-colors border-b-2 cursor-pointer ${
              activeTab === 'debug-console'
                ? 'border-[#991b1b] text-white font-medium bg-[#1e1e1e]'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Bug size={13} className="text-amber-400" />
            <span>Debug Console</span>
          </button>

          {/* Output Tab */}
          <button
            type="button"
            onClick={() => onTabChange('output')}
            className={`flex items-center gap-1.5 px-3 h-full text-xs transition-colors border-b-2 cursor-pointer ${
              activeTab === 'output'
                ? 'border-[#991b1b] text-white font-medium bg-[#1e1e1e]'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <FileText size={13} />
            <span>Output</span>
          </button>

          {/* Performance Tab */}
          <button
            type="button"
            onClick={() => onTabChange('performance')}
            className={`flex items-center gap-1.5 px-3 h-full text-xs transition-colors border-b-2 cursor-pointer ${
              activeTab === 'performance'
                ? 'border-[#991b1b] text-white font-medium bg-[#1e1e1e]'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Activity size={13} className="text-red-400" />
            <span>Performance</span>
          </button>
        </div>

        {/* Panel Window Actions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onToggleMaximize}
            title={isMaximized ? 'Restore Size' : 'Maximize Panel Size'}
            className="p-1 hover:bg-[#333333] text-gray-400 hover:text-white rounded cursor-pointer"
          >
            {isMaximized ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
          <button
            type="button"
            onClick={onToggleOpen}
            title="Close Panel (Ctrl+`)"
            className="p-1 hover:bg-[#333333] text-gray-400 hover:text-white rounded cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Dock Content Body */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'ai-checker' && (
          <AICodeCheckerBottomTab
            activeFile={activeFile}
            result={aiResult}
            isLoading={isCheckingAI}
            onRunCheck={onRunAICheck || (() => {})}
            onApplyFix={onApplyAIFix || (() => {})}
            onApplyAllFixes={onApplyAllAIFixes || (() => {})}
            onJumpToLine={onJumpToLine || (() => {})}
          />
        )}
        {activeTab === 'terminal' && (
          <TerminalView
            files={files}
            gitBranch={gitBranch}
            gitCommits={gitCommits}
            onFileCreate={onFileCreate}
            onFileDelete={onFileDelete}
            onCommit={onCommit}
            onBranchChange={onBranchChange}
          />
        )}
        {activeTab === 'debug-console' && (
          <DebugConsoleView
            logs={debugLogs}
            scopeVariables={debugVariables}
            onClearLogs={onClearDebugLogs}
          />
        )}
        {activeTab === 'problems' && (
          <ProblemsView problems={problems} onSelectProblem={onSelectProblem} />
        )}
        {activeTab === 'output' && <OutputView />}
        {activeTab === 'performance' && <PerformanceView activeFile={activeFile} />}
      </div>
    </div>
  );
};
