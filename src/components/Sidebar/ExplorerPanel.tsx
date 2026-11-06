/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  FileCode,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  FilePlus,
  FolderPlus,
  RefreshCw,
  MoreVertical,
  Trash2,
  Edit2,
  FileText,
  FileJson,
  FileSpreadsheet,
  Search,
  X,
} from 'lucide-react';
import { FileItem, LanguageId } from '../../types/vscode.ts';

interface ExplorerPanelProps {
  files: FileItem[];
  activeFileId: string | null;
  onSelectFile: (file: FileItem) => void;
  onCreateFile: (name: string, isFolder: boolean) => void;
  onDeleteFile: (id: string) => void;
  onRenameFile: (id: string, newName: string) => void;
}

export const getFileIcon = (fileName: string, language: LanguageId) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js':
    case 'jsx':
    case 'mjs':
      return <span className="text-yellow-400 font-bold text-[11px] font-mono">JS</span>;
    case 'ts':
    case 'tsx':
      return <span className="text-blue-400 font-bold text-[11px] font-mono">TS</span>;
    case 'py':
      return <span className="text-emerald-400 font-bold text-[11px] font-mono">PY</span>;
    case 'html':
      return <span className="text-orange-400 font-bold text-[11px] font-mono">&lt;&gt;</span>;
    case 'css':
      return <span className="text-sky-400 font-bold text-[11px] font-mono">#</span>;
    case 'json':
      return <FileJson size={14} className="text-amber-300" />;
    case 'md':
      return <FileText size={14} className="text-blue-300" />;
    case 'sql':
      return <FileSpreadsheet size={14} className="text-pink-400" />;
    case 'rs':
      return <span className="text-orange-500 font-bold text-[11px] font-mono">RS</span>;
    case 'cpp':
    case 'c':
      return <span className="text-indigo-400 font-bold text-[11px] font-mono">C++</span>;
    default:
      return <FileCode size={14} className="text-gray-400" />;
  }
};

