// ============================================================
// Notelet — Global Configuration
// ============================================================
// Use '' so all /api/* calls go through the Express proxy (both local and Vercel).
// The proxy in src/index.ts forwards them to the Go backend on Railway.
// ============================================================
window.NOTELET_API_URL = '';
