// karaoke-player.js - Karaoke Player functionality with SweetEscape integration

class KaraokePlayer {
  constructor() {
    this.ytPlayer = null;
    this.ytPlayerReady = false;
    this.karaokeData = null;
    this.isPlaying = false;
    this.isFullscreen = false;
    this.currentSpeed = 1;
    this.isLooping = false;
    this.isCentering = true;
    this.lyricsInterval = null;
    this.progressInterval = null;
    this.currentHighlightIndex = -1;
    this.db = null;
    
    this.initElements();
    this.initializeDatabase();
    this.loadKaraokeData();
  }
  
  initElements() {
    this.els = {
      playPauseBtn: document.getElementById('playPauseBtn'),
      restartBtn: document.getElementById('restartBtn'),
      loopBtn: document.getElementById('loopBtn'),
      centerBtn: document.getElementById('centerBtn'),
      speedSlider: document.getElementById('speedSlider'),
      speedDisplay: document.getElementById('speedDisplay'),
      progressBar: document.getElementById('progressBar'),
      timeDisplay: document.getElementById('timeDisplay'),
      lyricsDisplay: document.getElementById('lyricsDisplay'),
      fullscreenBtn: document.getElementById('fullscreenBtn'),
      fullscreenModal: document.getElementById('fullscreenModal'),
      fullscreenLyrics: document.getElementById('fullscreenLyrics'),
      exitFullscreenBtn: document.getElementById('exitFullscreenBtn'),
      shareURL: document.getElementById('shareURL'),
      copyURLBtn: document.getElementById('copyURLBtn'),
      errorModal: document.getElementById('errorModal'),
      saveToLibraryBtn: document.getElementById('saveToLibraryBtn'),
      successToast: document.getElementById('successToast'),
      toastMessage: document.getElementById('toastMessage')
    };
    
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    this.els.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
    this.els.restartBtn.addEventListener('click', () => this.restart());
    this.els.loopBtn.addEventListener('click', () => this.toggleLoop());
    this.els.centerBtn.addEventListener('click', () => this.toggleCentering());
    this.els.speedSlider.addEventListener('input', (e) => this.changeSpeed(e.target.value));
    this.els.progressBar.addEventListener('input', (e) => this.seek(e.target.value));
    this.els.fullscreenBtn.addEventListener('click', () => this.enterFullscreen());
    this.els.exitFullscreenBtn.addEventListener('click', () => this.exitFullscreen());
    this.els.copyURLBtn.addEventListener('click', () => this.copyURL());
    this.els.saveToLibraryBtn.addEventListener('click', () => this.saveToLibrary());
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        this.togglePlayPause();
      }
      if (e.code === 'KeyF' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        this.toggleFullscreen();
      }
      if (e.code === 'KeyC' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') { // ADD THESE 4 LINES
        e.preventDefault();
        this.toggleCentering();
      }
    });
  }
  
  // Database initialization
  async initializeDatabase() {
    try {
      this.db = await this.openDatabase();
      this.initializeTheme();
    } catch (error) {
      console.error('Database initialization error:', error);
      // Set default theme if DB fails
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }
  
  openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('musicPlayerDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        const stores = [
          { name: 'songLibrary', keyPath: 'id' },
          { name: 'playlists', keyPath: 'id' },
          { name: 'settings', keyPath: 'name' },
          { name: 'recentlyPlayed', keyPath: 'type' },
          { name: 'userSettings', keyPath: 'category' }
        ];
        
        stores.forEach(({ name, keyPath }) => {
          if (!db.objectStoreNames.contains(name)) {
            db.createObjectStore(name, { keyPath });
          }
        });
      };
    });
  }
  
  // Theme management
  initializeTheme() {
    if (!this.db) {
      document.documentElement.setAttribute("data-theme", "dark");
      return;
    }
    
    const transaction = this.db.transaction(["settings"], "readonly");
    const store = transaction.objectStore("settings");
    const request = store.get("themeMode");
    
    request.onsuccess = () => {
      const savedTheme = request.result ? request.result.value : "dark";
      if (savedTheme === "custom") {
        this.loadCustomTheme();
      } else {
        document.documentElement.setAttribute("data-theme", savedTheme);
      }
    };
    
    request.onerror = (event) => {
      console.error("Error loading theme setting:", event.target.error);
      document.documentElement.setAttribute("data-theme", "dark");
    };
  }
  
  loadCustomTheme() {
    const transaction = this.db.transaction(["settings"], "readonly");
    const store = transaction.objectStore("settings");
    const colorKeys = [
      'customPrimary', 'customBackground', 'customSecondary',
      'customTextPrimary', 'customTextSecondary', 'customHover',
      'customBorder', 'customAccent', 'customButtonText',
      'customShadow', 'customError', 'customErrorHover', 'customYoutubeRed'
    ];
    
    const requests = colorKeys.map(key => {
      const request = store.get(key);
      return new Promise(resolve => {
        request.onsuccess = () => resolve({
          key: key,
          value: request.result?.value
        });
        request.onerror = () => resolve({
          key: key,
          value: null
        });
      });
    });
    
    Promise.all(requests).then((results) => {
      const colors = {};
      const defaults = {
        customPrimary: '#3b82f6',
        customBackground: '#1e293b',
        customSecondary: '#334155',
        customTextPrimary: '#e2e8f0',
        customTextSecondary: '#94a3b8',
        customHover: '#2563eb',
        customBorder: '#475569',
        customAccent: '#3b82f6',
        customButtonText: '#ffffff',
        customShadow: 'rgba(0,0,0,0.4)',
        customError: '#dc3545',
        customErrorHover: '#c82333',
        customYoutubeRed: '#FF0000'
      };
      
      results.forEach(result => {
        colors[result.key] = result.value || defaults[result.key];
      });
      
      // Apply all custom colors
      this.applyCustomColors({
        primary: colors.customPrimary,
        background: colors.customBackground,
        secondary: colors.customSecondary,
        textPrimary: colors.customTextPrimary,
        textSecondary: colors.customTextSecondary,
        hover: colors.customHover,
        border: colors.customBorder,
        accent: colors.customAccent,
        buttonText: colors.customButtonText,
        shadow: colors.customShadow,
        error: colors.customError,
        errorHover: colors.customErrorHover,
        youtubeRed: colors.customYoutubeRed
      });
      
      document.documentElement.setAttribute("data-theme", "custom");
    }).catch(error => {
      console.error("Error loading custom theme:", error);
      document.documentElement.setAttribute("data-theme", "dark");
    });
  }
  
  applyCustomColors(colors) {
    // Set CSS custom properties on the root element
    const root = document.documentElement;
    
    root.style.setProperty('--custom-primary', colors.accent || colors.primary);
    root.style.setProperty('--custom-background', colors.background);
    root.style.setProperty('--custom-secondary', colors.secondary);
    root.style.setProperty('--custom-text-primary', colors.textPrimary);
    root.style.setProperty('--custom-text-secondary', colors.textSecondary);
    root.style.setProperty('--custom-hover', colors.hover);
    root.style.setProperty('--custom-border', colors.border);
    root.style.setProperty('--custom-accent', colors.accent || colors.primary);
    root.style.setProperty('--custom-button-text', colors.buttonText);
    root.style.setProperty('--custom-shadow', colors.shadow);
    root.style.setProperty('--custom-error', colors.error);
    root.style.setProperty('--custom-error-hover', colors.errorHover);
    root.style.setProperty('--custom-youtube-red', colors.youtubeRed);
  }
  
  hexToRgba(hex, opacity) {
    // Handle if hex is already rgba
    if (hex.startsWith('rgba')) {
      return hex;
    }
    
    // Remove # if present
    hex = hex.replace('#', '');
    
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  
  loadKaraokeData() {
    try {
      this.karaokeData = KaraokeEncoder.getFromURL();
      
      if (!this.karaokeData) {
        this.showError();
        return;
      }
      
      // Set share URL
      this.els.shareURL.value = window.location.href;
      
      // Initialize YouTube player
      this.initYouTubePlayer();
      
    } catch (error) {
      console.error('Error loading karaoke data:', error);
      this.showError();
    }
  }
  
  showError() {
    this.els.errorModal.classList.remove('hidden');
  }
  
  initYouTubePlayer() {
    if (typeof YT === 'undefined' || typeof YT.Player === 'undefined') {
      window.onYouTubeIframeAPIReady = () => {
        this.createPlayer();
      };
    } else {
      this.createPlayer();
    }
  }
  
  createPlayer() {
    this.ytPlayer = new YT.Player('ytPlayer', {
      height: '100%',
      width: '100%',
      videoId: this.karaokeData.videoId,
      playerVars: {
        playsinline: 1,
        controls: 1,
        rel: 0
      },
      events: {
        onReady: (event) => this.onPlayerReady(event),
        onStateChange: (event) => this.onPlayerStateChange(event)
      }
    });
  }
  
  onPlayerReady(event) {
    this.ytPlayerReady = true;
    console.log('Player ready');
    this.renderLyrics();
    this.updateTitle();
  }
  
  onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
      this.isPlaying = true;
      this.updatePlayPauseButton();
      this.startProgressTracking();
      this.startLyricsTracking();
      
      if (this.currentSpeed !== 1) {
        this.ytPlayer.setPlaybackRate(this.currentSpeed);
      }
      
    } else if (event.data === YT.PlayerState.PAUSED) {
      this.isPlaying = false;
      this.updatePlayPauseButton();
      this.stopProgressTracking();
      this.stopLyricsTracking();
      
    } else if (event.data === YT.PlayerState.ENDED) {
      this.isPlaying = false;
      this.updatePlayPauseButton();
      
      if (this.isLooping) {
        this.ytPlayer.seekTo(0, true);
        this.ytPlayer.playVideo();
      }
    }
  }
  
  togglePlayPause() {
    if (!this.ytPlayer || !this.ytPlayerReady) return;
    
    if (this.isPlaying) {
      this.ytPlayer.pauseVideo();
    } else {
      this.ytPlayer.playVideo();
    }
  }
  
  updatePlayPauseButton() {
    const icon = this.els.playPauseBtn.querySelector('i');
    if (this.isPlaying) {
      icon.className = 'fas fa-pause';
    } else {
      icon.className = 'fas fa-play';
    }
  }
  
  restart() {
    if (!this.ytPlayer || !this.ytPlayerReady) return;
    this.ytPlayer.seekTo(0, true);
    this.currentHighlightIndex = -1;
  }
  
  toggleLoop() {
    this.isLooping = !this.isLooping;
    this.els.loopBtn.classList.toggle('active', this.isLooping);
  }
  toggleCentering() {
    this.isCentering = !this.isCentering;
    this.els.centerBtn.classList.toggle('active', this.isCentering);
    
    // If turning on centering, immediately center the current lyric
    if (this.isCentering && this.currentHighlightIndex !== -1) {
      const currentLine = document.getElementById(`lyric-${this.currentHighlightIndex}`);
      if (currentLine) {
        currentLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }
  changeSpeed(speed) {
    this.currentSpeed = parseFloat(speed);
    this.els.speedDisplay.textContent = `${this.currentSpeed.toFixed(1)}x`;
    
    if (this.ytPlayer && this.ytPlayerReady) {
      this.ytPlayer.setPlaybackRate(this.currentSpeed);
    }
  }
  
  seek(percentage) {
    if (!this.ytPlayer || !this.ytPlayerReady) return;
    
    const duration = this.ytPlayer.getDuration();
    const seekTime = (percentage / 100) * duration;
    this.ytPlayer.seekTo(seekTime, true);
  }
  
  startProgressTracking() {
    this.stopProgressTracking();
    
    this.progressInterval = setInterval(() => {
      if (!this.ytPlayer || !this.ytPlayerReady) return;
      
      try {
        const currentTime = this.ytPlayer.getCurrentTime();
        const duration = this.ytPlayer.getDuration();
        
        if (duration > 0) {
          const percentage = (currentTime / duration) * 100;
          this.els.progressBar.value = percentage;
          
          const currentFormatted = this.formatTime(currentTime);
          const durationFormatted = this.formatTime(duration);
          this.els.timeDisplay.textContent = `${currentFormatted} / ${durationFormatted}`;
        }
      } catch (error) {
        console.warn('Progress tracking error:', error);
      }
    }, 200);
  }
  
  stopProgressTracking() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }
  
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  
  renderLyrics() {
    if (!this.karaokeData || !this.karaokeData.lines) return;
    
    this.els.lyricsDisplay.innerHTML = '';
    
    this.karaokeData.lines.forEach((line, index) => {
      const lineEl = document.createElement('div');
      lineEl.className = 'lyric-line';
      lineEl.textContent = line.text;
      lineEl.id = `lyric-${index}`;
      lineEl.dataset.time = line.time;
      
      // Click to seek
      lineEl.addEventListener('click', () => {
        if (this.ytPlayer && this.ytPlayerReady) {
          this.ytPlayer.seekTo(line.time, true);
        }
      });
      
      this.els.lyricsDisplay.appendChild(lineEl);
    });
  }
  
  startLyricsTracking() {
    this.stopLyricsTracking();
    
    this.lyricsInterval = setInterval(() => {
      if (!this.ytPlayer || !this.ytPlayerReady) return;
      
      try {
        const currentTime = this.ytPlayer.getCurrentTime();
        this.updateHighlightedLyric(currentTime);
        
        if (this.isFullscreen) {
          this.updateFullscreenLyric(currentTime);
        }
      } catch (error) {
        console.warn('Lyrics tracking error:', error);
      }
    }, 100);
  }
  
  stopLyricsTracking() {
    if (this.lyricsInterval) {
      clearInterval(this.lyricsInterval);
      this.lyricsInterval = null;
    }
  }
  
  updateHighlightedLyric(currentTime) {
    if (!this.karaokeData || !this.karaokeData.lines) return;
    
    let highlightIndex = -1;
    
    for (let i = 0; i < this.karaokeData.lines.length; i++) {
      if (currentTime >= this.karaokeData.lines[i].time) {
        if (i === this.karaokeData.lines.length - 1 || 
            currentTime < this.karaokeData.lines[i + 1].time) {
          highlightIndex = i;
        }
      }
    }
    
    if (highlightIndex !== this.currentHighlightIndex) {
      // Remove previous highlight
      const allLines = this.els.lyricsDisplay.querySelectorAll('.lyric-line');
      allLines.forEach(line => line.classList.remove('active'));
      
      // Add new highlight
      if (highlightIndex !== -1) {
        const currentLine = document.getElementById(`lyric-${highlightIndex}`);
        if (currentLine) {
          currentLine.classList.add('active');
          // Only auto-scroll if centering is enabled
          if (this.isCentering) {
            currentLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }
      
      this.currentHighlightIndex = highlightIndex;
    }
  }
  
  enterFullscreen() {
    this.isFullscreen = true;
    this.els.fullscreenModal.classList.add('active');
    this.renderFullscreenLyrics();
  }
  
  exitFullscreen() {
    this.isFullscreen = false;
    this.els.fullscreenModal.classList.remove('active');
  }
  
  toggleFullscreen() {
    if (this.isFullscreen) {
      this.exitFullscreen();
    } else {
      this.enterFullscreen();
    }
  }
  
  renderFullscreenLyrics() {
    if (!this.karaokeData || !this.karaokeData.lines) return;
    
    this.els.fullscreenLyrics.innerHTML = '';
    
    this.karaokeData.lines.forEach((line, index) => {
      const lineEl = document.createElement('div');
      lineEl.className = 'lyric-line';
      lineEl.textContent = line.text;
      lineEl.id = `fullscreen-lyric-${index}`;
      lineEl.dataset.time = line.time;
      this.els.fullscreenLyrics.appendChild(lineEl);
    });
  }
  
  updateFullscreenLyric(currentTime) {
    if (!this.karaokeData || !this.karaokeData.lines) return;
    
    let highlightIndex = -1;
    
    for (let i = 0; i < this.karaokeData.lines.length; i++) {
      if (currentTime >= this.karaokeData.lines[i].time) {
        if (i === this.karaokeData.lines.length - 1 || 
            currentTime < this.karaokeData.lines[i + 1].time) {
          highlightIndex = i;
        }
      }
    }
    
    const allLines = this.els.fullscreenLyrics.querySelectorAll('.lyric-line');
    allLines.forEach(line => line.classList.remove('active'));
    
    if (highlightIndex !== -1) {
      const currentLine = document.getElementById(`fullscreen-lyric-${highlightIndex}`);
      if (currentLine) {
        currentLine.classList.add('active');

        if (this.isCentering) {
          currentLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }
  
  copyURL() {
    this.els.shareURL.select();
    document.execCommand('copy');
    
    const originalText = this.els.copyURLBtn.innerHTML;
    this.els.copyURLBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
    this.els.copyURLBtn.classList.add('copied');
    
    setTimeout(() => {
      this.els.copyURLBtn.innerHTML = originalText;
      this.els.copyURLBtn.classList.remove('copied');
    }, 2000);
  }
  
  updateTitle() {
    if (this.karaokeData && this.karaokeData.lines && this.karaokeData.lines.length > 0) {
      document.title = `${this.karaokeData.lines[0].text.substring(0, 30)}... - Karaoke`;
    }
  }
  
  // Save to SweetEscape library
  async saveToLibrary() {
    if (!this.karaokeData) {
      this.showToast('No karaoke data to save', 'error');
      return;
    }
    
    try {
      const db = await this.openDatabase();
      
      // Check if song already exists
      const existingSong = await this.findSongByVideoId(db, this.karaokeData.videoId);
      
      if (existingSong) {
        // Update existing song with lyrics
        const lyrics = KaraokeEncoder.convertToSweetescapeLyrics(this.karaokeData.lines);
        await this.updateSongLyrics(db, existingSong.id, lyrics);
        this.showToast('Lyrics updated in library!');
      } else {
        // Add new song
        await this.addNewSong(db);
        this.showToast('Saved to library!');
      }
      
      db.close();
    } catch (error) {
      console.error('Error saving to library:', error);
      this.showToast('Failed to save. Please try again.', 'error');
    }
  }
  
  findSongByVideoId(db, videoId) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['songLibrary'], 'readonly');
      const store = transaction.objectStore('songLibrary');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const songs = request.result || [];
        const found = songs.find(song => song.videoId === videoId);
        resolve(found || null);
      };
      
      request.onerror = () => reject(request.error);
    });
  }
  
  updateSongLyrics(db, songId, lyrics) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['songLibrary'], 'readwrite');
      const store = transaction.objectStore('songLibrary');
      const getRequest = store.get(songId);
      
      getRequest.onsuccess = () => {
        const song = getRequest.result;
        song.lyrics = lyrics;
        
        const updateRequest = store.put(song);
        updateRequest.onsuccess = () => resolve();
        updateRequest.onerror = () => reject(updateRequest.error);
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  }
  
  async addNewSong(db) {
    // Fetch video title from YouTube API (we'll use the first lyric line as fallback)
    const songName = this.karaokeData.lines[0].text.substring(0, 50);
    const lyrics = KaraokeEncoder.convertToSweetescapeLyrics(this.karaokeData.lines);
    
    const newSong = {
      id: Date.now(),
      name: songName,
      author: '',
      videoId: this.karaokeData.videoId,
      favorite: false,
      lyrics: lyrics
    };
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['songLibrary'], 'readwrite');
      const store = transaction.objectStore('songLibrary');
      const request = store.add(newSong);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
  
  showToast(message, type = 'success') {
    this.els.toastMessage.textContent = message;
    this.els.successToast.classList.remove('hidden');
    this.els.successToast.classList.toggle('error', type === 'error');
    
    setTimeout(() => {
      this.els.successToast.classList.add('hidden');
      this.els.successToast.classList.remove('error');
    }, 3000);
  }
}

// Initialize player when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new KaraokePlayer();
  });
} else {
  new KaraokePlayer();
}
