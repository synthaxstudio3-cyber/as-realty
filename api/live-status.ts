export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const hasKey = Boolean(
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY.trim() !== '' &&
    process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
  );

  res.status(200).json({
    status: 'ok',
    environment: 'vercel-serverless',
    liveModel: 'gemini-3.1-flash-live-preview',
    chatModel: 'gemini-3.5-flash',
    hasApiKey: hasKey,
    language: 'Professional Hinglish (Hindi + English)',
    sampleRates: { input: 16000, output: 24000 },
    supportsWebSockets: false,
    serverlessVoiceSupported: true,
  });
}
