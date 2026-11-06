/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Blocks,
  Search,
  Download,
  Star,
  Check,
  Power,
  Settings,
  Filter,
  Palette,
  Sparkles,
} from 'lucide-react';
import { Extension } from '../../types/vscode.ts';
import { PluginDetailModal } from './PluginDetailModal.tsx';

interface ExtensionsPanelProps {
  extensions: Extension[];
  onToggleExtension: (id: string) => void;
  onInstallExtension: (id: string) => void;
  onUninstallExtension: (id: string) => void;
  onSelectTheme?: (themeId: string) => void;
  onOpenThemeCustomizer?: () => void;
}

export const ExtensionsPanel: React.FC<ExtensionsPanelProps> = ({
  extensions,
  onToggleExtension,
  onInstallExtension,
  onUninstallExtension,
  onSelectTheme,
  onOpenThemeCustomizer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [viewTab, setViewTab] = useState<'marketplace' | 'installed'>('marketplace');
  const [selectedExtension, setSelectedExtension] = useState<Extension | null>(null);

  const categories = ['All', 'Themes', 'Formatters', 'Linters', 'Languages', 'Tools'];

  const filteredExtensions = useMemo(() => {
    return extensions.filter((ext) => {
      if (viewTab === 'installed' && !ext.installed) return false;
      if (activeCategory !== 'All' && ext.category !== activeCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          ext.displayName.toLowerCase().includes(q) ||
          ext.description.toLowerCase().includes(q) ||
          ext.publisher.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [extensions, viewTab, activeCategory, searchQuery]);

  const installedCount = extensions.filter((e) => e.installed).length;

  return (
    <div className="flex flex-col h-full w-full bg-[#252526] text-[#cccccc] text-xs overflow-hidden select-none">
      {/* Extensions Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#3c3c3c]">
        <div className="flex items-center gap-1.5">
          <Blocks size={14} className="text-red-400" />
          <span className="uppercase text-[11px] font-bold tracking-wider text-gray-300">
            Extensions
          </span>
        </div>

        {/* View toggle tabs */}
        <div className="flex items-center bg-[#1e1e1e] rounded p-0.5 border border-[#3c3c3c] text-[10px]">
          <button
            type="button"
            onClick={() => setViewTab('marketplace')}
            className={`px-2 py-0.5 rounded transition-colors ${
              viewTab === 'marketplace' ? 'bg-[#333333] text-white font-medium' : 'text-gray-400'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setViewTab('installed')}
            className={`px-2 py-0.5 rounded transition-colors ${
              viewTab === 'installed' ? 'bg-[#333333] text-white font-medium' : 'text-gray-400'
            }`}
          >
            Installed ({installedCount})
          </button>
        </div>
      </div>

      {/* Theme Customizer Banner Action */}
      {onOpenThemeCustomizer && (
        <div className="px-2.5 pt-2">
          <button
            type="button"
            onClick={onOpenThemeCustomizer}
            className="w-full flex items-center justify-between px-3 py-2 bg-gradient-to-r from-red-950/80 to-[#221015] hover:from-red-900/90 hover:to-[#2e151d] text-white rounded-xl border border-red-500/40 shadow-xs transition-all active:scale-98"
          >
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#991b1b] flex items-center justify-center text-white text-xs shadow-sm">
                <Palette size={13} />
              </span>
              <div className="text-left">
                <div className="font-bold text-xs text-white">Theme Customizer Studio</div>
                <div className="text-[10px] text-red-300">Customise workbench &amp; red accents</div>
              </div>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-600/30 text-red-200 border border-red-500/30">
              Open
            </span>
          </button>
        </div>
      )}

      {/* Search & Category Filter */}
      <div className="p-2.5 bg-[#1f1f1f] border-b border-[#3c3c3c] flex flex-col gap-2 mt-1">
        <div className="flex items-center gap-1.5 bg-[#252526] border border-[#3c3c3c] rounded-lg px-2 py-1">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search extensions in Marketplace..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-white text-xs focus:outline-hidden"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-0.5">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-0.5 rounded-full text-[10px] whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? 'bg-[#991b1b] text-white font-semibold shadow-xs'
                  : 'bg-[#2a2d2e] hover:bg-[#343746] text-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Extensions List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#2d2d2d]">
        {filteredExtensions.map((ext) => (
          <div
            key={ext.id}
            onClick={() => setSelectedExtension(ext)}
            className="p-3 hover:bg-[#2a2d2e]/50 cursor-pointer flex gap-2.5 transition-colors group"
          >
            {/* Extension Icon */}
            <div className="w-9 h-9 rounded-lg bg-[#333333] flex items-center justify-center text-lg shrink-0 border border-[#3e3e3e] shadow-xs group-hover:border-red-500/50 transition-colors">
              {ext.icon}
            </div>

            {/* Info and Actions */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="font-semibold text-white truncate text-xs group-hover:text-red-400 transition-colors">
                  {ext.displayName}
                </span>
                <span className="text-[10px] text-gray-500 font-mono">v{ext.version}</span>
              </div>

              <div className="text-[11px] text-gray-400 line-clamp-2 my-1">
                {ext.description}
              </div>

              <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#333333]/40 text-[10px] text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="text-gray-300 font-medium">{ext.publisher}</span>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    <Star size={10} fill="currentColor" />
                    <span>{ext.rating}</span>
                  </div>
                  <div className="flex items-center gap-0.5 text-gray-400">
                    <Download size={10} />
                    <span>{ext.downloads}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  {ext.installed ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          onToggleExtension(ext.id);
                          if (ext.themeId && onSelectTheme) {
                            onSelectTheme(ext.themeId);
                          }
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                          ext.enabled
                            ? 'bg-[#991b1b]/30 text-red-300 border border-[#991b1b]/60 hover:bg-[#991b1b]/50'
                            : 'bg-[#333333] text-gray-400 hover:text-white'
                        }`}
                      >
                        {ext.enabled ? 'Enabled' : 'Disabled'}
                      </button>

                      <button
                        type="button"
                        onClick={() => onUninstallExtension(ext.id)}
                        className="px-1.5 py-0.5 hover:bg-rose-900/40 text-gray-400 hover:text-rose-300 rounded text-[10px]"
                        title="Uninstall Extension"
                      >
                        Uninstall
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onInstallExtension(ext.id)}
                      className="px-2.5 py-0.5 bg-[#991b1b] hover:bg-[#7f1d1d] text-white rounded text-[10px] font-medium shadow-xs active:scale-95 transition-all"
                    >
                      Install
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Plugin Details & Settings Modal */}
      <PluginDetailModal
        extension={selectedExtension}
        isOpen={!!selectedExtension}
        onClose={() => setSelectedExtension(null)}
        onToggleEnabled={(id) => onToggleExtension(id)}
        onInstall={(id) => onInstallExtension(id)}
        onUninstall={(id) => onUninstallExtension(id)}
        onApplyTheme={(themeId) => {
          if (onSelectTheme) onSelectTheme(themeId);
          setSelectedExtension(null);
        }}
      />
    </div>
  );
};
