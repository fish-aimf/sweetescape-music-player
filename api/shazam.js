export const config = {
  api: { bodyParser: false }, // we need the raw audio bytes, not JSON
};

const KEYS = [
  process.env.RAPIDAPI_KEY_1,
  process.env.RAPIDAPI_KEY_2,
].filter(Boolean);

const SHAZAM_HOST = 'shazam-song-recognition-api.p.rapidapi.com';
const SHAZAM_URL = `https://${SHAZAM_HOST}/recognize/file`;
const MAX_BYTES = 3 * 1024 * 1024; // ~3MB — comfortably under Vercel's 4.5MB body cap

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let body;
  try {
    body = await readRawBody(req);
  } catch {
    return res.status(400).json({ error: 'Could not read audio body' });
  }
  if (!body || body.length === 0) {
    return res.status(400).json({ error: 'Empty audio payload' });
  }
  if (body.length > MAX_BYTES) {
    return res.status(413).json({ error: 'clip_too_large', message: 'Trim the clip and try again.' });
  }
  if (KEYS.length === 0) {
    return res.status(500).json({ error: 'No RapidAPI keys configured' });
  }

  let lastError = null;
  for (const key of KEYS) {
    try {
      const response = await fetch(SHAZAM_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'X-Rapidapi-Key': key,
          'X-Rapidapi-Host': SHAZAM_HOST,
        },
        body,
      });

      if (response.status === 429) { lastError = 'quota'; continue; }
      if (!response.ok) { lastError = `${response.status}`; continue; }

      const data = await response.json();
      if (data.msg === 'You have exceeded the MONTHLY quota') { lastError = 'quota'; continue; }

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
