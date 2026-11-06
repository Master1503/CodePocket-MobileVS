/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  Info,
  Wand2,
  Check,
  Maximize2,
  ShieldCheck,
  Zap,
  Bug,
} from 'lucide-react';
import { FileItem, AICheckResult, AICheckIssue } from '../../types/vscode.ts';

interface AICodeCheckerSidebarPanelProps {
  activeFile: FileItem | null;
  result: AICheckResult | null;
  isLoading: boolean;
  onRunCheck: (file: FileItem, checkType: 'all' | 'bugs' | 'security' | 'performance') => void;
  onApplyFix: (issue: AICheckIssue) => void;
  onApplyAllFixes: (improvedCode: string) => void;
  onJumpToLine: (line: number) => void;
  onOpenFullModal: () => void;
}

export const AICodeCheckerSidebarPanel: React.FC<AICodeCheckerSidebarPanelProps> = ({
  activeFile,
  result,
  isLoading,
  onRunCheck,
  onApplyFix,
  onApplyAllFixes,
  onJumpToLine,
  onOpenFullModal,
}) => {
  const [filter, setFilter] = useState<string>('all');
  const [fixedMap, setFixedMap] = useState<Record<string, boolean>>({});

  const handleFix = (issue: AICheckIssue) => {
    onApplyFix(issue);
    setFixedMap((prev) => ({ ...prev, [issue.id]: true }));
  };

  const issues = result?.issues || [];
  const filteredIssues = issues.filter((i) => {
    if (filter === 'all') return true;
    if (filter === 'error') return i.severity === 'error';
    if (filter === 'security') return i.category === 'security';
    if (filter === 'performance') return i.category === 'performance';
    return true;
  });

  return (
    <div className="flex flex-col h-full w-full bg-[#252526] text-[#cccccc] text-xs overflow-hidden select-none">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#3c3c3c] shrink-0">
        <div className="flex items-center gap-1.5">
          <Sparkles size={14} className="text-red-400" />
          <span className="uppercase text-[11px] font-bold tracking-wider text-gray-200">
            AI Code Checker
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onOpenFullModal}
            title="Expand Full AI Inspector"
            className="p-1 hover:bg-[#333333] hover:text-white text-gray-400 rounded cursor-pointer"
          >
            <Maximize2 size={13} />
          </button>
        </div>
      </div>

      {/* Target File Info & Run Action */}
      <div className="p-3 bg-[#1e1e1e] border-b border-[#333333] shrink-0 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-gray-400 truncate max-w-[150px]">
            Target: <span className="text-white font-mono">{activeFile ? activeFile.name : 'None'}</span>
          </span>
          <button
            type="button"
            onClick={() => activeFile && onRunCheck(activeFile, 'all')}
            disabled={isLoading || !activeFile}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#991b1b] hover:bg-[#7f1d1d] active:scale-95 disabled:opacity-50 text-white rounded text-[11px] font-semibold transition-all cursor-pointer shadow-xs"
          >
            <RefreshCw size={11} className={isLoading ? 'animate-spin' : ''} />
            <span>{isLoading ? 'Checking...' : 'Check Code'}</span>
          </button>
        </div>

        {/* Quality Gauge Preview */}
        {result && (
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-white">{result.score}</span>
              <span className="text-[10px] text-gray-400">/ 100 Quality Score</span>
            </div>
            {result.improvedCode && (
              <button
                type="button"
                onClick={() => result.improvedCode && onApplyAllFixes(result.improvedCode)}
                className="flex items-center gap-1 px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-semibold transition-colors cursor-pointer"
              >
                <Wand2 size={10} />
                <span>Fix All</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Issues Filter Strip */}
      {result && issues.length > 0 && (
        <div className="flex items-center gap-1 px-3 py-1.5 bg-[#202020] border-b border-[#333333] overflow-x-auto scrollbar-none text-[10px] shrink-0">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-2 py-0.5 rounded cursor-pointer ${
              filter === 'all' ? 'bg-[#37373d] text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            All ({issues.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('error')}
            className={`px-2 py-0.5 rounded cursor-pointer text-rose-400 ${
              filter === 'error' ? 'bg-rose-950/60 font-semibold' : 'hover:text-rose-300'
            }`}
          >
            Errors ({issues.filter((i) => i.severity === 'error').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('security')}
            className={`px-2 py-0.5 rounded cursor-pointer text-amber-400 ${
              filter === 'security' ? 'bg-amber-950/60 font-semibold' : 'hover:text-amber-300'
            }`}
          >
            Security ({issues.filter((i) => i.category === 'security').length})
          </button>
        </div>
      )}

      {/* Issues List or Empty State */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#303030]">
        {isLoading ? (
          <div className="p-6 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-[#991b1b]/30 border-t-[#991b1b] animate-spin" />
            <span className="text-xs text-gray-300">Auditing with Gemini 3.8 Flash...</span>
          </div>
        ) : !result ? (
          <div className="p-6 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
            <Sparkles size={28} className="text-red-400 opacity-60 mb-1" />
            <span className="text-xs font-semibold text-gray-200">AI Code Checker</span>
            <span className="text-[11px] text-gray-400 max-w-xs leading-relaxed">
              Detect bugs, security vulnerabilities, and performance traps in your code with Gemini AI.
            </span>
            <button
              type="button"
              onClick={() => activeFile && onRunCheck(activeFile, 'all')}
              disabled={!activeFile}
              className="mt-3 px-3 py-1.5 bg-[#991b1b] hover:bg-[#7f1d1d] text-white rounded text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              Analyze Active File
            </button>
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="p-6 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-950/40 text-emerald-400 flex items-center justify-center font-bold">
              ✓
            </div>
            <span className="text-xs font-semibold text-gray-200">No issues found</span>
            <span className="text-[11px] text-gray-400">{result.summary}</span>
          </div>
        ) : (
          filteredIssues.map((issue) => {
            const isFixed = fixedMap[issue.id];
            return (
              <div
                key={issue.id}
                className={`p-3 transition-colors hover:bg-[#2a2d2e] ${
                  isFixed ? 'opacity-60 bg-emerald-950/10' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {issue.severity === 'error' ? (
                      <AlertCircle size={13} className="text-rose-400 shrink-0" />
                    ) : issue.severity === 'warning' ? (
                      <AlertTriangle size={13} className="text-amber-400 shrink-0" />
                    ) : (
                      <Info size={13} className="text-blue-400 shrink-0" />
                    )}
                    <span className="font-semibold text-gray-200 text-xs">{issue.title}</span>
                  </div>

                  {issue.replacementCode && (
                    <button
                      type="button"
                      onClick={() => handleFix(issue)}
                      disabled={isFixed}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                        isFixed
                          ? 'bg-emerald-900/40 text-emerald-300'
                          : 'bg-[#991b1b] hover:bg-[#7f1d1d] text-white'
                      }`}
                    >
                      {isFixed ? <Check size={10} /> : <Wand2 size={10} />}
                      <span>{isFixed ? 'Fixed' : 'Fix'}</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => onJumpToLine(issue.line)}
                    className="text-[10px] font-mono text-[#f87171] hover:underline cursor-pointer"
                  >
                    Line {issue.line}
                  </button>
                  <span className="text-[10px] uppercase font-mono px-1 py-0.2 rounded bg-[#333] text-gray-300">
                    {issue.category}
                  </span>
                </div>

                <p className="text-[11px] text-gray-300 mt-1.5 leading-relaxed">
                  {issue.message}
                </p>

                {issue.replacementCode && (
                  <div className="mt-2 bg-[#181818] p-1.5 rounded text-[10px] font-mono text-emerald-300 border border-[#333] truncate">
                    +{issue.replacementCode}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
