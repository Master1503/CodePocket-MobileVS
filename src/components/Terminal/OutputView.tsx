/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';

export const OutputView: React.FC = () => {
  const [selectedChannel, setSelectedChannel] = useState('Extension Host');

  const channels: Record<string, string[]> = {
    'Extension Host': [
      '[info] Extension host started with pid 4291.',
      '[info] Activating Prettier Code Formatter (10.4.1)... done in 45ms.',
      '[info] Activating ESLint JavaScript extension... done in 28ms.',
      '[info] GitLens mobile loaded 2 branches and 2 commits.',
      '[info] Language server ready for JS, TS, Python, Rust, SQL.',
    ],
    'Tasks': [
      '> Executing task: npm run dev',
      '  VITE v8.3.0 ready in 148 ms',
      '  ➜  Local:   http://localhost:3000/',
      '  ➜  Network: use --host to expose',
      '  Ready for mobile touchscreen and external keyboard input.',
    ],
    'Git': [
      '[git] git status --porcelain=v1',
      '[git] branch: main',
      '[git] remote origin: https://github.com/shaneash15/codepocket.git',
      '[git] fetch: origin up-to-date',
    ],
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#181818] text-[#cccccc] font-mono text-xs overflow-hidden select-text">
      {/* Channel Selector */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#202020] border-b border-[#2d2d2d] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 font-sans text-[11px]">Channel:</span>
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="bg-[#2a2d2e] text-white text-xs px-2 py-0.5 rounded border border-[#3e4451] focus:outline-hidden"
          >
            {Object.keys(channels).map((ch) => (
              <option key={ch} value={ch}>
                {ch}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Log lines */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {(channels[selectedChannel] || []).map((line, idx) => (
          <div key={idx} className="text-gray-300 whitespace-pre-wrap leading-relaxed">
            {line}
          </div>
        ))}
      </div>
    </div>
  );
};
