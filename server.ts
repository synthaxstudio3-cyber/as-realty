import 'dotenv/config';
import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'public')));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'AS Realty Luxury Portal' });
});

// Vite middleware & Static Serving
async function startServer() {
  const distPath = path.join(process.cwd(), 'dist');
  const hasBuiltDist = fs.existsSync(path.join(distPath, 'index.html'));
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    (process.env.NODE_ENV !== 'development' && hasBuiltDist);

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

  server.listen(PORT, '0.0.0.0', () => {
    console.log(
      `AS Realty luxury portal running on http://0.0.0.0:${PORT} (${
        isProduction ? 'production' : 'development'
      })`
    );
  });
}

startServer();
