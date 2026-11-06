/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  GitBranch,
  GitCommit as GitCommitIcon,
  Check,
  Plus,
  Minus,
  RotateCcw,
  Sparkles,
  CloudUpload,
  History,
  ChevronDown,
  ChevronRight,
  GitPullRequest,
  CheckCircle2,
} from 'lucide-react';
import { FileItem, GitCommit } from '../../types/vscode.ts';
import { getFileIcon } from './ExplorerPanel.tsx';

interface SourceControlPanelProps {
  files: FileItem[];
  gitBranch: string;
  gitCommits: GitCommit[];
  onBranchChange: (branch: string) => void;
  onOpenFileDiff: (file: FileItem) => void;
  onStageFile: (fileId: string) => void;
  onUnstageFile: (fileId: string) => void;
  onStageAll: () => void;
  onUnstageAll: () => void;
  onDiscardChanges: (fileId: string) => void;
  onCommit: (message: string) => void;
  onPushToCloud: () => void;
  isSyncing: boolean;
}

export const SourceControlPanel: React.FC<SourceControlPanelProps> = ({
  files,
  gitBranch,
  gitCommits,
  onBranchChange,
  onOpenFileDiff,
  onStageFile,
  onUnstageFile,
  onStageAll,
  onUnstageAll,
  onDiscardChanges,
  onCommit,
  onPushToCloud,
  isSyncing,
}) => {
  const [commitMessage, setCommitMessage] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showBranchMenu, setShowBranchMenu] = useState(false);
  const [newBranchInput, setNewBranchInput] = useState('');

  // Collect modified and staged files
  const flatFiles: FileItem[] = [];
  function recurse(items: FileItem[]) {
    for (const item of items) {
      if (!item.isFolder) flatFiles.push(item);
      if (item.children) recurse(item.children);
    }
  }
  recurse(files);

  const stagedFiles = flatFiles.filter((f) => f.isStaged && f.isModified);
  const unstagedFiles = flatFiles.filter((f) => !f.isStaged && f.isModified);
  const totalModified = stagedFiles.length + unstagedFiles.length;

  const handleGenerateCommitMessage = () => {
    const changedNames = [...stagedFiles, ...unstagedFiles].map((f) => f.name);
    if (changedNames.length === 0) {
      setCommitMessage('chore: synchronize workspace state');
      return;
    }
    if (changedNames.some((n) => n.includes('gameEngine') || n.includes('calculator') || n.includes('algorithm'))) {
      setCommitMessage(`feat(core): refine algorithms and logic in ${changedNames[0]}`);
    } else if (changedNames.some((n) => n.endsWith('.html') || n.endsWith('.css'))) {
      setCommitMessage(`style(ui): improve responsive layout and touch interactions`);
    } else {
      setCommitMessage(`feat: update ${changedNames.slice(0, 2).join(', ')} and workspace config`);
    }
  };

  const handleCommitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commitMessage.trim()) return;
    onCommit(commitMessage.trim());
    setCommitMessage('');
  };

  const handleCreateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBranchInput.trim()) {
      onBranchChange(newBranchInput.trim());
      setNewBranchInput('');
      setShowBranchMenu(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#252526] text-[#cccccc] text-xs overflow-hidden select-none">
      {/* Source Control Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#3c3c3c]">
        <span className="uppercase text-[11px] font-bold tracking-wider text-gray-300">
          Source Control: Git
        </span>

        {/* Branch Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowBranchMenu(!showBranchMenu)}
            className="flex items-center gap-1 px-2 py-0.5 bg-[#333333] hover:bg-[#3e3e3e] text-red-300 hover:text-white rounded text-[11px] font-mono border border-[#444]"
          >
            <GitBranch size={12} />
            <span>{gitBranch}</span>
            <ChevronDown size={12} />
          </button>

          {showBranchMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-[#1f1f1f] border border-[#3c3c3c] rounded shadow-2xl py-1 z-30">
              <div className="px-2 py-1 text-[10px] text-gray-400 font-semibold uppercase">
                Switch Branch
              </div>
              {['main', 'feature/touch-nav', 'dev', 'release/1.0'].map((b) => (
                <div
                  key={b}
                  onClick={() => {
                    onBranchChange(b);
                    setShowBranchMenu(false);
                  }}
                  className={`px-3 py-1.5 hover:bg-[#2a2d2e] cursor-pointer flex items-center justify-between ${
                    gitBranch === b ? 'text-red-400 font-medium' : 'text-gray-300'
                  }`}
                >
                  <span className="truncate">{b}</span>
                  {gitBranch === b && <Check size={12} />}
                </div>
              ))}
              <div className="border-t border-[#333333] my-1" />
              <form onSubmit={handleCreateBranch} className="p-1.5">
                <input
                  type="text"
                  placeholder="+ New branch..."
                  value={newBranchInput}
                  onChange={(e) => setNewBranchInput(e.target.value)}
                  className="w-full bg-[#2a2d2e] text-white text-xs px-2 py-1 rounded border border-[#444] focus:outline-hidden"
                />
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Commit Input Area */}
      <div className="p-3 border-b border-[#3c3c3c] bg-[#1e1e1e]">
        <form onSubmit={handleCommitSubmit} className="flex flex-col gap-2">
          <div className="relative">
            <textarea
              placeholder="Commit message (Enter to commit, Ctrl+Enter to commit & push)..."
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              rows={2}
              className="w-full bg-[#252526] text-white text-xs p-2 rounded border border-[#3c3c3c] focus:border-[#991b1b] focus:outline-hidden resize-none font-mono"
            />
            <button
              type="button"
              onClick={handleGenerateCommitMessage}
              title="Generate AI Commit Message"
              className="absolute right-2 bottom-2 text-amber-400 hover:text-amber-300 p-1 hover:bg-[#333333] rounded"
            >
              <Sparkles size={14} />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="submit"
              disabled={totalModified === 0 || !commitMessage.trim()}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-[#991b1b] hover:bg-[#7f1d1d] disabled:bg-[#333333] disabled:text-gray-500 text-white rounded font-medium text-xs shadow-xs"
            >
              <Check size={14} />
              <span>Commit ({totalModified})</span>
            </button>

            <button
              type="button"
              onClick={onPushToCloud}
              disabled={isSyncing}
              title="Push changes to cloud"
              className="px-2.5 py-1.5 bg-[#2d3139] hover:bg-[#3e4451] text-red-300 hover:text-white rounded border border-[#3e4451]"
            >
              <CloudUpload size={14} className={isSyncing ? 'animate-bounce' : ''} />
            </button>
          </div>
        </form>
      </div>

      {/* Changes Accordion */}
      <div className="flex-1 overflow-y-auto">
        {/* Staged Changes Section */}
        {stagedFiles.length > 0 && (
          <div className="border-b border-[#2d2d2d]">
            <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#202020] text-gray-300">
              <span className="font-semibold text-[11px] uppercase tracking-wide">
                Staged Changes ({stagedFiles.length})
              </span>
              <button
                type="button"
                onClick={onUnstageAll}
                title="Unstage All Changes"
                className="p-1 hover:text-white text-gray-400"
              >
                <Minus size={13} />
              </button>
            </div>
            {stagedFiles.map((file) => (
              <div
                key={file.id}
                onClick={() => onOpenFileDiff(file)}
                className="group flex items-center justify-between px-3 py-1.5 hover:bg-[#2a2d2e] cursor-pointer text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  {getFileIcon(file.name, file.language)}
                  <span className="truncate text-white">{file.name}</span>
                  <span className="text-emerald-400 text-[10px] font-bold">M</span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUnstageFile(file.id);
                    }}
                    title="Unstage"
                    className="p-1 hover:text-white text-gray-400"
                  >
                    <Minus size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Unstaged Changes Section */}
        <div className="border-b border-[#2d2d2d]">
          <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#202020] text-gray-300">
            <span className="font-semibold text-[11px] uppercase tracking-wide">
              Changes ({unstagedFiles.length})
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onStageAll}
                title="Stage All Changes"
                className="p-1 hover:text-white text-gray-400"
              >
                <Plus size={13} />
              </button>
            </div>
          </div>

          {unstagedFiles.length === 0 && stagedFiles.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-xs">
              No changes in working tree
            </div>
          ) : (
            unstagedFiles.map((file) => (
              <div
                key={file.id}
                onClick={() => onOpenFileDiff(file)}
                className="group flex items-center justify-between px-3 py-1.5 hover:bg-[#2a2d2e] cursor-pointer text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  {getFileIcon(file.name, file.language)}
                  <span className="truncate text-gray-200 group-hover:text-white">{file.name}</span>
                  <span className="text-amber-400 text-[10px] font-bold">M</span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStageFile(file.id);
                    }}
                    title="Stage changes"
                    className="p-1 hover:text-white text-gray-400"
                  >
                    <Plus size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDiscardChanges(file.id);
                    }}
                    title="Discard changes"
                    className="p-1 hover:text-red-400 text-gray-400"
                  >
                    <RotateCcw size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Commit History Log Accordion */}
        <div className="border-b border-[#2d2d2d]">
          <div
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center justify-between px-2.5 py-1.5 bg-[#202020] hover:bg-[#2a2d2e] cursor-pointer text-gray-300"
          >
            <div className="flex items-center gap-1.5">
              {showHistory ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              <History size={13} className="text-red-400" />
              <span className="font-semibold text-[11px] uppercase tracking-wide">
                Commit History ({gitCommits.length})
              </span>
            </div>
          </div>

          {showHistory && (
            <div className="divide-y divide-[#2a2a2a] bg-[#1e1e1e]">
              {gitCommits.map((c) => (
                <div key={c.id} className="p-2.5 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-red-400 font-medium">{c.shortHash}</span>
                    <span className="text-gray-500">{c.timestamp}</span>
                  </div>
                  <div className="text-white font-medium my-1">{c.message}</div>
                  <div className="text-[10px] text-gray-400 truncate">{c.author}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
