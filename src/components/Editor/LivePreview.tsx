/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { RotateCw, Smartphone, Tablet, Monitor, ExternalLink } from 'lucide-react';
import { FileItem } from '../../types/vscode.ts';

interface LivePreviewProps {
  files: FileItem[];
  activeFile: FileItem;
}

export const LivePreview: React.FC<LivePreviewProps> = ({ files }) => {
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'tablet' | 'responsive'>('responsive');
  const [key, setKey] = useState(0);

  // Find index.html, styles/app.css, etc.
  const htmlContent = useMemo(() => {
    function findFile(name: string, items: FileItem[]): FileItem | null {
      for (const item of items) {
        if (item.name === name) return item;
        if (item.children) {
          const res = findFile(name, item.children);
          if (res) return res;
        }
      }
      return null;
    }

    const htmlFile = findFile('index.html', files);
    const cssFile = findFile('app.css', files);

    let rawHtml = htmlFile ? htmlFile.content : '<h1>No index.html found</h1>';
    if (cssFile) {
      rawHtml = rawHtml.replace(
        '<link rel="stylesheet" href="styles/app.css" />',
        `<style>${cssFile.content}</style>`
      );
    }
    return rawHtml;
  }, [files]);

  return (
    <div className="flex flex-col flex-1 h-full w-full bg-[#181818] text-[#cccccc] overflow-hidden">
      {/* Browser Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#252526] border-b border-[#3c3c3c] text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setKey((k) => k + 1)}
            className="p-1 hover:bg-[#333333] rounded text-gray-300 hover:text-white"
            title="Reload Preview"
          >
            <RotateCw size={14} />
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#1e1e1e] rounded text-gray-300 font-mono text-[11px] border border-[#333333]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>http://localhost:5173/preview</span>
          </div>
        </div>

        {/* Device Switcher */}
        <div className="flex items-center gap-1 bg-[#1e1e1e] rounded p-0.5 border border-[#333333]">
          <button
            type="button"
            onClick={() => setDeviceMode('mobile')}
            className={`p-1 rounded ${deviceMode === 'mobile' ? 'bg-[#333333] text-white' : 'text-gray-400'}`}
            title="Mobile (375px)"
          >
            <Smartphone size={13} />
          </button>
          <button
            type="button"
            onClick={() => setDeviceMode('tablet')}
            className={`p-1 rounded ${deviceMode === 'tablet' ? 'bg-[#333333] text-white' : 'text-gray-400'}`}
            title="Tablet (768px)"
          >
            <Tablet size={13} />
          </button>
          <button
            type="button"
            onClick={() => setDeviceMode('responsive')}
            className={`p-1 rounded ${deviceMode === 'responsive' ? 'bg-[#333333] text-white' : 'text-gray-400'}`}
            title="Responsive (100%)"
          >
            <Monitor size={13} />
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-2 bg-[#121212]">
        <div
          className={`h-full transition-all duration-200 shadow-2xl rounded-lg overflow-hidden border border-[#333333] ${
            deviceMode === 'mobile'
              ? 'w-[375px]'
              : deviceMode === 'tablet'
              ? 'w-[768px]'
              : 'w-full'
          }`}
        >
          <iframe
            key={key}
            title="Live Preview"
            srcDoc={htmlContent}
            sandbox="allow-scripts"
            className="w-full h-full bg-white border-0"
          />
        </div>
      </div>
    </div>
  );
};
