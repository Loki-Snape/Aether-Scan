const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

const API_KEY = process.env.GOOGLE_API_KEY;
if (!API_KEY) console.warn('Warning: GOOGLE_API_KEY is not set. Requests will fail until it is configured.');

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, currentGhostType } = req.body || {};
    const body = {
      contents: [{
        parts: [{ text: `Act as a spirit box ghost. Personality: ${currentGhostType}. Rules: 1. Max 5 words. 2. Be scary or weird. 3. Occasionally mention names like Gyan, Mukul, Mridul, or Saurav but once in 3 4 answers. 4. User said: "${prompt}".` }]
      }]
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: err.message });
  }
});

function startServer(port, retriesLeft = 10) {
  const server = app.listen(port, () => {
    console.log(`Proxy server listening on http://localhost:${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && retriesLeft > 0) {
      const nextPort = Number(port) + 1;
      console.warn(`Port ${port} is already in use, trying ${nextPort}...`);
      startServer(nextPort, retriesLeft - 1);
      return;
    }

    console.error('Server failed to start:', err);
    process.exit(1);
  });
}

startServer(Number(process.env.PORT || 3000));
