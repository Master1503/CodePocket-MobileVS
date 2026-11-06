/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

/**
 * AI Code Checker API endpoint using Gemini 3.8 Flash
 */
app.post('/api/ai/check-code', async (req, res) => {
  const { filename, code, language, checkType = 'all' } = req.body;

  if (!code && code !== '') {
    return res.status(400).json({ error: 'Code content is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY is not configured on the server',
      fallbackRequired: true,
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `Analyze this ${language || 'source'} file ("${filename || 'code'}") for syntax errors, logic bugs, security vulnerabilities (OWASP, injection, XSS, prototype pollution, secret exposure), performance bottlenecks, and style/best practice issues.

Focus mode: ${checkType}.
Source Code:
\`\`\`${language || ''}
${code}
\`\`\`

Provide an in-depth audit with line numbers (1-indexed), issue categories, severity (error, warning, info), concise titles, clear explanations, specific replacement code snippets, a quality score (0 to 100), and the complete improved version of the file with fixes applied.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are a principal software engineer, security auditor, and compiler diagnostic specialist. You review source code with extreme precision, finding actual vulnerabilities, runtime exceptions, typing issues, and performance leaks. You must return structured JSON matching the provided schema with accurate 1-indexed line numbers.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: 'Concise executive summary of code health and findings',
            },
            score: {
              type: Type.INTEGER,
              description: 'Overall code quality score between 0 and 100',
            },
            metrics: {
              type: Type.OBJECT,
              properties: {
                maintainability: { type: Type.INTEGER },
                security: { type: Type.INTEGER },
                performance: { type: Type.INTEGER },
                reliability: { type: Type.INTEGER },
              },
              required: ['maintainability', 'security', 'performance', 'reliability'],
            },
            issues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  line: { type: Type.INTEGER, description: '1-indexed line number' },
                  column: { type: Type.INTEGER, description: '1-indexed column number' },
                  severity: { type: Type.STRING, description: 'error | warning | info' },
                  category: {
                    type: Type.STRING,
                    description: 'bug | security | performance | syntax | style',
                  },
                  title: { type: Type.STRING, description: 'Short title of the problem' },
                  message: { type: Type.STRING, description: 'Detailed diagnostic explanation' },
                  suggestedFix: { type: Type.STRING, description: 'Guidance on how to fix' },
                  originalCode: { type: Type.STRING, description: 'Current problematic snippet' },
                  replacementCode: {
                    type: Type.STRING,
                    description: 'Exact replacement code snippet or line',
                  },
                },
                required: ['id', 'line', 'severity', 'category', 'title', 'message'],
              },
            },
            improvedCode: {
              type: Type.STRING,
              description: 'Complete corrected source code for the entire file',
            },
          },
          required: ['summary', 'score', 'metrics', 'issues'],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response received from Gemini model');
    }

    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Gemini AI Code Checker error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to inspect code with Gemini AI',
      fallbackRequired: true,
    });
  }
});

// Full-stack Vite development server or production static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CodePocket] Server active on port ${PORT}`);
  });
}

startServer();