export const ExplorerPanel: React.FC<ExplorerPanelProps> = ({
  files,
  activeFileId,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  onRenameFile,
}) => {
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});
  const [filterText, setFilterText] = useState('');
  const [showNewInput, setShowNewInput] = useState<{ isFolder: boolean } | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const toggleFolder = (folderId: string) => {
    setCollapsedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemName.trim() && showNewInput) {
      onCreateFile(newItemName.trim(), showNewInput.isFolder);
      setNewItemName('');
      setShowNewInput(null);
    }
  };

  const handleRenameSubmit = (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (renameValue.trim()) {
      onRenameFile(id, renameValue.trim());
      setRenamingId(null);
      setRenameValue('');
    }
  };

  // Recursive tree filter
  const filterFileTree = (items: FileItem[], query: string): FileItem[] => {
    if (!query.trim()) return items;
    const lowerQuery = query.toLowerCase();

    const results: FileItem[] = [];

    for (const item of items) {
      if (item.isFolder) {
        const filteredChildren = item.children ? filterFileTree(item.children, query) : [];
        const folderMatches = item.name.toLowerCase().includes(lowerQuery);

        if (folderMatches) {
          // If folder matches, include folder with either filtered children or original children
          results.push({
            ...item,
            children: filteredChildren.length > 0 ? filteredChildren : item.children,
          });
        } else if (filteredChildren.length > 0) {
          // If folder doesn't match directly but has matching descendant files
          results.push({
            ...item,
            children: filteredChildren,
          });
        }
      } else {
        if (item.name.toLowerCase().includes(lowerQuery)) {
          results.push(item);
        }
      }
    }

    return results;
  };

  // Count matching files (excluding folder containers)
  const countMatchingFiles = (items: FileItem[]): number => {
    let count = 0;
    for (const item of items) {
      if (item.isFolder) {
        if (item.children) {
          count += countMatchingFiles(item.children);
        }
      } else {
        count += 1;
      }
    }
    return count;
  };

  const filteredTree = useMemo(() => {
    return filterFileTree(files, filterText);
  }, [files, filterText]);

  const matchCount = useMemo(() => {
    return countMatchingFiles(filteredTree);
  }, [filteredTree]);

  // Highlight matching substring in file/folder names
  const renderHighlightedName = (name: string, query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return <span>{name}</span>;

    const lowerName = name.toLowerCase();
    const lowerQuery = trimmed.toLowerCase();
    const idx = lowerName.indexOf(lowerQuery);

    if (idx === -1) return <span>{name}</span>;

    const before = name.substring(0, idx);
    const matched = name.substring(idx, idx + trimmed.length);
    const after = name.substring(idx + trimmed.length);

    return (
      <span className="truncate">
        {before}
        <span className="bg-[#991b1b] text-white font-medium px-0.5 rounded-xs">
          {matched}
        </span>
        {after}
      </span>
    );
  };

  const renderFileTree = (items: FileItem[], depth = 0) => {
    return items.map((item) => {
      const isFolder = item.isFolder;
      // When searching with active query, auto-expand folders that contain matches
      const isCollapsed = filterText.trim() ? false : !!collapsedFolders[item.id];
      const isActive = activeFileId === item.id;

      if (isFolder) {
        return (
          <div key={item.id} className="w-full">
            <div
              onClick={() => toggleFolder(item.id)}
              className="group flex items-center justify-between px-2 py-1.5 hover:bg-[#2a2d2e] cursor-pointer rounded-xs text-xs select-none transition-colors"
              style={{ paddingLeft: `${depth * 14 + 8}px` }}
            >
              <div className="flex items-center gap-1.5 text-gray-300 group-hover:text-white truncate">
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                {isCollapsed ? (
                  <Folder size={14} className="text-amber-400 shrink-0" />
                ) : (
                  <FolderOpen size={14} className="text-amber-400 shrink-0" />
                )}
                <span className="font-medium truncate">
                  {renderHighlightedName(item.name, filterText)}
                </span>
              </div>
            </div>

            {!isCollapsed && item.children && (
              <div>{renderFileTree(item.children, depth + 1)}</div>
            )}
          </div>
        );
      }

      const isRenaming = renamingId === item.id;

      return (
        <div
          key={item.id}
          className={`group flex items-center justify-between px-2 py-1.5 text-xs select-none cursor-pointer rounded-xs transition-colors ${
            isActive ? 'bg-[#37373d] text-white font-medium' : 'text-gray-300 hover:bg-[#2a2d2e] hover:text-white'
          }`}
          style={{ paddingLeft: `${depth * 14 + 16}px` }}
          onClick={() => !isRenaming && onSelectFile(item)}
        >
          {isRenaming ? (
            <form onSubmit={(e) => handleRenameSubmit(item.id, e)} className="flex-1 mr-2">
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                autoFocus
                onBlur={() => setRenamingId(null)}
                className="w-full bg-[#1e1e1e] text-white text-xs px-1.5 py-0.5 border border-[#991b1b] rounded focus:outline-hidden"
              />
            </form>
          ) : (
            <div className="flex items-center gap-2 truncate min-w-0">
              {getFileIcon(item.name, item.language)}
              <span className="truncate">{renderHighlightedName(item.name, filterText)}</span>
              {item.isModified && (
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" title="Unsaved changes" />
              )}
            </div>
          )}

          {/* Hover / Touch Action Menu */}
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setRenamingId(item.id);
                setRenameValue(item.name);
              }}
              title="Rename"
              className="p-1 hover:text-white text-gray-400 rounded"
            >
              <Edit2 size={12} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteFile(item.id);
              }}
              title="Delete"
              className="p-1 hover:text-red-400 text-gray-400 rounded"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#252526] text-[#cccccc] text-xs overflow-hidden select-none">
      {/* Explorer Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#3c3c3c] shrink-0">
        <span className="uppercase text-[11px] font-bold tracking-wider text-gray-300">
          Explorer: Workspace
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowNewInput({ isFolder: false })}
            title="New File"
            className="p-1 hover:bg-[#333333] hover:text-white text-gray-400 rounded transition-colors"
          >
            <FilePlus size={14} />
          </button>
          <button
            type="button"
            onClick={() => setShowNewInput({ isFolder: true })}
            title="New Folder"
            className="p-1 hover:bg-[#333333] hover:text-white text-gray-400 rounded transition-colors"
          >
            <FolderPlus size={14} />
          </button>
        </div>
      </div>

      {/* Real-Time Filter Input Field */}
      <div className="px-2.5 py-1.5 border-b border-[#333333] bg-[#1e1e1e]/60 shrink-0">
        <div className="relative flex items-center">
          <Search size={13} className="absolute left-2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setFilterText('');
              }
            }}
            placeholder="Filter files by name..."
            aria-label="Filter files by name"
            className="w-full bg-[#1e1e1e] text-gray-200 placeholder-gray-500 text-xs pl-7 pr-7 py-1 rounded border border-[#3c3c3c] focus:border-[#991b1b] focus:outline-hidden transition-colors"
          />
          {filterText && (
            <button
              type="button"
              onClick={() => setFilterText('')}
              title="Clear filter (Esc)"
              className="absolute right-2 p-0.5 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filter Match Count / Active Notice */}
        {filterText.trim() && (
          <div className="flex items-center justify-between mt-1 px-1 text-[10px] text-gray-400">
            <span>
              {matchCount === 0
                ? 'No files matched'
                : `${matchCount} file${matchCount === 1 ? '' : 's'} found`}
            </span>
            <button
              type="button"
              onClick={() => setFilterText('')}
              className="text-[#f87171] hover:underline cursor-pointer"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      {/* New file/folder input inline form */}
      {showNewInput && (
        <form onSubmit={handleCreateSubmit} className="p-2 bg-[#1e1e1e] border-b border-[#3c3c3c] shrink-0">
          <div className="flex items-center gap-2">
            {showNewInput.isFolder ? (
              <Folder size={14} className="text-amber-400 shrink-0" />
            ) : (
              <FileCode size={14} className="text-blue-400 shrink-0" />
            )}
            <input
              type="text"
              placeholder={showNewInput.isFolder ? 'folder name...' : 'filename.ext...'}
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              autoFocus
              className="flex-1 bg-[#252526] text-white text-xs px-2 py-1 rounded border border-[#991b1b] focus:outline-hidden"
            />
          </div>
          <div className="flex justify-end gap-1.5 mt-2">
            <button
              type="button"
              onClick={() => setShowNewInput(null)}
              className="px-2 py-0.5 text-[11px] bg-[#333333] hover:bg-[#444444] rounded text-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-2 py-0.5 text-[11px] bg-[#991b1b] hover:bg-[#7f1d1d] text-white rounded font-medium"
            >
              Create
            </button>
          </div>
        </form>
      )}

      {/* File Tree List or Empty State */}
      <div className="flex-1 overflow-y-auto py-1">
        {filteredTree.length > 0 ? (
          renderFileTree(filteredTree)
        ) : filterText.trim() ? (
          <div className="flex flex-col items-center justify-center p-6 text-center text-gray-400 h-40">
            <Search size={22} className="text-gray-500 mb-2 opacity-60" />
            <span className="text-xs font-semibold text-gray-200">No matching files</span>
            <span className="text-[11px] text-gray-400 mt-0.5 max-w-[180px] truncate">
              "{filterText}"
            </span>
            <button
              type="button"
              onClick={() => setFilterText('')}
              className="mt-3 px-2.5 py-1 text-[11px] bg-[#991b1b] hover:bg-[#7f1d1d] text-white rounded transition-colors font-medium cursor-pointer"
            >
              Clear Filter
            </button>
          </div>
        ) : (
          <div className="p-4 text-center text-xs text-gray-400">
            No files in workspace
          </div>
        )}
      </div>
    </div>
  );
};
