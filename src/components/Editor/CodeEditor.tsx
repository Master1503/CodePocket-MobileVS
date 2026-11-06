/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import {
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Replace,
  Sparkles,
} from 'lucide-react';
import { FileItem, Breakpoint, LanguageId, UserSettings } from '../../types/vscode.ts';
import { highlightCode, getLanguageCommentSyntax } from '../../services/syntaxHighlighter.ts';
import { THEMES } from '../../constants/themes.ts';
import { TouchKeyboardBar } from './TouchKeyboardBar.tsx';

interface CodeEditorProps {
  file: FileItem;
  onChange: (newContent: string) => void;
  breakpoints: Breakpoint[];
  onToggleBreakpoint: (fileId: string, filePath: string, lineNumber: number) => void;
  activeDebugLine: number | null;
  settings: UserSettings;
  onSave?: () => void;
  onCursorChange?: (line: number, col: number) => void;
  onNextTab?: () => void;
  onPrevTab?: () => void;
  onToggleTerminal?: () => void;
  activeTabTitle?: string;
  allTabsCount?: number;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  file,
  onChange,
  breakpoints,
  onToggleBreakpoint,
  activeDebugLine,
  settings,
  onSave,
  onCursorChange,
  onNextTab,
  onPrevTab,
  onToggleTerminal,
  activeTabTitle,
  allTabsCount,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const editorCanvasRef = useRef<HTMLDivElement>(null);

  const [fontSize, setFontSize] = useState(settings.fontSize || 13);
  const [showFindBar, setShowFindBar] = useState(false);
  const [showGestureGuide, setShowGestureGuide] = useState(false);
  const [findQuery, setFindQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [findMatches, setFindMatches] = useState<number[]>([]);
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);
  const [history, setHistory] = useState<string[]>([file.content]);
  const [historyIdx, setHistoryIdx] = useState(0);

