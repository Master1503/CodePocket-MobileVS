/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Columns, AlignJustify, Check, RotateCcw, ArrowRight } from 'lucide-react';
import { FileItem } from '../../types/vscode.ts';

interface DiffViewerProps {
  file: FileItem;
  onStageFile?: (fileId: string) => void;
  onDiscardChanges?: (fileId: string) => void;
  onClose?: () => void;
}

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  oldLineNumber?: number;
  newLineNumber?: number;
  text: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  file,
  onStageFile,
  onDiscardChanges,
  onClose,
}) => {
  const [isSideBySide, setIsSideBySide] = useState(false); // Mobile defaults to inline diff

  const originalLines = useMemo(
    () => (file.originalContent || '').split('\n'),
    [file.originalContent]
  );
  const currentLines = useMemo(() => file.content.split('\n'), [file.content]);

  // Compute unified diff lines
  const diffLines = useMemo(() => {
    const lines: DiffLine[] = [];
    const maxLen = Math.max(originalLines.length, currentLines.length);

    let oldIdx = 0;
    let newIdx = 0;

    while (oldIdx < originalLines.length || newIdx < currentLines.length) {
      const oldLine = originalLines[oldIdx];
      const newLine = currentLines[newIdx];

      if (oldLine === newLine) {
        lines.push({
          type: 'unchanged',
          oldLineNumber: oldIdx + 1,
          newLineNumber: newIdx + 1,
          text: oldLine ?? '',
        });
        oldIdx++;
        newIdx++;
      } else if (oldLine !== undefined && (newLine === undefined || !currentLines.slice(newIdx, newIdx + 3).includes(oldLine))) {
        lines.push({
          type: 'removed',
          oldLineNumber: oldIdx + 1,
          text: oldLine,
        });
        oldIdx++;
      } else if (newLine !== undefined) {
        lines.push({
          type: 'added',
          newLineNumber: newIdx + 1,
          text: newLine,
        });
        newIdx++;
      } else {
        oldIdx++;
        newIdx++;
      }
    }

    return lines;
  }, [originalLines, currentLines]);

  const addedCount = diffLines.filter((l) => l.type === 'added').length;
  const removedCount = diffLines.filter((l) => l.type === 'removed').length;

  return (
    <div className="flex flex-col flex-1 h-full w-full bg-[#1e1e1e] text-[#cccccc] font-mono text-xs overflow-hidden select-text">
      {/* Diff Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#252526] border-b border-[#3c3c3c] shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">{file.name}</span>
          <span className="text-gray-400 text-[11px]">(Working Tree Diff)</span>
          <div className="flex items-center gap-1.5 text-[11px] font-sans">
            <span className="text-emerald-400 font-medium">+{addedCount}</span>
            <span className="text-rose-400 font-medium">-{removedCount}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Toggle inline / side-by-side */}
          <button
            type="button"
            onClick={() => setIsSideBySide(!isSideBySide)}
            className="hidden sm:flex items-center gap-1 px-2 py-1 bg-[#333333] hover:bg-[#444444] rounded text-gray-200 text-[11px]"
            title={isSideBySide ? 'Switch to Inline View' : 'Switch to Side-by-Side View'}
          >
            {isSideBySide ? <AlignJustify size={13} /> : <Columns size={13} />}
            <span>{isSideBySide ? 'Inline' : 'Side-by-Side'}</span>
          </button>

          {/* Stage button */}
          {onStageFile && (
            <button
              type="button"
              onClick={() => onStageFile(file.id)}
              className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-medium"
            >
              <Check size={13} />
              <span>Stage Changes</span>
            </button>
          )}

          {/* Discard button */}
          {onDiscardChanges && (
            <button
              type="button"
              onClick={() => onDiscardChanges(file.id)}
              className="flex items-center gap-1 px-2 py-1 bg-rose-900/50 hover:bg-rose-900 text-rose-200 rounded text-[11px]"
              title="Discard all changes in this file"
            >
              <RotateCcw size={13} />
              <span className="hidden sm:inline">Discard</span>
            </button>
          )}
        </div>
      </div>

      {/* Diff Content View */}
      <div className="flex-1 overflow-auto py-2">
        {diffLines.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No changes detected between working tree and HEAD.
          </div>
        ) : (
          <div className="w-full">
            {diffLines.map((line, idx) => {
              let bg = 'transparent';
              let sign = ' ';
              let signColor = 'text-gray-500';

              if (line.type === 'added') {
                bg = 'rgba(46, 160, 67, 0.18)';
                sign = '+';
                signColor = 'text-emerald-400 font-bold';
              } else if (line.type === 'removed') {
                bg = 'rgba(248, 81, 73, 0.18)';
                sign = '-';
                signColor = 'text-rose-400 font-bold';
              }

              return (
                <div
                  key={idx}
                  className="flex items-stretch hover:bg-[#2a2d2e] transition-colors leading-5"
                  style={{ backgroundColor: bg }}
                >
                  {/* Line numbers column */}
                  <div className="w-10 px-1 text-right text-gray-500 select-none bg-[#1e1e1e] border-r border-[#2d2d2d] shrink-0 text-[11px]">
                    {line.oldLineNumber || ''}
                  </div>
                  <div className="w-10 px-1 text-right text-gray-500 select-none bg-[#1e1e1e] border-r border-[#2d2d2d] shrink-0 text-[11px]">
                    {line.newLineNumber || ''}
                  </div>

                  {/* Sign +/- */}
                  <div className={`w-6 text-center select-none shrink-0 ${signColor}`}>
                    {sign}
                  </div>

                  {/* Code Line text */}
                  <div className="flex-1 px-2 whitespace-pre overflow-x-auto">
                    {line.text}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
