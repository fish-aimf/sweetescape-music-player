const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const path = require('path');
const fs = require('fs');
const os = require('os');

const root = path.join(__dirname, '..');
const PROFILE = fs.mkdtempSync(path.join(os.tmpdir(), 'se-shots-'));
const OUT = process.env.SHOT_OUT || path.join(root, 'public', 'learn', 'shots');
const BASE = process.env.BASE_URL || 'http://localhost:4173';
const only = process.argv.slice(2);
fs.mkdirSync(OUT, { recursive: true });

const IMPORT = `Road Trip{
Take On Me, https://www.youtube.com/watch?v=HzdD8kbDzZA, a-ha
Dreams, https://www.youtube.com/watch?v=5oWyMakvQew, Fleetwood Mac
Uptown Funk, https://www.youtube.com/watch?v=tYvFa2ARD24, Mark Ronson ft. Bruno Mars
Happy, https://www.youtube.com/watch?v=dJqxQzxLbHM, Pharrell Williams
Viva La Vida, https://www.youtube.com/watch?v=HGorCGszxZU, Coldplay
Wake Me Up, https://www.youtube.com/watch?v=2NiyrtYegso, Avicii
}
Late Night{
Starboy, https://www.youtube.com/watch?v=3_g2un5M350, The Weeknd
Numb, https://www.youtube.com/watch?v=Q7cQU86CDB0, Linkin Park
Hello, https://www.youtube.com/watch?v=yjo_aXygRDI, Adele
See You Again, https://www.youtube.com/watch?v=Ss3IhUmpCt0, Wiz Khalifa ft. Charlie Puth
}
Classics{
Bohemian Rhapsody, https://www.youtube.com/watch?v=BSTsnWoslP4, Queen
Billie Jean, https://www.youtube.com/watch?v=7CTJcHjkq0E, Michael Jackson
Smells Like Teen Spirit, https://www.youtube.com/watch?v=7TDeBi34OtE, Nirvana
Never Gonna Give You Up, https://www.youtube.com/watch?v=lYBUbBu4W08, Rick Astley
}
Gym{
Believer, https://www.youtube.com/watch?v=Kx7B-XvmFtE, Imagine Dragons
Lose Yourself, https://www.youtube.com/watch?v=zlJ0Aj9y67c, Eminem
Roar, https://www.youtube.com/watch?v=6nJuUdc2qNg, Katy Perry
}`;

const EXTRA = `Despacito, https://www.youtube.com/watch?v=FXovf5dsRTw, Luis Fonsi ft. Daddy Yankee
Shape of You, https://www.youtube.com/watch?v=xTvyyoF_LZY, Ed Sheeran
Gangnam Style, https://www.youtube.com/watch?v=4AgDYTuZWOw, PSY
Twinkle Twinkle Little Star, https://www.youtube.com/watch?v=B_QIsoUIz0c, Super Simple Songs
Blinding Lights, https://www.youtube.com/watch?v=4NRXx6U8ABQ, The Weeknd
Rolling in the Deep, https://www.youtube.com/watch?v=rYEDA3JcQqw, Adele
Thunder, https://www.youtube.com/watch?v=fKopy74weus, Imagine Dragons
We Will Rock You, https://www.youtube.com/watch?v=-tJYN-eG1zk, Queen`;

