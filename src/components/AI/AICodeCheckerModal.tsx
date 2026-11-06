/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  Info,
  Check,
  Wand2,
  Copy,
  ExternalLink,
  RefreshCw,
  X,
  ChevronRight,
  Code2,
  Zap,
  ShieldAlert,
  Bug,
  Gauge,
} from 'lucide-react';
import { FileItem, AICheckResult, AICheckIssue } from '../../types/vscode.ts';

interface AICodeCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeFile: FileItem | null;
  files: FileItem[];
  result: AICheckResult | null;
  isLoading: boolean;
  onRunCheck: (file: FileItem, checkType: 'all' | 'bugs' | 'security' | 'performance') => void;
  onApplyFix: (issue: AICheckIssue) => void;
  onApplyAllFixes: (improvedCode: string) => void;
  onJumpToLine: (line: number) => void;
}

export const AICodeCheckerModal: React.FC<AICodeCheckerModalProps> = ({
  isOpen,
  onClose,
  activeFile,
  files,
  result,
  isLoading,
  onRunCheck,
  onApplyFix,
  onApplyAllFixes,
  onJumpToLine,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [checkType, setCheckType] = useState<'all' | 'bugs' | 'security' | 'performance'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [appliedFixIds, setAppliedFixIds] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const issues = result?.issues || [];
  const filteredIssues = issues.filter((issue) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'error') return issue.severity === 'error';
    if (selectedCategory === 'warning') return issue.severity === 'warning';
    if (selectedCategory === 'security') return issue.category === 'security';
    if (selectedCategory === 'performance') return issue.category === 'performance';
    return true;
  });

  const handleCopyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFix = (issue: AICheckIssue) => {
    onApplyFix(issue);
    setAppliedFixIds((prev) => ({ ...prev, [issue.id]: true }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30';
    if (score >= 70) return 'text-amber-400 border-amber-500/40 bg-amber-950/30';
    return 'text-rose-400 border-rose-500/40 bg-rose-950/30';
  };

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;
  const securityCount = issues.filter((i) => i.category === 'security').length;
  const perfCount = issues.filter((i) => i.category === 'performance').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs select-none">
      <div className="flex flex-col w-full max-w-3xl h-[88vh] max-h-[750px] bg-[#1e1e1e] border border-[#3c3c3c] rounded-xl shadow-2xl overflow-hidden text-gray-200">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#252526] border-b border-[#333333] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#991b1b] flex items-center justify-center text-white shadow-xs">
              <Sparkles size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-wide">AI Code Checker</h2>
                <span className="text-[10px] bg-[#991b1b]/30 text-red-300 border border-[#991b1b]/50 px-1.5 py-0.2 rounded font-mono">
                  Gemini 3.8
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Auditing {activeFile ? <span className="text-gray-200 font-mono">{activeFile.name}</span> : 'workspace'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => activeFile && onRunCheck(activeFile, checkType)}
              disabled={isLoading || !activeFile}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#991b1b] hover:bg-[#7f1d1d] active:scale-95 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
              <span>{isLoading ? 'Inspecting...' : 'Run Scan'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-[#333333] text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Filter & Control Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-[#181818] border-b border-[#2d2d2d] shrink-0 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            <span className="text-gray-400 text-[11px] mr-1 hidden sm:inline">Focus:</span>
            {(['all', 'bugs', 'security', 'performance'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setCheckType(type);
                  if (activeFile) onRunCheck(activeFile, type);
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] capitalize font-medium transition-all cursor-pointer ${
                  checkType === type
                    ? 'bg-[#991b1b] text-white shadow-xs'
                    : 'bg-[#252526] text-gray-400 hover:text-white hover:bg-[#2e2e30]'
                }`}
              >
                {type === 'all' ? 'All Checks' : type}
              </button>
            ))}
          </div>

          {result && (
            <div className="flex items-center gap-2 text-[11px] text-gray-400">
              <span>Last checked: {result.checkedAt}</span>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="relative mb-3">
                <div className="w-12 h-12 rounded-full border-2 border-[#991b1b]/30 border-t-[#991b1b] animate-spin" />
                <Sparkles size={20} className="absolute inset-0 m-auto text-red-400 animate-pulse" />
              </div>
              <h3 className="text-sm font-semibold text-white">Analyzing Code with Gemini AI...</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm">
                Auditing AST, evaluating security constraints, spotting logical discrepancies, and generating verified fixes.
              </p>
            </div>
          ) : result ? (
            <>
              {/* Quality Score & Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {/* Score Card */}
                <div
                  className={`sm:col-span-2 p-3 rounded-xl border flex items-center justify-between ${getScoreColor(
                    result.score
                  )}`}
                >
                  <div>
                    <div className="text-[11px] font-medium opacity-80 uppercase tracking-wider">Quality Score</div>
                    <div className="text-3xl font-black tracking-tight">{result.score}/100</div>
                    <div className="text-[11px] font-medium mt-0.5">
                      {result.score >= 85
                        ? 'Production Ready'
                        : result.score >= 70
                        ? 'Good - Minor Improvements'
                        : 'Action Recommended'}
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full border-4 border-current flex items-center justify-center font-bold text-sm">
                    {result.score}%
                  </div>
                </div>

                {/* Metrics Breakdown */}
                <div className="sm:col-span-3 grid grid-cols-2 gap-2">
                  <div className="bg-[#252526] p-2.5 rounded-lg border border-[#333333]">
                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <ShieldCheck size={12} className="text-emerald-400" /> Security
                      </span>
                      <span className="font-mono font-bold text-white">{result.metrics.security}%</span>
                    </div>
                    <div className="w-full bg-[#1e1e1e] h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${result.metrics.security}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-[#252526] p-2.5 rounded-lg border border-[#333333]">
                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <Bug size={12} className="text-rose-400" /> Reliability
                      </span>
                      <span className="font-mono font-bold text-white">{result.metrics.reliability}%</span>
                    </div>
                    <div className="w-full bg-[#1e1e1e] h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className="bg-rose-500 h-full rounded-full"
                        style={{ width: `${result.metrics.reliability}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-[#252526] p-2.5 rounded-lg border border-[#333333]">
                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <Zap size={12} className="text-amber-400" /> Performance
                      </span>
                      <span className="font-mono font-bold text-white">{result.metrics.performance}%</span>
                    </div>
                    <div className="w-full bg-[#1e1e1e] h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full"
                        style={{ width: `${result.metrics.performance}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-[#252526] p-2.5 rounded-lg border border-[#333333]">
                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <Code2 size={12} className="text-blue-400" /> Cleanliness
                      </span>
                      <span className="font-mono font-bold text-white">{result.metrics.maintainability}%</span>
                    </div>
                    <div className="w-full bg-[#1e1e1e] h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full"
                        style={{ width: `${result.metrics.maintainability}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Box */}
              <div className="bg-[#252526]/80 p-3 rounded-lg border border-[#383838] text-xs text-gray-300 leading-relaxed">
                <span className="font-semibold text-white mr-1.5">AI Summary:</span>
                {result.summary}
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center justify-between border-b border-[#2d2d2d] pb-2">
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      selectedCategory === 'all'
                        ? 'bg-[#333333] text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    All ({issues.length})
                  </button>
                  {errorCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('error')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                        selectedCategory === 'error'
                          ? 'bg-rose-950/50 text-rose-300 border border-rose-800'
                          : 'text-rose-400 hover:text-rose-300'
                      }`}
                    >
                      <AlertCircle size={11} />
                      Errors ({errorCount})
                    </button>
                  )}
                  {warningCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('warning')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                        selectedCategory === 'warning'
                          ? 'bg-amber-950/50 text-amber-300 border border-amber-800'
                          : 'text-amber-400 hover:text-amber-300'
                      }`}
                    >
                      <AlertTriangle size={11} />
                      Warnings ({warningCount})
                    </button>
                  )}
                  {securityCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('security')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                        selectedCategory === 'security'
                          ? 'bg-red-950/50 text-red-300 border border-red-800'
                          : 'text-red-400 hover:text-red-300'
                      }`}
                    >
                      <ShieldAlert size={11} />
                      Security ({securityCount})
                    </button>
                  )}
                  {perfCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('performance')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                        selectedCategory === 'performance'
                          ? 'bg-blue-950/50 text-blue-300 border border-blue-800'
                          : 'text-blue-400 hover:text-blue-300'
                      }`}
                    >
                      <Zap size={11} />
                      Performance ({perfCount})
                    </button>
                  )}
                </div>

                {result.improvedCode && (
                  <button
                    type="button"
                    onClick={() => {
                      if (result.improvedCode) {
                        onApplyAllFixes(result.improvedCode);
                        onClose();
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-[11px] font-semibold transition-all shadow-xs shrink-0 cursor-pointer"
                  >
                    <Wand2 size={12} />
                    <span>Apply All AI Fixes</span>
                  </button>
                )}
              </div>

              {/* Issues List */}
              <div className="space-y-3">
                {filteredIssues.length === 0 ? (
                  <div className="p-8 text-center bg-[#252526]/50 rounded-xl border border-[#333333]">
                    <div className="w-10 h-10 rounded-full bg-emerald-950/40 text-emerald-400 flex items-center justify-center font-bold mx-auto mb-2">
                      ✓
                    </div>
                    <div className="text-sm font-semibold text-white">No Issues in this Category</div>
                    <div className="text-xs text-gray-400 mt-1">
                      Everything looks solid and adheres to best coding standards!
                    </div>
                  </div>
                ) : (
                  filteredIssues.map((issue) => {
                    const isApplied = appliedFixIds[issue.id];
                    return (
                      <div
                        key={issue.id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isApplied
                            ? 'bg-emerald-950/20 border-emerald-800/40 opacity-75'
                            : issue.severity === 'error'
                            ? 'bg-[#252222] border-rose-900/40'
                            : issue.severity === 'warning'
                            ? 'bg-[#252420] border-amber-900/40'
                            : 'bg-[#222425] border-blue-900/30'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Severity icon */}
                            {issue.severity === 'error' ? (
                              <span className="flex items-center gap-1 text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.5 rounded">
                                <AlertCircle size={10} /> Error
                              </span>
                            ) : issue.severity === 'warning' ? (
                              <span className="flex items-center gap-1 text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded">
                                <AlertTriangle size={10} /> Warning
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[10px] font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded">
                                <Info size={10} /> Info
                              </span>
                            )}

                            {/* Category pill */}
                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#333333] text-gray-300">
                              {issue.category}
                            </span>

                            {/* Line jump button */}
                            <button
                              type="button"
                              onClick={() => {
                                onJumpToLine(issue.line);
                                onClose();
                              }}
                              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1e1e1e] hover:bg-[#991b1b] text-gray-300 hover:text-white transition-colors cursor-pointer border border-[#444]"
                            >
                              Line {issue.line}
                            </button>
                          </div>

                          {/* Quick Fix Button */}
                          {issue.replacementCode && (
                            <button
                              type="button"
                              onClick={() => handleFix(issue)}
                              disabled={isApplied}
                              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                                isApplied
                                  ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/50'
                                  : 'bg-[#991b1b] hover:bg-[#7f1d1d] active:scale-95 text-white shadow-xs'
                              }`}
                            >
                              {isApplied ? <Check size={12} /> : <Wand2 size={12} />}
                              <span>{isApplied ? 'Applied' : 'Apply Fix'}</span>
                            </button>
                          )}
                        </div>

                        {/* Title & Message */}
                        <div className="mt-2 text-xs">
                          <h4 className="font-semibold text-white">{issue.title}</h4>
                          <p className="text-gray-300 mt-1 leading-relaxed">{issue.message}</p>
                        </div>

                        {/* Code snippet diff */}
                        {(issue.originalCode || issue.replacementCode) && (
                          <div className="mt-3 bg-[#181818] rounded-lg p-2.5 font-mono text-[11px] border border-[#2b2b2b] overflow-x-auto space-y-1.5">
                            {issue.originalCode && (
                              <div className="flex items-start gap-2 text-rose-300/80 bg-rose-950/20 px-2 py-1 rounded">
                                <span className="text-rose-500 select-none">-</span>
                                <span className="line-through">{issue.originalCode}</span>
                              </div>
                            )}
                            {issue.replacementCode && (
                              <div className="flex items-start gap-2 text-emerald-300 bg-emerald-950/20 px-2 py-1 rounded">
                                <span className="text-emerald-500 select-none">+</span>
                                <span>{issue.replacementCode}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Suggested guidance */}
                        {issue.suggestedFix && (
                          <div className="mt-2 text-[11px] text-gray-400 flex items-center gap-1.5">
                            <span className="font-semibold text-gray-300">Suggestion:</span>
                            <span>{issue.suggestedFix}</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#991b1b]/10 text-red-500 flex items-center justify-center mb-3">
                <Sparkles size={24} />
              </div>
              <h3 className="text-sm font-semibold text-white">Ready to Inspect Code</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm">
                Tap "Run Scan" to perform an automated AI audit with Gemini 3.8 Flash for syntax bugs, security vulnerabilities, and performance speedups.
              </p>
              <button
                type="button"
                onClick={() => activeFile && onRunCheck(activeFile, checkType)}
                disabled={!activeFile}
                className="mt-4 px-4 py-2 bg-[#991b1b] hover:bg-[#7f1d1d] text-white rounded-lg text-xs font-semibold shadow-md transition-all cursor-pointer"
              >
                Scan {activeFile?.name || 'File'} Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
