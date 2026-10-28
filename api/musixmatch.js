const KEYS = [process.env.RAPIDAPI_KEY_1, process.env.RAPIDAPI_KEY_2].filter(Boolean);
const BENCH_MS = 60 * 60 * 1000;
const benchedUntil = new Map();

const RAPIDAPI_HOST = 'best-musixmatch-scraper-free-1000-calls.p.rapidapi.com';
const FOUND_CACHE = 'public, s-maxage=604800, stale-while-revalidate=2592000';
const MISSING_CACHE = 'public, s-maxage=86400';

function keysInOrder() {
  const now = Date.now();
  const ready = KEYS.filter((key) => !(benchedUntil.get(key) > now));
  return ready.concat(KEYS.filter((key) => !ready.includes(key)));
}

function bench(key) {
  benchedUntil.set(key, Date.now() + BENCH_MS);
}

async function rapid(path, params) {
  let lastError = KEYS.length === 0 ? 'No RapidAPI keys configured' : null;
  for (const key of keysInOrder()) {
    try {
      const response = await fetch(`https://${RAPIDAPI_HOST}${path}?${new URLSearchParams(params)}`, {
        headers: {
          'X-RapidAPI-Key': key,
          'X-RapidAPI-Host': RAPIDAPI_HOST,
        },
      });

      if (response.status === 401 || response.status === 403 || response.status === 429) {
        bench(key);
        lastError = `Key rejected (status ${response.status})`;
        continue;
      }

      if (response.headers.get('x-ratelimit-requests-remaining') === '0') {
        bench(key);
      }

      return response;
    } catch (error) {
      lastError = error.message || 'Request failed';
    }
  }
  throw new Error(lastError || 'All RapidAPI keys failed');
}

function cleanTitle(text) {
  return text
    .split('|')[0]
    .replace(/[([{【].*?[)\]}】]/g, ' ')
    .replace(/\s(?:feat|ft|featuring)\b.*$/i, ' ')
    .replace(/\s+official\s+(?:music\s+|lyrics?\s+)?(?:video|audio|visualizer)\s*$/i, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanArtist(text) {
  let name = text.replace(/\s*-\s*topic$/i, '').replace(/\s(?:feat|ft|featuring)\b.*$/i, '');
  if (/vevo$/i.test(name)) {
    name = name.replace(/vevo$/i, '').replace(/([a-z])([A-Z])/g, '$1 $2');
  }
  return name.replace(/\s+/g, ' ').trim();
}

function searchTerms(song, artist) {
  const split = song.match(/^(.+?)\s+[-–—]\s+(.+)$/);
  const title = cleanTitle(split ? split[2] : song) || song;
  const by = cleanArtist(split ? split[1] : artist);
  const whole = [cleanTitle(song).replace(/\s+[-–—]\s+/g, ' '), cleanArtist(artist)].filter(Boolean).join(' ');
  return { title, artist: by, whole };
}

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

async function searchTracks(params) {
  const response = await rapid('/search/tracks', {
    ...params,
    has_lyrics: 'true',
    instrumental: 'exclude',
    page_size: '5',
  });
  if (!response.ok) {
    throw new Error(`Musixmatch search failed (status ${response.status})`);
  }
  const payload = await response.json();
  return Array.isArray(payload?.tracks) ? payload.tracks : [];
}

function pickTrack(tracks, title) {
  const want = normalize(title);
  const usable = tracks.filter((track) => track?.id && track.has_lyrics !== false && !track.is_restricted);
  return usable.find((track) => normalize(track.name) === want) || usable[0] || null;
}

async function fetchFromMusixmatch(terms) {
  let tracks = await searchTracks(terms.artist ? { title: terms.title, artist: terms.artist } : { query: terms.title });
  if (tracks.length === 0 && terms.artist && terms.whole) {
    tracks = await searchTracks({ query: terms.whole });
  }

  const match = pickTrack(tracks, terms.title);
  if (!match) {
    return null;
  }

  const response = await rapid('/tracks/lyrics', { track: String(match.id) });
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Musixmatch lyrics failed (status ${response.status})`);
  }

  const payload = await response.json();
  const lyrics = typeof payload?.lyrics?.text === 'string' ? payload.lyrics.text.trim() : '';
  if (!lyrics) {
    return null;
  }

  const covers = match.album?.cover_images || {};
  return {
    lyrics,
    title: match.name || terms.title,
    artist: match.artist?.name || terms.artist || null,
    albumArt: covers.size_500 || covers.size_350 || covers.size_800 || covers.size_100 || null,
  };
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

export default async function handler(req, res) {
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

  const terms = searchTerms(song, artist);
  let lastError = null;
  let missing = false;

  try {
    const found = await fetchFromMusixmatch(terms);
    if (found) {
      res.setHeader('Cache-Control', FOUND_CACHE);
      res.status(200).json({ status: 200, ...found });
      return;
    }
    missing = true;
  } catch (error) {
    lastError = error.message || 'Musixmatch lookup failed';
  }

  try {
    const fallback = await fetchFromLyricsOvh(terms.title, terms.artist);
    if (fallback) {
      res.setHeader('Cache-Control', FOUND_CACHE);
      res.status(200).json({ status: 200, ...fallback });
      return;
    }
  } catch (error) {
    lastError = error.message || lastError;
  }

  if (missing) {
    res.setHeader('Cache-Control', MISSING_CACHE);
    res.status(404).json({ status: 404, error: 'No lyrics found for this song' });
    return;
  }

  res.status(502).json({ status: 502, error: lastError || 'All lyrics providers failed' });
}
