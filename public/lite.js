class LitePlayer {
  static CUSTOM_COLORS = {
    customPrimary: '#3b82f6',
    customBackground: '#1e293b',
    customSecondary: '#334155',
    customTextPrimary: '#e2e8f0',
    customTextSecondary: '#94a3b8',
    customHover: '#2563eb',
    customBorder: '#475569',
    customAccent: '#3b82f6',
    customButtonText: '',
    customShadow: '',
    customError: '',
    customErrorHover: '',
    customYoutubeRed: ''
  };
  constructor() {
    this.db = null;
    this.songs = [];
    this.playlists = [];
    this.visible = [];
    this.queue = [];
    this.index = -1;
    this.current = null;
    this.blocked = false;
    this.loop = false;
    this.token = 0;
    this.lyrics = null;
    this.lyricIndex = -1;
    this.audio = new Audio();
    this.els = Object.fromEntries([ 'librarySearch', 'songLibrary', 'playlistContainer', 'lyricsContent', 'musicProgressBar', 'timeDisplay', 'currentSongName', 'nextSongName', 'prevBtn', 'playPauseBtn', 'nextBtn', 'loopBtn', 'volumeSlider', 'liteFullButton' ].map(id => [ id, document.getElementById(id) ]));
    this.bind();
    this.start();
  }
  async start() {
    try {
      this.db = await this.openDatabase();
      await this.applyTheme();
      const [ songs, playlists, volume ] = await Promise.all([ this.readAll('songLibrary'), this.readAll('playlists'), this.readSetting('volume') ]);
      this.songs = songs.filter(song => typeof song.localFileHandle?.getFile === 'function').sort((a, b) => Number(Boolean(b.favorite)) - Number(Boolean(a.favorite)) || String(a.name).localeCompare(String(b.name)));
      this.playlists = this.collectPlaylists(playlists);
      if (Number.isFinite(volume)) {
        this.els.volumeSlider.value = volume;
        this.audio.volume = Math.min(1, Math.max(0, volume / 100));
      }
    } catch (error) {
      console.warn('Lite could not open your library:', error);
    }
    this.renderLibrary();
    this.renderPlaylists();
  }
  openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('MusicPlayerDB');
      request.onupgradeneeded = () => request.transaction.abort();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => db.close();
        resolve(db);
      };
    });
  }
  readAll(name) {
    if (!this.db?.objectStoreNames.contains(name)) {
      return Promise.resolve([]);
    }
    return new Promise(resolve => {
      const request = this.db.transaction(name, 'readonly').objectStore(name).getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  }
  readSetting(key) {
    if (!this.db?.objectStoreNames.contains('settings')) {
      return Promise.resolve(undefined);
    }
    return new Promise(resolve => {
      const request = this.db.transaction('settings', 'readonly').objectStore('settings').get(key);
      request.onsuccess = () => resolve(request.result?.value);
      request.onerror = () => resolve(undefined);
    });
  }
  async applyTheme() {
    const root = document.documentElement;
    const mode = await this.readSetting('themeMode') || 'dark';
    if (mode === 'custom') {
      const keys = Object.keys(LitePlayer.CUSTOM_COLORS);
      const values = await Promise.all(keys.map(key => this.readSetting(key)));
      keys.forEach((key, i) => {
        const value = values[i] || LitePlayer.CUSTOM_COLORS[key];
        if (value) {
          root.style.setProperty('--' + key.replace(/[A-Z]/g, c => '-' + c.toLowerCase()), value);
        }
      });
    }
    root.setAttribute('data-theme', mode);
  }
  collectPlaylists(playlists) {
    const byId = new Map(this.songs.map(song => [ song.id, song ]));
    const byVideo = new Map(this.songs.map(song => [ song.videoId, song ]));
    const collected = playlists.map(playlist => ({
      id: playlist.id,
      name: playlist.name,
      songs: (playlist.songs || []).map(song => byId.get(song.id) || byVideo.get(song.videoId)).filter(Boolean)
    })).filter(playlist => playlist.songs.length).sort((a, b) => String(a.name).localeCompare(String(b.name)));
    const favorites = this.songs.filter(song => song.favorite);
    if (favorites.length) {
      collected.unshift({
        id: 'favorites',
        name: 'Favourites',
        songs: favorites
      });
    }
    return collected;
  }
  bind() {
    const els = this.els;
    document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => this.showTab(tab.dataset.tab)));
    els.librarySearch.addEventListener('input', () => this.renderLibrary());
    els.songLibrary.addEventListener('click', event => {
      const row = event.target.closest('.song-item');
      if (row) {
        this.queue = this.visible;
        this.playAt(this.visible.findIndex(song => String(song.id) === row.dataset.songId), true);
      }
    });
    els.playlistContainer.addEventListener('click', event => {
      const card = event.target.closest('.playlist-card');
      if (card) {
        this.playPlaylist(card.dataset.playlistId);
      }
    });
    els.playlistContainer.addEventListener('keydown', event => {
      const card = event.target.closest('.playlist-card');
      if (card && event.key === 'Enter') {
        this.playPlaylist(card.dataset.playlistId);
      }
    });
    els.playPauseBtn.addEventListener('click', () => this.togglePlay());
    els.nextBtn.addEventListener('click', () => this.step(1, true));
    els.prevBtn.addEventListener('click', () => this.previous());
    els.loopBtn.addEventListener('click', () => {
      this.loop = !this.loop;
      els.loopBtn.classList.toggle('active', this.loop);
    });
    els.volumeSlider.addEventListener('input', () => {
      this.audio.volume = els.volumeSlider.value / 100;
    });
    els.musicProgressBar.addEventListener('input', () => {
      if (this.audio.duration) {
        this.audio.currentTime = els.musicProgressBar.value / 100 * this.audio.duration;
      }
    });
    const bar = document.querySelector('.now-playing');
    new ResizeObserver(() => document.documentElement.style.setProperty('--lite-bar', bar.offsetHeight + 16 + 'px')).observe(bar);
    els.liteFullButton.addEventListener('click', () => {
      location.href = '/';
    });
    this.audio.addEventListener('timeupdate', () => this.syncTime());
    this.audio.addEventListener('play', () => this.syncPlaying());
    this.audio.addEventListener('pause', () => this.syncPlaying());
    this.audio.addEventListener('ended', () => {
      if (this.loop) {
        this.audio.currentTime = 0;
        this.audio.play();
      } else {
        this.step(1, false);
      }
    });
    document.addEventListener('keydown', event => {
      if (event.code === 'Space' && !event.target.closest('input, textarea, button')) {
        event.preventDefault();
        this.togglePlay();
      }
    });
    if ('mediaSession' in navigator) {
      const actions = {
        play: () => this.togglePlay(),
        pause: () => this.audio.pause(),
        previoustrack: () => this.previous(),
        nexttrack: () => this.step(1, false)
      };
      Object.entries(actions).forEach(([ action, handler ]) => navigator.mediaSession.setActionHandler(action, handler));
    }
  }
  showTab(name) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.toggle('active', tab.dataset.tab === name));
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.toggle('active', pane.id === name));
    if (name === 'lyrics') {
      this.renderLyrics();
    } else {
      this.lyrics = null;
    }
  }
  normalize(text) {
    return String(text || '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }
  renderLibrary() {
    const term = this.normalize(this.els.librarySearch.value.trim());
    this.visible = term ? this.songs.filter(song => this.normalize(song.name + ' ' + (song.author || '')).includes(term)) : this.songs;
    const host = this.els.songLibrary;
    if (!this.visible.length) {
      host.replaceChildren(this.emptyMessage(this.songs.length ? `No offline songs match "${this.els.librarySearch.value.trim()}"` : this.db && 'FileSystemFileHandle' in window ? 'No songs saved for offline yet. Download a song or link it to a file in the full player and it shows up here.' : 'This browser cannot play songs saved on your device. Lite needs Chrome or Edge.'));
      return;
    }
    host.replaceChildren(...this.visible.map(song => this.songRow(song)));
    this.markCurrent();
  }
  songRow(song) {
    const row = this.el('div', 'song-item');
    row.dataset.songId = song.id;
    const name = this.el('span', 'song-name', song.name);
    if (song.author) {
      name.append(' ', this.el('small', 'song-author', 'by ' + song.author));
    }
    const indicators = this.el('div', 'song-status-indicators');
    if (song.lyrics?.trim()) {
      indicators.append(this.icon('span', 'song-lyrics-indicator', 'fa-closed-captioning', 'Has lyrics'));
    }
    if (song.favorite) {
      indicators.append(this.icon('span', 'song-fav-indicator', 'fa-star', 'Favourited'));
    }
    const actions = this.el('div', 'song-actions');
    actions.append(this.icon('button', 'song-card-btn play-btn', 'fa-play', 'Play'));
    const right = this.el('div', 'song-item-right');
    right.append(indicators, actions);
    row.append(name, right);
    return row;
  }
  renderPlaylists() {
    const host = this.els.playlistContainer;
    if (!this.playlists.length) {
      host.replaceChildren(this.emptyMessage('None of your playlists has offline songs yet.'));
      return;
    }
    host.replaceChildren(...this.playlists.map(playlist => {
      const card = this.el('div', 'playlist-card');
      card.dataset.playlistId = playlist.id;
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      const cover = this.el('div', 'playlist-shelf-thumb is-empty');
      cover.append(this.el('i', playlist.id === 'favorites' ? 'fas fa-star' : 'fas fa-music'));
      const info = this.el('div', 'playlist-card-info');
      info.append(this.el('span', 'playlist-card-name', playlist.name), this.el('small', 'playlist-card-meta', `${playlist.songs.length} offline song${playlist.songs.length === 1 ? '' : 's'}`));
      const actions = this.el('div', 'song-actions');
      actions.append(this.icon('button', 'song-card-btn play-btn', 'fa-play', 'Play'));
      const right = this.el('div', 'song-item-right');
      right.append(actions);
      card.append(cover, info, right);
      return card;
    }));
  }
  playPlaylist(id) {
    const playlist = this.playlists.find(item => String(item.id) === id);
    if (playlist) {
      this.queue = playlist.songs;
      this.playAt(0, true);
    }
  }
  async playAt(index, gesture) {
    const song = this.queue[index];
    if (!song) {
      return;
    }
    const token = ++this.token;
    this.index = index;
    this.current = song;
    this.blocked = false;
    this.renderNowPlaying();
    let file = null;
    try {
      file = await this.readFile(song.localFileHandle, gesture);
    } catch (error) {
      if (token === this.token) {
        this.audio.pause();
        this.setStatus(error.name === 'NotFoundError' ? `${song.name} is no longer on this device` : `Could not open ${song.name}`);
      }
      return;
    }
    if (token !== this.token) {
      return;
    }
    if (!file) {
      this.blocked = true;
      this.audio.pause();
      this.setStatus(`Press play to open ${song.name}`);
      return;
    }
    if (this.audio.src) {
      URL.revokeObjectURL(this.audio.src);
    }
    this.audio.src = URL.createObjectURL(file);
    this.audio.play().catch(error => console.warn('Lite playback failed:', error));
  }
  async readFile(handle, gesture) {
    let state = await handle.queryPermission({
      mode: 'read'
    });
    if (state !== 'granted' && gesture) {
      state = await handle.requestPermission({
        mode: 'read'
      });
    }
    return state === 'granted' ? handle.getFile() : null;
  }
  togglePlay() {
    if (this.blocked || !this.audio.src && this.current) {
      this.playAt(this.index, true);
    } else if (!this.current) {
      this.queue = this.visible;
      this.playAt(0, true);
    } else if (this.audio.paused) {
      this.audio.play();
    } else {
      this.audio.pause();
    }
  }
  step(direction, gesture) {
    if (!this.queue.length) {
      return;
    }
    this.playAt((this.index + direction + this.queue.length) % this.queue.length, gesture);
  }
  previous() {
    if (this.audio.currentTime > 3) {
      this.audio.currentTime = 0;
    } else {
      this.step(-1, true);
    }
  }
  renderNowPlaying() {
    const song = this.current;
    const next = this.queue.length > 1 ? this.queue[(this.index + 1) % this.queue.length] : null;
    this.els.currentSongName.textContent = song.author ? `${song.name} - ${song.author}` : song.name;
    this.els.nextSongName.textContent = next ? next.name : '-';
    document.title = `${song.name} · SweetEscape Lite`;
    this.markCurrent();
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.name,
        artist: song.author || '',
        album: 'SweetEscape Lite'
      });
    }
    if (document.getElementById('lyrics').classList.contains('active')) {
      this.renderLyrics();
    }
  }
  setStatus(text) {
    this.els.currentSongName.textContent = text;
  }
  markCurrent() {
    this.els.songLibrary.querySelectorAll('.song-item').forEach(row => row.classList.toggle('is-current', row.dataset.songId === String(this.current?.id)));
  }
  syncPlaying() {
    const playing = !this.audio.paused;
    const button = this.els.playPauseBtn;
    button.firstElementChild.className = playing ? 'fas fa-pause' : 'fas fa-play';
    button.title = playing ? 'Pause' : 'Play';
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
    }
  }
  syncTime() {
    const { currentTime, duration } = this.audio;
    if (duration) {
      this.els.musicProgressBar.value = currentTime / duration * 100;
      this.els.timeDisplay.textContent = `${this.formatTime(currentTime)}/${this.formatTime(duration)}`;
    }
    if (this.lyrics?.timed) {
      this.highlightLyric(currentTime);
    }
  }
  formatTime(seconds) {
    const whole = Math.floor(seconds);
    return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
  }
  renderLyrics() {
    const host = this.els.lyricsContent;
    const text = this.current?.lyrics?.trim();
    this.lyrics = null;
    this.lyricIndex = -1;
    if (!text) {
      host.replaceChildren(this.el('p', 'no-lyrics-message', this.current ? 'No lyrics for this song' : 'No song playing'));
      return;
    }
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    const timed = lines.some(line => /\[\d+:\d+\]/.test(line));
    const parsed = lines.map(line => {
      const match = line.match(/(.*)\s*\[(\d+):(\d+)\]/);
      return match ? {
        text: match[1].trim(),
        time: Number(match[2]) * 60 + Number(match[3])
      } : {
        text: line,
        time: null
      };
    }).filter(line => !timed || line.time !== null);
    const display = this.el('div', 'lyrics-display');
    const rows = parsed.map(line => this.el('div', 'lyric-line', line.text));
    display.append(...rows);
    host.replaceChildren(display);
    this.lyrics = {
      timed,
      lines: parsed,
      rows
    };
    if (timed) {
      this.highlightLyric(this.audio.currentTime);
    }
  }
  highlightLyric(time) {
    const { lines, rows } = this.lyrics;
    let index = -1;
    for (let i = 0; i < lines.length && lines[i].time <= time; i++) {
      index = i;
    }
    if (index === this.lyricIndex) {
      return;
    }
    rows[this.lyricIndex]?.classList.remove('active');
    this.lyricIndex = index;
    if (rows[index]) {
      rows[index].classList.add('active');
      rows[index].scrollIntoView({
        block: 'center',
        behavior: 'smooth'
      });
    }
  }
  emptyMessage(text) {
    return this.el('div', 'empty-library-message', text);
  }
  el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) {
      node.className = className;
    }
    if (text !== undefined) {
      node.textContent = text;
    }
    return node;
  }
  icon(tag, className, icon, title) {
    const node = this.el(tag, className);
    if (title) {
      node.title = title;
    }
    if (tag === 'button') {
      node.type = 'button';
    }
    node.append(this.el('i', 'fas ' + icon));
    return node;
  }
}

new LitePlayer();
