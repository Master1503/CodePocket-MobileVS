/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Indent, Outdent } from 'lucide-react';

interface TouchBarProps {
  onInsertText: (text: string, cursorOffset?: number) => void;
  onIndent: () => void;
  onOutdent: () => void;
}

const QUICK_PAIRS: Array<{ label: string; insert: string; offset: number; title: string }> = [
  { label: '{ }', insert: '{}', offset: -1, title: 'Curly Braces' },
  { label: '( )', insert: '()', offset: -1, title: 'Parentheses' },
  { label: '[ ]', insert: '[]', offset: -1, title: 'Square Brackets' },
  { label: '< >', insert: '<>', offset: -1, title: 'Angle Brackets' },
  { label: '" "', insert: '""', offset: -1, title: 'Double Quotes' },
  { label: "' '", insert: "''", offset: -1, title: 'Single Quotes' },
  { label: '` `', insert: '``', offset: -1, title: 'Backticks' },
];

const QUICK_TOKENS: Array<{ label: string; insert: string; title: string }> = [
  { label: '=>', insert: ' => ', title: 'Arrow Function' },
  { label: '===', insert: ' === ', title: 'Strict Equality' },
  { label: ';', insert: ';', title: 'Semicolon' },
  { label: ':', insert: ': ', title: 'Colon' },
  { label: '=', insert: ' = ', title: 'Assignment' },
  { label: '.', insert: '.', title: 'Dot' },
  { label: ',', insert: ', ', title: 'Comma' },
  { label: '!', insert: '!', title: 'Logical NOT' },
  { label: '&', insert: '&', title: 'Ampersand' },
  { label: '|', insert: '|', title: 'Pipe' },
];

export const TouchBar: React.FC<TouchBarProps> = ({
  onInsertText,
  onIndent,
  onOutdent,
}) => {
  // Prevent button tap from stealing focus from the editor textarea / virtual keyboard
  const preventFocusLoss = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
  };

  return (
    <div
      className="flex items-center gap-1 px-2 py-1.5 bg-[#1b1b1c] border-t border-[#2d2d2d] overflow-x-auto scrollbar-none select-none shrink-0"
      role="toolbar"
      aria-label="Programming Characters TouchBar"
    >
      {/* Indentation Helpers */}
      <div className="flex items-center gap-1 pr-1.5 mr-1 border-r border-[#333333] shrink-0">
        <button
          type="button"
          onMouseDown={preventFocusLoss}
          onClick={onOutdent}
          title="Outdent Line"
          className="flex items-center gap-1 px-2 py-1 bg-[#252526] hover:bg-[#333333] active:bg-[#991b1b] text-gray-200 hover:text-white rounded text-[11px] font-mono border border-[#383838] transition-colors cursor-pointer"
        >
          <Outdent size={13} />
          <span className="hidden sm:inline text-[10px]">Outdent</span>
        </button>
        <button
          type="button"
          onMouseDown={preventFocusLoss}
          onClick={onIndent}
          title="Indent Line"
          className="flex items-center gap-1 px-2 py-1 bg-[#252526] hover:bg-[#333333] active:bg-[#991b1b] text-gray-200 hover:text-white rounded text-[11px] font-mono border border-[#383838] transition-colors cursor-pointer"
        >
          <Indent size={13} />
          <span className="hidden sm:inline text-[10px]">Indent</span>
        </button>
      </div>

      {/* Brackets & Quotes Pairs */}
      <div className="flex items-center gap-1 pr-1.5 mr-1 border-r border-[#333333] shrink-0">
        {QUICK_PAIRS.map((pair) => (
          <button
            key={pair.label}
            type="button"
            onMouseDown={preventFocusLoss}
            onClick={() => onInsertText(pair.insert, pair.offset)}
            title={pair.title}
            className="px-2 py-1 bg-[#252526] hover:bg-[#333333] active:bg-[#991b1b] text-red-200 hover:text-white rounded text-[11px] font-mono font-semibold border border-[#991b1b]/40 transition-colors shrink-0 cursor-pointer"
          >
            {pair.label}
          </button>
        ))}
      </div>

      {/* Common Operators & Punctuation */}
      <div className="flex items-center gap-1 shrink-0">
        {QUICK_TOKENS.map((tok) => (
          <button
            key={tok.label}
            type="button"
            onMouseDown={preventFocusLoss}
            onClick={() => onInsertText(tok.insert)}
            title={tok.title}
            className="px-2 py-1 bg-[#222224] hover:bg-[#333333] active:bg-[#991b1b] text-gray-300 hover:text-white rounded text-[11px] font-mono border border-[#333333] transition-colors shrink-0 cursor-pointer"
          >
            {tok.label}
          </button>
        ))}
      </div>
    </div>
  );
};
