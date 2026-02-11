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
    this.lyricsInterval = null;
    this.progressInterval = null;
    this.currentHighlightIndex = -1;
    
    this.initElements();
    this.loadKaraokeData();
  }
  
  initElements() {
    this.els = {
      playPauseBtn: document.getElementById('playPauseBtn'),
      restartBtn: document.getElementById('restartBtn'),
      loopBtn: document.getElementById('loopBtn'),
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
    });
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
          currentLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
        currentLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
