const KEYS = [
  process.env.RAPIDAPI_KEY_1,
  process.env.RAPIDAPI_KEY_2,
].filter(Boolean);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { videoId } = req.query;
  if (!videoId) return res.status(400).json({ error: 'Missing videoId' });

  let lastError = null;

  for (const key of KEYS) {
    try {
      const response = await fetch(
        `https://youtube-mp36.p.rapidapi.com/dl?id=${videoId}`,
        {
          method: 'GET',
          headers: {
            'X-Rapidapi-Key': key,
            'X-Rapidapi-Host': 'youtube-mp36.p.rapidapi.com',
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 429) {
        lastError = 'quota';
        continue;
      }

      if (!response.ok) {
        lastError = `${response.status}`;
        continue;
      }

      const data = await response.json();

      if (data.msg === 'You have exceeded the MONTHLY quota') {
        lastError = 'quota';
        continue;
      }

      return res.status(200).json(data);

    } catch (err) {
      lastError = err.message;
      continue;
    }
  }

  if (lastError === 'quota') {
    return res.status(429).json({ error: 'quota_exceeded', message: 'All API keys exhausted. Try again next month.' });
  }

  return res.status(500).json({ error: 'Internal server error', message: lastError });
}
