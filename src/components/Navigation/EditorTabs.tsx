/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  X,
  Play,
  Columns,
  Globe,
  MoreVertical,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { TabItem } from '../../types/vscode.ts';
import { getFileIcon } from '../Sidebar/ExplorerPanel.tsx';

interface EditorTabsProps {
  tabs: TabItem[];
  activeTabId: string | null;
  onSelectTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onRunActiveFile: () => void;
  onOpenLivePreview?: () => void;
  onOpenMarkdownPreview?: () => void;
  onSplitEditor?: () => void;
  isSplit: boolean;
  onOpenAIChecker?: () => void;
  aiIssueCount?: number;
}

export const EditorTabs: React.FC<EditorTabsProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onRunActiveFile,
  onOpenLivePreview,
  onOpenMarkdownPreview,
  onSplitEditor,
  isSplit,
  onOpenAIChecker,
  aiIssueCount,
}) => {
  const activeTab = tabs.find((t) => t.id === activeTabId);

  return (
    <div className="flex items-center justify-between bg-[#252526] border-b border-[#1e1e1e] select-none shrink-0 h-9 overflow-hidden">
      {/* Scrollable Tabs */}
      <div className="flex items-center h-full overflow-x-auto scrollbar-none flex-1">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`group flex items-center gap-2 px-3 h-full cursor-pointer text-xs border-r border-[#1e1e1e] transition-colors shrink-0 max-w-44 ${
                isActive
                  ? 'bg-[#1e1e1e] text-white font-medium border-t-2 border-t-[#991b1b]'
                  : 'bg-[#2d2d2d] text-gray-400 hover:text-gray-200 hover:bg-[#282828]'
              }`}
            >
              {/* File Icon */}
              <div className="shrink-0">{getFileIcon(tab.title, tab.language)}</div>

              {/* Title */}
              <span className="truncate">{tab.title}</span>

              {/* Status: Modified Dot or Close Button */}
              <div className="flex items-center shrink-0 ml-1">
                {tab.isModified && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 group-hover:hidden" />
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tab.id);
                  }}
                  className={`p-0.5 rounded text-gray-400 hover:text-white hover:bg-[#3e3e3e] ${
                    tab.isModified ? 'hidden group-hover:block' : 'opacity-70 group-hover:opacity-100'
                  }`}
                  title="Close tab (Ctrl+W)"
                >
                  <X size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Editor Actions Toolbar */}
      <div className="flex items-center gap-1.5 px-2 shrink-0 bg-[#252526]">
        {/* AI Code Checker button */}
        {onOpenAIChecker && (
          <button
            type="button"
            onClick={onOpenAIChecker}
            title="Check Code with Gemini AI"
            className="flex items-center gap-1 px-2 py-1 bg-[#991b1b]/30 hover:bg-[#991b1b]/50 text-red-200 hover:text-white rounded text-[11px] font-medium border border-[#991b1b]/50 transition-all cursor-pointer shadow-xs"
          >
            <Sparkles size={12} className="text-red-400" />
            <span className="hidden sm:inline">AI Check</span>
            {typeof aiIssueCount === 'number' && aiIssueCount > 0 && (
              <span className="bg-[#991b1b] text-white text-[9px] px-1 rounded-full font-bold">
                {aiIssueCount}
              </span>
            )}
          </button>
        )}

        {/* Run active file button */}
        <button
          type="button"
          onClick={onRunActiveFile}
          title="Run Code in Terminal"
          className="flex items-center gap-1 px-2 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 rounded text-[11px] font-medium border border-emerald-500/30 cursor-pointer"
        >
          <Play size={12} fill="currentColor" />
          <span className="hidden sm:inline">Run</span>
        </button>

        {/* Live Preview Button for Web projects */}
        {onOpenLivePreview && (
          <button
            type="button"
            onClick={onOpenLivePreview}
            title="Open Live Web Preview"
            className="flex items-center gap-1 p-1 hover:bg-[#333333] text-blue-400 hover:text-blue-300 rounded text-xs"
          >
            <Globe size={15} />
          </button>
        )}

        {/* Markdown Preview Button */}
        {activeTab?.title.endsWith('.md') && onOpenMarkdownPreview && (
          <button
            type="button"
            onClick={onOpenMarkdownPreview}
            title="Open Markdown Preview"
            className="p-1 hover:bg-[#333333] text-purple-400 hover:text-purple-300 rounded text-xs"
          >
            <BookOpen size={15} />
          </button>
        )}

        {/* Split Editor */}
        {onSplitEditor && (
          <button
            type="button"
            onClick={onSplitEditor}
            title={isSplit ? 'Single Editor' : 'Split Editor Right'}
            className={`p-1 hover:bg-[#333333] rounded text-xs ${isSplit ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}
          >
            <Columns size={15} />
          </button>
        )}
      </div>
    </div>
  );
};