const LYRICS = [
  ['Twinkle, twinkle, little star', '0:09'],
  ['How I wonder what you are', '0:13'],
  ['Up above the world so high', '0:17'],
  ['Like a diamond in the sky', '0:21'],
  ['Twinkle, twinkle, little star', '0:25'],
  ['How I wonder what you are', '0:29'],
  ['When the blazing sun is gone', '0:34'],
  ['When he nothing shines upon', '0:38'],
  ['Then you show your little light', '0:42'],
  ['Twinkle, twinkle, all the night', '0:46'],
  ['Twinkle, twinkle, little star', '0:50'],
  ['How I wonder what you are', '0:54']
].map(([t, s]) => `${t} [${s}]`).join('\n');

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function boot(ctx, width = 1280, height = 800, query = '') {
  const page = await ctx.newPage();
  await page.setViewportSize({ width, height });
  page.on('dialog', d => d.accept());
  await page.route('**/api/**', async route => {
    const url = new URL(route.request().url());
    if (url.hostname !== 'localhost') return route.continue();
    if (url.pathname === '/api/count') return route.fulfill({ status: 200, contentType: 'application/json', body: '{"count":0}' });
    try {
      const res = await route.fetch({ url: 'https://sweetescape.vercel.app' + url.pathname + url.search, headers: { ...route.request().headers(), origin: 'https://sweetescape.vercel.app', referer: 'https://sweetescape.vercel.app/' } });
      await route.fulfill({ response: res });
    } catch {
      await route.fulfill({ status: 404, body: '{}' });
    }
  });
  await page.goto(BASE + '/' + query);
  await sleep(3500);
  await page.evaluate(() => document.querySelectorAll('.welcome-modal').forEach(m => m.remove()));
  return page;
}

async function play(page, name, seconds = 0) {
  await page.evaluate(async ([name, seconds]) => {
    const s = musicPlayer.songLibrary.find(x => x.name === name);
    musicPlayer.playSong(s.id);
    await new Promise(r => setTimeout(r, 2500));
    if (seconds) musicPlayer.ytPlayer.seekTo(seconds, true);
  }, [name, seconds]);
  await sleep(1200);
}

async function pause(page) {
  await page.evaluate(() => { if (musicPlayer.isPlaying) musicPlayer.togglePlayPause(); });
  await sleep(400);
}

async function visible(page, selector) {
  const loc = page.locator(selector);
  const n = await loc.count();
  for (let i = 0; i < n; i++) {
    if (await loc.nth(i).isVisible()) return loc.nth(i);
  }
  throw new Error('not visible: ' + selector);
}

async function save(page, name, selector, pad = 0) {
  const file = path.join(OUT, name + '.jpg');
  if (!selector) {
    await page.screenshot({ path: file, type: 'jpeg', quality: 80 });
  } else {
    const loc = await visible(page, selector);
    const box = await loc.boundingBox();
    const vp = page.viewportSize();
    const x = Math.max(0, box.x - pad);
    const y = Math.max(0, box.y - pad);
    let bottom = vp.height;
    if (selector === '.player-area') {
      bottom = await page.evaluate(() => {
        const bar = document.querySelector('.now-playing');
        return bar && bar.offsetParent !== null ? bar.getBoundingClientRect().top - 6 : innerHeight;
      });
    }
    const clip = { x, y, width: Math.min(vp.width - x, box.width + pad * 2), height: Math.min(bottom - y, box.height + pad * 2) };
    await page.screenshot({ path: file, type: 'jpeg', quality: 82, clip });
  }
  console.log('saved', name);
}

