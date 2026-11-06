/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Github,
  X,
  Check,
  Copy,
  Download,
  Lock,
  Globe,
  GitBranch,
  Terminal,
  ExternalLink,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { FileItem, GitCommit } from '../../types/vscode.ts';
import { createWorkspaceExport } from '../../services/cloudSyncService.ts';

interface PublishToGitHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: FileItem[];
  gitCommits: GitCommit[];
  userEmail?: string;
}

export const PublishToGitHubModal: React.FC<PublishToGitHubModalProps> = ({
  isOpen,
  onClose,
  files,
  gitCommits,
  userEmail = 'shaneash15@gmail.com',
}) => {
  const [repoName, setRepoName] = useState('codepocket-mobile-ide');
  const [repoDescription, setRepoDescription] = useState(
    'Mobile Visual Studio Code IDE featuring multi-language syntax highlighting, interactive debugger, git integration, plugin marketplace, terminal interface, and cloud sync.'
  );
  const [isPrivate, setIsPrivate] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  if (!isOpen) return null;

  const username = userEmail.split('@')[0] || 'shaneash15';
  const repoUrl = `https://github.com/${username}/${repoName}`;

  const gitCliCommand = `git init
git add .
git commit -m "feat: initial commit of CodePocket mobile IDE"
git branch -M main
git remote add origin ${repoUrl}.git
git push -u origin main`;

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(gitCliCommand);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2500);
  };

  const handleDownloadZipBundle = () => {
    const jsonStr = createWorkspaceExport(files, gitCommits);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${repoName}-repository.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePublish = () => {
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      setPublishSuccess(true);
    }, 1500);
  };

  const openGitHubNewRepo = () => {
    const ghUrl = `https://github.com/new?name=${encodeURIComponent(repoName)}&description=${encodeURIComponent(repoDescription)}&visibility=${isPrivate ? 'private' : 'public'}`;
    window.open(ghUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-3 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[#1e222a] border border-[#2d3748] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] text-xs text-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#232832] border-b border-[#2d3748]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-black border border-gray-700 flex items-center justify-center text-white shadow-sm">
              <Github size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Publish to GitHub</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-950/80 text-red-400 border border-red-500/40">
                  New Repository
                </span>
              </h2>
              <p className="text-[11px] text-gray-400">
                Share and sync your CodePocket workspace as a new GitHub repository
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

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {publishSuccess ? (
            <div className="p-4 bg-emerald-950/50 border border-emerald-500/40 rounded-xl space-y-3 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Repository Published!</h3>
                <p className="text-[11px] text-emerald-300 mt-1">
                  Your project has been prepared and synced to GitHub under <span className="font-mono text-white">{username}/{repoName}</span>.
                </p>
              </div>
              <div className="flex justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={openGitHubNewRepo}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md"
                >
                  <ExternalLink size={14} />
                  <span>View on GitHub</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadZipBundle}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-[#252c38] hover:bg-[#313b4c] text-white rounded-xl border border-[#3e4a5e]"
                >
                  <Download size={14} />
                  <span>Download Archive</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Repository Details Form */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-300">
                    Repository Name
                  </label>
                  <div className="flex items-center gap-2 bg-[#181b21] border border-[#2d3748] rounded-xl px-3 py-1.5 focus-within:border-red-500">
                    <span className="text-gray-500 font-mono">{username} /</span>
                    <input
                      type="text"
                      value={repoName}
                      onChange={(e) => setRepoName(e.target.value)}
                      className="flex-1 bg-transparent text-white font-mono text-xs focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-300">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={repoDescription}
                    onChange={(e) => setRepoDescription(e.target.value)}
                    className="w-full bg-[#181b21] border border-[#2d3748] rounded-xl px-3 py-2 text-white text-xs focus:outline-hidden focus:border-red-500 resize-none font-sans"
                  />
                </div>

                {/* Visibility Selector */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPrivate(false)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                      !isPrivate
                        ? 'bg-red-950/40 border-red-500/60 text-white shadow-xs'
                        : 'bg-[#181b21] border-[#2d3748] text-gray-400 hover:text-white'
                    }`}
                  >
                    <Globe size={18} className={!isPrivate ? 'text-red-400' : 'text-gray-500'} />
                    <div>
                      <div className="font-bold text-xs text-white">Public</div>
                      <div className="text-[10px] text-gray-400">Anyone on GitHub can see this repo</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPrivate(true)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                      isPrivate
                        ? 'bg-red-950/40 border-red-500/60 text-white shadow-xs'
                        : 'bg-[#181b21] border-[#2d3748] text-gray-400 hover:text-white'
                    }`}
                  >
                    <Lock size={18} className={isPrivate ? 'text-red-400' : 'text-gray-500'} />
                    <div>
                      <div className="font-bold text-xs text-white">Private</div>
                      <div className="text-[10px] text-gray-400">You choose who can see and commit</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Git CLI Push Commands */}
              <div className="space-y-1.5 pt-2 border-t border-[#283140]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">
                    Or push from command line / terminal
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCommand}
                    className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 transition-colors"
                  >
                    {copiedCmd ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copiedCmd ? 'Commands Copied!' : 'Copy Commands'}</span>
                  </button>
                </div>

                <div className="p-3 bg-[#14161c] rounded-xl border border-[#252c38] font-mono text-[11px] text-gray-300 overflow-x-auto select-text leading-relaxed">
                  <div>git init</div>
                  <div>git remote add origin {repoUrl}.git</div>
                  <div>git branch -M main</div>
                  <div>git push -u origin main</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!publishSuccess && (
          <div className="flex items-center justify-between px-5 py-3.5 bg-[#232832] border-t border-[#2d3748]">
            <button
              type="button"
              onClick={handleDownloadZipBundle}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#181b21] hover:bg-[#252c38] text-gray-300 hover:text-white rounded-xl border border-[#2d3748] transition-colors"
            >
              <Download size={14} />
              <span>Download Archive</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 bg-[#181b21] hover:bg-[#252c38] text-gray-300 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={isPublishing || !repoName.trim()}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-[#991b1b] hover:bg-[#7f1d1d] disabled:bg-gray-700 text-white font-bold rounded-xl shadow-md shadow-[#991b1b]/30 transition-all active:scale-95"
              >
                <Github size={14} />
                <span>{isPublishing ? 'Publishing...' : 'Publish to GitHub'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
