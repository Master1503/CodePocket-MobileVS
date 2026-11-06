/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  Replace,
  ChevronDown,
  ChevronRight,
  FileText,
  X,
  ChevronsUpDown,
} from 'lucide-react';
import { FileItem } from '../../types/vscode.ts';

interface SearchPanelProps {
  files: FileItem[];
  onSelectMatch: (file: FileItem, lineNumber: number) => void;
  onReplaceInFile?: (fileId: string, searchRegex: RegExp, newText: string) => void;
  onReplaceAllInWorkspace?: (searchRegex: RegExp, newText: string) => void;
}

interface SearchMatch {
  line: number;
  text: string;
  matchStart: number;
  matchLength: number;
}

interface SearchResult {
  file: FileItem;
  matches: SearchMatch[];
}

export const SearchPanel: React.FC<SearchPanelProps> = ({
  files,
  onSelectMatch,
  onReplaceInFile,
  onReplaceAllInWorkspace,
}) => {
  const [query, setQuery] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [showReplace, setShowReplace] = useState(true);
  const [collapsedFiles, setCollapsedFiles] = useState<Record<string, boolean>>({});

  // Flatten all files
  const flatFiles = useMemo(() => {
    const list: FileItem[] = [];
    function recurse(items: FileItem[]) {
      for (const item of items) {
        if (!item.isFolder) list.push(item);
        if (item.children) recurse(item.children);
      }
    }
    recurse(files);
    return list;
  }, [files]);

  // Execute Global Search across all project files
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const searchResults: SearchResult[] = [];

    let regex: RegExp | null = null;
    if (useRegex || wholeWord) {
      try {
        const pattern = useRegex
          ? query
          : `\\b${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`;
        regex = new RegExp(pattern, matchCase ? 'g' : 'gi');
      } catch {
        return [];
      }
    }

    for (const file of flatFiles) {
      const lines = file.content.split('\n');
      const fileMatches: SearchMatch[] = [];

      lines.forEach((lineText, idx) => {
        const trimmed = lineText.trim();
        const leadingSpaces = lineText.length - lineText.trimStart().length;

        if (regex) {
          regex.lastIndex = 0;
          let m: RegExpExecArray | null;
          while ((m = regex.exec(lineText)) !== null) {
            if (m[0].length === 0) {
              regex.lastIndex++;
              continue;
            }
            const relStart = Math.max(0, m.index - leadingSpaces);
            fileMatches.push({
              line: idx + 1,
              text: trimmed,
              matchStart: relStart,
              matchLength: m[0].length,
            });
          }
        } else {
          const hay = matchCase ? lineText : lineText.toLowerCase();
          const needle = matchCase ? query : query.toLowerCase();

          let pos = 0;
          while ((pos = hay.indexOf(needle, pos)) !== -1) {
            const relStart = Math.max(0, pos - leadingSpaces);
            fileMatches.push({
              line: idx + 1,
              text: trimmed,
              matchStart: relStart,
              matchLength: needle.length,
            });
            pos += needle.length;
          }
        }
      });

      if (fileMatches.length > 0) {
        searchResults.push({
          file,
          matches: fileMatches,
        });
      }
    }

    return searchResults;
  }, [flatFiles, query, matchCase, wholeWord, useRegex]);

  const totalMatches = results.reduce((sum, r) => sum + r.matches.length, 0);

  const toggleCollapse = (fileId: string) => {
    setCollapsedFiles((prev) => ({
      ...prev,
      [fileId]: !prev[fileId],
    }));
  };

  const toggleCollapseAll = () => {
    const allCollapsed = results.every((r) => collapsedFiles[r.file.id]);
    if (allCollapsed) {
      setCollapsedFiles({});
    } else {
      const next: Record<string, boolean> = {};
      results.forEach((r) => {
        next[r.file.id] = true;
      });
      setCollapsedFiles(next);
    }
  };

  const buildReplaceRegex = (): RegExp | null => {
    if (!query) return null;
    try {
      const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = useRegex ? query : wholeWord ? `\\b${escaped}\\b` : escaped;
      return new RegExp(pattern, matchCase ? 'g' : 'gi');
    } catch {
      return null;
    }
  };

  const handleReplaceAllInFile = (file: FileItem) => {
    const rx = buildReplaceRegex();
    if (!rx || !onReplaceInFile) return;
    onReplaceInFile(file.id, rx, replaceText);
  };

  const handleReplaceAllWorkspace = () => {
    const rx = buildReplaceRegex();
    if (!rx || !onReplaceAllInWorkspace) return;
    onReplaceAllInWorkspace(rx, replaceText);
  };

  const renderHighlightedLine = (m: SearchMatch) => {
    const before = m.text.slice(0, m.matchStart);
    const matched = m.text.slice(m.matchStart, m.matchStart + m.matchLength);
    const after = m.text.slice(m.matchStart + m.matchLength);

    return (
      <span className="truncate group-hover:text-white">
        {before}
        <span className="bg-[#991b1b] text-white font-semibold px-0.5 rounded-xs">
          {matched}
        </span>
        {after}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#252526] text-[#cccccc] text-xs overflow-hidden select-none">
      {/* Search Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#3c3c3c]">
        <span className="uppercase text-[11px] font-bold tracking-wider text-gray-300">
          Global Search
        </span>
        <div className="flex items-center gap-1">
          {results.length > 0 && (
            <button
              type="button"
              onClick={toggleCollapseAll}
              className="p-1 rounded text-gray-400 hover:text-white hover:bg-[#333333]"
              title="Collapse / Expand All"
            >
              <ChevronsUpDown size={14} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowReplace(!showReplace)}
            className={`p-1 rounded ${showReplace ? 'bg-[#333333] text-red-400' : 'text-gray-400 hover:text-white'}`}
            title="Toggle Replace"
          >
            <Replace size={14} />
          </button>
        </div>
      </div>

      {/* Inputs Bar */}
      <div className="p-3 border-b border-[#3c3c3c] flex flex-col gap-2 bg-[#1f1f1f]">
        <div className="flex items-center gap-1 bg-[#252526] border border-[#3c3c3c] focus-within:border-[#991b1b] rounded px-2 py-1 transition-colors">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search across all files..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setQuery('');
            }}
            className="flex-1 bg-transparent text-white text-xs focus:outline-hidden min-w-0"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-0.5 text-gray-400 hover:text-white"
              title="Clear Search"
            >
              <X size={12} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setMatchCase(!matchCase)}
            className={`px-1 py-0.5 rounded text-[10px] font-mono ${matchCase ? 'bg-[#991b1b] text-white' : 'text-gray-400 hover:text-white'}`}
            title="Match Case (Aa)"
          >
            Aa
          </button>
          <button
            type="button"
            onClick={() => setWholeWord(!wholeWord)}
            className={`px-1 py-0.5 rounded text-[10px] font-mono ${wholeWord ? 'bg-[#991b1b] text-white' : 'text-gray-400 hover:text-white'}`}
            title="Match Whole Word"
          >
            ab
          </button>
          <button
            type="button"
            onClick={() => setUseRegex(!useRegex)}
            className={`px-1 py-0.5 rounded text-[10px] font-mono ${useRegex ? 'bg-[#991b1b] text-white' : 'text-gray-400 hover:text-white'}`}
            title="Use Regular Expression"
          >
            .*
          </button>
        </div>

        {showReplace && (
          <div className="flex items-center gap-1.5">
            <div className="flex-1 flex items-center gap-1.5 bg-[#252526] border border-[#3c3c3c] focus-within:border-[#991b1b] rounded px-2 py-1 transition-colors min-w-0">
              <Replace size={14} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Replace with..."
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                className="flex-1 bg-transparent text-white text-xs focus:outline-hidden min-w-0"
              />
            </div>
            {onReplaceAllInWorkspace && (
              <button
                type="button"
                onClick={handleReplaceAllWorkspace}
                disabled={!query.trim() || totalMatches === 0}
                title="Replace All Across Workspace"
                className="px-2 py-1 bg-[#991b1b] hover:bg-[#7f1d1d] disabled:opacity-40 text-white rounded text-[11px] font-semibold shrink-0 transition-colors cursor-pointer"
              >
                Replace All
              </button>
            )}
          </div>
        )}

        {query.trim() && (
          <div className="text-[11px] text-gray-400">
            {totalMatches} result{totalMatches === 1 ? '' : 's'} in {results.length} file{results.length === 1 ? '' : 's'}
          </div>
        )}
      </div>

      {/* Results Summary List */}
      <div className="flex-1 overflow-y-auto py-1">
        {query.trim() && results.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center text-gray-400">
            <Search size={20} className="text-gray-500 mb-2 opacity-60" />
            <span className="text-xs font-medium text-gray-300">No results found</span>
            <span className="text-[11px] text-gray-500 mt-0.5">
              No matches for "{query}" across {flatFiles.length} files
            </span>
          </div>
        ) : (
          results.map(({ file, matches }) => {
            const isCollapsed = collapsedFiles[file.id];
            return (
              <div key={file.id} className="border-b border-[#2d2d2d]">
                <div
                  onClick={() => toggleCollapse(file.id)}
                  className="flex items-center justify-between px-2.5 py-1.5 bg-[#202020] hover:bg-[#2a2d2e] cursor-pointer text-gray-300"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                    <FileText size={13} className="text-red-400 shrink-0" />
                    <span className="font-medium text-white truncate">{file.name}</span>
                    <span className="text-[10px] text-gray-400 truncate">{file.path}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="bg-[#333333] text-gray-300 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                      {matches.length}
                    </span>
                    {showReplace && onReplaceInFile && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReplaceAllInFile(file);
                        }}
                        className="text-[10px] bg-[#991b1b] hover:bg-[#7f1d1d] text-white px-1.5 py-0.5 rounded ml-1"
                      >
                        Replace All
                      </button>
                    )}
                  </div>
                </div>

                {!isCollapsed && (
                  <div className="py-0.5 bg-[#1e1e1e]">
                    {matches.map((m, mIdx) => (
                      <div
                        key={mIdx}
                        onClick={() => onSelectMatch(file, m.line)}
                        className="px-6 py-1 hover:bg-[#2a2d2e] cursor-pointer text-[11px] font-mono text-gray-300 flex items-center gap-2 group"
                      >
                        <span className="text-gray-500 w-6 text-right select-none shrink-0">{m.line}:</span>
                        {renderHighlightedLine(m)}
                      </div>
                    ))}
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
