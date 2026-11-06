/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  FileItem,
  TabItem,
  SidebarView,
  BottomPanelTab,
  Breakpoint,
  DebugFrame,
  DebugVariable,
  DebugWatch,
  DebugStatus,
  GitCommit,
  Extension,
  UserSettings,
  AICheckResult,
  AICheckIssue,
  ProblemItem,
} from './types/vscode.ts';
import { INITIAL_WORKSPACE, INITIAL_GIT_COMMITS } from './constants/defaultWorkspace.ts';
import { INITIAL_EXTENSIONS } from './constants/defaultExtensions.ts';
import { THEMES, ThemeColors } from './constants/themes.ts';
import {
  saveWorkspaceLocally,
  loadWorkspaceLocally,
  getOrCreateSyncCode,
} from './services/cloudSyncService.ts';
import { getAllProblems } from './services/linterService.ts';
import {
  createDebugSimulation,
  formatVariableList,
  evaluateDebugExpression,
  ExecutableStep,
} from './services/debugEngine.ts';
import { detectLanguageFromFilename } from './services/syntaxHighlighter.ts';
import {
  checkCodeWithAI,
  applyAIFix,
  convertAIIssuesToProblems,
} from './services/aiCodeCheckerService.ts';

// UI Components
import { ActivityBar } from './components/Navigation/ActivityBar.tsx';
import { EditorTabs } from './components/Navigation/EditorTabs.tsx';
import { Breadcrumbs } from './components/Navigation/Breadcrumbs.tsx';
import { StatusBar } from './components/Navigation/StatusBar.tsx';
import { CommandPalette, CommandItem } from './components/Navigation/CommandPalette.tsx';
import { CloudSyncModal } from './components/Navigation/CloudSyncModal.tsx';
import { PublishToGitHubModal } from './components/Navigation/PublishToGitHubModal.tsx';
import { CodeEditor } from './components/Editor/CodeEditor.tsx';
import { DiffViewer } from './components/Editor/DiffViewer.tsx';
import { LivePreview } from './components/Editor/LivePreview.tsx';
import { MarkdownPreview } from './components/Editor/MarkdownPreview.tsx';
import { ExplorerPanel } from './components/Sidebar/ExplorerPanel.tsx';
import { SearchPanel } from './components/Sidebar/SearchPanel.tsx';
import { SourceControlPanel } from './components/Sidebar/SourceControlPanel.tsx';
import { RunAndDebugPanel } from './components/Sidebar/RunAndDebugPanel.tsx';
import { ExtensionsPanel } from './components/Sidebar/ExtensionsPanel.tsx';
import { SettingsPanel } from './components/Sidebar/SettingsPanel.tsx';
import { ThemeCustomizerModal } from './components/Sidebar/ThemeCustomizerModal.tsx';
import { BottomDock } from './components/Terminal/BottomDock.tsx';
import { AICodeCheckerModal } from './components/AI/AICodeCheckerModal.tsx';
import { AICodeCheckerSidebarPanel } from './components/Sidebar/AICodeCheckerSidebarPanel.tsx';

// Icons for commands
import {
  Play,
  RotateCcw,
  Sparkles,
  GitBranch,
  Terminal,
  Files,
  Bug,
  Search,
  Settings,
  Cloud,
  Columns,
  Eye,
  Github,
  Palette,
  Maximize2,
  Minimize2,
} from 'lucide-react';

