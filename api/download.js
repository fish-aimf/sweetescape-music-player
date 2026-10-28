const KEYS = [
  process.env.RAPIDAPI_KEY_1,
  process.env.RAPIDAPI_KEY_2,
].filter(Boolean);
const BENCH_MS = 60 * 60 * 1000;
const benchedUntil = new Map();

function keysInOrder() {
  const now = Date.now();
  const ready = KEYS.filter((key) => !(benchedUntil.get(key) > now));
  return ready.concat(KEYS.filter((key) => !ready.includes(key)));
}

function bench(key) {
  benchedUntil.set(key, Date.now() + BENCH_MS);
}

function isQuotaMessage(data) {
  return String(data?.message || data?.msg || '').includes('exceeded the MONTHLY quota');
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { videoId } = req.query;
  if (!videoId) return res.status(400).json({ error: 'Missing videoId' });
  if (KEYS.length === 0) return res.status(500).json({ error: 'No RapidAPI keys configured' });

  let lastError = null;
  let quotaFails = 0;

  for (const key of keysInOrder()) {
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
        bench(key);
        quotaFails++;
        lastError = 'quota';
        continue;
      }

      if (response.status === 401 || response.status === 403) {
        bench(key);
        lastError = `${response.status}`;
        continue;
      }

      if (!response.ok) {
        lastError = `${response.status}`;
        continue;
      }

      const data = await response.json();

      if (isQuotaMessage(data)) {
        bench(key);
        quotaFails++;
        lastError = 'quota';
        continue;
      }

      if (response.headers.get('x-ratelimit-requests-remaining') === '0') {
        bench(key);
      }

      return res.status(200).json(data);

    } catch (err) {
      lastError = err.message;
      continue;
    }
  }

  if (quotaFails === KEYS.length) {
    return res.status(429).json({ error: 'quota_exceeded', message: 'All API keys exhausted. Try again next month.' });
  }

  return res.status(500).json({ error: 'Internal server error', message: lastError });
}
