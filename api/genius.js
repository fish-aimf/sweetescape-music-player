const KEYS = [process.env.RAPIDAPI_KEY_1, process.env.RAPIDAPI_KEY_2].filter(Boolean);

const RAPIDAPI_HOST = 'geniuslyrics-api.p.rapidapi.com';
const RAPIDAPI_URL = `https://${RAPIDAPI_HOST}/get_lyrics`;

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

  if (KEYS.length === 0) {
    res.status(500).json({
      status: 500,
      error: 'No RapidAPI keys configured (set RAPIDAPI_KEY_1 / RAPIDAPI_KEY_2)',
    });
    return;
  }

  const requestUrl = buildRequestUrl(song, artist);
  let lastError = null;

  for (const key of KEYS) {
    try {
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': key,
          'X-RapidAPI-Host': RAPIDAPI_HOST,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 429 || response.status === 403) {
        lastError = `Key rejected (status ${response.status})`;
        continue;
      }

      if (!response.ok) {
        lastError = `Upstream error (status ${response.status})`;
        continue;
      }

      const payload = await response.json();
      const lyrics = extractLyrics(payload);

      if (!lyrics) {
        res.status(404).json({ status: 404, error: 'No lyrics found for this song' });
        return;
      }

      const meta = extractMeta(payload);
      res.status(200).json({ status: 200, lyrics, ...meta });
      return;
    } catch (error) {
      lastError = error.message || 'Request failed';
    }
  }

  res.status(502).json({ status: 502, error: lastError || 'All RapidAPI keys failed' });
};
