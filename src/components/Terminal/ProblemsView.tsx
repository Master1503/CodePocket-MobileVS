/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertCircle, AlertTriangle, Info, FileCode } from 'lucide-react';
import { ProblemItem, FileItem } from '../../types/vscode.ts';

interface ProblemsViewProps {
  problems: ProblemItem[];
  onSelectProblem: (filePath: string, line: number, column: number) => void;
}

export const ProblemsView: React.FC<ProblemsViewProps> = ({
  problems,
  onSelectProblem,
}) => {
  const errorCount = problems.filter((p) => p.severity === 'error').length;
  const warningCount = problems.filter((p) => p.severity === 'warning').length;
  const infoCount = problems.filter((p) => p.severity === 'info').length;

  return (
    <div className="flex flex-col h-full w-full bg-[#181818] text-[#cccccc] font-sans text-xs overflow-hidden select-text">
      {/* Problems Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#202020] border-b border-[#2d2d2d] shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-rose-400 font-medium">
            <AlertCircle size={13} />
            <span>{errorCount} Errors</span>
          </div>
          <div className="flex items-center gap-1 text-amber-400 font-medium">
            <AlertTriangle size={13} />
            <span>{warningCount} Warnings</span>
          </div>
          <div className="flex items-center gap-1 text-blue-400">
            <Info size={13} />
            <span>{infoCount} Infos</span>
          </div>
        </div>
      </div>

      {/* Problems List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#262626]">
        {problems.length === 0 ? (
          <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-950/40 text-emerald-400 flex items-center justify-center font-bold">
              ✓
            </div>
            <span>No problems have been detected in the workspace.</span>
          </div>
        ) : (
          problems.map((p) => (
            <div
              key={p.id}
              onClick={() => onSelectProblem(p.filePath, p.line, p.column)}
              className="flex items-start gap-2.5 px-3 py-2 hover:bg-[#252526] cursor-pointer transition-colors"
            >
              <div className="mt-0.5 shrink-0">
                {p.severity === 'error' ? (
                  <AlertCircle size={14} className="text-rose-400" />
                ) : p.severity === 'warning' ? (
                  <AlertTriangle size={14} className="text-amber-400" />
                ) : (
                  <Info size={14} className="text-blue-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-gray-200 font-medium">{p.message}</span>
                  <span className="text-[10px] text-gray-500 font-mono">[{p.source}]</span>
                </div>
                <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                  {p.filePath.split('/').pop()} [{p.line}, {p.column}]
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