export default function App() {
  // Load workspace state from local cache or fall back to defaults
  const [files, setFiles] = useState<FileItem[]>(() => {
    const cached = loadWorkspaceLocally();
    return cached.files || INITIAL_WORKSPACE;
  });

  const [gitCommits, setGitCommits] = useState<GitCommit[]>(() => {
    const cached = loadWorkspaceLocally();
    return cached.commits || INITIAL_GIT_COMMITS;
  });

  const [gitBranch, setGitBranch] = useState<string>('main');

  // Tabs state
  const [tabs, setTabs] = useState<TabItem[]>([
    {
      id: 'tab-readme',
      fileId: 'f-readme',
      filePath: '/README.md',
      title: 'README.md',
      language: 'markdown',
      isModified: false,
    },
    {
      id: 'tab-game-engine',
      fileId: 'f-game-engine',
      filePath: '/src/gameEngine.js',
      title: 'gameEngine.js',
      language: 'javascript',
      isModified: false,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-game-engine');

  // Navigation & panels
  const [activeView, setActiveView] = useState<SidebarView>('explorer');
  const [bottomDockOpen, setBottomDockOpen] = useState<boolean>(false);
  const [bottomDockTab, setBottomDockTab] = useState<BottomPanelTab>('terminal');
  const [bottomDockMaximized, setBottomDockMaximized] = useState<boolean>(false);
  const [isSplit, setIsSplit] = useState<boolean>(false);

  // Modals
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);
  const [commandPaletteMode, setCommandPaletteMode] = useState<'command' | 'file'>('command');
  const [cloudSyncModalOpen, setCloudSyncModalOpen] = useState<boolean>(false);
  const [gitHubModalOpen, setGitHubModalOpen] = useState<boolean>(false);
  const [themeCustomizerOpen, setThemeCustomizerOpen] = useState<boolean>(false);
  const [customThemes, setCustomThemes] = useState<Record<string, ThemeColors>>({});
  const [syncCode] = useState<string>(getOrCreateSyncCode);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // AI Code Checker state
  const [aiCheckModalOpen, setAiCheckModalOpen] = useState<boolean>(false);
  const [aiCheckResults, setAiCheckResults] = useState<Record<string, AICheckResult>>({});
  const [isCheckingCode, setIsCheckingCode] = useState<boolean>(false);
  const [aiProblems, setAiProblems] = useState<ProblemItem[]>([]);
  const [zenMode, setZenMode] = useState<boolean>(false);
  const [recentFileIds, setRecentFileIds] = useState<string[]>(['f-game-engine', 'f-readme']);

  // Editor cursor tracking
  const [cursorPos, setCursorPos] = useState<{ line: number; col: number }>({ line: 1, col: 1 });

  // Settings
  const [settings, setSettings] = useState<UserSettings>({
    fontSize: 13,
    tabSize: 2,
    wordWrap: true,
    theme: 'dark-modern',
    minimap: true,
    lineNumbers: true,
    autoSave: true,
    formatOnSave: true,
    touchKeyboardPosition: 'bottom',
    vimMode: false,
    bracketMatching: true,
    autoIndent: true,
  });

  // Extensions
  const [extensions, setExtensions] = useState<Extension[]>(INITIAL_EXTENSIONS);

  // Debugger state
  const [breakpoints, setBreakpoints] = useState<Breakpoint[]>([
    {
      id: 'bp-1',
      fileId: 'f-game-engine',
      filePath: '/src/gameEngine.js',
      lineNumber: 11,
      enabled: true,
    },
  ]);
  const [debugStatus, setDebugStatus] = useState<DebugStatus>('idle');
  const [activeDebugLine, setActiveDebugLine] = useState<number | null>(null);
  const [debugSteps, setDebugSteps] = useState<ExecutableStep[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [debugFrames, setDebugFrames] = useState<DebugFrame[]>([]);
  const [debugVariables, setDebugVariables] = useState<DebugVariable[]>([]);
  const [debugWatches, setDebugWatches] = useState<DebugWatch[]>([
    { id: 'w-1', expression: 'activeLevel', value: '3' },
    { id: 'w-2', expression: 'defeated * 50', value: '400' },
  ]);
  const [debugLogs, setDebugLogs] = useState<string[]>([
    'Debug session ready. Set breakpoints by tapping the line numbers in the gutter.',
  ]);

  // Active file resolution
  const activeTab = useMemo(() => tabs.find((t) => t.id === activeTabId) || null, [tabs, activeTabId]);

  const activeFile = useMemo(() => {
    if (!activeTab) return null;
    const targetFileId = activeTab.fileId;
    function search(items: FileItem[]): FileItem | null {
      for (const item of items) {
        if (item.id === targetFileId) return item;
        if (item.children) {
          const res = search(item.children);
          if (res) return res;
        }
      }
      return null;
    }
    return search(files);
  }, [files, activeTab]);

  // Diagnostics & problems (merging static linter + Gemini AI checker)
  const problems = useMemo(() => [...aiProblems, ...getAllProblems(files)], [files, aiProblems]);

  // Resolve last 10 opened files
  const recentFiles = useMemo(() => {
    const fileMap = new Map<string, FileItem>();
    function collect(items: FileItem[]) {
      for (const item of items) {
        if (!item.isFolder) fileMap.set(item.id, item);
        if (item.children) collect(item.children);
      }
    }
    collect(files);
    return recentFileIds
      .map((id) => fileMap.get(id))
      .filter((f): f is FileItem => Boolean(f))
      .slice(0, 10);
  }, [files, recentFileIds]);

  // Modified files count for badge
  const modifiedCount = useMemo(() => {
    let count = 0;
    function recurse(items: FileItem[]) {
      for (const item of items) {
        if (!item.isFolder && item.isModified) count++;
        if (item.children) recurse(item.children);
      }
    }
    recurse(files);
    return count;
  }, [files]);

  // Auto-save to localStorage
  useEffect(() => {
    saveWorkspaceLocally(files, gitCommits, settings);
  }, [files, gitCommits, settings]);

  // File modification handler
  const handleFileContentChange = useCallback(
    (newContent: string) => {
      if (!activeFile) return;
      const targetId = activeFile.id;
      const targetOriginal = activeFile.originalContent;

      setFiles((prevFiles) => {
        function updateTree(items: FileItem[]): FileItem[] {
          return items.map((item) => {
            if (item.id === targetId) {
              const isModified = newContent !== targetOriginal;
              return {
                ...item,
                content: newContent,
                isModified,
              };
            }
            if (item.children) {
              return { ...item, children: updateTree(item.children) };
            }
            return item;
          });
        }
        return updateTree(prevFiles);
      });

      // Update tab dirty status
      setTabs((prevTabs) =>
        prevTabs.map((t) =>
          t.fileId === targetId
            ? { ...t, isModified: newContent !== targetOriginal }
            : t
        )
      );
    },
    [activeFile]
  );

  // Open file in editor tab
  const handleOpenFile = useCallback(
    (file: FileItem) => {
      const existingTab = tabs.find((t) => t.fileId === file.id && !t.isDiff && !t.isPreview);
      if (existingTab) {
        setActiveTabId(existingTab.id);
      } else {
        const newTab: TabItem = {
          id: 'tab-' + file.id + '-' + Date.now(),
          fileId: file.id,
          filePath: file.path,
          title: file.name,
          language: file.language,
          isModified: !!file.isModified,
        };
        setTabs((prev) => [...prev, newTab]);
        setActiveTabId(newTab.id);
      }
      setRecentFileIds((prev) => [file.id, ...prev.filter((id) => id !== file.id)].slice(0, 10));
    },
    [tabs]
  );

  // Close tab
  const handleCloseTab = useCallback(
    (tabId: string) => {
      const remaining = tabs.filter((t) => t.id !== tabId);
      setTabs(remaining);
      if (activeTabId === tabId) {
        setActiveTabId(remaining.length > 0 ? remaining[remaining.length - 1].id : '');
      }
    },
    [tabs, activeTabId]
  );

  // Tab cycling for three-finger touch gesture navigation
  const handleNextTab = useCallback(() => {
    if (tabs.length <= 1) return;
    const curIdx = tabs.findIndex((t) => t.id === activeTabId);
    const nextIdx = (curIdx + 1) % tabs.length;
    setActiveTabId(tabs[nextIdx].id);
  }, [tabs, activeTabId]);

  const handlePrevTab = useCallback(() => {
    if (tabs.length <= 1) return;
    const curIdx = tabs.findIndex((t) => t.id === activeTabId);
    const prevIdx = (curIdx - 1 + tabs.length) % tabs.length;
    setActiveTabId(tabs[prevIdx].id);
  }, [tabs, activeTabId]);

  // Open file diff
  const handleOpenFileDiff = useCallback(
    (file: FileItem) => {
      const diffTabId = 'diff-' + file.id;
      const existingTab = tabs.find((t) => t.id === diffTabId);
      if (existingTab) {
        setActiveTabId(diffTabId);
      } else {
        const newTab: TabItem = {
          id: diffTabId,
          fileId: file.id,
          filePath: file.path,
          title: `${file.name} (Diff)`,
          language: file.language,
          isModified: false,
          isDiff: true,
        };
        setTabs((prev) => [...prev, newTab]);
        setActiveTabId(diffTabId);
      }
    },
    [tabs]
  );

  // Open Live Preview Tab
  const handleOpenLivePreview = useCallback(() => {
    const previewTabId = 'tab-live-preview';
    const existing = tabs.find((t) => t.id === previewTabId);
    if (existing) {
      setActiveTabId(previewTabId);
    } else {
      const newTab: TabItem = {
        id: previewTabId,
        fileId: 'live-preview',
        filePath: '/preview',
        title: '🌐 Live Preview',
        language: 'html',
        isModified: false,
        isPreview: true,
      };
      setTabs((prev) => [...prev, newTab]);
      setActiveTabId(previewTabId);
    }
  }, [tabs]);

  // Open Markdown Preview Tab
  const handleOpenMarkdownPreview = useCallback(() => {
    if (!activeFile) return;
    const mdTabId = 'tab-md-preview-' + activeFile.id;
    const existing = tabs.find((t) => t.id === mdTabId);
    if (existing) {
      setActiveTabId(mdTabId);
    } else {
      const newTab: TabItem = {
        id: mdTabId,
        fileId: activeFile.id,
        filePath: activeFile.path,
        title: `📖 Preview: ${activeFile.name}`,
        language: 'markdown',
        isModified: false,
        isMarkdown: true,
      };
      setTabs((prev) => [...prev, newTab]);
      setActiveTabId(mdTabId);
    }
  }, [tabs, activeFile]);

  // File creation
  const handleCreateFile = useCallback((name: string, isFolder: boolean, initialContent?: string) => {
    const lang = isFolder ? 'plaintext' : detectLanguageFromFilename(name);
    const contentText = initialContent !== undefined ? initialContent : (isFolder ? '' : `// ${name}\n`);
    const newFile: FileItem = {
      id: 'f-' + Math.random().toString(36).substring(2, 9),
      name,
      path: '/' + name,
      language: lang,
      isFolder,
      content: contentText,
      originalContent: contentText,
      isModified: false,
      children: isFolder ? [] : undefined,
    };
    setFiles((prev) => [newFile, ...prev]);
    if (!isFolder) {
      handleOpenFile(newFile);
    }
  }, [handleOpenFile]);

  // Delete file
  const handleDeleteFile = useCallback(
    (id: string) => {
      function removeFromTree(items: FileItem[]): FileItem[] {
        return items
          .filter((item) => item.id !== id)
          .map((item) =>
            item.children ? { ...item, children: removeFromTree(item.children) } : item
          );
      }
      setFiles((prev) => removeFromTree(prev));
      setTabs((prev) => prev.filter((t) => t.fileId !== id));
    },
    []
  );

  // Rename file
  const handleRenameFile = useCallback((id: string, newName: string) => {
    function renameInTree(items: FileItem[]): FileItem[] {
      return items.map((item) => {
        if (item.id === id) {
          const newLang = detectLanguageFromFilename(newName);
          return { ...item, name: newName, language: newLang };
        }
        if (item.children) {
          return { ...item, children: renameInTree(item.children) };
        }
        return item;
      });
    }
    setFiles((prev) => renameInTree(prev));
    setTabs((prev) =>
      prev.map((t) => (t.fileId === id ? { ...t, title: newName } : t))
    );
  }, []);

  // Git operations
  const handleStageFile = useCallback((fileId: string) => {
    setFiles((prev) => {
      function stage(items: FileItem[]): FileItem[] {
        return items.map((item) => {
          if (item.id === fileId) return { ...item, isStaged: true };
          if (item.children) return { ...item, children: stage(item.children) };
          return item;
        });
      }
      return stage(prev);
    });
  }, []);

  const handleUnstageFile = useCallback((fileId: string) => {
    setFiles((prev) => {
      function unstage(items: FileItem[]): FileItem[] {
        return items.map((item) => {
          if (item.id === fileId) return { ...item, isStaged: false };
          if (item.children) return { ...item, children: unstage(item.children) };
          return item;
        });
      }
      return unstage(prev);
    });
  }, []);

  const handleStageAll = useCallback(() => {
    setFiles((prev) => {
      function stageAll(items: FileItem[]): FileItem[] {
        return items.map((item) => {
          if (!item.isFolder && item.isModified) return { ...item, isStaged: true };
          if (item.children) return { ...item, children: stageAll(item.children) };
          return item;
        });
      }
      return stageAll(prev);
    });
  }, []);

  const handleUnstageAll = useCallback(() => {
    setFiles((prev) => {
      function unstageAll(items: FileItem[]): FileItem[] {
        return items.map((item) => {
          if (item.children) return { ...item, children: unstageAll(item.children) };
          return { ...item, isStaged: false };
        });
      }
      return unstageAll(prev);
    });
  }, []);

  const handleDiscardChanges = useCallback((fileId: string) => {
    setFiles((prev) => {
      function discard(items: FileItem[]): FileItem[] {
        return items.map((item) => {
          if (item.id === fileId) {
            return {
              ...item,
              content: item.originalContent || '',
              isModified: false,
              isStaged: false,
            };
          }
          if (item.children) return { ...item, children: discard(item.children) };
          return item;
        });
      }
      return discard(prev);
    });

    setTabs((prev) =>
      prev.map((t) => (t.fileId === fileId ? { ...t, isModified: false } : t))
    );
  }, []);

  const handleCommit = useCallback(
    (message: string) => {
      const newHash = Math.random().toString(16).substring(2, 10);
      const newCommit: GitCommit = {
        id: 'c-' + Date.now(),
        hash: newHash + 'a92f8190c',
        shortHash: newHash.substring(0, 7),
        message,
        author: 'Shane Ash <shaneash15@gmail.com>',
        timestamp: 'Just now',
        branch: gitBranch,
        filesChanged: modifiedCount,
      };

      setGitCommits((prev) => [newCommit, ...prev]);

      // Reset modified & staged flags on files
      setFiles((prev) => {
        function resetMod(items: FileItem[]): FileItem[] {
          return items.map((item) => {
            if (!item.isFolder) {
              return {
                ...item,
                originalContent: item.content,
                isModified: false,
                isStaged: false,
              };
            }
            if (item.children) return { ...item, children: resetMod(item.children) };
            return item;
          });
        }
        return resetMod(prev);
      });

      setTabs((prev) => prev.map((t) => ({ ...t, isModified: false })));
    },
    [gitBranch, modifiedCount]
  );

  // Cloud Sync trigger
  const handleTriggerCloudSync = useCallback(() => {
    setIsSyncing(true);
    setTimeout(() => {
      saveWorkspaceLocally(files, gitCommits, settings);
      setIsSyncing(false);
    }, 1200);
  }, [files, gitCommits, settings]);

  // AI Code Checker handlers
  const handleRunAICheck = useCallback(
    async (
      file?: FileItem,
      checkType: 'all' | 'bugs' | 'security' | 'performance' = 'all'
    ) => {
      const targetFile = file || activeFile;
      if (!targetFile) return;

      setIsCheckingCode(true);
      try {
        const res = await checkCodeWithAI(targetFile, checkType);
        setAiCheckResults((prev) => ({ ...prev, [targetFile.id]: res }));
        const converted = convertAIIssuesToProblems(res);
        setAiProblems((prev) => [
          ...prev.filter((p) => p.fileId !== targetFile.id),
          ...converted,
        ]);
      } catch (err) {
        console.error('AI code check error:', err);
      } finally {
        setIsCheckingCode(false);
      }
    },
    [activeFile]
  );

  const handleApplyAIFix = useCallback(
    (issue: AICheckIssue) => {
      if (!activeFile) return;
      const updatedContent = applyAIFix(activeFile.content, issue);
      handleFileContentChange(updatedContent);

      setAiCheckResults((prev) => {
        const curr = prev[activeFile.id];
        if (!curr) return prev;
        return {
          ...prev,
          [activeFile.id]: {
            ...curr,
            issues: curr.issues.filter((i) => i.id !== issue.id),
          },
        };
      });

      setAiProblems((prev) => prev.filter((p) => !p.id.includes(issue.id)));
    },
    [activeFile, handleFileContentChange]
  );

  const handleApplyAllAIFixes = useCallback(
    (improvedCode: string) => {
      if (!activeFile) return;
      handleFileContentChange(improvedCode);
      setAiCheckResults((prev) => {
        const curr = prev[activeFile.id];
        if (!curr) return prev;
        return {
          ...prev,
          [activeFile.id]: {
            ...curr,
            score: 100,
            issues: [],
            summary: 'All AI fixes have been successfully applied to this document!',
          },
        };
      });
      setAiProblems((prev) => prev.filter((p) => p.fileId !== activeFile.id));
    },
    [activeFile, handleFileContentChange]
  );

  const handleJumpToLine = useCallback((line: number) => {
    setCursorPos({ line, col: 1 });
  }, []);

  // Breakpoints handling
  const handleToggleBreakpoint = useCallback(
    (fileId: string, filePath: string, lineNumber: number) => {
      setBreakpoints((prev) => {
        const existing = prev.find((b) => b.fileId === fileId && b.lineNumber === lineNumber);
        if (existing) {
          return prev.filter((b) => b.id !== existing.id);
        } else {
          return [
            ...prev,
            {
              id: 'bp-' + fileId + '-' + lineNumber + '-' + Date.now(),
              fileId,
              filePath,
              lineNumber,
              enabled: true,
            },
          ];
        }
      });
    },
    []
  );

  // Debugger Execution Engine
  const handleStartDebug = useCallback(() => {
    const targetFile = activeFile || files[0];
    if (!targetFile) return;

    setBottomDockOpen(true);
    setBottomDockTab('debug-console');
    setDebugStatus('running');

    const steps = createDebugSimulation(targetFile.id, targetFile.name, targetFile.content);
    setDebugSteps(steps);

    // Look for first breakpoint
    const fileBpLines = breakpoints
      .filter((b) => b.fileId === targetFile.id && b.enabled)
      .map((b) => b.lineNumber);

    let hitIdx = 0;
    if (fileBpLines.length > 0) {
      const foundIdx = steps.findIndex((s) => fileBpLines.includes(s.lineNumber));
      if (foundIdx !== -1) hitIdx = foundIdx;
    }

    const currentStep = steps[hitIdx] || steps[0];
    setCurrentStepIdx(hitIdx);
    setActiveDebugLine(currentStep.lineNumber);
    setDebugStatus('paused');

    // Update call stack & variables
    setDebugFrames([
      {
        id: 'fr-0',
        functionName: currentStep.functionName,
        fileId: currentStep.fileId,
        fileName: currentStep.fileName,
        lineNumber: currentStep.lineNumber,
      },
      {
        id: 'fr-1',
        functionName: 'runSimulation',
        fileId: currentStep.fileId,
        fileName: currentStep.fileName,
        lineNumber: 22,
      },
      {
        id: 'fr-2',
        functionName: '<main entry point>',
        fileId: currentStep.fileId,
        fileName: currentStep.fileName,
        lineNumber: 31,
      },
    ]);

    setDebugVariables(formatVariableList(currentStep.scopeVariables));

    // Update watch values
    setDebugWatches((prev) =>
      prev.map((w) => ({
        ...w,
        value: evaluateDebugExpression(w.expression, currentStep.scopeVariables),
      }))
    );

    if (currentStep.logOutput) {
      setDebugLogs((prev) => [...prev, currentStep.logOutput!]);
    }
  }, [activeFile, files, breakpoints]);

  const handleStepOver = useCallback(() => {
    if (debugSteps.length === 0 || debugStatus !== 'paused') return;
    const nextIdx = currentStepIdx + 1;

    if (nextIdx >= debugSteps.length) {
      setDebugStatus('stopped');
      setActiveDebugLine(null);
      setDebugLogs((prev) => [...prev, '[Debugger] Execution completed successfully.']);
      return;
    }

    const step = debugSteps[nextIdx];
    setCurrentStepIdx(nextIdx);
    setActiveDebugLine(step.lineNumber);

    setDebugFrames((prev) => [
      {
        ...prev[0],
        functionName: step.functionName,
        lineNumber: step.lineNumber,
      },
      ...prev.slice(1),
    ]);

    setDebugVariables(formatVariableList(step.scopeVariables));
    setDebugWatches((prev) =>
      prev.map((w) => ({
        ...w,
        value: evaluateDebugExpression(w.expression, step.scopeVariables),
      }))
    );

    if (step.logOutput) {
      setDebugLogs((prev) => [...prev, step.logOutput!]);
    }
  }, [debugSteps, debugStatus, currentStepIdx]);

  const handleStepInto = useCallback(() => {
    handleStepOver();
  }, [handleStepOver]);

  const handleStepOut = useCallback(() => {
    handleStepOver();
  }, [handleStepOver]);

  const handleStopDebug = useCallback(() => {
    setDebugStatus('stopped');
    setActiveDebugLine(null);
    setDebugLogs((prev) => [...prev, '[Debugger] Session terminated by user.']);
  }, []);

  const handleRestartDebug = useCallback(() => {
    handleStartDebug();
  }, [handleStartDebug]);

  // Prettier document formatting
  const handleFormatActiveDocument = useCallback(() => {
    if (!activeFile) return;
    try {
      let formatted = activeFile.content;
      if (activeFile.language === 'json') {
        formatted = JSON.stringify(JSON.parse(activeFile.content), null, settings.tabSize || 2) + '\n';
      } else {
        const rawLines = activeFile.content.split('\n');
        let indentLevel = 0;
        const indentStr = ' '.repeat(settings.tabSize || 2);
        const newLines = rawLines.map((line) => {
          const trimmed = line.trim();
          if (!trimmed) return '';
          if (trimmed.startsWith('}') || trimmed.startsWith(']') || trimmed.startsWith(')')) {
            indentLevel = Math.max(0, indentLevel - 1);
          }
          const indented = indentStr.repeat(indentLevel) + trimmed;
          if (trimmed.endsWith('{') || trimmed.endsWith('[') || trimmed.endsWith('(')) {
            indentLevel++;
          }
          return indented;
        });
        formatted = newLines.join('\n');
      }
      handleFileContentChange(formatted);
    } catch {
      // keep
    }
  }, [activeFile, settings.tabSize, handleFileContentChange]);

  // Run active file in terminal
  const handleRunActiveFile = useCallback(() => {
    if (!activeFile) return;
    setBottomDockOpen(true);
    setBottomDockTab('terminal');
    // Send run event or trigger execution
  }, [activeFile]);

  // Command Palette items
  const commandsList: CommandItem[] = useMemo(() => {
    return [
      {
        id: 'cmd-save',
        category: 'File',
        title: 'Save Active File',
        shortcut: 'Ctrl+S',
        icon: <Files size={14} />,
        action: () => {
          if (activeFile && activeFile.isModified) {
            handleCommit(`chore: save ${activeFile.name}`);
          }
        },
      },
      {
        id: 'cmd-format',
        category: 'Format',
        title: 'Format Document (Prettier)',
        shortcut: 'Shift+Alt+F',
        icon: <Sparkles size={14} className="text-amber-400" />,
        action: handleFormatActiveDocument,
      },
      {
        id: 'cmd-debug-start',
        category: 'Debug',
        title: 'Start Debugging',
        shortcut: 'F5',
        icon: <Play size={14} className="text-emerald-400" />,
        action: handleStartDebug,
      },
      {
        id: 'cmd-debug-step',
        category: 'Debug',
        title: 'Step Over in Debugger',
        shortcut: 'F10',
        icon: <Bug size={14} className="text-blue-400" />,
        action: handleStepOver,
      },
      {
        id: 'cmd-terminal-toggle',
        category: 'View',
        title: 'Toggle Integrated Terminal',
        shortcut: 'Ctrl+`',
        icon: <Terminal size={14} className="text-emerald-400" />,
        action: () => setBottomDockOpen((prev) => !prev),
      },
      {
        id: 'cmd-cloud-sync',
        category: 'Cloud',
        title: 'Open Cloud Sync & Device Pairing',
        shortcut: 'Ctrl+Shift+S',
        icon: <Cloud size={14} className="text-blue-400" />,
        action: () => setCloudSyncModalOpen(true),
      },
      {
        id: 'cmd-live-preview',
        category: 'Preview',
        title: 'Open Live Web Browser Preview',
        shortcut: 'Ctrl+Shift+V',
        icon: <Eye size={14} className="text-cyan-400" />,
        action: handleOpenLivePreview,
      },
      {
        id: 'cmd-theme-onedark',
        category: 'Preferences',
        title: 'Color Theme: One Dark Pro',
        icon: <Settings size={14} />,
        action: () => setSettings((s) => ({ ...s, theme: 'one-dark-pro' })),
      },
      {
        id: 'cmd-theme-dracula',
        category: 'Preferences',
        title: 'Color Theme: Dracula Official',
        icon: <Settings size={14} />,
        action: () => setSettings((s) => ({ ...s, theme: 'dracula' })),
      },
      {
        id: 'cmd-theme-tokyo',
        category: 'Preferences',
        title: 'Color Theme: Tokyo Night',
        icon: <Settings size={14} />,
        action: () => setSettings((s) => ({ ...s, theme: 'tokyo-night' })),
      },
      {
        id: 'cmd-theme-dark-modern',
        category: 'Preferences',
        title: 'Color Theme: Dark Modern',
        icon: <Settings size={14} />,
        action: () => setSettings((s) => ({ ...s, theme: 'dark-modern' })),
      },
      {
        id: 'cmd-git-stage-all',
        category: 'Git',
        title: 'Stage All Changes',
        icon: <GitBranch size={14} />,
        action: handleStageAll,
      },
      {
        id: 'cmd-git-commit',
        category: 'Git',
        title: 'Commit Staged Changes',
        icon: <GitBranch size={14} />,
        action: () => {
          setActiveView('git');
        },
      },
      {
        id: 'cmd-split-editor',
        category: 'View',
        title: 'Toggle Split Editor View',
        icon: <Columns size={14} />,
        action: () => setIsSplit((prev) => !prev),
      },
      {
        id: 'cmd-github-share',
        category: 'Git',
        title: 'Share as a new GitHub repository',
        shortcut: 'Ctrl+Shift+G',
        icon: <Github size={14} className="text-red-400" />,
        action: () => setGitHubModalOpen(true),
      },
      {
        id: 'cmd-theme-customizer',
        category: 'Preferences',
        title: 'Open Theme Customizer Studio',
        icon: <Palette size={14} className="text-red-400" />,
        action: () => setThemeCustomizerOpen(true),
      },
      {
        id: 'cmd-ai-check',
        category: 'AI',
        title: 'AI: Check Current File for Bugs & Vulnerabilities',
        shortcut: 'Ctrl+Shift+A',
        icon: <Sparkles size={14} className="text-red-400" />,
        action: () => {
          setAiCheckModalOpen(true);
          if (activeFile) handleRunAICheck(activeFile, 'all');
        },
      },
      {
        id: 'cmd-ai-security',
        category: 'AI',
        title: 'AI: Security Vulnerability Scan',
        icon: <Sparkles size={14} className="text-amber-400" />,
        action: () => {
          setAiCheckModalOpen(true);
          if (activeFile) handleRunAICheck(activeFile, 'security');
        },
      },
      {
        id: 'cmd-ai-dock',
        category: 'AI',
        title: 'AI: Open AI Diagnostics Panel in Bottom Dock',
        icon: <Sparkles size={14} className="text-emerald-400" />,
        action: () => {
          setBottomDockOpen(true);
          setBottomDockTab('ai-checker');
          if (activeFile) handleRunAICheck(activeFile, 'all');
        },
      },
      {
        id: 'cmd-zen-mode',
        category: 'View',
        title: 'Toggle Zen Mode (Distraction-Free)',
        shortcut: 'Ctrl+Shift+Z',
        icon: <Maximize2 size={14} className="text-red-400" />,
        action: () => setZenMode((prev) => !prev),
      },
    ];
  }, [
    activeFile,
    handleCommit,
    handleFormatActiveDocument,
    handleStartDebug,
    handleStepOver,
    handleOpenLivePreview,
    handleStageAll,
    handleRunAICheck,
  ]);

  // Global hardware keyboard shortcut listeners
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      // Quick Open (Cmd/Ctrl + P)
      if (modifier && !e.shiftKey && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        setCommandPaletteMode('file');
        setCommandPaletteOpen(true);
        return;
      }

      // Command Palette (Cmd/Ctrl + Shift + P) or F1
      if ((modifier && e.shiftKey && (e.key === 'p' || e.key === 'P')) || e.key === 'F1') {
        e.preventDefault();
        setCommandPaletteMode('command');
        setCommandPaletteOpen(true);
        return;
      }

      // Toggle Sidebar (Cmd/Ctrl + B)
      if (modifier && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        setActiveView((prev) => (prev ? null : 'explorer'));
        return;
      }

      // Toggle Terminal (Cmd/Ctrl + `)
      if (modifier && (e.key === '`' || e.key === '~')) {
        e.preventDefault();
        setBottomDockOpen((prev) => !prev);
        return;
      }

      // Toggle Zen Mode (Cmd/Ctrl + Shift + Z)
      if (modifier && e.shiftKey && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        setZenMode((prev) => !prev);
        return;
      }

      // Escape exits Zen Mode when no modal is open
      if (
        e.key === 'Escape' &&
        zenMode &&
        !commandPaletteOpen &&
        !cloudSyncModalOpen &&
        !gitHubModalOpen &&
        !themeCustomizerOpen &&
        !aiCheckModalOpen
      ) {
        e.preventDefault();
        setZenMode(false);
        return;
      }

      // Debugger shortcuts (F5, F10, F11)
      if (e.key === 'F5') {
        e.preventDefault();
        handleStartDebug();
        return;
      }
      if (e.key === 'F10') {
        e.preventDefault();
        handleStepOver();
        return;
      }
      if (e.key === 'F11') {
        e.preventDefault();
        handleStepInto();
        return;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [
    handleStartDebug,
    handleStepOver,
    handleStepInto,
    zenMode,
    commandPaletteOpen,
    cloudSyncModalOpen,
    gitHubModalOpen,
    themeCustomizerOpen,
    aiCheckModalOpen,
  ]);

  const activeTheme = customThemes[settings.theme] || THEMES[settings.theme] || THEMES['dark-modern'];

  return (
    <div
      className="flex flex-col h-screen w-screen overflow-hidden select-none font-sans text-xs"
      style={{
        backgroundColor: activeTheme.bgMain,
        color: activeTheme.textPrimary,
      }}
    >
      {/* Top Application Bar (hidden in Zen Mode) */}
      {!zenMode && (
        <div className="flex items-center justify-between px-3 py-1 bg-[#181818] border-b border-[#2b2b2b] select-none shrink-0 h-10">
          <div className="flex items-center gap-2">
            {/* Mobile Sidebar Menu Toggle */}
            <button
              type="button"
              onClick={() => setActiveView((v) => (v ? null : 'explorer'))}
              className="md:hidden p-1.5 hover:bg-[#282828] text-gray-300 hover:text-white rounded-md"
              title="Toggle Sidebar"
            >
              <Files size={18} />
            </button>

            {/* App Branding with Dark Red Accent */}
            <div className="flex items-center gap-1.5 font-semibold text-white tracking-wide">
              <span className="w-5 h-5 rounded bg-[#991b1b] flex items-center justify-center font-mono text-[10px] text-white font-bold shadow-xs">
                CP
              </span>
              <span className="font-medium text-xs">CodePocket</span>
              <span className="hidden sm:inline text-[10px] text-red-300 font-mono bg-[#7f1d1d]/40 px-1.5 py-0.2 rounded border border-[#991b1b]/50">
                Mobile IDE
              </span>
            </div>
          </div>

          {/* Top Quick Open / Search Box */}
          <button
            type="button"
            onClick={() => {
              setCommandPaletteMode('file');
              setCommandPaletteOpen(true);
            }}
            className="flex items-center justify-between gap-3 px-3 py-1 bg-[#252526] hover:bg-[#2d2d2e] text-gray-400 hover:text-gray-200 rounded-lg border border-[#383838] max-w-sm w-40 sm:w-72 cursor-pointer transition-colors shadow-inner"
          >
            <div className="flex items-center gap-1.5 truncate">
              <Search size={13} className="shrink-0" />
              <span className="truncate text-[11px] font-mono">
                {activeFile ? activeFile.name : 'Go to file...'}
              </span>
            </div>
            <span className="hidden sm:inline text-[10px] font-mono bg-[#181818] px-1 py-0.2 rounded text-gray-500 border border-[#333]">
              Ctrl+P
            </span>
          </button>

          {/* Quick Top Right Action Buttons */}
          <div className="flex items-center gap-1.5">
            {/* AI Code Checker Quick Trigger */}
            <button
              type="button"
              onClick={() => {
                setAiCheckModalOpen(true);
                if (activeFile && !aiCheckResults[activeFile.id]) {
                  handleRunAICheck(activeFile, 'all');
                }
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-[#252526] hover:bg-[#333333] active:scale-95 text-red-300 hover:text-white rounded-lg text-[11px] font-semibold border border-[#991b1b]/50 shadow-xs transition-all cursor-pointer"
              title="AI Code Checker (Gemini 3.8)"
            >
              <Sparkles size={13} className="text-red-400" />
              <span className="hidden sm:inline">AI Check</span>
              {activeFile && (aiCheckResults[activeFile.id]?.issues.length || 0) > 0 && (
                <span className="bg-[#991b1b] text-white text-[9px] font-bold px-1 rounded-full">
                  {aiCheckResults[activeFile.id].issues.length}
                </span>
              )}
            </button>

            {/* Share as New GitHub Repository */}
            <button
              type="button"
              onClick={() => setGitHubModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-[#991b1b] hover:bg-[#7f1d1d] active:scale-95 text-white rounded-lg text-[11px] font-semibold shadow-xs transition-all cursor-pointer"
              title="Share as a new GitHub repository"
            >
              <Github size={13} />
              <span className="hidden sm:inline">Share to GitHub</span>
            </button>

            {/* Zen Mode Toggle */}
            <button
              type="button"
              onClick={() => setZenMode(true)}
              className="p-1.5 hover:bg-[#333333] text-gray-300 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Enter Zen Mode (Ctrl+Shift+Z)"
            >
              <Maximize2 size={15} />
            </button>

            {/* Theme Customizer Quick Trigger */}
            <button
              type="button"
              onClick={() => setThemeCustomizerOpen(true)}
              className="p-1.5 hover:bg-[#333333] text-red-400 hover:text-red-300 rounded-lg transition-colors border border-transparent hover:border-red-500/30 cursor-pointer"
              title="Open Theme Customizer Studio"
            >
              <Palette size={15} />
            </button>

            {/* Cloud Sync Quick Pill */}
            <button
              type="button"
              onClick={() => setCloudSyncModalOpen(true)}
              className="flex items-center gap-1 px-2 py-1 bg-[#252526] hover:bg-[#333333] text-gray-300 hover:text-white rounded-lg text-[11px] border border-[#3c3c3c] transition-colors cursor-pointer"
              title="Device Cloud Sync"
            >
              <Cloud size={13} className={isSyncing ? 'text-red-400 animate-pulse' : 'text-emerald-400'} />
              <span className="hidden md:inline font-mono text-[10px]">{syncCode.slice(0, 9)}</span>
            </button>

            {/* Run active file */}
            <button
              type="button"
              onClick={handleStartDebug}
              className="p-1.5 hover:bg-[#333333] text-emerald-400 hover:text-emerald-300 rounded-lg transition-colors cursor-pointer"
              title="Run & Debug (F5)"
            >
              <Play size={15} fill="currentColor" />
            </button>
          </div>
        </div>
      )}

      {/* Main Workbench Body: Activity Bar + Primary Sidebar + Editor Space */}
      <div className="flex flex-1 w-full overflow-hidden relative">
        {/* Floating Exit Zen Mode Pill */}
        {zenMode && (
          <button
            type="button"
            onClick={() => setZenMode(false)}
            title="Exit Zen Mode (Esc)"
            className="fixed top-3 right-4 z-40 flex items-center gap-1.5 px-3 py-1.5 bg-[#252526]/90 hover:bg-[#991b1b] text-gray-200 hover:text-white rounded-full text-[11px] font-medium border border-[#3c3c3c] shadow-lg backdrop-blur-xs transition-all cursor-pointer"
          >
            <Minimize2 size={13} />
            <span>Exit Zen Mode</span>
          </button>
        )}

        {/* Desktop / Tablet Vertical Activity Bar (hidden in Zen Mode) */}
        {!zenMode && (
          <ActivityBar
            activeView={activeView}
            onSelectView={setActiveView}
            modifiedCount={modifiedCount}
            isDebugActive={debugStatus === 'running' || debugStatus === 'paused'}
            onToggleTerminal={() => setBottomDockOpen((prev) => !prev)}
            onOpenCloudSync={() => setCloudSyncModalOpen(true)}
            isCloudSynced={!isSyncing}
            aiIssueCount={activeFile ? aiCheckResults[activeFile.id]?.issues.length : 0}
          />
        )}

        {/* Primary Sidebar Panel (hidden in Zen Mode) */}
        {!zenMode && activeView && (
          <div
            className="w-72 sm:w-80 md:w-64 lg:w-72 h-full border-r border-[#2b2b2b] shrink-0 z-20 flex flex-col absolute md:relative inset-y-0 left-0 md:left-auto shadow-2xl md:shadow-none bg-[#252526]"
          >
            {activeView === 'explorer' && (
              <ExplorerPanel
                files={files}
                activeFileId={activeFile?.id || null}
                recentFiles={recentFiles}
                onSelectFile={handleOpenFile}
                onCreateFile={handleCreateFile}
                onDeleteFile={handleDeleteFile}
                onRenameFile={handleRenameFile}
              />
            )}
            {activeView === 'search' && (
              <SearchPanel
                files={files}
                onSelectMatch={(file, line) => {
                  handleOpenFile(file);
                  setCursorPos({ line, col: 1 });
                }}
                onReplaceInFile={(fileId, searchRegex, newText) => {
                  setFiles((prev) => {
                    function replaceInTree(items: FileItem[]): FileItem[] {
                      return items.map((item) => {
                        if (item.id === fileId && !item.isFolder) {
                          const updated = item.content.replace(searchRegex, newText);
                          return {
                            ...item,
                            content: updated,
                            isModified: updated !== item.originalContent,
                          };
                        }
                        if (item.children) {
                          return { ...item, children: replaceInTree(item.children) };
                        }
                        return item;
                      });
                    }
                    return replaceInTree(prev);
                  });
                  setTabs((prev) =>
                    prev.map((t) => (t.fileId === fileId ? { ...t, isModified: true } : t))
                  );
                }}
                onReplaceAllInWorkspace={(searchRegex, newText) => {
                  const modifiedIds = new Set<string>();
                  setFiles((prev) => {
                    function replaceAllTree(items: FileItem[]): FileItem[] {
                      return items.map((item) => {
                        if (!item.isFolder && searchRegex.test(item.content)) {
                          searchRegex.lastIndex = 0;
                          const updated = item.content.replace(searchRegex, newText);
                          if (updated !== item.content) {
                            modifiedIds.add(item.id);
                            return {
                              ...item,
                              content: updated,
                              isModified: updated !== item.originalContent,
                            };
                          }
                        }
                        if (item.children) {
                          return { ...item, children: replaceAllTree(item.children) };
                        }
                        return item;
                      });
                    }
                    return replaceAllTree(prev);
                  });
                  setTabs((prev) =>
                    prev.map((t) =>
                      modifiedIds.has(t.fileId) ? { ...t, isModified: true } : t
                    )
                  );
                }}
              />
            )}
            {activeView === 'git' && (
              <SourceControlPanel
                files={files}
                gitBranch={gitBranch}
                gitCommits={gitCommits}
                onBranchChange={setGitBranch}
                onOpenFileDiff={handleOpenFileDiff}
                onStageFile={handleStageFile}
                onUnstageFile={handleUnstageFile}
                onStageAll={handleStageAll}
                onUnstageAll={handleUnstageAll}
                onDiscardChanges={handleDiscardChanges}
                onCommit={handleCommit}
                onPushToCloud={handleTriggerCloudSync}
                isSyncing={isSyncing}
              />
            )}
            {activeView === 'debug' && (
              <RunAndDebugPanel
                status={debugStatus}
                activeLine={activeDebugLine}
                activeFile={activeFile}
                frames={debugFrames}
                variables={debugVariables}
                watches={debugWatches}
                breakpoints={breakpoints}
                onStartDebug={handleStartDebug}
                onPauseDebug={() => setDebugStatus('paused')}
                onStepOver={handleStepOver}
                onStepInto={handleStepInto}
                onStepOut={handleStepOut}
                onRestartDebug={handleRestartDebug}
                onStopDebug={handleStopDebug}
                onAddWatch={(expr) =>
                  setDebugWatches((prev) => [
                    ...prev,
                    {
                      id: 'w-' + Date.now(),
                      expression: expr,
                      value: evaluateDebugExpression(expr, {}),
                    },
                  ])
                }
                onRemoveWatch={(id) => setDebugWatches((prev) => prev.filter((w) => w.id !== id))}
                onToggleBreakpoint={handleToggleBreakpoint}
                onRemoveBreakpoint={(id) => setBreakpoints((prev) => prev.filter((b) => b.id !== id))}
                onClearAllBreakpoints={() => setBreakpoints([])}
              />
            )}
            {activeView === 'extensions' && (
              <ExtensionsPanel
                extensions={extensions}
                onToggleExtension={(id) =>
                  setExtensions((prev) =>
                    prev.map((e) => (e.id === id ? { ...e, enabled: !e.enabled } : e))
                  )
                }
                onInstallExtension={(id) =>
                  setExtensions((prev) =>
                    prev.map((e) => (e.id === id ? { ...e, installed: true, enabled: true } : e))
                  )
                }
                onUninstallExtension={(id) =>
                  setExtensions((prev) =>
                    prev.map((e) => (e.id === id ? { ...e, installed: false, enabled: false } : e))
                  )
                }
                onSelectTheme={(themeId) => setSettings((s) => ({ ...s, theme: themeId }))}
                onOpenThemeCustomizer={() => setThemeCustomizerOpen(true)}
              />
            )}
            {activeView === 'settings' && (
              <SettingsPanel
                settings={settings}
                onUpdateSettings={(newSettings) => setSettings((s) => ({ ...s, ...newSettings }))}
                onOpenCloudSync={() => setCloudSyncModalOpen(true)}
                syncCode={syncCode}
              />
            )}
            {activeView === 'ai' && (
              <AICodeCheckerSidebarPanel
                activeFile={activeFile}
                result={activeFile ? aiCheckResults[activeFile.id] || null : null}
                isLoading={isCheckingCode}
                onRunCheck={handleRunAICheck}
                onApplyFix={handleApplyAIFix}
                onApplyAllFixes={handleApplyAllAIFixes}
                onJumpToLine={handleJumpToLine}
                onOpenFullModal={() => setAiCheckModalOpen(true)}
              />
            )}
          </div>
        )}

        {/* Editor Area */}
        <div className="flex flex-col flex-1 h-full overflow-hidden relative">
          {/* Tab Strip */}
          <EditorTabs
            tabs={tabs}
            activeTabId={activeTabId}
            onSelectTab={setActiveTabId}
            onCloseTab={handleCloseTab}
            onRunActiveFile={handleRunActiveFile}
            onOpenLivePreview={handleOpenLivePreview}
            onOpenMarkdownPreview={handleOpenMarkdownPreview}
            onSplitEditor={() => setIsSplit((prev) => !prev)}
            isSplit={isSplit}
            onOpenAIChecker={() => {
              setAiCheckModalOpen(true);
              if (activeFile && !aiCheckResults[activeFile.id]) {
                handleRunAICheck(activeFile, 'all');
              }
            }}
            aiIssueCount={activeFile ? aiCheckResults[activeFile.id]?.issues.length : 0}
          />

          {/* Breadcrumb Path */}
          <Breadcrumbs file={activeFile} />

          {/* Main Editor Canvas */}
          <div className="flex flex-1 w-full overflow-hidden">
            {activeTab?.isDiff && activeFile ? (
              <DiffViewer
                file={activeFile}
                onStageFile={handleStageFile}
                onDiscardChanges={handleDiscardChanges}
                onClose={() => handleCloseTab(activeTab.id)}
              />
            ) : activeTab?.isPreview ? (
              <LivePreview files={files} activeFile={activeFile || files[0]} />
            ) : activeTab?.isMarkdown && activeFile ? (
              <MarkdownPreview file={activeFile} />
            ) : activeFile ? (
              <div className={`flex flex-1 h-full w-full overflow-hidden ${isSplit ? 'flex-col sm:flex-row' : ''}`}>
                <CodeEditor
                  file={activeFile}
                  onChange={handleFileContentChange}
                  breakpoints={breakpoints}
                  onToggleBreakpoint={handleToggleBreakpoint}
                  activeDebugLine={activeDebugLine}
                  settings={settings}
                  onSave={() => handleCommit(`chore: save ${activeFile.name}`)}
                  onCursorChange={(line, col) => setCursorPos({ line, col })}
                  onNextTab={handleNextTab}
                  onPrevTab={handlePrevTab}
                  onToggleTerminal={() => setBottomDockOpen((prev) => !prev)}
                  activeTabTitle={activeTab?.title}
                  allTabsCount={tabs.length}
                />
                {isSplit && (
                  <div className="flex-1 h-full border-l border-[#2b2b2b] hidden sm:flex">
                    <LivePreview files={files} activeFile={activeFile} />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-gray-500 select-none">
                <span className="w-12 h-12 rounded-xl bg-red-600/10 text-red-500 flex items-center justify-center text-xl font-bold mb-3">
                  CP
                </span>
                <p className="text-sm font-medium text-gray-300">No file is currently open</p>
                <p className="text-xs text-gray-500 mt-1">Press Ctrl+P to quick open or choose from the Explorer</p>
              </div>
            )}
          </div>

          {/* Bottom Dock (hidden in Zen Mode) */}
          {!zenMode && (
            <BottomDock
              activeTab={bottomDockTab}
              onTabChange={setBottomDockTab}
              isOpen={bottomDockOpen}
              onToggleOpen={() => setBottomDockOpen((prev) => !prev)}
              isMaximized={bottomDockMaximized}
              onToggleMaximize={() => setBottomDockMaximized((prev) => !prev)}
              files={files}
              gitBranch={gitBranch}
              gitCommits={gitCommits}
              debugLogs={debugLogs}
              debugVariables={debugVariables}
              problems={problems}
              onSelectProblem={(filePath, line) => {
                const file = files.find((f) => f.path === filePath);
                if (file) {
                  handleOpenFile(file);
                  setCursorPos({ line, col: 1 });
                }
              }}
              onClearDebugLogs={() => setDebugLogs([])}
              onFileCreate={(name, content) => handleCreateFile(name, false, content)}
              onFileDelete={handleDeleteFile}
              onCommit={handleCommit}
              onBranchChange={setGitBranch}
              activeFile={activeFile}
              aiResult={activeFile ? aiCheckResults[activeFile.id] || null : null}
              isCheckingAI={isCheckingCode}
              onRunAICheck={handleRunAICheck}
              onApplyAIFix={handleApplyAIFix}
              onApplyAllAIFixes={handleApplyAllAIFixes}
              onJumpToLine={handleJumpToLine}
            />
          )}
        </div>
      </div>

      {/* VS Code Bottom Status Bar (hidden in Zen Mode) */}
      {!zenMode && (
        <StatusBar
          gitBranch={gitBranch}
          isCloudSynced={!isSyncing}
          errorCount={problems.filter((p) => p.severity === 'error').length}
          warningCount={problems.filter((p) => p.severity === 'warning').length}
          cursorLine={cursorPos.line}
          cursorCol={cursorPos.col}
          tabSize={settings.tabSize}
          language={activeFile?.language || 'plaintext'}
          onOpenCommandPalette={() => {
            setCommandPaletteMode('command');
            setCommandPaletteOpen(true);
          }}
          onOpenCloudSync={() => setCloudSyncModalOpen(true)}
          onOpenProblems={() => {
            setBottomDockOpen(true);
            setBottomDockTab('problems');
          }}
          onFormatDocument={handleFormatActiveDocument}
          statusBarBg={activeTheme.statusBarBg}
          statusBarFg={activeTheme.statusBarFg}
        />
      )}

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        files={files}
        onOpenFile={handleOpenFile}
        commands={commandsList}
        initialMode={commandPaletteMode}
      />

      {/* Cross-Device Cloud Sync Modal */}
      <CloudSyncModal
        isOpen={cloudSyncModalOpen}
        onClose={() => setCloudSyncModalOpen(false)}
        syncCode={syncCode}
        files={files}
        gitCommits={gitCommits}
        onImportWorkspace={(importedFiles, importedCommits) => {
          setFiles(importedFiles);
          if (importedCommits) setGitCommits(importedCommits);
        }}
        onTriggerSync={handleTriggerCloudSync}
        isSyncing={isSyncing}
      />

      {/* Theme Customizer Studio Modal */}
      <ThemeCustomizerModal
        isOpen={themeCustomizerOpen}
        onClose={() => setThemeCustomizerOpen(false)}
        currentTheme={activeTheme}
        onApplyTheme={(newTheme) => {
          setCustomThemes((prev) => ({ ...prev, [newTheme.id]: newTheme }));
          setSettings((s) => ({ ...s, theme: newTheme.id }));
        }}
      />

      {/* Share / Publish to GitHub Modal */}
      <PublishToGitHubModal
        isOpen={gitHubModalOpen}
        onClose={() => setGitHubModalOpen(false)}
        files={files}
        gitCommits={gitCommits}
        userEmail="shaneash15@gmail.com"
      />

      {/* AI Code Checker Modal */}
      <AICodeCheckerModal
        isOpen={aiCheckModalOpen}
        onClose={() => setAiCheckModalOpen(false)}
        activeFile={activeFile}
        files={files}
        result={activeFile ? aiCheckResults[activeFile.id] || null : null}
        isLoading={isCheckingCode}
        onRunCheck={handleRunAICheck}
        onApplyFix={handleApplyAIFix}
        onApplyAllFixes={handleApplyAllAIFixes}
        onJumpToLine={handleJumpToLine}
      />
    </div>
  );
}
