// ============================================================
// Notelet — Global Configuration
// ============================================================
// Use '' so all /api/* calls go through the Express proxy (both local and Vercel).
// The proxy in src/index.ts forwards them to the Go backend on Railway.
// ============================================================
window.NOTELET_API_URL = '';

// ============================================================
// Supabase Configuration (Google OAuth)
// ============================================================
window.SUPABASE_URL = 'https://kwysybxnrkyewwvxncgy.supabase.co';       // e.g. https://xxxx.supabase.co
window.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3eXN5Ynhucmt5ZXd3dnhuY2d5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MzQyMjgsImV4cCI6MjA5MDExMDIyOH0.OHehmjdO6qFEz8t_SM2zphEUHpecah0s8MsDG9yyjRA'; // public anon key from Supabase dashboard
