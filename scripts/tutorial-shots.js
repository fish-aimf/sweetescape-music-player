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
Take On Me, https://www.youtube.com/watch?v=djV11Xbc914, a-ha
Africa, https://www.youtube.com/watch?v=FTQbiNvZqaY, TOTO
Uptown Funk, https://www.youtube.com/watch?v=OPf0YbXqDm0, Mark Ronson ft. Bruno Mars
Happy, https://www.youtube.com/watch?v=ZbZSe6N_BXs, Pharrell Williams
Viva La Vida, https://www.youtube.com/watch?v=dvgZkm1xWPE, Coldplay
Wake Me Up, https://www.youtube.com/watch?v=IcrbM1l_BoI, Avicii
}
Late Night{
Blinding Lights, https://www.youtube.com/watch?v=4NRXx6U8ABQ, The Weeknd
Numb, https://www.youtube.com/watch?v=kXYiU_JCYtU, Linkin Park
Hello, https://www.youtube.com/watch?v=YQHsXMglC9A, Adele
See You Again, https://www.youtube.com/watch?v=RgKAFK5djSk, Wiz Khalifa ft. Charlie Puth
}
Classics{
Bohemian Rhapsody, https://www.youtube.com/watch?v=fJ9rUzIMcZQ, Queen
Billie Jean, https://www.youtube.com/watch?v=Zi_XLOBDo_Y, Michael Jackson
Smells Like Teen Spirit, https://www.youtube.com/watch?v=hTWKbfoikeg, Nirvana
Never Gonna Give You Up, https://www.youtube.com/watch?v=dQw4w9WgXcQ, Rick Astley
}
Gym{
Believer, https://www.youtube.com/watch?v=7wtfhZwyrcc, Imagine Dragons
Lose Yourself, https://www.youtube.com/watch?v=_Yhyp-_hX2s, Eminem
Roar, https://www.youtube.com/watch?v=CevxZvSJLk8, Katy Perry
}`;

const EXTRA = `Despacito, https://www.youtube.com/watch?v=kJQP7kiw5Fk, Luis Fonsi ft. Daddy Yankee
Shape of You, https://www.youtube.com/watch?v=JGwWNGJdvx8, Ed Sheeran
Gangnam Style, https://www.youtube.com/watch?v=9bZkp7q19f0, PSY
Twinkle Twinkle Little Star, https://www.youtube.com/watch?v=yCjJyiqpAuU, Super Simple Songs`;

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
    const favs = ['Blinding Lights', 'Take On Me', 'Africa', 'Bohemian Rhapsody', 'Uptown Funk', 'Numb', 'Hello'];
    for (const name of favs) {
      const s = p.songLibrary.find(x => x.name === name);
      if (s && !s.favorite) p.toggleFavorite(s.id);
    }
    const tw = p.songLibrary.find(x => x.name.startsWith('Twinkle'));
    tw.lyrics = lyrics;
    await p.saveSingleSong?.(tw);
    p.saveSongLibrary?.();
    const plays = { 'Blinding Lights': 41, 'Take On Me': 33, 'Africa': 28, 'Bohemian Rhapsody': 24, 'Uptown Funk': 19, 'Numb': 17, 'Believer': 12, 'Hello': 11, 'Viva La Vida': 9, 'Happy': 7, 'Roar': 5, 'Despacito': 4 };
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
    await play(page, 'Blinding Lights', 64);
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
    await page.fill('#songUrl', 'https://www.youtube.com/watch?v=HgzGwKwLmgM');
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
  },
  async playlists(ctx) {
    const page = await boot(ctx);
    await page.evaluate(() => musicPlayer.switchTab('playlists'));
    await sleep(800);
    await save(page, 'playlists-tab', '.player-area', 8);
    await page.evaluate(() => musicPlayer.openPlaylistEditModal(musicPlayer.playlists.find(p => p.name === 'Road Trip').id));
    await sleep(1200);
    await save(page, 'playlist-edit', '#playlistEditModal .ui-modal', 0);
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
    await play(page, 'Africa', 80);
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
    for (const mode of ['verse', 'cards', 'mirror']) {
      await page.evaluate(m => { document.querySelectorAll('.lyrics-mode-modal').forEach(x => x.closest('.ui-overlay')?.remove()); musicPlayer.lyricsModeDialog = null; musicPlayer.openLyricsStage(m); }, mode);
      await sleep(2600);
      await save(page, 'lyrics-stage-' + mode);
      await page.evaluate(() => musicPlayer.closeLyricsStage());
      await sleep(500);
    }
  },
  async lyricsmaker(ctx) {
    const page = await boot(ctx);
    await page.evaluate(() => musicPlayer.openLyricsMakerModal(musicPlayer.songLibrary.find(s => s.name === 'Hello').id));
    await sleep(1500);
    await save(page, 'lyrics-maker', '#lyricsModal .ui-modal', 0);
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
    for (const tab of ['recommendation', 'keybinds', 'additional']) {
      await page.click(`.settings-tab-btn[data-tab="${tab}"]`);
      await sleep(900);
      await save(page, 'settings-' + tab, '#settingsModal .ui-modal', 0);
    }
  },
  async glass(ctx) {
    const page = await boot(ctx);
    await play(page, 'Take On Me', 70);
    await page.evaluate(async () => {
      const p = musicPlayer;
      p.__prevAppearance = JSON.stringify(p.appearance);
      p.appearance.surfaceStyle = 'glass';
      p.appearance.backgroundAlbumArt = true;
      p.applyAppearance();
      p.switchTab('library');
    });
    await sleep(3000);
    await save(page, 'glass-mode');
    await page.evaluate(() => {
      const p = musicPlayer;
      Object.assign(p.appearance, JSON.parse(p.__prevAppearance));
      p.applyAppearance();
    });
    await sleep(500);
  },
  async modals(ctx) {
    const page = await boot(ctx);
    await play(page, 'Uptown Funk', 45);
    await pause(page);
    await page.click('#timerButton');
    await sleep(800);
    await save(page, 'timer', '#timerModal .ui-modal', 0);
    await page.click('#closeTimerModal');
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
