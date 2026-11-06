/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  Command,
  FileCode,
  Terminal,
  Play,
  RotateCcw,
  Sparkles,
  GitBranch,
  Settings,
  Palette,
  Cloud,
  X,
  FileText,
} from 'lucide-react';
import { FileItem } from '../../types/vscode.ts';
import { getFileIcon } from '../Sidebar/ExplorerPanel.tsx';

export interface CommandItem {
  id: string;
  category: string;
  title: string;
  shortcut?: string;
  icon: React.ReactNode;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  files: FileItem[];
  onOpenFile: (file: FileItem) => void;
  commands: CommandItem[];
  initialMode?: 'command' | 'file';
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  files,
  onOpenFile,
  commands,
  initialMode = 'command',
}) => {
  const [query, setQuery] = useState(initialMode === 'command' ? '>' : '');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Flatten files list
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

  const isCommandMode = query.startsWith('>');

  // Filtered items
  const filteredCommands = useMemo(() => {
    if (!isCommandMode) return [];
    const searchPart = query.substring(1).trim().toLowerCase();
    if (!searchPart) return commands;
    return commands.filter(
      (c) =>
        c.title.toLowerCase().includes(searchPart) ||
        c.category.toLowerCase().includes(searchPart)
    );
  }, [isCommandMode, query, commands]);

  const filteredFiles = useMemo(() => {
    if (isCommandMode) return [];
    const searchPart = query.trim().toLowerCase();
    if (!searchPart) return flatFiles;
    return flatFiles.filter(
      (f) =>
        f.name.toLowerCase().includes(searchPart) ||
        f.path.toLowerCase().includes(searchPart)
    );
  }, [isCommandMode, query, flatFiles]);

  useEffect(() => {
    if (isOpen) {
      setQuery(initialMode === 'command' ? '>' : '');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, initialMode]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  const totalResults = isCommandMode ? filteredCommands.length : filteredFiles.length;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, totalResults));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + totalResults) % Math.max(1, totalResults));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isCommandMode && filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
        onClose();
      } else if (!isCommandMode && filteredFiles[selectedIndex]) {
        onOpenFile(filteredFiles[selectedIndex]);
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-start justify-center pt-8 px-3"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[#252526] border border-[#3c3c3c] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh] text-xs font-sans animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center gap-2 px-3 py-2.5 bg-[#1f1f1f] border-b border-[#3c3c3c]">
          <Command size={16} className="text-red-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isCommandMode
                ? 'Type a command to run...'
                : 'Type file name to open (or > for commands)...'
            }
            className="flex-1 bg-transparent text-white text-sm focus:outline-hidden font-mono"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-[#333333] text-gray-400 hover:text-white rounded"
          >
            <X size={15} />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto py-1 divide-y divide-[#2a2a2a]">
          {isCommandMode ? (
            filteredCommands.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No matching commands found</div>
            ) : (
              filteredCommands.map((cmd, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={cmd.id}
                    onClick={() => {
                      cmd.action();
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#991b1b] text-white' : 'text-gray-300 hover:bg-[#2a2d2e]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="text-gray-400 shrink-0">{cmd.icon}</div>
                      <span className="text-[11px] text-gray-400 shrink-0">{cmd.category}:</span>
                      <span className="font-medium text-white truncate">{cmd.title}</span>
                    </div>

                    {cmd.shortcut && (
                      <span className="text-[10px] font-mono bg-[#1e1e1e] text-red-300 px-1.5 py-0.5 rounded border border-[#3e4451] shrink-0 ml-2">
                        {cmd.shortcut}
                      </span>
                    )}
                  </div>
                );
              })
            )
          ) : filteredFiles.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No matching files found</div>
          ) : (
            filteredFiles.map((file, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={file.id}
                  onClick={() => {
                    onOpenFile(file);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#991b1b] text-white' : 'text-gray-300 hover:bg-[#2a2d2e]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {getFileIcon(file.name, file.language)}
                    <span className="font-medium text-white truncate">{file.name}</span>
                    <span className="text-[10px] text-gray-500 truncate">{file.path}</span>
                  </div>

                  <span className="text-[10px] text-gray-500 uppercase font-mono">{file.language}</span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Hint */}
        <div className="px-3 py-1.5 bg-[#1a1a1a] border-t border-[#333333] flex items-center justify-between text-[10px] text-gray-500">
          <span>Tip: Prefix with &gt; to run commands, or type file name directly</span>
          <span className="font-mono">ESC to cancel</span>
        </div>
      </div>
    </div>
  );
};
