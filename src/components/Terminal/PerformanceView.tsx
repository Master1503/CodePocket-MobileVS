/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Activity, Cpu, HardDrive, RefreshCw, FileCode } from 'lucide-react';
import { FileItem } from '../../types/vscode.ts';

interface PerformanceViewProps {
  activeFile: FileItem | null;
}

interface MemoryMetrics {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  supported: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export const PerformanceView: React.FC<PerformanceViewProps> = ({ activeFile }) => {
  const [memory, setMemory] = useState<MemoryMetrics>({
    usedJSHeapSize: 0,
    totalJSHeapSize: 0,
    jsHeapSizeLimit: 0,
    supported: false,
  });
  const [uptimeMs, setUptimeMs] = useState<number>(() => Math.round(performance.now()));

  const sampleMemory = () => {
    const perfAny = performance as Performance & {
      memory?: {
        usedJSHeapSize: number;
        totalJSHeapSize: number;
        jsHeapSizeLimit: number;
      };
    };

    if (perfAny.memory) {
      setMemory({
        usedJSHeapSize: perfAny.memory.usedJSHeapSize,
        totalJSHeapSize: perfAny.memory.totalJSHeapSize,
        jsHeapSizeLimit: perfAny.memory.jsHeapSizeLimit,
        supported: true,
      });
    } else {
      setMemory((prev) => ({ ...prev, supported: false }));
    }
    setUptimeMs(Math.round(performance.now()));
  };

  useEffect(() => {
    sampleMemory();
    const interval = setInterval(sampleMemory, 2500);
    return () => clearInterval(interval);
  }, []);

  // Compute bundle size metrics for the currently edited code
  const bundleMetrics = useMemo(() => {
    const content = activeFile?.content || '';
    const rawBytes = new TextEncoder().encode(content).length;
    // Estimate minified size by stripping comments & redundant whitespace
    const minified = content
      .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    const minifiedBytes = new TextEncoder().encode(minified).length;
    const gzippedBytes = Math.max(0, Math.round(minifiedBytes * 0.42));
    const lineCount = content ? content.split('\n').length : 0;

    return {
      rawBytes,
      minifiedBytes,
      gzippedBytes,
      lineCount,
      charCount: content.length,
    };
  }, [activeFile?.content]);

  const heapUsagePercent =
    memory.supported && memory.jsHeapSizeLimit > 0
      ? Math.min(100, Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100))
      : 0;

  const minifiedRatio =
    bundleMetrics.rawBytes > 0
      ? Math.round((bundleMetrics.minifiedBytes / bundleMetrics.rawBytes) * 100)
      : 0;

  return (
    <div className="flex flex-col h-full w-full bg-[#181818] text-[#cccccc] font-sans text-xs overflow-y-auto p-3 space-y-3 select-text">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2d2d2d] pb-2">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-red-400" />
          <span className="font-semibold text-white">Runtime & Bundle Performance</span>
          <span className="text-[10px] font-mono text-gray-400 bg-[#252526] px-1.5 py-0.5 rounded border border-[#333]">
            Uptime: {(uptimeMs / 1000).toFixed(1)}s
          </span>
        </div>
        <button
          type="button"
          onClick={sampleMemory}
          title="Refresh Performance Metrics"
          className="flex items-center gap-1 px-2 py-1 bg-[#252526] hover:bg-[#333333] text-gray-300 hover:text-white rounded text-[11px] border border-[#3c3c3c] transition-colors cursor-pointer"
        >
          <RefreshCw size={11} />
          <span>Sample</span>
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Memory Usage Card */}
        <div className="bg-[#202020] border border-[#2f2f2f] rounded-lg p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-gray-200 font-semibold">
              <Cpu size={14} className="text-red-400" />
              <span>JS Heap Memory</span>
            </div>
            {memory.supported && (
              <span className="text-[11px] font-mono text-red-300 font-bold">
                {heapUsagePercent}%
              </span>
            )}
          </div>

          {memory.supported ? (
            <>
              <div className="w-full bg-[#141414] h-2 rounded-full overflow-hidden border border-[#2d2d2d]">
                <div
                  className="bg-[#991b1b] h-full rounded-full transition-all duration-300"
                  style={{ width: `${heapUsagePercent}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] font-mono pt-1">
                <div>
                  <div className="text-gray-500 text-[10px]">Used</div>
                  <div className="text-white font-semibold">{formatBytes(memory.usedJSHeapSize)}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-[10px]">Allocated</div>
                  <div className="text-gray-300">{formatBytes(memory.totalJSHeapSize)}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-[10px]">Limit</div>
                  <div className="text-gray-400">{formatBytes(memory.jsHeapSizeLimit)}</div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-[11px] text-gray-400 py-2">
              <code>performance.memory</code> is not exposed by this browser engine.
            </div>
          )}
        </div>

        {/* Active File Bundle Size Card */}
        <div className="bg-[#202020] border border-[#2f2f2f] rounded-lg p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-gray-200 font-semibold truncate">
              <HardDrive size={14} className="text-emerald-400 shrink-0" />
              <span className="truncate">
                Bundle Size: {activeFile ? activeFile.name : 'No file'}
              </span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 font-bold shrink-0">
              {formatBytes(bundleMetrics.rawBytes)}
            </span>
          </div>

          <div className="w-full bg-[#141414] h-2 rounded-full overflow-hidden border border-[#2d2d2d]">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${minifiedRatio}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 text-[11px] font-mono pt-1">
            <div>
              <div className="text-gray-500 text-[10px]">Raw</div>
              <div className="text-white font-semibold">{formatBytes(bundleMetrics.rawBytes)}</div>
            </div>
            <div>
              <div className="text-gray-500 text-[10px]">Minified</div>
              <div className="text-gray-300">{formatBytes(bundleMetrics.minifiedBytes)}</div>
            </div>
            <div>
              <div className="text-gray-500 text-[10px]">Est. Gzip</div>
              <div className="text-emerald-400">{formatBytes(bundleMetrics.gzippedBytes)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Active File Breakdown */}
      {activeFile && (
        <div className="flex items-center justify-between px-3 py-2 bg-[#202020] border border-[#2f2f2f] rounded-lg text-[11px] font-mono text-gray-400">
          <div className="flex items-center gap-1.5 truncate">
            <FileCode size={13} className="text-red-400 shrink-0" />
            <span className="text-gray-200 truncate">{activeFile.path}</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span>{bundleMetrics.lineCount} lines</span>
            <span>{bundleMetrics.charCount} chars</span>
          </div>
        </div>
      )}
    </div>
  );
};
