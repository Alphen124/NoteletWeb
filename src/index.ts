// ============================================================
// Notelet Frontend Server
// ============================================================
// Node.js Express server that:
// 1. Serves static frontend files (HTML, CSS, JS)
// 2. Proxies API requests to the Go backend (including WebSocket)
// Runs on port 3030

import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { setRoutes } from './routes';

const app = express();
const PORT = process.env.PORT || 3030;
// const API_TARGET = process.env.API_URL || 'https://notelet-api.onrender.com';
const API_TARGET = process.env.API_URL || 'https://notelet-api.onrender.com';
// ============================================================
// API Proxy Configuration (REST + WebSocket)
// ============================================================
// Forward /api/* and /uploads/* to the Go backend.
// ws: true enables WebSocket upgrade proxying (needed for /api/chat/ws).
const apiProxy = createProxyMiddleware({
  target: API_TARGET,
  changeOrigin: true,
  pathFilter: ['/api/**', '/uploads/**'],
  on: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    proxyRes: (proxyRes: any, _req: any, res: any) => {
      const status: number = proxyRes.statusCode ?? 200;
      const contentType: string = proxyRes.headers['content-type'] ?? '';
      // ถ้า backend ส่ง 5xx แต่ไม่ใช่ JSON (เช่น Render sleep page) → แปลงเป็น JSON
      if (status >= 500 && !contentType.includes('application/json')) {
        proxyRes.destroy();
        if (!res.headersSent) {
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Backend is starting up, please try again in a moment.' }));
        }
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: (err: Error, _req: any, res: any) => {
      console.error('[proxy] error:', err.message);
      try {
        if (res && !res.headersSent && typeof res.writeHead === 'function') {
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Backend unreachable. Please try again in a moment.' }));
        }
      } catch (e) {
        console.error('[proxy] failed to send error response:', e);
      }
    },
  },
});

app.use(apiProxy);

// ============================================================
// Middleware Setup
// ============================================================
app.use(express.json());

// ============================================================
// Route Configuration
// ============================================================
setRoutes(app);

// ============================================================
// Start Server
// ============================================================
export default app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✓ Frontend server is running on http://localhost:${PORT}`);
    console.log(`✓ API requests proxied to ${API_TARGET}`);
  });
}
