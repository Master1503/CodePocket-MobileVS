/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChevronRight, Folder, FileCode } from 'lucide-react';
import { FileItem } from '../../types/vscode.ts';
import { getFileIcon } from '../Sidebar/ExplorerPanel.tsx';

interface BreadcrumbsProps {
  file: FileItem | null;
  onNavigate?: (path: string) => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ file }) => {
  if (!file) return null;

  const parts = file.path.split('/').filter(Boolean);

  return (
    <div className="flex items-center px-3 py-1 bg-[#1e1e1e] border-b border-[#2b2b2b] text-[11px] text-gray-400 select-none overflow-x-auto scrollbar-none font-sans shrink-0">
      <span className="text-gray-500 hover:text-gray-300 cursor-pointer">workspace</span>

      {parts.map((part, index) => {
        const isLast = index === parts.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight size={12} className="mx-1 text-gray-600 shrink-0" />
            <div
              className={`flex items-center gap-1 shrink-0 ${
                isLast ? 'text-gray-200 font-medium' : 'text-gray-400 hover:text-gray-200 cursor-pointer'
              }`}
            >
              {!isLast ? (
                <Folder size={12} className="text-amber-400" />
              ) : (
                <span className="shrink-0">{getFileIcon(part, file.language)}</span>
              )}
              <span>{part}</span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};