  // Gesture HUD Feedback State
  const [gestureFeedback, setGestureFeedback] = useState<{
    icon: string;
    title: string;
    detail: string;
  } | null>(null);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showFeedback = useCallback((icon: string, title: string, detail: string, durationMs = 1500) => {
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }
    setGestureFeedback({ icon, title, detail });
    feedbackTimeoutRef.current = setTimeout(() => {
      setGestureFeedback(null);
    }, durationMs);
  }, []);

  const activeTheme = THEMES[settings.theme] || THEMES['one-dark-pro'];

  // Lines calculation
  const lines = useMemo(() => file.content.split('\n'), [file.content]);
  const fileBreakpoints = useMemo(
    () => new Set(breakpoints.filter((b) => b.fileId === file.id && b.enabled).map((b) => b.lineNumber)),
    [breakpoints, file.id]
  );

  // Scroll-indicator overlay metrics (percentage of total file length)
  const [scrollMetrics, setScrollMetrics] = useState<{ topPercent: number; heightPercent: number }>({
    topPercent: 0,
    heightPercent: 100,
  });

  const updateScrollMetrics = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight <= 0) return;
    const heightPercent = Math.min(100, Math.max(8, (clientHeight / scrollHeight) * 100));
    const maxScroll = scrollHeight - clientHeight;
    const topPercent = maxScroll > 0 ? (scrollTop / maxScroll) * (100 - heightPercent) : 0;
    setScrollMetrics({ topPercent, heightPercent });
  }, []);

  useEffect(() => {
    updateScrollMetrics();
  }, [file.content, fontSize, updateScrollMetrics]);

  // Synchronize scroll between textarea, syntax layer, and gutter
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const { scrollTop, scrollLeft } = e.currentTarget;
    if (preRef.current) {
      preRef.current.scrollTop = scrollTop;
      preRef.current.scrollLeft = scrollLeft;
    }
    if (gutterRef.current) {
      gutterRef.current.scrollTop = scrollTop;
    }
    updateScrollMetrics();
  };

  // Cursor tracking
  const updateCursorPosition = useCallback(() => {
    if (!textareaRef.current) return;
    const { selectionStart } = textareaRef.current;
    const textBefore = file.content.substring(0, selectionStart);
    const linesBefore = textBefore.split('\n');
    const currentLine = linesBefore.length;
    const currentCol = linesBefore[linesBefore.length - 1].length + 1;
    if (onCursorChange) {
      onCursorChange(currentLine, currentCol);
    }
  }, [file.content, onCursorChange]);

  // Push history on changes
  const handleTextChange = (newVal: string) => {
    onChange(newVal);
    // Debounced history push
    setHistory((prev) => {
      const sliced = prev.slice(0, historyIdx + 1);
      return [...sliced, newVal];
    });
    setHistoryIdx((prev) => prev + 1);
  };

  // Undo / Redo
  const handleUndo = () => {
    if (historyIdx > 0) {
      const prevIdx = historyIdx - 1;
      setHistoryIdx(prevIdx);
      onChange(history[prevIdx]);
    }
  };

  const handleRedo = () => {
    if (historyIdx < history.length - 1) {
      const nextIdx = historyIdx + 1;
      setHistoryIdx(nextIdx);
      onChange(history[nextIdx]);
    }
  };

  // Insert text at cursor with optional offset
  const handleInsertText = (text: string, cursorOffset: number = 0) => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const before = file.content.substring(0, start);
    const after = file.content.substring(end);
    const nextVal = before + text + after;
    handleTextChange(nextVal);

    requestAnimationFrame(() => {
      el.focus();
      const newPos = start + text.length + cursorOffset;
      el.setSelectionRange(newPos, newPos);
      updateCursorPosition();
    });
  };

  // Move cursor with directional buttons
  const handleMoveCursor = (dir: 'left' | 'right' | 'up' | 'down') => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    const pos = el.selectionStart;
    let newPos = pos;

    if (dir === 'left') {
      newPos = Math.max(0, pos - 1);
    } else if (dir === 'right') {
      newPos = Math.min(file.content.length, pos + 1);
    } else if (dir === 'up' || dir === 'down') {
      const linesArray = file.content.split('\n');
      const textBefore = file.content.substring(0, pos);
      const curLineIdx = textBefore.split('\n').length - 1;
      const curCol = textBefore.split('\n')[curLineIdx].length;

      const targetLineIdx = dir === 'up' ? Math.max(0, curLineIdx - 1) : Math.min(linesArray.length - 1, curLineIdx + 1);
      let targetPos = 0;
      for (let i = 0; i < targetLineIdx; i++) {
        targetPos += linesArray[i].length + 1;
      }
      targetPos += Math.min(curCol, linesArray[targetLineIdx].length);
      newPos = targetPos;
    }

    el.setSelectionRange(newPos, newPos);
    el.focus();
    updateCursorPosition();
  };

  // Toggle comment on current line or selection
  const handleToggleComment = () => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    const start = el.selectionStart;
    const before = file.content.substring(0, start);
    const lineStart = before.lastIndexOf('\n') + 1;
    const lineEnd = file.content.indexOf('\n', start);
    const actualEnd = lineEnd === -1 ? file.content.length : lineEnd;
    const currentLineText = file.content.substring(lineStart, actualEnd);

    const commentInfo = getLanguageCommentSyntax(file.language);
    let updatedLine: string;

    if (currentLineText.trimStart().startsWith(commentInfo.prefix)) {
      // Uncomment
      updatedLine = currentLineText.replace(commentInfo.prefix, '');
    } else {
      // Comment
      updatedLine = commentInfo.prefix + currentLineText;
    }

    const nextVal = file.content.substring(0, lineStart) + updatedLine + file.content.substring(actualEnd);
    handleTextChange(nextVal);
  };

  // Simple Prettier formatting
  const handleFormatCode = useCallback(() => {
    try {
      let formatted = file.content;
      if (file.language === 'json') {
        formatted = JSON.stringify(JSON.parse(file.content), null, settings.tabSize || 2) + '\n';
      } else {
        // Basic code indentation normalization
        const rawLines = file.content.split('\n');
        let indentLevel = 0;
        const indentStr = ' '.repeat(settings.tabSize || 2);
        const newLines = rawLines.map((line) => {
          const trimmed = line.trim();
          if (!trimmed) return '';
          if (trimmed.startsWith('}') || trimmed.startsWith(']') || trimmed.startsWith(')')) {
            indentLevel = Math.max(0, indentLevel - 1);
          }
          const indented = indentStr.repeat(indentLevel) + trimmed;
          if (trimmed.endsWith('{') || trimmed.endsWith('[') || trimmed.endsWith('(')) {
            indentLevel++;
          }
          return indented;
        });
        formatted = newLines.join('\n');
      }
      handleTextChange(formatted);
      showFeedback('✨', 'Format Document', 'Prettier indentation applied');
    } catch {
      // Keep as-is if parsing fails
    }
  }, [file.content, file.language, settings.tabSize, showFeedback]);

  // Custom Touch Gestures: Two-Finger Scroll/Pinch & Three-Finger Tab Swipe
  useEffect(() => {
    const el = editorCanvasRef.current;
    if (!el) return;

    let touchCount = 0;
    let initialPinchDist = 0;
    let initialFontSize = fontSize;
    let lastMidX = 0;
    let lastMidY = 0;
    let threeStartX = 0;
    let threeStartY = 0;
    let threeDeltaX = 0;
    let threeDeltaY = 0;
    let isPinching = false;

    const onTouchStart = (e: TouchEvent) => {
      touchCount = e.touches.length;

      if (touchCount === 2) {
        // Two fingers: initialize scroll / pinch
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        lastMidX = (t1.clientX + t2.clientX) / 2;
        lastMidY = (t1.clientY + t2.clientY) / 2;
        initialPinchDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        initialFontSize = fontSize;
        isPinching = false;
      } else if (touchCount === 3) {
        // Three fingers: initialize tab swipe
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const t3 = e.touches[2];
        threeStartX = (t1.clientX + t2.clientX + t3.clientX) / 3;
        threeStartY = (t1.clientY + t2.clientY + t3.clientY) / 3;
        threeDeltaX = 0;
        threeDeltaY = 0;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // Prevent default browser viewport pull-to-refresh & zoom
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        const midX = (t1.clientX + t2.clientX) / 2;
        const midY = (t1.clientY + t2.clientY) / 2;

        const distDiff = currentDist - initialPinchDist;

        if (Math.abs(distDiff) > 28) {
          // Pinch-to-zoom
          isPinching = true;
          const scale = currentDist / initialPinchDist;
          const newSize = Math.min(22, Math.max(10, Math.round(initialFontSize * scale)));
          setFontSize(newSize);
          showFeedback('🔍', `Pinch Zoom: ${newSize}px`, 'Font size updated');
        } else if (!isPinching && textareaRef.current) {
          // Two-finger smooth scrolling through large files!
          const deltaX = lastMidX - midX;
          const deltaY = lastMidY - midY;

          textareaRef.current.scrollTop += deltaY * 1.8;
          textareaRef.current.scrollLeft += deltaX * 1.8;

          if (preRef.current) {
            preRef.current.scrollTop = textareaRef.current.scrollTop;
            preRef.current.scrollLeft = textareaRef.current.scrollLeft;
          }
          if (gutterRef.current) {
            gutterRef.current.scrollTop = textareaRef.current.scrollTop;
          }

          const approxLine = Math.min(
            lines.length,
            Math.max(1, Math.round(textareaRef.current.scrollTop / (fontSize * 1.55)) + 1)
          );
          showFeedback('↕', 'Two-Finger Scroll', `Line ${approxLine} of ${lines.length}`, 800);
        }

        lastMidX = midX;
        lastMidY = midY;
      } else if (e.touches.length === 3) {
        // Three fingers touchmove
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const t3 = e.touches[2];
        const curX = (t1.clientX + t2.clientX + t3.clientX) / 3;
        const curY = (t1.clientY + t2.clientY + t3.clientY) / 3;
        threeDeltaX = curX - threeStartX;
        threeDeltaY = curY - threeStartY;

        if (Math.abs(threeDeltaX) > 30 && Math.abs(threeDeltaX) > Math.abs(threeDeltaY)) {
          if (threeDeltaX < 0) {
            showFeedback('⇥', 'Three-Finger Swipe', 'Swipe Left ➔ Next Tab', 600);
          } else {
            showFeedback('⇤', 'Three-Finger Swipe', 'Swipe Right ➔ Previous Tab', 600);
          }
        } else if (threeDeltaY > 35) {
          showFeedback('⌨️', 'Three-Finger Swipe', 'Swipe Down ➔ Terminal Dock', 600);
        }
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (touchCount === 3) {
        // Evaluate three-finger swipe gesture trigger
        if (Math.abs(threeDeltaX) > 45 && Math.abs(threeDeltaX) > Math.abs(threeDeltaY)) {
          if (threeDeltaX < -45) {
            // Swipe left -> Next Tab
            if (onNextTab) {
              onNextTab();
              showFeedback('⇥', 'Next Tab', 'Switched to next tab');
            }
          } else if (threeDeltaX > 45) {
            // Swipe right -> Previous Tab
            if (onPrevTab) {
              onPrevTab();
              showFeedback('⇤', 'Previous Tab', 'Switched to previous tab');
            }
          }
        } else if (threeDeltaY > 55) {
          // Swipe down -> Toggle terminal dock
          if (onToggleTerminal) {
            onToggleTerminal();
            showFeedback('⌨️', 'Terminal Dock', 'Toggled terminal bottom dock');
          }
        } else if (threeDeltaY < -55) {
          // Swipe up -> Format code
          handleFormatCode();
        }
      }

      touchCount = e.touches.length;
      isPinching = false;
    };

    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    el.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [fontSize, lines.length, onNextTab, onPrevTab, onToggleTerminal, handleFormatCode, showFeedback]);

  // Keyboard events listener
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modifier = isMac ? e.metaKey : e.ctrlKey;

    // Tab key
    if (e.key === 'Tab') {
      e.preventDefault();
      handleInsertText(' '.repeat(settings.tabSize || 2));
      return;
    }

    // Smart Auto-Indent on Enter
    if (e.key === 'Enter' && settings.autoIndent && !e.shiftKey && !modifier) {
      const textarea = textareaRef.current;
      if (textarea) {
        e.preventDefault();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const value = textarea.value;

        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const currentLineBeforeCursor = value.slice(lineStart, start);
        const leadingMatch = currentLineBeforeCursor.match(/^(\s*)/);
        const baseIndent = leadingMatch ? leadingMatch[1] : '';
        const trimmedBefore = currentLineBeforeCursor.trim();

        const indentUnit = ' '.repeat(settings.tabSize || 2);
        const opensBlock =
          trimmedBefore.endsWith('{') ||
          trimmedBefore.endsWith('[') ||
          trimmedBefore.endsWith('(') ||
          (file.language === 'python' && trimmedBefore.endsWith(':'));

        const nextIndent = opensBlock ? baseIndent + indentUnit : baseIndent;
        const charAfter = value[end];
        const isBetweenMatchingBrackets =
          (trimmedBefore.endsWith('{') && charAfter === '}') ||
          (trimmedBefore.endsWith('[') && charAfter === ']') ||
          (trimmedBefore.endsWith('(') && charAfter === ')');

        const insertion = isBetweenMatchingBrackets
          ? `\n${nextIndent}\n${baseIndent}`
          : `\n${nextIndent}`;

        const newValue = value.slice(0, start) + insertion + value.slice(end);
        const newCursorPos = start + 1 + nextIndent.length;

        onChange(newValue);
        requestAnimationFrame(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = newCursorPos;
            textareaRef.current.selectionEnd = newCursorPos;
          }
        });
        return;
      }
    }

    // Ctrl/Cmd + S -> Save
    if (modifier && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      if (onSave) onSave();
      return;
    }

    // Ctrl/Cmd + F -> Find
    if (modifier && (e.key === 'f' || e.key === 'F')) {
      e.preventDefault();
      setShowFindBar(true);
      return;
    }

    // Ctrl/Cmd + / -> Toggle comment
    if (modifier && e.key === '/') {
      e.preventDefault();
      handleToggleComment();
      return;
    }

    // Ctrl/Cmd + Z / Y
    if (modifier && (e.key === 'z' || e.key === 'Z')) {
      e.preventDefault();
      if (e.shiftKey) {
        handleRedo();
      } else {
        handleUndo();
      }
      return;
    }
  };

  // Find & Replace Search
  useEffect(() => {
    if (!findQuery) {
      setFindMatches([]);
      return;
    }
    const matches: number[] = [];
    let pos = 0;
    const query = findQuery.toLowerCase();
    const contentLower = file.content.toLowerCase();
    while ((pos = contentLower.indexOf(query, pos)) !== -1) {
      matches.push(pos);
      pos += query.length;
    }
    setFindMatches(matches);
    setActiveMatchIndex(0);
  }, [findQuery, file.content]);

  const handleNextMatch = () => {
    if (findMatches.length === 0) return;
    const next = (activeMatchIndex + 1) % findMatches.length;
    setActiveMatchIndex(next);
    jumpToMatch(findMatches[next]);
  };

  const handlePrevMatch = () => {
    if (findMatches.length === 0) return;
    const prev = (activeMatchIndex - 1 + findMatches.length) % findMatches.length;
    setActiveMatchIndex(prev);
    jumpToMatch(findMatches[prev]);
  };

  const jumpToMatch = (startPos: number) => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    el.focus();
    el.setSelectionRange(startPos, startPos + findQuery.length);
  };

  const handleReplaceOne = () => {
    if (findMatches.length === 0 || !textareaRef.current) return;
    const matchPos = findMatches[activeMatchIndex];
    const before = file.content.substring(0, matchPos);
    const after = file.content.substring(matchPos + findQuery.length);
    handleTextChange(before + replaceQuery + after);
  };

  const handleReplaceAll = () => {
    if (!findQuery) return;
    const escaped = findQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'g');
    handleTextChange(file.content.replace(regex, replaceQuery));
  };

  // Syntax highlighted HTML
  const highlightedHtml = useMemo(() => {
    return highlightCode(file.content, file.language as LanguageId);
  }, [file.content, file.language]);

  return (
    <div
      className="relative flex flex-col flex-1 h-full w-full overflow-hidden select-text"
      style={{
        backgroundColor: activeTheme.bgMain,
        color: activeTheme.textPrimary,
      }}
    >
      {/* Floating Find & Replace Bar */}
      {showFindBar && (
        <div
          className="absolute top-2 right-4 z-30 p-2.5 rounded-lg border shadow-2xl flex flex-col gap-2 max-w-sm w-80 text-xs backdrop-blur-md"
          style={{
            backgroundColor: activeTheme.bgSidebar,
            borderColor: activeTheme.border,
          }}
        >
          <div className="flex items-center gap-1.5">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Find..."
              value={findQuery}
              onChange={(e) => setFindQuery(e.target.value)}
              className="flex-1 bg-[#1e2227] px-2 py-1 rounded text-white border border-[#3e4451] focus:outline-hidden focus:border-[#991b1b] font-mono text-xs"
              autoFocus
            />
            <span className="text-[10px] text-gray-400 shrink-0 font-mono">
              {findMatches.length > 0 ? `${activeMatchIndex + 1}/${findMatches.length}` : '0/0'}
            </span>
            <button
              type="button"
              onClick={handlePrevMatch}
              className="p-1 hover:bg-[#3e4451] rounded text-gray-300"
              title="Previous Match"
            >
              <ChevronUp size={14} />
            </button>
            <button
              type="button"
              onClick={handleNextMatch}
              className="p-1 hover:bg-[#3e4451] rounded text-gray-300"
              title="Next Match"
            >
              <ChevronDown size={14} />
            </button>
            <button
              type="button"
              onClick={() => setShowFindBar(false)}
              className="p-1 hover:bg-[#3e4451] rounded text-gray-400 hover:text-white"
            >
              <X size={14} />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <Replace size={14} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Replace..."
              value={replaceQuery}
              onChange={(e) => setReplaceQuery(e.target.value)}
              className="flex-1 bg-[#1e2227] px-2 py-1 rounded text-white border border-[#3e4451] focus:outline-hidden focus:border-[#991b1b] font-mono text-xs"
            />
            <button
              type="button"
              onClick={handleReplaceOne}
              className="px-2 py-1 bg-[#3e4451] hover:bg-[#4d5565] text-white rounded font-medium text-[10px]"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleReplaceAll}
              className="px-2 py-1 bg-[#991b1b] hover:bg-[#7f1d1d] text-white rounded font-medium text-[10px]"
            >
              All
            </button>
          </div>
        </div>
      )}

      {/* Floating Gesture Feedback HUD */}
      {gestureFeedback && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#181818]/90 backdrop-blur-md border border-[#991b1b]/80 text-white shadow-2xl shadow-[#991b1b]/20 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
          <span className="text-lg">{gestureFeedback.icon}</span>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white tracking-wide">{gestureFeedback.title}</span>
            <span className="text-[10px] text-red-300 font-mono">{gestureFeedback.detail}</span>
          </div>
        </div>
      )}

      {/* Editor Main Canvas with Gutter */}
      <div ref={editorCanvasRef} className="relative flex flex-1 w-full overflow-hidden touch-none sm:touch-auto">
        {/* Line Gutter with Breakpoint Dots */}
        <div
          ref={gutterRef}
          className="select-none flex flex-col items-end py-3 px-1.5 border-r shrink-0 overflow-hidden z-10"
          style={{
            backgroundColor: activeTheme.bgGutter,
            borderColor: activeTheme.border,
            width: lines.length > 999 ? '56px' : '44px',
            lineHeight: `${fontSize * 1.55}px`,
            fontSize: `${fontSize * 0.88}px`,
            fontFamily: "'Fira Code', Menlo, Monaco, Consolas, monospace",
          }}
        >
          {lines.map((_, index) => {
            const lineNum = index + 1;
            const hasBreakpoint = fileBreakpoints.has(lineNum);
            const isDebugLine = activeDebugLine === lineNum;

            return (
              <div
                key={lineNum}
                onClick={() => onToggleBreakpoint(file.id, file.path, lineNum)}
                className="group relative w-full flex items-center justify-between cursor-pointer px-0.5 rounded-sm hover:bg-[#343746]/40 transition-colors"
                style={{ height: `${fontSize * 1.55}px` }}
                title={`Tap to ${hasBreakpoint ? 'remove' : 'add'} breakpoint at line ${lineNum}`}
              >
                {/* Breakpoint Dot */}
                <div className="w-3 flex items-center justify-center">
                  {hasBreakpoint ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500/80 animate-pulse" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-red-400/0 group-hover:bg-red-500/40 transition-colors" />
                  )}
                  {isDebugLine && (
                    <span className="absolute -left-1 text-amber-400 font-bold text-xs">➜</span>
                  )}
                </div>

                {/* Line number text */}
                <span
                  className={`font-mono text-right transition-colors ${
                    isDebugLine
                      ? 'text-amber-400 font-bold'
                      : hasBreakpoint
                      ? 'text-red-400 font-semibold'
                      : 'text-gray-500 group-hover:text-gray-300'
                  }`}
                >
                  {lineNum}
                </span>
              </div>
            );
          })}
        </div>

        {/* Text Container: Syntax Highlight Layer + Editable Transparent Textarea */}
        <div className="relative flex-1 h-full overflow-hidden">
          {/* Active debug line highlight backdrop */}
          {activeDebugLine && activeDebugLine <= lines.length && (
            <div
              className="absolute left-0 right-0 pointer-events-none z-0 border-y border-amber-500/40 bg-amber-500/15"
              style={{
                top: `${(activeDebugLine - 1) * (fontSize * 1.55) + 12}px`,
                height: `${fontSize * 1.55}px`,
              }}
            />
          )}

          {/* Syntax Highlighted Mirror Layer */}
          <pre
            ref={preRef}
            aria-hidden="true"
            className="absolute inset-0 m-0 py-3 px-3 overflow-hidden pointer-events-none font-mono whitespace-pre select-none z-1"
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: `${fontSize * 1.55}px`,
              fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, monospace",
              tabSize: settings.tabSize || 2,
            }}
            dangerouslySetInnerHTML={{ __html: highlightedHtml + '\n' }}
          />

          {/* Real Input Textarea with touch handling */}
          <textarea
            ref={textareaRef}
            value={file.content}
            onChange={(e) => handleTextChange(e.target.value)}
            onSelect={updateCursorPosition}
            onClick={updateCursorPosition}
            onKeyUp={updateCursorPosition}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            wrap={settings.wordWrap ? 'on' : 'off'}
            className="absolute inset-0 w-full h-full m-0 py-3 px-3 bg-transparent text-transparent caret-red-400 focus:outline-hidden font-mono resize-none overflow-auto z-2 selection:bg-[#991b1b]/40"
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: `${fontSize * 1.55}px`,
              fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, monospace",
              tabSize: settings.tabSize || 2,
            }}
          />

          {/* Subtle Scroll-Indicator Overlay (Mini-map style viewport indicator) */}
          <div
            aria-hidden="true"
            onClick={(e) => {
              const el = textareaRef.current;
              if (!el) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const clickRatio = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
              const maxScroll = el.scrollHeight - el.clientHeight;
              if (maxScroll > 0) {
                el.scrollTo({ top: clickRatio * maxScroll, behavior: 'smooth' });
              }
            }}
            title="Scroll position indicator"
            className="absolute top-1 bottom-1 right-1 w-2 rounded-full bg-white/5 hover:bg-white/10 z-10 cursor-pointer transition-colors"
          >
            <div
              className="w-full rounded-full bg-[#991b1b]/75 hover:bg-[#991b1b] transition-all duration-75 shadow-xs"
              style={{
                position: 'absolute',
                top: `${scrollMetrics.topPercent}%`,
                height: `${scrollMetrics.heightPercent}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Touch Coding Accessory Bar for Mobile */}
      <TouchKeyboardBar
        onInsertText={handleInsertText}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onMoveCursor={handleMoveCursor}
        onToggleComment={handleToggleComment}
        onFormatCode={handleFormatCode}
        onZoom={(delta) => setFontSize((f) => Math.min(22, Math.max(10, f + delta)))}
        fontSize={fontSize}
      />
    </div>
  );
};
