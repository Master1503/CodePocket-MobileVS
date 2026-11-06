/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Terminal as TerminalIcon,
  Plus,
  Trash2,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
  Sparkles,
} from 'lucide-react';
import { TerminalTab, TerminalLine, FileItem, GitCommit } from '../../types/vscode.ts';
import { executeTerminalCommand, CommandContext } from '../../services/terminalEngine.ts';

interface TerminalViewProps {
  files: FileItem[];
  gitBranch: string;
  gitCommits: GitCommit[];
  onFileCreate?: (name: string, content: string) => void;
  onFileDelete?: (path: string) => void;
  onCommit?: (message: string) => void;
  onBranchChange?: (branch: string) => void;
}

export const TerminalView: React.FC<TerminalViewProps> = ({
  files,
  gitBranch,
  gitCommits,
  onFileCreate,
  onFileDelete,
  onCommit,
  onBranchChange,
}) => {
  const [tabs, setTabs] = useState<TerminalTab[]>([
    {
      id: 'term-1',
      title: '1: bash',
      lines: [
        {
          id: 'l-0',
          type: 'info',
          text: 'CodePocket Mobile Linux Shell [Node.js v20.11 / Python 3.12 / Git 2.44]',
        },
        {
          id: 'l-1',
          type: 'output',
          text: 'Type \'help\' to see supported commands, or tap quick action chips below.',
        },
      ],
      history: [],
      historyIndex: -1,
      workingDir: '/workspace',
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('term-1');
  const [inputVal, setInputVal] = useState('');
  const [draftInput, setDraftInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeTab?.lines]);

  const handleRunCommand = (cmdText: string) => {
    if (!cmdText.trim()) return;

    const cmdLine: TerminalLine = {
      id: 'inp-' + Math.random().toString(36).substring(2, 9),
      type: 'input',
      text: `$ ${cmdText}`,
      timestamp: new Date().toLocaleTimeString(),
    };

    const ctx: CommandContext = {
      files,
      workingDir: activeTab.workingDir,
      gitBranch,
      gitCommits,
      onFileCreate,
      onFileDelete,
      onCommit,
      onBranchChange,
      onClear: () => {
        setTabs((prev) =>
          prev.map((t) => (t.id === activeTabId ? { ...t, lines: [] } : t))
        );
      },
    };

    const outputLines = executeTerminalCommand(cmdText, ctx);

    setTabs((prev) =>
      prev.map((t) => {
        if (t.id === activeTabId) {
          const nextLines =
            cmdText.trim() === 'clear' || cmdText.trim() === 'cls'
              ? []
              : [...t.lines, cmdLine, ...outputLines];
          return {
            ...t,
            lines: nextLines,
            history: [cmdText, ...t.history.filter((h) => h !== cmdText)],
            historyIndex: -1,
          };
        }
        return t;
      })
    );

    setInputVal('');
    setDraftInput('');
  };

  const navigateHistory = (direction: 'up' | 'down') => {
    if (direction === 'up') {
      if (activeTab.history.length === 0) return;
      if (activeTab.historyIndex === -1) {
        setDraftInput(inputVal);
      }
      const nextIdx = Math.min(activeTab.history.length - 1, activeTab.historyIndex + 1);
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTabId ? { ...t, historyIndex: nextIdx } : t))
      );
      setInputVal(activeTab.history[nextIdx] || '');
    } else {
      if (activeTab.historyIndex > 0) {
        const nextIdx = activeTab.historyIndex - 1;
        setTabs((prev) =>
          prev.map((t) => (t.id === activeTabId ? { ...t, historyIndex: nextIdx } : t))
        );
        setInputVal(activeTab.history[nextIdx] || '');
      } else if (activeTab.historyIndex === 0) {
        setTabs((prev) =>
          prev.map((t) => (t.id === activeTabId ? { ...t, historyIndex: -1 } : t))
        );
        setInputVal(draftInput);
      }
    }
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleRunCommand(inputVal);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      navigateHistory('up');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      navigateHistory('down');
    }
  };

  const addTab = () => {
    const nextNum = tabs.length + 1;
    const newTab: TerminalTab = {
      id: 'term-' + Date.now(),
      title: `${nextNum}: bash`,
      lines: [
        {
          id: 'init-' + Date.now(),
          type: 'info',
          text: `New terminal session #${nextNum} ready`,
        },
      ],
      history: [],
      historyIndex: -1,
      workingDir: '/workspace',
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) return;
    const remaining = tabs.filter((t) => t.id !== tabId);
    setTabs(remaining);
    if (activeTabId === tabId) {
      setActiveTabId(remaining[0].id);
    }
  };

  const quickCommands = [
    'node src/gameEngine.js',
    'python src/math_tools.py',
    'git status',
    'git log',
    'npm test',
    'ls -la',
    'clear',
    'help',
  ];

  return (
    <div className="flex flex-col h-full w-full bg-[#141414] text-[#cccccc] font-mono text-xs overflow-hidden select-text">
      {/* Terminal Subtabs */}
      <div className="flex items-center justify-between px-2 py-1 bg-[#1a1a1a] border-b border-[#2d2d2d] shrink-0">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded cursor-pointer text-[11px] transition-colors ${
                activeTabId === tab.id
                  ? 'bg-[#2a2d34] text-white font-medium border-t-2 border-[#991b1b]'
                  : 'text-gray-400 hover:text-white hover:bg-[#252525]'
              }`}
            >
              <TerminalIcon size={12} className="text-emerald-400" />
              <span>{tab.title}</span>
              {tabs.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  className="hover:text-rose-400 ml-1 text-gray-500"
                >
                  ×
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addTab}
            title="New Terminal"
            className="p-1 hover:bg-[#2a2d2e] rounded text-gray-400 hover:text-white"
          >
            <Plus size={13} />
          </button>
        </div>

        {/* Clear Button */}
        <button
          type="button"
          onClick={() => handleRunCommand('clear')}
          title="Clear screen"
          className="text-gray-400 hover:text-white p-1 hover:bg-[#2a2d2e] rounded text-[11px]"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Terminal Output Logs */}
      <div
        className="flex-1 overflow-y-auto p-3 space-y-1"
        onClick={() => inputRef.current?.focus()}
      >
        {activeTab?.lines.map((line) => {
          let color = 'text-gray-300';
          if (line.type === 'input') color = 'text-white font-bold';
          if (line.type === 'error') color = 'text-rose-400';
          if (line.type === 'success') color = 'text-emerald-400 font-medium';
          if (line.type === 'info') color = 'text-blue-400';

          return (
            <div key={line.id} className={`whitespace-pre-wrap leading-relaxed ${color}`}>
              {line.text}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Touch Quick Commands Bar */}
      <div className="flex items-center gap-1.5 px-2 py-1.5 bg-[#181818] border-t border-[#252525] overflow-x-auto scrollbar-none shrink-0">
        <span className="text-[10px] text-gray-500 uppercase tracking-wide mr-1 font-sans">Quick:</span>
        {quickCommands.map((cmd) => (
          <button
            key={cmd}
            type="button"
            onClick={() => handleRunCommand(cmd)}
            className="px-2 py-1 bg-[#22252b] hover:bg-[#2c323c] active:bg-[#991b1b] text-gray-300 hover:text-white rounded text-[10px] whitespace-nowrap border border-[#313742] transition-colors"
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Prompt Input Line */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#1a1a1a] border-t border-[#2d2d2d] shrink-0">
        <span className="text-emerald-400 font-bold">➜</span>
        <span className="text-cyan-400 font-bold hidden sm:inline">codepocket</span>
        <span className="text-purple-400 font-bold text-[11px]">({gitBranch})</span>
        <span className="text-gray-400">$</span>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="type command (e.g. node src/gameEngine.js)..."
          className="flex-1 bg-transparent text-white focus:outline-hidden font-mono text-xs"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck="false"
        />
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={() => navigateHistory('up')}
            disabled={activeTab.history.length === 0 || activeTab.historyIndex >= activeTab.history.length - 1}
            title="Previous Command (Up Arrow)"
            className="p-1 hover:bg-[#333333] active:bg-[#991b1b] disabled:opacity-30 text-gray-400 hover:text-white rounded transition-colors"
          >
            <ArrowUp size={13} />
          </button>
          <button
            type="button"
            onClick={() => navigateHistory('down')}
            disabled={activeTab.historyIndex === -1}
            title="Next Command (Down Arrow)"
            className="p-1 hover:bg-[#333333] active:bg-[#991b1b] disabled:opacity-30 text-gray-400 hover:text-white rounded transition-colors"
          >
            <ArrowDown size={13} />
          </button>
          <button
            type="button"
            onClick={() => handleRunCommand(inputVal)}
            title="Run Command (Enter)"
            className="p-1 hover:bg-[#333333] active:bg-[#991b1b] text-gray-400 hover:text-white rounded transition-colors"
          >
            <CornerDownLeft size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
