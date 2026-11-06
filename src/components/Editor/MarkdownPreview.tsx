/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen } from 'lucide-react';
import { FileItem } from '../../types/vscode.ts';

interface MarkdownPreviewProps {
  file: FileItem;
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ file }) => {
  // Simple clean markdown renderer
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];

    lines.forEach((line, idx) => {
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={idx} className="text-2xl font-bold text-white border-b border-[#30363d] pb-2 mb-4 mt-2">
            {line.replace('# ', '')}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={idx} className="text-lg font-semibold text-white border-b border-[#30363d] pb-1 mb-3 mt-6">
            {line.replace('## ', '')}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={idx} className="text-base font-semibold text-gray-200 mb-2 mt-4">
            {line.replace('### ', '')}
          </h3>
        );
      } else if (line.startsWith('- ')) {
        elements.push(
          <li key={idx} className="ml-5 list-disc text-gray-300 my-1 text-xs">
            {line.replace('- ', '')}
          </li>
        );
      } else if (line.trim().startsWith('```')) {
        // Code fence boundary
      } else if (line.trim() === '') {
        elements.push(<div key={idx} className="h-2" />);
      } else {
        elements.push(
          <p key={idx} className="text-gray-300 my-2 text-xs leading-relaxed">
            {line}
          </p>
        );
      }
    });

    return elements;
  };

  return (
    <div className="flex-1 h-full w-full bg-[#0d1117] text-[#c9d1d9] p-6 overflow-auto font-sans">
      <div className="max-w-2xl mx-auto bg-[#161b22] border border-[#30363d] rounded-xl p-6 shadow-xl">
        <div className="flex items-center gap-2 text-blue-400 text-xs font-medium mb-4 pb-3 border-b border-[#30363d]">
          <BookOpen size={16} />
          <span>Markdown Documentation Preview</span>
        </div>
        <div>{renderMarkdown(file.content)}</div>
      </div>
    </div>
  );
};
