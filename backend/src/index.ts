import { env } from './config/env.js';
import { createApp } from './app/server.js';

const app = createApp();

app.listen(env.port, () => {
  console.log(`API listening on http://localhost:${env.port}`);
});