const HILLS_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#0d47b5"/>
<stop offset=".38" stop-color="#2f78d8"/>
<stop offset=".7" stop-color="#7db3ee"/>
<stop offset="1" stop-color="#cfe5fa"/>
</linearGradient>
<radialGradient id="hill" cx=".44" cy=".02" r="1.05">
<stop offset="0" stop-color="#a6dd4f"/>
<stop offset=".22" stop-color="#7cc23a"/>
<stop offset=".55" stop-color="#43952a"/>
<stop offset=".85" stop-color="#2a7a1f"/>
<stop offset="1" stop-color="#1c5c15"/>
</radialGradient>
<linearGradient id="far" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#6fae62"/>
<stop offset="1" stop-color="#3f8a3c"/>
</linearGradient>
<linearGradient id="haze" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#ffffff" stop-opacity="0"/>
<stop offset="1" stop-color="#ffffff" stop-opacity=".35"/>
</linearGradient>
<filter id="cloud" x="-40%" y="-60%" width="180%" height="220%">
<feTurbulence type="fractalNoise" baseFrequency=".011" numOctaves="4" seed="11" result="noise"/>
<feDisplacementMap in="SourceGraphic" in2="noise" scale="70" xChannelSelector="R" yChannelSelector="G" result="shape"/>
<feGaussianBlur in="shape" stdDeviation="9"/>
</filter>
<filter id="grass" x="0" y="0" width="100%" height="100%">
<feTurbulence type="fractalNoise" baseFrequency=".9 .035" numOctaves="2" seed="4" result="blades"/>
<feColorMatrix in="blades" type="matrix" values="0 0 0 0 .05  0 0 0 0 .2  0 0 0 0 .02  0 0 0 .55 0"/>
<feComposite in2="SourceGraphic" operator="in"/>
</filter>
</defs>
<rect width="1920" height="1080" fill="url(#sky)"/>
<g filter="url(#cloud)" fill="#ffffff">
<g opacity=".95"><ellipse cx="420" cy="250" rx="190" ry="62"/><ellipse cx="520" cy="215" rx="120" ry="70"/><ellipse cx="330" cy="232" rx="95" ry="48"/></g>
<g opacity=".9"><ellipse cx="1010" cy="150" rx="230" ry="58"/><ellipse cx="1120" cy="118" rx="125" ry="62"/><ellipse cx="930" cy="128" rx="105" ry="50"/></g>
<g opacity=".85"><ellipse cx="1560" cy="300" rx="210" ry="56"/><ellipse cx="1650" cy="268" rx="110" ry="58"/></g>
<g opacity=".8"><ellipse cx="1790" cy="120" rx="150" ry="40"/><ellipse cx="160" cy="470" rx="170" ry="38"/></g>
<g opacity=".7"><ellipse cx="1240" cy="470" rx="260" ry="36"/><ellipse cx="720" cy="520" rx="180" ry="28"/></g>
</g>
<rect y="560" width="1920" height="160" fill="url(#haze)"/>
<path d="M0 760 C 320 700 620 690 980 720 C 1320 748 1640 700 1920 690 V1080 H0 Z" fill="url(#far)"/>
<path d="M0 860 C 260 700 560 600 900 590 C 1220 582 1560 660 1920 760 V1080 H0 Z" fill="url(#hill)"/>
<path d="M0 860 C 260 700 560 600 900 590 C 1220 582 1560 660 1920 760 V1080 H0 Z" fill="#000" filter="url(#grass)"/>
</svg>`;

async function renderHills(ctx) {
  const file = path.join(PROFILE, 'hills.jpg');
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.setContent(`<style>html,body{margin:0}</style>${HILLS_SVG}`);
  await page.screenshot({ path: file, type: 'jpeg', quality: 90 });
  await page.close();
  return file;
}

async function seed(ctx) {
  const page = await ctx.newPage();
  page.on('dialog', d => d.accept());
  await page.goto(BASE + '/');
  await sleep(3500);
  await page.evaluate(() => document.querySelectorAll('.welcome-modal').forEach(m => m.remove()));
  await page.evaluate(text => musicPlayer.importLibrary(text), IMPORT);
  await sleep(4000);
  await page.evaluate(text => musicPlayer.importLibrary(text), EXTRA);
  await sleep(3000);
  const out = await page.evaluate(async lyrics => {
    const p = musicPlayer;
    const favs = ['Starboy', 'Take On Me', 'Dreams', 'Bohemian Rhapsody', 'Uptown Funk', 'Numb', 'Hello'];
    for (const name of favs) {
      const s = p.songLibrary.find(x => x.name === name);
      if (s && !s.favorite) p.toggleFavorite(s.id);
    }
    const tw = p.songLibrary.find(x => x.name.startsWith('Twinkle'));
    tw.lyrics = lyrics;
    await p.saveSingleSong?.(tw);
    p.saveSongLibrary?.();
    const plays = { 'Starboy': 41, 'Take On Me': 33, 'Dreams': 28, 'Bohemian Rhapsody': 24, 'Uptown Funk': 19, 'Numb': 17, 'Believer': 12, 'Hello': 11, 'Viva La Vida': 9, 'Happy': 7, 'Roar': 5, 'Despacito': 4 };
    const tx = p.db.transaction(['listeningStats'], 'readwrite');
    const store = tx.objectStore('listeningStats');
    const now = Date.now();
    const key = d => new Date(d).toISOString().slice(0, 10);
    Object.entries(plays).forEach(([name, total], i) => {
      const s = p.songLibrary.find(x => x.name === name);
      if (!s) return;
      const days = {};
      let recent = Math.round(total * 0.6);
      for (let d = 0; recent > 0; d = (d + 3 + i) % 29) {
        const k = key(now - d * 864e5);
        const n = Math.min(recent, 1 + ((d + i) % 3));
        days[k] = (days[k] || 0) + n;
        recent -= n;
      }
      store.put({ id: s.videoId, lifetime: total, days });
    });
    const gdays = {};
    for (let d = 0; d < 30; d++) gdays[key(now - d * 864e5)] = 600 + ((d * 7919) % 2400);
    store.put({ id: '_global_time', days: gdays });
    await new Promise(r => { tx.oncomplete = r; });
    p.listeningTime = 4 * 3600 + 23 * 60;
    p.saveSetting?.('listeningTime', p.listeningTime);
    return [p.songLibrary.length, p.songLibrary.filter(s => s.favorite).length, !!tw.lyrics];
  }, LYRICS);
  console.log('seeded', out);
  await sleep(1500);
  await page.close();
}

const scenes = {
  async overview(ctx) {
    const page = await boot(ctx);
    await play(page, 'Starboy', 64);
    await page.evaluate(() => musicPlayer.switchTab('library'));
    await sleep(800);
    await save(page, 'overview');
  },
  async light(ctx) {
    const page = await boot(ctx);
    await play(page, 'Take On Me', 40);
    await page.evaluate(async () => {
      for (let i = 0; i < 4 && document.documentElement.getAttribute('data-theme') !== 'light'; i++) {
        musicPlayer.toggleTheme();
        await new Promise(r => setTimeout(r, 300));
      }
      musicPlayer.switchTab('playlists');
    });
    await sleep(1000);
    await save(page, 'light-theme');
    await page.evaluate(async () => {
      for (let i = 0; i < 4 && document.documentElement.getAttribute('data-theme') !== 'dark'; i++) {
        musicPlayer.toggleTheme();
        await new Promise(r => setTimeout(r, 300));
      }
    });
    await sleep(500);
  },
  async search(ctx) {
    const page = await boot(ctx);
    await page.fill('#librarySearch', 'numb');
    await sleep(1500);
    await save(page, 'search-card', '.player-area', 8);
    await page.fill('#librarySearch', 'on');
    await sleep(1500);
    await save(page, 'search-covers', '.player-area', 8);
    await page.fill('#librarySearch', '');
    await sleep(600);
    await page.hover('#libFilterBtn');
    await sleep(900);
    await save(page, 'library-filter', '.player-area', 8);
  },
  async ytsearch(ctx) {
    const page = await boot(ctx);
    await page.fill('#librarySearch', 'mr blue sky electric light orchestra');
    await page.press('#librarySearch', 'Enter');
    await sleep(6000);
    await save(page, 'youtube-search', '.player-area', 8);
  },
  async addsong(ctx) {
    const page = await boot(ctx);
    await page.click('#modifyLibraryBtn');
    await sleep(600);
    await page.fill('#songUrl', 'https://www.youtube.com/watch?v=1UjLFMg18cY');
    await sleep(2500);
    await save(page, 'add-song', '#libraryModificationModal .ui-modal', 0);
    await page.click('#libraryModificationTabImportExport');
    await sleep(500);
    await page.click('#importLibraryBtn');
    await sleep(800);
    await save(page, 'import-songs', '#importModal .ui-modal', 0);
  },
  async global(ctx) {
    const page = await boot(ctx);
    await page.click('#findSongsBtn');
    await sleep(6000);
    await page.fill('#globalLibraryDebouncedSearchBar', 'queen');
    await sleep(4000);
    await save(page, 'global-library-search');
    await page.click('.global-library-suggestion-artist-card');
    await sleep(5000);
    await save(page, 'global-library-artist');
    await page.evaluate(() => musicPlayer.openBillboardHot100Modal());
    await sleep(4000);
    await save(page, 'billboard-chart');
  },
  async mixlab(ctx) {
    const page = await boot(ctx);
    await page.click('#findSongsBtn');
    await sleep(4000);
    await page.evaluate(() => {
      musicPlayer.mixLab.seeds = [ 'Starboy', 'Take On Me' ].map(name => musicPlayer.mixLabSongSeed(musicPlayer.songLibrary.find(s => s.name === name)));
      musicPlayer.toggleMixLabMood('Road trip');
    });
    await page.click('#mixLabMakeBtn');
    await page.waitForSelector('.mix-lab-row[data-mix-key]', { timeout: 30000 });
    await sleep(4000);
    await page.evaluate(() => {
      const main = document.querySelector('.find-songs-main-content');
      main.scrollTop += document.getElementById('mixLab').getBoundingClientRect().top - main.getBoundingClientRect().top - 16;
    });
    await page.mouse.move(0, 0);
    await sleep(600);
    await save(page, 'mix-lab');
  },
  async playlists(ctx) {
    const page = await boot(ctx);
    await page.evaluate(() => musicPlayer.switchTab('playlists'));
    await sleep(1200);
    await page.hover('#playlistContainer .playlist-shelf-tile:nth-child(2)');
    await sleep(500);
    await save(page, 'playlists-tab', '.player-area', 8);
    await page.fill('#playlistSearch', 'queen');
    await page.mouse.move(0, 0);
    await sleep(1200);
    await save(page, 'playlists-search', '#playlists', 8);
    await page.fill('#playlistSearch', '');
    await page.click('#artistPlaylistBtn');
    await sleep(1500);
    await page.hover('.artist-pick-list .artist-row');
    await sleep(500);
    await save(page, 'artist-playlist', '.ui-modal', 0);
    await page.keyboard.press('Escape');
    await page.evaluate(() => musicPlayer.openPlaylistEditModal(musicPlayer.playlists.find(p => p.name === 'Road Trip').id));
    await sleep(1200);
    await page.hover('.ple-list .ple-row:nth-child(2)');
    await sleep(400);
    await save(page, 'playlist-edit', '.ui-modal', 0);
  },
  async sidebar(ctx) {
    const page = await boot(ctx);
    await page.evaluate(async () => {
      const pl = musicPlayer.playlists.find(p => p.name === 'Road Trip');
      musicPlayer.playPlaylist(pl.id);
      await new Promise(r => setTimeout(r, 2500));
      musicPlayer.ytPlayer.seekTo(50, true);
    });
    await sleep(1000);
    await page.evaluate(() => {
      musicPlayer.showSidebar();
    });
    await sleep(900);
    const items = page.locator('#sidebarPlaylistSongs .sidebar-song-item');
    if (await items.count() > 3) {
      const b = await items.nth(3).boundingBox();
      await page.mouse.move(b.x + 30, b.y + b.height / 2);
      await page.mouse.down();
      await sleep(700);
      await page.mouse.up();
    }
    await sleep(600);
    await save(page, 'sidebar');
    await page.evaluate(() => musicPlayer.togglePlaylistSidebarMode());
    await sleep(1200);
    await save(page, 'sidebar-expanded');
    await page.evaluate(() => musicPlayer.togglePlaylistSidebarMode());
    await sleep(400);
  },
  async queue(ctx) {
    const page = await boot(ctx);
    await play(page, 'Dreams', 80);
    await page.evaluate(() => {
      const p = musicPlayer;
      p.clearQueue?.();
      p.songQueue = [];
      const get = n => p.songLibrary.find(s => s.name === n);
      p.addToQueue(get('Bohemian Rhapsody'));
      p.addToQueue(get('Hello'), 2);
      p.addToQueue(get('Numb'));
      p.addLoopBlock();
      p.addToQueue(get('Viva La Vida'));
      p.addStopBlock();
    });
    await sleep(2500);
    await page.keyboard.press('KeyY');
    await sleep(1000);
    await save(page, 'queue', '#qv2-panel', 0);
    await page.keyboard.press('Escape');
    await page.evaluate(() => { document.getElementById('qv2-backdrop')?.remove(); musicPlayer.songQueue = []; musicPlayer.saveQueue(); musicPlayer.updatePlayerUI(); });
    await sleep(300);
  },
  async transport(ctx) {
    const page = await boot(ctx);
    await page.evaluate(async () => {
      const pl = musicPlayer.playlists.find(p => p.name === 'Classics');
      musicPlayer.playPlaylist(pl.id);
      await new Promise(r => setTimeout(r, 2500));
      musicPlayer.ytPlayer.seekTo(30, true);
    });
    await sleep(800);
    await page.hover('#nextBtn');
    await sleep(1200);
    const vp = page.viewportSize();
    await page.screenshot({ path: path.join(OUT, 'transport-preview.jpg'), type: 'jpeg', quality: 82, clip: { x: 340, y: vp.height - 360, width: 600, height: 360 } });
    console.log('saved transport-preview');
  },
  async nowplaying(ctx) {
    const page = await boot(ctx);
    await play(page, 'Bohemian Rhapsody', 120);
    await page.evaluate(() => musicPlayer.switchTab('nowplaying'));
    await sleep(1500);
    await save(page, 'now-playing');
  },
  async lyrics(ctx) {
    const page = await boot(ctx);
    await play(page, 'Twinkle Twinkle Little Star', 17);
    await page.evaluate(() => musicPlayer.switchTab('lyrics'));
    await sleep(2200);
    await save(page, 'lyrics-tab', '.player-area', 8);
    await page.evaluate(() => musicPlayer.openLyricsModePicker());
    await sleep(900);
    await save(page, 'lyrics-styles', '.lyrics-mode-modal', 0);
    for (const mode of ['verse', 'cards', 'mirror', 'stanza', 'flow']) {
      await page.evaluate(m => { document.querySelectorAll('.lyrics-mode-modal').forEach(x => x.closest('.ui-overlay')?.remove()); musicPlayer.lyricsModeDialog = null; musicPlayer.openLyricsStage(m); }, mode);
      await sleep(2600);
      await save(page, 'lyrics-stage-' + mode);
      await page.evaluate(() => musicPlayer.closeLyricsStage());
      await sleep(500);
    }
  },
  async lyricsmaker(ctx) {
    const page = await boot(ctx);
    await page.evaluate(() => musicPlayer.openLyricsMakerModal(musicPlayer.songLibrary.find(s => s.name.startsWith('Twinkle')).id));
    await sleep(1500);
    await save(page, 'lyrics-maker', '#lyricsModal .ui-modal', 0);
    await page.fill('#lyricsInput', LYRICS.split('\n').map(line => line.replace(/\s*\[[^\]]*\]$/, '')).join('\n'));
    await page.click('#prepareLyricsBtn');
    await sleep(3000);
    await page.click('#startRecording');
    for (let i = 0; i < 6; i++) {
      await sleep(i === 0 ? 3000 : 2200);
      await page.click('#markLine');
    }
    await sleep(800);
    await save(page, 'lyrics-maker-record', '#lyricsModal .ui-modal', 0);
    await page.evaluate(() => { document.getElementById('lyricsModal').classList.add('hidden'); document.getElementById('lyricsModal').style.display = 'none'; });
    await page.evaluate(() => musicPlayer.openImportSubtitlesModal(musicPlayer.songLibrary.find(s => s.name === 'Hello').id));
    await sleep(1200);
    await save(page, 'import-subtitles', '#subtitlesImportModal .ui-modal', 0);
  },
  async songedit(ctx) {
    const page = await boot(ctx);
    await page.evaluate(() => musicPlayer.openSongEditModal(musicPlayer.songLibrary.find(s => s.name.startsWith('Twinkle')).id));
    await sleep(1200);
    await save(page, 'song-edit', '.ui-overlay:last-of-type .ui-modal', 0);
  },
  async settings(ctx) {
    const page = await boot(ctx);
    await page.click('#settingsButton');
    await sleep(1500);
    await save(page, 'settings-theme', '#settingsModal .ui-modal', 0);
    await page.selectOption('#themeMode', 'custom');
    await sleep(800);
    await page.locator('#customThemeSection').scrollIntoViewIfNeeded();
    await sleep(400);
    await save(page, 'settings-colours', '#settingsModal .ui-modal', 0);
    await page.selectOption('#themeMode', 'dark');
    await sleep(600);
    await page.locator('.settings-tab-btn[data-tab="theme"]').scrollIntoViewIfNeeded();
    for (const tab of ['recommendation', 'keybinds', 'additional']) {
      await page.click(`.settings-tab-btn[data-tab="${tab}"]`);
      await sleep(900);
      await save(page, 'settings-' + tab, '#settingsModal .ui-modal', 0);
    }
  },
  async glass(ctx) {
    const hills = await renderHills(ctx);
    const page = await boot(ctx);
    await play(page, 'Take On Me', 70);
    await page.setInputFiles('#backgroundFileInput', hills);
    await sleep(1500);
    await page.evaluate(async tint => {
      await musicPlayer.updateAppearance({ surfaceStyle: 'glass', glassTint: tint, glassBlur: 12, glassSat: 170, backgroundAlbumArt: false, backgroundDim: 6, backgroundBlur: 0, backgroundFit: 'cover' });
      musicPlayer.switchTab('library');
    }, Number(process.env.GLASS_TINT || 12));
    await sleep(3000);
    await save(page, 'glass-mode');
    await page.evaluate(() => musicPlayer.updateAppearance({ surfaceStyle: 'solid', backgroundKind: 'none' }));
    await sleep(500);
  },
  async modals(ctx) {
    const page = await boot(ctx);
    await play(page, 'Uptown Funk', 45);
    await pause(page);
    await page.evaluate(() => musicPlayer.setAppTimer(30));
    await sleep(600);
    await page.click('#timerButton');
    await sleep(800);
    await save(page, 'timer', '#timerModal .ui-modal', 0);
    await page.click('#closeTimerModal');
    await page.evaluate(() => musicPlayer.clearAppTimer());
    await sleep(400);
    await page.click('#disguiseButton');
    await sleep(900);
    await save(page, 'disguise', '.ui-overlay .ui-modal:visible', 0).catch(async () => save(page, 'disguise'));
    await page.keyboard.press('Escape');
    await page.evaluate(() => musicPlayer.disguiseDialog?.close?.());
    await sleep(500);
    await page.evaluate(async () => { musicPlayer.listeningStatsEnabled = true; await musicPlayer.saveListeningStatsSetting(); }); await page.click('#statsButton');
    await sleep(1500);
    await save(page, 'stats', '#statsModal .ui-modal', 0);
    const row = page.locator('#statsModal [role=button], #statsModal [tabindex]').nth(1);
    if (await row.count()) {
      await row.click();
      await sleep(1500);
      await save(page, 'stats-song', '.ui-overlay:last-of-type .ui-modal', 0).catch(() => {});
    }
  },
  async modals2(ctx) {
    const page = await boot(ctx);
    await play(page, 'Uptown Funk', 45);
    await pause(page);
    await page.click('#discordButton');
    await sleep(1000);
    await save(page, 'discord', '#discordRpcModal .ui-modal', 0);
    await page.evaluate(() => musicPlayer.closeDiscordModal());
    await sleep(300);
    await page.click('#shazamButton');
    await sleep(1000);
    await save(page, 'identify', '#shazamModal .ui-modal', 0);
    await page.keyboard.press('Escape');
    await page.click('#szCloseBtn').catch(() => {});
    await sleep(400);
    await page.click('#downloadButton');
    await sleep(1200);
    await save(page, 'download', '#downloadModal .ui-modal', 0);
    await page.click('#dlCloseBtn').catch(() => {});
    await sleep(400);
    await page.evaluate(() => musicPlayer.showRecentlyPlayedModal());
    await sleep(1000);
    await save(page, 'recently-played', '#recentlyPlayedModal .ui-modal', 0);
  },
  async video(ctx) {
    const page = await boot(ctx);
    await play(page, 'Twinkle Twinkle Little Star', 33);
    await page.keyboard.press('KeyU');
    await sleep(2500);
    await save(page, 'video-mode');
    await page.keyboard.press('KeyU');
    await sleep(500);
  },
  async extras(ctx) {
    const page = await boot(ctx);
    await page.click('.fav-expand-btn');
    await sleep(1200);
    await save(page, 'favourites-all', '.player-area', 8);
    await page.click('.fav-expand-btn');
    await sleep(500);
    await page.click('.tab[data-tab="lyrics"]', { button: 'right' });
    await sleep(900);
    await save(page, 'lyrics-library', '.ui-overlay:last-of-type .ui-modal', 0);
    await page.keyboard.press('Escape');
    await page.evaluate(() => document.querySelectorAll('.ui-overlay').forEach(o => { if (getComputedStyle(o).display !== 'none' && !o.id) o.remove(); }));
    await sleep(400);
    await page.evaluate(() => musicPlayer.samplePlayTemporarySong('https://www.youtube.com/watch?v=1UjLFMg18cY'));
    await sleep(4000);
    await save(page, 'preview-player', '#tempSongModal .ui-modal, #tempSongModal > div', 0);
  },
  async visualizer(ctx) {
    const page = await boot(ctx);
    await play(page, 'Uptown Funk', 60);
    await page.evaluate(() => musicPlayer.updateAppearance({ surfaceStyle: 'glass', glassTint: 18, glassBlur: 8 }));
    for (const style of ['radial', 'ribbon']) {
      await page.evaluate(s => { musicPlayer.setVisualizerStyle(s); musicPlayer.switchTab('nowplaying'); }, style);
      await sleep(2500);
      await save(page, 'visualizer-' + style);
    }
    await page.evaluate(() => { musicPlayer.setVisualizerStyle('bars'); return musicPlayer.updateAppearance({ surfaceStyle: 'solid' }); });
    await sleep(300);
  },
  async songpage(ctx) {
    const page = await ctx.newPage();
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('https://sweetescape.vercel.app/song/1UjLFMg18cY');
    await sleep(5000);
    await save(page, 'song-page');
  },
  async karaoke(ctx) {
    const page = await boot(ctx);
    await play(page, 'Twinkle Twinkle Little Star', 5);
    const url = await page.evaluate(async () => {
      await loadKaraokeShareDependencies();
      const s = musicPlayer.songLibrary.find(x => x.name.startsWith('Twinkle')); return musicPlayer.generateKaraokeURL(s, s.lyrics);
    });
    await pause(page);
    console.log('karaoke url', url && url.slice(0, 80));
    if (url) {
      const u = new URL(url);
      const kp = await ctx.newPage();
      await kp.setViewportSize({ width: 1280, height: 1000 });
      await kp.route(u => /\/karaoke\/[^.]+$/.test(u.pathname), r => r.fulfill({ path: path.join(root, 'public', 'karaoke.html'), contentType: 'text/html' })); await kp.goto(url);
      await sleep(6000);
      await kp.screenshot({ path: path.join(OUT, 'karaoke-page.jpg'), type: 'jpeg', quality: 80 });
      console.log('saved karaoke-page');
      await kp.click('#playPauseBtn');
      await sleep(14000);
      await kp.click('#fullscreenBtn');
      await sleep(1500);
      await kp.screenshot({ path: path.join(OUT, 'karaoke-fullscreen.jpg'), type: 'jpeg', quality: 80 });
      console.log('saved karaoke-fullscreen');
    }
  }
};

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE, {
    viewport: { width: 1280, height: 800 },
    serviceWorkers: 'block',
    args: [ '--autoplay-policy=no-user-gesture-required' ]
  });
  await seed(ctx);
  for (const [name, fn] of Object.entries(scenes)) {
    if (only.length && !only.includes(name)) continue;
    try {
      await fn(ctx);
    } catch (e) {
      console.log('FAILED', name, e.message.split('\n')[0]);
    }
    for (const p of ctx.pages()) await p.close().catch(() => {});
  }
  await ctx.close();
  fs.rmSync(PROFILE, { recursive: true, force: true });
})();
