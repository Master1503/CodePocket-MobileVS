/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  CornerDownRight,
  CornerUpLeft,
  RotateCw,
  Square,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Bug,
  Eye,
  ListTree,
  CircleDot,
} from 'lucide-react';
import {
  Breakpoint,
  DebugFrame,
  DebugVariable,
  DebugWatch,
  DebugStatus,
  FileItem,
} from '../../types/vscode.ts';

interface RunAndDebugPanelProps {
  status: DebugStatus;
  activeLine: number | null;
  activeFile: FileItem | null;
  frames: DebugFrame[];
  variables: DebugVariable[];
  watches: DebugWatch[];
  breakpoints: Breakpoint[];
  onStartDebug: () => void;
  onPauseDebug: () => void;
  onStepOver: () => void;
  onStepInto: () => void;
  onStepOut: () => void;
  onRestartDebug: () => void;
  onStopDebug: () => void;
  onAddWatch: (expr: string) => void;
  onRemoveWatch: (id: string) => void;
  onToggleBreakpoint: (fileId: string, filePath: string, lineNumber: number) => void;
  onRemoveBreakpoint: (id: string) => void;
  onClearAllBreakpoints: () => void;
}

export const RunAndDebugPanel: React.FC<RunAndDebugPanelProps> = ({
  status,
  activeLine,
  activeFile,
  frames,
  variables,
  watches,
  breakpoints,
  onStartDebug,
  onPauseDebug,
  onStepOver,
  onStepInto,
  onStepOut,
  onRestartDebug,
  onStopDebug,
  onAddWatch,
  onRemoveWatch,
  onToggleBreakpoint,
  onRemoveBreakpoint,
  onClearAllBreakpoints,
}) => {
  const [selectedConfig, setSelectedConfig] = useState('Node.js: Launch Program');
  const [newWatchInput, setNewWatchInput] = useState('');
  const [isAddingWatch, setIsAddingWatch] = useState(false);

  // Sections collapse state
  const [openSections, setOpenSections] = useState({
    variables: true,
    watch: true,
    callstack: true,
    breakpoints: true,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddWatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWatchInput.trim()) {
      onAddWatch(newWatchInput.trim());
      setNewWatchInput('');
      setIsAddingWatch(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#252526] text-[#cccccc] text-xs overflow-hidden select-none">
      {/* Run & Debug Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#3c3c3c]">
        <div className="flex items-center gap-1.5">
          <Bug size={14} className="text-amber-400" />
          <span className="uppercase text-[11px] font-bold tracking-wider text-gray-300">
            Run & Debug
          </span>
        </div>

        {/* Status Pill */}
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase ${
            status === 'paused'
              ? 'bg-amber-900/60 text-amber-300 border border-amber-600/50'
              : status === 'running'
              ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-600/50 animate-pulse'
              : 'bg-[#333333] text-gray-400'
          }`}
        >
          {status}
        </span>
      </div>

      {/* Floating Debugger Control Bar */}
      <div className="p-2.5 bg-[#1e1e1e] border-b border-[#3c3c3c] flex flex-col gap-2">
        <div className="flex items-center gap-1.5 bg-[#252526] rounded px-2 py-1 border border-[#3c3c3c]">
          <select
            value={selectedConfig}
            onChange={(e) => setSelectedConfig(e.target.value)}
            className="flex-1 bg-transparent text-white text-xs focus:outline-hidden font-mono"
          >
            <option value="Node.js: Launch Program" className="bg-[#252526]">Node.js: Launch Program</option>
            <option value="Python: Debug math_tools.py" className="bg-[#252526]">Python: Debug math_tools.py</option>
            <option value="Chrome: Launch index.html" className="bg-[#252526]">Chrome: Launch index.html</option>
          </select>
        </div>

        {/* Debug Buttons Toolbar */}
        <div className="flex items-center justify-between bg-[#2a2d34] p-1.5 rounded-lg border border-[#3c414d] shadow-sm">
          {status === 'idle' || status === 'stopped' ? (
            <button
              type="button"
              onClick={onStartDebug}
              title="Start Debugging (F5)"
              className="flex-1 flex items-center justify-center gap-1 py-1 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium text-xs shadow-xs"
            >
              <Play size={13} fill="currentColor" />
              <span>Start Debug (F5)</span>
            </button>
          ) : (
            <>
              {status === 'paused' ? (
                <button
                  type="button"
                  onClick={onStartDebug}
                  title="Continue (F5)"
                  className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded"
                >
                  <Play size={14} fill="currentColor" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onPauseDebug}
                  title="Pause (F6)"
                  className="p-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded"
                >
                  <Pause size={14} fill="currentColor" />
                </button>
              )}

              <button
                type="button"
                onClick={onStepOver}
                title="Step Over (F10)"
                className="p-1.5 hover:bg-[#3e4451] text-blue-300 hover:text-white rounded"
              >
                <SkipForward size={15} />
              </button>

              <button
                type="button"
                onClick={onStepInto}
                title="Step Into (F11)"
                className="p-1.5 hover:bg-[#3e4451] text-blue-300 hover:text-white rounded"
              >
                <CornerDownRight size={15} />
              </button>

              <button
                type="button"
                onClick={onStepOut}
                title="Step Out (Shift+F11)"
                className="p-1.5 hover:bg-[#3e4451] text-blue-300 hover:text-white rounded"
              >
                <CornerUpLeft size={15} />
              </button>

              <button
                type="button"
                onClick={onRestartDebug}
                title="Restart Session"
                className="p-1.5 hover:bg-[#3e4451] text-emerald-400 hover:text-emerald-300 rounded"
              >
                <RotateCw size={14} />
              </button>

              <button
                type="button"
                onClick={onStopDebug}
                title="Stop Debugging (Shift+F5)"
                className="p-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded"
              >
                <Square size={13} fill="currentColor" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Accordion Panels */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#2d2d2d]">
        {/* Variables Inspector */}
        <div>
          <div
            onClick={() => toggleSection('variables')}
            className="flex items-center justify-between px-2.5 py-1.5 bg-[#202020] hover:bg-[#2a2d2e] cursor-pointer text-gray-300"
          >
            <div className="flex items-center gap-1.5">
              {openSections.variables ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              <span className="font-semibold text-[11px] uppercase tracking-wide">Variables</span>
            </div>
          </div>

          {openSections.variables && (
            <div className="p-2 bg-[#1e1e1e] font-mono text-[11px]">
              <div className="text-[10px] text-gray-500 uppercase font-semibold mb-1">Local Scope</div>
              {variables.length === 0 ? (
                <div className="text-gray-500 italic py-1">Not paused on code frame</div>
              ) : (
                <div className="space-y-1">
                  {variables.map((v) => (
                    <div key={v.name} className="flex items-baseline justify-between hover:bg-[#2a2d2e] px-1.5 py-0.5 rounded">
                      <span className="text-blue-300 font-medium">{v.name}:</span>
                      <span
                        className={`truncate ml-2 ${
                          v.type === 'number'
                            ? 'text-emerald-400'
                            : v.type === 'string'
                            ? 'text-amber-300'
                            : v.type === 'array'
                            ? 'text-purple-300'
                            : 'text-gray-300'
                        }`}
                      >
                        {v.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Watch Expressions */}
        <div>
          <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#202020] text-gray-300">
            <div
              onClick={() => toggleSection('watch')}
              className="flex items-center gap-1.5 cursor-pointer flex-1"
            >
              {openSections.watch ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              <span className="font-semibold text-[11px] uppercase tracking-wide">Watch</span>
            </div>
            <button
              type="button"
              onClick={() => setIsAddingWatch(true)}
              title="Add Expression"
              className="p-1 hover:text-white text-gray-400"
            >
              <Plus size={13} />
            </button>
          </div>

          {openSections.watch && (
            <div className="p-2 bg-[#1e1e1e] font-mono text-[11px]">
              {isAddingWatch && (
                <form onSubmit={handleAddWatchSubmit} className="mb-2">
                  <input
                    type="text"
                    placeholder="Expression to watch..."
                    value={newWatchInput}
                    onChange={(e) => setNewWatchInput(e.target.value)}
                    autoFocus
                    onBlur={() => !newWatchInput && setIsAddingWatch(false)}
                    className="w-full bg-[#2a2d2e] text-white text-xs px-2 py-1 rounded border border-blue-500 focus:outline-hidden"
                  />
                </form>
              )}

              {watches.length === 0 && !isAddingWatch ? (
                <div className="text-gray-500 italic py-1">No watch expressions added</div>
              ) : (
                <div className="space-y-1">
                  {watches.map((w) => (
                    <div key={w.id} className="group flex items-center justify-between hover:bg-[#2a2d2e] px-1.5 py-0.5 rounded">
                      <div className="flex items-center gap-1.5 truncate">
                        <Eye size={12} className="text-gray-500 shrink-0" />
                        <span className="text-gray-300">{w.expression}:</span>
                        <span className={w.error ? 'text-rose-400' : 'text-emerald-400'}>{w.value}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveWatch(w.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-rose-400"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Call Stack */}
        <div>
          <div
            onClick={() => toggleSection('callstack')}
            className="flex items-center justify-between px-2.5 py-1.5 bg-[#202020] hover:bg-[#2a2d2e] cursor-pointer text-gray-300"
          >
            <div className="flex items-center gap-1.5">
              {openSections.callstack ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              <span className="font-semibold text-[11px] uppercase tracking-wide">Call Stack</span>
            </div>
          </div>

          {openSections.callstack && (
            <div className="p-2 bg-[#1e1e1e] font-mono text-[11px]">
              {frames.length === 0 ? (
                <div className="text-gray-500 italic py-1">Not paused</div>
              ) : (
                <div className="space-y-1">
                  {frames.map((frame, idx) => (
                    <div
                      key={frame.id}
                      className={`flex items-center justify-between px-2 py-1 rounded ${
                        idx === 0 ? 'bg-blue-900/30 text-blue-200 border-l-2 border-blue-500 font-semibold' : 'text-gray-400'
                      }`}
                    >
                      <div className="truncate">
                        <span>{frame.functionName}</span>
                      </div>
                      <div className="text-[10px] text-gray-500 shrink-0 ml-2">
                        {frame.fileName}:{frame.lineNumber}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Breakpoints */}
        <div>
          <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#202020] text-gray-300">
            <div
              onClick={() => toggleSection('breakpoints')}
              className="flex items-center gap-1.5 cursor-pointer flex-1"
            >
              {openSections.breakpoints ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              <span className="font-semibold text-[11px] uppercase tracking-wide">
                Breakpoints ({breakpoints.length})
              </span>
            </div>
            {breakpoints.length > 0 && (
              <button
                type="button"
                onClick={onClearAllBreakpoints}
                title="Remove All Breakpoints"
                className="p-1 hover:text-rose-400 text-gray-400"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>

          {openSections.breakpoints && (
            <div className="p-2 bg-[#1e1e1e] font-mono text-[11px]">
              {breakpoints.length === 0 ? (
                <div className="text-gray-500 italic py-1">
                  Tap line numbers in editor to set breakpoints
                </div>
              ) : (
                <div className="space-y-1">
                  {breakpoints.map((bp) => (
                    <div
                      key={bp.id}
                      className="group flex items-center justify-between px-1.5 py-1 hover:bg-[#2a2d2e] rounded cursor-pointer"
                      onClick={() => onToggleBreakpoint(bp.fileId, bp.filePath, bp.lineNumber)}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 shadow-xs shadow-red-500/80" />
                        <span className="text-gray-200 truncate">{bp.filePath.split('/').pop()}</span>
                        <span className="text-gray-400 text-[10px]">:{bp.lineNumber}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveBreakpoint(bp.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-rose-400"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
