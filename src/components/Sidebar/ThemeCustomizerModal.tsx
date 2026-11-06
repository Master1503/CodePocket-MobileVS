/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Palette,
  X,
  Check,
  RotateCcw,
  Download,
  Upload,
  Eye,
  Sparkles,
  Sliders,
  Copy,
  CheckCircle2,
} from 'lucide-react';
import { ThemeColors, SyntaxColors, THEMES } from '../../constants/themes.ts';

interface ThemeCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeColors;
  onApplyTheme: (theme: ThemeColors) => void;
}

export const ThemeCustomizerModal: React.FC<ThemeCustomizerModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onApplyTheme,
}) => {
  const [themeName, setThemeName] = useState(
    currentTheme.isCustom ? currentTheme.name : `${currentTheme.name} (Custom Red)`
  );

  // Workbench colors state
  const [bgMain, setBgMain] = useState(currentTheme.bgMain);
  const [bgSidebar, setBgSidebar] = useState(currentTheme.bgSidebar);
  const [bgActivity, setBgActivity] = useState(currentTheme.bgActivity);
  const [bgTabActive, setBgTabActive] = useState(currentTheme.bgTabActive);
  const [bgTabInactive, setBgTabInactive] = useState(currentTheme.bgTabInactive);
  const [bgGutter, setBgGutter] = useState(currentTheme.bgGutter);
  const [bgAccent, setBgAccent] = useState(currentTheme.bgAccent || '#991b1b');
  const [statusBarBg, setStatusBarBg] = useState(currentTheme.statusBarBg || '#7f1d1d');
  const [statusBarFg, setStatusBarFg] = useState(currentTheme.statusBarFg || '#ffffff');
  const [textPrimary, setTextPrimary] = useState(currentTheme.textPrimary);
  const [border, setBorder] = useState(currentTheme.border);

  // Syntax tokens state
  const [syntax, setSyntax] = useState<SyntaxColors>(
    currentTheme.syntax || {
      keyword: '#ff4d4d',
      string: '#fca5a5',
      function: '#ff7878',
      number: '#fda4af',
      comment: '#888888',
      variable: '#fecdd3',
      operator: '#f87171',
    }
  );

  const [activeTab, setActiveTab] = useState<'workbench' | 'syntax' | 'preview'>('workbench');
  const [copiedCode, setCopiedCode] = useState(false);
  const [savedStatus, setSavedStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  // Red accent swatches
  const accentSwatches = [
    { label: 'Crimson Red', hex: '#e51400' },
    { label: 'Ruby Red', hex: '#dc2626' },
    { label: 'Flame Scarlet', hex: '#ef4444' },
    { label: 'Rose Gold', hex: '#f43f5e' },
    { label: 'Dark Cherry', hex: '#991b1b' },
    { label: 'Sunset Orange', hex: '#ea580c' },
    { label: 'Electric Blue', hex: '#0078d4' },
    { label: 'Cyber Violet', hex: '#bd93f9' },
  ];

  const handleApplyChanges = () => {
    const customTheme: ThemeColors = {
      id: 'custom-' + Date.now(),
      name: themeName.trim() || 'Custom Red Theme',
      type: 'dark',
      bgMain,
      bgSidebar,
      bgActivity,
      bgTabActive,
      bgTabInactive,
      bgGutter,
      bgHover: '#2a2d2e',
      bgAccent,
      border,
      textPrimary,
      textSecondary: '#999999',
      textMuted: '#6e6e6e',
      statusBarBg,
      statusBarFg,
      terminalBg: bgMain,
      selectionBg: bgAccent + '40',
      activeLineBg: bgMain,
      syntax,
      isCustom: true,
    };

    onApplyTheme(customTheme);
    setSavedStatus('Theme applied & active in IDE!');
    setTimeout(() => {
      setSavedStatus(null);
      onClose();
    }, 1000);
  };

  const handleExportThemeJson = () => {
    const exportData = {
      name: themeName,
      type: 'dark',
      colors: {
        'editor.background': bgMain,
        'activityBar.background': bgActivity,
        'sideBar.background': bgSidebar,
        'tab.activeBackground': bgTabActive,
        'tab.inactiveBackground': bgTabInactive,
        'statusBar.background': statusBarBg,
        'statusBar.foreground': statusBarFg,
        'accent.color': bgAccent,
      },
      tokenColors: [
        { scope: ['keyword', 'storage.type'], settings: { foreground: syntax.keyword } },
        { scope: ['string'], settings: { foreground: syntax.string } },
        { scope: ['entity.name.function'], settings: { foreground: syntax.function } },
        { scope: ['constant.numeric'], settings: { foreground: syntax.number } },
        { scope: ['comment'], settings: { foreground: syntax.comment, fontStyle: 'italic' } },
        { scope: ['variable'], settings: { foreground: syntax.variable } },
      ],
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${themeName.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetToTheme = (presetKey: string) => {
    const preset = THEMES[presetKey];
    if (!preset) return;
    setBgMain(preset.bgMain);
    setBgSidebar(preset.bgSidebar);
    setBgActivity(preset.bgActivity);
    setBgTabActive(preset.bgTabActive);
    setBgTabInactive(preset.bgTabInactive);
    setBgGutter(preset.bgGutter);
    setBgAccent('#dc2626'); // Keep red primary accent
    setStatusBarBg('#dc2626');
    setStatusBarFg('#ffffff');
    setTextPrimary(preset.textPrimary);
    setBorder(preset.border);
    if (preset.syntax) {
      setSyntax(preset.syntax);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-3 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#1e222a] border border-[#2d3748] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-xs text-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#242934] border-b border-[#2d3748]">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold shadow-sm"
              style={{ backgroundColor: bgAccent }}
            >
              <Palette size={17} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Theme Customizer Studio</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-950/80 text-red-400 border border-red-500/40">
                  Red Accent Active
                </span>
              </h2>
              <p className="text-[11px] text-gray-400">
                Tailor UI workbench colors, red primary accents, and syntax highlighting tokens
              </p>
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

        {/* Subnavigation Tabs */}
        <div className="flex items-center justify-between px-5 py-2 bg-[#1a1d24] border-b border-[#2d3748]">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('workbench')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'workbench'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-gray-400 hover:text-white hover:bg-[#252b37]'
              }`}
            >
              Workbench &amp; Accents
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('syntax')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'syntax'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-gray-400 hover:text-white hover:bg-[#252b37]'
              }`}
            >
              Syntax Token Colors
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'preview'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-gray-400 hover:text-white hover:bg-[#252b37]'
              }`}
            >
              Live Code Preview
            </button>
          </div>

          {/* Quick presets starter */}
          <div className="flex items-center gap-1 text-[11px] text-gray-400">
            <span>Base:</span>
            {['one-dark-pro', 'dark-modern', 'dracula', 'cyberpunk'].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => handleResetToTheme(k)}
                className="px-1.5 py-0.5 bg-[#252b37] hover:bg-[#31394a] text-gray-300 rounded text-[10px]"
              >
                {k.split('-')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {savedStatus && (
            <div className="p-3 bg-red-950/60 border border-red-500/40 text-red-200 rounded-xl flex items-center gap-2 text-xs">
              <CheckCircle2 size={16} className="text-red-400" />
              <span>{savedStatus}</span>
            </div>
          )}

          {/* Workbench Tab */}
          {activeTab === 'workbench' && (
            <div className="space-y-4">
              {/* Theme Name input */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-300">Theme Name</label>
                <input
                  type="text"
                  value={themeName}
                  onChange={(e) => setThemeName(e.target.value)}
                  className="w-full bg-[#16181f] border border-[#2d3748] rounded-xl px-3 py-1.5 text-white font-mono text-xs focus:outline-hidden focus:border-red-500"
                />
              </div>

              {/* Primary Red Accent Selector */}
              <div className="p-3.5 bg-[#16181f] rounded-xl border border-[#283140] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: bgAccent }} />
                    <span>Primary Accent Color</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgAccent}
                      onChange={(e) => setBgAccent(e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={bgAccent}
                      onChange={(e) => setBgAccent(e.target.value)}
                      className="w-20 bg-[#232834] px-2 py-0.5 rounded text-white font-mono text-xs border border-[#3e4859]"
                    />
                  </div>
                </div>

                {/* Accent Swatches */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {accentSwatches.map((swatch) => (
                    <button
                      key={swatch.hex}
                      type="button"
                      onClick={() => {
                        setBgAccent(swatch.hex);
                        setStatusBarBg(swatch.hex);
                      }}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono border transition-all ${
                        bgAccent.toLowerCase() === swatch.hex.toLowerCase()
                          ? 'border-white text-white font-bold scale-105 shadow-sm'
                          : 'border-[#333e50] text-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: swatch.hex + '25' }}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: swatch.hex }} />
                      <span>{swatch.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Workbench Color Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Editor Background */}
                <div className="p-2.5 bg-[#16181f] rounded-xl border border-[#283140] flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-200">Editor Background</div>
                    <div className="text-[10px] text-gray-500 font-mono">bgMain</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={bgMain}
                      onChange={(e) => setBgMain(e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={bgMain}
                      onChange={(e) => setBgMain(e.target.value)}
                      className="w-18 bg-[#232834] px-1.5 py-0.5 rounded text-white font-mono text-[11px] border border-[#3e4859]"
                    />
                  </div>
                </div>

                {/* Sidebar Background */}
                <div className="p-2.5 bg-[#16181f] rounded-xl border border-[#283140] flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-200">Sidebar Background</div>
                    <div className="text-[10px] text-gray-500 font-mono">bgSidebar</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={bgSidebar}
                      onChange={(e) => setBgSidebar(e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={bgSidebar}
                      onChange={(e) => setBgSidebar(e.target.value)}
                      className="w-18 bg-[#232834] px-1.5 py-0.5 rounded text-white font-mono text-[11px] border border-[#3e4859]"
                    />
                  </div>
                </div>

                {/* Activity Bar Background */}
                <div className="p-2.5 bg-[#16181f] rounded-xl border border-[#283140] flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-200">Activity Bar</div>
                    <div className="text-[10px] text-gray-500 font-mono">bgActivity</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={bgActivity}
                      onChange={(e) => setBgActivity(e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={bgActivity}
                      onChange={(e) => setBgActivity(e.target.value)}
                      className="w-18 bg-[#232834] px-1.5 py-0.5 rounded text-white font-mono text-[11px] border border-[#3e4859]"
                    />
                  </div>
                </div>

                {/* Status Bar Background */}
                <div className="p-2.5 bg-[#16181f] rounded-xl border border-[#283140] flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-200">Status Bar</div>
                    <div className="text-[10px] text-gray-500 font-mono">statusBarBg</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={statusBarBg}
                      onChange={(e) => setStatusBarBg(e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={statusBarBg}
                      onChange={(e) => setStatusBarBg(e.target.value)}
                      className="w-18 bg-[#232834] px-1.5 py-0.5 rounded text-white font-mono text-[11px] border border-[#3e4859]"
                    />
                  </div>
                </div>

                {/* Active Tab Background */}
                <div className="p-2.5 bg-[#16181f] rounded-xl border border-[#283140] flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-200">Active Tab</div>
                    <div className="text-[10px] text-gray-500 font-mono">bgTabActive</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={bgTabActive}
                      onChange={(e) => setBgTabActive(e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={bgTabActive}
                      onChange={(e) => setBgTabActive(e.target.value)}
                      className="w-18 bg-[#232834] px-1.5 py-0.5 rounded text-white font-mono text-[11px] border border-[#3e4859]"
                    />
                  </div>
                </div>

                {/* Inactive Tab Background */}
                <div className="p-2.5 bg-[#16181f] rounded-xl border border-[#283140] flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-200">Inactive Tab</div>
                    <div className="text-[10px] text-gray-500 font-mono">bgTabInactive</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={bgTabInactive}
                      onChange={(e) => setBgTabInactive(e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={bgTabInactive}
                      onChange={(e) => setBgTabInactive(e.target.value)}
                      className="w-18 bg-[#232834] px-1.5 py-0.5 rounded text-white font-mono text-[11px] border border-[#3e4859]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Syntax Tokens Tab */}
          {activeTab === 'syntax' && (
            <div className="space-y-3">
              <p className="text-[11px] text-gray-400">
                Customize the syntax token colors rendered across JavaScript, TypeScript, Python, HTML, Rust and CSS:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { key: 'keyword', label: 'Keywords (const, function, return)', val: syntax.keyword },
                  { key: 'string', label: 'Strings ("hello", \'world\')', val: syntax.string },
                  { key: 'function', label: 'Functions & Methods', val: syntax.function },
                  { key: 'number', label: 'Numbers & Booleans', val: syntax.number },
                  { key: 'comment', label: 'Comments (//, /*)', val: syntax.comment },
                  { key: 'variable', label: 'Variables & Identifiers', val: syntax.variable },
                  { key: 'operator', label: 'Operators (=, +, &gt;)', val: syntax.operator },
                ].map(({ key, label, val }) => (
                  <div
                    key={key}
                    className="p-2.5 bg-[#16181f] rounded-xl border border-[#283140] flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-gray-200 block text-xs">{label}</span>
                      <span className="text-[10px] font-mono" style={{ color: val }}>
                        Sample token
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={val}
                        onChange={(e) =>
                          setSyntax((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                        className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={val}
                        onChange={(e) =>
                          setSyntax((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                        className="w-18 bg-[#232834] px-1.5 py-0.5 rounded text-white font-mono text-[11px] border border-[#3e4859]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Live Code Preview Tab */}
          {activeTab === 'preview' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl border font-mono text-xs overflow-hidden shadow-2xl" style={{ backgroundColor: bgMain, borderColor: border }}>
                {/* Mock Tab Strip */}
                <div className="flex items-center gap-1 pb-3 border-b mb-3" style={{ borderColor: border }}>
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-t font-semibold"
                    style={{
                      backgroundColor: bgTabActive,
                      borderTop: `2px solid ${bgAccent}`,
                      color: textPrimary,
                    }}
                  >
                    <span style={{ color: bgAccent }}>JS</span>
                    <span>gameEngine.js</span>
                  </div>
                  <div
                    className="px-3 py-1.5 rounded-t text-gray-400"
                    style={{ backgroundColor: bgTabInactive }}
                  >
                    README.md
                  </div>
                </div>

                {/* Mock Code Block */}
                <div className="leading-relaxed space-y-1">
                  <div>
                    <span style={{ color: syntax.comment }}>// CodePocket Theme Preview with Red Accent</span>
                  </div>
                  <div>
                    <span style={{ color: syntax.keyword }}>import</span>{' '}
                    <span style={{ color: syntax.variable }}>&#123; createEngine &#125;</span>{' '}
                    <span style={{ color: syntax.keyword }}>from</span>{' '}
                    <span style={{ color: syntax.string }}>'./core'</span>
                    <span style={{ color: syntax.operator }}>;</span>
                  </div>
                  <div>
                    <span style={{ color: syntax.keyword }}>function</span>{' '}
                    <span style={{ color: syntax.function }}>calculateScore</span>
                    <span style={{ color: syntax.operator }}>(</span>
                    <span style={{ color: syntax.variable }}>level</span>
                    <span style={{ color: syntax.operator }}>,</span>{' '}
                    <span style={{ color: syntax.variable }}>enemies</span>
                    <span style={{ color: syntax.operator }}>)</span>{' '}
                    <span style={{ color: syntax.operator }}>&#123;</span>
                  </div>
                  <div className="pl-4">
                    <span style={{ color: syntax.keyword }}>const</span>{' '}
                    <span style={{ color: syntax.variable }}>multiplier</span>{' '}
                    <span style={{ color: syntax.operator }}>=</span>{' '}
                    <span style={{ color: syntax.number }}>1.5</span>
                    <span style={{ color: syntax.operator }}>;</span>
                  </div>
                  <div className="pl-4">
                    <span style={{ color: syntax.keyword }}>return</span>{' '}
                    <span style={{ color: syntax.variable }}>level</span>{' '}
                    <span style={{ color: syntax.operator }}>*</span>{' '}
                    <span style={{ color: syntax.variable }}>enemies</span>{' '}
                    <span style={{ color: syntax.operator }}>*</span>{' '}
                    <span style={{ color: syntax.variable }}>multiplier</span>
                    <span style={{ color: syntax.operator }}>;</span>
                  </div>
                  <div>
                    <span style={{ color: syntax.operator }}>&#125;</span>
                  </div>
                </div>

                {/* Mock Status Bar */}
                <div
                  className="mt-4 px-3 py-1.5 rounded-b flex items-center justify-between text-[11px] font-sans"
                  style={{ backgroundColor: statusBarBg, color: statusBarFg }}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold">main</span>
                    <span>•</span>
                    <span>Synced to Cloud</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Ln 12, Col 8</span>
                    <span>Spaces: 2</span>
                    <span>JavaScript</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#242934] border-t border-[#2d3748]">
          <button
            type="button"
            onClick={handleExportThemeJson}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e222a] hover:bg-[#2b3342] text-gray-300 hover:text-white rounded-xl border border-[#374254] transition-colors"
          >
            <Download size={14} />
            <span>Export Theme JSON</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 bg-[#1e222a] hover:bg-[#2b3342] text-gray-300 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyChanges}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#991b1b] hover:bg-[#7f1d1d] text-white rounded-xl font-bold shadow-md shadow-[#991b1b]/30 transition-all active:scale-95"
            >
              <Check size={15} />
              <span>Apply Dark Red Theme</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
