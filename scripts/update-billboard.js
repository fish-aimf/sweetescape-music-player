
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const YOUTUBE_API_KEYS = (process.env.YOUTUBE_API_KEYS || '')
  .split(',')
  .map(k => k.trim())
  .filter(Boolean);

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY env vars.');
  process.exit(1);
}
if (YOUTUBE_API_KEYS.length === 0) {
  console.error('Missing YOUTUBE_API_KEYS env var (comma-separated list of keys).');
  process.exit(1);
}

let activeKeyIndex = 0;

function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
}

// ---- Supabase REST helpers ----

function supabaseHeaders(extra = {}) {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    ...extra
  };
}

async function supabaseSelect(table, query = '') {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: supabaseHeaders()
  });
  if (!res.ok) {
    throw new Error(`Supabase select on ${table} failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

async function supabaseUpsert(table, row) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: supabaseHeaders({
      Prefer: 'resolution=merge-duplicates,return=minimal'
    }),
    body: JSON.stringify(row)
  });
  if (!res.ok) {
    return { error: `${res.status} ${await res.text()}` };
  }
  return { error: null };
}

// ---- YouTube search with key rotation ----

async function searchYouTube(songTitle, artist) {
  const query = `${artist} - ${songTitle} "topic"`;

  for (let attempt = 0; attempt < YOUTUBE_API_KEYS.length; attempt++) {
    const key = YOUTUBE_API_KEYS[activeKeyIndex];
    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${encodeURIComponent(query)}&key=${key}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.error) {
        if (data.error.code === 403) {
          log(`Key ${activeKeyIndex + 1} quota exceeded, rotating...`, 'warning');
          activeKeyIndex = (activeKeyIndex + 1) % YOUTUBE_API_KEYS.length;
          continue;
        }
        throw new Error(`YouTube API error: ${data.error.message || data.error.code}`);
      }

      if (data.items && data.items.length > 0) {
        return `https://www.youtube.com/watch?v=${data.items[0].id.videoId}`;
      }
      return null;
    } catch (error) {
      log(`Error with key ${activeKeyIndex + 1}: ${error.message}`, 'error');
      activeKeyIndex = (activeKeyIndex + 1) % YOUTUBE_API_KEYS.length;
    }
  }

  return null;
}

// ---- Main ----

