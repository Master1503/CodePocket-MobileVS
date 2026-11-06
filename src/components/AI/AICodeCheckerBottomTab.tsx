/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  AlertCircle,
  AlertTriangle,
  Info,
  RefreshCw,
  Wand2,
  Check,
  ShieldCheck,
  Zap,
  Bug,
  Code2,
} from 'lucide-react';
import { FileItem, AICheckResult, AICheckIssue } from '../../types/vscode.ts';

interface AICodeCheckerBottomTabProps {
  activeFile: FileItem | null;
  result: AICheckResult | null;
  isLoading: boolean;
  onRunCheck: (file: FileItem, checkType: 'all' | 'bugs' | 'security' | 'performance') => void;
  onApplyFix: (issue: AICheckIssue) => void;
  onApplyAllFixes: (improvedCode: string) => void;
  onJumpToLine: (line: number) => void;
}

export const AICodeCheckerBottomTab: React.FC<AICodeCheckerBottomTabProps> = ({
  activeFile,
  result,
  isLoading,
  onRunCheck,
  onApplyFix,
  onApplyAllFixes,
  onJumpToLine,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [appliedIds, setAppliedIds] = useState<Record<string, boolean>>({});

  const handleFix = (issue: AICheckIssue) => {
    onApplyFix(issue);
    setAppliedIds((prev) => ({ ...prev, [issue.id]: true }));
  };

  const issues = result?.issues || [];
  const filteredIssues = issues.filter((i) => {
    if (filterType === 'all') return true;
    if (filterType === 'error') return i.severity === 'error';
    if (filterType === 'security') return i.category === 'security';
    if (filterType === 'performance') return i.category === 'performance';
    return true;
  });

  return (
    <div className="flex flex-col h-full w-full bg-[#181818] text-[#cccccc] font-sans text-xs overflow-hidden select-text">
      {/* Sub-header Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#202020] border-b border-[#2d2d2d] shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => activeFile && onRunCheck(activeFile, 'all')}
            disabled={isLoading || !activeFile}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#991b1b] hover:bg-[#7f1d1d] active:scale-95 disabled:opacity-50 text-white rounded text-[11px] font-semibold transition-all cursor-pointer shadow-xs"
          >
            <RefreshCw size={11} className={isLoading ? 'animate-spin' : ''} />
            <span>{isLoading ? 'Scanning...' : 'Scan Active File'}</span>
          </button>

          {result && (
            <>
              <div className="h-4 w-px bg-[#333] mx-1" />
              <span className="text-[11px] font-bold text-gray-300">
                Score: <span className="text-emerald-400 font-mono">{result.score}/100</span>
              </span>
              <div className="flex items-center gap-1 text-[10px]">
                <button
                  type="button"
                  onClick={() => setFilterType('all')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    filterType === 'all' ? 'bg-[#37373d] text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  All ({issues.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('error')}
                  className={`px-2 py-0.5 rounded cursor-pointer text-rose-400 ${
                    filterType === 'error' ? 'bg-rose-950/60 font-semibold' : 'hover:text-rose-300'
                  }`}
                >
                  Errors ({issues.filter((i) => i.severity === 'error').length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('security')}
                  className={`px-2 py-0.5 rounded cursor-pointer text-amber-400 ${
                    filterType === 'security' ? 'bg-amber-950/60 font-semibold' : 'hover:text-amber-300'
                  }`}
                >
                  Security ({issues.filter((i) => i.category === 'security').length})
                </button>
              </div>
            </>
          )}
        </div>

        {result?.improvedCode && (
          <button
            type="button"
            onClick={() => result.improvedCode && onApplyAllFixes(result.improvedCode)}
            className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold transition-all cursor-pointer shadow-xs"
          >
            <Wand2 size={11} />
            <span className="hidden sm:inline">Apply All Fixes</span>
          </button>
        )}
      </div>

      {/* Main Content List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#262626]">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-[#991b1b]/30 border-t-[#991b1b] animate-spin" />
            <span className="text-xs font-medium text-gray-300">Auditing code with Gemini 3.8 Flash...</span>
          </div>
        ) : !result ? (
          <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center gap-2">
            <Sparkles size={24} className="text-red-400 opacity-60" />
            <span className="text-xs text-gray-300 font-medium">No active AI audit</span>
            <span className="text-[11px] text-gray-400 max-w-xs">
              Run the AI Code Checker to detect runtime bugs, injection risks, and performance traps in{' '}
              {activeFile?.name || 'this file'}.
            </span>
            <button
              type="button"
              onClick={() => activeFile && onRunCheck(activeFile, 'all')}
              disabled={!activeFile}
              className="mt-2 px-3 py-1 bg-[#991b1b] hover:bg-[#7f1d1d] text-white rounded text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Start Analysis
            </button>
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-950/40 text-emerald-400 flex items-center justify-center font-bold">
              ✓
            </div>
            <span className="text-xs text-gray-200 font-medium">No issues found</span>
            <span className="text-[11px] text-gray-400">{result.summary}</span>
          </div>
        ) : (
          filteredIssues.map((issue) => {
            const isApplied = appliedIds[issue.id];
            return (
              <div
                key={issue.id}
                className={`p-3 hover:bg-[#252526] transition-colors ${
                  isApplied ? 'opacity-60 bg-emerald-950/10' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {issue.severity === 'error' ? (
                      <AlertCircle size={14} className="text-rose-400 shrink-0" />
                    ) : issue.severity === 'warning' ? (
                      <AlertTriangle size={14} className="text-amber-400 shrink-0" />
                    ) : (
                      <Info size={14} className="text-blue-400 shrink-0" />
                    )}
                    <span className="font-semibold text-gray-100">{issue.title}</span>
                    <span className="text-[10px] uppercase font-mono px-1 py-0.2 rounded bg-[#333] text-gray-300">
                      {issue.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => onJumpToLine(issue.line)}
                      className="text-[10px] font-mono text-[#f87171] hover:underline cursor-pointer"
                    >
                      Line {issue.line}
                    </button>
                  </div>

                  {issue.replacementCode && (
                    <button
                      type="button"
                      onClick={() => handleFix(issue)}
                      disabled={isApplied}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                        isApplied
                          ? 'bg-emerald-900/40 text-emerald-300'
                          : 'bg-[#991b1b] hover:bg-[#7f1d1d] text-white shadow-xs'
                      }`}
                    >
                      {isApplied ? <Check size={11} /> : <Wand2 size={11} />}
                      <span>{isApplied ? 'Fixed' : 'Fix'}</span>
                    </button>
                  )}
                </div>

                <div className="text-gray-300 text-[11px] mt-1 pl-5 leading-relaxed">
                  {issue.message}
                </div>

                {issue.replacementCode && (
                  <div className="mt-2 ml-5 bg-[#121212] p-2 rounded text-[11px] font-mono border border-[#2d2d2d] text-emerald-300">
                    <span className="text-emerald-500 mr-2 select-none">+</span>
                    {issue.replacementCode}
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
