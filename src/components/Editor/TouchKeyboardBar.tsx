/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Undo2,
  Redo2,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Code2,
  ZoomIn,
  ZoomOut,
  ChevronDown,
} from 'lucide-react';

interface TouchKeyboardBarProps {
  onInsertText: (text: string, cursorOffset?: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onMoveCursor: (direction: 'left' | 'right' | 'up' | 'down') => void;
  onToggleComment: () => void;
  onFormatCode: () => void;
  onZoom: (delta: number) => void;
  fontSize: number;
}

export const TouchKeyboardBar: React.FC<TouchKeyboardBarProps> = ({
  onInsertText,
  onUndo,
  onRedo,
  onMoveCursor,
  onToggleComment,
  onFormatCode,
  onZoom,
  fontSize,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const quickKeys = [
    { label: 'Tab', action: () => onInsertText('  ') },
    { label: '{ }', action: () => onInsertText('{}', -1) },
    { label: '( )', action: () => onInsertText('()', -1) },
    { label: '[ ]', action: () => onInsertText('[]', -1) },
    { label: '< >', action: () => onInsertText('<>', -1) },
    { label: '" "', action: () => onInsertText('""', -1) },
    { label: "' '", action: () => onInsertText("''", -1) },
    { label: '` `', action: () => onInsertText('``', -1) },
    { label: ';', action: () => onInsertText(';') },
    { label: ':', action: () => onInsertText(':') },
    { label: '=', action: () => onInsertText(' = ') },
    { label: '=>', action: () => onInsertText(' => ') },
    { label: '->', action: () => onInsertText('->') },
    { label: '$', action: () => onInsertText('$') },
    { label: '&', action: () => onInsertText('&') },
    { label: '|', action: () => onInsertText('|') },
    { label: '!', action: () => onInsertText('!') },
    { label: '?', action: () => onInsertText('?') },
    { label: '_', action: () => onInsertText('_') },
    { label: '/', action: () => onInsertText('/') },
    { label: '\\', action: () => onInsertText('\\') },
    { label: '.', action: () => onInsertText('.') },
    { label: ',', action: () => onInsertText(', ') },
  ];

  return (
    <div className="bg-[#1f232a] border-t border-[#30363d] select-none text-xs flex flex-col z-20 shadow-lg">
      {/* Top primary row: common actions + horizontal scrollable keys */}
      <div className="flex items-center px-1.5 py-1 gap-1 overflow-x-auto scrollbar-none">
        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 shrink-0 bg-[#282d35] rounded p-0.5 border border-[#3e4451]">
          <button
            type="button"
            onClick={onUndo}
            title="Undo"
            className="p-1.5 text-gray-300 hover:text-white active:bg-[#991b1b] active:text-white rounded transition-colors"
          >
            <Undo2 size={15} />
          </button>
          <button
            type="button"
            onClick={onRedo}
            title="Redo"
            className="p-1.5 text-gray-300 hover:text-white active:bg-[#991b1b] active:text-white rounded transition-colors"
          >
            <Redo2 size={15} />
          </button>
        </div>

        {/* Comment toggle */}
        <button
          type="button"
          onClick={onToggleComment}
          title="Toggle Comment (//)"
          className="shrink-0 flex items-center gap-1 px-2 py-1.5 bg-[#282d35] hover:bg-[#343b46] active:bg-[#991b1b] text-gray-200 rounded font-mono text-[11px] border border-[#3e4451]"
        >
          <Code2 size={13} className="text-blue-400" />
          <span>//</span>
        </button>

        {/* Format with Prettier */}
        <button
          type="button"
          onClick={onFormatCode}
          title="Format Document (Prettier)"
          className="shrink-0 flex items-center gap-1 px-2 py-1.5 bg-[#282d35] hover:bg-[#343b46] active:bg-[#991b1b] text-gray-200 rounded font-mono text-[11px] border border-[#3e4451]"
        >
          <Sparkles size={13} className="text-amber-400" />
          <span>Format</span>
        </button>

        {/* Quick character buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {quickKeys.map((k) => (
            <button
              key={k.label}
              type="button"
              onClick={k.action}
              className="px-2.5 py-1.5 bg-[#2c313a] hover:bg-[#3e4451] active:bg-[#991b1b] text-gray-100 rounded font-mono text-[13px] font-medium border border-[#3e4451] shadow-xs active:scale-95 transition-transform"
            >
              {k.label}
            </button>
          ))}
        </div>

        {/* Cursor directional keys */}
        <div className="flex items-center gap-0.5 shrink-0 bg-[#282d35] rounded p-0.5 border border-[#3e4451]">
          <button
            type="button"
            onClick={() => onMoveCursor('left')}
            className="p-1.5 text-gray-300 hover:text-white active:bg-[#991b1b] rounded"
            title="Cursor Left"
          >
            <ArrowLeft size={14} />
          </button>
          <button
            type="button"
            onClick={() => onMoveCursor('up')}
            className="p-1.5 text-gray-300 hover:text-white active:bg-[#991b1b] rounded"
            title="Cursor Up"
          >
            <ArrowUp size={14} />
          </button>
          <button
            type="button"
            onClick={() => onMoveCursor('down')}
            className="p-1.5 text-gray-300 hover:text-white active:bg-[#991b1b] rounded"
            title="Cursor Down"
          >
            <ArrowDown size={14} />
          </button>
          <button
            type="button"
            onClick={() => onMoveCursor('right')}
            className="p-1.5 text-gray-300 hover:text-white active:bg-[#991b1b] rounded"
            title="Cursor Right"
          >
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Font size zoom controls */}
        <div className="flex items-center gap-0.5 shrink-0 bg-[#282d35] rounded p-0.5 border border-[#3e4451]">
          <button
            type="button"
            onClick={() => onZoom(-1)}
            title="Zoom Out"
            className="p-1.5 text-gray-300 hover:text-white active:bg-[#991b1b] rounded"
          >
            <ZoomOut size={14} />
          </button>
          <span className="text-[10px] text-gray-400 px-1 font-mono">{fontSize}px</span>
          <button
            type="button"
            onClick={() => onZoom(1)}
            title="Zoom In"
            className="p-1.5 text-gray-300 hover:text-white active:bg-[#991b1b] rounded"
          >
            <ZoomIn size={14} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 text-gray-400 hover:text-white rounded"
          title="Toggle extra keypad"
        >
          <ChevronDown size={14} className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Expanded accessory row */}
      {isExpanded && (
        <div className="flex items-center gap-1 px-2 py-1.5 bg-[#1a1d23] border-t border-[#2a2f38] overflow-x-auto text-[11px]">
          <span className="text-gray-400 uppercase text-[9px] font-semibold tracking-wider mr-1">Shortcuts:</span>
          <button
            type="button"
            onClick={() => onInsertText('console.log();', -2)}
            className="px-2 py-1 bg-[#252a32] hover:bg-[#343b46] text-blue-300 rounded font-mono border border-[#38404e]"
          >
            console.log()
          </button>
          <button
            type="button"
            onClick={() => onInsertText('function () {\n  \n}', -3)}
            className="px-2 py-1 bg-[#252a32] hover:bg-[#343b46] text-amber-300 rounded font-mono border border-[#38404e]"
          >
            function()
          </button>
          <button
            type="button"
            onClick={() => onInsertText('const  = ;', -4)}
            className="px-2 py-1 bg-[#252a32] hover:bg-[#343b46] text-purple-300 rounded font-mono border border-[#38404e]"
          >
            const
          </button>
          <button
            type="button"
            onClick={() => onInsertText('return ;', -1)}
            className="px-2 py-1 bg-[#252a32] hover:bg-[#343b46] text-emerald-300 rounded font-mono border border-[#38404e]"
          >
            return
          </button>
          <button
            type="button"
            onClick={() => onInsertText('try {\n  \n} catch (err) {\n  \n}', -20)}
            className="px-2 py-1 bg-[#252a32] hover:bg-[#343b46] text-rose-300 rounded font-mono border border-[#38404e]"
          >
            try/catch
          </button>
          <button
            type="button"
            onClick={() => onInsertText('async () => {\n  \n}', -3)}
            className="px-2 py-1 bg-[#252a32] hover:bg-[#343b46] text-cyan-300 rounded font-mono border border-[#38404e]"
          >
            async () =&gt;
          </button>
        </div>
      )}
    </div>
  );
};
