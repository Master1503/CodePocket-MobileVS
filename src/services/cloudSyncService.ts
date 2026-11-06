/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FileItem, CloudDevice, GitCommit } from '../types/vscode.ts';

const STORAGE_KEY_FILES = 'codepocket_workspace_files';
const STORAGE_KEY_COMMITS = 'codepocket_git_commits';
const STORAGE_KEY_SETTINGS = 'codepocket_user_settings';
const STORAGE_KEY_SYNC_CODE = 'codepocket_sync_code';

export interface WorkspaceExportPayload {
  version: string;
  timestamp: string;
  deviceId: string;
  syncCode: string;
  files: FileItem[];
  commits: GitCommit[];
}

export function saveWorkspaceLocally(files: FileItem[], commits: GitCommit[], settings?: any) {
  try {
    localStorage.setItem(STORAGE_KEY_FILES, JSON.stringify(files));
    localStorage.setItem(STORAGE_KEY_COMMITS, JSON.stringify(commits));
    if (settings) {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    }
  } catch (err) {
    console.warn('LocalStorage save failed:', err);
  }
}

export function loadWorkspaceLocally(): { files: FileItem[] | null; commits: GitCommit[] | null } {
  try {
    const rawFiles = localStorage.getItem(STORAGE_KEY_FILES);
    const rawCommits = localStorage.getItem(STORAGE_KEY_COMMITS);
    return {
      files: rawFiles ? JSON.parse(rawFiles) : null,
      commits: rawCommits ? JSON.parse(rawCommits) : null,
    };
  } catch {
    return { files: null, commits: null };
  }
}

export function getOrCreateSyncCode(): string {
  let code = localStorage.getItem(STORAGE_KEY_SYNC_CODE);
  if (!code) {
    code = 'SYNC-' + Math.floor(1000 + Math.random() * 9000) + '-IDE';
    localStorage.setItem(STORAGE_KEY_SYNC_CODE, code);
  }
  return code;
}

export function createWorkspaceExport(files: FileItem[], commits: GitCommit[]): string {
  const payload: WorkspaceExportPayload = {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    deviceId: 'dev-' + Math.random().toString(36).substring(2, 8),
    syncCode: getOrCreateSyncCode(),
    files,
    commits,
  };
  return JSON.stringify(payload, null, 2);
}

export function getConnectedDevices(): CloudDevice[] {
  return [
    {
      id: 'dev-curr',
      name: 'Active Mobile Device',
      platform: 'iPhone',
      lastSynced: 'Just now',
      isCurrent: true,
    },
    {
      id: 'dev-mac',
      name: "Developer's MacBook Pro 16\"",
      platform: 'Mac',
      lastSynced: '14 minutes ago',
      isCurrent: false,
    },
    {
      id: 'dev-ipad',
      name: 'iPad Pro (Field Testing)',
      platform: 'iPad',
      lastSynced: '2 hours ago',
      isCurrent: false,
    },
  ];
}
