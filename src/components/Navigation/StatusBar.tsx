/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  GitBranch,
  Cloud,
  AlertCircle,
  AlertTriangle,
  Bell,
  CheckCheck,
  Check,
  Sparkles,
  Command,
} from 'lucide-react';
import { LanguageId } from '../../types/vscode.ts';

interface StatusBarProps {
  gitBranch: string;
  isCloudSynced: boolean;
  errorCount: number;
  warningCount: number;
  cursorLine: number;
  cursorCol: number;
  tabSize: number;
  language: LanguageId;
  onOpenCommandPalette: () => void;
  onOpenCloudSync: () => void;
  onOpenProblems: () => void;
  onFormatDocument: () => void;
  statusBarBg?: string;
  statusBarFg?: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  gitBranch,
  isCloudSynced,
  errorCount,
  warningCount,
  cursorLine,
  cursorCol,
  tabSize,
  language,
  onOpenCommandPalette,
  onOpenCloudSync,
  onOpenProblems,
  onFormatDocument,
  statusBarBg = '#7f1d1d',
  statusBarFg = '#ffffff',
}) => {
  return (
    <div
      className="flex items-center justify-between px-2 py-0.5 text-[11px] select-none shrink-0 h-6.5 font-sans z-20 transition-colors"
      style={{
        backgroundColor: statusBarBg,
        color: statusBarFg,
      }}
    >
      {/* Left section: Git, Sync, Problems */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
        {/* Remote / Git Branch */}
        <button
          type="button"
          className="flex items-center gap-1 px-1.5 py-0.5 hover:bg-white/20 rounded cursor-pointer transition-colors"
          title={`Git repository branch: ${gitBranch}`}
        >
          <GitBranch size={12} />
          <span className="font-medium font-mono">{gitBranch}</span>
        </button>

        {/* Cloud Sync Indicator */}
        <button
          type="button"
          onClick={onOpenCloudSync}
          className="flex items-center gap-1 px-1.5 py-0.5 hover:bg-white/20 rounded cursor-pointer transition-colors"
          title={isCloudSynced ? 'Cloud Synced across devices' : 'Syncing changes...'}
        >
          <Cloud size={12} />
          <span className="hidden sm:inline">{isCloudSynced ? 'Synced' : 'Syncing...'}</span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isCloudSynced ? 'bg-emerald-300' : 'bg-amber-300 animate-pulse'
            }`}
          />
        </button>

        {/* Problems Badges */}
        <button
          type="button"
          onClick={onOpenProblems}
          className="flex items-center gap-2 px-1.5 py-0.5 hover:bg-white/20 rounded cursor-pointer transition-colors font-mono"
          title="Workspace Diagnostics"
        >
          <div className="flex items-center gap-0.5">
            <AlertCircle size={11} className={errorCount > 0 ? 'text-rose-200' : ''} />
            <span>{errorCount}</span>
          </div>
          <div className="flex items-center gap-0.5">
            <AlertTriangle size={11} className={warningCount > 0 ? 'text-amber-200' : ''} />
            <span>{warningCount}</span>
          </div>
        </button>
      </div>

      {/* Right section: Position, Indent, Encoding, Language, Prettier */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Quick Command Palette launcher */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 hover:bg-white/20 rounded cursor-pointer transition-colors font-mono text-[10px]"
          title="Command Palette (Ctrl+Shift+P)"
        >
          <Command size={11} />
          <span>Cmd+P</span>
        </button>

        {/* Cursor Coordinates */}
        <span className="hidden sm:inline px-1 font-mono">
          Ln {cursorLine}, Col {cursorCol}
        </span>

        {/* Spaces Indent */}
        <span className="hidden md:inline px-1">Spaces: {tabSize}</span>

        {/* Encoding */}
        <span className="hidden lg:inline px-1">UTF-8</span>

        {/* Prettier Formatter Icon */}
        <button
          type="button"
          onClick={onFormatDocument}
          className="flex items-center gap-1 px-1.5 py-0.5 hover:bg-white/20 rounded cursor-pointer transition-colors"
          title="Prettier Formatter Active (Click to Format)"
        >
          <CheckCheck size={13} className="text-emerald-200" />
          <span className="hidden md:inline">Prettier</span>
        </button>

        {/* Language Mode */}
        <span className="px-1.5 py-0.5 bg-black/20 rounded font-medium capitalize">
          {language}
        </span>
      </div>
    </div>
  );
};
