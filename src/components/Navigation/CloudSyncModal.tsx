/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Cloud,
  X,
  Copy,
  Check,
  Download,
  Upload,
  RefreshCw,
  Smartphone,
  Laptop,
  Tablet,
  CheckCircle2,
  AlertCircle,
  Share2,
} from 'lucide-react';
import { FileItem, GitCommit, CloudDevice } from '../../types/vscode.ts';
import { createWorkspaceExport, getConnectedDevices } from '../../services/cloudSyncService.ts';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncCode: string;
  files: FileItem[];
  gitCommits: GitCommit[];
  onImportWorkspace: (importedFiles: FileItem[], importedCommits?: GitCommit[]) => void;
  onTriggerSync: () => void;
  isSyncing: boolean;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  syncCode,
  files,
  gitCommits,
  onImportWorkspace,
  onTriggerSync,
  isSyncing,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [partnerCodeInput, setPartnerCodeInput] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [showJsonImport, setShowJsonImport] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const devices: CloudDevice[] = getConnectedDevices();

  const handleCopySyncCode = () => {
    navigator.clipboard.writeText(syncCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadSnapshot = () => {
    const jsonStr = createWorkspaceExport(files, gitCommits);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codepocket-workspace-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(jsonInput);
      if (parsed.files && Array.isArray(parsed.files)) {
        onImportWorkspace(parsed.files, parsed.commits);
        setImportStatus('Workspace restored successfully!');
        setTimeout(() => {
          setImportStatus(null);
          setShowJsonImport(false);
          setJsonInput('');
        }, 1500);
      } else {
        setImportStatus('Invalid workspace JSON format');
      }
    } catch {
      setImportStatus('JSON syntax parsing error');
    }
  };

  const handlePairSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (partnerCodeInput.trim()) {
      onTriggerSync();
      setImportStatus(`Successfully paired with ${partnerCodeInput.trim()}! Workspace synced.`);
      setPartnerCodeInput('');
      setTimeout(() => setImportStatus(null), 3000);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#1e222a] border border-[#2d3748] rounded-2xl shadow-2xl overflow-hidden flex flex-col text-xs text-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#232832] border-b border-[#2d3748]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#991b1b]/20 text-red-400 flex items-center justify-center border border-[#991b1b]/30">
              <Cloud size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Cross-Device Cloud Sync</h2>
              <p className="text-[11px] text-gray-400">Sync workspace code seamlessly across phone, tablet, and desktop</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-[#343d4d] text-gray-400 hover:text-white rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {importStatus && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 rounded-xl flex items-center gap-2 text-xs">
              <CheckCircle2 size={16} />
              <span>{importStatus}</span>
            </div>
          )}

          {/* Current Device Pairing Code */}
          <div className="p-4 bg-[#181b21] rounded-xl border border-[#283140] flex flex-col gap-2">
            <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">
              Your Device Cloud Sync Code
            </span>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-base font-bold text-red-400 tracking-wider">
                {syncCode}
              </span>
              <button
                type="button"
                onClick={handleCopySyncCode}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#252c38] hover:bg-[#313b4c] text-white rounded-lg font-medium text-xs border border-[#3e4a5e] transition-colors"
              >
                {copiedCode ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>
            <p className="text-[11px] text-gray-400">
              Enter this code on your desktop or tablet to pair and transfer files automatically.
            </p>
          </div>

          {/* Pair with another device */}
          <form onSubmit={handlePairSubmit} className="space-y-1.5">
            <label className="text-[11px] font-semibold text-gray-300">
              Connect to Another Device
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter 6-character code (e.g. SYNC-9921-IDE)..."
                value={partnerCodeInput}
                onChange={(e) => setPartnerCodeInput(e.target.value)}
                className="flex-1 bg-[#181b21] border border-[#2d3748] rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-hidden focus:border-[#991b1b]"
              />
              <button
                type="submit"
                disabled={!partnerCodeInput.trim() || isSyncing}
                className="px-4 py-2 bg-[#991b1b] hover:bg-[#7f1d1d] disabled:bg-gray-700 text-white font-medium rounded-xl text-xs shadow-xs"
              >
                Connect &amp; Sync
              </button>
            </div>
          </form>

          {/* Connected Devices */}
          <div className="space-y-2">
            <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">
              Connected Devices ({devices.length})
            </span>
            <div className="divide-y divide-[#283140] bg-[#181b21] rounded-xl border border-[#283140] overflow-hidden">
              {devices.map((dev) => (
                <div key={dev.id} className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-2.5">
                    {dev.platform === 'iPhone' || dev.platform === 'Android' ? (
                      <Smartphone size={16} className="text-blue-400" />
                    ) : dev.platform === 'iPad' ? (
                      <Tablet size={16} className="text-purple-400" />
                    ) : (
                      <Laptop size={16} className="text-emerald-400" />
                    )}
                    <div>
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <span>{dev.name}</span>
                        {dev.isCurrent && (
                          <span className="bg-[#991b1b]/30 text-red-300 text-[9px] px-1.5 py-0.2 rounded-full font-sans border border-[#991b1b]/40">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400">Last active: {dev.lastSynced}</div>
                    </div>
                  </div>

                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400" />
                </div>
              ))}
            </div>
          </div>

          {/* Workspace Snapshot Backup & Restore */}
          <div className="space-y-2 pt-2 border-t border-[#283140]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">
                Workspace Backup &amp; Transfer
              </span>
              <button
                type="button"
                onClick={() => setShowJsonImport(!showJsonImport)}
                className="text-[11px] text-red-400 hover:underline"
              >
                {showJsonImport ? 'Hide Import Box' : 'Import JSON Snapshot'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadSnapshot}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#252c38] hover:bg-[#313b4c] text-white rounded-xl font-medium border border-[#3e4a5e] transition-colors"
              >
                <Download size={14} className="text-red-400" />
                <span>Export JSON Bundle</span>
              </button>

              <button
                type="button"
                onClick={onTriggerSync}
                disabled={isSyncing}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#991b1b] hover:bg-[#7f1d1d] text-white rounded-xl font-medium shadow-xs transition-colors"
              >
                <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                <span>{isSyncing ? 'Syncing...' : 'Force Cloud Sync'}</span>
              </button>
            </div>

            {showJsonImport && (
              <form onSubmit={handleImportSubmit} className="space-y-2 pt-2">
                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder="Paste workspace JSON bundle here to restore..."
                  rows={4}
                  className="w-full bg-[#181b21] text-white text-xs p-2.5 rounded-xl border border-[#2d3748] font-mono focus:outline-hidden focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={!jsonInput.trim()}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 text-white rounded-xl font-medium text-xs"
                >
                  Apply &amp; Restore Workspace
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
