/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { CornerDownLeft, Trash2, Terminal as TerminalIcon } from 'lucide-react';
import { evaluateDebugExpression } from '../../services/debugEngine.ts';
import { DebugVariable } from '../../types/vscode.ts';

interface DebugConsoleViewProps {
  logs: string[];
  scopeVariables: DebugVariable[];
  onClearLogs?: () => void;
}

export const DebugConsoleView: React.FC<DebugConsoleViewProps> = ({
  logs,
  scopeVariables,
  onClearLogs,
}) => {
  const [replInput, setReplInput] = useState('');
  const [history, setHistory] = useState<Array<{ expr: string; result: string }>>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, history]);

  const handleEvaluate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replInput.trim()) return;

    // Convert DebugVariable array to key-value record
    const scopeMap: Record<string, any> = {};
    for (const v of scopeVariables) {
      if (v.type === 'number') scopeMap[v.name] = Number(v.value);
      else if (v.type === 'boolean') scopeMap[v.name] = v.value === 'true';
      else scopeMap[v.name] = v.value;
    }

    const result = evaluateDebugExpression(replInput, scopeMap);
    setHistory((prev) => [...prev, { expr: replInput, result }]);
    setReplInput('');
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#181818] text-[#cccccc] font-mono text-xs overflow-hidden select-text">
      {/* Console Header Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#202020] border-b border-[#2d2d2d] shrink-0">
        <span className="text-[11px] text-gray-400 font-sans">
          Debug REPL Console — Evaluate expressions in active debug scope
        </span>
        {onClearLogs && (
          <button
            type="button"
            onClick={onClearLogs}
            className="text-gray-400 hover:text-white p-1 hover:bg-[#333333] rounded text-[11px]"
            title="Clear Console"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {/* Logs and REPL History */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {logs.map((log, idx) => (
          <div key={idx} className="text-gray-300 whitespace-pre-wrap leading-relaxed">
            <span className="text-blue-400 mr-2 font-bold">[stdout]</span>
            {log}
          </div>
        ))}

        {history.map((item, idx) => (
          <div key={idx} className="space-y-0.5 border-l-2 border-amber-500/50 pl-2 my-1">
            <div className="text-amber-300 font-semibold flex items-center gap-1.5">
              <span>&gt;</span>
              <span>{item.expr}</span>
            </div>
            <div className="text-emerald-400 pl-3">&lt; {item.result}</div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Input REPL Prompt */}
      <form
        onSubmit={handleEvaluate}
        className="flex items-center gap-2 px-3 py-2 bg-[#1f1f1f] border-t border-[#2d2d2d] shrink-0"
      >
        <span className="text-amber-400 font-bold">&gt;</span>
        <input
          type="text"
          value={replInput}
          onChange={(e) => setReplInput(e.target.value)}
          placeholder="Evaluate expression (e.g. activeLevel * 10 or calculateScore)..."
          className="flex-1 bg-transparent text-white focus:outline-hidden font-mono text-xs"
        />
        <button
          type="submit"
          className="p-1 hover:bg-[#333333] text-gray-400 hover:text-white rounded"
        >
          <CornerDownLeft size={14} />
        </button>
      </form>
    </div>
  );
};
