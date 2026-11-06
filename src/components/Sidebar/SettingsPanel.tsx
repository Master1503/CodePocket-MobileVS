/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Settings,
  Palette,
  Type,
  Keyboard,
  Cloud,
  Laptop,
  Check,
  RotateCcw,
} from 'lucide-react';
import { UserSettings } from '../../types/vscode.ts';
import { THEMES } from '../../constants/themes.ts';

interface SettingsPanelProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onOpenCloudSync: () => void;
  syncCode: string;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onUpdateSettings,
  onOpenCloudSync,
  syncCode,
}) => {
  return (
    <div className="flex flex-col h-full w-full bg-[#252526] text-[#cccccc] text-xs overflow-hidden select-none">
      {/* Settings Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#3c3c3c]">
        <div className="flex items-center gap-1.5">
          <Settings size={14} className="text-gray-300" />
          <span className="uppercase text-[11px] font-bold tracking-wider text-gray-300">
            Settings & Keyboard
          </span>
        </div>
      </div>

      {/* Settings Form */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Color Theme */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-gray-300 font-medium">
            <Palette size={14} className="text-purple-400" />
            <span>Workbench Theme</span>
          </div>
          <select
            value={settings.theme}
            onChange={(e) => onUpdateSettings({ theme: e.target.value })}
            className="w-full bg-[#1e1e1e] text-white p-2 rounded border border-[#3c3c3c] focus:border-blue-500 focus:outline-hidden font-mono text-xs"
          >
            {Object.entries(THEMES).map(([id, t]) => (
              <option key={id} value={id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Font Size & Tab Size */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-gray-300 font-medium text-[11px]">Editor Font Size</label>
            <div className="flex items-center gap-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded px-2 py-1">
              <input
                type="number"
                min="10"
                max="24"
                value={settings.fontSize}
                onChange={(e) => onUpdateSettings({ fontSize: parseInt(e.target.value, 10) || 13 })}
                className="w-full bg-transparent text-white text-xs focus:outline-hidden font-mono"
              />
              <span className="text-[10px] text-gray-500">px</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-gray-300 font-medium text-[11px]">Tab Indent Size</label>
            <select
              value={settings.tabSize}
              onChange={(e) => onUpdateSettings({ tabSize: parseInt(e.target.value, 10) || 2 })}
              className="w-full bg-[#1e1e1e] text-white p-1.5 rounded border border-[#3c3c3c] focus:outline-hidden font-mono text-xs"
            >
              <option value="2">2 spaces</option>
              <option value="4">4 spaces</option>
            </select>
          </div>
        </div>

        {/* Editor Toggles */}
        <div className="space-y-2 pt-2 border-t border-[#333333]">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
            Editor Behaviors
          </div>

          <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-[#2a2d2e] rounded">
            <span className="text-gray-200">Word Wrap</span>
            <input
              type="checkbox"
              checked={settings.wordWrap}
              onChange={(e) => onUpdateSettings({ wordWrap: e.target.checked })}
              className="rounded accent-blue-600"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-[#2a2d2e] rounded">
            <span className="text-gray-200">Format on Save</span>
            <input
              type="checkbox"
              checked={settings.formatOnSave}
              onChange={(e) => onUpdateSettings({ formatOnSave: e.target.checked })}
              className="rounded accent-blue-600"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-[#2a2d2e] rounded">
            <span className="text-gray-200">Bracket Pair Matching</span>
            <input
              type="checkbox"
              checked={settings.bracketMatching}
              onChange={(e) => onUpdateSettings({ bracketMatching: e.target.checked })}
              className="rounded accent-blue-600"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-[#2a2d2e] rounded">
            <span className="text-gray-200">Smart Auto-Indent</span>
            <input
              type="checkbox"
              checked={settings.autoIndent}
              onChange={(e) => onUpdateSettings({ autoIndent: e.target.checked })}
              className="rounded accent-[#991b1b]"
            />
          </label>
        </div>

        {/* Cloud Sync Manager */}
        <div className="p-3 bg-[#1e222a] border border-[#2d3748] rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
              <Cloud size={14} />
              <span>Cross-Device Cloud Sync</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <div className="text-[11px] text-gray-400">
            Current Pairing Code:
            <span className="font-mono text-white font-bold ml-1.5 bg-[#252d3d] px-1.5 py-0.5 rounded border border-[#3e4c66]">
              {syncCode}
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenCloudSync}
            className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-xs shadow-xs"
          >
            Manage Connected Devices
          </button>
        </div>

        {/* External Keyboard Shortcuts Reference */}
        <div className="space-y-2 pt-2 border-t border-[#333333]">
          <div className="flex items-center gap-1.5 text-gray-300 font-medium">
            <Keyboard size={14} className="text-amber-400" />
            <span>Hardware Keyboard Shortcuts</span>
          </div>

          <div className="divide-y divide-[#2d2d2d] bg-[#1e1e1e] rounded-lg border border-[#333333] text-[11px] font-mono">
            {[
              { key: 'Ctrl / Cmd + P', desc: 'Quick Open file' },
              { key: 'Ctrl / Cmd + Shift + P', desc: 'Command Palette' },
              { key: 'Ctrl / Cmd + B', desc: 'Toggle Sidebar' },
              { key: 'Ctrl / Cmd + `', desc: 'Toggle Terminal' },
              { key: 'Ctrl / Cmd + S', desc: 'Save active file' },
              { key: 'Ctrl / Cmd + F', desc: 'Find & Replace' },
              { key: 'Ctrl / Cmd + /', desc: 'Toggle line comment' },
              { key: 'F5', desc: 'Start / Continue Debug' },
              { key: 'F10', desc: 'Step Over in Debugger' },
              { key: 'F11', desc: 'Step Into in Debugger' },
            ].map((sc) => (
              <div key={sc.key} className="flex items-center justify-between px-2.5 py-1.5">
                <span className="text-gray-400 font-sans">{sc.desc}</span>
                <span className="bg-[#2a2d2e] text-blue-300 px-1.5 py-0.5 rounded text-[10px] border border-[#3e4451]">
                  {sc.key}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
