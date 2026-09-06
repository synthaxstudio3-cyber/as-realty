import { GoogleGenAI } from '@google/genai';
import { AS_REALTY_SYSTEM_INSTRUCTION, generateSmartFallback } from '../src/data/advisorKnowledge';

export default async function handler(req: any, res: any) {
  // CORS configuration for Vercel Serverless
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (_) {
        body = {};
      }
    }

    const { message, history = [], modelSpeed = 'general' } = body || {};

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required and must be a string.' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;

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
      res.status(200).json({
        reply: fallbackReply,
        modelUsed: 'as-realty-expert-engine',
        status: 'fallback',
        environment: 'vercel-serverless',
        note: 'Configure GEMINI_API_KEY in Vercel project environment variables for live Gemini model streaming.',
      });
      return;
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build-vercel',
        },
      },
    });

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
      res.status(200).json({
        reply: replyText,
        modelUsed: model,
        status: 'success',
        environment: 'vercel-serverless',
      });
    } catch (apiError: any) {
      console.error('[Vercel Serverless] Gemini API call error:', apiError?.message);
      const fallbackReply = generateSmartFallback(message);
      res.status(200).json({
        reply: fallbackReply,
        modelUsed: 'as-realty-fallback',
        status: 'fallback',
        environment: 'vercel-serverless',
        errorDetails: apiError?.message || 'API request error',
      });
    }
  } catch (err: any) {
    console.error('[Vercel Serverless] Error processing chat message:', err);
    res.status(500).json({
      error: 'Failed to process chat message.',
      details: err?.message,
    });
  }
}