async function updateBillboard() {
  log('=== Starting Billboard Hot 100 Update ===', 'info');

  try {
    log('Fetching Billboard Hot 100 data...', 'info');
    const response = await fetch('https://raw.githubusercontent.com/mhollingshead/billboard-hot-100/main/recent.json');
    const billboardData = await response.json();
    log(`Fetched ${billboardData.data.length} songs`, 'success');

    const existingData = await supabaseSelect('billboard_hot_100', 'select=*');

    const existingByPosition = new Map(existingData.map(item => [item.id, item]));
    const existingBySongArtist = new Map();
    existingData.forEach(item => {
      const key = `${item.song.toLowerCase()}|||${item.artist.toLowerCase()}`;
      existingBySongArtist.set(key, item);
    });

    let totalProcessed = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;
    let totalYouTubeSearches = 0;
    let totalYouTubeReused = 0;

    for (let i = 0; i < Math.min(billboardData.data.length, 100); i++) {
      const song = billboardData.data[i];
      const id = i + 1;
      totalProcessed++;

      log(`[${id}/100] Processing: "${song.song}" by ${song.artist}`, 'info');

      const existingAtPosition = existingByPosition.get(id);
      let youtubeUrl = null;
      let needsUpdate = false;

      if (!existingAtPosition) {
        log(`  New entry at position ${id}`, 'info');
        needsUpdate = true;
      } else {
        const changes = [];
        if (existingAtPosition.song !== song.song) changes.push('song');
        if (existingAtPosition.artist !== song.artist) changes.push('artist');
        if (existingAtPosition.this_week !== song.this_week) changes.push('position');
        if (existingAtPosition.last_week !== song.last_week) changes.push('last_week');
        if (existingAtPosition.peak_position !== song.peak_position) changes.push('peak');
        if (existingAtPosition.weeks_on_chart !== song.weeks_on_chart) changes.push('weeks');

        if (changes.length > 0) {
          log(`  Changes detected: ${changes.join(', ')}`, 'warning');
          needsUpdate = true;
        } else {
          log(`  No changes - skipping`, 'info');
          totalSkipped++;
          continue;
        }
      }

      const songArtistKey = `${song.song.toLowerCase()}|||${song.artist.toLowerCase()}`;
      const previousEntry = existingBySongArtist.get(songArtistKey);

      if (previousEntry && previousEntry.youtube_url) {
        youtubeUrl = previousEntry.youtube_url;
        log(`  Reusing YouTube URL from previous position #${previousEntry.id}`, 'info');
        totalYouTubeReused++;
      } else if (existingAtPosition && existingAtPosition.youtube_url &&
                 existingAtPosition.song === song.song &&
                 existingAtPosition.artist === song.artist) {
        youtubeUrl = existingAtPosition.youtube_url;
        log(`  Using existing URL`, 'info');
      } else {
        log(`  New song - searching YouTube...`, 'info');
        youtubeUrl = await searchYouTube(song.song, song.artist);
        totalYouTubeSearches++;

        if (youtubeUrl) {
          log(`  Found: ${youtubeUrl}`, 'success');
        } else {
          log(`  No match found`, 'warning');
        }

        await new Promise(resolve => setTimeout(resolve, 100));
      }

      if (needsUpdate) {
        const { error } = await supabaseUpsert('billboard_hot_100', {
          id: id,
          song: song.song,
          artist: song.artist,
          this_week: song.this_week,
          last_week: song.last_week,
          peak_position: song.peak_position,
          weeks_on_chart: song.weeks_on_chart,
          youtube_url: youtubeUrl,
          last_updated: new Date().toISOString()
        });

        if (error) {
          log(`  Database error: ${error}`, 'error');
        } else {
          log(`  Updated in database`, 'success');
          totalUpdated++;
        }
      }
    }

    log('=== Updating Top 3 Table ===', 'info');

    const existingTop3 = await supabaseSelect('billboard_top_3', 'select=*&order=position');
    const existingTop3Map = new Map(existingTop3.map(item => [item.position, item]));

    let top3Updated = 0;

    for (let i = 0; i < 3; i++) {
      const song = billboardData.data[i];
      const position = i + 1;

      log(`Top ${position}: "${song.song}" by ${song.artist}`, 'info');

      const existing = existingTop3Map.get(position);

      const mainTableRows = await supabaseSelect(
        'billboard_hot_100',
        `select=youtube_url&id=eq.${position}`
      );
      const youtubeUrl = mainTableRows?.[0]?.youtube_url;

      if (!existing || existing.song !== song.song || existing.artist !== song.artist) {
        log(`  Song changed - updating`, 'warning');
      } else {
        log(`  Same song - updating timestamp only`, 'info');
      }

      const { error } = await supabaseUpsert('billboard_top_3', {
        position: position,
        song: song.song,
        artist: song.artist,
        youtube_url: youtubeUrl,
        last_updated: new Date().toISOString()
      });

      if (error) {
        log(`  Top 3 database error: ${error}`, 'error');
      } else {
        log(`  Top 3 updated in database`, 'success');
        top3Updated++;
      }
    }

    log('=== Update Summary ===', 'success');
    log(`Total songs processed: ${totalProcessed}`, 'info');
    log(`Songs updated: ${totalUpdated}`, 'success');
    log(`Songs skipped (no changes): ${totalSkipped}`, 'info');
    log(`YouTube URLs reused from chart: ${totalYouTubeReused}`, 'success');
    log(`YouTube searches performed: ${totalYouTubeSearches}`, 'warning');
    log(`Top 3 always updated: ${top3Updated}`, 'success');
    log('=== Update Complete ===', 'success');

  } catch (error) {
    log(`FATAL ERROR: ${error.message}`, 'error');
    process.exit(1);
  }
}

updateBillboard();
