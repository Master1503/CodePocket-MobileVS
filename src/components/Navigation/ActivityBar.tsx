/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Files,
  Search,
  GitBranch,
  Bug,
  Blocks,
  Settings,
  Terminal,
  Cloud,
  Sparkles,
} from 'lucide-react';
import { SidebarView } from '../../types/vscode.ts';

interface ActivityBarProps {
  activeView: SidebarView;
  onSelectView: (view: SidebarView) => void;
  modifiedCount: number;
  isDebugActive: boolean;
  onToggleTerminal: () => void;
  onOpenCloudSync: () => void;
  isCloudSynced: boolean;
  aiIssueCount?: number;
}

export const ActivityBar: React.FC<ActivityBarProps> = ({
  activeView,
  onSelectView,
  modifiedCount,
  isDebugActive,
  onToggleTerminal,
  onOpenCloudSync,
  isCloudSynced,
  aiIssueCount,
}) => {
  const navItems: Array<{
    id: SidebarView;
    label: string;
    icon: React.ReactNode;
    badge?: number | boolean;
  }> = [
    { id: 'explorer', label: 'Explorer', icon: <Files size={20} /> },
    { id: 'search', label: 'Search', icon: <Search size={20} /> },
    {
      id: 'git',
      label: 'Source Control',
      icon: <GitBranch size={20} />,
      badge: modifiedCount > 0 ? modifiedCount : undefined,
    },
    {
      id: 'debug',
      label: 'Run & Debug',
      icon: <Bug size={20} />,
      badge: isDebugActive,
    },
    {
      id: 'ai',
      label: 'AI Checker',
      icon: <Sparkles size={20} className="text-red-400" />,
      badge: aiIssueCount && aiIssueCount > 0 ? aiIssueCount : undefined,
    },
    { id: 'extensions', label: 'Extensions', icon: <Blocks size={20} /> },
  ];

  return (
    <>
      {/* Desktop / Tablet Vertical Sidebar */}
      <div className="hidden md:flex flex-col justify-between w-12 bg-[#181818] border-r border-[#2b2b2b] select-none z-20 shrink-0">
        {/* Top actions */}
        <div className="flex flex-col items-center py-2 gap-2">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectView(isActive ? null : item.id)}
                title={item.label}
                className={`relative p-2.5 rounded-lg transition-all ${
                  isActive
                    ? 'text-white bg-[#252526] border-l-2 border-[#991b1b]'
                    : 'text-gray-400 hover:text-white hover:bg-[#202020]'
                }`}
              >
                {item.icon}

                {/* Badge for modified count or debug active */}
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span className="absolute top-1.5 right-1.5 bg-[#991b1b] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center">
                    {item.badge}
                  </span>
                )}
                {typeof item.badge === 'boolean' && item.badge && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom actions */}
        <div className="flex flex-col items-center py-2 gap-2">
          {/* Cloud Sync Status Button */}
          <button
            type="button"
            onClick={onOpenCloudSync}
            title="Cloud Sync Manager"
            className="relative p-2.5 text-gray-400 hover:text-white hover:bg-[#202020] rounded-lg transition-colors"
          >
            <Cloud size={19} className={isCloudSynced ? 'text-blue-400' : 'text-gray-400'} />
            <span
              className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
                isCloudSynced ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
          </button>

          {/* Terminal Toggle Button */}
          <button
            type="button"
            onClick={onToggleTerminal}
            title="Toggle Integrated Terminal (Ctrl+`)"
            className="p-2.5 text-gray-400 hover:text-white hover:bg-[#202020] rounded-lg transition-colors"
          >
            <Terminal size={19} />
          </button>

          {/* Settings Button */}
          <button
            type="button"
            onClick={() => onSelectView(activeView === 'settings' ? null : 'settings')}
            title="Settings & Shortcuts"
            className={`p-2.5 rounded-lg transition-colors ${
              activeView === 'settings'
                ? 'text-white bg-[#252526]'
                : 'text-gray-400 hover:text-white hover:bg-[#202020]'
            }`}
          >
            <Settings size={19} />
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (Phones < 768px) */}
      <div className="md:hidden flex items-center justify-around bg-[#181818] border-t border-[#2b2b2b] px-1 py-1 z-30 select-none shrink-0 safe-bottom">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectView(isActive ? null : item.id)}
              className={`relative flex flex-col items-center justify-center p-1.5 rounded-md min-w-12 transition-all active:scale-95 ${
                isActive ? 'text-red-400 font-semibold' : 'text-gray-400 hover:text-white'
              }`}
            >
              <div className="relative">
                {item.icon}
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[#991b1b] text-white text-[9px] font-bold px-1 rounded-full min-w-3.5 text-center">
                    {item.badge}
                  </span>
                )}
                {typeof item.badge === 'boolean' && item.badge && (
                  <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-amber-400" />
                )}
              </div>
              <span className="text-[9px] tracking-tight mt-0.5">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}

        {/* Mobile Terminal Action */}
        <button
          type="button"
          onClick={onToggleTerminal}
          className="flex flex-col items-center justify-center p-1.5 text-gray-400 hover:text-white rounded-md min-w-12 active:scale-95"
        >
          <Terminal size={20} />
          <span className="text-[9px] tracking-tight mt-0.5">Terminal</span>
        </button>

        {/* Mobile Settings Action */}
        <button
          type="button"
          onClick={() => onSelectView(activeView === 'settings' ? null : 'settings')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-md min-w-12 active:scale-95 ${
            activeView === 'settings' ? 'text-red-400 font-semibold' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Settings size={20} />
          <span className="text-[9px] tracking-tight mt-0.5">Settings</span>
        </button>
      </div>
    </>
  );
};
