module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const API_KEY = process.env.GOOGLE_API_KEY;
    if (!API_KEY) {
      return res.status(500).json({ error: 'GOOGLE_API_KEY is not configured' });
    }

    const { prompt, currentGhostType } = req.body || {};
    const body = {
      contents: [
        {
          parts: [
            {
              text: `Act as a spirit box ghost. Personality: ${currentGhostType}. Rules: 1. Max 5 words. 2. Be scary or weird. 3. Occasionally mention names like Gyan, Mukul, Mridul, or Saurav but once in 3 4 answers. 4. User said: "${prompt}".`
            }
          ]
        }
      ]
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
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('API route error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
