/**
 * Vercel serverless entry — routes all /api/* to the Express app.
 * Backend must be compiled to backend/dist before deploy (see vercel-build).
 */
import { createApp } from '../backend/dist/app/server.js';

let app;

export default function handler(req, res) {
  if (!app) {
    app = createApp();
  }
  return app(req, res);
}
