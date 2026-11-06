/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FileItem, TerminalLine, GitCommit } from '../types/vscode.ts';

export interface CommandContext {
  files: FileItem[];
  workingDir: string;
  gitBranch: string;
  gitCommits: GitCommit[];
  onFileCreate?: (name: string, content: string) => void;
  onFileDelete?: (path: string) => void;
  onCommit?: (message: string) => void;
  onBranchChange?: (branch: string) => void;
  onClear?: () => void;
}

export function getAllFilePaths(files: FileItem[]): string[] {
  const paths: string[] = [];
  function recurse(items: FileItem[]) {
    for (const item of items) {
      paths.push(item.path);
      if (item.children) {
        recurse(item.children);
      }
    }
  }
  recurse(files);
  return paths;
}

export function findFileByPath(files: FileItem[], path: string): FileItem | null {
  const normalized = path.startsWith('/') ? path : '/' + path;
  function search(items: FileItem[]): FileItem | null {
    for (const item of items) {
      if (item.path === normalized || item.name === path || item.path.endsWith('/' + path)) {
        return item;
      }
      if (item.children) {
        const found = search(item.children);
        if (found) return found;
      }
    }
    return null;
  }
  return search(files);
}

export function executeTerminalCommand(rawCommand: string, ctx: CommandContext): TerminalLine[] {
  const trimmed = rawCommand.trim();
  if (!trimmed) return [];

  const parts = trimmed.split(/\s+/);
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);
  const result: TerminalLine[] = [];

  const addLine = (text: string, type: TerminalLine['type'] = 'output') => {
    result.push({
      id: 'tl-' + Math.random().toString(36).slice(2, 9),
      type,
      text,
      timestamp: new Date().toLocaleTimeString(),
    });
  };

  switch (command) {
    case 'help':
      addLine('CodePocket Mobile Shell v1.0.0 (x86_64-mobile-linux-gnu)', 'info');
      addLine('Available commands:');
      addLine('  ls, dir               - List directory contents');
      addLine('  cat <file>            - View contents of a file');
      addLine('  pwd                   - Print working directory');
      addLine('  node <file>           - Execute JavaScript file with V8 runtime');
      addLine('  python <file>         - Run Python script');
      addLine('  git status            - Show source control state');
      addLine('  git branch            - List or switch branches');
      addLine('  git log               - View commit history');
      addLine('  git commit -m "msg"   - Record changes to repository');
      addLine('  git push / pull       - Sync with remote cloud origin');
      addLine('  npm test | build      - Run project build or test suite');
      addLine('  touch <file>          - Create a new empty file');
      addLine('  rm <file>             - Remove a file');
      addLine('  clear                 - Clear terminal screen');
      addLine('  echo <msg>            - Print message to console');
      addLine('  whoami, date, uname   - System inspection tools');
      break;

    case 'clear':
    case 'cls':
      if (ctx.onClear) ctx.onClear();
      return [];

    case 'pwd':
      addLine(ctx.workingDir || '/workspace');
      break;

    case 'whoami':
      addLine('developer@codepocket-mobile');
      break;

    case 'date':
      addLine(new Date().toUTCString());
      break;

    case 'uname':
    case 'uname -a':
      addLine('Linux codepocket-device 6.8.0-arm64 #1 SMP PREEMPT Touch-Kernel aarch64 GNU/Linux');
      break;

    case 'ls':
    case 'dir': {
      const showAll = args.includes('-a') || args.includes('-la');
      const listing: string[] = [];
      for (const f of ctx.files) {
        if (!showAll && f.name.startsWith('.')) continue;
        if (f.isFolder) {
          listing.push(`📁 ${f.name}/`);
        } else {
          listing.push(`📄 ${f.name}`);
        }
      }
      addLine(listing.join('   '));
      break;
    }

    case 'cat': {
      if (!args[0]) {
        addLine('cat: missing file operand', 'error');
        break;
      }
      const target = findFileByPath(ctx.files, args[0]);
      if (!target) {
        addLine(`cat: ${args[0]}: No such file or directory`, 'error');
      } else if (target.isFolder) {
        addLine(`cat: ${args[0]}: Is a directory`, 'error');
      } else {
        const lines = target.content.split('\n');
        for (const line of lines) {
          addLine(line);
        }
      }
      break;
    }

    case 'touch': {
      if (!args[0]) {
        addLine('touch: missing file operand', 'error');
        break;
      }
      if (ctx.onFileCreate) {
        ctx.onFileCreate(args[0], '// Created via mobile terminal\n');
        addLine(`Created file: ${args[0]}`, 'success');
      }
      break;
    }

    case 'rm': {
      if (!args[0]) {
        addLine('rm: missing operand', 'error');
        break;
      }
      if (ctx.onFileDelete) {
        ctx.onFileDelete(args[0]);
        addLine(`Removed ${args[0]}`, 'info');
      }
      break;
    }

    case 'echo': {
      addLine(args.join(' '));
      break;
    }

    case 'node': {
      if (!args[0]) {
        addLine('Welcome to Node.js v20.11.0 (Mobile V8 engine). Type .exit to exit.', 'info');
        break;
      }
      const target = findFileByPath(ctx.files, args[0]);
      if (!target) {
        addLine(`Error: Cannot find module '${args[0]}'`, 'error');
        break;
      }
      addLine(`$ node ${args[0]}`, 'info');
      try {
        const logs: string[] = [];
        const originalLog = console.log;
        console.log = (...msgs: any[]) => {
          logs.push(msgs.map(m => (typeof m === 'object' ? JSON.stringify(m) : String(m))).join(' '));
        };
        try {
          // eslint-disable-next-line no-new-func
          const executeFn = new Function(target.content);
          executeFn();
          for (const l of logs) {
            addLine(l, 'output');
          }
          addLine(`[Process completed with exit code 0]`, 'success');
        } finally {
          console.log = originalLog;
        }
      } catch (err: any) {
        addLine(`Syntax/Runtime Error: ${err.message}`, 'error');
      }
      break;
    }

    case 'python':
    case 'python3': {
      if (!args[0]) {
        addLine('Python 3.12.2 (main, mobile interactive shell) [GCC 13.2.0]', 'info');
        break;
      }
      const target = findFileByPath(ctx.files, args[0]);
      if (!target) {
        addLine(`python: can't open file '${args[0]}': [Errno 2] No such file or directory`, 'error');
        break;
      }
      addLine(`$ python3 ${args[0]}`, 'info');
      if (target.path.includes('math_tools') || target.content.includes('fibonacci')) {
        addLine('--- Fibonacci (first 10 numbers) ---');
        addLine('Result: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]');
        addLine('');
        addLine('--- Prime Check (1 to 25) ---');
        addLine('Primes found: [2, 3, 5, 7, 11, 13, 17, 19, 23]');
        addLine('[Finished in 0.042s with exit code 0]', 'success');
      } else {
        addLine(`Executed ${args[0]} successfully.`);
        addLine('[Process completed with exit code 0]', 'success');
      }
      break;
    }

    case 'git': {
      const sub = args[0];
      if (!sub || sub === 'help') {
        addLine('git version 2.44.0.mobile');
        addLine('usage: git status | branch | log | commit -m "..." | push | pull | diff');
      } else if (sub === 'status') {
        addLine(`On branch ${ctx.gitBranch}`, 'info');
        addLine('Your branch is up to date with \'origin/' + ctx.gitBranch + '\'.');
        const modifiedFiles: string[] = [];
        function checkModified(items: FileItem[]) {
          for (const f of items) {
            if (f.isModified) modifiedFiles.push(f.name);
            if (f.children) checkModified(f.children);
          }
        }
        checkModified(ctx.files);

        if (modifiedFiles.length === 0) {
          addLine('nothing to commit, working tree clean', 'success');
        } else {
          addLine('Changes not staged for commit:');
          for (const mf of modifiedFiles) {
            addLine(`\tmodified:   ${mf}`, 'error');
          }
        }
      } else if (sub === 'branch') {
        if (args[1]) {
          if (ctx.onBranchChange) {
            ctx.onBranchChange(args[1]);
            addLine(`Switched to branch '${args[1]}'`, 'success');
          }
        } else {
          addLine(`* \x1b[32m${ctx.gitBranch}\x1b[0m`, 'success');
          addLine('  feature/touch-nav');
          addLine('  dev');
        }
      } else if (sub === 'checkout') {
        if (!args[1]) {
          addLine('fatal: specify a branch to checkout', 'error');
        } else {
          if (ctx.onBranchChange) {
            ctx.onBranchChange(args[1]);
            addLine(`Switched to branch '${args[1]}'`, 'success');
          }
        }
      } else if (sub === 'log') {
        addLine('commit ' + (ctx.gitCommits[0]?.hash || 'a38f901bce471829d2b7') + ` (HEAD -> ${ctx.gitBranch})`, 'info');
        addLine(`Author: Shane Ash <shaneash15@gmail.com>`);
        addLine(`Date:   ${new Date().toUTCString()}`);
        addLine(`\n    ${ctx.gitCommits[0]?.message || 'feat: mobile ide update'}\n`);
      } else if (sub === 'commit') {
        const msgIdx = args.indexOf('-m');
        const commitMsg = msgIdx !== -1 && args[msgIdx + 1] ? args.slice(msgIdx + 1).join(' ').replace(/['"]/g, '') : 'feat: update from mobile terminal';
        if (ctx.onCommit) {
          ctx.onCommit(commitMsg);
          addLine(`[${ctx.gitBranch} ${Math.random().toString(16).slice(2, 9)}] ${commitMsg}`, 'success');
        }
      } else if (sub === 'push') {
        addLine(`Enumerating objects: 5, done.`, 'info');
        addLine(`Writing objects: 100% (5/5), 1.2 KiB | 1.2 MiB/s, done.`, 'info');
        addLine(`To https://github.com/shaneash15/codepocket.git`, 'info');
        addLine(`   a38f901..6fe3128  ${ctx.gitBranch} -> ${ctx.gitBranch}`, 'success');
      } else if (sub === 'pull') {
        addLine(`Already up to date.`, 'success');
      } else {
        addLine(`git: '${sub}' is not a git command. See 'git --help'.`, 'error');
      }
      break;
    }

    case 'npm': {
      const sub = args[0];
      if (sub === 'test') {
        addLine('Running test suite...', 'info');
        addLine('✓ test/gameEngine.test.js: calculateScore (12ms)', 'success');
        addLine('✓ test/math_tools.test.py: fibonacci_sequence (8ms)', 'success');
        addLine('Test Suites: 2 passed, 2 total', 'success');
        addLine('Tests:       6 passed, 6 total', 'success');
        addLine('Time:        0.45s', 'info');
      } else if (sub === 'run' && args[1] === 'build') {
        addLine('> codepocket@1.0.0 build', 'info');
        addLine('vite v8.3.0 building for production...', 'info');
        addLine('✓ 42 modules transformed.', 'success');
        addLine('dist/index.html   1.2 kB', 'info');
        addLine('dist/assets/index-D7b39a.js   89.4 kB │ gzip: 24.1 kB', 'success');
        addLine('✓ built in 142ms', 'success');
      } else if (sub === 'install' || sub === 'i') {
        const pkg = args[1] || 'all packages';
        addLine(`added 1 package in 0.8s: ${pkg}`, 'success');
      } else {
        addLine(`npm command '${sub || ''}' executed successfully.`, 'info');
      }
      break;
    }

    default:
      addLine(`command not found: ${command}. Type 'help' for available commands.`, 'error');
  }

  return result;
}
