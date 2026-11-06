/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Download,
  Star,
  Check,
  ShieldCheck,
  Settings as SettingsIcon,
  BookOpen,
  Code2,
  Palette,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { Extension } from '../../types/vscode.ts';

interface PluginDetailModalProps {
  extension: Extension | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleEnabled: (id: string) => void;
  onInstall: (id: string) => void;
  onUninstall: (id: string) => void;
  onApplyTheme?: (themeId: string) => void;
}

export const PluginDetailModal: React.FC<PluginDetailModalProps> = ({
  extension,
  isOpen,
  onClose,
  onToggleEnabled,
  onInstall,
  onUninstall,
  onApplyTheme,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'settings'>('details');

  // Plugin configurable settings state
  const [pluginSettings, setPluginSettings] = useState<Record<string, any>>({
    'prettier.singleQuote': true,
    'prettier.semi': true,
    'prettier.tabWidth': 2,
    'eslint.autoFixOnSave': true,
    'vim.useSystemClipboard': true,
    'livePreview.port': 5173,
    'copilot.inlineSuggest': true,
  });

  if (!isOpen || !extension) return null;

  const toggleSetting = (key: string) => {
    setPluginSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-3 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[#1e222a] border border-[#2d3748] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-xs text-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 bg-[#242934] border-b border-[#2d3748]">
          <div className="flex items-start gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-[#181a20] border border-[#333e50] flex items-center justify-center text-3xl shadow-md shrink-0">
              {extension.icon}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{extension.displayName}</h2>
                <span className="text-[10px] text-gray-400 font-mono">v{extension.version}</span>
              </div>
              <div className="text-[11px] text-gray-400 font-mono mt-0.5">{extension.name}</div>

              <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400">
                <span className="text-blue-400 font-semibold flex items-center gap-1">
                  <ShieldCheck size={13} className="text-blue-400" />
                  <span>{extension.publisher}</span>
                </span>
                <div className="flex items-center gap-1 text-amber-400">
                  <Star size={12} fill="currentColor" />
                  <span>{extension.rating}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-300">
                  <Download size={12} />
                  <span>{extension.downloads}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-[#343d4d] text-gray-400 hover:text-white rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Action Button Row */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-[#1a1d24] border-b border-[#2d3748]">
          <div className="flex items-center gap-2">
            {extension.installed ? (
              <>
                <button
                  type="button"
                  onClick={() => onToggleEnabled(extension.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    extension.enabled
                      ? 'bg-[#991b1b]/30 text-red-300 border border-[#991b1b]/50 hover:bg-[#991b1b]/40'
                      : 'bg-[#2b3342] text-gray-300 hover:text-white'
                  }`}
                >
                  {extension.enabled ? 'Disable' : 'Enable'}
                </button>

                <button
                  type="button"
                  onClick={() => onUninstall(extension.id)}
                  className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-lg text-xs font-semibold border border-rose-500/30 transition-colors"
                >
                  Uninstall
                </button>

                {extension.themeId && onApplyTheme && (
                  <button
                    type="button"
                    onClick={() => onApplyTheme(extension.themeId!)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#991b1b] hover:bg-[#7f1d1d] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                  >
                    <Palette size={13} />
                    <span>Set Color Theme</span>
                  </button>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={() => onInstall(extension.id)}
                className="px-4 py-1.5 bg-[#991b1b] hover:bg-[#7f1d1d] text-white rounded-lg text-xs font-bold shadow-md shadow-[#991b1b]/30 transition-all active:scale-95"
              >
                Install
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 text-[11px]">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`px-2.5 py-1 rounded-md font-medium ${
                activeTab === 'details' ? 'bg-[#2c3444] text-white' : 'text-gray-400'
              }`}
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`px-2.5 py-1 rounded-md font-medium ${
                activeTab === 'settings' ? 'bg-[#2c3444] text-white' : 'text-gray-400'
              }`}
            >
              Extension Settings
            </button>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'details' ? (
            <div className="space-y-3">
              <div className="text-gray-300 leading-relaxed text-xs">
                {extension.description}
              </div>

              <div className="p-3 bg-[#16181f] rounded-xl border border-[#283140] space-y-2">
                <div className="font-semibold text-white uppercase text-[10px] tracking-wider">
                  Plugin Highlights
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-300">
                  <div className="flex items-center gap-1.5">
                    <Check size={13} className="text-red-400" />
                    <span>Touch-optimised UI</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check size={13} className="text-red-400" />
                    <span>Cloud synced across devices</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check size={13} className="text-red-400" />
                    <span>Zero latency execution</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check size={13} className="text-red-400" />
                    <span>Works completely offline</span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-gray-400 space-y-1">
                <div>Category: <span className="text-white font-medium">{extension.category}</span></div>
                <div>Identifier: <span className="text-white font-mono">{extension.name}</span></div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-xs text-gray-300 mb-2">
                Configure user preferences for <span className="font-semibold text-white">{extension.displayName}</span>:
              </div>

              {extension.category === 'Formatters' && (
                <div className="space-y-2.5">
                  <label className="flex items-center justify-between p-2.5 bg-[#16181f] rounded-xl border border-[#283140] cursor-pointer">
                    <div>
                      <span className="font-semibold text-white block">Prettier: Single Quote</span>
                      <span className="text-[10px] text-gray-400">Use single quotes instead of double quotes</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={pluginSettings['prettier.singleQuote']}
                      onChange={() => toggleSetting('prettier.singleQuote')}
                      className="accent-red-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 bg-[#16181f] rounded-xl border border-[#283140] cursor-pointer">
                    <div>
                      <span className="font-semibold text-white block">Prettier: Semicolons</span>
                      <span className="text-[10px] text-gray-400">Print semicolons at the ends of statements</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={pluginSettings['prettier.semi']}
                      onChange={() => toggleSetting('prettier.semi')}
                      className="accent-red-600 rounded"
                    />
                  </label>
                </div>
              )}

              {extension.category === 'Linters' && (
                <div className="space-y-2.5">
                  <label className="flex items-center justify-between p-2.5 bg-[#16181f] rounded-xl border border-[#283140] cursor-pointer">
                    <div>
                      <span className="font-semibold text-white block">ESLint: Auto-Fix on Save</span>
                      <span className="text-[10px] text-gray-400">Automatically fix lint errors during save</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={pluginSettings['eslint.autoFixOnSave']}
                      onChange={() => toggleSetting('eslint.autoFixOnSave')}
                      className="accent-red-600 rounded"
                    />
                  </label>
                </div>
              )}

              {extension.category === 'Tools' && (
                <div className="space-y-2.5">
                  <label className="flex items-center justify-between p-2.5 bg-[#16181f] rounded-xl border border-[#283140] cursor-pointer">
                    <div>
                      <span className="font-semibold text-white block">Copilot: Inline Suggestions</span>
                      <span className="text-[10px] text-gray-400">Enable real-time code snippet completions</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={pluginSettings['copilot.inlineSuggest']}
                      onChange={() => toggleSetting('copilot.inlineSuggest')}
                      className="accent-red-600 rounded"
                    />
                  </label>
                </div>
              )}

              {extension.category === 'Themes' && (
                <div className="p-4 bg-[#16181f] rounded-xl border border-[#283140] text-center space-y-2">
                  <Palette size={24} className="text-red-400 mx-auto" />
                  <div className="font-semibold text-white">Theme Configuration</div>
                  <p className="text-[11px] text-gray-400">
                    You can further fine-tune this theme's colors using the Theme Customizer Studio.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
