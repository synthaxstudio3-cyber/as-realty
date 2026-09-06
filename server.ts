import 'dotenv/config';
import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(express.json());

import {
  AS_REALTY_HINGLISH_VOICE_INSTRUCTION,
  AS_REALTY_SYSTEM_INSTRUCTION,
  generateSmartFallback,
} from './src/data/advisorKnowledge';

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'AS Realty AI Concierge' });
});

// Gemini Multi-Turn Chatbot API
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [], modelSpeed = 'general' } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required and must be a string.' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Determine model according to prompt specifications:
    // "Use gemini-3.1-pro-preview for particularly complex tasks, gemini-3.5-flash for general tasks, and gemini-3.1-flash-lite for tasks that should happen fast."
    let model = 'gemini-3.5-flash';
    if (modelSpeed === 'complex') {
      model = 'gemini-3.1-pro-preview';
    } else if (modelSpeed === 'fast') {
      model = 'gemini-3.1-flash-lite';
    } else {
      model = 'gemini-3.5-flash';
    }

    // If no API key is available or placeholder, use smart fallback
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
      const fallbackReply = generateSmartFallback(message);
      res.json({
        reply: fallbackReply,
        modelUsed: 'as-realty-expert-engine',
        status: 'fallback',
        note: 'Configure GEMINI_API_KEY in AI Studio Settings > Secrets for live Gemini model streaming.',
      });
      return;
    }

    // Initialize Gemini client on the server side
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    // Format chat history into contents array
    const contents = [];

    if (Array.isArray(history) && history.length > 0) {
      for (const item of history.slice(-10)) {
        if (item && item.text && (item.role === 'user' || item.role === 'model' || item.role === 'assistant')) {
          contents.push({
            role: item.role === 'assistant' || item.role === 'model' ? 'model' : 'user',
            parts: [{ text: String(item.text) }],
          });
        }
      }
    }

    // Add current user prompt
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: contents,
        config: {
          systemInstruction: AS_REALTY_SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      const replyText = response.text || generateSmartFallback(message);
      res.json({
        reply: replyText,
        modelUsed: model,
        status: 'success',
      });
    } catch (apiError: any) {
      console.error('Gemini API call failed, falling back to expert knowledge base:', apiError?.message);
      const fallbackReply = generateSmartFallback(message);
      res.json({
        reply: fallbackReply,
        modelUsed: 'as-realty-fallback',
        status: 'fallback',
        errorDetails: apiError?.message || 'API request error',
      });
    }
  } catch (err: any) {
    console.error('Server error handling /api/chat:', err);
    res.status(500).json({
      error: 'Failed to process chat message.',
      details: err?.message,
    });
  }
});

// Live API Status check endpoint
app.get('/api/live-status', (_req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '' && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  res.json({
    status: 'ok',
    liveModel: 'gemini-3.1-flash-live-preview',
    hasApiKey: hasKey,
    language: 'Professional Hinglish (Hindi + English)',
    sampleRates: { input: 16000, output: 24000 },
  });
});

// Vite middleware & Static Serving
async function startServer() {
  const distPath = path.join(process.cwd(), 'dist');
  const hasBuiltDist = fs.existsSync(path.join(distPath, 'index.html'));
  const isProduction = process.env.NODE_ENV === 'production' || (process.env.NODE_ENV !== 'development' && hasBuiltDist);

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = http.createServer(app);

  // Setup WebSocket Server for Gemini Live API Voice Conversations
  const wss = new WebSocketServer({ server, path: '/api/live' });

  wss.on('connection', async (clientWs: WebSocket) => {
    console.log('[Live Voice Advisor] Client connected');
    let session: any = null;

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
        clientWs.send(JSON.stringify({
          type: 'error',
          error: 'GEMINI_API_KEY is required for real-time Live API voice sessions. Please configure it in AI Studio Settings > Secrets.',
        }));
        clientWs.close();
        return;
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      session = await ai.live.connect({
        model: 'gemini-3.1-flash-live-preview',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: AS_REALTY_HINGLISH_VOICE_INSTRUCTION,
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audio) {
              clientWs.send(JSON.stringify({ type: 'audio', audio }));
            }
            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ type: 'interrupted', interrupted: true }));
            }
            const textPart = message.serverContent?.modelTurn?.parts?.find((p: any) => p.text)?.text;
            if (textPart) {
              clientWs.send(JSON.stringify({ type: 'text', text: textPart }));
            }
          },
          onclose: () => {
            clientWs.send(JSON.stringify({ type: 'status', status: 'closed' }));
          },
          onerror: (err: any) => {
            console.error('[Live Voice Advisor] Gemini session error:', err);
            clientWs.send(JSON.stringify({ type: 'error', error: err?.message || 'Live session error' }));
          },
        },
      });

      clientWs.send(JSON.stringify({
        type: 'status',
        status: 'ready',
        message: 'Namaste! AS Realty Live Hinglish Advisor is ready. Speak now.',
        model: 'gemini-3.1-flash-live-preview',
      }));

      clientWs.on('message', (rawData) => {
        try {
          const msg = JSON.parse(rawData.toString());
          if (msg.audio && session) {
            session.sendRealtimeInput({
              audio: { data: msg.audio, mimeType: 'audio/pcm;rate=16000' },
            });
          } else if (msg.text && session) {
            session.sendRealtimeInput({
              text: msg.text,
            });
          }
        } catch (e: any) {
          console.error('[Live Voice Advisor] Error processing client message:', e);
        }
      });

      clientWs.on('close', () => {
        console.log('[Live Voice Advisor] Client disconnected');
        if (session) {
          try {
            session.close();
          } catch (_) {}
        }
      });

      clientWs.on('error', (err) => {
        console.error('[Live Voice Advisor] Client WS error:', err);
        if (session) {
          try {
            session.close();
          } catch (_) {}
        }
      });

    } catch (err: any) {
      console.error('[Live Voice Advisor] Setup failed:', err);
      clientWs.send(JSON.stringify({
        type: 'error',
        error: err?.message || 'Failed to initialize Gemini Live Voice session.',
      }));
      clientWs.close();
    }
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`AS Realty luxury portal with Live API running on http://0.0.0.0:${PORT} (${isProduction ? 'production' : 'development'})`);
  });
}

startServer();
