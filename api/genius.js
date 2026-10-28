const KEYS = [process.env.RAPIDAPI_KEY_1, process.env.RAPIDAPI_KEY_2].filter(Boolean);
const BENCH_MS = 60 * 60 * 1000;
const benchedUntil = new Map();

const RAPIDAPI_HOST = 'geniuslyrics-api.p.rapidapi.com';
const FOUND_CACHE = 'public, s-maxage=604800, stale-while-revalidate=2592000';
const MISSING_CACHE = 'public, s-maxage=86400';
const RAPIDAPI_URL = `https://${RAPIDAPI_HOST}/get_lyrics`;

function keysInOrder() {
  const now = Date.now();
  const ready = KEYS.filter((key) => !(benchedUntil.get(key) > now));
  return ready.concat(KEYS.filter((key) => !ready.includes(key)));
}

function bench(key) {
  benchedUntil.set(key, Date.now() + BENCH_MS);
}

function buildRequestUrl(song, artist) {
  const params = new URLSearchParams({ song });
  if (artist) {
    params.set('artist', artist);
  }
  return `${RAPIDAPI_URL}?${params.toString()}`;
}

function extractLyrics(payload) {
  if (!payload) {
    return null;
  }
  const candidates = [
    payload.lyrics,
    payload.data?.lyrics,
    payload.result?.lyrics,
    payload.song?.lyrics,
  ];
  const found = candidates.find((value) => typeof value === 'string' && value.trim().length > 0);
  return found ? found.trim() : null;
}

function extractMeta(payload) {
  const title = payload?.title || payload?.data?.title || payload?.song?.title || null;
  const artist =
    payload?.artist || payload?.data?.artist || payload?.song?.artist || payload?.author || null;
  const albumArt =
    payload?.albumArt ||
    payload?.thumbnail ||
    payload?.data?.albumArt ||
    payload?.song?.albumArt ||
    null;
  return { title, artist, albumArt };
}

async function fetchFromLyricsOvh(song, artist) {
  if (!artist) {
    return null;
  }
  const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(song)}`;
  const response = await fetch(url);
  if (!response.ok) {
    return null;
  }
  const payload = await response.json();
  const lyrics = typeof payload?.lyrics === 'string' && payload.lyrics.trim() ? payload.lyrics.trim() : null;
  return lyrics ? { lyrics, title: song, artist, albumArt: null } : null;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ status: 405, error: 'Method not allowed' });
    return;
  }

  const song = (req.query.song || req.query.title || '').toString().trim();
  const artist = (req.query.artist || '').toString().trim();

  if (!song) {
    res.status(400).json({ status: 400, error: 'Missing required "song" query parameter' });
    return;
  }

  const requestUrl = buildRequestUrl(song, artist);
  let lastError = KEYS.length === 0 ? 'No RapidAPI keys configured' : null;
  let foundButEmpty = false;

  for (const key of keysInOrder()) {
    try {
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': key,
          'X-RapidAPI-Host': RAPIDAPI_HOST,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 429 || response.status === 403 || response.status === 401) {
        bench(key);
        lastError = `Key rejected (status ${response.status})`;
        continue;
      }

      if (!response.ok) {
        lastError = `Upstream error (status ${response.status})`;
        continue;
      }

      if (response.headers.get('x-ratelimit-requests-remaining') === '0') {
        bench(key);
      }

      const payload = await response.json();
      const lyrics = extractLyrics(payload);

      if (!lyrics) {
        foundButEmpty = true;
        break;
      }

      const meta = extractMeta(payload);
      res.setHeader('Cache-Control', FOUND_CACHE);
      res.status(200).json({ status: 200, lyrics, ...meta });
      return;
    } catch (error) {
      lastError = error.message || 'Request failed';
    }
  }

  try {
    const fallback = await fetchFromLyricsOvh(song, artist);
    if (fallback) {
      res.setHeader('Cache-Control', FOUND_CACHE);
      res.status(200).json({ status: 200, ...fallback });
      return;
    }
  } catch (error) {
    lastError = error.message || lastError;
  }

  if (foundButEmpty) {
    res.setHeader('Cache-Control', MISSING_CACHE);
    res.status(404).json({ status: 404, error: 'No lyrics found for this song' });
    return;
  }

  res.status(502).json({ status: 502, error: lastError || 'All lyrics providers failed' });
};
