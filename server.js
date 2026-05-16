const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(express.json());

const API_KEY = process.env.GOOGLE_API_KEY;
if (!API_KEY) console.warn('Warning: GOOGLE_API_KEY is not set. Requests will fail until it is configured.');

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

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Proxy server listening on http://localhost:${port}`));
