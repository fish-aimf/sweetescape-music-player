class AdvancedMusicPlayer {
  constructor() {
    this.playlists = [];
    this.songLibrary = [];
    this.songQueue = [];
    this.db = null;
    this.currentPlaylist = null;
    this.currentSong = null;
    this.currentSongIndex = 0;
    this.isPlaying = false;
    this.isLooping = false;
    this.autoCenterLyrics = true;
    this.isPlaylistLooping = true;
    this.isAutoplayEnabled = true;
    this.listeningStatsEnabled = false;
    this._statCountedForCurrentPlay = false;
    this.currentSpeed = 1;
    this.allowDuplicates = true;
    this._libFilters = {
      favorite: null,
      lyrics: null,
      downloaded: null
    };
    this.ytPlayer = null;
    this.ytPlayerReady = false;
    this.fullscreenYtPlayer = null;
    this.isSidebarVisible = false;
    this.isVideoFullscreen = false;
    this.isWebEmbedVisible = false;
    this.isLyricsFullscreen = false;
    this.isAdditionalDetailsHidden = false;
    this.currentLayout = 'center';
    this.playlistSidebarMode = 'overlay';
    this.playlistEditModeActive = false;
    this.currentTabIndex = 0;
    this.progressBar = null;
    this.progressInterval = null;
    this.listeningTime = 0;
    this.listeningTimeInterval = null;
    this.listeningTimeDisplay = document.getElementById('listeningTime');
    this.temporarilySkippedSongs = new Set();
    this.recentlyPlayedSongs = [];
    this.recentlyPlayedPlaylists = [];
    this.recentlyPlayedLimit = 20;
    this.recentlyPlayedDisplayLimit = 3;
    this.suggestedSongsDisplayLimit = 2;
    this.yourPicksDisplayLimit = 2;
    this.recentlyPlayedPlaylistsDisplayLimit = 1;
    this.longPressTimer = null;
    this.titleScrollInterval = null;
    this.isLongPressing = false;
    this.appTimer = null;
    this.timerEndTime = null;
    this.timerAction = 'stopMusic';
    this.fullscreenLyricsInterval = null;
    this.originalFavicon = document.querySelector('link[rel="icon"]')?.href || '/favicon.ico';
    this.originalTitle = document.title;
    this.currentDisguiseIndex = -1;
    this.priorityModeActive = false;
    this.titleObserver = null;
    this.pageDisguises = [ {
      favicon: 'https://i.ibb.co/W4MfKV9X/image.png',
      title: 'WhatsApp',
      isPriority: true
    }, {
      favicon: 'https://i.ibb.co/Y77XtqRh/image.png',
      title: 'Inbox (78) - Gmail',
      isPriority: true
    }, {
      favicon: 'https://i.ibb.co/fV4bT2Fp/image.png',
      title: 'DeepSeek - Into the Unknown',
      isPriority: true
    }, {
      favicon: 'https://i.ibb.co/35hmFHPL/image.png',
      title: 'Home',
      isPriority: true
    }, {
      favicon: 'https://i.ibb.co/JFKpsWK3/image.png',
      title: 'Desmos | Graphing Calculator',
      isPriority: true
    }, {
      favicon: 'https://i.ibb.co/35MNf3BZ/image.png',
      title: 'New Tab',
      isPriority: true
    }, {
      favicon: 'https://i.ibb.co/vCKb51GK/image.png',
      title: 'ChatGPT',
      isPriority: true
    }, {
      favicon: 'https://i.ibb.co/xtwTzMvz/image.png',
      title: 'Home | Microsoft 365 Copilot',
      isPriority: true
    } ];
    this.webEmbedOverlay = null;
    this.currentWebEmbedIndex = 0;
    this.webEmbedSites = [ 'https://www.desmos.com/calculator', 'https://i2.res.24o.it/pdf2010/Editrice/ILSOLE24ORE/ILSOLE24ORE/Online/_Oggetti_Embedded/Documenti/2025/07/12/Preliminary%20Report%20VT.pdf', 'https://www.wikipedia.org', 'https://www.desmos.com/scientific', 'https://www.desmos.com/3d' ];
    this.adsEnabled = false;
    this.visualizerEnabled = true;
    this.autoMiniplayerEnabled = false;
    this.miniplayerWindow = null;
    this.miniplayerAutoOpened = false;
    this._miniplayerEls = null;
    this._miniplayerInterval = null;
    this.isAutofillButtonHovered = false;
    this.ghostPreviewAbortController = null;
    this.currentGhostRequestId = null;
    this.ghostScrollHandler = null;
    this.ghostResizeHandler = null;
    this.ghostInteractionHandler = null;
    this.visualizer = {
      canvas: null,
      ctx: null,
      bars: [],
      particles: [],
      animationId: null,
      isActive: false
    };
    this.YOUTUBE_API_KEYS_COUNT = 20;
    this.youtubeLibrarySearchResults = [];
    this.YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';
    this.topicKeywordEnabled = true;
    this.supabase = null;
    this.supadataApiKey = 'sd_b3095aebbee9e4a7e6333bca9027b4cc';
    this.currentSongForSubtitlesImport = null;
    this.searchTimeout = null;
    this.librarySearchTimeout = null;
    this.currentSearchTerm = '';
    this.filteredPlaylists = [];
    this.sidebarSearchDebounceTimer = null;
    this.importModal = null;
    this.closeImportModalBtn = null;
    this.importSongsBtn = null;
    this.importSongsTextarea = null;
    this.defaultKeybinds = {
      togglePlayPause: 'Space',
      togglePlayPause2: 'KeyK',
      previousSong: 'ArrowLeft',
      previousSong2: 'KeyA',
      nextSong: 'ArrowRight',
      nextSong2: 'KeyD',
      volumeUp: 'ArrowUp',
      volumeDown: 'ArrowDown',
      toggleLoop: 'KeyL',
      restartSong: 'KeyR',
      toggleTheme: 'KeyP',
      openTimer: 'KeyT',
      volumeUpFine: 'Equal',
      volumeDownFine: 'Minus',
      toggleControlBar: 'KeyH',
      togglePlaylistSidebar: 'KeyM',
      togglePlaylistSidebar2: 'Tab',
      cycleTab: 'KeyQ',
      toggleVideoFullscreen: 'KeyU',
      showQueue: 'KeyY',
      cycleFavicon: 'KeyB',
      toggleWebEmbed: 'KeyN',
      toggleMusicExplorer: 'KeyO',
      seekForward: 'KeyG',
      seekBackward: 'KeyF',
      toggleMiniplayer: 'KeyI'
    };
    this.currentKeybinds = {
      ...this.defaultKeybinds
    };
    this.isRecordingKeybind = false;
    this.recordingAction = null;
    this.discordWs = null;
    this.discordConnected = false;
    this.discordEnabled = false;
    this.discordReconnectTimer = null;
    this.discordReconnectAttempts = 0;
    this.maxDiscordReconnectAttempts = 3;
    this._discordConnecting = false;
    this._discordWsOk = false;
    this._discordApiOk = false;
    this._discordAppFound = false;
    this._discordLastError = null;
    this._discordOverrides = {};
    this._discordLastUpdate = null;
    this._discordUpdateTickInterval = null;
    this._discordSendTimer = null;
    this.librarySortAlphabetically = true;
    this.libraryReverseOrder = false;
    this.isTabVisible = !document.hidden;
    this.handleVisibilityChange = null;
    this.dlQueue = [];
    this.debouncedUpdatePlayerUI = this.debounce(this.updatePlayerUI.bind(this), 50);
    this.debouncedFilterLibrary = this.debounce(this.filterLibrarySongs.bind(this), 96);
    this.currentLyricMakerSongId = null;
    this.lyricMakerCleanup = null;
    this.elements = {};
    this._initialize();
  }
  async _initialize() {
    try {
      await this.initDatabase();
      await Promise.all([ this.loadSongLibrary(), this.loadPlaylists(), this.loadSettings(), this.loadRecentlyPlayed(), this.loadDiscoverMoreSettingsOnStartup(), this.loadKeybinds(), this.loadDiscordSettings(), this.loadLibrarySortValue(), this.loadLibraryReverseValue(), this.loadVisualizerValue() ]);
      const shouldShowWelcome = this.songLibrary.length === 0;
      this.initializeElements();
      this._syncInitialUI();
      this._setupComponents();
      if (shouldShowWelcome) {
        this.showWelcomeModal();
      }
    } catch (error) {
      console.error('Error initializing music player:', error);
      this._handleInitializationError(error);
    }
  }
  _syncInitialUI() {
    if (this.elements.librarySortToggle) {
      this.elements.librarySortToggle.checked = this.librarySortAlphabetically;
    }
    if (this.elements.libraryReverseToggle) {
      this.elements.libraryReverseToggle.checked = this.libraryReverseOrder;
    }
    if (this.elements.loopBtn) {
      this.elements.loopBtn.classList.toggle('active', this.isLooping);
    }
    if (this.elements.volumeSlider) {
      this.elements.volumeSlider.value = this.savedVolume ?? 100;
    }
    this.syncVisualizerUI();
    if (this.elements.listeningStatsToggle) {
      this.elements.listeningStatsToggle.checked = this.listeningStatsEnabled;
    }
    if (this.elements.autoMiniplayerToggle) {
      this.elements.autoMiniplayerToggle.checked = this.autoMiniplayerEnabled;
    }
  }
  _setupComponents() {
    this.setupYouTubePlayer();
    this.loadQueue();
    this.setupEventListeners();
    this.setupPlaylistSidebarModeListeners();
    this.initializeTheme();
    this.initializeAutoplay();
    this.setupKeyboardControls();
    this.renderInitialState();
    this.renderAdditionalDetails();
    this.setupLyricsTabContextMenu();
    this.initializeFullscreenLyrics();
    this.initializeAdvertisementSettings();
    this.initializeVisualizer();
    this.initGlobalLibraryDebouncedSearch();
    this.setupChangelogModal();
    this.loadVersion();
    this.setupYouTubeLibraryResultsDelegation();
    this.initNowPlayingTab();
    this.initDownloadModal();
    this.initShazamModal();
    this.addQueueStyles();
    this.initLibraryFilter();
    this.setupTransportHoverPreviews();
    this.setupMiniplayerAutoToggle();
  }
  _handleInitializationError(error) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#f44;color:#fff;padding:15px 25px;border-radius:8px;z-index:10000;font-family:sans-serif;';
    errorDiv.textContent = 'Failed to initialize music player. Please refresh the page.';
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5e3);
  }
  initDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('MusicPlayerDB', 2);
      request.onerror = event => {
        console.error('IndexedDB error:', event.target.error);
        if (event.target.error?.name === 'VersionError') {
          this._recoverFromStaleCache();
          return;
        }
        reject('Could not open IndexedDB');
      };
      request.onblocked = () => {
        console.warn('IndexedDB upgrade blocked — another tab has the database open.');
        this.showNotification?.('Please close other tabs running this app, then refresh.', 'error');
      };
      request.onsuccess = event => {
        this.db = event.target.result;
        this.db.onversionchange = () => {
          this.db.close();
          this.showNotification?.('App updated in another tab — please refresh this page.', 'info');
        };
        sessionStorage.removeItem('se_stale_recovery_attempted');
        resolve();
      };
      request.onupgradeneeded = event => {
        const db = event.target.result;
        const stores = [ {
          name: 'songLibrary',
          keyPath: 'id'
        }, {
          name: 'playlists',
          keyPath: 'id'
        }, {
          name: 'settings',
          keyPath: 'name'
        }, {
          name: 'recentlyPlayed',
          keyPath: 'type'
        }, {
          name: 'userSettings',
          keyPath: 'category'
        }, {
          name: 'listeningStats',
          keyPath: 'id'
        } ];
        stores.forEach(({name: name, keyPath: keyPath}) => {
          if (!db.objectStoreNames.contains(name)) {
            db.createObjectStore(name, {
              keyPath: keyPath
            });
          }
        });
      };
    });
  }
  async _recoverFromStaleCache() {
    if (sessionStorage.getItem('se_stale_recovery_attempted')) {
      console.error('Stale cache recovery already attempted this session; not looping again.');
      this._handleInitializationError(new Error('VersionError persisted after recovery'));
      return;
    }
    sessionStorage.setItem('se_stale_recovery_attempted', '1');
    try {
      if ('caches' in window) {
        const names = await caches.keys();
        await Promise.all(names.filter(n => n.startsWith('se-cache-')).map(n => caches.delete(n)));
      }
    } catch (error) {
      console.warn('Cache cleanup during recovery failed:', error);
    }
    location.reload();
  }
  initializeElements() {
    this.elements = {
      songNameInput: document.getElementById('songName'),
      songAuthorInput: document.getElementById('songAuthor'),
      songUrlInput: document.getElementById('songUrl'),
      addSongBtn: document.getElementById('addSongBtn'),
      songLibrary: document.getElementById('songLibrary'),
      librarySearch: document.getElementById('librarySearch'),
      toggleControlBarBtn: document.getElementById('toggleControlBarBtn'),
      additionalDetails: document.getElementById('additionalDetails'),
      newPlaylistName: document.getElementById('newPlaylistName'),
      createPlaylistBtn: document.getElementById('createPlaylistBtn'),
      playlistContainer: document.getElementById('playlistContainer'),
      timeDisplay: document.getElementById('timeDisplay'),
      playlistEditModal: document.getElementById('playlistEditModal'),
      closePlaylistModalBtn: document.getElementById('closePlaylistModal'),
      currentPlaylistName: document.getElementById('currentPlaylistName'),
      searchSongsToAdd: document.getElementById('searchSongsToAdd'),
      librarySearchResults: document.getElementById('librarySearchResults'),
      libTopicBtn: document.getElementById('libTopicBtn'),
      currentPlaylistSongs: document.getElementById('currentPlaylistSongs'),
      playlistTotalDuration: document.getElementById('playlistTotalDuration'),
      loopPlaylistBtn: document.getElementById('loopPlaylistBtn'),
      autoplayBtn: document.getElementById('autoplayBtn'),
      playlistSongsModal: document.getElementById('playlistSongsModal'),
      playlistSongsContent: document.getElementById('playlistSongsContent'),
      addSongToPlaylistBtn: document.getElementById('addSongToPlaylistBtn'),
      playlistSelectionForSong: document.getElementById('playlistSelectionForSong'),
      importLibraryBtn: document.getElementById('importLibraryBtn'),
      exportLibraryBtn: document.getElementById('exportLibraryBtn'),
      modifyLibraryBtn: document.getElementById('modifyLibraryBtn'),
      libraryModificationModal: document.getElementById('libraryModificationModal'),
      closeLibraryModalBtn: document.getElementById('closeLibraryModal'),
      libraryModificationTabAddSong: document.getElementById('libraryModificationTabAddSong'),
      libraryModificationTabImportExport: document.getElementById('libraryModificationTabImportExport'),
      libraryModificationAddSongSection: document.querySelector('.add-song-section'),
      libraryModificationImportExportSection: document.querySelector('.import-export-section'),
      progressBar: document.getElementById('musicProgressBar'),
      currentSongName: document.getElementById('currentSongName'),
      nextSongName: document.getElementById('nextSongName'),
      playPauseBtn: document.getElementById('playPauseBtn'),
      prevBtn: document.getElementById('prevBtn'),
      nextBtn: document.getElementById('nextBtn'),
      loopBtn: document.getElementById('loopBtn'),
      showPlaylistBtn: document.getElementById('showPlaylistBtn'),
      volumeSlider: document.getElementById('volumeSlider'),
      currentPlaylistSidebar: document.getElementById('currentPlaylistSidebar'),
      sidebarPlaylistName: document.getElementById('sidebarPlaylistName'),
      sidebarPlaylistSongs: document.getElementById('sidebarPlaylistSongs'),
      closeSidebarBtn: document.getElementById('closeSidebarBtn'),
      sidebarModeToggleBtn: document.getElementById('sidebarModeToggleBtn'),
      sidebarSearchInput: document.getElementById('sidebarSearchInput'),
      youtubeSearchSuggestion: document.getElementById('youtubeSearchSuggestion'),
      listeningTimeDisplay: document.getElementById('listeningTime'),
      speedBtn: document.getElementById('speedBtn'),
      speedOptions: document.getElementById('speedOptions'),
      tabs: document.querySelectorAll('.tab'),
      tabPanes: document.querySelectorAll('.tab-pane'),
      themeToggle: document.getElementById('themeToggle'),
      lyricsTab: document.querySelector('.tab[data-tab="lyrics"]'),
      lyricsPane: document.getElementById('lyrics'),
      autofillBtn: document.getElementById('autofillBtn'),
      settingsButton: document.getElementById('settingsButton'),
      settingsModal: document.getElementById('settingsModal'),
      settingsCloseBtn: document.getElementById('settingsCloseBtn'),
      settingsContent: document.getElementById('settingsContent'),
      themeMode: document.getElementById('themeMode'),
      customThemeSection: document.getElementById('customThemeSection'),
      primaryColorPicker: document.getElementById('primaryColorPicker'),
      backgroundColorPicker: document.getElementById('backgroundColorPicker'),
      saveCustomTheme: document.getElementById('saveCustomTheme'),
      secondaryColorPicker: document.getElementById('secondaryColorPicker'),
      textPrimaryColorPicker: document.getElementById('textPrimaryColorPicker'),
      textSecondaryColorPicker: document.getElementById('textSecondaryColorPicker'),
      hoverColorPicker: document.getElementById('hoverColorPicker'),
      borderColorPicker: document.getElementById('borderColorPicker'),
      accentColorPicker: document.getElementById('accentColorPicker'),
      themeImportText: document.getElementById('themeImportText'),
      buttonTextColorPicker: document.getElementById('buttonTextColorPicker'),
      shadowColorPicker: document.getElementById('shadowColorPicker'),
      shadowOpacity: document.getElementById('shadowOpacity'),
      errorColorPicker: document.getElementById('errorColorPicker'),
      errorHoverColorPicker: document.getElementById('errorHoverColorPicker'),
      youtubeRedColorPicker: document.getElementById('youtubeRedColorPicker'),
      adsToggle: document.getElementById('adsToggle'),
      recentlyPlayedStorageLimit: document.getElementById('recentlyPlayedStorageLimit'),
      recentlyPlayedDisplayLimit: document.getElementById('recentlyPlayedDisplayLimit'),
      suggestedSongsDisplayLimit: document.getElementById('suggestedSongsDisplayLimit'),
      yourPicksDisplayLimit: document.getElementById('yourPicksDisplayLimit'),
      recentlyPlayedPlaylistsLimit: document.getElementById('recentlyPlayedPlaylistsLimit'),
      saveDiscoverMoreSettings: document.getElementById('saveDiscoverMoreSettings'),
      discordButton: document.getElementById('discordButton'),
      visualizerToggle: document.getElementById('visualizerToggle'),
      autoMiniplayerToggle: document.getElementById('autoMiniplayerToggle'),
      findSongsBtn: document.getElementById('findSongsBtn'),
      closeFindSongs: document.getElementById('closeFindSongs'),
      findSongsDiv: document.getElementById('findSongsDiv'),
      librarySortToggle: document.getElementById('librarySortToggle'),
      libraryReverseToggle: document.getElementById('libraryReverseToggle'),
      aiImportGlobalBtn: document.getElementById('aiImportGlobalBtn'),
      importModal: document.getElementById('importModal'),
      closeImportModalBtn: document.getElementById('closeImportModal'),
      importSongsBtn: document.getElementById('importSongsBtn'),
      importSongsTextarea: document.getElementById('importSongsTextarea'),
      playlistSearch: document.getElementById('playlistSearch'),
      toggleCreatePlaylistBtn: document.getElementById('toggleCreatePlaylistBtn'),
      createPlaylistDiv: document.getElementById('createPlaylistDiv'),
      togglePlaylistEditModeBtn: document.getElementById('togglePlaylistEditModeBtn'),
      libraryOptionsDropdown: document.getElementById('libraryOptionsDropdown'),
      switchLangBtn: document.getElementById('switchLangBtn'),
      transcriptLangSelect: document.getElementById('transcriptLangSelect'),
      statsButton: document.getElementById('statsButton'),
      lsPanel: document.getElementById('lsPanel'),
      lsRangeToggle: document.getElementById('lsRangeToggle'),
      listeningStatsToggle: document.getElementById('listeningStatsToggle')
    };
    this._setupSpeedButton();
    this._setupLibraryModificationModalTabs();
    this._checkControlBarVisibility();
  }
  _setupSpeedButton() {
    if (this.elements.speedBtn) {
      this.elements.speedBtn.textContent = this.currentSpeed + 'x';
    }
  }
  _setupLibraryModificationModalTabs() {
    if (!this.elements.libraryModificationTabAddSong || !this.elements.libraryModificationTabImportExport) {
      return;
    }
    this.switchLibraryModificationTab('addSong');
  }
  switchLibraryModificationTab(tabName) {
    if (tabName === 'addSong') {
      this.elements.libraryModificationTabAddSong?.classList.add('active');
      this.elements.libraryModificationTabImportExport?.classList.remove('active');
      if (this.elements.libraryModificationAddSongSection) {
        this.elements.libraryModificationAddSongSection.style.display = 'block';
      }
      if (this.elements.libraryModificationImportExportSection) {
        this.elements.libraryModificationImportExportSection.style.display = 'none';
      }
    } else if (tabName === 'importExport') {
      this.elements.libraryModificationTabAddSong?.classList.remove('active');
      this.elements.libraryModificationTabImportExport?.classList.add('active');
      if (this.elements.libraryModificationAddSongSection) {
        this.elements.libraryModificationAddSongSection.style.display = 'none';
      }
      if (this.elements.libraryModificationImportExportSection) {
        this.elements.libraryModificationImportExportSection.style.display = 'block';
      }
    }
  }
  _checkControlBarVisibility() {
    const controlBarVisible = localStorage.getItem('controlBarVisible');
    if (controlBarVisible === 'false') {
      const controlBarContainer = document.querySelector('.player-controls')?.closest('.player-container');
      const targetElement = controlBarContainer || document.querySelector('.player-controls')?.parentElement;
      const layoutToggleBtn = document.querySelector('.layout-toggle-button');
      if (targetElement) {
        targetElement.style.cssText = 'visibility:hidden;position:absolute;pointer-events:none;';
      }
      if (layoutToggleBtn && !targetElement?.contains(layoutToggleBtn)) {
        layoutToggleBtn.style.cssText = 'visibility:visible;position:;pointer-events:auto;';
      }
    }
  }
  setupEventListeners() {
    const handlers = {
      addSong: this.addSongToLibrary.bind(this),
      filterLibrary: this.filterLibrarySongs.bind(this),
      createPlaylist: this.createPlaylist.bind(this),
      closePlaylistModal: this.closePlaylistModal.bind(this),
      searchSongsToAdd: this.searchSongsToAddToPlaylist.bind(this),
      addSongToPlaylist: this.addSongToSelectedPlaylist.bind(this),
      seekMusic: this.seekMusic.bind(this),
      togglePlayPause: this.togglePlayPause.bind(this),
      playPrevious: this.playPreviousSong.bind(this),
      playNext: this.playNextSong.bind(this),
      toggleLoop: this.toggleLoop.bind(this),
      volumeChange: e => this.setVolume(e.target.value),
      toggleSidebar: this.togglePlaylistSidebar.bind(this),
      toggleAutoplay: this.toggleAutoplay.bind(this),
      openLibraryModal: this.openLibraryModal.bind(this),
      closeLibraryModal: this.closeLibraryModal.bind(this),
      libraryModificationTabAddSongClick: () => this.switchLibraryModificationTab('addSong'),
      libraryModificationTabImportExportClick: () => this.switchLibraryModificationTab('importExport'),
      toggleControlBar: this.toggleControlBar.bind(this),
      toggleTheme: this.toggleTheme.bind(this),
      toggleSpeedOptions: this.toggleSpeedOptions.bind(this),
      speedOptionClick: e => this.setPlaybackSpeed(parseFloat(e.target.dataset.speed)),
      importLibrary: this.showImportModal.bind(this),
      exportLibrary: this.exportLibrary.bind(this),
      togglePlaylistLoop: this.togglePlaylistLoop.bind(this),
      songUrlInput: this.validateYouTubeUrl.bind(this),
      songNameRightClick: this.handleSongNameRightClick.bind(this),
      togglePlaylistEditMode: this.togglePlaylistEditMode.bind(this),
      closeImportModal: this.closeImportModal.bind(this),
      importSongs: () => {
        this.importLibrary(this.elements.importSongsTextarea.value);
        this.closeImportModal();
      },
      discordClick: () => this.openDiscordModal(),
      librarySortToggle: this.handleLibrarySortToggle.bind(this),
      libraryReverseToggle: this.handleLibraryReverseToggle.bind(this),
      filterPlaylists: this.filterPlaylists.bind(this),
      playlistSearchEnter: e => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.playTopPlaylistSearchResult();
        }
      },
      toggleCreatePlaylistDiv: this.toggleCreatePlaylistDiv.bind(this),
      openSettings: this.handleOpenSettings.bind(this),
      closeSettings: this.handleCloseSettings.bind(this),
      settingsModalClick: this.handleSettingsModalClick.bind(this),
      themeModeChange: this.handleThemeModeChange.bind(this),
      saveCustomTheme: this.handleSaveCustomTheme.bind(this),
      adsToggle: this.handleAdsToggle.bind(this),
      toggleTopicKeyword: this.toggleTopicKeyword.bind(this),
      librarySearchKeydown: async e => {
        if (e.key === 'Enter') {
          const searchTerm = this.elements.librarySearch.value.trim();
          const videoId = this.extractYouTubeId(searchTerm);
          if (videoId && this.elements.youtubeSearchSuggestion.style.display !== 'none') {
            this.autofillFromUrl(searchTerm);
            return;
          }
          const visibleSongs = this.elements.songLibrary.querySelectorAll('.song-item');
          if (visibleSongs.length > 0) {
            this.playFirstVisibleSong();
          } else if (searchTerm) {
            try {
              const {items: items, nextPageToken: nextPageToken} = await this.searchYouTubeForLibraryMatches(searchTerm);
              if (items.length > 0) {
                this.renderYouTubeLibrarySearchResults(items, searchTerm, nextPageToken);
              } else {
                this.showYouTubeSearchSuggestion(searchTerm);
              }
            } catch (error) {
              console.error('YouTube search failed:', error);
              this.showYouTubeSearchSuggestion(searchTerm);
            }
          }
        }
      },
      songUrlKeydown: e => {
        if (e.key === 'Enter') {
          this.addSongToLibrary();
        }
      },
      newPlaylistNameKeydown: e => {
        if (e.key === 'Enter') {
          this.createPlaylist();
        }
      },
      songUrlPaste: () => {
        setTimeout(() => this.handleUrlPaste(), 10);
      },
      urlPasteInput: this.handleUrlPaste.bind(this),
      autofillClick: this.handleAutofill.bind(this),
      autofillMouseenter: this.showGhostPreview.bind(this),
      autofillMouseleave: this.removeGhostPreview.bind(this),
      findSongsOpen: this.openFindSongs.bind(this),
      findSongsClose: this.closeFindSongs.bind(this),
      librarySearchInput: this.handleLibrarySearchInput.bind(this),
      saveDiscoverMoreSettings: this.handleSaveDiscoverMoreSettings.bind(this),
      refreshRandomRecommendations: () => this.refreshRandomRecommendations(),
      visualizerToggle: e => this.handleVisualizerToggle(e),
      autoMiniplayerToggle: e => this.handleAutoMiniplayerToggle(e)
    };
    const simpleBindings = [ [ this.elements.addSongBtn, 'click', handlers.addSong ], [ this.elements.createPlaylistBtn, 'click', handlers.createPlaylist ], [ this.elements.closePlaylistModalBtn, 'click', handlers.closePlaylistModal ], [ this.elements.addSongToPlaylistBtn, 'click', handlers.addSongToPlaylist ], [ this.elements.playPauseBtn, 'click', handlers.togglePlayPause ], [ this.elements.prevBtn, 'click', handlers.playPrevious ], [ this.elements.nextBtn, 'click', handlers.playNext ], [ this.elements.loopBtn, 'click', handlers.toggleLoop ], [ this.elements.showPlaylistBtn, 'click', handlers.toggleSidebar ], [ this.elements.closeSidebarBtn, 'click', handlers.toggleSidebar ], [ this.elements.themeToggle, 'click', handlers.toggleTheme ], [ this.elements.autoplayBtn, 'click', handlers.toggleAutoplay ], [ this.elements.speedBtn, 'click', handlers.toggleSpeedOptions ], [ this.elements.volumeSlider, 'input', handlers.volumeChange ], [ this.elements.progressBar, 'click', handlers.seekMusic ], [ this.elements.currentSongName, 'contextmenu', handlers.songNameRightClick ], [ this.elements.toggleControlBarBtn, 'click', handlers.toggleControlBar ], [ this.elements.modifyLibraryBtn, 'click', handlers.openLibraryModal ], [ this.elements.closeLibraryModalBtn, 'click', handlers.closeLibraryModal ], [ this.elements.importLibraryBtn, 'click', handlers.importLibrary ], [ this.elements.exportLibraryBtn, 'click', handlers.exportLibrary ], [ this.elements.libraryModificationTabAddSong, 'click', handlers.libraryModificationTabAddSongClick ], [ this.elements.libraryModificationTabImportExport, 'click', handlers.libraryModificationTabImportExportClick ], [ this.elements.loopPlaylistBtn, 'click', handlers.togglePlaylistLoop ], [ this.elements.discordButton, 'click', handlers.discordClick ], [ this.elements.librarySortToggle, 'change', handlers.librarySortToggle ], [ this.elements.libraryReverseToggle, 'change', handlers.libraryReverseToggle ], [ this.elements.closeImportModalBtn, 'click', handlers.closeImportModal ], [ this.elements.importSongsBtn, 'click', handlers.importSongs ], [ this.elements.playlistSearch, 'input', handlers.filterPlaylists ], [ this.elements.playlistSearch, 'keypress', handlers.playlistSearchEnter ], [ this.elements.toggleCreatePlaylistBtn, 'click', handlers.toggleCreatePlaylistDiv ], [ this.elements.togglePlaylistEditModeBtn, 'click', handlers.togglePlaylistEditMode ], [ this.elements.settingsButton, 'click', handlers.openSettings ], [ this.elements.settingsCloseBtn, 'click', handlers.closeSettings ], [ this.elements.settingsModal, 'click', handlers.settingsModalClick ], [ this.elements.themeMode, 'change', handlers.themeModeChange ], [ this.elements.saveCustomTheme, 'click', handlers.saveCustomTheme ], [ this.elements.adsToggle, 'change', handlers.adsToggle ], [ this.elements.saveDiscoverMoreSettings, 'click', handlers.saveDiscoverMoreSettings ], [ this.elements.visualizerToggle, 'change', handlers.visualizerToggle ], [ this.elements.autoMiniplayerToggle, 'change', handlers.autoMiniplayerToggle ], [ this.elements.findSongsBtn, 'click', handlers.findSongsOpen ], [ this.elements.closeFindSongs, 'click', handlers.findSongsClose ], [ this.elements.searchSongsToAdd, 'input', handlers.searchSongsToAdd ], [ this.elements.statsButton, 'click', this.openStatsModal.bind(this) ], [ this.elements.lsPanel, 'click', this._handleStatsShowAllClick.bind(this) ], [ this.elements.lsPanel, 'input', this._handleStatsSearchInput.bind(this) ], [ document.getElementById('lsCloseBtn'), 'click', this.closeStatsModal.bind(this) ], [ this.elements.lsRangeToggle, 'change', this._handleStatsRangeToggle.bind(this) ], [ this.elements.listeningStatsToggle, 'change', this.handleListeningStatsToggle.bind(this) ], [ this.elements.libTopicBtn, 'click', handlers.toggleTopicKeyword ] ];
    simpleBindings.forEach(([element, event, handler]) => {
      if (element) {
        element.addEventListener(event, handler);
      }
    });
    if (this.elements.librarySearch) {
      this.elements.librarySearch.addEventListener('input', handlers.librarySearchInput);
      this.elements.librarySearch.addEventListener('keydown', handlers.librarySearchKeydown);
      this.elements.librarySearch.addEventListener('focus', () => this.resetLibrarySearchTimeout());
      this.elements.librarySearch.addEventListener('blur', () => {
        clearTimeout(this.librarySearchTimeout);
        this.librarySearchTimeout = null;
      });
    }
    if (this.elements.songUrlInput) {
      this.elements.songUrlInput.addEventListener('input', handlers.songUrlInput);
      this.elements.songUrlInput.addEventListener('keydown', handlers.songUrlKeydown);
      this.elements.songUrlInput.addEventListener('paste', handlers.songUrlPaste);
      this.elements.songUrlInput.addEventListener('input', handlers.urlPasteInput);
    }
    if (this.elements.newPlaylistName) {
      this.elements.newPlaylistName.addEventListener('keydown', handlers.newPlaylistNameKeydown);
    }
    if (this.elements.autofillBtn) {
      this.elements.autofillBtn.addEventListener('click', handlers.autofillClick);
      this.elements.autofillBtn.addEventListener('mouseenter', e => {
        this.isAutofillButtonHovered = true;
        handlers.autofillMouseenter(e);
      });
      this.elements.autofillBtn.addEventListener('mouseleave', () => {
        this.isAutofillButtonHovered = false;
        handlers.autofillMouseleave();
      });
    }
    this.elements.additionalDetails.addEventListener('click', e => {
      if (e.target.closest('#currentSongSection') && !window.getSelection().toString()) {
        this.switchTab('nowplaying');
      }
    });
    const currentSongName = document.getElementById('currentSongName');
    if (currentSongName) {
      currentSongName.style.cursor = 'pointer';
      currentSongName.title = 'Right-click to copy song name';
    }
    document.querySelectorAll('.speed-option').forEach(opt => {
      opt.addEventListener('click', handlers.speedOptionClick);
    });
    if (this.elements.tabs) {
      this.elements.tabs.forEach(tab => {
        tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
      });
    }
    const refreshBtn = document.getElementById('refreshRandomBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', handlers.refreshRandomRecommendations);
    }
    this.elements.switchLangBtn?.addEventListener('click', () => {
      this.elements.transcriptLangSelect.focus();
      this.elements.transcriptLangSelect.click();
    });
    this.elements.transcriptLangSelect?.addEventListener('change', e => {
      if (e.target.value !== 'auto') {
        this.autoFetchTranscript();
      }
    });
    document.getElementById('closeDiscordModal')?.addEventListener('click', () => this.closeDiscordModal());
    document.getElementById('discordCloseBtn2')?.addEventListener('click', () => this.closeDiscordModal());
    document.getElementById('discordDisableBtn')?.addEventListener('click', () => {
      this.discordEnabled = false;
      this.saveDiscordSettings();
      this.closeDiscordConnection();
      this._discordRefreshModal();
    });
    document.getElementById('discordConnectBtn')?.addEventListener('click', () => {
      this.discordEnabled = true;
      this.saveDiscordSettings();
      this.initDiscordConnection();
      this._discordRefreshModal();
    });
    document.getElementById('discordRetryBtn')?.addEventListener('click', () => {
      this.discordEnabled = true;
      this.saveDiscordSettings();
      this.initDiscordConnection();
      this._discordRefreshModal();
    });
    document.getElementById('discordEnabledToggle')?.addEventListener('change', e => {
      this.discordEnabled = e.target.checked;
      this.saveDiscordSettings();
      this.discordEnabled ? this.initDiscordConnection() : this.closeDiscordConnection();
      this._discordRefreshModal();
    });
    document.getElementById('discordResetBtn')?.addEventListener('click', () => this._discordResetFields());
    document.getElementById('discordSendNowBtn')?.addEventListener('click', () => this._discordSendNow());
    document.getElementById('discordRpcModal')?.addEventListener('click', e => {
      if (e.target.id === 'discordRpcModal') {
        this.closeDiscordModal();
      }
    });
    document.getElementById('discordRetryBtn')?.addEventListener('click', () => {
      this._discordRetry();
    });
    document.getElementById('discordConnectBtn')?.addEventListener('click', () => {
      this._discordRetry();
    });
    [ 'discordEditSong', 'discordEditArtist', 'discordEditThumb' ].forEach(id => {
      document.getElementById(id)?.addEventListener('input', () => this._discordOnFieldEdit());
    });
    this._setupDelegatedListeners();
    this.initializeCurrentSongSection();
    this.addQueueStyles();
    this.setupTimerEventListeners();
    this.setupLayoutEventListeners();
    this.setupExportButtonListeners();
    this.setupSongLibraryDelegation();
  }
  _setupDelegatedListeners() {
    document.addEventListener('click', e => {
      if (e.target.classList.contains('keybind-input')) {
        const action = e.target.dataset.action;
        this.startKeybindRecording(action, e.target);
      }
      if (e.target.id === 'resetKeybindsBtn') {
        this.resetKeybindsToDefault();
      }
      if (e.target.closest('.settings-tab-btn')) {
        this.handleTabSwitch(e);
      }
    });
    document.addEventListener('contextmenu', e => {
      if (e.target.classList.contains('play-btn') || e.target.closest('.play-btn') || e.target.onclick?.toString().includes('playSong') || e.target.onclick?.toString().includes('playPlaylist')) {
        e.preventDefault();
        const songElement = e.target.closest('[data-song-id]') || e.target.closest('[data-playlist-id]');
        if (songElement?.dataset.songId) {
          const song = this.songLibrary.find(s => s.id == songElement.dataset.songId);
          if (song) {
            this.addToQueue(song);
          }
        } else if (songElement?.dataset.playlistId) {
          const playlist = this.playlists.find(p => p.id == songElement.dataset.playlistId);
          if (playlist) {
            playlist.songs.forEach(song => this.addToQueue(song));
          }
        } else {
          const onclickStr = e.target.onclick?.toString() || e.target.closest('button')?.onclick?.toString();
          if (onclickStr) {
            const songIdMatch = onclickStr.match(/playSong\((\d+)\)/);
            const playlistIdMatch = onclickStr.match(/playPlaylist\((\d+)\)/);
            if (songIdMatch) {
              const song = this.songLibrary.find(s => s.id == parseInt(songIdMatch[1]));
              if (song) {
                this.addToQueue(song);
              }
            } else if (playlistIdMatch) {
              const playlist = this.playlists.find(p => p.id == parseInt(playlistIdMatch[1]));
              if (playlist) {
                playlist.songs.forEach(song => this.addToQueue(song));
              }
            }
          }
        }
      }
    });
  }
  setupKeyboardControls() {
    document.addEventListener('keydown', e => {
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }
      if (document.activeElement.tagName === 'INPUT') {
        const inputType = document.activeElement.type;
        if (inputType !== 'range' && inputType !== 'checkbox' && inputType !== 'radio') {
          return;
        }
      }
      if (document.activeElement.tagName === 'TEXTAREA' || document.activeElement.isContentEditable) {
        return;
      }
      if (e.key?.toLowerCase() === 'n' && this.currentKeybinds.toggleWebEmbed === 'KeyN') {
        if (e.shiftKey) {
          this.cycleWebEmbedSite();
        } else {
          this.toggleWebEmbedOverlay();
        }
        return;
      }
      const preventDefaultCodes = Object.values(this.currentKeybinds);
      if (preventDefaultCodes.includes(e.code)) {
        e.preventDefault();
      }
      this.handleKeybind(e.code);
    });
  }
  renderInitialState() {
    this.renderPlaylists();
    this.renderLibraryView();
    this.updatePlaylistSelection();
    this.updateListeningTimeDisplay();
    this.renderAdditionalDetails();
    document.title = 'Music';
    this.elements.speedBtn.textContent = this.currentSpeed + 'x';
    const controlBarVisible = localStorage.getItem('controlBarVisible');
    const spacerDiv = document.getElementById('controlBarSpacer');
    if (controlBarVisible === 'false') {
      requestAnimationFrame(() => {
        const controlBar = document.querySelector('.player-controls').closest('.player-container') || document.querySelector('.player-controls').parentElement;
        if (controlBar) {
          controlBar.style.visibility = 'hidden';
          controlBar.style.position = 'absolute';
          controlBar.style.pointerEvents = 'none';
        }
        if (spacerDiv) {
          spacerDiv.style.display = 'none';
        }
      });
    } else {
      if (spacerDiv) {
        spacerDiv.style.display = 'block';
      }
    }
    this.updateDiscordButtonUI();
    if (this.discordEnabled) {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => this.initDiscordConnection(), {
          timeout: 2e3
        });
      } else {
        setTimeout(() => this.initDiscordConnection(), 1500);
      }
    }
    this.initializeVisibilityTracking();
  }
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func.apply(this, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  loadSettings() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }
      try {
        const transaction = this.db.transaction([ 'settings' ], 'readonly');
        const store = transaction.objectStore('settings');
        const settingsToLoad = [ {
          key: 'listeningTime',
          default: 0,
          target: 'listeningTime'
        }, {
          key: 'playbackSpeed',
          default: 1,
          target: 'currentSpeed'
        }, {
          key: 'isPlaylistLooping',
          default: true,
          target: 'isPlaylistLooping'
        }, {
          key: 'recentlyPlayedLimit',
          default: 20,
          target: 'recentlyPlayedLimit'
        }, {
          key: 'allowDuplicates',
          default: true,
          target: 'allowDuplicates'
        }, {
          key: 'volume',
          default: 100,
          target: 'savedVolume'
        }, {
          key: 'isLooping',
          default: false,
          target: 'isLooping'
        }, {
          key: 'listeningStatsEnabled',
          default: false,
          target: 'listeningStatsEnabled'
        }, {
          key: 'autoMiniplayerEnabled',
          default: false,
          target: 'autoMiniplayerEnabled'
        } ];
        settingsToLoad.forEach(setting => {
          const request = store.get(setting.key);
          request.onsuccess = () => {
            if (request.result) {
              this[setting.target] = request.result.value ?? setting.default;
            } else {
              this[setting.target] = setting.default;
            }
          };
          request.onerror = () => {
            console.warn(`Failed to load setting: ${setting.key}, using default value`);
            this[setting.target] = setting.default;
          };
        });
        transaction.oncomplete = () => resolve();
        transaction.onerror = event => {
          console.error('Error loading settings:', event.target.error);
          reject('Could not load settings');
        };
      } catch (error) {
        console.error('Error in loadSettings:', error);
        reject('Exception in loadSettings');
      }
    });
  }
  async saveSetting(key, value) {
    if (!this.db) {
      return;
    }
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([ 'settings' ], 'readwrite');
      const store = transaction.objectStore('settings');
      const request = store.put({
        name: key,
        value: value
      });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
  loadSongLibrary() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }
      const transaction = this.db.transaction([ 'songLibrary' ], 'readonly');
      const store = transaction.objectStore('songLibrary');
      const request = store.getAll();
      request.onsuccess = () => {
        const raw = request.result || [];
        const needsMigration = raw.some(song => song.favorite === undefined || song.lyrics === undefined || song.author === undefined);
        this.songLibrary = raw.map(song => {
          if (song.favorite === undefined) {
            song.favorite = false;
          }
          if (song.lyrics === undefined) {
            song.lyrics = '';
          }
          if (song.author === undefined) {
            song.author = '';
          }
          return song;
        });
        if (needsMigration) {
          this.saveSongLibrary().then(resolve).catch(reject);
        } else {
          resolve();
        }
      };
      request.onerror = event => {
        console.error('Error loading song library:', event.target.error);
        reject('Could not load song library');
      };
    });
  }
  saveSongLibrary(singleSong = null) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      try {
        const transaction = this.db.transaction([ 'songLibrary' ], 'readwrite');
        const store = transaction.objectStore('songLibrary');
        if (singleSong) {
          store.put(singleSong);
        } else {
          const clearRequest = store.clear();
          clearRequest.onsuccess = () => {
            this.songLibrary.forEach(song => store.put(song));
          };
        }
        transaction.oncomplete = () => {
          if (!singleSong) {
            console.log(`Saved ${this.songLibrary.length} songs to library`);
          }
          resolve();
        };
        transaction.onerror = event => {
          console.error('Error saving song library:', event.target.error);
          reject(new Error('Failed to save song library: ' + event.target.error.message));
        };
      } catch (error) {
        console.error('Exception in saveSongLibrary:', error);
        reject(error);
      }
    });
  }
  saveSingleSong(song) {
    console.log(`%csaveSingleSong → 1 record: "${song?.name}"`, 'color:#4caf50;font-weight:bold');
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      try {
        const transaction = this.db.transaction([ 'songLibrary' ], 'readwrite');
        transaction.objectStore('songLibrary').put(song);
        transaction.oncomplete = () => resolve();
        transaction.onerror = e => reject(new Error('Failed to save song: ' + e.target.error.message));
      } catch (error) {
        reject(error);
      }
    });
  }
  deleteSingleSong(songId) {
    console.log(`%cdeleteSingleSong → 1 record: "${songId}"`, 'color:#e53935;font-weight:bold');
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      try {
        const transaction = this.db.transaction([ 'songLibrary' ], 'readwrite');
        transaction.objectStore('songLibrary').delete(songId);
        transaction.oncomplete = () => resolve();
        transaction.onerror = e => reject(new Error('Failed to delete song: ' + e.target.error.message));
      } catch (error) {
        reject(error);
      }
    });
  }
  loadPlaylists() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }
      const transaction = this.db.transaction([ 'playlists' ], 'readonly');
      const store = transaction.objectStore('playlists');
      const request = store.getAll();
      request.onsuccess = () => {
        this.playlists = request.result || [];
        this.filteredPlaylists = [ ...this.playlists ];
        this.syncFavoritesOnLoad().then(() => resolve()).catch(error => {
          console.error('Error syncing favorites playlist:', error);
          resolve();
        });
      };
      request.onerror = event => {
        console.error('Error loading playlists:', event.target.error);
        reject('Could not load playlists');
      };
    });
  }
  savePlaylists() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      const transaction = this.db.transaction([ 'playlists' ], 'readwrite');
      const store = transaction.objectStore('playlists');
      store.clear();
      this.playlists.forEach(playlist => {
        store.put(playlist);
      });
      transaction.oncomplete = () => resolve();
      transaction.onerror = event => {
        console.error('Error saving playlists:', event.target.error);
        reject(new Error('Could not save playlists: ' + event.target.error.message));
      };
    });
  }
  loadRecentlyPlayed() {
    return new Promise(resolve => {
      if (!this.db) {
        console.warn('Database not initialized for recently played');
        this.recentlyPlayedSongs = [];
        this.recentlyPlayedPlaylists = [];
        resolve();
        return;
      }
      try {
        const transaction = this.db.transaction([ 'recentlyPlayed' ], 'readonly');
        const store = transaction.objectStore('recentlyPlayed');
        const songsRequest = store.get('songs');
        songsRequest.onsuccess = () => {
          if (songsRequest.result && Array.isArray(songsRequest.result.items)) {
            this.recentlyPlayedSongs = songsRequest.result.items;
          } else {
            this.recentlyPlayedSongs = [];
          }
        };
        const playlistsRequest = store.get('playlists');
        playlistsRequest.onsuccess = () => {
          if (playlistsRequest.result && Array.isArray(playlistsRequest.result.items)) {
            this.recentlyPlayedPlaylists = playlistsRequest.result.items;
          } else {
            this.recentlyPlayedPlaylists = [];
          }
        };
        transaction.oncomplete = () => {
          console.log('Successfully loaded recently played items:', {
            songs: this.recentlyPlayedSongs.length,
            playlists: this.recentlyPlayedPlaylists.length
          });
          resolve();
        };
        transaction.onerror = event => {
          console.warn('Error loading recently played items:', event.target.error);
          this.recentlyPlayedSongs = [];
          this.recentlyPlayedPlaylists = [];
          resolve();
        };
      } catch (error) {
        console.warn('Error in loadRecentlyPlayed:', error);
        this.recentlyPlayedSongs = [];
        this.recentlyPlayedPlaylists = [];
        resolve();
      }
    });
  }
  async loadDiscoverMoreSettingsOnStartup() {
    try {
      if (!this.db || !this.db.objectStoreNames.contains('settings')) {
        this.setDefaultDiscoverMoreValuesOnStartup();
        return;
      }
      const transaction = this.db.transaction([ 'settings' ], 'readonly');
      const store = transaction.objectStore('settings');
      const settingKeys = [ 'recentlyPlayedLimit', 'recentlyPlayedDisplayLimit', 'suggestedSongsDisplayLimit', 'yourPicksDisplayLimit', 'recentlyPlayedPlaylistsDisplayLimit', 'sectionOrder' ];
      const requests = settingKeys.map(key => {
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
      const results = await Promise.all(requests);
      const defaultOrder = this._getDefaultSectionOrder().map(s => s.key);
      results.forEach(result => {
        switch (result.key) {
         case 'recentlyPlayedLimit':
          this.recentlyPlayedLimit = result.value || 20;
          break;

         case 'recentlyPlayedDisplayLimit':
          this.recentlyPlayedDisplayLimit = result.value ?? 3;
          break;

         case 'suggestedSongsDisplayLimit':
          this.suggestedSongsDisplayLimit = result.value ?? 2;
          break;

         case 'yourPicksDisplayLimit':
          this.yourPicksDisplayLimit = result.value ?? 2;
          break;

         case 'recentlyPlayedPlaylistsDisplayLimit':
          this.recentlyPlayedPlaylistsDisplayLimit = result.value ?? 1;
          break;

         case 'sectionOrder':
          this.sectionOrder = result.value || defaultOrder;
          break;
        }
      });
    } catch (error) {
      console.error('Error loading discover more settings on startup:', error);
      this.setDefaultDiscoverMoreValuesOnStartup();
    }
  }
  setDefaultDiscoverMoreValuesOnStartup() {
    this.recentlyPlayedLimit = this.recentlyPlayedLimit || 20;
    this.recentlyPlayedDisplayLimit = 4;
    this.suggestedSongsDisplayLimit = 0;
    this.yourPicksDisplayLimit = 0;
    this.recentlyPlayedPlaylistsDisplayLimit = 4;
    this.sectionOrder = this._getDefaultSectionOrder().map(s => s.key);
  }
  setDefaultDiscoverMoreValues() {
    this.recentlyPlayedLimit = this.recentlyPlayedLimit || 20;
    this.recentlyPlayedDisplayLimit = 4;
    this.suggestedSongsDisplayLimit = 0;
    this.yourPicksDisplayLimit = 0;
    this.recentlyPlayedPlaylistsDisplayLimit = 4;
    this.sectionOrder = this._getDefaultSectionOrder().map(s => s.key);
  }
  async loadDiscoverMoreSettings() {
    try {
      if (this.elements.recentlyPlayedStorageLimit) {
        this.elements.recentlyPlayedStorageLimit.value = this.recentlyPlayedLimit || 20;
      }
      this._renderSectionOrderUI();
    } catch (error) {
      console.error('Error syncing discover more settings with DOM:', error);
      this.setDefaultDiscoverMoreValues();
    }
  }
  async handleSaveDiscoverMoreSettings() {
    try {
      const recentlyPlayedStorageLimit = parseInt(this.elements.recentlyPlayedStorageLimit?.value) || 20;
      if (recentlyPlayedStorageLimit < 1 || recentlyPlayedStorageLimit > 100) {
        this.showNotification('Recently played storage limit must be between 1 and 100', 'error');
        return;
      }
      const defs = this._getDefaultSectionOrder();
      const newLimits = {};
      for (const def of defs) {
        const input = document.getElementById(`sectionLimit_${def.key}`);
        const val = input ? parseInt(input.value) : null;
        if (val === null || isNaN(val) || val < 0 || val > def.max) {
          this.showNotification(`"${def.label}" limit must be between 0 and ${def.max}`, 'error');
          return;
        }
        newLimits[def.limitKey] = val;
      }
      const oldRecentlyPlayedLimit = this.recentlyPlayedLimit;
      this.recentlyPlayedLimit = recentlyPlayedStorageLimit;
      this.recentlyPlayedDisplayLimit = newLimits['recentlyPlayedDisplayLimit'];
      this.suggestedSongsDisplayLimit = newLimits['suggestedSongsDisplayLimit'];
      this.yourPicksDisplayLimit = newLimits['yourPicksDisplayLimit'];
      this.recentlyPlayedPlaylistsDisplayLimit = newLimits['recentlyPlayedPlaylistsDisplayLimit'];
      await Promise.all([ this.saveSetting('recentlyPlayedLimit', recentlyPlayedStorageLimit), this.saveSetting('recentlyPlayedDisplayLimit', this.recentlyPlayedDisplayLimit), this.saveSetting('suggestedSongsDisplayLimit', this.suggestedSongsDisplayLimit), this.saveSetting('yourPicksDisplayLimit', this.yourPicksDisplayLimit), this.saveSetting('recentlyPlayedPlaylistsDisplayLimit', this.recentlyPlayedPlaylistsDisplayLimit), this.saveSetting('sectionOrder', this.sectionOrder) ]);
      if (oldRecentlyPlayedLimit !== recentlyPlayedStorageLimit && this.recentlyPlayedSongs.length > recentlyPlayedStorageLimit) {
        this.recentlyPlayedSongs = this.recentlyPlayedSongs.slice(0, recentlyPlayedStorageLimit);
        if (this.db) {
          const transaction = this.db.transaction([ 'recentlyPlayed' ], 'readwrite');
          const store = transaction.objectStore('recentlyPlayed');
          store.put({
            type: 'songs',
            items: this.recentlyPlayedSongs
          });
        }
      }
      this.renderAdditionalDetails();
      this.showNotification('Recommendation settings saved!', 'success');
    } catch (error) {
      console.error('Error saving Discover More settings:', error);
      this.showNotification('Error saving Discover More settings', 'error');
    }
  }
  _getDefaultSectionOrder() {
    return [ {
      key: 'recentlyListened',
      label: 'Recently Listened To',
      limitKey: 'recentlyPlayedDisplayLimit',
      max: 10,
      suffix: 'items'
    }, {
      key: 'suggested',
      label: 'Suggested',
      limitKey: 'suggestedSongsDisplayLimit',
      max: 10,
      suffix: 'songs'
    }, {
      key: 'yourPicks',
      label: 'Your Picks',
      limitKey: 'yourPicksDisplayLimit',
      max: 10,
      suffix: 'songs'
    }, {
      key: 'recentPlaylists',
      label: 'Recently Played Playlists',
      limitKey: 'recentlyPlayedPlaylistsDisplayLimit',
      max: 5,
      suffix: 'playlists'
    } ];
  }
  _renderSectionOrderUI() {
    const container = document.getElementById('sectionOrderList');
    if (!container) {
      return;
    }
    container.innerHTML = '';
    const defs = this._getDefaultSectionOrder();
    const order = this.sectionOrder || defs.map(s => s.key);
    order.forEach((key, index) => {
      const def = defs.find(d => d.key === key);
      if (!def) {
        return;
      }
      const currentLimit = this[def.limitKey] ?? 0;
      const row = document.createElement('div');
      row.className = 'section-order-row';
      row.dataset.key = key;
      const btns = document.createElement('div');
      btns.className = 'section-order-btns';
      const upBtn = document.createElement('button');
      upBtn.textContent = '▲';
      upBtn.disabled = index === 0;
      upBtn.addEventListener('click', () => {
        this._moveSectionOrderRow(key, -1);
      });
      const downBtn = document.createElement('button');
      downBtn.textContent = '▼';
      downBtn.disabled = index === order.length - 1;
      downBtn.addEventListener('click', () => {
        this._moveSectionOrderRow(key, 1);
      });
      btns.appendChild(upBtn);
      btns.appendChild(downBtn);
      const label = document.createElement('label');
      label.textContent = def.label;
      const input = document.createElement('input');
      input.type = 'number';
      input.min = 0;
      input.max = def.max;
      input.value = currentLimit;
      input.id = `sectionLimit_${key}`;
      input.className = 'section-limit-input';
      const suffix = document.createElement('span');
      suffix.className = 'input-suffix';
      suffix.textContent = def.suffix;
      row.appendChild(btns);
      row.appendChild(label);
      row.appendChild(input);
      row.appendChild(suffix);
      container.appendChild(row);
    });
  }
  _moveSectionOrderRow(key, direction) {
    const order = [ ...this.sectionOrder || this._getDefaultSectionOrder().map(s => s.key) ];
    const index = order.indexOf(key);
    if (index === -1) {
      return;
    }
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= order.length) {
      return;
    }
    [order[index], order[newIndex]] = [ order[newIndex], order[index] ];
    this.sectionOrder = order;
    this._renderSectionOrderUI();
  }
  loadLibrarySortValue() {
    return new Promise(resolve => {
      if (!this.db) {
        resolve();
        return;
      }
      const transaction = this.db.transaction([ 'settings' ], 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get('librarySortAlphabetically');
      request.onsuccess = () => {
        this.librarySortAlphabetically = request.result ? request.result.value : true;
        resolve();
      };
      request.onerror = () => {
        this.librarySortAlphabetically = true;
        resolve();
      };
    });
  }
  loadLibraryReverseValue() {
    return new Promise(resolve => {
      if (!this.db) {
        resolve();
        return;
      }
      const transaction = this.db.transaction([ 'settings' ], 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get('libraryReverseOrder');
      request.onsuccess = () => {
        this.libraryReverseOrder = request.result ? request.result.value : false;
        resolve();
      };
      request.onerror = () => {
        this.libraryReverseOrder = false;
        resolve();
      };
    });
  }
  loadVisualizerValue() {
    return new Promise(resolve => {
      if (!this.db) {
        resolve();
        return;
      }
      const transaction = this.db.transaction([ 'settings' ], 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get('visualizerEnabled');
      request.onsuccess = () => {
        this.visualizerEnabled = request.result ? request.result.value : true;
        resolve();
      };
      request.onerror = () => {
        this.visualizerEnabled = true;
        resolve();
      };
    });
  }
  loadLibrarySortSetting() {
    if (!this.db) {
      return;
    }
    const transaction = this.db.transaction([ 'settings' ], 'readonly');
    const store = transaction.objectStore('settings');
    const request = store.get('librarySortAlphabetically');
    request.onsuccess = () => {
      this.librarySortAlphabetically = request.result ? request.result.value : true;
      if (this.elements.librarySortToggle) {
        this.elements.librarySortToggle.checked = this.librarySortAlphabetically;
      }
      if (this.elements.songLibrary) {
        this.renderSongLibrary();
      }
    };
    request.onerror = () => {
      this.librarySortAlphabetically = true;
      if (this.elements.librarySortToggle) {
        this.elements.librarySortToggle.checked = true;
      }
    };
  }
  loadLibraryReverseSetting() {
    if (!this.db) {
      return;
    }
    const transaction = this.db.transaction([ 'settings' ], 'readonly');
    const store = transaction.objectStore('settings');
    const request = store.get('libraryReverseOrder');
    request.onsuccess = () => {
      this.libraryReverseOrder = request.result ? request.result.value : false;
      if (this.elements.libraryReverseToggle) {
        this.elements.libraryReverseToggle.checked = this.libraryReverseOrder;
      }
      if (this.elements.songLibrary) {
        this.renderSongLibrary();
      }
    };
    request.onerror = () => {
      this.libraryReverseOrder = false;
      if (this.elements.libraryReverseToggle) {
        this.elements.libraryReverseToggle.checked = false;
      }
    };
  }
  handleLibrarySortToggle(event) {
    this.librarySortAlphabetically = event.target.checked;
    this.renderSongLibrary();
    this.saveSetting('librarySortAlphabetically', this.librarySortAlphabetically);
  }
  handleLibraryReverseToggle(event) {
    this.libraryReverseOrder = event.target.checked;
    this.renderSongLibrary();
    this.saveSetting('libraryReverseOrder', this.libraryReverseOrder);
  }
  addSongToLibrary() {
    const songName = this.elements.songNameInput.value.trim();
    const songAuthor = this.elements.songAuthorInput.value.trim();
    const songUrl = this.elements.songUrlInput.value.trim();
    if (!songName || !songUrl) {
      alert('Please enter both song name and URL');
      return;
    }
    const videoId = this.extractYouTubeId(songUrl);
    if (!videoId) {
      alert('Invalid YouTube URL');
      return;
    }
    if (this.songLibrary.some(song => song.videoId === videoId)) {
      alert('This song is already in your library');
      return;
    }
    const newSong = {
      id: Date.now(),
      name: songName,
      author: songAuthor,
      videoId: videoId,
      favorite: false
    };
    this.songLibrary.push(newSong);
    this.saveSingleSong(newSong).then(() => {
      this.renderSongLibrary();
      this.updatePlaylistSelection();
      this.elements.songNameInput.value = '';
      this.elements.songAuthorInput.value = '';
      this.elements.songUrlInput.value = '';
      this.removeYouTubeThumbnailPreview();
      this.closeLibraryModal();
    }).catch(error => {
      console.error('Error adding song to library:', error);
      alert('Failed to save song. Please try again.');
    });
  }
  removeSong(songId) {
    const song = this.songLibrary.find(song => song.id === songId);
    if (!song) {
      return Promise.resolve();
    }
    const videoId = song.videoId;
    if (this.currentSong && this.currentSong.id === songId) {
      if (this.isLocalPlayback && this.localAudio) {
        this.localAudio.pause();
      } else if (this.ytPlayer) {
        this.ytPlayer.stopVideo();
      }
      this.isPlaying = false;
      this.isLocalPlayback = false;
      this.currentSong = null;
      this.updatePlayerUI();
    }
    this.recentlyPlayedSongs = this.recentlyPlayedSongs.filter(s => s.id !== songId);
    if (this.db) {
      const tx = this.db.transaction([ 'recentlyPlayed' ], 'readwrite');
      tx.objectStore('recentlyPlayed').put({
        type: 'songs',
        items: this.recentlyPlayedSongs
      });
    }
    this.songLibrary = this.songLibrary.filter(song => song.id !== songId);
    return this.deleteSingleSong(songId).then(() => {
      let favoritesPlaylist = this.playlists.find(p => p.name.toLowerCase() === 'favorites' || p.name.toLowerCase() === 'favourite' || p.name.toLowerCase() === 'favourite songs' || p.name.toLowerCase() === 'favorite songs');
      if (favoritesPlaylist) {
        const originalLength = favoritesPlaylist.songs.length;
        favoritesPlaylist.songs = favoritesPlaylist.songs.filter(s => s.videoId !== videoId);
        if (originalLength !== favoritesPlaylist.songs.length) {
          return this.savePlaylists();
        }
      }
      return Promise.resolve();
    }).then(() => {
      const st = this.elements.librarySearch ? this.elements.librarySearch.value.trim() : '';
      st === '' ? this.renderLibraryView() : this.renderSongLibrary(st);
      this.renderPlaylists();
      this.updatePlaylistSelection();
      this.renderAdditionalDetails();
    }).catch(error => {
      console.error('Error removing song:', error);
      alert('Failed to remove song. Please try again.');
    });
  }
  renderSongLibrary(searchTerm = null) {
    try {
      if (!this.elements.songLibrary) {
        return;
      }
      this.elements.songLibrary.classList.remove('is-compact-view');
      if (searchTerm === null && this.elements.librarySearch) {
        searchTerm = this.elements.librarySearch.value.toLowerCase().trim();
      }
      let filteredLibrary = this.songLibrary;
      if (searchTerm && searchTerm !== '') {
        const LAT_TO_CYR = {
          a: 'а',
          b: 'б',
          v: 'в',
          g: 'г',
          d: 'д',
          e: 'е',
          z: 'з',
          i: 'и',
          j: 'й',
          k: 'к',
          l: 'л',
          m: 'м',
          n: 'н',
          o: 'о',
          p: 'п',
          r: 'р',
          s: 'с',
          t: 'т',
          u: 'у',
          f: 'ф',
          y: 'ы'
        };
        const latinized = searchTerm.split('').map(c => LAT_TO_CYR[c] || c).join('');
        filteredLibrary = this.songLibrary.filter(song => {
          const name = song.name.toLowerCase();
          const author = (song.author || '').toLowerCase();
          return name.includes(searchTerm) || author.includes(searchTerm) || name.includes(latinized) || author.includes(latinized);
        });
      }
      if (this._libFilters && Object.values(this._libFilters).some(v => v !== null)) {
        filteredLibrary = this._applyFilters(filteredLibrary);
      }
      let sortedLibrary;
      if (this.librarySortAlphabetically !== false) {
        sortedLibrary = [ ...filteredLibrary ].sort((a, b) => {
          if (a.favorite !== b.favorite) {
            return a.favorite ? -1 : 1;
          }
          const result = a.name.localeCompare(b.name);
          return this.libraryReverseOrder ? -result : result;
        });
      } else {
        sortedLibrary = [ ...filteredLibrary ].sort((a, b) => {
          if (a.favorite !== b.favorite) {
            return a.favorite ? -1 : 1;
          }
          return this.libraryReverseOrder ? -1 : 0;
        });
      }
      const container = this.elements.songLibrary;
      if (this.songLibrary.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.classList.add('empty-library-message');
        emptyMessage.textContent = 'Your library is empty.';
        const addSongsButton = document.createElement('button');
        addSongsButton.classList.add('add-songs-button');
        addSongsButton.textContent = 'Add Songs';
        addSongsButton.addEventListener('click', () => this.openFindSongs());
        emptyMessage.appendChild(document.createElement('br'));
        emptyMessage.appendChild(addSongsButton);
        container.innerHTML = '';
        container.appendChild(emptyMessage);
        this._destroyVirtualScroll();
        return;
      }
      if (searchTerm && sortedLibrary.length === 0) {
        const noResultsMessage = document.createElement('div');
        noResultsMessage.classList.add('empty-library-message');
        noResultsMessage.textContent = `No songs found matching "${searchTerm}"`;
        container.innerHTML = '';
        container.appendChild(noResultsMessage);
        this._destroyVirtualScroll();
        return;
      }
      this._mountVirtualScroll(container, sortedLibrary);
    } catch (error) {
      console.error('Error rendering song library:', error);
      this.elements.songLibrary.innerHTML = '<div class="error-message">Failed to display song library</div>';
    }
  }
  renderLibraryView() {
    if (!this.elements.songLibrary) {
      return;
    }
    const searchTerm = this.elements.librarySearch ? this.elements.librarySearch.value.toLowerCase().trim() : '';
    if (searchTerm !== '') {
      this.renderSongLibrary(searchTerm);
      return;
    }
    if (this._discoveryResizeObserver) {
      this._discoveryResizeObserver.disconnect();
      this._discoveryResizeObserver = null;
    }
    const view = document.createElement('div');
    view.className = 'compact-library-view';
    view.appendChild(this._buildFavoritesCard());
    view.appendChild(this._buildPlaylistsShelf());
    view.appendChild(this._buildDiscoveryCard());
    this.elements.songLibrary.innerHTML = '';
    this.elements.songLibrary.classList.add('is-compact-view');
    this.elements.songLibrary.appendChild(view);
  }
  _refreshPlaylistsShelf() {
    const shelf = document.getElementById('playlistsShelf');
    if (!shelf) {
      return;
    }
    shelf.replaceWith(this._buildPlaylistsShelf());
  }
  _buildPlaylistsShelf() {
    const shelf = document.createElement('div');
    shelf.className = 'playlists-shelf';
    shelf.id = 'playlistsShelf';
    const favPlaylist = this.getFavoritesPlaylist();
    const playlists = this.playlists.filter(p => p !== favPlaylist);
    const header = document.createElement('div');
    header.className = 'shelf-header';
    header.innerHTML = `<span class="shelf-title"><i class="fa fa-list"></i> Playlists</span>`;
    if (playlists.length > 0) {
      const seeAllBtn = document.createElement('button');
      seeAllBtn.className = 'shelf-see-all-btn';
      seeAllBtn.innerHTML = `View all <i class="fa fa-chevron-right"></i>`;
      seeAllBtn.addEventListener('click', () => this.switchTab('playlists'));
      header.appendChild(seeAllBtn);
    }
    shelf.appendChild(header);
    const row = document.createElement('div');
    row.className = 'playlists-shelf-row';
    if (playlists.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'playlists-shelf-empty';
      empty.innerHTML = `<i class="fa fa-list"></i><span>No playlists yet</span>`;
      row.appendChild(empty);
    } else {
      const sorted = [ ...playlists ].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
      const frag = document.createDocumentFragment();
      sorted.forEach(playlist => frag.appendChild(this._buildPlaylistShelfTile(playlist)));
      row.appendChild(frag);
    }
    row.appendChild(this._buildCreatePlaylistShelfTile());
    shelf.appendChild(row);
    return shelf;
  }
  _buildPlaylistShelfTile(playlist) {
    const tile = document.createElement('div');
    tile.className = 'playlist-shelf-tile';
    tile.dataset.playlistId = playlist.id;
    const thumb = document.createElement('div');
    thumb.className = 'playlist-shelf-thumb';
    const songsForArt = playlist.songs.slice(0, 4);
    if (songsForArt.length === 0) {
      thumb.classList.add('is-empty');
      thumb.innerHTML = `<i class="fa fa-music"></i>`;
    } else {
      thumb.classList.add(`has-${Math.min(songsForArt.length, 4)}`);
      songsForArt.forEach(song => {
        const img = document.createElement('img');
        img.alt = '';
        img.loading = 'lazy';
        img.decoding = 'async';
        img.src = song.thumbnailUrl || `https://img.youtube.com/vi/${song.videoId}/mqdefault.jpg`;
        img.onerror = () => {
          img.onerror = null;
          img.src = `https://img.youtube.com/vi/${song.videoId}/default.jpg`;
        };
        thumb.appendChild(img);
      });
    }
    const playOverlay = document.createElement('div');
    playOverlay.className = 'playlist-shelf-play-overlay';
    playOverlay.innerHTML = `<i class="fa fa-play"></i>`;
    thumb.appendChild(playOverlay);
    const name = document.createElement('div');
    name.className = 'playlist-shelf-name';
    name.textContent = playlist.name;
    const count = document.createElement('div');
    count.className = 'playlist-shelf-count';
    count.textContent = `${playlist.songs.length} song${playlist.songs.length !== 1 ? 's' : ''}`;
    tile.appendChild(thumb);
    tile.appendChild(name);
    tile.appendChild(count);
    tile.addEventListener('click', () => this.playPlaylist(playlist.id));
    return tile;
  }
  _buildCreatePlaylistShelfTile() {
    const tile = document.createElement('div');
    tile.className = 'playlist-shelf-tile playlist-shelf-create-tile';
    tile.innerHTML = `\n\t        <div class="playlist-shelf-thumb is-empty is-create">\n\t            <i class="fa fa-plus"></i>\n\t        </div>\n\t        <div class="playlist-shelf-name">New Playlist</div>\n\t    `;
    tile.addEventListener('click', () => this._openCreatePlaylistFromShelf());
    return tile;
  }
  _openCreatePlaylistFromShelf() {
    this.switchTab('playlists');
    const createDiv = this.elements.createPlaylistDiv;
    if (!createDiv || createDiv.style.display === 'none' || !createDiv.style.display) {
      this.toggleCreatePlaylistDiv();
    } else {
      this.elements.newPlaylistName?.focus();
    }
  }
  _mountVirtualScroll(container, songs) {
    const BUFFER = 5;
    const probe = this.createSongElement(songs[0]);
    probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;';
    container.appendChild(probe);
    const ITEM_H = probe.getBoundingClientRect().height || 44;
    probe.remove();
    const CONTAINER_H = container.clientHeight || 480;
    this._destroyVirtualScroll();
    container.innerHTML = '';
    container.style.overflowY = 'auto';
    container.style.position = 'relative';
    container.style.height = CONTAINER_H + 'px';
    const spacer = document.createElement('div');
    spacer.style.cssText = `height:${songs.length * ITEM_H}px;width:100%;pointer-events:none;`;
    container.appendChild(spacer);
    const window_ = document.createElement('div');
    window_.style.cssText = 'position:absolute;top:0;left:0;right:0;';
    container.appendChild(window_);
    let lastStart = -1;
    const render = () => {
      const scrollTop = container.scrollTop;
      const start = Math.max(0, Math.floor(scrollTop / ITEM_H) - BUFFER);
      const visible = Math.ceil(CONTAINER_H / ITEM_H) + BUFFER * 2;
      const end = Math.min(songs.length, start + visible);
      if (start === lastStart && window_.childElementCount === end - start) {
        return;
      }
      lastStart = start;
      window_.style.transform = `translateY(${start * ITEM_H}px)`;
      window_.innerHTML = '';
      const frag = document.createDocumentFragment();
      for (let i = start; i < end; i++) {
        const el = this.createSongElement(songs[i]);
        el.style.height = ITEM_H + 'px';
        el.style.boxSizing = 'border-box';
        frag.appendChild(el);
      }
      window_.appendChild(frag);
    };
    const onScroll = () => render();
    container.addEventListener('scroll', onScroll, {
      passive: true
    });
    const resizeObserver = new ResizeObserver(() => {
      lastStart = -1;
      render();
    });
    resizeObserver.observe(container);
    this._vsCleanup = () => {
      container.removeEventListener('scroll', onScroll);
      resizeObserver.disconnect();
    };
    render();
  }
  _destroyVirtualScroll() {
    if (this._vsCleanup) {
      this._vsCleanup();
      this._vsCleanup = null;
    }
    if (this._vsContainer) {
      this._vsContainer.style.height = '';
      this._vsContainer.style.position = '';
      this._vsContainer.style.overflowY = '';
      this._vsContainer = null;
    }
  }
  createSongElement(song) {
    const songElement = document.createElement('div');
    songElement.classList.add('song-item');
    const isFav = song.favorite;
    const isDl = !!song.localFileHandle;
    const hasLyrics = !!(song.lyrics && song.lyrics.trim());
    let indicatorsHtml = '';
    if (isFav || isDl || hasLyrics) {
      const lyricsHtml = hasLyrics ? `<span class="song-lyrics-indicator" title="Has lyrics"><i class="fa fa-closed-captioning"></i></span>` : '';
      const dlHtml = isDl ? `<span class="song-dl-indicator"     title="Downloaded"><i class="fa fa-download"></i></span>` : '';
      const favHtml = isFav ? `<span class="song-fav-indicator"    title="Favourited"><i class="fa fa-star"></i></span>` : '';
      indicatorsHtml = `<div class="song-status-indicators">${lyricsHtml}${dlHtml}${favHtml}</div>`;
    }
    songElement.innerHTML = `\n\t        <span class="song-name" data-song-id="${song.id}">\n\t            ${this.escapeHtml(song.name)}\n\t            ${song.author ? `<small class="song-author">by ${this.escapeHtml(song.author)}</small>` : ''}\n\t        </span>\n\t        <div class="song-item-right">\n\t            ${indicatorsHtml}\n\t            <div class="song-actions">\n\t                <button class="song-card-btn favorite-btn" data-song-id="${song.id}" title="${isFav ? 'Unfavourite' : 'Favourite'}">\n\t                    <i class="fa ${isFav ? 'fa-star' : 'fa-star-o'}"></i>\n\t                </button>\n\t                <button class="song-card-btn play-btn" data-song-id="${song.id}" title="Play">\n\t                    <i class="fa fa-play"></i>\n\t                </button>\n\t                <button class="song-card-btn delete-btn" data-song-id="${song.id}" title="Delete">\n\t                    <i class="fa fa-trash"></i>\n\t                </button>\n\t                <button class="song-card-btn edit-btn" data-song-id="${song.id}" title="Edit">\n\t                    <i class="fa fa-pencil"></i>\n\t                </button>\n\t            </div>\n\t        </div>\n\t    `;
    return songElement;
  }
  setupSongLibraryDelegation() {
    this.elements.songLibrary.addEventListener('click', e => {
      const target = e.target.closest('button, .song-name');
      if (!target) {
        return;
      }
      const songId = target.dataset.songId;
      if (!songId) {
        return;
      }
      const songIdNum = parseInt(songId, 10);
      if (target.classList.contains('favorite-btn')) {
        this.toggleFavorite(songIdNum);
      } else if (target.classList.contains('play-btn')) {
        this.playSong(songIdNum);
      } else if (target.classList.contains('delete-btn')) {
        this.removeSong(songIdNum);
      } else if (target.classList.contains('edit-btn')) {
        this.openSongEditModal(songIdNum);
      } else if (target.classList.contains('song-name')) {
        this.playSong(songIdNum);
      }
    });
    this._setupSongItemDragDrop();
  }
  escapeHtml(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }
  decodeHtmlEntities(text) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  }
  filterLibrarySongs() {
    const searchTerm = this.elements.librarySearch.value.toLowerCase().trim();
    if (searchTerm === '') {
      this.renderLibraryView();
      this.hideYouTubeSearchSuggestion();
      return;
    }
    const videoId = this.extractYouTubeId(searchTerm);
    if (videoId) {
      this.showAddToLibrarySuggestion(searchTerm);
      this.renderSongLibrary(searchTerm);
      return;
    }
    this.renderSongLibrary(searchTerm);
    const songItems = this.elements.songLibrary.querySelectorAll('.song-item');
    const resultsFound = songItems.length > 0;
    if (!resultsFound && searchTerm !== '') {
      const instructionMessage = document.createElement('div');
      instructionMessage.classList.add('empty-library-message');
      instructionMessage.innerHTML = `\n\t            No songs found in your library matching "<strong>${this.escapeHtml(searchTerm)}</strong>"<br>\n\t            <small style="color: var(--text-secondary); margin-top: 8px; display: block;">Press Enter to search YouTube</small>\n\t        `;
      this.elements.songLibrary.innerHTML = '';
      this.elements.songLibrary.appendChild(instructionMessage);
      this.showYouTubeSearchSuggestion(searchTerm);
    } else {
      this.hideYouTubeSearchSuggestion();
    }
  }
  handleLibrarySearchInput() {
    this.resetLibrarySearchTimeout();
    const searchTerm = this.elements.librarySearch.value.trim();
    const videoId = this.extractYouTubeId(searchTerm);
    if (videoId) {
      this.showAddToLibrarySuggestion(searchTerm);
      this.elements.songLibrary.innerHTML = '<div class="empty-library-message">YouTube URL detected - press Enter to add</div>';
      return;
    }
    this.debouncedFilterLibrary();
  }
  showAddToLibrarySuggestion(youtubeUrl) {
    const querySpan = this.elements.youtubeSearchSuggestion.querySelector('.search-query');
    querySpan.textContent = `Add this song to library`;
    this.elements.youtubeSearchSuggestion.style.display = 'block';
    this.elements.youtubeSearchSuggestion.onclick = null;
    this.elements.youtubeSearchSuggestion.onclick = () => {
      this.autofillFromUrl(youtubeUrl);
    };
  }
  autofillFromUrl(youtubeUrl) {
    this.openLibraryModal();
    this.elements.songUrlInput.value = youtubeUrl;
    this.handleUrlPaste();
    this.elements.librarySearch.value = '';
    this.hideYouTubeSearchSuggestion();
  }
  showYouTubeSearchSuggestion(searchTerm) {
    const querySpan = this.elements.youtubeSearchSuggestion.querySelector('.search-query');
    querySpan.textContent = `Search for "${searchTerm}" on YouTube`;
    this.elements.youtubeSearchSuggestion.style.display = 'block';
    this.elements.youtubeSearchSuggestion.onclick = null;
    this.elements.youtubeSearchSuggestion.onclick = () => {
      this.searchYouTube(searchTerm);
    };
  }
  hideYouTubeSearchSuggestion() {
    this.elements.youtubeSearchSuggestion.style.display = 'none';
  }
  searchYouTube(searchTerm) {
    this.elements.songNameInput.value = searchTerm;
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchTerm)}`;
    window.open(searchUrl, '_blank');
    this.openLibraryModal();
  }
  playFirstVisibleSong() {
    const visibleSongItems = Array.from(this.elements.songLibrary.querySelectorAll('.song-item')).filter(item => item.style.display !== 'none');
    if (visibleSongItems.length > 0) {
      const firstSongElement = visibleSongItems[0].querySelector('.song-name');
      const songId = firstSongElement.dataset.songId;
      if (songId) {
        this.playSong(parseInt(songId));
      }
    }
  }
  _buildFavoritesCard() {
    const card = document.createElement('div');
    card.className = 'favorites-card';
    card.id = 'favoritesCard';
    const f = this._libFilters;
    const favoritesExcluded = f?.favorite === false;
    const favorites = favoritesExcluded ? [] : this._applyFilters ? this._applyFilters(this.songLibrary.filter(s => s.favorite)) : this.songLibrary.filter(s => s.favorite);
    const inner = document.createElement('div');
    inner.className = 'favorites-card-inner';
    const grid = document.createElement('div');
    grid.className = 'favorites-thumbnails';
    if (favorites.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'favorites-empty';
      empty.innerHTML = `<i class="fa fa-star-o"></i><span>No favourites yet</span>`;
      grid.appendChild(empty);
    } else {
      const shuffled = this._shuffleArray([ ...favorites ]);
      const toShow = shuffled.slice(0, 20);
      const frag = document.createDocumentFragment();
      toShow.forEach(song => frag.appendChild(this._buildFavThumb(song)));
      grid.appendChild(frag);
      grid.addEventListener('click', e => {
        const thumb = e.target.closest('.fav-thumb');
        if (!thumb) {
          return;
        }
        this.playSong(parseInt(thumb.dataset.songId));
      });
      grid.addEventListener('contextmenu', e => {
        e.preventDefault();
        const thumb = e.target.closest('.fav-thumb');
        if (!thumb) {
          return;
        }
        const song = this.songLibrary.find(s => s.id === parseInt(thumb.dataset.songId));
        if (song) {
          this.addToQueue(song);
        }
      });
    }
    const panel = document.createElement('div');
    panel.className = 'favorites-panel';
    const favPlaylist = this.getFavoritesPlaylist();
    panel.innerHTML = `\n\t        <div class="favorites-panel-top">\n\t            <div class="favorites-panel-title">Favourites</div>\n\t            <div class="favorites-panel-count">${favorites.length} <span class="favorites-panel-sublabel">song${favorites.length !== 1 ? 's' : ''}</span></div>\n\t        </div>\n\t        <div class="favorites-panel-bottom"></div>\n\t    `;
    const playBtn = document.createElement('button');
    playBtn.className = 'fav-play-btn';
    playBtn.innerHTML = `<i class="fa fa-play"></i> Play`;
    playBtn.addEventListener('click', () => {
      if (favPlaylist) {
        this.playPlaylist(favPlaylist.id);
      } else {
        alert('No favourites playlist found. Star some songs first!');
      }
    });
    const expandBtn = document.createElement('button');
    expandBtn.className = 'fav-expand-btn';
    expandBtn.innerHTML = `<i class="fa fa-chevron-down"></i> All`;
    expandBtn.addEventListener('click', () => {
      const isExpanded = card.classList.toggle('expanded');
      expandBtn.classList.toggle('is-expanded', isExpanded);
      expandBtn.innerHTML = isExpanded ? `<i class="fa fa-chevron-up"></i> Less` : `<i class="fa fa-chevron-down"></i> All`;
      let expList = card.querySelector('.favorites-expanded-list');
      if (isExpanded) {
        if (!expList) {
          expList = document.createElement('div');
          expList.className = 'favorites-expanded-list';
          card.appendChild(expList);
        }
        expList.innerHTML = '';
        const favSongs = favoritesExcluded ? [] : this._applyFilters ? this._applyFilters(this.songLibrary.filter(s => s.favorite)) : this.songLibrary.filter(s => s.favorite);
        if (favoritesExcluded) {
          expList.innerHTML = '<div class="empty-library-message">Filter excludes favourites.</div>';
        } else if (favSongs.length === 0) {
          expList.innerHTML = '<div class="empty-library-message">No favourites yet.</div>';
        } else {
          const frag = document.createDocumentFragment();
          favSongs.forEach(song => frag.appendChild(this.createSongElement(song)));
          expList.appendChild(frag);
        }
      } else if (expList) {
        expList.innerHTML = '';
      }
    });
    const bottom = panel.querySelector('.favorites-panel-bottom');
    bottom.appendChild(playBtn);
    bottom.appendChild(expandBtn);
    inner.appendChild(grid);
    inner.appendChild(panel);
    card.appendChild(inner);
    return card;
  }
  _buildFavThumb(song) {
    const thumb = document.createElement('div');
    thumb.className = 'fav-thumb';
    thumb.dataset.songId = song.id;
    if (this.currentSong && this.currentSong.id === song.id) {
      thumb.classList.add('is-playing');
    }
    const img = document.createElement('img');
    img.alt = song.name;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.src = song.thumbnailUrl || `https://img.youtube.com/vi/${song.videoId}/mqdefault.jpg`;
    img.onerror = () => {
      img.onerror = null;
      img.src = `https://img.youtube.com/vi/${song.videoId}/default.jpg`;
    };
    const label = document.createElement('div');
    label.className = 'fav-thumb-label';
    const icon = document.createElement('div');
    icon.className = 'fav-thumb-play-icon';
    icon.innerHTML = `<i class="fa fa-play"></i>`;
    const name = document.createElement('span');
    name.textContent = song.name;
    label.appendChild(icon);
    label.appendChild(name);
    thumb.appendChild(img);
    thumb.appendChild(label);
    return thumb;
  }
  _buildDiscoveryCard() {
    const card = document.createElement('div');
    card.className = 'discovery-card';
    card.id = 'discoveryCard';
    let pool = this._applyFilters ? this._applyFilters([ ...this.songLibrary ]) : [ ...this.songLibrary ];
    if (this.librarySortAlphabetically !== false) {
      pool.sort((a, b) => {
        if (a.favorite !== b.favorite) {
          return a.favorite ? -1 : 1;
        }
        const result = a.name.localeCompare(b.name);
        return this.libraryReverseOrder ? -result : result;
      });
    } else {
      if (this.libraryReverseOrder) {
        pool.reverse();
      }
    }
    const shuffled = this._shuffleArray([ ...pool ]);
    const header = document.createElement('div');
    header.className = 'discovery-header';
    const left = document.createElement('div');
    left.className = 'discovery-header-left';
    const titleSpan = document.createElement('span');
    titleSpan.className = 'discovery-title';
    const icon = document.createElement('i');
    icon.className = 'fa fa-music';
    icon.style.marginRight = '5px';
    titleSpan.appendChild(icon);
    titleSpan.appendChild(document.createTextNode('From your library'));
    left.appendChild(titleSpan);
    const right = document.createElement('div');
    right.style.cssText = 'display:flex;gap:6px;align-items:center;';
    const shuffleBtn = document.createElement('button');
    shuffleBtn.className = 'discovery-shuffle-btn';
    shuffleBtn.innerHTML = `<i class="fa fa-random"></i> Shuffle`;
    const expandBtn = document.createElement('button');
    expandBtn.className = 'discovery-expand-btn';
    expandBtn.innerHTML = `<i class="fa fa-chevron-down"></i> All`;
    right.appendChild(shuffleBtn);
    right.appendChild(expandBtn);
    header.appendChild(left);
    header.appendChild(right);
    const grid = document.createElement('div');
    grid.className = 'discovery-grid';
    grid.addEventListener('click', e => {
      const item = e.target.closest('.discovery-song-item');
      if (!item) {
        return;
      }
      this.playSong(parseInt(item.dataset.songId));
    });
    grid.addEventListener('contextmenu', e => {
      e.preventDefault();
      const item = e.target.closest('.discovery-song-item');
      if (!item) {
        return;
      }
      const song = this.songLibrary.find(s => s.id === parseInt(item.dataset.songId));
      if (song) {
        this.addToQueue(song);
      }
    });
    let lastCols = 0;
    let lastRows = 0;
    let rafId = null;
    let resizeTimer = null;
    const renderGrid = () => {
      const containerWidth = card.offsetWidth || 300;
      const cellSize = 80;
      const rowHeight = 114;
      const gap = 8;
      const padding = 24;
      const cols = Math.max(1, Math.floor((containerWidth - padding + gap) / (cellSize + gap)));
      const availableHeight = grid.clientHeight || rowHeight * 2;
      const rows = Math.max(2, Math.floor((availableHeight + gap) / (rowHeight + gap)));
      if (cols === lastCols && rows === lastRows && grid.children.length > 0) {
        return;
      }
      lastCols = cols;
      lastRows = rows;
      const maxSongs = cols * rows;
      grid.innerHTML = '';
      if (shuffled.length === 0) {
        const msg = document.createElement('div');
        msg.className = 'compact-empty-state';
        const msgIcon = document.createElement('i');
        msgIcon.className = 'fa fa-music';
        msgIcon.style.cssText = 'font-size:1.8em;opacity:0.3;display:block;margin-bottom:8px;';
        const msgText = document.createTextNode('Your library is empty.');
        const msgSmall = document.createElement('small');
        msgSmall.textContent = 'Add some songs to get started.';
        msg.appendChild(msgIcon);
        msg.appendChild(msgText);
        msg.appendChild(document.createElement('br'));
        msg.appendChild(msgSmall);
        grid.appendChild(msg);
        return;
      }
      const frag = document.createDocumentFragment();
      shuffled.slice(0, maxSongs).forEach(song => frag.appendChild(this._buildDiscoverySongItem(song)));
      grid.appendChild(frag);
    };
    shuffleBtn.addEventListener('click', () => {
      this._shuffleArray(shuffled);
      lastCols = 0;
      renderGrid();
    });
    expandBtn.addEventListener('click', () => {
      const isExpanded = card.classList.toggle('expanded');
      expandBtn.innerHTML = isExpanded ? `<i class="fa fa-chevron-up"></i> Less` : `<i class="fa fa-chevron-down"></i> All`;
      let expList = card.querySelector('.discovery-expanded-list');
      if (isExpanded) {
        if (!expList) {
          expList = document.createElement('div');
          expList.className = 'discovery-expanded-list';
          card.appendChild(expList);
        }
        expList.innerHTML = '';
        let allSongs = this._applyFilters ? this._applyFilters([ ...this.songLibrary ]) : [ ...this.songLibrary ];
        if (this.librarySortAlphabetically !== false) {
          allSongs.sort((a, b) => {
            if (a.favorite !== b.favorite) {
              return a.favorite ? -1 : 1;
            }
            const result = a.name.localeCompare(b.name);
            return this.libraryReverseOrder ? -result : result;
          });
        } else {
          if (this.libraryReverseOrder) {
            allSongs.reverse();
          }
        }
        const frag = document.createDocumentFragment();
        allSongs.forEach(song => frag.appendChild(this.createSongElement(song)));
        expList.appendChild(frag);
      } else if (expList) {
        expList.innerHTML = '';
      }
    });
    card.appendChild(header);
    card.appendChild(grid);
    if (this._discoveryResizeObserver) {
      this._discoveryResizeObserver.disconnect();
    }
    this._discoveryResizeObserver = new ResizeObserver(() => {
      if (card.classList.contains('expanded')) {
        return;
      }
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(renderGrid, 100);
    });
    rafId = requestAnimationFrame(() => {
      renderGrid();
      this._discoveryResizeObserver.observe(card);
    });
    const cleanup = () => {
      cancelAnimationFrame(rafId);
      clearTimeout(resizeTimer);
      if (this._discoveryResizeObserver) {
        this._discoveryResizeObserver.disconnect();
        this._discoveryResizeObserver = null;
      }
    };
    card.addEventListener('remove', cleanup, {
      once: true
    });
    return card;
  }
  _buildDiscoverySongItem(song) {
    const item = document.createElement('div');
    item.className = 'discovery-song-item';
    item.dataset.songId = song.id;
    if (this.currentSong && this.currentSong.id === song.id) {
      item.classList.add('is-playing');
    }
    const wrap = document.createElement('div');
    wrap.className = 'discovery-thumb-wrap';
    const img = document.createElement('img');
    img.src = song.thumbnailUrl || `https://img.youtube.com/vi/${song.videoId}/mqdefault.jpg`;
    img.alt = song.name;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.onerror = () => {
      img.onerror = null;
      img.src = `https://img.youtube.com/vi/${song.videoId}/default.jpg`;
    };
    const overlay = document.createElement('div');
    overlay.className = 'discovery-play-overlay';
    overlay.innerHTML = `<i class="fa fa-play"></i>`;
    const nameEl = document.createElement('div');
    nameEl.className = 'discovery-song-name';
    nameEl.textContent = song.name;
    wrap.appendChild(img);
    wrap.appendChild(overlay);
    item.appendChild(wrap);
    item.appendChild(nameEl);
    return item;
  }
  _shuffleArray(arr) {
    let i = arr.length;
    while (i--) {
      const j = Math.random() * (i + 1) | 0;
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }
  toggleFavorite(songId) {
    const songIndex = this.songLibrary.findIndex(song => song.id === songId);
    if (songIndex === -1) {
      return;
    }
    const song = this.songLibrary[songIndex];
    const newFavoriteStatus = !song.favorite;
    song.favorite = newFavoriteStatus;
    const favoriteBtn = document.querySelector(`.favorite-btn[data-song-id="${songId}"]`);
    if (favoriteBtn) {
      const icon = favoriteBtn.querySelector('i');
      icon.className = `fa ${newFavoriteStatus ? 'fa-star' : 'fa-star-o'}`;
      favoriteBtn.title = newFavoriteStatus ? 'Unfavourite' : 'Favourite';
    }
    const songItem = favoriteBtn?.closest('.song-item');
    if (songItem) {
      const right = songItem.querySelector('.song-item-right');
      let indicators = right?.querySelector('.song-status-indicators');
      const isDl = !!this.songLibrary.find(s => s.id === songId)?.localFileHandle;
      if (newFavoriteStatus || isDl) {
        if (!indicators && right) {
          indicators = document.createElement('div');
          indicators.className = 'song-status-indicators';
          right.insertBefore(indicators, right.querySelector('.song-actions'));
        }
        if (indicators) {
          const dlHtml = isDl ? `<span class="song-dl-indicator" title="Downloaded"><i class="fa fa-download"></i></span>` : '';
          const favHtml = newFavoriteStatus ? `<span class="song-fav-indicator" title="Favourited"><i class="fa fa-star"></i></span>` : '';
          indicators.innerHTML = dlHtml + favHtml;
        }
      } else {
        indicators?.remove();
      }
    }
    this.batchFavoriteUpdate(song, newFavoriteStatus);
  }
  syncFavoritesOnLoad() {
    return new Promise(resolve => {
      try {
        const favoriteSongs = this.songLibrary.filter(song => song.favorite);
        if (favoriteSongs.length === 0) {
          resolve();
          return;
        }
        let favoritesPlaylist = this.getFavoritesPlaylist();
        if (!favoritesPlaylist) {
          favoritesPlaylist = this.createFavoritesPlaylist();
        }
        const currentFavorites = favoriteSongs.map(song => ({
          name: song.name,
          videoId: song.videoId,
          entryId: Date.now() + Math.random()
        }));
        const needsUpdate = favoritesPlaylist.songs.length !== currentFavorites.length || !currentFavorites.every(fav => favoritesPlaylist.songs.some(existing => existing.videoId === fav.videoId));
        if (needsUpdate) {
          favoritesPlaylist.songs = currentFavorites;
          this.savePlaylists().then(resolve).catch(resolve);
        } else {
          resolve();
        }
      } catch (error) {
        console.error('Error in syncFavoritesOnLoad:', error);
        resolve();
      }
    });
  }
  batchFavoriteUpdate(song, isFavorited) {
    clearTimeout(this.favoriteUpdateTimeout);
    this.favoriteUpdateTimeout = setTimeout(() => {
      Promise.all([ this.saveSingleSong(song), this.updateFavoritesPlaylist(song, isFavorited) ]).catch(error => {
        console.error('Error updating favorite:', error);
        song.favorite = !isFavorited;
        const favoriteBtn = document.querySelector(`.favorite-btn[data-song-id="${song.id}"]`);
        if (favoriteBtn) {
          favoriteBtn.querySelector('i').className = `fa ${song.favorite ? 'fa-star' : 'fa-star-o'}`;
          favoriteBtn.title = song.favorite ? 'Unfavourite' : 'Favourite';
        }
        const songItem = favoriteBtn?.closest('.song-item');
        if (songItem) {
          const right = songItem.querySelector('.song-item-right');
          let indicators = right?.querySelector('.song-status-indicators');
          const isDl = !!song.localFileHandle;
          if (!song.favorite && !isDl) {
            indicators?.remove();
          } else if (indicators) {
            const dlHtml = isDl ? `<span class="song-dl-indicator" title="Downloaded"><i class="fa fa-download"></i></span>` : '';
            const favHtml = song.favorite ? `<span class="song-fav-indicator" title="Favourited"><i class="fa fa-star"></i></span>` : '';
            indicators.innerHTML = dlHtml + favHtml;
          }
        }
      });
    }, 300);
  }
  updateFavoritesPlaylist(song, isFavorited) {
    return new Promise(resolve => {
      let favoritesPlaylist = this.getFavoritesPlaylist();
      if (!favoritesPlaylist && isFavorited) {
        favoritesPlaylist = this.createFavoritesPlaylist();
      }
      if (!favoritesPlaylist) {
        resolve();
        return;
      }
      const songExists = favoritesPlaylist.songs.some(s => s.videoId === song.videoId);
      let playlistChanged = false;
      if (isFavorited && !songExists) {
        favoritesPlaylist.songs.push({
          name: song.name,
          videoId: song.videoId,
          entryId: Date.now() + Math.random()
        });
        playlistChanged = true;
      } else if (!isFavorited && songExists) {
        const originalLength = favoritesPlaylist.songs.length;
        favoritesPlaylist.songs = favoritesPlaylist.songs.filter(s => s.videoId !== song.videoId);
        playlistChanged = originalLength !== favoritesPlaylist.songs.length;
      }
      if (playlistChanged) {
        this.savePlaylists().then(() => {
          if (this.currentPlaylist && this.currentPlaylist.id === favoritesPlaylist.id) {
            this.renderPlaylistSidebar();
          }
          resolve();
        }).catch(resolve);
      } else {
        resolve();
      }
    });
  }
  getFavoritesPlaylist() {
    return this.playlists.find(p => [ 'favorites', 'favourite', 'favourite songs', 'favorite songs' ].includes(p.name.toLowerCase()));
  }
  createFavoritesPlaylist() {
    const favoritesPlaylist = {
      id: Date.now(),
      name: 'Favorites',
      songs: []
    };
    this.playlists.push(favoritesPlaylist);
    return favoritesPlaylist;
  }
  validateYouTubeUrl() {
    const url = this.elements.songUrlInput.value.trim();
    if (!url) {
      this.removeYouTubeThumbnailPreview();
      return;
    }
    const videoId = this.extractYouTubeId(url);
    this.removeYouTubeThumbnailPreview();
    if (videoId) {
      this.showYouTubeThumbnailPreview(videoId);
      this.checkVideoRestrictions(videoId);
    }
  }
  showYouTubeThumbnailPreview(videoId) {
    this.removeYouTubeThumbnailPreview();
    const previewContainer = document.createElement('div');
    previewContainer.id = 'thumbnailPreview';
    previewContainer.classList.add('thumbnail-preview');
    const thumbnail = document.createElement('img');
    thumbnail.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    thumbnail.alt = 'Video thumbnail';
    const videoTitle = document.createElement('div');
    videoTitle.classList.add('video-title');
    videoTitle.textContent = 'Loading video title...';
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;';
    closeButton.classList.add('thumbnail-close-btn');
    closeButton.onclick = this.removeYouTubeThumbnailPreview.bind(this);
    previewContainer.appendChild(thumbnail);
    previewContainer.appendChild(videoTitle);
    previewContainer.appendChild(closeButton);
    document.querySelector('.add-song-section').appendChild(previewContainer);
    this.fetchYouTubeTitle(videoId).then(title => {
      if (title) {
        videoTitle.textContent = title;
      }
    }).catch(error => {
      console.warn('Could not fetch YouTube title:', error);
      videoTitle.textContent = 'Could not load video title';
    });
  }
  removeYouTubeThumbnailPreview() {
    const existingPreview = document.getElementById('thumbnailPreview');
    if (existingPreview) {
      existingPreview.remove();
    }
  }
  checkVideoRestrictions(videoId) {
    const tempPlayer = document.createElement('div');
    tempPlayer.id = 'tempYTPlayer';
    tempPlayer.style.display = 'none';
    document.body.appendChild(tempPlayer);
    const player = new YT.Player('tempYTPlayer', {
      videoId: videoId,
      events: {
        onError: event => {
          if (event.data === 101 || event.data === 150) {
            alert('This video cannot be played outside YouTube due to restrictions set by the content owner.');
          }
          player.destroy();
          document.getElementById('tempYTPlayer')?.remove();
        },
        onReady: () => {
          setTimeout(() => {
            player.destroy();
            document.getElementById('tempYTPlayer')?.remove();
          }, 1e3);
        }
      }
    });
  }
  parseVideoTitle(title) {
    if (!title) {
      return {
        author: '',
        songName: ''
      };
    }
    let cleanTitle = title.trim();
    const quotedPattern = /^(.+?)\s*[""](.+?)[""](.*)$/;
    const quotedMatch = cleanTitle.match(quotedPattern);
    if (quotedMatch) {
      const author = quotedMatch[1].trim();
      const songName = quotedMatch[2].trim();
      return {
        author: author,
        songName: songName
      };
    }
    const colonPattern = /^(.+?):\s*(.+)$/;
    const colonMatch = cleanTitle.match(colonPattern);
    if (colonMatch) {
      const author = colonMatch[1].trim();
      const songName = this.removeNoisePatterns(colonMatch[2].trim());
      return {
        author: author,
        songName: songName
      };
    }
    cleanTitle = this.removeNoisePatterns(cleanTitle);
    const hyphenMatch = cleanTitle.match(/^(.+?)\s*-\s*(.+)$/);
    if (hyphenMatch) {
      let author = hyphenMatch[1].trim();
      let songName = hyphenMatch[2].trim();
      const ftResult = this.extractFeaturedArtists(songName);
      if (ftResult.featured) {
        songName = ftResult.cleanName;
        author = `${author} ${ftResult.featured}`;
      }
      return {
        author: author,
        songName: songName
      };
    }
    const byMatch = cleanTitle.match(/^(.+?)\s+by\s+(.+)$/i);
    if (byMatch) {
      let songName = byMatch[1].trim();
      let author = byMatch[2].trim();
      const ftResult = this.extractFeaturedArtists(author);
      if (ftResult.featured) {
        author = `${ftResult.cleanName} ${ftResult.featured}`;
      }
      return {
        author: author,
        songName: songName
      };
    }
    const allCapsMatch = cleanTitle.match(/^([A-Z][A-Z\s&]+[A-Z])\s+(.+)$/);
    if (allCapsMatch && allCapsMatch[1].length < 50) {
      let author = allCapsMatch[1].trim();
      let songName = allCapsMatch[2].trim();
      const ftResult = this.extractFeaturedArtists(songName);
      if (ftResult.featured) {
        songName = ftResult.cleanName;
        author = `${author} ${ftResult.featured}`;
      }
      return {
        author: author,
        songName: songName
      };
    }
    return {
      author: '',
      songName: cleanTitle
    };
  }
  removeNoisePatterns(text) {
    const patterns = [ /\(official\s+music\s+video\)/gi, /\[official\s+music\s+video\]/gi, /\(official\s+video\)/gi, /\[official\s+video\]/gi, /\(official\s+audio\)/gi, /\[official\s+audio\]/gi, /\(official\s+lyric\s+video\)/gi, /\[official\s+lyric\s+video\]/gi, /\(official\s+lyrics\s+video\)/gi, /\[official\s+lyrics\s+video\]/gi, /\(official\s+visualizer\)/gi, /\[official\s+visualizer\]/gi, /\(official\s+mv\)/gi, /\[official\s+mv\]/gi, /\(music\s+video\)/gi, /\[music\s+video\]/gi, /\(lyric\s+video\)/gi, /\[lyric\s+video\]/gi, /\(lyrics\s+video\)/gi, /\[lyrics\s+video\]/gi, /\(official\)/gi, /\[official\]/gi, /\(lyrics\)/gi, /\[lyrics\]/gi, /\(video\)/gi, /\[video\]/gi, /\(audio\)/gi, /\[audio\]/gi, /\(mv\)/gi, /\[mv\]/gi, /\s+official\s+music\s+video$/gi, /\s+official\s+video$/gi, /\s+official\s+audio$/gi, /\s+music\s+video$/gi, /\s+lyric\s+video$/gi, /\s+lyrics\s+video$/gi, /\s+official\s+visualizer$/gi, /\s+visualizer$/gi, /\s+official\s+mv$/gi, /\s+official$/gi, /\s+video$/gi, /\s+audio$/gi, /\s+lyrics$/gi, /\(4k\)/gi, /\[4k\]/gi, /\(8k\)/gi, /\[8k\]/gi, /\(hd\)/gi, /\[hd\]/gi, /\(uhd\)/gi, /\[uhd\]/gi, /\s+4k$/gi, /\s+8k$/gi, /\s+hd$/gi, /\(remastered\)/gi, /\[remastered\]/gi, /\(remaster\)/gi, /\[remaster\]/gi, /\(remix\)/gi, /\[remix\]/gi, /\s+remastered$/gi, /\(live\s+performance\)/gi, /\[live\s+performance\]/gi, /\(live\)/gi, /\[live\]/gi, /\s+live$/gi, /\(explicit\)/gi, /\[explicit\]/gi, /\(\s*\)/g, /\[\s*\]/g ];
    let cleaned = text;
    patterns.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '');
    });
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    return cleaned;
  }
  extractFeaturedArtists(text) {
    const patterns = [ {
      regex: /\s+(ft\.?|feat\.?|featuring)\s+(.+)$/i,
      captureGroup: 2
    }, {
      regex: /\s+with\s+(.+)$/i,
      captureGroup: 1
    }, {
      regex: /\s+(&|x)\s+([A-Z].+)$/i,
      captureGroup: 2
    } ];
    for (const pattern of patterns) {
      const match = text.match(pattern.regex);
      if (match) {
        const cleanName = text.replace(pattern.regex, '').trim();
        const featuredArtists = match[pattern.captureGroup].trim();
        return {
          cleanName: cleanName,
          featured: `ft. ${featuredArtists}`
        };
      }
    }
    return {
      cleanName: text,
      featured: null
    };
  }
  handleAutofill() {
    const songUrl = this.elements.songUrlInput.value.trim();
    if (!songUrl) {
      return;
    }
    const videoId = this.extractYouTubeId(songUrl);
    if (!videoId) {
      return;
    }
    Promise.all([ this.fetchYouTubeTitle(videoId), this.fetchYouTubeChannel(videoId) ]).then(([title, channelName]) => {
      if (title) {
        const {author: author, songName: songName} = this.parseVideoTitle(title);
        this.elements.songNameInput.value = songName;
        this.elements.songAuthorInput.value = author || channelName;
      }
    }).catch(error => {
      console.error('Error fetching video title for autofill:', error);
      alert('Could not fetch video information for autofill');
    });
  }
  showGhostPreview(event) {
    const songUrl = this.elements.songUrlInput.value.trim();
    if (!songUrl) {
      this.removeGhostPreview();
      return;
    }
    const videoId = this.extractYouTubeId(songUrl);
    if (!videoId) {
      this.removeGhostPreview();
      return;
    }
    if (this.ghostPreviewAbortController) {
      this.ghostPreviewAbortController.abort();
    }
    this.ghostPreviewAbortController = new AbortController();
    const requestId = Date.now();
    this.currentGhostRequestId = requestId;
    Promise.all([ this.fetchYouTubeTitle(videoId), this.fetchYouTubeChannel(videoId) ]).then(([title, channelName]) => {
      if (this.currentGhostRequestId !== requestId) {
        return;
      }
      if (!this.isAutofillButtonHovered) {
        return;
      }
      if (title) {
        const {author: author, songName: songName} = this.parseVideoTitle(title);
        const finalAuthor = author || channelName;
        this.createGhostPreview(songName, finalAuthor);
      }
    }).catch(error => {
      if (error.name === 'AbortError') {
        return;
      }
      console.warn('Could not fetch title for ghost preview:', error);
    });
  }
  createGhostPreview(songName, author) {
    this.removeGhostPreview();
    const nameInput = this.elements.songNameInput;
    const authorInput = this.elements.songAuthorInput;
    const container = document.createElement('div');
    container.id = 'ghost-preview-container';
    if (songName && songName !== nameInput.value) {
      const nameGhost = this.createGhostElement(songName, nameInput, 'nameGhost');
      container.appendChild(nameGhost);
    }
    if (author && author !== authorInput.value) {
      const authorGhost = this.createGhostElement(author, authorInput, 'authorGhost');
      container.appendChild(authorGhost);
    }
    if (container.children.length > 0) {
      document.body.appendChild(container);
      this.setupGhostEventListeners();
      requestAnimationFrame(() => {
        container.classList.add('visible');
      });
    }
  }
  createGhostElement(text, inputEl, id) {
    const ghost = document.createElement('div');
    ghost.classList.add('ghost-preview');
    ghost.textContent = text;
    ghost.id = id;
    this.positionGhost(ghost, inputEl);
    return ghost;
  }
  positionGhost(ghost, inputEl) {
    const rect = inputEl.getBoundingClientRect();
    ghost.style.left = rect.left + window.scrollX + 'px';
    ghost.style.top = rect.top + window.scrollY + 'px';
    ghost.style.width = rect.width + 'px';
    ghost.style.height = rect.height + 'px';
  }
  setupGhostEventListeners() {
    this.cleanupGhostEventListeners();
    let ticking = false;
    this.ghostScrollHandler = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          this.updateGhostPositions();
          ticking = false;
        });
        ticking = true;
      }
    };
    this.ghostResizeHandler = () => {
      this.updateGhostPositions();
    };
    window.addEventListener('scroll', this.ghostScrollHandler, {
      passive: true
    });
    window.addEventListener('resize', this.ghostResizeHandler, {
      passive: true
    });
    this.ghostInteractionHandler = () => {
      this.removeGhostPreview();
    };
    document.addEventListener('click', this.ghostInteractionHandler, {
      once: true
    });
    document.addEventListener('keydown', this.ghostInteractionHandler, {
      once: true
    });
  }
  cleanupGhostEventListeners() {
    if (this.ghostScrollHandler) {
      window.removeEventListener('scroll', this.ghostScrollHandler);
    }
    if (this.ghostResizeHandler) {
      window.removeEventListener('resize', this.ghostResizeHandler);
    }
    if (this.ghostInteractionHandler) {
      document.removeEventListener('click', this.ghostInteractionHandler);
      document.removeEventListener('keydown', this.ghostInteractionHandler);
    }
  }
  updateGhostPositions() {
    const container = document.getElementById('ghost-preview-container');
    if (!container) {
      return;
    }
    const nameGhost = document.getElementById('nameGhost');
    const authorGhost = document.getElementById('authorGhost');
    if (nameGhost) {
      this.positionGhost(nameGhost, this.elements.songNameInput);
    }
    if (authorGhost) {
      this.positionGhost(authorGhost, this.elements.songAuthorInput);
    }
  }
  removeGhostPreview() {
    const container = document.getElementById('ghost-preview-container');
    if (container) {
      container.classList.remove('visible');
      setTimeout(() => {
        if (container.parentNode) {
          container.remove();
        }
      }, 200);
    }
    this.cleanupGhostEventListeners();
    if (this.ghostPreviewAbortController) {
      this.ghostPreviewAbortController.abort();
      this.ghostPreviewAbortController = null;
    }
    this.currentGhostRequestId = null;
  }
  openSongEditModal(songId) {
    const song = this.songLibrary.find(s => s.id === songId);
    if (!song) {
      return;
    }
    let pendingLocalHandle = null;
    let pendingClearHandle = false;
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `\n\t        <div class="modal-content song-edit-modal-content">\n\t            <div class="song-edit-modal-header">\n\t                <h3>Edit Song Details</h3>\n\t                <span class="close-btn song-edit-close-btn">&times;</span>\n\t            </div>\n\t            <form class="song-edit-form">\n\t                <div class="song-edit-form-grid">\n\t                    <label class="song-edit-form-label">Song Name:</label>\n\t                    <input class="song-edit-form-input" data-field="name" type="text" required>\n\t\n\t                    <label class="song-edit-form-label">Author:</label>\n\t                    <input class="song-edit-form-input" data-field="author" type="text" placeholder="Author name (optional)">\n\t\n\t                    <label class="song-edit-form-label">YouTube URL:</label>\n\t                    <input class="song-edit-form-input" data-field="url" type="text" required>\n\t\n\t                    <label class="song-edit-form-label">Local file:</label>\n\t                    <div class="song-edit-local-file-wrapper">\n\t                        <button type="button" class="song-edit-local-file-btn" data-field="localFileBtn"></button>\n\t                        <button type="button" class="song-edit-unlink-btn" data-field="unlinkBtn" title="Remove local file">&#x2715;</button>\n\t                    </div>\n\t                </div>\n\t\n\t                <div class="song-edit-thumbnail-container">\n\t                    <img class="song-edit-thumbnail" data-field="thumbnail" alt="Video thumbnail">\n\t                </div>\n\t\n\t                <div class="song-edit-lyrics-container">\n\t                    <label class="song-edit-lyrics-label">Lyrics (Format: "Lyric line [MM:SS]" - one per line):</label>\n\t                    <textarea class="song-edit-lyrics-input" data-field="lyrics"\n\t                        placeholder="Enter lyrics with timestamps like:&#10;This is the end [0:33]&#10;Hold your breath and count to ten [0:38]"></textarea>\n\t                </div>\n\t\n\t                <button type="submit" class="song-edit-save-btn">Save Changes</button>\n\t            </form>\n\t        </div>\n\t    `;
    const nameInput = modal.querySelector('[data-field="name"]');
    const authorInput = modal.querySelector('[data-field="author"]');
    const urlInput = modal.querySelector('[data-field="url"]');
    const localFileBtn = modal.querySelector('[data-field="localFileBtn"]');
    const unlinkBtn = modal.querySelector('[data-field="unlinkBtn"]');
    const thumbnail = modal.querySelector('[data-field="thumbnail"]');
    const lyricsInput = modal.querySelector('[data-field="lyrics"]');
    const form = modal.querySelector('.song-edit-form');
    const closeBtn = modal.querySelector('.song-edit-close-btn');
    nameInput.value = song.name;
    authorInput.value = song.author || '';
    urlInput.value = `https://www.youtube.com/watch?v=${song.videoId}`;
    lyricsInput.value = song.lyrics || '';
    thumbnail.src = `https://img.youtube.com/vi/${song.videoId}/mqdefault.jpg`;
    localFileBtn.textContent = song.localFileName ? `📁 ${song.localFileName}` : 'Link local file';
    if (song.localFileName) {
      unlinkBtn.classList.add('active');
    }
    closeBtn.onclick = () => modal.remove();
    modal.addEventListener('click', e => {
      if (e.target === modal) {
        modal.remove();
      }
    });
    urlInput.addEventListener('input', () => {
      const videoId = this.extractYouTubeId(urlInput.value);
      thumbnail.style.display = videoId ? '' : 'none';
      if (videoId) {
        thumbnail.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
      }
    });
    localFileBtn.addEventListener('click', async () => {
      if (!window.showOpenFilePicker) {
        this.showNotification('Local file linking requires Chrome or Edge.', 'error');
        return;
      }
      try {
        const [handle] = await window.showOpenFilePicker({
          types: [ {
            description: 'Audio files',
            accept: {
              'audio/*': [ '.mp3', '.flac', '.wav', '.m4a', '.ogg', '.aac' ]
            }
          } ]
        });
        pendingLocalHandle = handle;
        pendingClearHandle = false;
        localFileBtn.textContent = `📁 ${handle.name}`;
        unlinkBtn.classList.add('active');
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.warn('File picker error:', error);
        }
      }
    });
    unlinkBtn.addEventListener('click', () => {
      pendingLocalHandle = null;
      pendingClearHandle = true;
      localFileBtn.textContent = 'Link local file';
      unlinkBtn.classList.remove('active');
    });
    form.addEventListener('submit', e => {
      e.preventDefault();
      const newName = nameInput.value.trim();
      const newAuthor = authorInput.value.trim();
      const newUrl = urlInput.value.trim();
      const newVideoId = this.extractYouTubeId(newUrl);
      const newLyrics = lyricsInput.value.trim();
      if (!newName) {
        this.showNotification('Please enter a song name.', 'error');
        return;
      }
      if (!newVideoId) {
        this.showNotification('Please enter a valid YouTube URL.', 'error');
        return;
      }
      let handleArg = undefined, handleNameArg = undefined;
      if (pendingClearHandle) {
        handleArg = null;
        handleNameArg = null;
      } else if (pendingLocalHandle) {
        handleArg = pendingLocalHandle;
        handleNameArg = pendingLocalHandle.name;
      }
      this.updateSongDetails(song.id, newName, newAuthor, newVideoId, newLyrics, handleArg, handleNameArg).then(() => {
        modal.remove();
        const songItem = document.querySelector(`.song-name[data-song-id="${song.id}"]`)?.closest('.song-item');
        if (songItem) {
          const nameSpan = songItem.querySelector('.song-name');
          if (nameSpan) {
            nameSpan.childNodes[0].textContent = newName;
            let authorEl = nameSpan.querySelector('.song-author');
            if (newAuthor) {
              if (!authorEl) {
                authorEl = document.createElement('small');
                authorEl.className = 'song-author';
                nameSpan.appendChild(authorEl);
              }
              authorEl.textContent = `by ${newAuthor}`;
            } else {
              authorEl?.remove();
            }
          }
          const updatedSong = this.songLibrary.find(s => s.id === song.id);
          const isDl = !!updatedSong?.localFileHandle;
          const isFav = !!updatedSong?.favorite;
          const hasLyrics = !!(updatedSong?.lyrics && updatedSong.lyrics.trim());
          const right = songItem.querySelector('.song-item-right');
          if (right) {
            let indicators = right.querySelector('.song-status-indicators');
            if (isFav || isDl || hasLyrics) {
              if (!indicators) {
                indicators = document.createElement('div');
                indicators.className = 'song-status-indicators';
                right.insertBefore(indicators, right.querySelector('.song-actions'));
              }
              const lyricsHtml = hasLyrics ? `<span class="song-lyrics-indicator" title="Has lyrics"><i class="fa fa-closed-captioning"></i></span>` : '';
              const dlHtml = isDl ? `<span class="song-dl-indicator"     title="Downloaded"><i class="fa fa-download"></i></span>` : '';
              const favHtml = isFav ? `<span class="song-fav-indicator"    title="Favourited"><i class="fa fa-star"></i></span>` : '';
              indicators.innerHTML = lyricsHtml + dlHtml + favHtml;
            } else {
              indicators?.remove();
            }
          }
          if (newVideoId !== song.videoId) {
            const favThumb = document.querySelector(`.fav-thumb[data-song-id="${song.id}"] img`);
            if (favThumb) {
              favThumb.src = `https://img.youtube.com/vi/${newVideoId}/mqdefault.jpg`;
            }
            const discThumb = document.querySelector(`.discovery-song-item[data-song-id="${song.id}"] img`);
            if (discThumb) {
              discThumb.src = `https://img.youtube.com/vi/${newVideoId}/mqdefault.jpg`;
            }
          }
        }
        this.showNotification('Song updated.', 'success');
      }).catch(err => {
        console.error('Error updating song details:', err);
        this.showNotification('Failed to update song details.', 'error');
      });
    });
    document.body.appendChild(modal);
  }
  updateSongDetails(songId, newName, newAuthor, newVideoId, newLyrics = '', localFileHandle = undefined, localFileName = undefined) {
    return new Promise((resolve, reject) => {
      try {
        const songIndex = this.songLibrary.findIndex(song => song.id === songId);
        if (songIndex === -1) {
          reject(new Error('Song not found'));
          return;
        }
        this.songLibrary[songIndex].name = newName;
        this.songLibrary[songIndex].author = newAuthor;
        this.songLibrary[songIndex].videoId = newVideoId;
        this.songLibrary[songIndex].lyrics = newLyrics;
        if (localFileHandle !== undefined) {
          this.songLibrary[songIndex].localFileHandle = localFileHandle;
          this.songLibrary[songIndex].localFileName = localFileName ?? null;
        }
        this.playlists.forEach(playlist => {
          const idx = playlist.songs.findIndex(s => s.id === songId);
          if (idx !== -1) {
            playlist.songs[idx].name = newName;
            playlist.songs[idx].author = newAuthor;
            playlist.songs[idx].videoId = newVideoId;
            playlist.songs[idx].lyrics = newLyrics;
          }
        });
        this.saveSingleSong(this.songLibrary[songIndex]).then(() => this.savePlaylists()).then(() => {
          if (this.currentPlaylist && this.currentPlaylist.songs[this.currentSongIndex]?.id === songId) {
            if (this.elements.currentSongName) {
              this.elements.currentSongName.textContent = newName;
            }
            if (document.getElementById('lyrics').classList.contains('active')) {
              this.renderLyricsTab();
            }
          }
          if (this.isSidebarVisible && this.currentPlaylist) {
            this.renderCurrentPlaylistInSidebar();
          }
          resolve();
        }).catch(error => {
          console.error('Error saving updated song details:', error);
          reject(error);
        });
      } catch (error) {
        console.error('Exception in updateSongDetails:', error);
        reject(error);
      }
    });
  }
  extractYouTubeId(url) {
    if (!url) {
      return null;
    }
    const urlPattern = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const urlMatch = url.match(urlPattern);
    if (urlMatch) {
      return urlMatch[1];
    }
    if (/^[a-zA-Z0-9_-]{11}$/.test(url) && /[0-9_-]/.test(url)) {
      return url;
    }
    return null;
  }
  fetchYouTubeTitle(videoId) {
    return new Promise((resolve, reject) => {
      const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
      fetch(url).then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch video info');
        }
        return response.json();
      }).then(data => {
        resolve(data.title);
      }).catch(error => {
        console.error('Error fetching YouTube title:', error);
        reject(error);
      });
    });
  }
  fetchYouTubeChannel(videoId) {
    return new Promise((resolve, reject) => {
      const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
      fetch(url).then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch video info');
        }
        return response.json();
      }).then(data => {
        let channelName = data.author_name;
        channelName = channelName.replace(/\s*-\s*Topic\s*$/i, '').replace(/^Topic\s*-\s*/i, '').replace(/^\[Topic\]\s*/i, '').replace(/\s*\[Topic\]$/i, '').replace(/^\(Topic\)\s*/i, '').replace(/\s*\(Topic\)$/i, '').replace(/^Topic\s+/i, '').replace(/\s+Topic$/i, '').replace(/\s*\|\s*Topic\s*$/i, '').replace(/^Topic\s*\|\s*/i, '').replace(/\s*\.\s*Topic\s*$/i, '').replace(/^Topic\s*\.\s*/i, '').replace(/\s*:\s*Topic\s*$/i, '').replace(/^Topic\s*:\s*/i, '').trim();
        resolve(channelName);
      }).catch(error => {
        console.error('Error fetching YouTube channel:', error);
        reject(error);
      });
    });
  }
  handleUrlPaste() {
    const songUrl = this.elements.songUrlInput.value.trim();
    const songName = this.elements.songNameInput.value.trim();
    if (songUrl) {
      const videoId = this.extractYouTubeId(songUrl);
      if (videoId) {
        this.showYouTubeThumbnailPreview(videoId);
        this.elements.autofillBtn.disabled = false;
        if (!songName) {
          this.fetchYouTubeTitle(videoId).then(title => {
            if (title && !this.elements.songNameInput.value.trim()) {
              this.elements.songNameInput.value = title;
            }
          }).catch(error => {
            console.warn('Could not fetch YouTube title:', error);
          });
        }
      } else {
        this.removeYouTubeThumbnailPreview();
        this.elements.autofillBtn.disabled = true;
      }
    } else {
      this.removeYouTubeThumbnailPreview();
      this.elements.autofillBtn.disabled = true;
    }
  }
  openLibraryModal() {
    this.elements.libraryModificationModal.style.display = 'flex';
  }
  closeLibraryModal() {
    this.elements.libraryModificationModal.style.display = 'none';
    this.removeGhostPreview();
    if (typeof this.onLibraryModalCloseCallback === 'function') {
      const callback = this.onLibraryModalCloseCallback;
      this.onLibraryModalCloseCallback = null;
      callback();
    }
  }
  initLibraryFilter() {
    this._libFilters = {
      favorite: null,
      lyrics: null,
      downloaded: null
    };
    const btn = document.getElementById('libFilterBtn');
    const panel = document.getElementById('libFilterPanel');
    if (!btn || !panel) {
      return;
    }
    let _hideTimer = null;
    const showPanel = () => {
      clearTimeout(_hideTimer);
      panel.classList.add('open');
    };
    const hidePanel = () => {
      clearTimeout(_hideTimer);
      _hideTimer = setTimeout(() => panel.classList.remove('open'), 300);
    };
    btn.addEventListener('mouseenter', showPanel);
    btn.addEventListener('mouseleave', hidePanel);
    panel.addEventListener('mouseenter', showPanel);
    panel.addEventListener('mouseleave', hidePanel);
    panel.addEventListener('click', e => {
      const toggleBtn = e.target.closest('.lib-filter-toggle button');
      if (!toggleBtn) {
        return;
      }
      const group = toggleBtn.closest('.lib-filter-toggle');
      const filter = group.dataset.filter;
      const raw = toggleBtn.dataset.val;
      const val = raw === 'null' ? null : raw === 'true';
      group.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      toggleBtn.classList.add('active');
      this._libFilters[filter] = val;
      const anyActive = Object.values(this._libFilters).some(v => v !== null);
      btn.classList.toggle('is-active', anyActive);
      this._applyLibraryFiltersAndRender();
    });
  }
  _applyFilters(songs) {
    const f = this._libFilters;
    return songs.filter(song => {
      if (f.favorite !== null && !!song.favorite !== f.favorite) {
        return false;
      }
      if (f.lyrics !== null && !!song.lyrics?.trim() !== f.lyrics) {
        return false;
      }
      if (f.downloaded !== null && !!song.localFileHandle !== f.downloaded) {
        return false;
      }
      return true;
    });
  }
  _applyLibraryFiltersAndRender() {
    const searchTerm = this.elements.librarySearch?.value.toLowerCase().trim() || '';
    if (searchTerm === '') {
      this.renderLibraryView();
    } else {
      this.renderSongLibrary(searchTerm);
    }
  }
  resetLibrarySearchTimeout() {
    clearTimeout(this.librarySearchTimeout);
    this.librarySearchTimeout = setTimeout(() => {
      if (this.elements.librarySearch) {
        this.elements.librarySearch.blur();
      }
    }, 6e4);
  }
  _setupSongItemDragDrop() {
    const AUDIO_EXTS = new Set([ '.mp3', '.flac', '.wav', '.m4a', '.ogg', '.aac', '.opus', '.weba' ]);
    const container = this.elements.songLibrary;
    let activeItem = null;
    const getAudioFile = dt => {
      const files = [ ...dt.files || [] ];
      return files.find(f => {
        const ext = '.' + f.name.split('.').pop().toLowerCase();
        return AUDIO_EXTS.has(ext);
      }) || null;
    };
    const getSongItem = el => el?.closest?.('.song-item') || null;
    const highlight = (item, on) => {
      if (!item) {
        return;
      }
      item.classList.toggle('drag-audio-over', on);
    };
    container.addEventListener('dragenter', e => {
      const file = [ ...e.dataTransfer?.items || [] ].find(i => i.kind === 'file');
      if (!file) {
        return;
      }
      const item = getSongItem(e.target);
      if (!item) {
        return;
      }
      e.preventDefault();
      if (activeItem && activeItem !== item) {
        highlight(activeItem, false);
      }
      activeItem = item;
      highlight(item, true);
    }, false);
    container.addEventListener('dragover', e => {
      const item = getSongItem(e.target);
      if (!item) {
        return;
      }
      e.preventDefault();
      e.dataTransfer.dropEffect = 'link';
    }, false);
    container.addEventListener('dragleave', e => {
      const item = getSongItem(e.target);
      if (!item || item.contains(e.relatedTarget)) {
        return;
      }
      highlight(item, false);
      if (activeItem === item) {
        activeItem = null;
      }
    }, false);
    container.addEventListener('drop', async e => {
      const item = getSongItem(e.target);
      if (!item) {
        return;
      }
      e.preventDefault();
      highlight(item, false);
      activeItem = null;
      const audioFile = getAudioFile(e.dataTransfer);
      if (!audioFile) {
        this.showNotification('Drop an audio file (.mp3, .flac, .wav…)', 'error');
        return;
      }
      if (!window.showOpenFilePicker) {
        this.showNotification('File linked for this session only (Chrome/Edge needed for persistent link).', 'info');
      }
      const songId = parseInt(item.querySelector('[data-song-id]')?.dataset.songId);
      const song = this.songLibrary.find(s => s.id === songId);
      if (!song) {
        return;
      }
      item.classList.add('drag-audio-linking');
      const right = item.querySelector('.song-item-right');
      let toast = right?.querySelector('.drag-link-toast');
      if (!toast && right) {
        toast = document.createElement('span');
        toast.className = 'drag-link-toast';
        toast.textContent = '⏳ Linking…';
        right.prepend(toast);
      }
      try {
        let handle = null;
        const dtItem = [ ...e.dataTransfer.items ].find(i => i.kind === 'file');
        if (dtItem?.getAsFileSystemHandle) {
          handle = await dtItem.getAsFileSystemHandle();
        }
        const songIndex = this.songLibrary.findIndex(s => s.id === songId);
        if (songIndex !== -1) {
          this.songLibrary[songIndex].localFileHandle = handle;
          this.songLibrary[songIndex].localFileName = audioFile.name;
          await this.saveSingleSong(this.songLibrary[songIndex]);
        }
        if (toast) {
          toast.textContent = `✓ ${audioFile.name}`;
          toast.classList.add('drag-link-success');
        }
        item.classList.add('drag-audio-done');
        let indicators = right?.querySelector('.song-status-indicators');
        if (!indicators && right) {
          indicators = document.createElement('div');
          indicators.className = 'song-status-indicators';
          right.insertBefore(indicators, right.querySelector('.song-actions'));
        }
        if (indicators) {
          const updatedSong = this.songLibrary.find(s => s.id === songId);
          const isFav = !!updatedSong?.favorite;
          const hasLyrics = !!updatedSong?.lyrics?.trim();
          const lyricsHtml = hasLyrics ? `<span class="song-lyrics-indicator" title="Has lyrics"><i class="fa fa-closed-captioning"></i></span>` : '';
          const dlHtml = `<span class="song-dl-indicator" title="Downloaded"><i class="fa fa-download"></i></span>`;
          const favHtml = isFav ? `<span class="song-fav-indicator" title="Favourited"><i class="fa fa-star"></i></span>` : '';
          indicators.innerHTML = lyricsHtml + dlHtml + favHtml;
        }
        setTimeout(() => {
          toast?.remove();
          item.classList.remove('drag-audio-done', 'drag-audio-linking');
        }, 2500);
        this.showNotification(`Linked: ${audioFile.name}`, 'success');
      } catch (error) {
        console.error('Drag-link error:', error);
        if (toast) {
          toast.textContent = '✗ Failed';
          toast.classList.add('drag-link-error');
        }
        setTimeout(() => {
          toast?.remove();
          item.classList.remove('drag-audio-linking');
        }, 2e3);
        this.showNotification('Failed to link file.', 'error');
      }
    }, false);
  }
  showWelcomeModal() {
    if (this.songLibrary.length > 0) {
      return;
    }
    const modal = document.createElement('div');
    modal.classList.add('modal', 'welcome-modal');
    modal.style.display = 'block';
    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-content', 'welcome-content');
    const closeBtn = document.createElement('span');
    closeBtn.classList.add('close-btn');
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = () => modal.remove();
    const heading = document.createElement('h2');
    heading.textContent = 'Welcome to Music Player!';
    const instructions = document.createElement('div');
    instructions.classList.add('welcome-instructions');
    this.loadInstructions(instructions);
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('welcome-buttons');
    const skipBtn = document.createElement('button');
    skipBtn.textContent = 'Get Started';
    skipBtn.classList.add('welcome-skip-btn');
    skipBtn.onclick = () => modal.remove();
    const addSongsBtn = document.createElement('button');
    addSongsBtn.textContent = 'Add Songs to Get Started';
    addSongsBtn.classList.add('welcome-add-songs-btn');
    addSongsBtn.onclick = () => {
      this.openFindSongs();
      modal.remove();
    };
    buttonContainer.appendChild(skipBtn);
    buttonContainer.appendChild(addSongsBtn);
    modalContent.appendChild(closeBtn);
    modalContent.appendChild(heading);
    modalContent.appendChild(instructions);
    modalContent.appendChild(buttonContainer);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
  }
  loadInstructions(instructionsElement) {
    fetch('instructions.txt').then(response => {
      if (!response.ok) {
        throw new Error('Failed to load instructions');
      }
      return response.text();
    }).then(text => {
      instructionsElement.innerHTML = `<p>${text.replace(/\n\n/g, '</p><p>')}</p>`;
    }).catch(error => {
      console.error('Error loading instructions:', error);
      instructionsElement.innerHTML = `\n                    <p>Welcome to your music player! Add songs from YouTube, create playlists, and enjoy your music.</p>\n                    <p>Get started by importing a playlist below or add songs manually.</p>\n                `;
    });
  }
  createPlaylist() {
    const playlistName = this.elements.newPlaylistName.value.trim();
    if (!playlistName) {
      alert('Please enter a playlist name');
      return;
    }
    if (this.playlists.some(p => p.name.toLowerCase() === playlistName.toLowerCase())) {
      alert('A playlist with this name already exists');
      return;
    }
    const newPlaylist = {
      id: Date.now(),
      name: playlistName,
      songs: [],
      position: this.playlists.length
    };
    this.playlists.push(newPlaylist);
    this.savePlaylists().then(() => {
      this.renderPlaylists();
      this.updatePlaylistSelection();
      this.elements.newPlaylistName.value = '';
      this.hideCreatePlaylistDiv();
      this.filterPlaylists();
    }).catch(error => {
      console.error('Error creating playlist:', error);
      alert('Failed to create playlist. Please try again.');
    });
  }
  togglePlaylistEditMode() {
    this.playlistEditModeActive = !this.playlistEditModeActive;
    this.updatePlaylistEditModeButton();
    this.renderPlaylists();
  }
  updatePlaylistEditModeButton() {
    const button = this.elements.togglePlaylistEditModeBtn;
    if (this.playlistEditModeActive) {
      button.textContent = 'Done';
      button.classList.add('playlist-edit-mode-active');
    } else {
      button.textContent = 'Edit';
      button.classList.remove('playlist-edit-mode-active');
    }
  }
  renderPlaylists() {
    this._refreshPlaylistsShelf();
    this.elements.playlistContainer.innerHTML = '';
    const playlistsToRender = this.currentSearchTerm ? this.filteredPlaylists : this.playlists;
    const sortedPlaylists = [ ...playlistsToRender ].sort((a, b) => {
      if (a.position !== undefined && b.position !== undefined) {
        return a.position - b.position;
      }
      return 0;
    });
    if (sortedPlaylists.length === 0 && this.currentSearchTerm) {
      const noResultsElement = document.createElement('div');
      noResultsElement.classList.add('no-results-message');
      noResultsElement.innerHTML = `<p>No playlists found matching "${this.currentSearchTerm}"</p>`;
      this.elements.playlistContainer.appendChild(noResultsElement);
      return;
    }
    sortedPlaylists.forEach((playlist, index) => {
      if (playlist.position === undefined) {
        playlist.position = index;
      }
      const duration = this.getPlaylistDuration(playlist);
      let durationText = '';
      if (playlist.songs.length > 0) {
        durationText = ` • ${duration}`;
      }
      const playlistElement = document.createElement('div');
      playlistElement.classList.add('playlist-card');
      playlistElement.dataset.playlistId = playlist.id;
      playlistElement.dataset.position = playlist.position;
      playlistElement.draggable = false;
      let playlistActionsHTML = '';
      if (this.playlistEditModeActive) {
        playlistActionsHTML = `\n                <div class="playlist-actions">\n                    <button onclick="musicPlayer.openPlaylistEditModal(${playlist.id})">Edit</button>\n                    <button onclick="musicPlayer.deletePlaylist(${playlist.id})">Delete</button>\n                    <button onclick="musicPlayer.playPlaylist(${playlist.id})">Play</button>\n                </div>\n            `;
      } else {
        playlistActionsHTML = `\n                <div class="playlist-actions">\n                    <button onclick="musicPlayer.playPlaylist(${playlist.id})">Play</button>\n                </div>\n            `;
      }
      playlistElement.innerHTML = `\n            <h3 class="playlist-name">${playlist.name}</h3>\n            <p>${playlist.songs.length} song${playlist.songs.length !== 1 ? 's' : ''}${durationText}</p>\n            ${playlistActionsHTML}\n        `;
      let holdTimer;
      let isDragging = false;
      let isMouseDown = false;
      let startTime = 0;
      playlistElement.addEventListener('mousedown', e => {
        if (e.target.tagName === 'BUTTON') {
          return;
        }
        isMouseDown = true;
        startTime = Date.now();
        holdTimer = setTimeout(() => {
          playlistElement.draggable = true;
          playlistElement.classList.add('draggable');
          isDragging = true;
        }, 500);
      });
      playlistElement.addEventListener('mouseup', e => {
        if (e.target.tagName === 'BUTTON') {
          return;
        }
        clearTimeout(holdTimer);
        if (isMouseDown && !isDragging) {
          const endTime = Date.now();
          const clickDuration = endTime - startTime;
          if (clickDuration < 300) {
            this.playPlaylist(playlist.id);
          }
        }
        if (!isDragging) {
          playlistElement.draggable = false;
          playlistElement.classList.remove('draggable');
        }
        isMouseDown = false;
      });
      playlistElement.addEventListener('mouseleave', () => {
        clearTimeout(holdTimer);
        isMouseDown = false;
      });
      playlistElement.addEventListener('selectstart', e => {
        if (isDragging) {
          e.preventDefault();
        }
      });
      playlistElement.addEventListener('touchstart', e => {
        if (e.target.tagName === 'BUTTON') {
          return;
        }
        isMouseDown = true;
        startTime = Date.now();
        holdTimer = setTimeout(() => {
          playlistElement.draggable = true;
          playlistElement.classList.add('draggable');
          isDragging = true;
        }, 500);
      });
      playlistElement.addEventListener('touchend', e => {
        if (e.target.tagName === 'BUTTON') {
          return;
        }
        clearTimeout(holdTimer);
        if (isMouseDown && !isDragging) {
          const endTime = Date.now();
          const clickDuration = endTime - startTime;
          if (clickDuration < 300) {
            this.playPlaylist(playlist.id);
          }
        }
        if (!isDragging) {
          playlistElement.draggable = false;
          playlistElement.classList.remove('draggable');
        }
        isMouseDown = false;
        e.preventDefault();
      });
      playlistElement.addEventListener('dragstart', this.handlePlaylistDragStart.bind(this));
      playlistElement.addEventListener('dragover', this.handlePlaylistDragOver.bind(this));
      playlistElement.addEventListener('drop', this.handlePlaylistDrop.bind(this));
      playlistElement.addEventListener('dragend', e => {
        e.currentTarget.classList.remove('dragging');
        isDragging = false;
        setTimeout(() => {
          playlistElement.draggable = false;
          playlistElement.classList.remove('draggable');
        }, 100);
      });
      this.elements.playlistContainer.appendChild(playlistElement);
    });
  }
  filterPlaylists() {
    this.currentSearchTerm = this.elements.playlistSearch.value.toLowerCase().trim();
    if (this.currentSearchTerm === '') {
      this.filteredPlaylists = [ ...this.playlists ];
    } else {
      this.filteredPlaylists = this.playlists.filter(playlist => playlist.name.toLowerCase().includes(this.currentSearchTerm));
    }
    this.renderPlaylists();
  }
  playTopPlaylistSearchResult() {
    const searchTerm = this.elements.playlistSearch.value.toLowerCase().trim();
    let targetPlaylists;
    if (searchTerm === '') {
      targetPlaylists = this.playlists;
    } else {
      targetPlaylists = this.playlists.filter(playlist => playlist.name.toLowerCase().includes(searchTerm));
    }
    if (targetPlaylists.length === 0) {
      alert('No playlists found');
      return;
    }
    const topPlaylist = targetPlaylists[0];
    this.playPlaylist(topPlaylist.id);
  }
  toggleCreatePlaylistDiv() {
    const createDiv = this.elements.createPlaylistDiv;
    const isVisible = createDiv.style.display !== 'none';
    if (isVisible) {
      createDiv.style.display = 'none';
      this.elements.toggleCreatePlaylistBtn.textContent = '+';
      this.elements.toggleCreatePlaylistBtn.style.transform = 'rotate(0deg)';
    } else {
      createDiv.style.display = 'block';
      this.elements.toggleCreatePlaylistBtn.textContent = '×';
      this.elements.toggleCreatePlaylistBtn.style.transform = 'rotate(45deg)';
      setTimeout(() => {
        this.elements.newPlaylistName.focus();
      }, 100);
    }
  }
  hideCreatePlaylistDiv() {
    this.elements.createPlaylistDiv.style.display = 'none';
    this.elements.toggleCreatePlaylistBtn.textContent = '+';
    this.elements.toggleCreatePlaylistBtn.style.transform = 'rotate(0deg)';
  }
  openPlaylistEditModal(playlistId) {
    const playlist = this.playlists.find(p => p.id === playlistId);
    if (!playlist) {
      return;
    }
    this.elements.currentPlaylistName.textContent = playlist.name;
    this.elements.currentPlaylistName.dataset.playlistId = playlistId;
    this.setupPlaylistNameEditing();
    this.renderCurrentPlaylistSongs(playlist);
    this.createDuplicateToggle();
    this.renderLibrarySearchResults(playlist);
    this.elements.playlistEditModal.style.display = 'block';
  }
  createDuplicateToggle() {
    let toggleContainer = document.querySelector('.duplicate-toggle-container');
    if (!toggleContainer) {
      toggleContainer = document.createElement('div');
      toggleContainer.className = 'duplicate-toggle-container';
      const duplicatesBtn = document.createElement('button');
      duplicatesBtn.className = 'playlist-action-btn';
      duplicatesBtn.id = 'allowDuplicatesBtn';
      this.updateDuplicatesButtonText(duplicatesBtn);
      duplicatesBtn.addEventListener('click', () => {
        this.allowDuplicates = !this.allowDuplicates;
        this.saveSetting('allowDuplicates', this.allowDuplicates);
        this.updateDuplicatesButtonText(duplicatesBtn);
        const playlistId = parseInt(this.elements.currentPlaylistName.dataset.playlistId);
        const playlist = this.playlists.find(p => p.id === playlistId);
        if (playlist) {
          this.renderLibrarySearchResults(playlist);
        }
      });
      toggleContainer.appendChild(duplicatesBtn);
      const clearDuplicatesBtn = document.createElement('button');
      clearDuplicatesBtn.className = 'playlist-action-btn';
      clearDuplicatesBtn.textContent = 'Clear Duplicates';
      clearDuplicatesBtn.addEventListener('click', () => {
        this.clearPlaylistDuplicates();
      });
      toggleContainer.appendChild(clearDuplicatesBtn);
      const reverseBtn = document.createElement('button');
      reverseBtn.className = 'playlist-action-btn';
      reverseBtn.textContent = 'Reverse Position';
      reverseBtn.addEventListener('click', () => {
        this.reversePlaylistOrder();
      });
      toggleContainer.appendChild(reverseBtn);
      const searchContainer = this.elements.searchSongsToAdd.parentElement;
      searchContainer.insertBefore(toggleContainer, this.elements.librarySearchResults.nextSibling);
    } else {
      const duplicatesBtn = toggleContainer.querySelector('#allowDuplicatesBtn');
      if (duplicatesBtn) {
        this.updateDuplicatesButtonText(duplicatesBtn);
      }
    }
  }
  updateDuplicatesButtonText(button) {
    if (this.allowDuplicates) {
      button.textContent = 'Duplicates Allowed';
      button.classList.remove('duplicates-banned');
      button.classList.add('duplicates-allowed');
    } else {
      button.textContent = 'Duplicates Banned';
      button.classList.remove('duplicates-allowed');
      button.classList.add('duplicates-banned');
    }
  }
  renderCurrentPlaylistSongs(playlist) {
    this.elements.currentPlaylistSongs.innerHTML = '';
    if (playlist.songs.length > 0) {
      const randomizeBtn = document.createElement('button');
      randomizeBtn.className = 'randomize-btn-absolute';
      randomizeBtn.innerHTML = '<i class="fa fa-refresh"></i>';
      randomizeBtn.title = 'Randomize Playlist';
      randomizeBtn.addEventListener('click', () => {
        this.randomizePlaylist();
      });
      this.elements.currentPlaylistSongs.appendChild(randomizeBtn);
    }
    playlist.songs.forEach((song, index) => {
      const songElement = document.createElement('div');
      songElement.classList.add('playlist-song-item');
      songElement.draggable = true;
      songElement.dataset.videoId = song.videoId;
      songElement.dataset.entryId = song.entryId || Date.now() + index;
      songElement.dataset.index = index;
      songElement.innerHTML = `\n                <span class="drag-handle">☰</span>\n                <span class="song-name">${this.escapeHtml(song.name)}</span>\n                <button class="remove-song-btn">Remove</button>\n            `;
      const removeBtn = songElement.querySelector('.remove-song-btn');
      if (removeBtn) {
        removeBtn.addEventListener('click', () => {
          this.removeSongFromPlaylist(playlist.id, song.entryId || songElement.dataset.entryId);
        });
      }
      songElement.addEventListener('dragstart', this.handleDragStart.bind(this));
      songElement.addEventListener('dragover', this.handleDragOver.bind(this));
      songElement.addEventListener('drop', this.handleDrop.bind(this));
      songElement.addEventListener('dragend', this.handleDragEnd.bind(this));
      this.elements.currentPlaylistSongs.appendChild(songElement);
    });
  }
  searchSongsToAddToPlaylist() {
    const playlistId = parseInt(this.elements.currentPlaylistName.dataset.playlistId);
    const playlist = this.playlists.find(p => p.id === playlistId);
    if (!playlist) {
      return;
    }
    this.renderLibrarySearchResults(playlist);
  }
  clearPlaylistDuplicates() {
    const playlistId = parseInt(this.elements.currentPlaylistName.dataset.playlistId);
    const playlist = this.playlists.find(p => p.id === playlistId);
    if (!playlist) {
      return;
    }
    const seenVideoIds = new Set();
    const uniqueSongs = [];
    playlist.songs.forEach(song => {
      if (!seenVideoIds.has(song.videoId)) {
        seenVideoIds.add(song.videoId);
        uniqueSongs.push(song);
      }
    });
    if (uniqueSongs.length !== playlist.songs.length) {
      playlist.songs = uniqueSongs;
      this.savePlaylists().then(() => {
        this.renderCurrentPlaylistSongs(playlist);
        this.renderLibrarySearchResults(playlist);
        this.renderPlaylists();
      }).catch(error => {
        console.error('Error clearing duplicates:', error);
        alert('Failed to clear duplicates. Please try again.');
      });
    } else {
      alert('No duplicates found in this playlist.');
    }
  }
  reversePlaylistOrder() {
    const playlistId = parseInt(this.elements.currentPlaylistName.dataset.playlistId);
    const playlist = this.playlists.find(p => p.id === playlistId);
    if (!playlist) {
      return;
    }
    playlist.songs.reverse();
    this.savePlaylists().then(() => {
      this.renderCurrentPlaylistSongs(playlist);
      this.renderPlaylists();
    }).catch(error => {
      console.error('Error reversing playlist:', error);
      alert('Failed to reverse playlist. Please try again.');
    });
  }
  randomizePlaylist() {
    const playlistId = parseInt(this.elements.currentPlaylistName.dataset.playlistId);
    const playlist = this.playlists.find(p => p.id === playlistId);
    if (!playlist) {
      return;
    }
    for (let i = playlist.songs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [playlist.songs[i], playlist.songs[j]] = [ playlist.songs[j], playlist.songs[i] ];
    }
    this.savePlaylists().then(() => {
      this.renderCurrentPlaylistSongs(playlist);
      this.renderPlaylists();
    }).catch(error => {
      console.error('Error randomizing playlist:', error);
      alert('Failed to randomize playlist. Please try again.');
    });
  }
  renderLibrarySearchResults(playlist) {
    const searchTerm = this.elements.searchSongsToAdd.value.toLowerCase();
    this.elements.librarySearchResults.innerHTML = '';
    let songsToShow = this.songLibrary;
    if (!this.allowDuplicates) {
      const playlistVideoIds = new Set(playlist.songs.map(song => song.videoId));
      songsToShow = this.songLibrary.filter(song => !playlistVideoIds.has(song.videoId));
    }
    songsToShow.forEach(song => {
      const songNameMatch = song.name.toLowerCase().includes(searchTerm);
      const authorMatch = song.author && song.author.toLowerCase().includes(searchTerm);
      if (songNameMatch || authorMatch) {
        const songElement = document.createElement('div');
        songElement.classList.add('search-song-item');
        const spanElement = document.createElement('span');
        spanElement.textContent = song.name;
        const buttonElement = document.createElement('button');
        buttonElement.textContent = 'Add';
        buttonElement.addEventListener('click', () => {
          this.addSongToCurrentPlaylist(song.name, song.videoId);
        });
        songElement.appendChild(spanElement);
        songElement.appendChild(buttonElement);
        this.elements.librarySearchResults.appendChild(songElement);
      }
    });
  }
  addSongToCurrentPlaylist(songName, videoId) {
    const playlistId = parseInt(this.elements.currentPlaylistName.dataset.playlistId);
    const playlist = this.playlists.find(p => p.id === playlistId);
    if (!playlist) {
      return;
    }
    const librarySong = this.songLibrary.find(s => s.videoId === videoId);
    playlist.songs.push({
      name: songName,
      videoId: videoId,
      author: librarySong?.author || '',
      entryId: Date.now()
    });
    this.savePlaylists().then(() => {
      this.renderCurrentPlaylistSongs(playlist);
      this.renderLibrarySearchResults(playlist);
      this.renderPlaylists();
    }).catch(error => {
      console.error('Error adding song to playlist:', error);
      alert('Failed to add song to playlist. Please try again.');
    });
  }
  addSongToSelectedPlaylist() {
    const selectedPlaylistId = parseInt(this.elements.playlistSelectionForSong.value);
    const selectedSongName = this.elements.songNameInput.value.trim();
    const selectedSongUrl = this.elements.songUrlInput.value.trim();
    if (!selectedSongName || !selectedSongUrl) {
      alert('Please enter song name and URL');
      return;
    }
    const videoId = this.extractYouTubeId(selectedSongUrl);
    if (!videoId) {
      alert('Invalid YouTube URL');
      return;
    }
    const newSong = {
      name: selectedSongName,
      videoId: videoId,
      entryId: Date.now()
    };
    const playlist = this.playlists.find(p => p.id === selectedPlaylistId);
    if (playlist) {
      playlist.songs.push(newSong);
      this.savePlaylists().then(() => {
        this.renderPlaylists();
        this.elements.songNameInput.value = '';
        this.elements.songUrlInput.value = '';
      }).catch(error => {
        console.error('Error adding song to playlist:', error);
        alert('Failed to add song to playlist. Please try again.');
      });
    }
  }
  updatePlaylistSelection() {
    if (this.elements.playlistSelectionForSong) {
      this.elements.playlistSelectionForSong.innerHTML = '';
      this.playlists.forEach(playlist => {
        const option = document.createElement('option');
        option.value = playlist.id;
        option.textContent = playlist.name;
        this.elements.playlistSelectionForSong.appendChild(option);
      });
    }
  }
  removeSongFromPlaylist(playlistId, entryId) {
    const playlist = this.playlists.find(p => p.id === playlistId);
    if (playlist) {
      playlist.songs = playlist.songs.filter(song => song.entryId != entryId);
      this.savePlaylists().then(() => {
        this.renderCurrentPlaylistSongs(playlist);
        this.renderLibrarySearchResults(playlist);
        this.renderPlaylists();
        if (this.currentPlaylist && this.currentPlaylist.id === playlistId) {
          this.renderPlaylistSidebar();
        }
      }).catch(error => {
        console.error('Error removing song from playlist:', error);
        alert('Failed to remove song from playlist. Please try again.');
      });
    }
  }
  closePlaylistModal() {
    if (this.elements.playlistEditModal) {
      this.elements.playlistEditModal.style.display = 'none';
    }
    if (this.elements.playlistSongsModal) {
      this.elements.playlistSongsModal.style.display = 'none';
    }
    this.elements.playlistEditModal.style.display = 'none';
    if (this.handlePlaylistNameClick) {
      this.elements.currentPlaylistName.removeEventListener('click', this.handlePlaylistNameClick);
    }
  }
  deletePlaylist(playlistId) {
    const playlist = this.playlists.find(p => p.id === playlistId);
    if (!playlist) {
      return;
    }
    const confirmDelete = confirm(`Are you sure you want to delete the playlist "${playlist.name}"?`);
    if (!confirmDelete) {
      return;
    }
    if (this.currentPlaylist && this.currentPlaylist.id === playlistId) {
      if (this.isLocalPlayback && this.localAudio) {
        this.localAudio.pause();
      } else if (this.ytPlayer) {
        this.ytPlayer.stopVideo();
      }
      this.currentPlaylist = null;
      this.isPlaying = false;
      this.isLocalPlayback = false;
      this.updatePlayerUI();
      this.hideSidebar();
    }
    this.playlists = this.playlists.filter(p => p.id !== playlistId);
    this.savePlaylists().then(() => {
      this.renderPlaylists();
      this.updatePlaylistSelection();
    }).catch(error => {
      console.error('Error deleting playlist:', error);
      alert('Failed to delete playlist. Please try again.');
    });
  }
  playPlaylist(playlistId) {
    const playlist = this.playlists.find(p => p.id === playlistId);
    if (!playlist || !playlist.songs.length) {
      alert('Playlist is empty');
      return;
    }
    this.currentPlaylist = playlist;
    this.currentSongIndex = 0;
    if (this.temporarilySkippedSongs.size > 0) {
      let foundNonSkipped = false;
      for (let i = 0; i < playlist.songs.length; i++) {
        const entryId = playlist.songs[i].entryId || 'id_' + playlist.songs[i].videoId;
        if (!this.temporarilySkippedSongs.has(entryId)) {
          this.currentSongIndex = i;
          foundNonSkipped = true;
          break;
        }
      }
      if (!foundNonSkipped) {
        alert('All songs in this playlist are temporarily skipped');
        return;
      }
    }
    const currentSong = playlist.songs[this.currentSongIndex];
    this.currentSong = currentSong;
    this.saveRecentlyPlayedSong(currentSong);
    this.playSongById(currentSong.videoId);
    this.showSidebar();
    this.renderPlaylistSidebar();
    this.saveRecentlyPlayedPlaylist(playlist);
    this.updateCurrentSongDisplay();
  }
  setupPlaylistNameEditing() {
    this.elements.currentPlaylistName.removeEventListener('click', this.handlePlaylistNameClick);
    this.elements.currentPlaylistName.addEventListener('click', this.handlePlaylistNameClick = () => {
      const playlistId = parseInt(this.elements.currentPlaylistName.dataset.playlistId);
      const currentName = this.elements.currentPlaylistName.textContent;
      const nameElement = this.elements.currentPlaylistName;
      const styles = window.getComputedStyle(nameElement);
      const width = nameElement.offsetWidth;
      const height = nameElement.offsetHeight;
      const fontSize = styles.fontSize;
      const fontWeight = styles.fontWeight;
      const fontFamily = styles.fontFamily;
      const textAlign = styles.textAlign;
      const inputElement = document.createElement('input');
      inputElement.type = 'text';
      inputElement.value = currentName;
      inputElement.id = 'editPlaylistNameInput';
      inputElement.style.width = width + 'px';
      inputElement.style.height = height + 'px';
      inputElement.style.fontSize = fontSize;
      inputElement.style.fontWeight = fontWeight;
      inputElement.style.fontFamily = fontFamily;
      inputElement.style.textAlign = textAlign;
      inputElement.style.margin = '0';
      inputElement.style.padding = '0';
      nameElement.innerHTML = '';
      nameElement.appendChild(inputElement);
      inputElement.focus();
      inputElement.select();
      inputElement.addEventListener('blur', () => this.savePlaylistNameEdit(playlistId, inputElement));
      inputElement.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          e.preventDefault();
          inputElement.blur();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          this.cancelPlaylistNameEdit(playlistId);
        }
      });
      inputElement.addEventListener('click', e => e.stopPropagation());
    });
  }
  savePlaylistNameEdit(playlistId, inputElement) {
    const newName = inputElement.value.trim();
    if (!newName) {
      alert('Playlist name cannot be empty');
      this.cancelPlaylistNameEdit(playlistId);
      return;
    }
    const duplicatePlaylist = this.playlists.find(p => p.id !== playlistId && p.name.toLowerCase() === newName.toLowerCase());
    if (duplicatePlaylist) {
      alert('A playlist with this name already exists');
      this.cancelPlaylistNameEdit(playlistId);
      return;
    }
    const playlist = this.playlists.find(p => p.id === playlistId);
    if (playlist) {
      playlist.name = newName;
      this.savePlaylists().then(() => {
        this.elements.currentPlaylistName.textContent = newName;
        this.renderPlaylists();
      }).catch(error => {
        console.error('Error saving playlist name:', error);
        alert('Failed to save playlist name. Please try again.');
        this.cancelPlaylistNameEdit(playlistId);
      });
    }
  }
  cancelPlaylistNameEdit(playlistId) {
    const playlist = this.playlists.find(p => p.id === playlistId);
    if (playlist) {
      this.elements.currentPlaylistName.textContent = playlist.name;
    }
  }
  handleDragStart(e) {
    e.currentTarget.classList.add('dragging');
    e.dataTransfer.setData('text/plain', e.currentTarget.dataset.index);
    e.dataTransfer.effectAllowed = 'move';
  }
  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const draggingElement = document.querySelector('.dragging');
    if (draggingElement !== e.currentTarget) {
      const container = this.elements.currentPlaylistSongs;
      const afterElement = this.getDragAfterElement(container, e.clientY);
      if (afterElement) {
        container.insertBefore(draggingElement, afterElement);
      } else {
        container.appendChild(draggingElement);
      }
    }
  }
  handleDrop(e) {
    e.preventDefault();
    const playlistId = parseInt(this.elements.currentPlaylistName.dataset.playlistId);
    const playlist = this.playlists.find(p => p.id === playlistId);
    if (!playlist) {
      return;
    }
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
    const items = Array.from(this.elements.currentPlaylistSongs.querySelectorAll('.playlist-song-item'));
    const toIndex = items.indexOf(e.currentTarget);
    if (fromIndex !== toIndex) {
      const [movedSong] = playlist.songs.splice(fromIndex, 1);
      playlist.songs.splice(toIndex, 0, movedSong);
      this.savePlaylists().then(() => {
        if (this.currentPlaylist && this.currentPlaylist.id === playlistId) {
          this.renderPlaylistSidebar();
        }
      }).catch(error => {
        console.error('Error reordering playlist:', error);
        alert('Failed to reorder playlist. Please try again.');
      });
    }
  }
  handleDragEnd(e) {
    e.currentTarget.classList.remove('dragging');
  }
  getDragAfterElement(container, y) {
    const draggableElements = [ ...container.querySelectorAll('.playlist-song-item:not(.dragging)') ];
    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return {
          offset: offset,
          element: child
        };
      } else {
        return closest;
      }
    }, {
      offset: Number.NEGATIVE_INFINITY
    }).element;
  }
  handlePlaylistDragStart(e) {
    e.currentTarget.classList.add('dragging');
    e.dataTransfer.setData('text/plain', e.currentTarget.dataset.playlistId);
    e.dataTransfer.effectAllowed = 'move';
  }
  handlePlaylistDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const draggingElement = document.querySelector('.playlist-card.dragging');
    if (draggingElement !== e.currentTarget) {
      const container = this.elements.playlistContainer;
      const afterElement = this.getPlaylistDragAfterElement(container, e.clientY);
      if (afterElement) {
        container.insertBefore(draggingElement, afterElement);
      } else {
        container.appendChild(draggingElement);
      }
    }
  }
  handlePlaylistDrop(e) {
    e.preventDefault();
    const draggedPlaylistId = parseInt(e.dataTransfer.getData('text/plain'));
    const playlistElements = Array.from(this.elements.playlistContainer.querySelectorAll('.playlist-card'));
    playlistElements.forEach((element, index) => {
      const playlistId = parseInt(element.dataset.playlistId);
      const playlist = this.playlists.find(p => p.id === playlistId);
      if (playlist) {
        playlist.position = index;
      }
    });
    this.savePlaylists().catch(error => {
      console.error('Error saving playlist positions:', error);
      alert('Failed to save playlist order. Please try again.');
    });
  }
  getPlaylistDragAfterElement(container, y) {
    const draggableElements = [ ...container.querySelectorAll('.playlist-card:not(.dragging)') ];
    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return {
          offset: offset,
          element: child
        };
      } else {
        return closest;
      }
    }, {
      offset: Number.NEGATIVE_INFINITY
    }).element;
  }
  getPlaylistDuration(playlist) {
    if (!playlist || !playlist.songs || playlist.songs.length === 0) {
      return '0:00';
    }
    let totalSeconds = 0;
    let hasAnyDuration = false;
    for (const song of playlist.songs) {
      if (this.ytPlayer && this.ytPlayer.getVideoData && this.ytPlayer.getVideoData().video_id === song.videoId && this.ytPlayer.getDuration) {
        const duration = this.ytPlayer.getDuration();
        if (duration && duration > 0) {
          totalSeconds += duration;
          hasAnyDuration = true;
        }
      } else {
        totalSeconds += 180;
      }
    }
    const formatted = this.formatDuration(totalSeconds);
    return hasAnyDuration ? formatted : `~${formatted}`;
  }
  getPlaylistDurationText() {
    if (!this.currentPlaylist || !this.currentPlaylist.songs.length) {
      return '0 songs';
    }
    return `${this.currentPlaylist.songs.length} songs`;
  }
  playSong(songId) {
    const song = this.songLibrary.find(s => s.id === songId);
    if (!song) {
      return;
    }
    this.currentPlaylist = null;
    this.currentSongIndex = this.songLibrary.findIndex(s => s.id === songId);
    this.currentSong = song;
    this.playSongById(song.videoId);
    this.hideSidebar();
    this.saveRecentlyPlayedSong(song);
    this.updateCurrentSongDisplay();
    this._discordScheduleSend();
    if (document.getElementById('lyrics') && document.getElementById('lyrics').classList.contains('active')) {
      this.renderLyricsTab();
    }
  }
  handleSongNameRightClick(event) {
    event.preventDefault();
    const songName = this.elements.currentSongName?.textContent || document.getElementById('currentSongName')?.textContent;
    if (songName && songName !== 'No Song Playing' && songName !== 'Unknown Title') {
      navigator.clipboard.writeText(songName).then(() => {
        const targetElement = this.elements.currentSongName || document.getElementById('currentSongName');
        if (targetElement) {
          const originalText = targetElement.textContent;
          targetElement.textContent = 'Copied!';
          setTimeout(() => {
            targetElement.textContent = originalText;
          }, 1e3);
        }
      }).catch(() => {
        console.warn('Failed to copy to clipboard');
      });
    }
  }
  async playSongById(videoId) {
    if (!videoId) {
      console.error('No video ID provided');
      return;
    }
    this._statCountedForCurrentPlay = false;
    const currentId = this.currentSong?.id;
    const masterSong = currentId && this.songLibrary.find(s => s.id === currentId) || this.songLibrary.find(s => s.videoId === videoId);
    if (masterSong?.localFileHandle) {
      try {
        const perm = await masterSong.localFileHandle.requestPermission({
          mode: 'read'
        });
        if (perm === 'granted') {
          const file = await masterSong.localFileHandle.getFile();
          const url = URL.createObjectURL(file);
          this.playLocalAudio(url);
          return;
        }
        this.showNotification('Local file permission denied. Falling back to YouTube.', 'error');
      } catch (error) {
        const errorMessages = {
          NotFoundError: 'Local file not found — was it renamed or moved?',
          NotAllowedError: 'Local file access was denied.',
          SecurityError: 'Security error reading local file.'
        };
        const msg = errorMessages[error.name] || `Local file error (${error.name}).`;
        this.showNotification(`${msg} Falling back to YouTube.`, 'error');
        if (error.name === 'NotFoundError') {
          const idx = this.songLibrary.findIndex(s => s.id === masterSong.id);
          if (idx !== -1) {
            this.songLibrary[idx].localFileHandle = null;
            this.songLibrary[idx].localFileName = null;
            this.saveSongLibrary();
          }
        }
      }
    }
    if (this.localAudio && !this.localAudio.paused) {
      this.localAudio.pause();
    }
    this.isLocalPlayback = false;
    if (!this.ytPlayer) {
      console.error('YouTube player not initialized');
      this.showNotification?.('No internet connection or YouTube unavailable.', 'error');
      return;
    }
    if (!this.ytPlayerReady) {
      console.log('Player not ready yet, please wait a moment...');
      return;
    }
    try {
      console.log('Loading video:', videoId);
      this.ytPlayer.loadVideoById({
        videoId: videoId,
        suggestedQuality: 'small'
      });
      setTimeout(() => {
        try {
          this.ytPlayer.setPlaybackQuality('small');
        } catch (error) {
          console.warn('Failed to set video quality:', error);
        }
      }, 200);
      this.isPlaying = true;
      this.updatePlayerUI();
      if (this.elements.progressBar) {
        this.elements.progressBar.value = 0;
      }
      if (this.currentPlaylist && this.isSidebarVisible) {
        this.renderPlaylistSidebar();
      }
      if (this.currentSpeed !== 1) {
        setTimeout(() => {
          try {
            this.ytPlayer.setPlaybackRate(this.currentSpeed);
          } catch (error) {
            console.warn('Failed to set playback speed:', error);
          }
        }, 500);
      }
      this.updateProgressBar();
      this.updatePageTitle();
      this._discordScheduleSend();
    } catch (error) {
      console.error('Error playing song with ID ' + videoId + ':', error);
      alert('Failed to play the video. Please try again.');
      if (this.isAutoplayEnabled) {
        setTimeout(() => this.playNextSong(), 1e3);
      }
    }
  }
  togglePlayPause() {
    if (this.isLocalPlayback && this.localAudio) {
      try {
        if (!this.localAudio.paused) {
          this.localAudio.pause();
        } else {
          this.localAudio.play();
        }
      } catch (error) {
        console.error('Error toggling local audio:', error);
      }
      return;
    }
    if (!this.ytPlayer) {
      console.warn('YouTube player not initialized');
      return;
    }
    try {
      const playerState = this.ytPlayer.getPlayerState();
      if (playerState === YT.PlayerState.PLAYING) {
        this.ytPlayer.pauseVideo();
        this.isPlaying = false;
        if (this.titleScrollInterval) {
          clearInterval(this.titleScrollInterval);
          this.titleScrollInterval = null;
          document.title = 'Music Player';
        }
      } else {
        this.ytPlayer.playVideo();
        this.isPlaying = true;
        this.updatePageTitle();
      }
      this.debouncedUpdatePlayerUI();
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  }
  playNextSong() {
    if (this._consumeQueueHead()) {
      return;
    }
    const source = this.currentPlaylist ? this.currentPlaylist.songs : this.songLibrary;
    if (!source.length) {
      return;
    }
    if (this.currentPlaylist && this.temporarilySkippedSongs && this.temporarilySkippedSongs.size > 0) {
      this.playNextNonSkippedSong();
      return;
    }
    if (this.currentSongIndex === source.length - 1 && !this.isPlaylistLooping) {
      if (this.isLocalPlayback && this.localAudio) {
        this.localAudio.pause();
      } else if (this.ytPlayer) {
        this.ytPlayer.stopVideo();
      }
      this.isPlaying = false;
      this.isLocalPlayback = false;
      this.updatePlayerUI();
      return;
    }
    this.currentSongIndex = (this.currentSongIndex + 1) % source.length;
    const currentSong = source[this.currentSongIndex];
    this.currentSong = currentSong;
    this.saveRecentlyPlayedSong(currentSong);
    if (this.currentPlaylist) {
      this.playSongById(currentSong.videoId);
    } else {
      this.playCurrentSong();
    }
    this.updateCurrentSongDisplay();
    this._discordScheduleSend();
  }
  playPreviousSong() {
    const source = this.currentPlaylist ? this.currentPlaylist.songs : this.songLibrary;
    if (!source.length) {
      return;
    }
    if (this.currentPlaylist && this.temporarilySkippedSongs.size > 0) {
      const totalSongs = source.length;
      let prevIndex = (this.currentSongIndex - 1 + totalSongs) % totalSongs;
      const startIndex = prevIndex;
      while (this.isSongTemporarilySkipped(source[prevIndex])) {
        prevIndex = (prevIndex - 1 + totalSongs) % totalSongs;
        if (prevIndex === startIndex) {
          return;
        }
      }
      this.currentSongIndex = prevIndex;
      const song = source[this.currentSongIndex];
      this.currentSong = this.songLibrary.find(s => s.id === song.id) ?? song;
      this.saveRecentlyPlayedSong(song);
      this.playSongById(song.videoId);
      this.updateCurrentSongDisplay();
      this._discordScheduleSend();
      return;
    }
    this.currentSongIndex = (this.currentSongIndex - 1 + source.length) % source.length;
    const song = source[this.currentSongIndex];
    this.currentSong = this.currentPlaylist ? this.songLibrary.find(s => s.id === song.id) ?? song : song;
    this.saveRecentlyPlayedSong(song);
    if (this.currentPlaylist) {
      this.playSongById(song.videoId);
    } else {
      this.playCurrentSong();
    }
    this.updateCurrentSongDisplay();
    this._discordScheduleSend();
  }
  playCurrentSong() {
    if (!this.songLibrary.length) {
      return;
    }
    const currentSong = this.songLibrary[this.currentSongIndex];
    this.currentSong = currentSong;
    this.playSongById(currentSong.videoId);
    this.updateCurrentSongDisplay();
    this._discordScheduleSend();
  }
  playSongFromPlaylist(index) {
    if (!this.currentPlaylist || index >= this.currentPlaylist.songs.length) {
      return;
    }
    const song = this.currentPlaylist.songs[index];
    const entryId = song.entryId || 'id_' + song.videoId;
    if (this.temporarilySkippedSongs.has(entryId)) {
      return;
    }
    this.currentSongIndex = index;
    this.currentSong = song;
    this.saveRecentlyPlayedSong(song);
    this.playSongById(song.videoId);
    this.updateCurrentSongDisplay();
    this._discordScheduleSend();
  }
  _syncTransportDisplays(currentTime, duration) {
    const pct = duration > 0 ? currentTime / duration * 100 : 0;
    const timeText = `${this.formatTime(currentTime)}/${this.formatTime(duration)}`;
    if (this.elements.progressBar) {
      this.elements.progressBar.value = pct;
    }
    if (this.elements.timeDisplay) {
      this.elements.timeDisplay.textContent = timeText;
    }
    const npBar = document.getElementById('npProgressBar');
    const npTime = document.getElementById('npTimeDisplay');
    if (npBar) {
      npBar.value = pct;
    }
    if (npTime) {
      npTime.textContent = timeText;
    }
  }
  _getPreviewSource() {
    return this.currentPlaylist ? this.currentPlaylist.songs : this.songLibrary;
  }
  _songToPreviewItem(song) {
    if (!song) {
      return null;
    }
    return {
      name: song.name || 'Unknown',
      author: song.author || '',
      videoId: song.videoId,
      thumbnailUrl: song.thumbnailUrl || `https://img.youtube.com/vi/${song.videoId}/mqdefault.jpg`
    };
  }
  getUpcomingSongsPreview(count = 3) {
    const items = [];
    for (const block of this.songQueue) {
      if (items.length >= count) break;
      if (block.type === 'stop') {
        items.push({
          isMarker: true,
          name: 'Stop Autoplay'
        });
        break;
      }
      if (block.type === 'loop') {
        items.push({
          isMarker: true,
          name: 'Loop Previous Song Forever'
        });
        break;
      }
      if (block.type === 'song') {
        items.push(this._songToPreviewItem(block));
      }
    }
    if (items.length < count && !items.some(i => i.isMarker)) {
      const source = this._getPreviewSource();
      if (source.length && this.isLooping) {
        const current = source[this.currentSongIndex];
        if (current) {
          items.push(this._songToPreviewItem(current));
        }
      } else if (source.length) {
        const total = source.length;
        let idx = this.currentSongIndex;
        let steps = 0;
        while (items.length < count && steps < total) {
          idx = (idx + 1) % total;
          steps++;
          const candidate = source[idx];
          if (!candidate) continue;
          if (this.currentPlaylist && this.isSongTemporarilySkipped(candidate)) continue;
          if (idx === this.currentSongIndex && !this.isPlaylistLooping) break;
          items.push(this._songToPreviewItem(candidate));
          if (idx === this.currentSongIndex) break;
        }
      }
    }
    return items.slice(0, count);
  }
  getPreviousSongsPreview(count = 3) {
    const source = this._getPreviewSource();
    const items = [];
    if (!source.length) {
      return items;
    }
    const total = source.length;
    let idx = this.currentSongIndex;
    let steps = 0;
    while (items.length < count && steps < total) {
      idx = (idx - 1 + total) % total;
      steps++;
      const candidate = source[idx];
      if (!candidate) continue;
      if (this.currentPlaylist && this.isSongTemporarilySkipped(candidate)) continue;
      items.push(this._songToPreviewItem(candidate));
      if (idx === this.currentSongIndex) break;
    }
    return items.slice(0, count);
  }
  _buildTransportPreviewPopup(items, label) {
    const popup = document.createElement('div');
    popup.className = 'transport-preview-popup';
    const title = document.createElement('div');
    title.className = 'transport-preview-title';
    title.textContent = label;
    popup.appendChild(title);
    if (!items.length) {
      const empty = document.createElement('div');
      empty.className = 'transport-preview-empty';
      empty.textContent = 'Nothing queued.';
      popup.appendChild(empty);
      return popup;
    }
    items.forEach(item => {
      const row = document.createElement('div');
      row.className = 'transport-preview-item';
      if (item.isMarker) {
        row.classList.add('transport-preview-marker');
        row.innerHTML = `<i class="fa fa-info-circle"></i><span>${this.escapeHtml(item.name)}</span>`;
      } else {
        row.innerHTML = `\n          <img class="transport-preview-thumb" src="${item.thumbnailUrl}" alt="" loading="lazy">\n          <div class="transport-preview-info">\n            <div class="transport-preview-name">${this.escapeHtml(item.name)}</div>\n            ${item.author ? `<div class="transport-preview-author">${this.escapeHtml(item.author)}</div>` : ''}\n          </div>\n        `;
      }
      popup.appendChild(row);
    });
    return popup;
  }
  showTransportPreview(anchorEl, direction) {
    this.hideTransportPreview();
    const items = direction === 'next' ? this.getUpcomingSongsPreview(3) : this.getPreviousSongsPreview(3);
    const label = direction === 'next' ? 'Next Up' : 'Previously Played';
    const popup = this._buildTransportPreviewPopup(items, label);
    document.body.appendChild(popup);
    const rect = anchorEl.getBoundingClientRect();
    const popupRect = popup.getBoundingClientRect();
    let top = rect.top - popupRect.height - 10;
    if (top < 8) {
      top = rect.bottom + 10;
    }
    let left = rect.left + rect.width / 2 - popupRect.width / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - popupRect.width - 8));
    popup.style.top = `${top + window.scrollY}px`;
    popup.style.left = `${left + window.scrollX}px`;
    requestAnimationFrame(() => popup.classList.add('visible'));
    this._transportPreviewEl = popup;
  }
  hideTransportPreview() {
    if (this._transportPreviewEl) {
      this._transportPreviewEl.remove();
      this._transportPreviewEl = null;
    }
  }
  setupTransportHoverPreviews() {
    const bind = (id, direction) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      let hoverTimer = null;
      btn.addEventListener('mouseenter', () => {
        clearTimeout(hoverTimer);
        hoverTimer = setTimeout(() => this.showTransportPreview(btn, direction), 500);
      });
      btn.addEventListener('mouseleave', () => {
        clearTimeout(hoverTimer);
        this.hideTransportPreview();
      });
      btn.addEventListener('click', () => {
        clearTimeout(hoverTimer);
        this.hideTransportPreview();
      });
    };
    bind('prevBtn', 'prev');
    bind('nextBtn', 'next');
    bind('npPrevBtn', 'prev');
    bind('npNextBtn', 'next');
  }
  seekMusic(e) {
    const isLocal = this.isLocalPlayback && this.localAudio;
    const duration = isLocal ? this.localAudio.duration || 0 : this.ytPlayer ? this.ytPlayer.getDuration() : 0;
    if (!duration) {
      return;
    }
    let clickPosition;
    if (e.type === 'touchstart' || e.type === 'touchmove') {
      const touch = e.touches[0] || e.changedTouches[0];
      const rect = this.elements.progressBar.getBoundingClientRect();
      clickPosition = (touch.clientX - rect.left) / rect.width;
    } else {
      clickPosition = e.offsetX / this.elements.progressBar.offsetWidth;
    }
    clickPosition = Math.max(0, Math.min(1, clickPosition));
    const seekTime = duration * clickPosition;
    if (isLocal) {
      this.localAudio.currentTime = seekTime;
    } else {
      if (!this.ytPlayer) {
        return;
      }
      this.ytPlayer.seekTo(seekTime, true);
      this.pendingSeekTime = seekTime;
      this.pendingSeekTimestamp = Date.now();
    }
    this._syncTransportDisplays(seekTime, duration);
    this.updateHighlightedLyric(seekTime, this.currentLyrics ?? [], this.currentTimings ?? []);
  }
  seekBy(seconds) {
    if (this.isLocalPlayback && this.localAudio) {
      const duration = this.localAudio.duration || 0;
      if (!duration) {
        return;
      }
      this.localAudio.currentTime = Math.max(0, Math.min(duration, this.localAudio.currentTime + seconds));
      const current = this.localAudio.currentTime;
      this._syncTransportDisplays(current, duration);
      this.updateHighlightedLyric(current, this.currentLyrics ?? [], this.currentTimings ?? []);
      return;
    }
    if (!this.ytPlayer || !this.ytPlayerReady) {
      return;
    }
    try {
      const duration = this.ytPlayer.getDuration();
      if (!duration) {
        return;
      }
      const current = this.ytPlayer.getCurrentTime();
      const target = Math.max(0, Math.min(duration, current + seconds));
      this.ytPlayer.seekTo(target, true);
      this._syncTransportDisplays(target, duration);
      this.updateHighlightedLyric(target, this.currentLyrics ?? [], this.currentTimings ?? []);
    } catch (error) {
      console.warn('seekBy failed:', error);
    }
  }
  setVolume(volume) {
    if (this.ytPlayer) {
      this.ytPlayer.setVolume(volume);
    }
    if (this.isLocalPlayback && this.localAudio) {
      this.localAudio.volume = volume / 100;
    }
    this.savedVolume = volume;
    this.saveSetting('volume', volume);
    if (this.elements.volumeSlider && this.elements.volumeSlider.value != volume) {
      this.elements.volumeSlider.value = volume;
    }
    const npVolumeSlider = document.getElementById('npVolumeSlider');
    if (npVolumeSlider && npVolumeSlider.value != volume) {
      npVolumeSlider.value = volume;
    }
  }
  adjustVolume(change) {
    if (!this.elements.volumeSlider) {
      return;
    }
    const currentVolume = parseFloat(this.elements.volumeSlider.value);
    let newVolume = Math.min(100, Math.max(0, currentVolume + change * 100));
    this.elements.volumeSlider.value = newVolume;
    this.setVolume(newVolume);
    this.showVolumeIndicator(newVolume);
  }
  showVolumeIndicator(volumeLevel) {
    let volumeIndicator = document.getElementById('volumeIndicator');
    if (!volumeIndicator) {
      volumeIndicator = document.createElement('div');
      volumeIndicator.id = 'volumeIndicator';
      volumeIndicator.style.position = 'fixed';
      volumeIndicator.style.bottom = '20px';
      volumeIndicator.style.left = '50%';
      volumeIndicator.style.transform = 'translateX(-50%)';
      volumeIndicator.style.background = 'rgba(0, 0, 0, 0.7)';
      volumeIndicator.style.color = 'white';
      volumeIndicator.style.padding = '10px 20px';
      volumeIndicator.style.borderRadius = '5px';
      volumeIndicator.style.zIndex = '1000';
      volumeIndicator.style.opacity = '0';
      volumeIndicator.style.transition = 'opacity 0.3s';
      document.body.appendChild(volumeIndicator);
    }
    volumeIndicator.textContent = `Volume: ${Math.round(volumeLevel)}%`;
    volumeIndicator.style.opacity = '1';
    clearTimeout(this.volumeIndicatorTimeout);
    this.volumeIndicatorTimeout = setTimeout(() => {
      volumeIndicator.style.opacity = '0';
    }, 1500);
  }
  toggleLoop() {
    this.isLooping = !this.isLooping;
    this.elements.loopBtn.classList.toggle('active', this.isLooping);
    this.updatePlayerUI();
    this.saveSetting('isLooping', this.isLooping);
  }
  togglePlaylistLoop() {
    this.isPlaylistLooping = !this.isPlaylistLooping;
    this.updatePlaylistLoopButton();
    this.saveSetting('isPlaylistLooping', this.isPlaylistLooping);
  }
  updatePlaylistLoopButton() {
    if (this.elements.loopPlaylistBtn) {
      if (this.isPlaylistLooping) {
        this.elements.loopPlaylistBtn.classList.add('active');
      } else {
        this.elements.loopPlaylistBtn.classList.remove('active');
      }
    }
  }
  toggleAutoplay() {
    this.isAutoplayEnabled = !this.isAutoplayEnabled;
    if (this.elements.autoplayBtn) {
      this.elements.autoplayBtn.classList.toggle('active', this.isAutoplayEnabled);
    }
    this.updatePlayerUI();
    if (this.db) {
      this.saveSetting('autoplay', this.isAutoplayEnabled).catch(error => {
        console.error('Error saving autoplay setting:', error);
      });
    }
    console.log('Autoplay toggled:', this.isAutoplayEnabled);
  }
  initializeAutoplay() {
    if (!this.db) {
      this.isAutoplayEnabled = true;
      if (this.elements.autoplayBtn) {
        this.elements.autoplayBtn.classList.toggle('active', this.isAutoplayEnabled);
      }
      return;
    }
    const transaction = this.db.transaction([ 'settings' ], 'readonly');
    const store = transaction.objectStore('settings');
    const request = store.get('autoplay');
    request.onsuccess = () => {
      const savedAutoplay = request.result ? request.result.value : true;
      this.isAutoplayEnabled = savedAutoplay;
      if (this.elements.autoplayBtn) {
        this.elements.autoplayBtn.classList.toggle('active', this.isAutoplayEnabled);
      }
      console.log('Autoplay initialized:', this.isAutoplayEnabled);
    };
    request.onerror = event => {
      console.error('Error loading autoplay setting:', event.target.error);
      this.isAutoplayEnabled = true;
      if (this.elements.autoplayBtn) {
        this.elements.autoplayBtn.classList.toggle('active', this.isAutoplayEnabled);
      }
    };
  }
  setPlaybackSpeed(speed) {
    this.currentSpeed = speed;
    this.elements.speedBtn.textContent = speed + 'x';
    this.elements.speedOptions.classList.remove('show');
    if (this.ytPlayer) {
      this.ytPlayer.setPlaybackRate(speed);
    }
    if (this.isLocalPlayback && this.localAudio) {
      this.localAudio.playbackRate = speed;
    }
    this.saveSetting('playbackSpeed', speed).catch(err => {
      console.error('Error saving playback speed:', err);
    });
  }
  toggleSpeedOptions() {
    this.elements.speedOptions.classList.toggle('show');
    if (this.elements.speedOptions.classList.contains('show')) {
      setTimeout(() => {
        const closeSpeedMenu = e => {
          if (!this.elements.speedBtn.contains(e.target) && !this.elements.speedOptions.contains(e.target)) {
            this.elements.speedOptions.classList.remove('show');
            document.removeEventListener('click', closeSpeedMenu);
          }
        };
        document.addEventListener('click', closeSpeedMenu);
      }, 0);
    }
  }
  restartCurrentSong() {
    if (this.isLocalPlayback && this.localAudio) {
      this.localAudio.currentTime = 0;
      this._syncTransportDisplays(0, this.localAudio.duration || 0);
      this.updateHighlightedLyric(0, this.currentLyrics ?? [], this.currentTimings ?? []);
      return;
    }
    if (this.ytPlayer) {
      this.ytPlayer.seekTo(0, true);
      this._syncTransportDisplays(0, this.ytPlayer.getDuration());
      this.updateHighlightedLyric(0, this.currentLyrics ?? [], this.currentTimings ?? []);
    }
  }
  temporarilySkipSong(entryId) {
    if (this.temporarilySkippedSongs.has(entryId)) {
      this.temporarilySkippedSongs.delete(entryId);
    } else {
      this.temporarilySkippedSongs.add(entryId);
    }
    this.renderPlaylistSidebar();
    if (this.currentPlaylist && this.isPlaying) {
      const currentSongEntryId = this.currentPlaylist.songs[this.currentSongIndex].entryId || 'id_' + this.currentPlaylist.songs[this.currentSongIndex].videoId;
      if (entryId === currentSongEntryId) {
        this.playNextNonSkippedSong();
      } else {
        this.updatePlayerUI();
      }
    } else {
      this.updatePlayerUI();
    }
  }
  playNextNonSkippedSong() {
    if (!this.currentPlaylist || !this.currentPlaylist.songs.length) {
      return;
    }
    const totalSongs = this.currentPlaylist.songs.length;
    let nextIndex = (this.currentSongIndex + 1) % totalSongs;
    const startIndex = nextIndex;
    while (this.isSongTemporarilySkipped(this.currentPlaylist.songs[nextIndex])) {
      nextIndex = (nextIndex + 1) % totalSongs;
      if (nextIndex === startIndex) {
        return;
      }
      if (nextIndex === 0 && !this.isPlaylistLooping) {
        if (this.isLocalPlayback && this.localAudio) {
          this.localAudio.pause();
        } else if (this.ytPlayer) {
          this.ytPlayer.stopVideo();
        }
        this.isPlaying = false;
        this.isLocalPlayback = false;
        this.updatePlayerUI();
        return;
      }
    }
    this.currentSongIndex = nextIndex;
    this.currentSong = this.currentPlaylist.songs[this.currentSongIndex];
    this.saveRecentlyPlayedSong(this.currentPlaylist.songs[this.currentSongIndex]);
    this.playSongById(this.currentPlaylist.songs[nextIndex].videoId);
    this.updateCurrentSongDisplay();
  }
  isSongTemporarilySkipped(song) {
    const entryId = song.entryId || 'id_' + song.videoId;
    return this.temporarilySkippedSongs.has(entryId);
  }
  playLocalAudio(url) {
    if (this.ytPlayer) {
      try {
        this.ytPlayer.pauseVideo();
      } catch (error) {}
    }
    if (!this.localAudio) {
      this.localAudio = new Audio();
      let _lastUpdate = 0;
      this.localAudio.addEventListener('timeupdate', () => {
        if (!this.isLocalPlayback) {
          return;
        }
        const now = Date.now();
        if (now - _lastUpdate < 500) {
          return;
        }
        _lastUpdate = now;
        const current = this.localAudio.currentTime;
        const duration = this.localAudio.duration || 0;
        if (duration > 0) {
          const pct = current / duration * 100;
          if (this.elements.progressBar) {
            this.elements.progressBar.value = pct;
          }
          const npBar = document.getElementById('npProgressBar');
          const npTime = document.getElementById('npTimeDisplay');
          if (npBar) {
            npBar.value = pct;
          }
          if (npTime) {
            npTime.textContent = `${this.formatTime(current)}/${this.formatTime(duration)}`;
          }
          if (this.elements.timeDisplay) {
            this.elements.timeDisplay.textContent = `${this.formatTime(current)}/${this.formatTime(duration)}`;
          }
          this.updateHighlightedLyric(current, this.currentLyrics ?? [], this.currentTimings ?? []);
          if (this.listeningStatsEnabled && !this._statCountedForCurrentPlay) {
            const threshold = Math.min(10, duration / 3);
            if (current >= threshold) {
              this._statCountedForCurrentPlay = true;
              this.recordSongPlayStat(this.currentSong?.id);
            }
          }
        }
      });
      this.localAudio.addEventListener('ended', () => {
        if (!this.isLocalPlayback) {
          return;
        }
        this.isPlaying = false;
        if (this.elements.progressBar) {
          this.elements.progressBar.value = 0;
        }
        if (this.elements.timeDisplay) {
          this.elements.timeDisplay.textContent = '0:00/0:00';
        }
        if (this.isLooping) {
          this.localAudio.currentTime = 0;
          this.localAudio.play().catch(e => console.warn('Loop replay failed:', e));
          this.isPlaying = true;
          this._statCountedForCurrentPlay = false;
        } else if (this.isAutoplayEnabled) {
          this.isLocalPlayback = false;
          this.playNextSong();
        }
        this.updatePlayerUI();
      });
      this.localAudio.addEventListener('pause', () => {
        if (!this.isLocalPlayback) {
          return;
        }
        this.isPlaying = false;
        this.updatePlayerUI();
        if (this.titleScrollInterval) {
          clearInterval(this.titleScrollInterval);
          this.titleScrollInterval = null;
        }
        this.updatePageTitle();
      });
      this.localAudio.addEventListener('play', () => {
        if (!this.isLocalPlayback) {
          return;
        }
        this.isPlaying = true;
        this.updatePlayerUI();
        this.startListeningTimeTracking();
      });
    }
    if (this.localAudio.src?.startsWith('blob:')) {
      URL.revokeObjectURL(this.localAudio.src);
    }
    this.localAudio.src = url;
    this.localAudio.volume = (this.savedVolume ?? 100) / 100;
    this.localAudio.playbackRate = this.currentSpeed || 1;
    this.isLocalPlayback = true;
    this.isPlaying = true;
    if (this.elements.progressBar) {
      this.elements.progressBar.value = 0;
    }
    if (this.elements.timeDisplay) {
      this.elements.timeDisplay.textContent = '0:00/0:00';
    }
    this.localAudio.play().catch(e => console.error('Local audio play failed:', e));
    this.updatePlayerUI();
    this.updatePageTitle();
    this._discordScheduleSend();
  }
  updateProgressBar() {
    if (!this.elements.progressBar) {
      return;
    }
    if (!this.isTabVisible) {
      return;
    }
    if (this.isLocalPlayback) {
      return;
    }
    if (!this.ytPlayer) {
      return;
    }
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
    this.progressInterval = setInterval(() => {
      if (!this.isTabVisible || !this.ytPlayer || this.isLocalPlayback) {
        return;
      }
      try {
        const playerState = this.ytPlayer.getPlayerState();
        if (playerState !== YT.PlayerState.PLAYING) {
          return;
        }
        const currentTime = this.ytPlayer.getCurrentTime() || 0;
        const duration = this.ytPlayer.getDuration() || 0;
        if (duration > 0) {
          const progressPercent = currentTime / duration * 100;
          this.elements.progressBar.value = progressPercent;
          const npBar = document.getElementById('npProgressBar');
          const npTime = document.getElementById('npTimeDisplay');
          if (npBar) {
            npBar.value = progressPercent;
          }
          if (npTime) {
            npTime.textContent = `${this.formatTime(currentTime)}/${this.formatTime(duration)}`;
          }
          if (this.elements.timeDisplay) {
            this.elements.timeDisplay.textContent = `${this.formatTime(currentTime)}/${this.formatTime(duration)}`;
          }
          this.updateHighlightedLyric(currentTime, this.currentLyrics ?? [], this.currentTimings ?? []);
          if (this.listeningStatsEnabled && !this._statCountedForCurrentPlay) {
            const threshold = Math.min(10, duration / 3);
            if (currentTime >= threshold) {
              this._statCountedForCurrentPlay = true;
              this.recordSongPlayStat(this.currentSong?.id);
            }
          }
        }
      } catch (error) {
        console.error('Error updating progress bar:', error);
      }
    }, 1200);
  }
  updatePlayerUI() {
    let currentSong;
    if (this.currentPlaylist && this.currentPlaylist.songs[this.currentSongIndex]) {
      currentSong = this.currentPlaylist.songs[this.currentSongIndex];
    } else if (this.songLibrary[this.currentSongIndex]) {
      currentSong = this.songLibrary[this.currentSongIndex];
    } else {
      if (this.ytPlayer && this.ytPlayer.getVideoData) {
        try {
          const videoData = this.ytPlayer.getVideoData();
          const currentVideoId = videoData.video_id;
          currentSong = this.songLibrary.find(s => s.videoId === currentVideoId) || this.currentPlaylist && this.currentPlaylist.songs.find(s => s.videoId === currentVideoId);
        } catch (error) {
          console.warn('Could not get current video data:', error);
        }
      }
    }
    if (!currentSong) {
      this.elements.currentSongName.textContent = 'No Song Playing';
      this.elements.nextSongName.textContent = '-';
      const playPauseIcon = this.elements.playPauseBtn.querySelector('i');
      if (playPauseIcon) {
        playPauseIcon.classList.remove('fa-play', 'fa-pause');
        playPauseIcon.classList.add('fa-play');
      }
      this.updatePageTitle();
      return;
    }
    this.elements.currentSongName.textContent = currentSong.name;
    if (!this.isAutoplayEnabled) {
      this.elements.nextSongName.textContent = 'Autoplay disabled';
    } else if (this.isLooping) {
      this.elements.nextSongName.textContent = currentSong.name;
    } else if (this.songQueue.length > 0) {
      const next = this.songQueue[0];
      if (next.type === 'stop') {
        this.elements.nextSongName.textContent = 'Stop Autoplay';
      } else if (next.type === 'loop') {
        this.elements.nextSongName.textContent = 'Loop Previous Song Forever';
      } else {
        this.elements.nextSongName.textContent = `Queue: ${next.name}`;
      }
    } else {
      const source = this.currentPlaylist ? this.currentPlaylist.songs : this.songLibrary;
      if (this.currentSongIndex === source.length - 1 && !this.isPlaylistLooping) {
        this.elements.nextSongName.textContent = 'End of playlist';
      } else {
        const nextSongIndex = (this.currentSongIndex + 1) % source.length;
        this.elements.nextSongName.textContent = source[nextSongIndex].name;
      }
    }
    const playPauseIcon = this.elements.playPauseBtn.querySelector('i');
    if (playPauseIcon) {
      playPauseIcon.classList.remove('fa-play', 'fa-pause');
      playPauseIcon.classList.add(this.isPlaying ? 'fa-pause' : 'fa-play');
    }
    if (this.elements.autoplayBtn) {
      this.elements.autoplayBtn.classList.toggle('active', this.isAutoplayEnabled);
    }
    if (this.currentPlaylist && this.isSidebarVisible) {
      this.renderPlaylistSidebar();
    }
    this.updatePageTitle();
    this.updateNowPlayingView();
  }
  formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
      return '0:00';
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  formatDuration(seconds) {
    if (!seconds || seconds <= 0) {
      return '0:00';
    }
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds % 3600 / 60);
    const secs = Math.floor(seconds % 60);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  }
  setupYouTubePlayer() {
    if (window.YT && window.YT.Player) {
      this.initializeYouTubePlayer();
    } else {
      window.onYouTubeIframeAPIReady = () => this.initializeYouTubePlayer();
    }
  }
  initializeYouTubePlayer() {
    this.ytPlayer = new YT.Player('ytPlayer', {
      height: '1',
      width: '1',
      playerVars: {
        rel: 0,
        showinfo: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        playsinline: 1,
        autoplay: 0,
        iv_load_policy: 3,
        cc_load_policy: 0,
        cc_lang_pref: 'en',
        hl: 'en',
        enablejsapi: 1,
        origin: window.location.origin,
        widget_referrer: window.location.href
      },
      events: {
        onReady: event => {
          this.onPlayerReady(event);
          this.ytPlayerReady = true;
          console.log('YouTube player is ready');
        },
        onStateChange: this.onPlayerStateChange.bind(this),
        onError: this.onPlayerError.bind(this)
      }
    });
  }
  onPlayerReady(event) {
    console.log('YouTube player is ready');
    try {
      const qualities = this.ytPlayer.getAvailableQualityLevels();
      if (qualities && qualities.length > 0) {
        const lowestQuality = qualities[qualities.length - 1];
        this.ytPlayer.setPlaybackQuality(lowestQuality);
        console.log(`Set to lowest quality: ${lowestQuality}`);
      }
    } catch (error) {
      console.warn('Could not set video quality:', error);
    }
    this.ytPlayer.setVolume(this.savedVolume ?? 100);
    this.initializeAutoplay();
  }
  onPlayerError(event) {
    console.error('YouTube player error:', event.data);
    switch (event.data) {
     case 2:
      console.error('Invalid video ID');
      break;

     case 5:
      console.error('Video not available in HTML5 player');
      break;

     case 100:
      console.error('Video not found or private');
      break;

     case 101:
     case 150:
      console.error('Video not allowed to be played in embedded players');
      break;
    }
    if (this.isAutoplayEnabled) {
      setTimeout(() => {
        this.playNextSong();
      }, 1e3);
    }
  }
  onPlayerStateChange(event) {
    if (this.isLocalPlayback) {
      return;
    }
    if (event.data === YT.PlayerState.ENDED) {
      console.log('Song ended - taking immediate action');
      setTimeout(() => {
        if (this.isLooping) {
          if (this.ytPlayer) {
            this.ytPlayer.seekTo(0, true);
            this.ytPlayer.playVideo();
          }
          this._statCountedForCurrentPlay = false;
        } else if (this.isAutoplayEnabled) {
          this.playNextSong();
        } else {
          this.isPlaying = false;
          this.updatePlayerUI();
        }
      }, 0);
      if (this.elements.progressBar) {
        this.elements.progressBar.value = 0;
      }
      if (this.elements.timeDisplay) {
        this.elements.timeDisplay.textContent = '0:00/0:00';
      }
    } else if (event.data === YT.PlayerState.PAUSED) {
      this.isPlaying = false;
      this.updatePlayerUI();
      if (this.titleScrollInterval) {
        clearInterval(this.titleScrollInterval);
        this.titleScrollInterval = null;
      }
      this.updatePageTitle();
      if (this.progressInterval) {
        clearInterval(this.progressInterval);
      }
      if (this.lyricsInterval) {
        clearInterval(this.lyricsInterval);
      }
      if (this.fullscreenLyricsInterval) {
        clearInterval(this.fullscreenLyricsInterval);
      }
    } else if (event.data === YT.PlayerState.PLAYING) {
      this.isPlaying = true;
      this.updatePlayerUI();
      if (this.currentSpeed !== 1) {
        this.ytPlayer.setPlaybackRate(this.currentSpeed);
      }
      if (this.isTabVisible) {
        this.updateProgressBar();
      }
      this.startListeningTimeTracking();
      if (document.getElementById('lyrics') && document.getElementById('lyrics').classList.contains('active')) {
        if (!this.currentLyrics?.length) {
          this.renderLyricsTab();
        } else {
          const currentTime = this.ytPlayer.getCurrentTime();
          this.updateHighlightedLyric(currentTime, this.currentLyrics, this.currentTimings);
        }
      }
      if (this.isLyricsFullscreen) {
        this.renderFullscreenLyrics();
      }
    }
    if (event.data === YT.PlayerState.PLAYING) {
      this.visualizer.isActive = true;
      if (this.isTabVisible) {
        this.animateVisualizer();
      }
    }
  }
  togglePlaylistSidebar() {
    if (this.isSidebarVisible) {
      this.hideSidebar();
    } else {
      this.showSidebar();
    }
  }
  showSidebar() {
    if (!this.currentPlaylist) {
      return;
    }
    this.elements.currentPlaylistSidebar.classList.add('visible');
    this.isSidebarVisible = true;
    this.applyPlaylistSidebarMode();
    this.renderPlaylistSidebar();
  }
  hideSidebar() {
    this.elements.currentPlaylistSidebar.classList.remove('visible');
    this.isSidebarVisible = false;
    document.body.classList.remove('playlist-expanded-active');
    if (this.elements.sidebarSearchInput) {
      this.elements.sidebarSearchInput.value = '';
    }
  }
  renderPlaylistSidebar() {
    if (!this.currentPlaylist) {
      return;
    }
    this.elements.sidebarPlaylistName.textContent = this.currentPlaylist.name;
    if (this.elements.playlistTotalDuration) {
      this.elements.playlistTotalDuration.textContent = this.getPlaylistDurationText();
    }
    this.updatePlaylistLoopButton();
    this.elements.sidebarPlaylistSongs.innerHTML = '';
    if (this.playlistSidebarMode === 'expanded') {
      this.renderPlaylistSidebarExpandedMode();
    } else {
      this.renderPlaylistSidebarOverlayMode();
    }
    if (this.currentPlaylist.songs.length > 0) {
      const activeElement = this.elements.sidebarPlaylistSongs.querySelector('.sidebar-song-item.active, .sidebar-song-card.active');
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }
  renderPlaylistSidebarExpandedMode() {
    const fragment = document.createDocumentFragment();
    this.currentPlaylist.songs.forEach((song, index) => {
      const songCard = document.createElement('div');
      songCard.classList.add('sidebar-song-card');
      const entryId = song.entryId || 'id_' + song.videoId;
      songCard.dataset.entryId = entryId;
      songCard.dataset.songName = song.name.toLowerCase();
      if (index === this.currentSongIndex) {
        songCard.classList.add('active');
      }
      if (this.temporarilySkippedSongs.has(entryId)) {
        songCard.classList.add('temporarily-skipped');
      }
      const thumbnailUrl = `https://img.youtube.com/vi/${song.videoId}/default.jpg`;
      songCard.innerHTML = `\n\t\t\t<img src="${thumbnailUrl}" alt="${song.name}" class="song-card-thumbnail" loading="lazy">\n\t\t\t<div class="song-card-info">\n\t\t\t\t<div class="song-card-index">#${index + 1}</div>\n\t\t\t\t<div class="song-card-title">${song.name}</div>\n\t\t\t</div>\n\t\t\t<div class="song-card-actions">\n\t\t\t\t<button class="song-card-btn play-btn" title="Play this song">\n\t\t\t\t\t<i class="fas fa-play"></i>\n\t\t\t\t</button>\n\t\t\t\t<button class="song-card-btn skip-btn ${this.temporarilySkippedSongs.has(entryId) ? 'active' : ''}" title="Temporarily skip">\n\t\t\t\t\t<i class="fas fa-ban"></i>\n\t\t\t\t</button>\n\t\t\t</div>\n\t\t`;
      const playBtn = songCard.querySelector('.play-btn');
      playBtn.addEventListener('click', e => {
        e.stopPropagation();
        if (!this.temporarilySkippedSongs.has(entryId)) {
          this.playSongFromPlaylist(index);
        }
      });
      const skipBtn = songCard.querySelector('.skip-btn');
      skipBtn.addEventListener('click', e => {
        e.stopPropagation();
        this.temporarilySkipSong(entryId);
      });
      songCard.addEventListener('click', e => {
        if (!e.target.closest('.song-card-btn') && !this.temporarilySkippedSongs.has(entryId)) {
          this.playSongFromPlaylist(index);
        }
      });
      fragment.appendChild(songCard);
    });
    const isControlBarVisible = localStorage.getItem('controlBarVisible') !== 'false';
    if (isControlBarVisible) {
      const spacer = document.createElement('div');
      spacer.classList.add('playlist-sidebar-spacer');
      spacer.id = 'expandedModeSpacer';
      fragment.appendChild(spacer);
    }
    this.elements.sidebarPlaylistSongs.appendChild(fragment);
  }
  renderPlaylistSidebarOverlayMode() {
    this.currentPlaylist.songs.forEach((song, index) => {
      const songElement = document.createElement('div');
      songElement.classList.add('sidebar-song-item');
      const entryId = song.entryId || 'id_' + song.videoId;
      songElement.dataset.entryId = entryId;
      if (index === this.currentSongIndex) {
        songElement.classList.add('active');
      }
      if (this.temporarilySkippedSongs.has(entryId)) {
        songElement.classList.add('temporarily-skipped');
      }
      songElement.innerHTML = `\n\t\t\t<span>${index + 1}. ${song.name}</span>\n\t\t`;
      let clickHandler = e => {
        if (!this.isLongPressing) {
          this.playSongFromPlaylist(index);
        }
      };
      songElement.addEventListener('click', clickHandler);
      songElement.addEventListener('mousedown', e => {
        clearTimeout(this.longPressTimer);
        this.isLongPressing = false;
        this.longPressTimer = setTimeout(() => {
          this.isLongPressing = true;
          this.temporarilySkipSong(entryId);
          setTimeout(() => {
            this.isLongPressing = false;
          }, 300);
        }, 400);
      });
      const cancelLongPress = () => {
        clearTimeout(this.longPressTimer);
      };
      songElement.addEventListener('mouseup', cancelLongPress);
      songElement.addEventListener('mouseleave', cancelLongPress);
      songElement.addEventListener('touchstart', e => {
        clearTimeout(this.longPressTimer);
        this.isLongPressing = false;
        this.longPressTimer = setTimeout(() => {
          this.isLongPressing = true;
          this.temporarilySkipSong(entryId);
          setTimeout(() => {
            this.isLongPressing = false;
          }, 300);
          e.preventDefault();
        }, 400);
      });
      songElement.addEventListener('touchend', cancelLongPress);
      songElement.addEventListener('touchcancel', cancelLongPress);
      this.elements.sidebarPlaylistSongs.appendChild(songElement);
    });
    const isControlBarVisible = localStorage.getItem('controlBarVisible') !== 'false';
    if (isControlBarVisible) {
      const spacer = document.createElement('div');
      spacer.classList.add('playlist-sidebar-spacer');
      spacer.id = 'overlayModeSpacer';
      this.elements.sidebarPlaylistSongs.appendChild(spacer);
    }
  }
  applyPlaylistSidebarMode() {
    const sidebar = this.elements.currentPlaylistSidebar;
    const modeToggleBtn = this.elements.sidebarModeToggleBtn;
    const modeIcon = modeToggleBtn?.querySelector('i');
    if (this.playlistSidebarMode === 'expanded') {
      sidebar.classList.add('expanded-mode');
      document.body.classList.add('playlist-expanded-active');
      if (modeIcon) {
        modeIcon.classList.remove('fa-expand-alt');
        modeIcon.classList.add('fa-compress-alt');
      }
      modeToggleBtn?.classList.add('expanded');
      modeToggleBtn?.setAttribute('title', 'Switch to Overlay Mode');
    } else {
      sidebar.classList.remove('expanded-mode');
      document.body.classList.remove('playlist-expanded-active');
      if (modeIcon) {
        modeIcon.classList.remove('fa-compress-alt');
        modeIcon.classList.add('fa-expand-alt');
      }
      modeToggleBtn?.classList.remove('expanded');
      modeToggleBtn?.setAttribute('title', 'Switch to Expanded Mode');
    }
    if (this.elements.sidebarSearchInput) {
      this.elements.sidebarSearchInput.value = '';
    }
  }
  togglePlaylistSidebarMode() {
    if (this.playlistSidebarMode === 'overlay') {
      this.playlistSidebarMode = 'expanded';
    } else {
      this.playlistSidebarMode = 'overlay';
    }
    localStorage.setItem('playlistSidebarMode', this.playlistSidebarMode);
    this.applyPlaylistSidebarMode();
    if (this.isSidebarVisible) {
      this.renderPlaylistSidebar();
    }
  }
  setupPlaylistSidebarModeListeners() {
    if (this.elements.sidebarModeToggleBtn) {
      this.elements.sidebarModeToggleBtn.addEventListener('click', () => {
        this.togglePlaylistSidebarMode();
      });
    }
    if (this.elements.sidebarSearchInput) {
      this.elements.sidebarSearchInput.addEventListener('input', e => {
        this.filterPlaylistSidebarSongs(e.target.value);
      });
    }
    const savedMode = localStorage.getItem('playlistSidebarMode');
    if (savedMode === 'expanded' || savedMode === 'overlay') {
      this.playlistSidebarMode = savedMode;
      this.updateSidebarModeToggleIcon();
    }
  }
  updateSidebarModeToggleIcon() {
    const modeToggleBtn = this.elements.sidebarModeToggleBtn;
    const modeIcon = modeToggleBtn?.querySelector('i');
    if (this.playlistSidebarMode === 'expanded') {
      if (modeIcon) {
        modeIcon.classList.remove('fa-expand-alt');
        modeIcon.classList.add('fa-compress-alt');
      }
      modeToggleBtn?.classList.add('expanded');
      modeToggleBtn?.setAttribute('title', 'Switch to Overlay Mode');
    } else {
      if (modeIcon) {
        modeIcon.classList.remove('fa-compress-alt');
        modeIcon.classList.add('fa-expand-alt');
      }
      modeToggleBtn?.classList.remove('expanded');
      modeToggleBtn?.setAttribute('title', 'Switch to Expanded Mode');
    }
  }
  filterPlaylistSidebarSongs(searchTerm) {
    clearTimeout(this.sidebarSearchDebounceTimer);
    this.sidebarSearchDebounceTimer = setTimeout(() => {
      const query = searchTerm.toLowerCase().trim();
      const songCards = this.elements.sidebarPlaylistSongs.querySelectorAll('.sidebar-song-card');
      songCards.forEach(card => {
        const songName = card.dataset.songName;
        if (!query || songName.includes(query)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    }, 50);
  }
  switchTab(tabName) {
    this.elements.tabs.forEach(tab => tab.classList.remove('active'));
    this.elements.tabPanes.forEach(pane => pane.classList.remove('active'));
    document.querySelector(`.tab[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(tabName).classList.add('active');
    if (tabName === 'lyrics') {
      this.renderLyricsTab();
    }
    const nowPlaying = document.querySelector('.now-playing');
    const spacer = document.getElementById('controlBarSpacer');
    if (tabName === 'nowplaying') {
      if (nowPlaying) {
        nowPlaying.style.display = 'none';
      }
      if (spacer) {
        spacer.style.display = 'none';
      }
      this.isOnNowPlayingTab = true;
      this.hideCurrentSongSection();
    } else {
      if (nowPlaying) {
        nowPlaying.style.display = '';
      }
      if (spacer) {
        spacer.style.display = '';
      }
      this.isOnNowPlayingTab = false;
      if (this.currentSong) {
        this.showCurrentSongSection();
      }
    }
  }
  cycleToNextTab() {
    if (!this.elements.tabs || this.elements.tabs.length === 0) {
      return;
    }
    const tabElements = Array.from(this.elements.tabs);
    this.currentTabIndex = (this.currentTabIndex + 1) % tabElements.length;
    const nextTabName = tabElements[this.currentTabIndex].dataset.tab;
    this.switchTab(nextTabName);
  }
  initNowPlayingTab() {
    document.getElementById('npPlayPauseBtn')?.addEventListener('click', () => this.togglePlayPause());
    document.getElementById('npPrevBtn')?.addEventListener('click', () => this.playPreviousSong());
    document.getElementById('npNextBtn')?.addEventListener('click', () => this.playNextSong());
    document.getElementById('npLoopBtn')?.addEventListener('click', () => this.toggleLoop());
    document.getElementById('npAutoplayBtn')?.addEventListener('click', () => this.toggleAutoplay());
    document.getElementById('npShowPlaylistBtn')?.addEventListener('click', () => this.togglePlaylistSidebar());
    document.getElementById('npProgressBar')?.addEventListener('change', e => {
      if (this.isLocalPlayback && this.localAudio) {
        const duration = this.localAudio.duration || 0;
        if (!duration) {
          return;
        }
        const seekTime = e.target.value / 100 * duration;
        this.localAudio.currentTime = seekTime;
        this._syncTransportDisplays(seekTime, duration);
        this.updateHighlightedLyric(seekTime, this.currentLyrics ?? [], this.currentTimings ?? []);
        return;
      }
      if (!this.ytPlayer) {
        return;
      }
      const duration = this.ytPlayer.getDuration();
      const seekTime = e.target.value / 100 * duration;
      this.ytPlayer.seekTo(seekTime, true);
      this._syncTransportDisplays(seekTime, duration);
      this.updateHighlightedLyric(seekTime, this.currentLyrics ?? [], this.currentTimings ?? []);
    });
    document.getElementById('npVolumeSlider')?.addEventListener('input', e => {
      this.setVolume(e.target.value);
      if (this.elements.volumeSlider) {
        this.elements.volumeSlider.value = e.target.value;
      }
    });
    const npSpeedBtn = document.getElementById('npSpeedBtn');
    const npSpeedOptions = document.getElementById('npSpeedOptions');
    npSpeedBtn?.addEventListener('click', e => {
      e.stopPropagation();
      npSpeedOptions?.classList.toggle('show');
    });
    document.querySelectorAll('#npSpeedOptions .speed-option').forEach(opt => {
      opt.addEventListener('click', () => {
        const speed = parseFloat(opt.dataset.speed);
        this.setPlaybackSpeed(speed);
        if (npSpeedBtn) {
          npSpeedBtn.textContent = speed + 'x';
        }
        npSpeedOptions?.classList.remove('show');
      });
    });
    document.addEventListener('click', () => {
      npSpeedOptions?.classList.remove('show');
    });
  }
  showNowPlayingTab() {
    const tab = document.querySelector('.tab[data-tab="nowplaying"]');
    if (tab) {
      tab.classList.add('visible');
    }
    this.elements.tabs = document.querySelectorAll('.tab');
    this.elements.tabPanes = document.querySelectorAll('.tab-pane');
  }
  hideNowPlayingTab() {
    const tab = document.querySelector('.tab[data-tab="nowplaying"]');
    if (tab) {
      tab.classList.remove('visible');
    }
    this.elements.tabs = document.querySelectorAll('.tab');
    this.elements.tabPanes = document.querySelectorAll('.tab-pane');
  }
  updateNowPlayingView() {
    if (!this.currentSong) {
      return;
    }
    const song = this.currentPlaylist ? this.songLibrary.find(s => s.videoId === this.currentSong.videoId) || this.currentSong : this.currentSong;
    const thumb = document.getElementById('npThumbnail');
    const name = document.getElementById('npSongName');
    const author = document.getElementById('npSongAuthor');
    const vol = document.getElementById('npVolumeSlider');
    const ppBtn = document.getElementById('npPlayPauseBtn');
    const loopBtn = document.getElementById('npLoopBtn');
    const autoBtn = document.getElementById('npAutoplayBtn');
    if (thumb) {
      thumb.src = `https://img.youtube.com/vi/${song.videoId}/maxresdefault.jpg`;
      thumb.onload = function() {
        if (thumb.naturalHeight <= 90) {
          thumb.onload = null;
          thumb.src = `https://img.youtube.com/vi/${song.videoId}/hqdefault.jpg`;
        }
      };
      thumb.onerror = () => {
        thumb.onerror = null;
        thumb.onload = null;
        thumb.src = `https://img.youtube.com/vi/${song.videoId}/hqdefault.jpg`;
      };
    }
    if (name) {
      name.textContent = song.name || '';
    }
    if (author) {
      author.textContent = song.author || '';
    }
    if (vol && this.elements.volumeSlider) {
      vol.value = this.elements.volumeSlider.value;
    }
    if (ppBtn) {
      ppBtn.innerHTML = this.isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
    }
    if (loopBtn) {
      loopBtn.classList.toggle('active', this.isLooping);
    }
    if (autoBtn) {
      autoBtn.classList.toggle('active', this.isAutoplayEnabled);
    }
  }
  initializeCurrentSongSection() {
    this.updateCurrentSongDisplay();
  }
  updateCurrentSongDisplay() {
    if (!this.currentSong) {
      this.hideCurrentSongSection();
      this.hideNowPlayingTab();
      return;
    }
    this.showNowPlayingTab();
    this.updateNowPlayingView();
    let displaySong = this.currentSong;
    if (this.currentPlaylist) {
      const libMatch = this.songLibrary.find(s => s.videoId === this.currentSong.videoId);
      if (libMatch) {
        displaySong = libMatch;
      }
    }
    this.showCurrentSongSection();
    const thumbnailElement = document.getElementById('currentSongThumbnail');
    const nameElement = document.getElementById('currentSongName');
    const authorElement = document.getElementById('currentSongAuthor');
    if (thumbnailElement) {
      thumbnailElement.src = displaySong.thumbnailUrl || `https://img.youtube.com/vi/${displaySong.videoId}/default.jpg`;
      thumbnailElement.alt = displaySong.name || 'Current Song';
    }
    if (nameElement) {
      nameElement.textContent = displaySong.name || '';
    }
    if (authorElement) {
      authorElement.textContent = displaySong.author || '';
    }
  }
  showCurrentSongSection() {
    if (this.isOnNowPlayingTab) {
      return;
    }
    const currentSongSection = document.getElementById('currentSongSection');
    if (currentSongSection) {
      currentSongSection.style.display = 'block';
    }
  }
  hideCurrentSongSection() {
    const currentSongSection = document.getElementById('currentSongSection');
    if (currentSongSection) {
      currentSongSection.style.display = 'none';
    }
  }
  renderAdditionalDetails() {
    if (!this.elements.additionalDetails) {
      return;
    }
    if (this.isAdditionalDetailsHidden) {
      return;
    }
    this.elements.additionalDetails.innerHTML = '';
    const headerContainer = document.createElement('div');
    headerContainer.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;padding-bottom:6px;border-bottom:1px solid var(--border-color);flex-shrink:0;';
    const headerText = document.createElement('h3');
    headerText.className = 'additional-details-header';
    headerText.textContent = 'Music Explorer';
    headerText.style.cssText = 'margin:0;border:none;padding-bottom:0;';
    const hideBtn = document.createElement('button');
    hideBtn.className = 'hide-details-btn';
    hideBtn.innerHTML = '−';
    const keybindKey = this.currentKeybinds.toggleMusicExplorer || 'KeyO';
    hideBtn.title = `[${this.getKeyDisplayName(keybindKey)}] Hide Music Explorer`;
    hideBtn.style.cssText = `background:transparent;border:none;color:var(--bg-primary);font-size:1.2rem;cursor:pointer;padding:4px 8px;border-radius:4px;transition:all 0.2s ease;line-height:1;font-weight:bold;flex-shrink:0;`;
    hideBtn.addEventListener('mouseenter', () => {
      hideBtn.style.color = 'var(--hover-color)';
      hideBtn.style.background = 'var(--bg-secondary)';
    });
    hideBtn.addEventListener('mouseleave', () => {
      hideBtn.style.color = 'var(--bg-primary)';
      hideBtn.style.background = 'transparent';
    });
    hideBtn.addEventListener('click', () => {
      this.toggleAdditionalDetails();
    });
    headerContainer.appendChild(headerText);
    headerContainer.appendChild(hideBtn);
    this.elements.additionalDetails.appendChild(headerContainer);
    const currentSongDiv = document.createElement('div');
    currentSongDiv.id = 'currentSongSection';
    currentSongDiv.className = 'current-song-section';
    currentSongDiv.style.display = 'none';
    currentSongDiv.innerHTML = `\n\t        <h4 class="current-song-title">Now Playing</h4>\n\t        <div class="current-song-container">\n\t            <div class="current-song-thumbnail"><img id="currentSongThumbnail" src="" alt="Current Song" /></div>\n\t            <div class="current-song-info">\n\t                <div class="current-song-name" id="currentSongName"></div>\n\t                <div class="current-song-author" id="currentSongAuthor"></div>\n\t            </div>\n\t        </div>`;
    this.elements.additionalDetails.appendChild(currentSongDiv);
    this.updateCurrentSongDisplay();
    const defs = this._getDefaultSectionOrder();
    const order = this.sectionOrder || defs.map(s => s.key);
    order.forEach(key => {
      switch (key) {
       case 'recentlyListened':
        {
          const limit = this.recentlyPlayedDisplayLimit;
          if (!limit || limit <= 0) {
            return;
          }
          const items = this.getCombinedRecentlyPlayed();
          if (items.length > 0) {
            this.createDetailsSection('Recently Listened To', items.slice(0, limit), 'mixed');
          }
          break;
        }

       case 'suggested':
        {
          const limit = this.suggestedSongsDisplayLimit;
          if (!limit || limit <= 0) {
            return;
          }
          if (this.songLibrary.length > 0) {
            this.createDetailsSection('Suggested', this.getRandomItems(this.songLibrary, limit), 'song');
          }
          break;
        }

       case 'yourPicks':
        {
          const limit = this.yourPicksDisplayLimit;
          if (!limit || limit <= 0) {
            return;
          }
          const favoriteSongs = this.songLibrary.filter(s => s.favorite);
          if (favoriteSongs.length > 0) {
            this.createDetailsSection('Your Picks', this.getRandomItems(favoriteSongs, limit), 'song');
          }
          break;
        }

       case 'recentPlaylists':
        {
          const limit = this.recentlyPlayedPlaylistsDisplayLimit;
          if (!limit || limit <= 0) {
            return;
          }
          if (this.recentlyPlayedPlaylists.length > 0) {
            this.createDetailsSection('Recently Played Playlists', this.recentlyPlayedPlaylists.slice(0, limit), 'playlist');
          }
          break;
        }
      }
    });
  }
  getCombinedRecentlyPlayed() {
    const combined = [];
    this.recentlyPlayedSongs.forEach(song => {
      combined.push({
        ...song,
        itemType: 'song'
      });
    });
    this.recentlyPlayedPlaylists.forEach(playlist => {
      combined.push({
        ...playlist,
        itemType: 'playlist'
      });
    });
    combined.sort((a, b) => b.timestamp - a.timestamp);
    return combined;
  }
  createDetailsSection(title, items, type) {
    if (!items || items.length === 0) {
      return;
    }
    const section = document.createElement('div');
    section.classList.add('additional-details-section');
    section.setAttribute('data-section-title', title);
    const sectionTitle = document.createElement('h3');
    sectionTitle.textContent = title;
    sectionTitle.classList.add('section-title');
    if (title === 'Recently Listened To') {
      sectionTitle.style.cursor = 'pointer';
      sectionTitle.addEventListener('click', () => {
        this.showRecentlyPlayedModal();
      });
    } else if (title === 'Suggested') {
      sectionTitle.style.cursor = 'pointer';
      sectionTitle.addEventListener('click', () => {
        this.refreshSpecificSection('Suggested');
      });
    } else if (title === 'Your Picks') {
      sectionTitle.style.cursor = 'pointer';
      sectionTitle.addEventListener('click', () => {
        this.refreshSpecificSection('Your Picks');
      });
    }
    section.appendChild(sectionTitle);
    const itemsList = document.createElement('div');
    itemsList.classList.add('details-items-list');
    items.forEach(item => {
      const itemElement = document.createElement('div');
      itemElement.classList.add('details-item');
      const actualType = type === 'mixed' ? item.itemType : type;
      if (actualType === 'song') {
        itemElement.setAttribute('data-video-id', item.videoId);
        itemElement.setAttribute('data-song-id', item.id);
      }
      const thumbnail = document.createElement('div');
      thumbnail.classList.add('details-item-thumbnail');
      if (actualType === 'song') {
        const thumbnailImg = document.createElement('img');
        thumbnailImg.src = item.thumbnailUrl || `https://img.youtube.com/vi/${item.videoId}/default.jpg`;
        thumbnailImg.alt = item.name;
        thumbnailImg.onerror = function() {
          this.onerror = null;
          this.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='90'%3E%3Crect width='120' height='90' fill='%23333'/%3E%3Ctext x='60' y='50' text-anchor='middle' font-size='11' fill='%23fff' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E";
        };
        thumbnail.appendChild(thumbnailImg);
      } else {
        if (item.thumbnailUrl) {
          const thumbnailImg = document.createElement('img');
          thumbnailImg.src = item.thumbnailUrl;
          thumbnailImg.alt = item.name;
          thumbnailImg.onerror = function() {
            this.onerror = null;
            this.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='90'%3E%3Crect width='120' height='90' fill='%23333'/%3E%3Ctext x='60' y='50' text-anchor='middle' font-size='11' fill='%23fff' font-family='sans-serif'%3EPlaylist%3C/text%3E%3C/svg%3E";
          };
          thumbnail.appendChild(thumbnailImg);
        } else {
          const playlistIcon = document.createElement('i');
          playlistIcon.classList.add('fa', 'fa-list');
          thumbnail.appendChild(playlistIcon);
        }
      }
      const itemInfo = document.createElement('div');
      itemInfo.classList.add('details-item-info');
      const itemName = document.createElement('div');
      itemName.classList.add('details-item-name');
      itemName.textContent = item.name;
      itemInfo.appendChild(itemName);
      if (actualType === 'playlist' && item.currentSongName) {
        const currentSongDiv = document.createElement('div');
        currentSongDiv.classList.add('details-item-subtitle');
        currentSongDiv.textContent = item.currentSongName;
        currentSongDiv.style.fontSize = '0.85em';
        currentSongDiv.style.color = 'var(--text-secondary, #888)';
        currentSongDiv.style.marginTop = '4px';
        itemInfo.appendChild(currentSongDiv);
      }
      itemElement.addEventListener('click', e => {
        e.preventDefault();
        if (actualType === 'song') {
          this.playSong(item.id);
        } else {
          this.playPlaylist(item.id);
        }
      });
      if (actualType === 'song') {
        itemElement.addEventListener('contextmenu', e => {
          e.preventDefault();
          this.addToQueue(item);
        });
        itemElement.style.cursor = 'pointer';
        itemElement.title = 'Left click to play, right click to add to queue';
      }
      itemElement.appendChild(thumbnail);
      itemElement.appendChild(itemInfo);
      itemsList.appendChild(itemElement);
    });
    section.appendChild(itemsList);
    this.elements.additionalDetails.appendChild(section);
  }
  refreshSpecificSection(sectionTitle) {
    if (!this.elements.additionalDetails) {
      return;
    }
    const sectionToRefresh = this.elements.additionalDetails.querySelector(`[data-section-title="${sectionTitle}"]`);
    if (!sectionToRefresh) {
      return;
    }
    let newItems = [];
    let type = 'song';
    if (sectionTitle === 'Suggested') {
      if (this.songLibrary.length > 0) {
        newItems = this.getRandomItems(this.songLibrary, this.suggestedSongsDisplayLimit || 2);
      }
    } else if (sectionTitle === 'Your Picks') {
      const favoriteSongs = this.songLibrary.filter(song => song.favorite);
      if (favoriteSongs.length > 0) {
        newItems = this.getRandomItems(favoriteSongs, this.yourPicksDisplayLimit || 2);
      }
    }
    if (newItems.length === 0) {
      return;
    }
    const itemsList = sectionToRefresh.querySelector('.details-items-list');
    if (!itemsList) {
      return;
    }
    itemsList.innerHTML = '';
    newItems.forEach(item => {
      const itemElement = document.createElement('div');
      itemElement.classList.add('details-item');
      if (type === 'song') {
        itemElement.setAttribute('data-video-id', item.videoId);
        itemElement.setAttribute('data-song-id', item.id);
      }
      const thumbnail = document.createElement('div');
      thumbnail.classList.add('details-item-thumbnail');
      if (type === 'song') {
        const thumbnailImg = document.createElement('img');
        thumbnailImg.src = item.thumbnailUrl || `https://img.youtube.com/vi/${item.videoId}/default.jpg`;
        thumbnailImg.alt = item.name;
        thumbnailImg.onerror = function() {
          this.onerror = null;
          this.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='90'%3E%3Crect width='120' height='90' fill='%23333'/%3E%3Ctext x='60' y='50' text-anchor='middle' font-size='11' fill='%23fff' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E";
        };
        thumbnail.appendChild(thumbnailImg);
      } else {
        const playlistIcon = document.createElement('i');
        playlistIcon.classList.add('fa', 'fa-list');
        thumbnail.appendChild(playlistIcon);
      }
      const itemInfo = document.createElement('div');
      itemInfo.classList.add('details-item-info');
      const itemName = document.createElement('div');
      itemName.classList.add('details-item-name');
      itemName.textContent = item.name;
      itemInfo.appendChild(itemName);
      itemElement.addEventListener('click', e => {
        e.preventDefault();
        if (type === 'song') {
          this.playSong(item.id);
        } else {
          this.playPlaylist(item.id);
        }
      });
      if (type === 'song') {
        itemElement.addEventListener('contextmenu', e => {
          e.preventDefault();
          this.addToQueue(item);
        });
        itemElement.style.cursor = 'pointer';
        itemElement.title = 'Left click to play, right click to add to queue';
      }
      itemElement.appendChild(thumbnail);
      itemElement.appendChild(itemInfo);
      itemsList.appendChild(itemElement);
    });
  }
  toggleAdditionalDetails() {
    const additionalDetails = document.getElementById('additionalDetails');
    if (!additionalDetails) {
      return;
    }
    if (additionalDetails.style.display === 'none') {
      additionalDetails.style.display = 'flex';
      this.isAdditionalDetailsHidden = false;
      this.renderAdditionalDetails();
    } else {
      additionalDetails.style.display = 'none';
      this.isAdditionalDetailsHidden = true;
    }
  }
  getRandomItems(array, count) {
    if (array.length <= count) {
      return [ ...array ];
    }
    const result = [];
    const copyArray = [ ...array ];
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * copyArray.length);
      result.push(copyArray[randomIndex]);
      copyArray.splice(randomIndex, 1);
    }
    return result;
  }
  showRecentlyPlayedModal() {
    const modal = document.getElementById('recentlyPlayedModal');
    const limitInput = document.getElementById('recentlyPlayedLimitInput');
    limitInput.value = this.recentlyPlayedLimit || 20;
    modal.style.display = 'flex';
    this.renderRecentlyPlayedContent();
    this.setupRecentlyPlayedModalListeners();
  }
  setupRecentlyPlayedModalListeners() {
    if (this.recentlyPlayedListenersSetup) {
      return;
    }
    this.recentlyPlayedListenersSetup = true;
    const modal = document.getElementById('recentlyPlayedModal');
    const closeBtn = document.getElementById('closeRecentlyPlayedModal');
    const limitInput = document.getElementById('recentlyPlayedLimitInput');
    closeBtn.addEventListener('click', () => {
      this.hideRecentlyPlayedModal();
    });
    modal.addEventListener('click', e => {
      if (e.target === modal) {
        this.hideRecentlyPlayedModal();
      }
    });
    limitInput.addEventListener('change', () => {
      const newLimit = parseInt(limitInput.value) || 20;
      if (newLimit >= 1 && newLimit <= 100) {
        this.updateRecentlyPlayedLimit(newLimit);
      } else {
        limitInput.value = this.recentlyPlayedLimit || 20;
      }
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal.style.display === 'flex') {
        this.hideRecentlyPlayedModal();
      }
    });
  }
  renderRecentlyPlayedContent() {
    const content = document.getElementById('recentlyPlayedContent');
    content.innerHTML = '';
    if (this.recentlyPlayedSongs.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.style.cssText = `\n      text-align: center;\n      color: var(--text-secondary);\n      padding: 40px 20px;\n      font-style: italic;\n    `;
      emptyMessage.textContent = 'No recently played songs';
      content.appendChild(emptyMessage);
      return;
    }
    this.recentlyPlayedSongs.forEach((song, index) => {
      const songItem = document.createElement('div');
      songItem.classList.add('recently-played-item');
      const thumbnail = document.createElement('img');
      thumbnail.src = song.thumbnailUrl || `https://img.youtube.com/vi/${song.videoId}/default.jpg`;
      thumbnail.alt = song.name;
      thumbnail.classList.add('recently-played-thumbnail');
      thumbnail.onerror = function() {
        this.onerror = null;
        this.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='90'%3E%3Crect width='120' height='90' fill='%23333'/%3E%3Ctext x='60' y='50' text-anchor='middle' font-size='11' fill='%23fff' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E";
      };
      const info = document.createElement('div');
      info.classList.add('recently-played-info');
      const name = document.createElement('div');
      name.classList.add('recently-played-name');
      name.textContent = song.name;
      const time = document.createElement('div');
      time.classList.add('recently-played-time');
      const timeAgo = this.getTimeAgorecentlyplayedmodel(song.timestamp);
      time.textContent = timeAgo;
      const removeBtn = document.createElement('button');
      removeBtn.classList.add('recently-played-remove');
      removeBtn.innerHTML = '×';
      removeBtn.title = 'Remove from recently played';
      removeBtn.addEventListener('click', e => {
        e.stopPropagation();
        this.removeFromRecentlyPlayed(song.id, index);
      });
      info.appendChild(name);
      info.appendChild(time);
      songItem.appendChild(thumbnail);
      songItem.appendChild(info);
      songItem.appendChild(removeBtn);
      songItem.addEventListener('click', () => {
        this.playSong(song.id);
        this.hideRecentlyPlayedModal();
      });
      content.appendChild(songItem);
    });
  }
  hideRecentlyPlayedModal() {
    const modal = document.getElementById('recentlyPlayedModal');
    modal.style.display = 'none';
  }
  removeFromRecentlyPlayed(songId, index) {
    this.recentlyPlayedSongs.splice(index, 1);
    this.renderRecentlyPlayedContent();
    this.renderAdditionalDetails();
    if (this.db) {
      try {
        const transaction = this.db.transaction([ 'recentlyPlayed' ], 'readwrite');
        const store = transaction.objectStore('recentlyPlayed');
        store.put({
          type: 'songs',
          items: this.recentlyPlayedSongs
        });
        transaction.onerror = event => {
          console.error('Error removing from recently played:', event.target.error);
        };
      } catch (error) {
        console.error('Error updating recently played in database:', error);
      }
    }
  }
  getTimeAgorecentlyplayedmodel(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1e3 * 60));
    const hours = Math.floor(diff / (1e3 * 60 * 60));
    const days = Math.floor(diff / (1e3 * 60 * 60 * 24));
    if (minutes < 1) {
      return 'Just now';
    }
    if (minutes < 60) {
      return `${minutes}m ago`;
    }
    if (hours < 24) {
      return `${hours}h ago`;
    }
    return `${days}d ago`;
  }
  updateRecentlyPlayedLimit(newLimit) {
    this.recentlyPlayedLimit = newLimit;
    this.saveSetting('recentlyPlayedLimit', newLimit).then(() => {
      if (this.recentlyPlayedSongs.length > newLimit) {
        this.recentlyPlayedSongs = this.recentlyPlayedSongs.slice(0, newLimit);
        if (this.db) {
          const transaction = this.db.transaction([ 'recentlyPlayed' ], 'readwrite');
          const store = transaction.objectStore('recentlyPlayed');
          store.put({
            type: 'songs',
            items: this.recentlyPlayedSongs
          });
          this.renderRecentlyPlayedContent();
          this.renderAdditionalDetails();
        }
      }
    }).catch(error => {
      console.error('Error saving recently played limit:', error);
      this.recentlyPlayedLimit = this.recentlyPlayedLimit || 20;
    });
  }
  saveRecentlyPlayedSong(song) {
    if (!this.db || !song) {
      return;
    }
    if (this.currentPlaylist) {
      this.saveRecentlyPlayedPlaylist(this.currentPlaylist);
      return;
    }
    const songData = {
      id: song.id,
      name: song.name,
      videoId: song.videoId,
      thumbnailUrl: song.thumbnailUrl || `https://img.youtube.com/vi/${song.videoId}/default.jpg`,
      timestamp: Date.now()
    };
    const transaction = this.db.transaction([ 'recentlyPlayed' ], 'readwrite');
    const store = transaction.objectStore('recentlyPlayed');
    const request = store.get('songs');
    request.onsuccess = () => {
      let recentlyPlayedSongs = [];
      if (request.result && Array.isArray(request.result.items)) {
        recentlyPlayedSongs = request.result.items;
      }
      recentlyPlayedSongs = recentlyPlayedSongs.filter(item => item.id !== song.id);
      recentlyPlayedSongs.unshift(songData);
      const limit = this.recentlyPlayedLimit || 20;
      if (recentlyPlayedSongs.length > limit) {
        recentlyPlayedSongs = recentlyPlayedSongs.slice(0, limit);
      }
      this.recentlyPlayedSongs = recentlyPlayedSongs;
      store.put({
        type: 'songs',
        items: recentlyPlayedSongs
      });
      this.renderAdditionalDetails();
    };
    request.onerror = event => {
      console.warn('Error updating recently played songs:', event.target.error);
    };
  }
  saveRecentlyPlayedPlaylist(playlist) {
    if (!this.db || !playlist) {
      return;
    }
    const currentSong = playlist.songs[this.currentSongIndex];
    const playlistData = {
      id: playlist.id,
      name: playlist.name,
      timestamp: Date.now(),
      currentSongName: currentSong ? currentSong.name : '',
      thumbnailUrl: currentSong ? currentSong.thumbnailUrl || `https://img.youtube.com/vi/${currentSong.videoId}/default.jpg` : ''
    };
    try {
      const transaction = this.db.transaction([ 'recentlyPlayed' ], 'readwrite');
      const store = transaction.objectStore('recentlyPlayed');
      const request = store.get('playlists');
      request.onsuccess = () => {
        let recentlyPlayedPlaylists = [];
        if (request.result && Array.isArray(request.result.items)) {
          recentlyPlayedPlaylists = request.result.items;
        }
        recentlyPlayedPlaylists = recentlyPlayedPlaylists.filter(item => item.id !== playlist.id);
        recentlyPlayedPlaylists.unshift(playlistData);
        if (recentlyPlayedPlaylists.length > 20) {
          recentlyPlayedPlaylists = recentlyPlayedPlaylists.slice(0, 20);
        }
        this.recentlyPlayedPlaylists = recentlyPlayedPlaylists;
        store.put({
          type: 'playlists',
          items: recentlyPlayedPlaylists
        });
        this.renderAdditionalDetails();
      };
      request.onerror = event => {
        console.warn('Error updating recently played playlists:', event.target.error);
      };
    } catch (error) {
      console.warn('Error saving recently played playlist:', error);
    }
  }
  renderLyricsTab() {
    if (!this.elements.lyricsPane) {
      return;
    }
    this.elements.lyricsPane.innerHTML = '';
    if (this.currentSongIndex === undefined || !this.songLibrary.length && !this.currentPlaylist) {
      const emptyMessage = document.createElement('div');
      emptyMessage.classList.add('empty-lyrics-message');
      emptyMessage.textContent = 'No song is currently playing.';
      this.elements.lyricsPane.appendChild(emptyMessage);
      return;
    }
    const currentSong = this.currentPlaylist ? this.currentPlaylist.songs[this.currentSongIndex] : this.songLibrary[this.currentSongIndex];
    if (!currentSong) {
      const errorMessage = document.createElement('div');
      errorMessage.classList.add('error-message');
      errorMessage.textContent = 'Current song information could not be found.';
      this.elements.lyricsPane.appendChild(errorMessage);
      return;
    }
    let songWithLyrics = currentSong;
    if (this.currentPlaylist) {
      const libraryMatch = this.songLibrary.find(libSong => libSong.videoId === currentSong.videoId);
      if (libraryMatch && libraryMatch.lyrics) {
        songWithLyrics = libraryMatch;
      }
    }
    if (!songWithLyrics.lyrics || songWithLyrics.lyrics.trim() === '') {
      const noLyricsMessage = document.createElement('div');
      noLyricsMessage.classList.add('no-lyrics-message');
      noLyricsMessage.innerHTML = `\n\t            <p>No lyrics available for "${this.escapeHtml(currentSong.name)}".</p>\n\t            <p>You can add lyrics by double-clicking on this song in the library tab.</p>\n\t        `;
      const buttonsContainer = document.createElement('div');
      buttonsContainer.style.display = 'flex';
      buttonsContainer.style.gap = '10px';
      buttonsContainer.style.marginTop = '10px';
      const addLyricsBtn = document.createElement('button');
      addLyricsBtn.textContent = 'Transcribe lyrics';
      addLyricsBtn.classList.add('add-lyrics-btn');
      addLyricsBtn.style.backgroundColor = 'var(--accent-color)';
      addLyricsBtn.style.color = 'var(--button-text-color)';
      addLyricsBtn.style.border = 'none';
      addLyricsBtn.style.borderRadius = '4px';
      addLyricsBtn.style.padding = '8px 16px';
      addLyricsBtn.style.cursor = 'pointer';
      addLyricsBtn.style.flex = '1';
      const importSubtitlesBtn = document.createElement('button');
      importSubtitlesBtn.textContent = 'Import subtitles as lyrics';
      importSubtitlesBtn.classList.add('import-subtitles-btn');
      importSubtitlesBtn.style.backgroundColor = 'var(--hover-color)';
      importSubtitlesBtn.style.color = 'var(--button-text-color)';
      importSubtitlesBtn.style.border = 'none';
      importSubtitlesBtn.style.borderRadius = '4px';
      importSubtitlesBtn.style.padding = '8px 16px';
      importSubtitlesBtn.style.cursor = 'pointer';
      importSubtitlesBtn.style.flex = '1';
      const librarySong = this.currentPlaylist ? this.songLibrary.find(s => s.videoId === currentSong.videoId) : currentSong;
      if (librarySong) {
        addLyricsBtn.addEventListener('click', () => {
          this.openLyricsMakerModal(librarySong.id);
        });
        importSubtitlesBtn.addEventListener('click', () => {
          this.openImportSubtitlesModal(librarySong.id);
        });
        buttonsContainer.appendChild(addLyricsBtn);
        buttonsContainer.appendChild(importSubtitlesBtn);
      }
      noLyricsMessage.appendChild(buttonsContainer);
      this.elements.lyricsPane.appendChild(noLyricsMessage);
      return;
    }
    const lyricsPlayer = document.createElement('div');
    lyricsPlayer.classList.add('lyrics-player');
    lyricsPlayer.style.position = 'relative';
    const lyricsArray = [];
    const timingsArray = [];
    let hasTimestamps = false;
    const lines = songWithLyrics.lyrics.split('\n').filter(line => line.trim() !== '');
    for (const line of lines) {
      if (line.match(/.*\s*\[(\d+):(\d+)\]/)) {
        hasTimestamps = true;
        break;
      }
    }
    for (const line of lines) {
      if (hasTimestamps) {
        const match = line.match(/(.*)\s*\[(\d+):(\d+)\]/);
        if (match) {
          const lyric = match[1].trim();
          const minutes = parseInt(match[2]);
          const seconds = parseInt(match[3]);
          const timeInSeconds = minutes * 60 + seconds;
          lyricsArray.push(lyric);
          timingsArray.push(timeInSeconds);
        }
      } else {
        lyricsArray.push(line.trim());
      }
    }
    const lyricsDisplay = document.createElement('div');
    lyricsDisplay.classList.add('lyrics-display');
    lyricsDisplay.style.margin = '20px 0';
    lyricsDisplay.style.padding = '15px';
    lyricsDisplay.style.border = '1px solid var(--border-color)';
    lyricsDisplay.style.borderRadius = '5px';
    lyricsDisplay.style.backgroundColor = 'var(--bg-primary)';
    lyricsDisplay.style.height = '400px';
    lyricsDisplay.style.overflowY = 'auto';
    for (let i = 0; i < lyricsArray.length; i++) {
      const lineElement = document.createElement('div');
      lineElement.classList.add('lyric-line');
      lineElement.textContent = lyricsArray[i];
      lineElement.id = `lyric-${i}`;
      lyricsDisplay.appendChild(lineElement);
    }
    lyricsPlayer.appendChild(lyricsDisplay);
    const floatingButtonsContainer = document.createElement('div');
    floatingButtonsContainer.style.cssText = `\n\t        position: absolute;\n\t        top: 10px;\n\t        right: 15px;\n\t        display: flex;\n\t        gap: 7px;\n\t        z-index: 100;\n\t        pointer-events: none;\n\t    `;
    const addSimpleHover = btn => {
      btn.addEventListener('mouseenter', () => {
        btn.style.opacity = '1';
        btn.style.transform = 'scale(1.1)';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.opacity = btn._baseOpacity ?? '0.7';
        btn.style.transform = 'scale(1)';
      });
    };
    if (this.autoCenterLyrics === undefined) {
      this.autoCenterLyrics = true;
    }
    const autoCenterButton = document.createElement('button');
    autoCenterButton.innerHTML = '<i class="fas fa-align-center"></i>';
    autoCenterButton.title = this.autoCenterLyrics ? 'Auto-center: ON' : 'Auto-center: OFF';
    autoCenterButton._baseOpacity = this.autoCenterLyrics ? '1' : '0.5';
    autoCenterButton.style.cssText = `\n\t        background: ${this.autoCenterLyrics ? 'rgba(93, 156, 89, 0.25)' : 'rgba(128, 128, 128, 0.15)'};\n\t        backdrop-filter: blur(10px);\n\t        border: 1px solid rgba(255, 255, 255, 0.2);\n\t        border-radius: 50%;\n\t        width: 25px;\n\t        height: 25px;\n\t        display: flex;\n\t        align-items: center;\n\t        justify-content: center;\n\t        cursor: pointer;\n\t        transition: all 0.3s ease;\n\t        color: var(--text-primary);\n\t        font-size: 10px;\n\t        pointer-events: auto;\n\t        opacity: ${this.autoCenterLyrics ? '1' : '0.5'};\n\t    `;
    const updateAutoCenterStyle = () => {
      const on = this.autoCenterLyrics;
      autoCenterButton.style.background = on ? 'rgba(93, 156, 89, 0.25)' : 'rgba(128, 128, 128, 0.15)';
      autoCenterButton.style.opacity = on ? '1' : '0.5';
      autoCenterButton._baseOpacity = on ? '1' : '0.5';
      autoCenterButton.title = on ? 'Auto-center: ON' : 'Auto-center: OFF';
    };
    autoCenterButton.addEventListener('mouseenter', () => {
      autoCenterButton.style.opacity = '1';
      autoCenterButton.style.transform = 'scale(1.1)';
    });
    autoCenterButton.addEventListener('mouseleave', () => {
      autoCenterButton.style.opacity = autoCenterButton._baseOpacity;
      autoCenterButton.style.transform = 'scale(1)';
    });
    autoCenterButton.addEventListener('click', () => {
      this.autoCenterLyrics = !this.autoCenterLyrics;
      updateAutoCenterStyle();
    });
    floatingButtonsContainer.appendChild(autoCenterButton);
    if (hasTimestamps) {
      const shareButton = document.createElement('button');
      shareButton.innerHTML = '<i class="fas fa-share-alt"></i>';
      shareButton.title = 'Share Karaoke URL';
      shareButton._baseOpacity = '0.7';
      shareButton.style.cssText = `\n\t            background: rgba(128, 128, 128, 0.15);\n\t            backdrop-filter: blur(10px);\n\t            border: 1px solid rgba(255, 255, 255, 0.2);\n\t            border-radius: 50%;\n\t            width: 25px;\n\t            height: 25px;\n\t            display: flex;\n\t            align-items: center;\n\t            justify-content: center;\n\t            cursor: pointer;\n\t            transition: all 0.3s ease;\n\t            color: var(--text-primary);\n\t            font-size: 10px;\n\t            pointer-events: auto;\n\t            opacity: 0.7;\n\t        `;
      addSimpleHover(shareButton);
      shareButton.addEventListener('click', () => {
        this.shareKaraokeURL();
      });
      floatingButtonsContainer.appendChild(shareButton);
    }
    const expandButton = document.createElement('button');
    expandButton.innerHTML = '<i class="fas fa-expand"></i>';
    expandButton.title = 'Expand Lyrics';
    expandButton._baseOpacity = '0.7';
    expandButton.style.cssText = `\n\t        background: rgba(128, 128, 128, 0.15);\n\t        backdrop-filter: blur(10px);\n\t        border: 1px solid rgba(255, 255, 255, 0.2);\n\t        border-radius: 50%;\n\t        width: 25px;\n\t        height: 25px;\n\t        display: flex;\n\t        align-items: center;\n\t        justify-content: center;\n\t        cursor: pointer;\n\t        transition: all 0.3s ease;\n\t        color: var(--text-primary);\n\t        font-size: 10px;\n\t        pointer-events: auto;\n\t        opacity: 0.7;\n\t    `;
    addSimpleHover(expandButton);
    expandButton.addEventListener('click', () => {
      this.enterLyricsFullscreen();
    });
    floatingButtonsContainer.appendChild(expandButton);
    lyricsPlayer.appendChild(floatingButtonsContainer);
    this.elements.lyricsPane.appendChild(lyricsPlayer);
    this.currentLyrics = hasTimestamps ? lyricsArray : [];
    this.currentTimings = hasTimestamps ? timingsArray : [];
    if (this.lyricsInterval) {
      clearInterval(this.lyricsInterval);
      this.lyricsInterval = null;
    }
    if (hasTimestamps && this.ytPlayer) {
      this.lyricsInterval = setInterval(() => {
        if (this.ytPlayer && this.ytPlayer.getCurrentTime && this.ytPlayer.getPlayerState() === YT.PlayerState.PLAYING) {
          const currentTime = this.ytPlayer.getCurrentTime();
          this.updateHighlightedLyric(currentTime, this.currentLyrics, this.currentTimings);
        }
      }, 240);
    }
  }
  generateKaraokeURL(song, lyricsWithTimestamps) {
    const lines = [];
    const lyricsArray = lyricsWithTimestamps.split('\n');
    lyricsArray.forEach(line => {
      const match = line.match(/^(.+?)\s*\[(\d+):(\d+)\]$/);
      if (match) {
        const text = match[1].trim();
        const minutes = parseInt(match[2]);
        const seconds = parseInt(match[3]);
        const timeInSeconds = minutes * 60 + seconds;
        lines.push({
          text: text,
          time: timeInSeconds
        });
      }
    });
    if (lines.length === 0) {
      this.showNotification('No timed lyrics found. Please add timestamps first.', 'error');
      return null;
    }
    return KaraokeEncoder.generateURL(song.videoId, lines);
  }
  async shareKaraokeURL() {
    const currentSong = this.currentPlaylist ? this.currentPlaylist.songs[this.currentSongIndex] : this.songLibrary[this.currentSongIndex];
    if (!currentSong) {
      this.showNotification('No song is currently playing', 'error');
      return;
    }
    let songWithLyrics = currentSong;
    if (this.currentPlaylist) {
      const libraryMatch = this.songLibrary.find(libSong => libSong.videoId === currentSong.videoId);
      if (libraryMatch && libraryMatch.lyrics) {
        songWithLyrics = libraryMatch;
      }
    }
    if (!songWithLyrics.lyrics || songWithLyrics.lyrics.trim() === '') {
      this.showNotification('No lyrics available for this song', 'error');
      return;
    }
    const hasTimestamps = songWithLyrics.lyrics.match(/.*\s*\[(\d+):(\d+)\]/);
    if (!hasTimestamps) {
      this.showNotification('Lyrics need timestamps to create karaoke. Use the lyric maker.', 'error');
      return;
    }
    try {
      await loadKaraokeShareDependencies();
    } catch (err) {
      this.showNotification('Failed to load karaoke sharing tools. Check your connection.', 'error');
      return;
    }
    const url = this.generateKaraokeURL(songWithLyrics, songWithLyrics.lyrics);
    if (!url) {
      return;
    }
    const tempInput = document.createElement('input');
    tempInput.value = url;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    this.showNotification('Karaoke URL copied to clipboard!', 'success');
  }
  updateHighlightedLyric(currentTime, lyrics, timings) {
    if (!lyrics.length || !timings.length || timings.length !== lyrics.length) {
      return;
    }
    let highlightIndex = -1;
    for (let i = 0; i < timings.length; i++) {
      if (currentTime >= timings[i]) {
        highlightIndex = i;
      } else {
        break;
      }
    }
    if (highlightIndex !== this.currentHighlightedLyricIndex) {
      if (this.currentHighlightedLyricIndex !== undefined && this.currentHighlightedLyricIndex !== -1) {
        const prevElement = document.getElementById(`lyric-${this.currentHighlightedLyricIndex}`);
        if (prevElement) {
          prevElement.classList.remove('active');
        }
      }
      if (highlightIndex !== -1) {
        const currentElement = document.getElementById(`lyric-${highlightIndex}`);
        if (currentElement) {
          currentElement.classList.add('active');
          if (this.autoCenterLyrics !== false) {
            currentElement.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
          }
        }
      }
      this.currentHighlightedLyricIndex = highlightIndex;
    }
  }
  openLyricsLibraryModal() {
    const modal = document.createElement('div');
    modal.classList.add('lyrics-library-modal');
    modal.style.display = 'flex';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.7)';
    modal.style.zIndex = '1000';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-content');
    modalContent.style.backgroundColor = 'var(--bg-secondary)';
    modalContent.style.color = 'var(--text-primary)';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '5px';
    modalContent.style.width = '90%';
    modalContent.style.maxWidth = '800px';
    modalContent.style.maxHeight = '80vh';
    modalContent.style.overflowY = 'auto';
    modalContent.style.boxShadow = '0 0 15px rgba(0,0,0,0.3)';
    modalContent.style.position = 'relative';
    const headerContainer = document.createElement('div');
    headerContainer.style.position = 'sticky';
    headerContainer.style.top = '0';
    headerContainer.style.backgroundColor = 'var(--bg-secondary)';
    headerContainer.style.paddingBottom = '10px';
    headerContainer.style.marginBottom = '10px';
    headerContainer.style.borderBottom = '1px solid var(--border-color)';
    headerContainer.style.display = 'flex';
    headerContainer.style.justifyContent = 'space-between';
    headerContainer.style.alignItems = 'center';
    headerContainer.style.zIndex = '10';
    const header = document.createElement('h3');
    header.textContent = 'Songs with Lyrics';
    header.style.margin = '0';
    header.style.color = 'var(--text-primary)';
    const closeBtn = document.createElement('span');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.fontSize = '24px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.color = 'var(--text-primary)';
    closeBtn.style.lineHeight = '24px';
    closeBtn.onclick = () => modal.remove();
    headerContainer.appendChild(header);
    headerContainer.appendChild(closeBtn);
    const contentContainer = document.createElement('div');
    contentContainer.style.display = 'flex';
    contentContainer.style.flexDirection = 'column';
    contentContainer.style.gap = '10px';
    const songsWithLyrics = this.songLibrary.filter(song => song.lyrics && song.lyrics.trim() !== '');
    if (songsWithLyrics.length === 0) {
      const noLyricsMessage = document.createElement('div');
      noLyricsMessage.textContent = 'No songs with lyrics found. Add lyrics to your songs to see them here.';
      noLyricsMessage.style.textAlign = 'center';
      noLyricsMessage.style.color = 'var(--text-secondary)';
      noLyricsMessage.style.padding = '20px';
      contentContainer.appendChild(noLyricsMessage);
    } else {
      songsWithLyrics.forEach(song => {
        const songItem = document.createElement('div');
        songItem.style.display = 'flex';
        songItem.style.alignItems = 'center';
        songItem.style.padding = '10px';
        songItem.style.backgroundColor = 'var(--bg-primary)';
        songItem.style.borderRadius = '5px';
        songItem.style.border = '1px solid var(--border-color)';
        songItem.style.gap = '10px';
        const songInfo = document.createElement('div');
        songInfo.style.flex = '1';
        songInfo.style.minWidth = '0';
        const songName = document.createElement('div');
        songName.textContent = song.name;
        songName.style.fontWeight = 'bold';
        songName.style.color = 'var(--text-primary)';
        songName.style.overflow = 'hidden';
        songName.style.textOverflow = 'ellipsis';
        songName.style.whiteSpace = 'nowrap';
        const lyricsPreview = document.createElement('div');
        const firstLine = song.lyrics.split('\n')[0]?.replace(/\[.*?\]/g, '').trim() || 'No preview available';
        lyricsPreview.textContent = firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine;
        lyricsPreview.style.color = 'var(--text-secondary)';
        lyricsPreview.style.fontSize = '0.9em';
        lyricsPreview.style.overflow = 'hidden';
        lyricsPreview.style.textOverflow = 'ellipsis';
        lyricsPreview.style.whiteSpace = 'nowrap';
        songInfo.appendChild(songName);
        songInfo.appendChild(lyricsPreview);
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '5px';
        buttonContainer.style.flexShrink = '0';
        const copyBtn = document.createElement('button');
        copyBtn.textContent = 'Copy';
        copyBtn.style.padding = '5px 10px';
        copyBtn.style.fontSize = '0.8em';
        copyBtn.style.backgroundColor = 'var(--accent-color)';
        copyBtn.style.color = 'white';
        copyBtn.style.border = 'none';
        copyBtn.style.borderRadius = '3px';
        copyBtn.style.cursor = 'pointer';
        copyBtn.style.transition = 'background-color 0.3s';
        copyBtn.addEventListener('mouseover', () => {
          copyBtn.style.backgroundColor = 'var(--hover-color)';
        });
        copyBtn.addEventListener('mouseout', () => {
          copyBtn.style.backgroundColor = 'var(--accent-color)';
        });
        copyBtn.onclick = () => {
          navigator.clipboard.writeText(song.lyrics).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            copyBtn.style.backgroundColor = '#4CAF50';
            setTimeout(() => {
              copyBtn.textContent = originalText;
              copyBtn.style.backgroundColor = 'var(--accent-color)';
            }, 1e3);
          }).catch(err => {
            console.error('Failed to copy lyrics:', err);
            alert('Failed to copy lyrics to clipboard');
          });
        };
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.style.padding = '5px 10px';
        editBtn.style.fontSize = '0.8em';
        editBtn.style.backgroundColor = '#6c757d';
        editBtn.style.color = 'white';
        editBtn.style.border = 'none';
        editBtn.style.borderRadius = '3px';
        editBtn.style.cursor = 'pointer';
        editBtn.style.transition = 'background-color 0.3s';
        editBtn.addEventListener('mouseover', () => {
          editBtn.style.backgroundColor = '#5a6268';
        });
        editBtn.addEventListener('mouseout', () => {
          editBtn.style.backgroundColor = '#6c757d';
        });
        editBtn.onclick = () => {
          modal.remove();
          this.openSongEditModal(song.id);
        };
        buttonContainer.appendChild(copyBtn);
        buttonContainer.appendChild(editBtn);
        songItem.appendChild(songInfo);
        songItem.appendChild(buttonContainer);
        contentContainer.appendChild(songItem);
      });
    }
    modalContent.appendChild(headerContainer);
    modalContent.appendChild(contentContainer);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    modal.onclick = e => {
      if (e.target === modal) {
        modal.remove();
      }
    };
  }
  setupLyricsTabContextMenu() {
    const lyricsTab = document.querySelector('.tab[data-tab="lyrics"]');
    if (!lyricsTab) {
      return;
    }
    lyricsTab.addEventListener('contextmenu', e => {
      e.preventDefault();
      this.openLyricsLibraryModal();
    });
  }
  openLyricsMakerModal(songId) {
    const song = this.songLibrary.find(s => s.id === songId);
    if (!song) {
      return;
    }
    if (this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
      this.ytPlayer.pauseVideo();
      this.isPlaying = false;
      this.updatePlayerUI();
      this.stopPlaybackTrackingIntervals();
    }
    const modal = document.getElementById('lyricsModal');
    const titleElement = document.getElementById('lyricsTitle');
    titleElement.textContent = `Lyrics Maker for: ${song.name}`;
    if (this.currentLyricMakerSongId !== songId) {
      if (this.lyricMakerCleanup) {
        this.lyricMakerCleanup();
      }
      this.currentLyricMakerSongId = songId;
      this.initLyricMaker(song);
    }
    modal.classList.remove('hidden');
  }
  stopPlaybackTrackingIntervals() {
    if (this.titleScrollInterval) {
      clearInterval(this.titleScrollInterval);
    }
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
    if (this.lyricsInterval) {
      clearInterval(this.lyricsInterval);
    }
  }
  initLyricMaker(song) {
    const modal = document.getElementById('lyricsModal');
    const closeBtn = document.getElementById('closeLyricsModal');
    const player = {
      ytPlayer: null
    };
    const state = {
      lyrics: [],
      timings: [],
      currentLineIndex: -1,
      isRecording: false,
      timeUpdateInterval: null
    };
    const closeModal = () => {
      modal.classList.add('hidden');
      if (state.timeUpdateInterval) {
        clearInterval(state.timeUpdateInterval);
      }
      if (player.ytPlayer) {
        player.ytPlayer.destroy();
      }
    };
    closeBtn.onclick = closeModal;
    const showTab = tabId => {
      document.querySelectorAll('.lyrics-tab, .lyrics-nav-item').forEach(el => el.classList.remove('active'));
      document.getElementById(tabId).classList.add('active');
      document.querySelectorAll('.lyrics-nav-item').forEach(item => {
        if (item.dataset.tab === tabId) {
          item.classList.add('active');
        }
      });
    };
    const tabClickHandler = tab => () => showTab(tab.dataset.tab);
    const tabHandlers = [];
    document.querySelectorAll('.lyrics-nav-item').forEach(tab => {
      const handler = tabClickHandler(tab);
      tabHandlers.push({
        element: tab,
        handler: handler
      });
      tab.addEventListener('click', handler);
    });
    const loadVideo = () => {
      const videoId = song.videoId;
      if (!videoId) {
        return;
      }
      if (player.ytPlayer) {
        player.ytPlayer.destroy();
      }
      if (typeof YT === 'undefined' || typeof YT.Player === 'undefined') {
        if (!document.getElementById('youtube-api')) {
          const tag = document.createElement('script');
          tag.id = 'youtube-api';
          tag.src = 'https://www.youtube.com/iframe_api';
          const firstScriptTag = document.getElementsByTagName('script')[0];
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
          window.onYouTubeIframeAPIReady = () => {
            createYouTubePlayer(videoId);
          };
        }
      } else {
        createYouTubePlayer(videoId);
      }
    };
    const createYouTubePlayer = videoId => {
      const container = document.getElementById('videoContainer');
      if (!container) {
        return;
      }
      if (this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
        this.ytPlayer.pauseVideo();
      }
      player.ytPlayer = new YT.Player(container, {
        height: '288',
        width: '512',
        videoId: videoId,
        playerVars: {
          playsinline: 1,
          controls: 1
        },
        events: {
          onStateChange: event => {
            if (event.data === YT.PlayerState.PLAYING) {
              clearInterval(state.timeUpdateInterval);
              state.timeUpdateInterval = setInterval(() => {
                if (player.ytPlayer && player.ytPlayer.getCurrentTime) {
                  document.getElementById('currentTime').textContent = formatTime(player.ytPlayer.getCurrentTime());
                  updateLyricMakerVisualTimeline();
                }
              }, 100);
            }
          }
        }
      });
    };
    const formatTime = seconds => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };
    const searchAZLyrics = () => {
      const songName = song.name ? song.name.replace(/\s+/g, '+') : '';
      const author = song.author ? '+' + song.author.replace(/\s+/g, '+') : '';
      const url = `https://search.azlyrics.com/search.php?q=${songName}${author}&x=acc029721e541ef4da92207eb06ba181719a67575dcaefe50b401ab43356fc32`;
      window.open(url, '_blank');
    };
    const searchLetras = () => {
      const songName = song.name ? song.name.replace(/\s+/g, '%20') : '';
      const author = song.author ? '%20' + song.author.replace(/\s+/g, '%20') : '';
      const url = `https://www.letras.com/?q=${songName}${author}`;
      window.open(url, '_blank');
    };
    const searchGenius = () => {
      const songName = song.name ? song.name.replace(/\s+/g, '%20') : '';
      const author = song.author ? '%20' + song.author.replace(/\s+/g, '%20') : '';
      const url = `https://genius.com/search?q=${songName}${author}`;
      window.open(url, '_blank');
    };
    const searchGoogle = () => {
      const songName = song.name ? song.name.replace(/\s+/g, '%20') : '';
      const author = song.author ? '%20' + song.author.replace(/\s+/g, '%20') : '';
      const url = `https://www.google.com/search?q=${songName}${author}%20lyrics`;
      window.open(url, '_blank');
    };
    const autoFetchGeniusLyrics = async () => {
      const btn = document.getElementById('autoFetchGeniusLyricsBtn');
      const loadingIndicator = document.getElementById('geniusFetchLoading');
      const lyricsInput = document.getElementById('lyricsInput');
      if (!song.name) {
        this.showNotification('This song has no title to search with.', 'error');
        return;
      }
      if (btn) {
        btn.disabled = true;
      }
      if (loadingIndicator) {
        loadingIndicator.style.display = 'flex';
      }
      try {
        const params = new URLSearchParams({
          song: song.name
        });
        if (song.author) {
          params.set('artist', song.author);
        }
        const response = await fetch(`/api/genius?${params.toString()}`);
        const data = await response.json();
        if (!response.ok || !data.lyrics) {
          throw new Error(data.error || 'No lyrics found');
        }
        if (lyricsInput) {
          lyricsInput.value = data.lyrics;
        }
        this.showNotification('Lyrics fetched from Genius!', 'success');
      } catch (error) {
        console.error('Genius auto-fetch failed:', error);
        this.showNotification('Could not auto-fetch lyrics. Try one of the manual search options below.', 'error');
      } finally {
        if (btn) {
          btn.disabled = false;
        }
        if (loadingIndicator) {
          loadingIndicator.style.display = 'none';
        }
      }
    };
    const prepareLyrics = () => {
      const lyricsText = document.getElementById('lyricsInput').value.trim();
      if (!lyricsText) {
        alert('Please enter lyrics');
        return;
      }
      state.lyrics = lyricsText.split('\n').filter(line => line.trim() !== '');
      const progressContainer = document.getElementById('progressContainer');
      progressContainer.innerHTML = '<h3>Progress</h3>';
      state.lyrics.forEach((line, index) => {
        const lineElement = document.createElement('div');
        lineElement.className = 'progress-item';
        lineElement.innerHTML = `\n\t\t\t\t\t\t<span>${index + 1}. ${line}</span>\n\t\t\t\t\t\t<span id="time-${index}">Not timed</span>\n\t\t\t\t\t`;
        progressContainer.appendChild(lineElement);
      });
      state.timings = Array(state.lyrics.length).fill(null);
      state.currentLineIndex = -1;
      updateLyricsDisplay();
      showTab('recordTab');
    };
    const updateLyricsDisplay = () => {
      const prevLineElement = document.getElementById('prevLine');
      const currentLineElement = document.getElementById('currentLine');
      const nextLineElement = document.getElementById('nextLine');
      if (!state.isRecording) {
        currentLineElement.textContent = 'Press "Start Recording" when ready';
        prevLineElement.textContent = '';
        nextLineElement.textContent = '';
        return;
      }
      if (state.currentLineIndex === -1) {
        currentLineElement.textContent = "[Click 'Mark Line' to start the first lyric]";
        prevLineElement.textContent = '';
        nextLineElement.textContent = state.lyrics[0] || '';
      } else if (state.currentLineIndex >= state.lyrics.length) {
        currentLineElement.textContent = 'Recording complete!';
        prevLineElement.textContent = state.lyrics[state.lyrics.length - 1] || '';
        nextLineElement.textContent = '';
      } else {
        currentLineElement.textContent = state.lyrics[state.currentLineIndex];
        if (state.currentLineIndex > 0) {
          prevLineElement.textContent = state.lyrics[state.currentLineIndex - 1];
        } else {
          prevLineElement.textContent = '';
        }
        if (state.currentLineIndex < state.lyrics.length - 1) {
          nextLineElement.textContent = state.lyrics[state.currentLineIndex + 1];
        } else {
          nextLineElement.textContent = '';
        }
      }
    };
    const startRecording = () => {
      if (!player.ytPlayer || !state.lyrics.length) {
        alert('Please load a video and prepare lyrics first');
        return;
      }
      player.ytPlayer.playVideo();
      state.timings = Array(state.lyrics.length).fill(null);
      state.currentLineIndex = -1;
      state.isRecording = true;
      document.getElementById('startRecording').disabled = true;
      document.getElementById('markLine').disabled = false;
      document.getElementById('finishRecording').disabled = false;
      updateLyricsDisplay();
      updateLyricMakerButtonStates();
      renderLyricMakerVisualTimeline();
    };
    const markCurrentLine = () => {
      if (!state.isRecording) {
        return;
      }
      const currentTime = player.ytPlayer.getCurrentTime();
      state.currentLineIndex++;
      if (state.currentLineIndex < state.lyrics.length) {
        let lineToMark = state.currentLineIndex;
        for (let i = 0; i < state.currentLineIndex; i++) {
          if (state.timings[i] !== null && currentTime < state.timings[i]) {
            lineToMark = i;
            break;
          }
        }
        state.timings[lineToMark] = currentTime;
        const timeElement = document.getElementById(`time-${lineToMark}`);
        if (timeElement) {
          timeElement.textContent = formatTime(currentTime);
        }
        const progressItem = timeElement?.parentElement;
        if (progressItem) {
          progressItem.classList.add('lyricmaker-timed');
        }
        updateLyricsDisplay();
        updateLyricMakerButtonStates();
        renderLyricMakerVisualTimeline();
      } else {
        finishRecording();
      }
    };
    const seekVideoToLyricTime = timeInSeconds => {
      if (player.ytPlayer && typeof player.ytPlayer.seekTo === 'function') {
        player.ytPlayer.seekTo(timeInSeconds, true);
      }
    };
    const updateLyricMakerButtonStates = () => {
      const redoBtn = document.getElementById('redoLineBtn');
      const skipBtn = document.getElementById('skipLineBtn');
      if (!state.isRecording) {
        redoBtn.disabled = true;
        skipBtn.disabled = true;
        return;
      }
      redoBtn.disabled = state.currentLineIndex <= 0;
      skipBtn.disabled = state.currentLineIndex >= state.lyrics.length - 1;
    };
    const updateLyricMakerVisualTimeline = () => {
      if (!player.ytPlayer || !player.ytPlayer.getDuration) {
        return;
      }
      const duration = player.ytPlayer.getDuration();
      const currentTime = player.ytPlayer.getCurrentTime();
      if (duration === 0) {
        return;
      }
      const percentage = currentTime / duration * 100;
      const progressFill = document.getElementById('lyricmakerProgressFill');
      if (progressFill) {
        progressFill.style.width = `${percentage}%`;
      }
      const indicator = document.getElementById('lyricmakerProgressIndicator');
      if (indicator) {
        indicator.style.left = `${percentage}%`;
      }
    };
    const renderLyricMakerVisualTimeline = () => {
      const singleLane = document.getElementById('lyricmakerSingleLane');
      const previewArea = document.getElementById('lyricmakerPreviewArea');
      if (!singleLane || !previewArea) {
        return;
      }
      singleLane.innerHTML = '';
      previewArea.innerHTML = '';
      if (!player.ytPlayer || !player.ytPlayer.getDuration) {
        return;
      }
      const duration = player.ytPlayer.getDuration();
      if (duration === 0) {
        return;
      }
      const LAYER_HEIGHT = 16;
      const TOTAL_LAYERS = 15;
      const usedPositions = Array(TOTAL_LAYERS).fill().map(() => []);
      state.timings.forEach((time, index) => {
        if (time === null) {
          return;
        }
        const percentage = time / duration * 100;
        let bestLayer = 0;
        let minConflict = Infinity;
        for (let layer = 0; layer < TOTAL_LAYERS; layer++) {
          let conflict = 0;
          usedPositions[layer].forEach(pos => {
            if (Math.abs(pos - percentage) < 8) {
              conflict++;
            }
          });
          if (conflict < minConflict) {
            minConflict = conflict;
            bestLayer = layer;
          }
        }
        usedPositions[bestLayer].push(percentage);
        const marker = document.createElement('div');
        marker.className = 'lyricmaker-timeline-marker';
        marker.style.left = `${percentage}%`;
        marker.dataset.index = index;
        marker.dataset.time = time;
        marker.dataset.layer = bestLayer;
        singleLane.appendChild(marker);
        const preview = document.createElement('div');
        preview.className = 'lyricmaker-preview-item';
        preview.style.left = `${percentage}%`;
        preview.style.top = `${bestLayer * LAYER_HEIGHT}px`;
        preview.textContent = state.lyrics[index].substring(0, 25);
        preview.title = state.lyrics[index];
        preview.dataset.index = index;
        preview.dataset.layer = bestLayer;
        previewArea.appendChild(preview);
        const connector = document.createElement('div');
        connector.className = 'lyricmaker-connector-line';
        connector.style.left = `${percentage}%`;
        connector.style.top = '30px';
        connector.style.height = `${bestLayer * LAYER_HEIGHT + 4}px`;
        connector.dataset.index = index;
        previewArea.appendChild(connector);
        const setupDragForMarkerGroup = () => {
          let isDragging = false;
          let dragStartX = 0;
          const startDrag = e => {
            isDragging = true;
            dragStartX = e.clientX;
            marker.classList.add('lyricmaker-marker-dragging');
            e.preventDefault();
          };
          const doDrag = e => {
            if (!isDragging) {
              return;
            }
            const timeline = singleLane;
            const rect = timeline.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const newPercentage = Math.max(0, Math.min(100, x / rect.width * 100));
            const newTime = newPercentage / 100 * duration;
            marker.style.left = `${newPercentage}%`;
            preview.style.left = `${newPercentage}%`;
            connector.style.left = `${newPercentage}%`;
            state.timings[index] = newTime;
            const timeElement = document.getElementById(`time-${index}`);
            if (timeElement) {
              timeElement.textContent = formatTime(newTime);
            }
          };
          const stopDrag = () => {
            if (isDragging) {
              isDragging = false;
              marker.classList.remove('lyricmaker-marker-dragging');
            }
          };
          marker.addEventListener('mousedown', startDrag);
          preview.addEventListener('mousedown', startDrag);
          connector.addEventListener('mousedown', startDrag);
          document.addEventListener('mousemove', doDrag);
          document.addEventListener('mouseup', stopDrag);
        };
        setupDragForMarkerGroup();
      });
    };
    const redoCurrentLyricLine = () => {
      if (!state.isRecording || state.currentLineIndex <= 0) {
        return;
      }
      state.currentLineIndex--;
      const previousTimestamp = state.timings[state.currentLineIndex];
      if (previousTimestamp !== null) {
        seekVideoToLyricTime(previousTimestamp);
      }
      updateLyricsDisplay();
      updateLyricMakerButtonStates();
    };
    const setupLyricMakerProgressBarSeek = () => {
      const progressBar = document.getElementById('lyricmakerProgressBarClick');
      if (!progressBar) {
        return;
      }
      progressBar.addEventListener('click', e => {
        if (!player.ytPlayer || !player.ytPlayer.getDuration) {
          return;
        }
        const rect = progressBar.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width * 100;
        const duration = player.ytPlayer.getDuration();
        const seekTime = percentage / 100 * duration;
        seekVideoToLyricTime(seekTime);
      });
    };
    const skipCurrentLyricLine = () => {
      if (!state.isRecording) {
        return;
      }
      if (state.currentLineIndex >= state.lyrics.length - 1) {
        return;
      }
      state.currentLineIndex++;
      updateLyricsDisplay();
      updateLyricMakerButtonStates();
    };
    const finishRecording = () => {
      state.isRecording = false;
      clearInterval(state.timeUpdateInterval);
      document.getElementById('startRecording').disabled = false;
      document.getElementById('markLine').disabled = true;
      document.getElementById('finishRecording').disabled = true;
      updateLyricsDisplay();
      updateLyricMakerButtonStates();
      generateExport();
      showTab('exportTab');
    };
    const generateExport = () => {
      if (!state.lyrics.length || !state.timings.length) {
        alert('No lyrics or timings available');
        return;
      }
      const previewContainer = document.getElementById('previewContainer');
      const exportOutput = document.getElementById('exportOutput');
      previewContainer.innerHTML = '';
      let exportText = '';
      for (let i = 0; i < state.lyrics.length; i++) {
        if (state.timings[i] === null) {
          continue;
        }
        const timeString = formatTime(state.timings[i]);
        const formattedLine = `${state.lyrics[i]} [${timeString}]`;
        const lineElement = document.createElement('div');
        lineElement.className = 'progress-item';
        lineElement.textContent = formattedLine;
        previewContainer.appendChild(lineElement);
        exportText += formattedLine + '\n';
      }
      exportOutput.value = exportText;
    };
    const copyToClipboard = () => {
      const exportOutput = document.getElementById('exportOutput');
      exportOutput.select();
      document.execCommand('copy');
      alert('Copied to clipboard!');
    };
    const saveLyrics = () => {
      const lyricsText = document.getElementById('exportOutput').value;
      if (!lyricsText) {
        alert('No lyrics to save');
        return;
      }
      this.updateSongDetails(song.id, song.name, song.author, song.videoId, lyricsText).then(() => {
        alert('Lyrics saved successfully!');
        closeModal();
        if (document.getElementById('lyrics').classList.contains('active')) {
          this.renderLyricsTab();
        }
      }).catch(error => {
        console.error('Error saving lyrics:', error);
        alert('Failed to save lyrics. Please try again.');
      });
    };
    const handleKeyDown = e => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };
    document.getElementById('prepareLyricsBtn').addEventListener('click', prepareLyrics);
    document.getElementById('nextToRecordBtn').addEventListener('click', () => showTab('recordTab'));
    document.getElementById('startRecording').addEventListener('click', startRecording);
    document.getElementById('markLine').addEventListener('click', markCurrentLine);
    document.getElementById('finishRecording').addEventListener('click', finishRecording);
    document.getElementById('redoLineBtn').addEventListener('click', redoCurrentLyricLine);
    document.getElementById('skipLineBtn').addEventListener('click', skipCurrentLyricLine);
    document.getElementById('copyToClipboardBtn').addEventListener('click', copyToClipboard);
    document.getElementById('saveTranscriptLyricsBtn').addEventListener('click', saveLyrics);
    document.getElementById('azlyricsBtn').addEventListener('click', searchAZLyrics);
    document.getElementById('letrasBtn').addEventListener('click', searchLetras);
    document.getElementById('geniusBtn').addEventListener('click', searchGenius);
    document.getElementById('googleBtn').addEventListener('click', searchGoogle);
    document.getElementById('autoFetchGeniusLyricsBtn')?.addEventListener('click', autoFetchGeniusLyrics);
    document.addEventListener('keydown', handleKeyDown);
    this.lyricMakerCleanup = () => {
      document.getElementById('prepareLyricsBtn').removeEventListener('click', prepareLyrics);
      const nextToRecordBtn = document.getElementById('nextToRecordBtn');
      const recordTabHandler = () => showTab('recordTab');
      nextToRecordBtn.removeEventListener('click', recordTabHandler);
      document.getElementById('startRecording').removeEventListener('click', startRecording);
      document.getElementById('markLine').removeEventListener('click', markCurrentLine);
      document.getElementById('finishRecording').removeEventListener('click', finishRecording);
      document.getElementById('redoLineBtn').removeEventListener('click', redoCurrentLyricLine);
      document.getElementById('skipLineBtn').removeEventListener('click', skipCurrentLyricLine);
      document.getElementById('copyToClipboardBtn').removeEventListener('click', copyToClipboard);
      document.getElementById('saveTranscriptLyricsBtn').removeEventListener('click', saveLyrics);
      document.getElementById('azlyricsBtn').removeEventListener('click', searchAZLyrics);
      document.getElementById('letrasBtn').removeEventListener('click', searchLetras);
      document.getElementById('geniusBtn').removeEventListener('click', searchGenius);
      document.getElementById('googleBtn').removeEventListener('click', searchGoogle);
      document.getElementById('autoFetchGeniusLyricsBtn')?.removeEventListener('click', autoFetchGeniusLyrics);
      document.addEventListener('keydown', handleKeyDown);
      tabHandlers.forEach(({element: element, handler: handler}) => {
        element.removeEventListener('click', handler);
      });
      if (state.timeUpdateInterval) {
        clearInterval(state.timeUpdateInterval);
      }
      if (player.ytPlayer) {
        player.ytPlayer.destroy();
      }
      state.lyrics = [];
      state.timings = [];
      state.currentLineIndex = -1;
      state.isRecording = false;
      document.getElementById('lyricsInput').value = '';
      document.getElementById('exportOutput').value = '';
      document.getElementById('progressContainer').innerHTML = '<h3>Progress</h3>';
      document.getElementById('previewContainer').innerHTML = '';
      document.getElementById('currentTime').textContent = '0:00';
      document.getElementById('prevLine').textContent = '';
      document.getElementById('currentLine').textContent = 'Press "Start Recording" when ready';
      document.getElementById('nextLine').textContent = '';
      document.getElementById('startRecording').disabled = false;
      document.getElementById('markLine').disabled = true;
      document.getElementById('finishRecording').disabled = true;
      document.getElementById('redoLineBtn').disabled = true;
      document.getElementById('skipLineBtn').disabled = true;
      showTab('setupTab');
    };
    setTimeout(() => loadVideo(), 100);
    setupLyricMakerProgressBarSeek();
  }
  initializeFullscreenLyrics() {
    this.elements.lyricsFullscreenModal = document.getElementById('lyricsFullscreenModal');
    this.elements.fullscreenSongName = document.getElementById('fullscreenSongName');
    this.elements.fullscreenSongAuthor = document.getElementById('fullscreenSongAuthor');
    this.elements.fullscreenLyricsDisplay = document.getElementById('fullscreenLyricsDisplay');
    this.elements.exitFullscreenBtn = document.getElementById('exitFullscreenBtn');
    this.elements.exitFullscreenBtn.addEventListener('click', () => this.exitLyricsFullscreen());
  }
  enterLyricsFullscreen() {
    if (!this.elements.lyricsFullscreenModal) {
      this.initializeFullscreenLyrics();
    }
    this.isLyricsFullscreen = true;
    this.elements.lyricsFullscreenModal.classList.add('active');
    const currentSong = this.currentPlaylist ? this.currentPlaylist.songs[this.currentSongIndex] : this.songLibrary[this.currentSongIndex];
    if (currentSong) {
      this.elements.fullscreenSongName.textContent = currentSong.name;
      this.elements.fullscreenSongAuthor.textContent = currentSong.author || 'Unknown Artist';
    }
    this.renderFullscreenLyrics();
    this.hideMainUIForLyrics();
  }
  exitLyricsFullscreen() {
    this.isLyricsFullscreen = false;
    this.elements.lyricsFullscreenModal.classList.remove('active');
    if (this.fullscreenLyricsInterval) {
      clearInterval(this.fullscreenLyricsInterval);
      this.fullscreenLyricsInterval = null;
    }
    this.currentFullscreenHighlightedLyricIndex = -1;
    this.showMainUIFromLyrics();
    if (this.isPlaying && document.getElementById('lyrics') && document.getElementById('lyrics').classList.contains('active')) {
      this.renderLyricsTab();
    }
  }
  hideMainUIForLyrics() {
    document.querySelector('.main-container').style.display = 'none';
    document.querySelector('.theme-toggle').style.display = 'none';
    document.querySelector('.listening-stats').style.display = 'none';
    document.querySelector('.control-bar-toggle').style.display = 'none';
    document.querySelector('.layout-toggle').style.display = 'none';
    document.querySelector('.watermark').style.display = 'none';
  }
  showMainUIFromLyrics() {
    document.querySelector('.main-container').style.display = 'flex';
    document.querySelector('.theme-toggle').style.display = 'flex';
    document.querySelector('.listening-stats').style.display = 'flex';
    document.querySelector('.control-bar-toggle').style.display = 'block';
    document.querySelector('.layout-toggle').style.display = 'block';
    document.querySelector('.watermark').style.display = 'block';
  }
  renderFullscreenLyrics() {
    if (!this.elements.fullscreenLyricsDisplay) {
      return;
    }
    const currentSong = this.currentPlaylist ? this.currentPlaylist.songs[this.currentSongIndex] : this.songLibrary[this.currentSongIndex];
    if (!currentSong) {
      return;
    }
    let songWithLyrics = currentSong;
    if (this.currentPlaylist) {
      const libraryMatch = this.songLibrary.find(libSong => libSong.videoId === currentSong.videoId);
      if (libraryMatch && libraryMatch.lyrics) {
        songWithLyrics = libraryMatch;
      }
    }
    if (!songWithLyrics.lyrics || songWithLyrics.lyrics.trim() === '') {
      this.elements.fullscreenLyricsDisplay.innerHTML = '<div class="no-lyrics-message">No lyrics available</div>';
      return;
    }
    this.elements.fullscreenLyricsDisplay.innerHTML = '';
    const lyricsArray = [];
    const timingsArray = [];
    let hasTimestamps = false;
    const lines = songWithLyrics.lyrics.split('\n').filter(line => line.trim() !== '');
    for (const line of lines) {
      if (line.match(/.*\s*\[(\d+):(\d+)\]/)) {
        hasTimestamps = true;
        break;
      }
    }
    for (const line of lines) {
      if (hasTimestamps) {
        const match = line.match(/(.*)\s*\[(\d+):(\d+)\]/);
        if (match) {
          const lyric = match[1].trim();
          const minutes = parseInt(match[2]);
          const seconds = parseInt(match[3]);
          const timeInSeconds = minutes * 60 + seconds;
          lyricsArray.push(lyric);
          timingsArray.push(timeInSeconds);
        }
      } else {
        lyricsArray.push(line.trim());
      }
    }
    for (let i = 0; i < lyricsArray.length; i++) {
      const lineElement = document.createElement('div');
      lineElement.classList.add('lyric-line');
      lineElement.textContent = lyricsArray[i];
      lineElement.id = `fullscreen-lyric-${i}`;
      lineElement.style.padding = '8px 10px';
      lineElement.style.margin = '5px 0';
      lineElement.style.borderRadius = '3px';
      lineElement.style.transition = 'all 0.3s ease';
      lineElement.style.color = 'var(--text-secondary)';
      this.elements.fullscreenLyricsDisplay.appendChild(lineElement);
    }
    if (this.fullscreenLyricsInterval) {
      clearInterval(this.fullscreenLyricsInterval);
      this.fullscreenLyricsInterval = null;
    }
    this.currentFullscreenHighlightedLyricIndex = -1;
    if (hasTimestamps && this.ytPlayer && this.isPlaying && this.ytPlayer.getCurrentTime) {
      this.fullscreenLyricsInterval = setInterval(() => {
        if (this.ytPlayer && this.ytPlayer.getCurrentTime && this.isPlaying && this.isLyricsFullscreen) {
          try {
            const currentTime = this.ytPlayer.getCurrentTime();
            this.updateFullscreenHighlightedLyric(currentTime, lyricsArray, timingsArray);
          } catch (error) {
            console.warn('Error updating fullscreen lyrics:', error);
          }
        }
      }, 100);
    }
  }
  updateFullscreenHighlightedLyric(currentTime, lyrics, timings) {
    if (!lyrics.length || !timings.length || timings.length !== lyrics.length) {
      return;
    }
    let highlightIndex = -1;
    for (let i = 0; i < timings.length; i++) {
      if (currentTime >= timings[i]) {
        if (i === timings.length - 1 || currentTime < timings[i + 1]) {
          highlightIndex = i;
        }
      }
    }
    if (highlightIndex !== this.currentFullscreenHighlightedLyricIndex) {
      const allLines = this.elements.fullscreenLyricsDisplay.querySelectorAll('.lyric-line');
      allLines.forEach(line => {
        line.classList.remove('active');
        line.style.backgroundColor = '';
        line.style.color = 'var(--text-secondary)';
        line.style.fontWeight = 'normal';
        line.style.fontSize = '';
        line.style.transform = '';
      });
      if (highlightIndex !== -1) {
        const currentElement = document.getElementById(`fullscreen-lyric-${highlightIndex}`);
        if (currentElement) {
          currentElement.classList.add('active');
          currentElement.style.backgroundColor = 'var(--accent-color)';
          currentElement.style.color = 'var(--text-primary)';
          currentElement.style.fontWeight = 'bold';
          currentElement.style.fontSize = '1.1em';
          currentElement.style.transform = 'scale(1.02)';
          currentElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }
      this.currentFullscreenHighlightedLyricIndex = highlightIndex;
    }
  }
  openImportSubtitlesModal(songId) {
    const song = this.songLibrary.find(s => s.id === songId);
    if (!song) {
      return;
    }
    this.currentSongForSubtitlesImport = song;
    const modalTitle = document.getElementById('subtitlesImportModalTitle');
    modalTitle.textContent = `Import Subtitles for: ${song.name}`;
    this.resetSubtitlesImportForm();
    const modal = document.getElementById('subtitlesImportModal');
    modal.style.display = 'flex';
    setTimeout(() => {
      modal.classList.add('subtitles-import-modal-show');
    }, 10);
    this.setupSubtitlesImportEventListeners();
  }
  setupSubtitlesImportEventListeners() {
    if (this.subtitlesModalListenersSetup) {
      return;
    }
    this.subtitlesModalListenersSetup = true;
    const modal = document.getElementById('subtitlesImportModal');
    const closeBtn = document.querySelector('.subtitles-import-modal-close');
    const autoFetchBtn = document.getElementById('autoFetchTranscriptBtn');
    const openYouTubeBtn = document.getElementById('openYouTubeBtn');
    const convertBtn = document.getElementById('convertBtn');
    const saveLyricsBtn = document.getElementById('saveLyricsBtn');
    const cancelImportBtn = document.getElementById('cancelImportBtn');
    closeBtn.addEventListener('click', () => this.closeSubtitlesImportModal());
    cancelImportBtn.addEventListener('click', () => this.closeSubtitlesImportModal());
    modal.addEventListener('click', e => {
      if (e.target === modal) {
        this.closeSubtitlesImportModal();
      }
    });
    autoFetchBtn.addEventListener('click', () => this.autoFetchTranscript());
    openYouTubeBtn.addEventListener('click', () => {
      if (this.currentSongForSubtitlesImport) {
        window.open(`https://www.youtube.com/watch?v=${this.currentSongForSubtitlesImport.videoId}`, '_blank');
      }
    });
    convertBtn.addEventListener('click', () => this.convertTranscriptToLyricsHandler());
    saveLyricsBtn.addEventListener('click', () => this.saveLyricsFromModal());
  }
  closeSubtitlesImportModal() {
    const modal = document.getElementById('subtitlesImportModal');
    modal.classList.remove('subtitles-import-modal-show');
    setTimeout(() => {
      modal.style.display = 'none';
      this.currentSongForSubtitlesImport = null;
    }, 300);
  }
  resetSubtitlesImportForm() {
    document.getElementById('transcriptInput').value = '';
    document.getElementById('lyricsPreview').value = '';
    document.getElementById('lyricsPreviewSection').style.display = 'none';
    document.getElementById('loadingIndicator').style.display = 'none';
  }
  convertTranscriptToLyricsHandler() {
    const transcriptInput = document.getElementById('transcriptInput');
    const lyricsPreview = document.getElementById('lyricsPreview');
    const previewSection = document.getElementById('lyricsPreviewSection');
    const transcriptText = transcriptInput.value.trim();
    if (!transcriptText) {
      this.showNotification('Please paste a transcript first', 'error');
      return;
    }
    const convertedLyrics = this.convertTranscriptToLyrics(transcriptText);
    if (convertedLyrics) {
      lyricsPreview.value = convertedLyrics;
      previewSection.style.display = 'block';
      setTimeout(() => {
        lyricsPreview.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 100);
      this.showNotification('Transcript converted successfully!', 'success');
    } else {
      this.showNotification('Could not convert transcript. Please check the format.', 'error');
    }
  }
  async saveLyricsFromModal() {
    const lyricsPreview = document.getElementById('lyricsPreview');
    const lyricsText = lyricsPreview.value.trim();
    if (!lyricsText) {
      this.showNotification('No lyrics to save', 'error');
      return;
    }
    if (!this.currentSongForSubtitlesImport) {
      this.showNotification('No song selected', 'error');
      return;
    }
    try {
      await this.updateSongDetails(this.currentSongForSubtitlesImport.id, this.currentSongForSubtitlesImport.name, this.currentSongForSubtitlesImport.author, this.currentSongForSubtitlesImport.videoId, lyricsText);
      this.showNotification('Lyrics saved successfully!', 'success');
      this.closeSubtitlesImportModal();
      if (document.getElementById('lyrics')?.classList.contains('active')) {
        this.renderLyricsTab();
      }
    } catch (error) {
      console.error('Error saving lyrics:', error);
      this.showNotification('Failed to save lyrics. Please try again.', 'error');
    }
  }
  convertTranscriptToLyrics(transcript) {
    try {
      const lines = transcript.split('\n');
      const lyrics = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) {
          continue;
        }
        const timestampMatch = line.match(/^(\*\*)?(\d+):(\d+)(\*\*)?$/) || line.match(/^(\d+):(\d+)$/);
        if (timestampMatch) {
          const minutes = parseInt(timestampMatch[2] || timestampMatch[1]);
          const seconds = parseInt(timestampMatch[3] || timestampMatch[2]);
          const lyricLines = [];
          let j = i + 1;
          while (j < lines.length) {
            const nextLine = lines[j].trim();
            if (nextLine.match(/^(\*\*)?(\d+):(\d+)(\*\*)?$/) || nextLine.match(/^(\d+):(\d+)$/)) {
              break;
            }
            if (!nextLine) {
              j++;
              continue;
            }
            if (nextLine.match(/^\[[^\]]+\]$/)) {
              j++;
              continue;
            }
            let lyricContent = '';
            if (nextLine.startsWith('♪') && nextLine.endsWith('♪')) {
              lyricContent = nextLine.slice(1, -1).trim();
            } else if (nextLine.match(/^\([^)]+\)$/) || nextLine.match(/^\*\*[^*]+\*\*$/)) {
              j++;
              continue;
            } else if (nextLine.startsWith('♪')) {
              lyricContent = nextLine.slice(1).replace(/♪$/, '').trim();
            } else {
              lyricContent = nextLine;
            }
            if (lyricContent) {
              lyricContent = lyricContent.replace(/\[[^\]]+\]/g, '').trim();
              if (lyricContent) {
                lyricContent = this.formatLyricText(lyricContent);
                lyricLines.push(lyricContent);
              }
            }
            j++;
          }
          if (lyricLines.length > 0) {
            const combinedLyrics = lyricLines.join(' ');
            lyrics.push(`${combinedLyrics} [${minutes}:${seconds.toString().padStart(2, '0')}]`);
          }
          i = j - 1;
        }
      }
      return lyrics.join('\n');
    } catch (error) {
      console.error('Error converting transcript:', error);
      return null;
    }
  }
  async autoFetchTranscript() {
    if (!this.currentSongForSubtitlesImport) {
      return;
    }
    const loadingIndicator = document.getElementById('loadingIndicator');
    const autoFetchBtn = document.getElementById('autoFetchTranscriptBtn');
    const transcriptInput = document.getElementById('transcriptInput');
    const langSelect = document.getElementById('transcriptLangSelect');
    const selectedLang = langSelect?.value || 'auto';
    console.log('autoFetchTranscript called with lang:', selectedLang);
    try {
      loadingIndicator.style.display = 'flex';
      autoFetchBtn.disabled = true;
      autoFetchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Fetching...';
      const videoUrl = `https://www.youtube.com/watch?v=${this.currentSongForSubtitlesImport.videoId}`;
      const apiUrl = selectedLang === 'auto' ? `https://api.supadata.ai/v1/youtube/transcript?url=${encodeURIComponent(videoUrl)}&text=false` : `https://api.supadata.ai/v1/youtube/transcript?url=${encodeURIComponent(videoUrl)}&text=false&lang=${selectedLang}`;
      console.log('Fetching:', apiUrl);
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'x-api-key': this.supadataApiKey,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Supadata response lang:', data.lang, 'availableLangs:', data.availableLangs);
      if (data.availableLangs && data.availableLangs.length > 0) {
        this.populateTranscriptLangDropdown(data.availableLangs, data.lang);
      }
      let transcriptText = '';
      if (data.content) {
        if (Array.isArray(data.content)) {
          transcriptText = this.formatSupadataTranscriptForConversion(data.content);
        } else if (typeof data.content === 'string') {
          transcriptText = this.addTimestampsToPlainText(data.content);
        } else {
          throw new Error('Unexpected transcript format');
        }
        if (!transcriptText.trim()) {
          throw new Error('Empty transcript received');
        }
        transcriptInput.value = transcriptText;
        this.showNotification(`Transcript fetched! (${data.lang})`, 'success');
        setTimeout(() => {
          this.convertTranscriptToLyricsHandler();
        }, 500);
      } else {
        throw new Error('No transcript content received');
      }
    } catch (error) {
      console.error('Error fetching transcript:', error);
      let errorMessage = 'Failed to fetch transcript. ';
      if (error.message.includes('401')) {
        errorMessage += 'Invalid API key.';
      } else if (error.message.includes('404')) {
        errorMessage += 'Video not found or no transcript available.';
      } else if (error.message.includes('429')) {
        errorMessage += 'Rate limit exceeded. Please try again later.';
      } else {
        errorMessage += 'This probably means this song does not have transcripts.';
      }
      this.showNotification(errorMessage, 'error');
    } finally {
      loadingIndicator.style.display = 'none';
      autoFetchBtn.disabled = false;
      autoFetchBtn.innerHTML = '<i class="fas fa-magic"></i> Auto-Fetch Transcript';
    }
  }
  populateTranscriptLangDropdown(langs, currentLang) {
    console.log('populateTranscriptLangDropdown called', langs, currentLang);
    const langSelect = document.getElementById('transcriptLangSelect');
    const switchBtn = document.getElementById('switchLangBtn');
    if (!langSelect) {
      return;
    }
    const langNames = {
      en: 'English',
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      pt: 'Portuguese',
      it: 'Italian',
      ja: 'Japanese',
      ko: 'Korean',
      zh: 'Chinese',
      ar: 'Arabic',
      hi: 'Hindi',
      ru: 'Russian',
      tr: 'Turkish',
      nl: 'Dutch',
      pl: 'Polish',
      sv: 'Swedish',
      da: 'Danish',
      fi: 'Finnish',
      no: 'Norwegian',
      id: 'Indonesian',
      th: 'Thai',
      vi: 'Vietnamese',
      uk: 'Ukrainian',
      cs: 'Czech',
      ro: 'Romanian',
      hu: 'Hungarian',
      el: 'Greek'
    };
    const newSelect = langSelect.cloneNode(false);
    langSelect.parentNode.replaceChild(newSelect, langSelect);
    newSelect.innerHTML = '';
    langs.forEach(code => {
      const option = document.createElement('option');
      option.value = code;
      option.textContent = langNames[code] || code.toUpperCase();
      if (code === currentLang) {
        option.selected = true;
      }
      newSelect.appendChild(option);
    });
    newSelect.addEventListener('change', e => {
      console.log('Language changed to:', e.target.value);
      this.autoFetchTranscript();
    });
    if (switchBtn) {
      if (langs.length > 1) {
        switchBtn.style.display = 'flex';
        const newBtn = switchBtn.cloneNode(true);
        switchBtn.parentNode.replaceChild(newBtn, switchBtn);
        newBtn.addEventListener('click', () => {
          newSelect.focus();
          newSelect.size = newSelect.options.length;
          newSelect.addEventListener('blur', () => {
            newSelect.size = 1;
          }, {
            once: true
          });
        });
      } else {
        switchBtn.style.display = 'none';
      }
    }
  }
  addTimestampsToPlainText(plainText) {
    try {
      const lines = plainText.split('\n').filter(line => line.trim());
      const formattedLines = [];
      let currentTime = 0;
      const secondsPerLine = 3.5;
      for (const line of lines) {
        if (line.trim()) {
          const minutes = Math.floor(currentTime / 60);
          const seconds = Math.floor(currentTime % 60);
          formattedLines.push(`${minutes}:${seconds.toString().padStart(2, '0')}`);
          formattedLines.push(line.trim());
          formattedLines.push('');
          const wordCount = line.split(' ').length;
          currentTime += Math.max(secondsPerLine, wordCount * 0.5);
        }
      }
      return formattedLines.join('\n');
    } catch (error) {
      console.error('Error adding timestamps to plain text:', error);
      return plainText;
    }
  }
  formatSupadataTranscriptForConversion(transcriptArray) {
    try {
      const formattedLines = [];
      for (const segment of transcriptArray) {
        if (segment.offset !== undefined && segment.text) {
          const totalSeconds = Math.floor(segment.offset / 1e3);
          const minutes = Math.floor(totalSeconds / 60);
          const seconds = totalSeconds % 60;
          formattedLines.push(`${minutes}:${seconds.toString().padStart(2, '0')}`);
          formattedLines.push(segment.text.trim());
          formattedLines.push('');
        }
      }
      return formattedLines.join('\n');
    } catch (error) {
      console.error('Error formatting Supadata transcript:', error);
      return '';
    }
  }
  formatLyricText(text) {
    text = text.replace(/♪/g, '').trim();
    text = text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    text = text.toLowerCase();
    text = text.charAt(0).toUpperCase() + text.slice(1);
    text = text.replace(/\bi\b/g, 'I');
    text = text.replace(/([.!?]\s+)([a-z])/g, (match, punctuation, letter) => punctuation + letter.toUpperCase());
    return text;
  }
  isMobileConnection() {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      return [ 'slow-2g', '2g', '3g' ].includes(connection.effectiveType) || connection.saveData === true;
    }
    return window.innerWidth <= 768;
  }
  toggleVideoFullscreen() {
    this.isVideoFullscreen = !this.isVideoFullscreen;
    if (this.isVideoFullscreen) {
      this.showVideoFullscreen();
    } else {
      this.hideVideoFullscreen();
    }
  }
  showVideoFullscreen() {
    const isCurrentlyPlaying = this.ytPlayer.getPlayerState() === YT.PlayerState.PLAYING;
    const currentTime = this.ytPlayer.getCurrentTime();
    document.querySelector('.main-container').style.display = 'none';
    document.querySelector('.theme-toggle').style.display = 'none';
    document.querySelector('.listening-stats').style.display = 'none';
    document.querySelector('.control-bar-toggle').style.display = 'none';
    document.querySelector('.layout-toggle').style.display = 'none';
    document.querySelector('.watermark').style.display = 'none';
    const ytPlayerEl = document.getElementById('ytPlayer');
    ytPlayerEl.classList.add('fullscreen-video');
    this.ytPlayer.setSize(window.innerWidth, window.innerHeight - 120);
    if (this.isMobileConnection()) {
      this.ytPlayer.setPlaybackQuality('small');
    }
    if (isCurrentlyPlaying) {
      setTimeout(() => {
        this.ytPlayer.seekTo(currentTime, true);
        this.ytPlayer.playVideo();
      }, 100);
    }
    this.showVideoHint();
  }
  hideVideoFullscreen() {
    const isCurrentlyPlaying = this.ytPlayer.getPlayerState() === YT.PlayerState.PLAYING;
    const currentTime = this.ytPlayer.getCurrentTime();
    document.querySelector('.main-container').style.display = 'flex';
    document.querySelector('.theme-toggle').style.display = 'flex';
    document.querySelector('.listening-stats').style.display = 'flex';
    document.querySelector('.control-bar-toggle').style.display = 'block';
    document.querySelector('.layout-toggle').style.display = 'block';
    document.querySelector('.watermark').style.display = 'block';
    const ytPlayerEl = document.getElementById('ytPlayer');
    ytPlayerEl.classList.remove('fullscreen-video');
    this.ytPlayer.setSize(1, 1);
    if (this.isMobileConnection()) {
      this.ytPlayer.setPlaybackQuality('small');
    }
    if (isCurrentlyPlaying) {
      setTimeout(() => {
        this.ytPlayer.seekTo(currentTime, true);
        this.ytPlayer.playVideo();
      }, 100);
    }
    this.hideVideoHint();
  }
  showVideoHint() {
    let hintEl = document.getElementById('videoHint');
    if (!hintEl) {
      hintEl = document.createElement('div');
      hintEl.id = 'videoHint';
      hintEl.className = 'video-hint';
      hintEl.innerHTML = '<i class="fas fa-keyboard"></i> Press U to exit video mode';
      document.body.appendChild(hintEl);
    }
    hintEl.style.display = 'block';
    setTimeout(() => {
      if (hintEl) {
        hintEl.style.opacity = '0';
        setTimeout(() => {
          if (hintEl && this.isVideoFullscreen) {
            hintEl.style.display = 'none';
          }
        }, 300);
      }
    }, 3e3);
  }
  hideVideoHint() {
    const hintEl = document.getElementById('videoHint');
    if (hintEl) {
      hintEl.style.display = 'none';
    }
  }
  saveQueue() {
    try {
      sessionStorage.setItem('musicPlayerQueue', JSON.stringify(this.songQueue));
    } catch (error) {}
  }
  loadQueue() {
    try {
      const raw = sessionStorage.getItem('musicPlayerQueue');
      this.songQueue = raw ? JSON.parse(raw) : [];
    } catch (error) {
      this.songQueue = [];
    }
    this.updateQueueVisualIndicators();
  }
  addToQueue(song, repeat = 1) {
    const last = this.songQueue[this.songQueue.length - 1];
    if (last && last.type === 'song' && last.videoId === song.videoId && last.repeat !== -1 && repeat !== -1) {
      last.repeat = Math.min(99, last.repeat + repeat);
      this.saveQueue();
      this.updateQueueVisualIndicators();
      this.updatePlayerUI();
      const label = ` (×${last.repeat} total)`;
      this.showQueueNotification(`Updated "${song.name}"${label}`);
      this._queueRefreshPanel();
      return;
    }
    this.songQueue.push({
      ...song,
      type: 'song',
      repeat: repeat === -1 ? -1 : Math.max(1, repeat),
      queueId: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
    });
    if (repeat === -1) {
      this.showQueueNotification(`Added "${song.name}" (∞ loop on)`);
    } else {
      const label = repeat > 1 ? ` (×${repeat})` : '';
      this.showQueueNotification(`Added "${song.name}"${label}`);
    }
    this.saveQueue();
    this.updateQueueVisualIndicators();
    this.updatePlayerUI();
    this._queueRefreshPanel();
  }
  addStopBlock() {
    this.songQueue.push({
      type: 'stop',
      name: '— Stop —',
      queueId: `stop_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
    });
    this.saveQueue();
    this.updateQueueVisualIndicators();
    this.updatePlayerUI();
    this.showQueueNotification('Stop block added');
    this._queueRefreshPanel();
  }
  addLoopBlock() {
    this.songQueue.push({
      type: 'loop',
      name: '— Loop Forever —',
      queueId: `loop_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
    });
    this.saveQueue();
    this.updateQueueVisualIndicators();
    this.updatePlayerUI();
    this.showQueueNotification('Loop previous song forever block added');
    this._queueRefreshPanel();
  }
  removeFromQueue(queueId) {
    const idx = this.songQueue.findIndex(b => b.queueId === queueId);
    if (idx === -1) {
      return;
    }
    const name = this.songQueue[idx].name;
    this.songQueue.splice(idx, 1);
    this.saveQueue();
    this.updateQueueVisualIndicators();
    this.updatePlayerUI();
    this.showQueueNotification(`Removed "${name}"`);
    this._queueRefreshPanel();
  }
  clearQueue() {
    this.songQueue = [];
    this.saveQueue();
    this.updateQueueVisualIndicators();
    this.updatePlayerUI();
    this.showQueueNotification('Queue cleared');
    this._queueRefreshPanel();
  }
  shuffleQueue() {
    const stops = [], songs = [];
    this.songQueue.forEach((b, i) => {
      if (b.type === 'stop') {
        stops.push({
          block: b,
          originalIdx: i
        });
      } else {
        songs.push(b);
      }
    });
    for (let i = songs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [songs[i], songs[j]] = [ songs[j], songs[i] ];
    }
    const result = [ ...songs ];
    stops.forEach(({block: block, originalIdx: originalIdx}) => {
      result.splice(Math.min(originalIdx, result.length), 0, block);
    });
    this.songQueue = result;
    this.saveQueue();
    this.updateQueueVisualIndicators();
    this.updatePlayerUI();
    this.showQueueNotification('Queue shuffled');
    this._queueRefreshPanel();
  }
  duplicateQueueBlock(queueId) {
    const idx = this.songQueue.findIndex(b => b.queueId === queueId);
    if (idx === -1) {
      return;
    }
    const orig = this.songQueue[idx];
    const dupe = {
      ...orig,
      queueId: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
    };
    this.songQueue.splice(idx + 1, 0, dupe);
    this.saveQueue();
    this.updateQueueVisualIndicators();
    this.updatePlayerUI();
    this.showQueueNotification(`Duplicated "${orig.name}"`);
    this._queueRefreshPanel();
  }
  _debouncedSaveQueue() {
    clearTimeout(this._saveQueueTimer);
    this._saveQueueTimer = setTimeout(() => this.saveQueue(), 300);
  }
  _consumeQueueHead() {
    if (!this.songQueue.length) {
      return false;
    }
    const block = this.songQueue[0];
    if (block.type === 'stop') {
      this.songQueue.shift();
      this._debouncedSaveQueue();
      this.isAutoplayEnabled = false;
      this.saveSetting('autoplay', false);
      if (this.elements.autoplayBtn) {
        this.elements.autoplayBtn.classList.remove('active');
      }
      if (this.ytPlayer) {
        this.ytPlayer.stopVideo();
      }
      this.isPlaying = false;
      this.updatePlayerUI();
      this.updateQueueVisualIndicators();
      this._queueRefreshPanel();
      return true;
    }
    if (block.type === 'loop') {
      this.songQueue.shift();
      this._debouncedSaveQueue();
      this.isLooping = true;
      this.elements.loopBtn?.classList.add('active');
      this.saveSetting('isLooping', true);
      this.updateQueueVisualIndicators();
      this._queueRefreshPanel();
      this.updatePlayerUI();
      return true;
    }
    if (block.type === 'song') {
      if (block.repeat === -1) {
        this.isLooping = true;
        this.elements.loopBtn?.classList.add('active');
        this.saveSetting('isLooping', true);
        this.songQueue.shift();
      } else {
        block.repeat -= 1;
        if (block.repeat <= 0) {
          this.songQueue.shift();
        }
      }
      this._debouncedSaveQueue();
      this.updateQueueVisualIndicators();
      this._queueRefreshPanel();
      const songInLibrary = this.songLibrary.find(s => s.videoId === block.videoId);
      if (songInLibrary) {
        this.currentSongIndex = this.songLibrary.findIndex(s => s.id === songInLibrary.id);
      }
      this.currentPlaylist = null;
      this.currentSong = block;
      this.saveRecentlyPlayedSong(block);
      this.playSongById(block.videoId);
      this.updatePlayerUI();
      this.updateCurrentSongDisplay();
      this._discordScheduleSend();
      return true;
    }
    return false;
  }
  reorderQueue(fromIdx, toIdx) {
    if (fromIdx === toIdx) {
      return;
    }
    const [moved] = this.songQueue.splice(fromIdx, 1);
    this.songQueue.splice(toIdx, 0, moved);
    this.saveQueue();
    this.updateQueueVisualIndicators();
    this.updatePlayerUI();
  }
  updateQueueVisualIndicators() {
    document.querySelectorAll('.queue-indicator').forEach(el => el.remove());
    const seen = new Map();
    let pos = 0;
    this.songQueue.forEach(block => {
      if (block.type === 'stop') {
        return;
      }
      if (!seen.has(block.videoId)) {
        seen.set(block.videoId, ++pos);
      }
    });
    seen.forEach((position, videoId) => {
      const songElements = [ ...document.querySelectorAll(`[data-video-id="${videoId}"]`), ...document.querySelectorAll(`[onclick*="'${videoId}'"]`) ];
      songElements.forEach(element => {
        if (element.querySelector('.queue-indicator')) {
          return;
        }
        const indicator = document.createElement('span');
        indicator.className = 'queue-indicator';
        indicator.textContent = position;
        indicator.style.cssText = `position:absolute;top:2px;right:2px;background:var(--accent-color);color:#fff;border-radius:50%;width:18px;height:18px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;z-index:10;pointer-events:none;`;
        element.style.position = 'relative';
        element.appendChild(indicator);
      });
    });
  }
  showQueueNotification(message) {
    const existing = document.querySelector('.queue-notification');
    if (existing) {
      existing.remove();
    }
    const n = document.createElement('div');
    n.className = 'queue-notification';
    n.textContent = message;
    document.body.appendChild(n);
    requestAnimationFrame(() => n.classList.add('queue-notification--in'));
    const hide = () => {
      n.classList.remove('queue-notification--in');
      n.addEventListener('transitionend', () => n.remove(), {
        once: true
      });
    };
    this._queueNotifTimer = setTimeout(hide, 2200);
  }
  _queueRefreshPanel() {
    const panel = document.getElementById('qv2-panel');
    if (!panel) {
      return;
    }
    this._queueRenderRows();
  }
  _queueBuildOverlay() {
    const backdrop = document.createElement('div');
    backdrop.id = 'qv2-backdrop';
    backdrop.className = 'qv2-backdrop';
    const panel = document.createElement('div');
    panel.id = 'qv2-panel';
    panel.className = 'qv2-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Song Queue');
    panel.innerHTML = `\n\t        <div class="qv2-header">\n\t            <div class="qv2-title">\n\t                <span class="qv2-title-icon"><i class="fas fa-list-ol" aria-hidden="true"></i></span>\n\t                <span>Queue</span>\n\t                <span class="qv2-count" id="qv2-count">${this.songQueue.length}</span>\n\t            </div>\n\t            <div class="qv2-header-actions">\n\t                <button class="qv2-btn-ghost" id="qv2-shuffle" title="Shuffle">\n\t                    <i class="fas fa-random" aria-hidden="true"></i>\n\t                </button>\n\t                <button class="qv2-btn-ghost" id="qv2-add-stop" title="Add stop block">\n\t                    <i class="fas fa-stop-circle" aria-hidden="true"></i>\n\t                </button>\n\t\t\t\t\t<button class="qv2-btn-ghost" id="qv2-add-loop" title="Add loop-forever block">\n\t\t\t\t\t    <i class="fas fa-infinity" aria-hidden="true"></i>\n\t\t\t\t\t</button>\n\t                <button class="qv2-btn-ghost" id="qv2-clear" title="Clear all">\n\t                    <i class="fas fa-trash-alt" aria-hidden="true"></i>\n\t                </button>\n\t                <button class="qv2-btn-ghost qv2-close" id="qv2-close" aria-label="Close queue">\n\t                    <i class="fas fa-times" aria-hidden="true"></i>\n\t                </button>\n\t            </div>\n\t        </div>\n\t\n\t        <div class="qv2-add-section">\n\t            <div class="qv2-search-wrap">\n\t                <i class="fas fa-search qv2-search-icon" aria-hidden="true"></i>\n\t                <input\n\t                    id="qv2-search-input"\n\t                    class="qv2-search-input"\n\t                    type="text"\n\t                    placeholder="Add song to queue…"\n\t                    autocomplete="off"\n\t                    spellcheck="false"\n\t                />\n\t            </div>\n\t            <div class="qv2-dropdown" id="qv2-dropdown" hidden></div>\n\t        </div>\n\t\n\t        <div class="qv2-rows" id="qv2-rows" role="list"></div>\n\t\n\t        <div class="qv2-empty" id="qv2-empty" hidden>\n\t            <i class="fas fa-music" aria-hidden="true"></i>\n\t            <p>Queue is empty</p>\n\t            <small>Search above to add songs</small>\n\t        </div>\n\t    `;
    backdrop.appendChild(panel);
    document.body.appendChild(backdrop);
    this._queueRenderRows();
    this._queueBindSearch(document.getElementById('qv2-search-input'), document.getElementById('qv2-dropdown'));
    document.getElementById('qv2-shuffle').addEventListener('click', () => this.shuffleQueue());
    document.getElementById('qv2-add-stop').addEventListener('click', () => this.addStopBlock());
    document.getElementById('qv2-add-loop').addEventListener('click', () => this.addLoopBlock());
    document.getElementById('qv2-clear').addEventListener('click', () => {
      if (!this.songQueue.length) {
        return;
      }
      this.clearQueue();
    });
    document.getElementById('qv2-close').addEventListener('click', () => backdrop.remove());
    backdrop.addEventListener('click', e => {
      if (e.target === backdrop) {
        backdrop.remove();
      }
    });
    const onKey = e => {
      if (e.key === 'Escape') {
        backdrop.remove();
        document.removeEventListener('keydown', onKey);
      }
    };
    document.addEventListener('keydown', onKey);
    backdrop.addEventListener('remove', () => document.removeEventListener('keydown', onKey), {
      once: true
    });
    requestAnimationFrame(() => backdrop.classList.add('qv2-backdrop--in'));
  }
  showQueueOverlay() {
    const existing = document.getElementById('qv2-backdrop');
    if (existing) {
      existing.remove();
      return;
    }
    this._queueBuildOverlay();
  }
  _queueRenderRows() {
    const container = document.getElementById('qv2-rows');
    const emptyEl = document.getElementById('qv2-empty');
    const countEl = document.getElementById('qv2-count');
    if (!container) {
      return;
    }
    if (countEl) {
      countEl.textContent = this.songQueue.length;
    }
    if (!this.songQueue.length) {
      container.innerHTML = '';
      if (emptyEl) {
        emptyEl.hidden = false;
      }
      return;
    }
    if (emptyEl) {
      emptyEl.hidden = true;
    }
    const frag = document.createDocumentFragment();
    this.songQueue.forEach((block, idx) => frag.appendChild(this._queueBuildRow(block, idx)));
    container.innerHTML = '';
    container.appendChild(frag);
    this._queueBindDrag(container);
  }
  _queueBuildRow(block, idx) {
    const row = document.createElement('div');
    row.className = `qv2-row${block.type === 'stop' ? ' qv2-row--stop' : block.type === 'loop' ? ' qv2-row--loop' : ''}`;
    row.dataset.queueId = block.queueId;
    row.dataset.idx = idx;
    row.setAttribute('role', 'listitem');
    row.draggable = true;
    if (block.type === 'stop') {
      row.innerHTML = `\n\t            <span class="qv2-drag-handle" aria-hidden="true"><i class="fas fa-grip-vertical"></i></span>\n\t            <span class="qv2-row-num">${idx + 1}</span>\n\t            <div class="qv2-row-info qv2-row-info--stop">\n\t                <i class="fas fa-stop-circle"></i>\n\t                <span class="qv2-row-name">Stop Autoplay</span>\n\t            </div>\n\t            <div class="qv2-row-actions">\n\t                <button class="qv2-row-btn qv2-row-btn--remove" data-action="remove" title="Remove"><i class="fas fa-times"></i></button>\n\t            </div>`;
    } else if (block.type === 'loop') {
      row.innerHTML = `\n\t            <span class="qv2-drag-handle" aria-hidden="true"><i class="fas fa-grip-vertical"></i></span>\n\t            <span class="qv2-row-num">${idx + 1}</span>\n\t            <div class="qv2-row-info qv2-row-info--loop">\n\t                <i class="fas fa-infinity"></i>\n\t                <span class="qv2-row-name">Loop Previous Song Forever</span>\n\t            </div>\n\t            <div class="qv2-row-actions">\n\t                <button class="qv2-row-btn qv2-row-btn--remove" data-action="remove" title="Remove"><i class="fas fa-times"></i></button>\n\t            </div>`;
    } else {
      const isInf = block.repeat === -1;
      const repeatVal = isInf ? '∞' : block.repeat;
      row.innerHTML = `\n\t            <span class="qv2-drag-handle" aria-hidden="true"><i class="fas fa-grip-vertical"></i></span>\n\t            <span class="qv2-row-num">${idx + 1}</span>\n\t            <div class="qv2-row-info">\n\t                <span class="qv2-row-name">${this.escapeHtml(block.name)}</span>\n\t                ${block.author ? `<span class="qv2-row-author">${this.escapeHtml(block.author)}</span>` : ''}\n\t            </div>\n\t            <div class="qv2-repeat-control">\n\t                <button class="qv2-repeat-btn" data-action="dec" title="Less" ${isInf ? 'disabled' : ''}>−</button>\n\t                <input class="qv2-repeat-input" type="text" value="${repeatVal}"\n\t                    data-inf="${isInf}" aria-label="Repeat count"\n\t                    style="width:28px;text-align:center;background:transparent;border:none;color:inherit;font-size:13px;" />\n\t                <button class="qv2-repeat-btn" data-action="inc" title="More" ${isInf ? 'disabled' : ''}>+</button>\n\t            </div>\n\t            <div class="qv2-row-actions">\n\t                <button class="qv2-row-btn" data-action="duplicate" title="Duplicate"><i class="fas fa-copy"></i></button>\n\t                <button class="qv2-row-btn qv2-row-btn--remove" data-action="remove" title="Remove"><i class="fas fa-times"></i></button>\n\t            </div>`;
      const input = row.querySelector('.qv2-repeat-input');
      input.addEventListener('change', () => {
        const v = input.value.trim();
        if (v === '∞') {
          block.repeat = -1;
          input.dataset.inf = 'true';
          row.querySelector('[data-action="inc"]').disabled = true;
          row.querySelector('[data-action="dec"]').disabled = true;
        } else {
          const n = Math.max(1, Math.min(99, parseInt(v) || 1));
          block.repeat = n;
          input.value = n;
          input.dataset.inf = 'false';
          row.querySelector('[data-action="inc"]').disabled = false;
          row.querySelector('[data-action="dec"]').disabled = false;
        }
        this.saveQueue();
      });
      input.addEventListener('keydown', e => {
        const allowed = [ 'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter' ];
        if (allowed.includes(e.key)) {
          return;
        }
        if (e.key === '∞') {
          return;
        }
        if (!/^\d$/.test(e.key)) {
          e.preventDefault();
        }
      });
      row.querySelector('[data-action="inc"]').addEventListener('click', () => {
        if (block.repeat === -1) {
          return;
        }
        block.repeat = Math.min(99, block.repeat + 1);
        input.value = block.repeat;
        this.saveQueue();
      });
      row.querySelector('[data-action="dec"]').addEventListener('click', () => {
        if (block.repeat === -1) {
          return;
        }
        block.repeat = Math.max(1, block.repeat - 1);
        input.value = block.repeat;
        this.saveQueue();
      });
    }
    row.addEventListener('click', e => {
      const btn = e.target.closest('[data-action]');
      if (!btn) {
        return;
      }
      const action = btn.dataset.action;
      if (action === 'remove') {
        this.removeFromQueue(row.dataset.queueId);
      }
      if (action === 'duplicate') {
        this.duplicateQueueBlock(row.dataset.queueId);
      }
    });
    return row;
  }
  _queueBindDrag(container) {
    let dragSrcQueueId = null;
    const getRow = e => {
      const row = e.target.closest('.qv2-row');
      return row && container.contains(row) ? row : null;
    };
    const onDragStart = e => {
      const row = getRow(e);
      if (!row) {
        return;
      }
      dragSrcQueueId = row.dataset.queueId;
      e.dataTransfer.setData('text/plain', dragSrcQueueId);
      e.dataTransfer.effectAllowed = 'move';
      requestAnimationFrame(() => row.classList.add('qv2-row--dragging'));
    };
    const onDragOver = e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      const row = getRow(e);
      if (!row || row.dataset.queueId === dragSrcQueueId) {
        return;
      }
      container.querySelectorAll('.qv2-row--over').forEach(r => r.classList.remove('qv2-row--over'));
      row.classList.add('qv2-row--over');
    };
    const onDrop = e => {
      e.preventDefault();
      const row = getRow(e);
      if (!row || !dragSrcQueueId) {
        return;
      }
      const toQueueId = row.dataset.queueId;
      if (toQueueId === dragSrcQueueId) {
        return;
      }
      const fromIdx = this.songQueue.findIndex(b => b.queueId === dragSrcQueueId);
      const toIdx = this.songQueue.findIndex(b => b.queueId === toQueueId);
      if (fromIdx === -1 || toIdx === -1) {
        return;
      }
      this.reorderQueue(fromIdx, toIdx);
      this._queueRenderRows();
      dragSrcQueueId = null;
    };
    const onDragEnd = () => {
      container.querySelectorAll('.qv2-row--dragging, .qv2-row--over').forEach(r => {
        r.classList.remove('qv2-row--dragging', 'qv2-row--over');
      });
      dragSrcQueueId = null;
    };
    container.addEventListener('dragstart', onDragStart);
    container.addEventListener('dragover', onDragOver);
    container.addEventListener('drop', onDrop);
    container.addEventListener('dragend', onDragEnd);
  }
  _queueBindSearch(input, dropdown) {
    if (!input || !dropdown) {
      return;
    }
    let _debounce = null;
    const renderResults = term => {
      if (!term) {
        dropdown.hidden = true;
        return;
      }
      const lower = term.toLowerCase();
      const results = this.songLibrary.filter(s => s.name.toLowerCase().includes(lower) || s.author && s.author.toLowerCase().includes(lower)).slice(0, 8);
      if (!results.length) {
        dropdown.hidden = true;
        return;
      }
      dropdown.hidden = false;
      const frag = document.createDocumentFragment();
      results.forEach((song, i) => {
        const item = document.createElement('div');
        item.className = 'qv2-result';
        if (i === 0) {
          item.classList.add('qv2-result--focused');
        }
        item.dataset.idx = i;
        item.innerHTML = `\n\t                <div class="qv2-result-info">\n\t                    <span class="qv2-result-name">${this.escapeHtml(song.name)}</span>\n\t                    ${song.author ? `<span class="qv2-result-author">${this.escapeHtml(song.author)}</span>` : ''}\n\t                </div>`;
        item.addEventListener('mousedown', e => {
          e.preventDefault();
          this.addToQueue(song, 1);
          input.value = '';
          dropdown.hidden = true;
        });
        frag.appendChild(item);
      });
      dropdown.innerHTML = '';
      dropdown.appendChild(frag);
    };
    input.addEventListener('input', () => {
      clearTimeout(_debounce);
      _debounce = setTimeout(() => renderResults(input.value.trim()), 120);
    });
    input.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        dropdown.hidden = true;
        input.value = '';
        return;
      }
      const items = [ ...dropdown.querySelectorAll('.qv2-result') ];
      const focused = dropdown.querySelector('.qv2-result--focused');
      let idx = focused ? items.indexOf(focused) : 0;
      if (e.key === 'Enter') {
        e.preventDefault();
        if (items[idx]) {
          items[idx].dispatchEvent(new MouseEvent('mousedown'));
        }
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!items.length) {
          return;
        }
        focused?.classList.remove('qv2-result--focused');
        idx = e.key === 'ArrowDown' ? Math.min(idx + 1, items.length - 1) : Math.max(idx - 1, 0);
        items[idx].classList.add('qv2-result--focused');
      }
    });
    document.addEventListener('mousedown', e => {
      if (!input.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.hidden = true;
      }
    }, {
      passive: true
    });
  }
  addQueueStyles() {
    if (document.getElementById('qv2-styles')) {
      return;
    }
    const style = document.createElement('style');
    style.id = 'qv2-styles';
    style.textContent = `\n\t        .queue-notification {\n\t            position: fixed;\n\t            top: 20px;\n\t            right: 20px;\n\t            background: var(--accent-color);\n\t            color: #fff;\n\t            padding: 9px 16px;\n\t            border-radius: 6px;\n\t            font-size: 13px;\n\t            z-index: 9999;\n\t            opacity: 0;\n\t            transform: translateX(12px);\n\t            transition: opacity .22s ease, transform .22s ease;\n\t            pointer-events: none;\n\t            box-shadow: 0 4px 14px rgba(0,0,0,.25);\n\t        }\n\t        .queue-notification--in {\n\t            opacity: 1;\n\t            transform: translateX(0);\n\t        }\n\t    `;
    document.head.appendChild(style);
  }
  createWebEmbedOverlay() {
    if (this.webEmbedOverlay) {
      return;
    }
    this.webEmbedOverlay = document.createElement('div');
    this.webEmbedOverlay.id = 'web-embed-overlay';
    this.webEmbedOverlay.tabIndex = 0;
    this.webEmbedOverlay.style.cssText = `\n    position: fixed;\n    top: 0;\n    left: 0;\n    width: 100vw;\n    height: 100vh;\n    background: white;\n    z-index: 9999;\n    display: none;\n    outline: none;\n  `;
    const exitBtn = document.createElement('button');
    exitBtn.innerHTML = '×';
    exitBtn.style.cssText = `\n    position: absolute;\n    top: 10px;\n    right: 10px;\n    width: 30px;\n    height: 30px;\n    background: rgba(0,0,0,0.7);\n    color: white;\n    border: none;\n    border-radius: 50%;\n    font-size: 18px;\n    cursor: pointer;\n    z-index: 10000;\n    font-weight: bold;\n  `;
    this.webEmbedExitHandler = () => this.toggleWebEmbedOverlay();
    this.webEmbedKeyHandler = e => {
      if (e.key === 'Escape') {
        e.preventDefault();
        this.toggleWebEmbedOverlay();
      }
      if (e.key.toLowerCase() === 'c' && e.shiftKey) {
        e.preventDefault();
        this.cycleWebEmbedSite();
      }
    };
    exitBtn.addEventListener('click', this.webEmbedExitHandler);
    const iframe = document.createElement('iframe');
    iframe.id = 'web-embed-iframe';
    iframe.src = this.webEmbedSites[this.currentWebEmbedIndex];
    iframe.style.cssText = 'width: 100%; height: 100%; border: none;';
    this.webEmbedOverlay.appendChild(iframe);
    this.webEmbedOverlay.appendChild(exitBtn);
    document.body.appendChild(this.webEmbedOverlay);
    this.webEmbedOverlay.addEventListener('keydown', this.webEmbedKeyHandler);
  }
  toggleWebEmbedOverlay() {
    this.createWebEmbedOverlay();
    this.isWebEmbedVisible = !this.isWebEmbedVisible;
    this.webEmbedOverlay.style.display = this.isWebEmbedVisible ? 'block' : 'none';
    if (this.isWebEmbedVisible) {
      this.webEmbedOverlay.focus();
    }
  }
  destroyWebEmbedOverlay() {
    if (this.webEmbedOverlay) {
      if (this.webEmbedKeyHandler) {
        this.webEmbedOverlay.removeEventListener('keydown', this.webEmbedKeyHandler);
      }
      const exitBtn = this.webEmbedOverlay.querySelector('button');
      if (exitBtn && this.webEmbedExitHandler) {
        exitBtn.removeEventListener('click', this.webEmbedExitHandler);
      }
      this.webEmbedOverlay.remove();
      this.webEmbedOverlay = null;
      this.webEmbedKeyHandler = null;
      this.webEmbedExitHandler = null;
      this.isWebEmbedVisible = false;
    }
  }
  cycleWebEmbedSite() {
    this.currentWebEmbedIndex = (this.currentWebEmbedIndex + 1) % this.webEmbedSites.length;
    if (this.webEmbedOverlay) {
      const iframe = document.getElementById('web-embed-iframe');
      if (iframe) {
        iframe.src = this.webEmbedSites[this.currentWebEmbedIndex];
      }
    }
  }
  changeFavicon(iconURL) {
    try {
      const existingFavicon = document.querySelector('link[rel="icon"]');
      if (existingFavicon) {
        existingFavicon.parentNode.removeChild(existingFavicon);
      }
      const newFavicon = document.createElement('link');
      newFavicon.rel = 'icon';
      newFavicon.type = 'image/png';
      newFavicon.href = iconURL;
      document.head.appendChild(newFavicon);
    } catch (error) {
      console.error('Error changing favicon:', error);
    }
  }
  startTitleMonitor(priorityTitle) {
    if (this.titleObserver) {
      this.titleObserver.disconnect();
    }
    const config = {
      childList: true,
      subtree: true
    };
    this.titleObserver = new MutationObserver(mutationsList => {
      if (this.priorityModeActive && document.title !== priorityTitle) {
        document.title = priorityTitle;
      }
    });
    this.titleObserver.observe(document.querySelector('head'), config);
    document.title = priorityTitle;
  }
  stopTitleMonitor() {
    if (this.titleObserver) {
      this.titleObserver.disconnect();
      this.titleObserver = null;
    }
  }
  cycleFaviconAndTitle() {
    this.currentDisguiseIndex = (this.currentDisguiseIndex + 1) % (this.pageDisguises.length + 1);
    if (this.currentDisguiseIndex === this.pageDisguises.length) {
      this.changeFavicon(this.originalFavicon);
      document.title = this.originalTitle;
      this.priorityModeActive = false;
      this.stopTitleMonitor();
    } else {
      const currentDisguise = this.pageDisguises[this.currentDisguiseIndex];
      this.changeFavicon(currentDisguise.favicon);
      document.title = currentDisguise.title;
      this.priorityModeActive = currentDisguise.isPriority;
      if (this.priorityModeActive) {
        this.startTitleMonitor(currentDisguise.title);
      } else {
        this.stopTitleMonitor();
      }
    }
  }
  updatePageTitle() {
    const defaultTitle = 'Music';
    const MAX_TITLE_LENGTH = 60;
    const SCROLL_THRESHOLD = 70;
    if (!this.isPlaying || !this.elements.currentSongName.textContent || this.elements.currentSongName.textContent === 'No Song Playing') {
      document.title = defaultTitle;
      if (this.titleScrollInterval) {
        clearInterval(this.titleScrollInterval);
        this.titleScrollInterval = null;
      }
      return;
    }
    const songName = this.elements.currentSongName.textContent;
    const fullTitle = `Music - ${songName}`;
    if (this.titleScrollInterval) {
      clearInterval(this.titleScrollInterval);
      this.titleScrollInterval = null;
    }
    if (fullTitle.length <= MAX_TITLE_LENGTH) {
      document.title = fullTitle;
    } else if (songName.length <= MAX_TITLE_LENGTH + 5) {
      document.title = songName.length <= MAX_TITLE_LENGTH ? songName : songName.substring(0, MAX_TITLE_LENGTH - 3) + '...';
    } else if (songName.length > SCROLL_THRESHOLD) {
      let currentPosition = 0;
      const scrollTitle = `${songName} • `;
      this.titleScrollInterval = setInterval(() => {
        currentPosition = (currentPosition + 1) % scrollTitle.length;
        const scrolledTitle = scrollTitle.substring(currentPosition) + scrollTitle.substring(0, currentPosition);
        document.title = scrolledTitle;
      }, 500);
    } else {
      document.title = songName.substring(0, MAX_TITLE_LENGTH - 3) + '...';
    }
  }
  setSpecificTimeTimer(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    const now = new Date();
    const targetTime = new Date();
    targetTime.setHours(hours, minutes, 0, 0);
    if (targetTime < now) {
      targetTime.setDate(targetTime.getDate() + 1);
    }
    const timeDiff = targetTime - now;
    const minutesDiff = (timeDiff / 6e4).toFixed(2);
    this.setAppTimer(parseFloat(minutesDiff), targetTime);
  }
  setAppTimer(minutes, specificEndTime = null) {
    this.clearAppTimer();
    const milliseconds = minutes * 6e4;
    if (specificEndTime) {
      this.timerEndTime = specificEndTime;
    } else {
      this.timerEndTime = new Date(Date.now() + milliseconds);
    }
    const timerStatus = document.getElementById('timerStatus');
    const actionText = this.timerAction === 'stopMusic' ? 'Music will stop' : 'App will close';
    if (specificEndTime) {
      const formattedTime = this.timerEndTime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
      timerStatus.textContent = `${actionText} at ${formattedTime} (in ${minutes.toFixed(2)} minutes)`;
      const timerDisplay = document.getElementById('timerDisplay');
      timerDisplay.textContent = formattedTime;
      timerDisplay.style.display = 'inline';
    } else {
      timerStatus.textContent = `${actionText} in ${minutes.toFixed(2)} minutes`;
      const timerDisplay = document.getElementById('timerDisplay');
      timerDisplay.textContent = `${Math.floor(minutes)}m`;
      timerDisplay.style.display = 'inline';
    }
    document.getElementById('cancelTimer').style.display = 'inline-block';
    this.appTimer = setTimeout(() => {
      if (this.timerAction === 'stopMusic') {
        this.stopMusic();
      } else {
        this.closeApp();
      }
    }, milliseconds);
    document.getElementById('timerModal').style.display = 'none';
    this.updateTimerCountdown();
  }
  stopMusic() {
    if (this.isLocalPlayback && this.localAudio) {
      try {
        this.localAudio.pause();
        this.isPlaying = false;
        this.updatePlayerUI();
        if (this.titleScrollInterval) {
          clearInterval(this.titleScrollInterval);
          this.titleScrollInterval = null;
          document.title = 'Music Player';
        }
      } catch (error) {
        console.error('Error stopping local audio:', error);
      }
    } else if (this.ytPlayer) {
      try {
        this.ytPlayer.pauseVideo();
        this.isPlaying = false;
        this.updatePlayerUI();
        if (this.titleScrollInterval) {
          clearInterval(this.titleScrollInterval);
          this.titleScrollInterval = null;
          document.title = 'Music Player';
        }
      } catch (error) {
        console.error('Error stopping music:', error);
      }
    }
    this.clearAppTimer();
  }
  closeApp() {
    try {
      window.close();
      window.open('', '_self').close();
    } catch (error) {
      console.log('Standard window close failed:', error);
    }
    try {
      window.location.replace('about:blank');
    } catch (error) {
      console.log('Navigation redirect failed:', error);
    }
    document.body.innerHTML = '<div style="text-align: center; padding: 50px; background: #1a1a1a; color: #fff; position: fixed; top: 0; left: 0; right: 0; bottom: 0;"><h1>Session Ended</h1><p>Your music session has ended. The app has been closed.</p><button onclick="window.location.reload()" style="padding: 10px 20px; margin-top: 20px; background: #3498db; border: none; color: white; border-radius: 4px; cursor: pointer;">Restart App</button></div>';
    const scripts = document.getElementsByTagName('script');
    for (let i = scripts.length - 1; i >= 0; i--) {
      if (scripts[i].parentNode) {
        scripts[i].parentNode.removeChild(scripts[i]);
      }
    }
  }
  clearAppTimer() {
    if (this.appTimer) {
      clearTimeout(this.appTimer);
      this.appTimer = null;
      this.timerEndTime = null;
      const timerStatus = document.getElementById('timerStatus');
      timerStatus.textContent = 'No timer set';
      document.getElementById('cancelTimer').style.display = 'none';
      const timerDisplay = document.getElementById('timerDisplay');
      timerDisplay.textContent = '';
      timerDisplay.style.display = 'none';
    }
  }
  updateTimerCountdown() {
    if (this.timerEndTime) {
      const now = new Date();
      const timeLeft = this.timerEndTime - now;
      if (timeLeft > 0) {
        const minutes = Math.floor(timeLeft / 6e4);
        const seconds = Math.floor(timeLeft % 6e4 / 1e3);
        const timerStatus = document.getElementById('timerStatus');
        const actionText = this.timerAction === 'stopMusic' ? 'Music will stop' : 'App will close';
        timerStatus.textContent = `${actionText} in ${minutes}m ${seconds}s`;
        const timerDisplay = document.getElementById('timerDisplay');
        if (minutes > 0) {
          timerDisplay.textContent = `${minutes}m ${seconds}s`;
        } else {
          timerDisplay.textContent = `${seconds}s`;
        }
        setTimeout(() => this.updateTimerCountdown(), 1e3);
      }
    }
  }
  openTimerModal() {
    document.getElementById('timerModal').style.display = 'flex';
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('specificTimeInput').value = `${hours}:${minutes}`;
  }
  setupTimerEventListeners() {
    document.getElementById('timerButton').addEventListener('click', () => {
      this.openTimerModal();
    });
    document.getElementById('closeTimerModal').addEventListener('click', () => {
      document.getElementById('timerModal').style.display = 'none';
    });
    document.getElementById('stopMusicAction').addEventListener('click', () => {
      this.timerAction = 'stopMusic';
      document.querySelectorAll('.action-btn').forEach(btn => btn.classList.remove('active'));
      document.getElementById('stopMusicAction').classList.add('active');
    });
    document.getElementById('closeAppAction').addEventListener('click', () => {
      this.timerAction = 'closeApp';
      document.querySelectorAll('.action-btn').forEach(btn => btn.classList.remove('active'));
      document.getElementById('closeAppAction').classList.add('active');
    });
    document.querySelectorAll('.timer-options button').forEach(button => {
      button.addEventListener('click', () => {
        const minutes = parseFloat(button.getAttribute('data-time'));
        this.setAppTimer(minutes);
      });
    });
    document.getElementById('setCustomTimer').addEventListener('click', () => {
      const customMinutes = parseFloat(document.getElementById('customTimerInput').value);
      if (customMinutes > 0) {
        this.setAppTimer(customMinutes);
      }
    });
    document.getElementById('cancelTimer').addEventListener('click', () => {
      this.clearAppTimer();
    });
    document.getElementById('setSpecificTime').addEventListener('click', () => {
      const timeInput = document.getElementById('specificTimeInput').value;
      if (timeInput) {
        this.setSpecificTimeTimer(timeInput);
      }
    });
    window.addEventListener('click', event => {
      if (event.target === document.getElementById('timerModal')) {
        document.getElementById('timerModal').style.display = 'none';
      }
    });
  }
  adjustLayoutTogglePosition() {
    const playlistSidebar = document.getElementById('currentPlaylistSidebar');
    if (playlistSidebar.classList.contains('open')) {
      document.querySelector('.layout-toggle').style.left = '300px';
    } else {
      document.querySelector('.layout-toggle').style.left = '15px';
    }
  }
  setupLayoutEventListeners() {
    const layoutToggleBtn = document.getElementById('layoutToggleBtn');
    const nowPlayingSection = document.querySelector('.now-playing');
    const playlistSidebar = document.getElementById('currentPlaylistSidebar');
    layoutToggleBtn.addEventListener('click', () => {
      nowPlayingSection.classList.remove('controls-left', 'controls-center', 'controls-right');
      if (this.currentLayout === 'center') {
        this.currentLayout = 'left';
        nowPlayingSection.classList.add('controls-left');
        layoutToggleBtn.title = 'Controls aligned left';
      } else if (this.currentLayout === 'left') {
        this.currentLayout = 'right';
        nowPlayingSection.classList.add('controls-right');
        layoutToggleBtn.title = 'Controls aligned right';
      } else {
        this.currentLayout = 'center';
        nowPlayingSection.classList.add('controls-center');
        layoutToggleBtn.title = 'Controls aligned center';
      }
      localStorage.setItem('controlsLayout', this.currentLayout);
    });
    const savedLayout = localStorage.getItem('controlsLayout');
    if (savedLayout) {
      this.currentLayout = savedLayout;
      nowPlayingSection.classList.add(`controls-${this.currentLayout}`);
    } else {
      nowPlayingSection.classList.add('controls-center');
    }
    const showPlaylistBtn = document.getElementById('showPlaylistBtn');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    showPlaylistBtn.addEventListener('click', () => {
      setTimeout(() => this.adjustLayoutTogglePosition(), 10);
    });
    closeSidebarBtn.addEventListener('click', () => {
      setTimeout(() => this.adjustLayoutTogglePosition(), 10);
    });
    this.adjustLayoutTogglePosition();
  }
  toggleControlBar() {
    const controlBarContainer = document.querySelector('.player-controls').closest('.player-container');
    const targetElement = controlBarContainer || document.querySelector('.player-controls').parentElement;
    const layoutToggleBtn = document.querySelector('.layout-toggle-button');
    const isVisible = targetElement.style.visibility !== 'hidden';
    const leftBanner = document.querySelector('.left-advertisement-banner');
    const rightBanner = document.querySelector('.right-advertisement-banner');
    const spacerDiv = document.getElementById('controlBarSpacer');
    const overlayModeSpacer = document.getElementById('overlayModeSpacer');
    const expandedModeSpacer = document.getElementById('expandedModeSpacer');
    if (isVisible) {
      targetElement.style.visibility = 'hidden';
      targetElement.style.position = 'absolute';
      targetElement.style.pointerEvents = 'none';
      localStorage.setItem('controlBarVisible', 'false');
      document.body.classList.add('control-bar-hidden');
      if (leftBanner) {
        leftBanner.classList.add('expanded');
      }
      if (rightBanner) {
        rightBanner.classList.add('expanded');
      }
      if (layoutToggleBtn && !targetElement.contains(layoutToggleBtn)) {
        layoutToggleBtn.style.visibility = 'visible';
        layoutToggleBtn.style.position = '';
        layoutToggleBtn.style.pointerEvents = 'auto';
      }
      if (spacerDiv) {
        spacerDiv.style.display = 'none';
      }
      if (overlayModeSpacer) {
        overlayModeSpacer.style.display = 'none';
      }
      if (expandedModeSpacer) {
        expandedModeSpacer.style.display = 'none';
      }
    } else {
      targetElement.style.visibility = 'visible';
      targetElement.style.position = '';
      targetElement.style.pointerEvents = 'auto';
      localStorage.setItem('controlBarVisible', 'true');
      document.body.classList.remove('control-bar-hidden');
      if (leftBanner) {
        leftBanner.classList.remove('expanded');
      }
      if (rightBanner) {
        rightBanner.classList.remove('expanded');
      }
      if (spacerDiv) {
        spacerDiv.style.display = 'block';
      }
      if (overlayModeSpacer) {
        overlayModeSpacer.style.display = 'block';
      }
      if (expandedModeSpacer) {
        expandedModeSpacer.style.display = 'block';
      }
    }
    if (this.isSidebarVisible && this.currentPlaylist) {
      this.renderPlaylistSidebar();
    }
  }
  exportLibrary() {
    let exportText = '';
    this.songLibrary.forEach(song => {
      const author = song.author ? `, ${song.author}` : '';
      exportText += `${song.name}, https://www.youtube.com/watch?v=${song.videoId}${author}\n`;
    });
    this.copyToClipboardWithFallback(exportText, 'Library exported to clipboard successfully!', 'Export Library');
  }
  exportPlaylist(playlistId) {
    const playlist = this.playlists.find(p => p.id === playlistId);
    if (!playlist) {
      alert('Playlist not found');
      return;
    }
    let exportText = `${playlist.name}{\n`;
    playlist.songs.forEach(playlistSong => {
      const libraryMatch = this.songLibrary.find(s => s.videoId === playlistSong.videoId);
      const songName = libraryMatch ? libraryMatch.name : playlistSong.name;
      const author = libraryMatch ? libraryMatch.author : playlistSong.author || '';
      const authorText = author ? `, ${author}` : '';
      exportText += `    ${songName}, https://www.youtube.com/watch?v=${playlistSong.videoId}${authorText}\n`;
    });
    exportText += '}\n';
    this.copyToClipboardWithFallback(exportText, `"${playlist.name}" playlist exported to clipboard successfully!`, 'Export Playlist');
  }
  copyToClipboardWithFallback(text, successMessage, modalTitle) {
    navigator.clipboard.writeText(text).then(() => {
      alert(successMessage);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      this.showExportModal(text, modalTitle);
    });
  }
  showExportModal(exportText, title = 'Export') {
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.style.display = 'block';
    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-content');
    const closeBtn = document.createElement('span');
    closeBtn.classList.add('close-btn');
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = () => modal.remove();
    const heading = document.createElement('h2');
    heading.textContent = title;
    const instructions = document.createElement('p');
    instructions.textContent = 'Copy the text below to share:';
    const textarea = document.createElement('textarea');
    textarea.value = exportText;
    textarea.style.width = '100%';
    textarea.style.height = '200px';
    textarea.readOnly = true;
    const copyBtn = document.createElement('button');
    copyBtn.textContent = 'Copy to Clipboard';
    copyBtn.classList.add('copy-btn');
    copyBtn.onclick = () => {
      textarea.select();
      document.execCommand('copy');
      alert('Copied to clipboard!');
    };
    modalContent.appendChild(closeBtn);
    modalContent.appendChild(heading);
    modalContent.appendChild(instructions);
    modalContent.appendChild(textarea);
    modalContent.appendChild(copyBtn);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
  }
  showExportDropdown(triggerElement) {
    this.hideExportDropdown();
    const dropdown = document.createElement('div');
    dropdown.id = 'exportDropdown';
    dropdown.className = 'export-dropdown';
    const rect = triggerElement.getBoundingClientRect();
    dropdown.style.position = 'absolute';
    dropdown.style.top = rect.bottom + window.scrollY + 'px';
    dropdown.style.left = rect.left + 'px';
    dropdown.style.minWidth = rect.width + 'px';
    dropdown.style.zIndex = '1000';
    const exportSongsBtn = document.createElement('button');
    exportSongsBtn.className = 'dropdown-item';
    exportSongsBtn.textContent = 'Export Songs';
    exportSongsBtn.onclick = () => {
      this.exportLibrary();
      this.hideExportDropdown();
    };
    const exportSongsWithPlaylistBtn = document.createElement('button');
    exportSongsWithPlaylistBtn.className = 'dropdown-item';
    exportSongsWithPlaylistBtn.textContent = 'Export Songs with Playlist';
    exportSongsWithPlaylistBtn.onclick = () => {
      this.exportSongsWithAllPlaylists();
      this.hideExportDropdown();
    };
    const exportPlaylistBtn = document.createElement('button');
    exportPlaylistBtn.className = 'dropdown-item';
    exportPlaylistBtn.textContent = 'Export Playlist';
    exportPlaylistBtn.onclick = () => {
      this.showPlaylistSelectionForExport();
      this.hideExportDropdown();
    };
    dropdown.appendChild(exportSongsBtn);
    dropdown.appendChild(exportSongsWithPlaylistBtn);
    dropdown.appendChild(exportPlaylistBtn);
    document.body.appendChild(dropdown);
    requestAnimationFrame(() => {
      dropdown.style.opacity = '1';
      dropdown.style.transform = 'translateY(0)';
    });
  }
  hideExportDropdown() {
    const existingDropdown = document.getElementById('exportDropdown');
    if (existingDropdown) {
      existingDropdown.remove();
    }
  }
  showPlaylistSelectionForExport() {
    if (this.playlists.length === 0) {
      alert('No playlists available. Create a playlist first.');
      return;
    }
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.style.display = 'block';
    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-content', 'playlist-export-modal');
    const closeBtn = document.createElement('span');
    closeBtn.classList.add('close-btn');
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = () => modal.remove();
    const heading = document.createElement('h2');
    heading.textContent = 'Select Playlist to Export';
    heading.classList.add('modal-heading');
    const playlistContainer = document.createElement('div');
    playlistContainer.classList.add('playlist-selection-container');
    const sortedPlaylists = [ ...this.playlists ].sort((a, b) => a.name.localeCompare(b.name));
    sortedPlaylists.forEach(playlist => {
      const playlistButton = document.createElement('button');
      playlistButton.classList.add('playlist-selection-btn');
      const playlistName = document.createElement('div');
      playlistName.classList.add('playlist-name');
      playlistName.textContent = playlist.name;
      const playlistInfo = document.createElement('div');
      playlistInfo.classList.add('playlist-info');
      playlistInfo.textContent = `${playlist.songs.length} songs`;
      playlistButton.appendChild(playlistName);
      playlistButton.appendChild(playlistInfo);
      playlistButton.onclick = () => {
        this.exportPlaylist(playlist.id);
        modal.remove();
      };
      playlistContainer.appendChild(playlistButton);
    });
    modalContent.appendChild(closeBtn);
    modalContent.appendChild(heading);
    modalContent.appendChild(playlistContainer);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
  }
  exportSongsWithAllPlaylists() {
    let exportText = '';
    this.songLibrary.forEach(song => {
      const author = song.author ? `, ${song.author}` : '';
      exportText += `${song.name}, https://www.youtube.com/watch?v=${song.videoId}${author}\n`;
    });
    exportText += '\n';
    this.playlists.forEach(playlist => {
      exportText += `${playlist.name}{\n`;
      playlist.songs.forEach(playlistSong => {
        const libraryMatch = this.songLibrary.find(s => s.videoId === playlistSong.videoId);
        const songName = libraryMatch ? libraryMatch.name : playlistSong.name;
        const author = libraryMatch ? libraryMatch.author : playlistSong.author || '';
        const authorText = author ? `, ${author}` : '';
        exportText += `    ${songName}, https://www.youtube.com/watch?v=${playlistSong.videoId}${authorText}\n`;
      });
      exportText += '}\n';
    });
    this.copyToClipboardWithFallback(exportText, 'Songs and all playlists exported to clipboard successfully!', 'Export Songs with All Playlists');
  }
  importLibrary(importText) {
    if (!importText.trim()) {
      alert('Please enter songs to import.');
      return;
    }
    const lines = importText.split('\n').filter(line => line.trim());
    const importedSongs = [];
    const failedImports = [];
    const duplicates = [];
    const existingIds = new Set(this.songLibrary.map(song => song.id));
    const existingVideoIds = new Set(this.songLibrary.map(song => song.videoId));
    const currentImportVideoIds = new Set();
    const playlists = [];
    let currentPlaylist = null;
    let isPlaylistFormat = false;
    const generateUniqueId = () => {
      let newId;
      do {
        newId = Date.now() + Math.floor(Math.random() * 1e4);
      } while (existingIds.has(newId));
      existingIds.add(newId);
      return newId;
    };
    const findExistingSongByVideoId = videoId => this.songLibrary.find(song => song.videoId === videoId);
    const findImportedSongByVideoId = videoId => importedSongs.find(song => song.videoId === videoId);
    const extractVideoId = url => {
      if (!url) {
        return null;
      }
      const vParam = url.match(/[?&]v=([^&]+)/);
      if (vParam && vParam[1]) {
        return vParam[1];
      }
      if (url.includes('youtu.be/')) {
        const parts = url.split('youtu.be/');
        if (parts.length > 1) {
          return parts[1].split('?')[0].split('&')[0].trim();
        }
      }
      return null;
    };
    for (const line of lines) {
      if (line.includes('{')) {
        isPlaylistFormat = true;
        break;
      }
    }
    if (isPlaylistFormat) {
      const playlistRegex = /^(.+?)\{$/;
      const closeBraceRegex = /^\}$/;
      lines.forEach(line => {
        const playlistMatch = line.match(playlistRegex);
        if (playlistMatch) {
          const playlistName = playlistMatch[1].trim();
          currentPlaylist = {
            name: playlistName,
            songs: []
          };
          playlists.push(currentPlaylist);
        } else if (closeBraceRegex.test(line)) {
          currentPlaylist = null;
        } else if (currentPlaylist) {
          try {
            const parsed = this.parseSongLine(line);
            if (!parsed) {
              failedImports.push(`${line} (invalid format)`);
              return;
            }
            const {songName: songName, songUrl: songUrl, author: author} = parsed;
            if (!songUrl.includes('youtube.com') && !songUrl.includes('youtu.be')) {
              failedImports.push(`${line} (not a YouTube URL)`);
              return;
            }
            const videoId = extractVideoId(songUrl);
            if (!videoId) {
              failedImports.push(`${line} (invalid YouTube URL)`);
              return;
            }
            const existingSong = findExistingSongByVideoId(videoId);
            const importedSong = findImportedSongByVideoId(videoId);
            if (existingSong) {
              duplicates.push(line);
              currentPlaylist.songs.push({
                videoId: videoId,
                name: existingSong.name,
                author: existingSong.author || '',
                entryId: Date.now() + Math.random() * 1e4
              });
            } else if (importedSong) {
              duplicates.push(line);
              currentPlaylist.songs.push({
                videoId: videoId,
                name: importedSong.name,
                author: importedSong.author || '',
                entryId: Date.now() + Math.random() * 1e4
              });
            } else {
              const newSong = {
                id: generateUniqueId(),
                name: songName,
                author: author || '',
                videoId: videoId,
                favorite: false,
                lyrics: '',
                addedOn: (new Date()).toISOString()
              };
              importedSongs.push(newSong);
              existingVideoIds.add(videoId);
              currentImportVideoIds.add(videoId);
              currentPlaylist.songs.push({
                videoId: videoId,
                name: songName,
                author: author || '',
                entryId: Date.now() + Math.random() * 1e4
              });
            }
          } catch (error) {
            console.error('Error processing playlist song:', error);
            failedImports.push(`${line} (processing error)`);
          }
        }
      });
    } else {
      lines.forEach(line => {
        try {
          const parsed = this.parseSongLine(line);
          if (!parsed) {
            failedImports.push(`${line} (invalid format)`);
            return;
          }
          const {songName: songName, songUrl: songUrl, author: author} = parsed;
          if (!songUrl.includes('youtube.com') && !songUrl.includes('youtu.be')) {
            failedImports.push(`${line} (not a YouTube URL)`);
            return;
          }
          const videoId = extractVideoId(songUrl);
          if (!videoId) {
            failedImports.push(`${line} (invalid YouTube URL)`);
            return;
          }
          if (existingVideoIds.has(videoId) || currentImportVideoIds.has(videoId)) {
            duplicates.push(line);
            return;
          }
          const newSong = {
            id: generateUniqueId(),
            name: songName,
            author: author || '',
            videoId: videoId,
            favorite: false,
            lyrics: '',
            addedOn: (new Date()).toISOString()
          };
          importedSongs.push(newSong);
          existingVideoIds.add(videoId);
          currentImportVideoIds.add(videoId);
        } catch (error) {
          console.error('Error processing song:', error);
          failedImports.push(`${line} (processing error)`);
        }
      });
    }
    const processPromises = [];
    if (importedSongs.length > 0) {
      processPromises.push(this.addImportedSongsOneByOne(importedSongs));
    }
    if (playlists.length > 0) {
      processPromises.push(this.createImportedPlaylists(playlists));
    }
    Promise.all(processPromises).then(() => {
      this.renderSongLibrary();
      if (typeof this.updatePlaylistSelection === 'function') {
        this.updatePlaylistSelection();
      }
      this.renderPlaylists();
      let message = '';
      if (importedSongs.length > 0) {
        message += `Successfully imported ${importedSongs.length} new songs. `;
      }
      if (playlists.length > 0) {
        message += `Created ${playlists.length} playlists. `;
      }
      if (duplicates.length > 0) {
        message += `Skipped ${duplicates.length} duplicate songs. `;
      }
      if (failedImports.length > 0) {
        message += `Failed to import ${failedImports.length} songs.`;
        console.log('Failed imports:', failedImports);
      }
      if (!message) {
        message = 'No new content was imported.';
      }
      alert(message);
    }).catch(error => {
      console.error('Error processing imports:', error);
      alert('An error occurred while importing. Please check the console for details.');
    });
  }
  parseSongLine(line) {
    line = line.trim();
    if (!line) {
      return null;
    }
    const parts = line.split(',');
    if (parts.length < 2) {
      return null;
    }
    let songName = '';
    let songUrl = '';
    let author = '';
    const cleanParts = parts.map(part => part.trim());
    if (cleanParts.length === 2) {
      songName = cleanParts[0];
      songUrl = cleanParts[1];
    } else if (cleanParts.length === 3) {
      songName = cleanParts[0];
      songUrl = cleanParts[1];
      author = cleanParts[2];
    } else {
      let urlIndex = -1;
      for (let i = 0; i < cleanParts.length; i++) {
        if (cleanParts[i].includes('youtube.com') || cleanParts[i].includes('youtu.be')) {
          urlIndex = i;
          break;
        }
      }
      if (urlIndex === -1) {
        urlIndex = cleanParts.length - 1;
      }
      songUrl = cleanParts[urlIndex];
      if (urlIndex < cleanParts.length - 1) {
        author = cleanParts[urlIndex + 1];
        songName = cleanParts.slice(0, urlIndex).join(',').trim();
      } else {
        songName = cleanParts.slice(0, urlIndex).join(',').trim();
      }
    }
    if (!songName || !songUrl) {
      return null;
    }
    return {
      songName: songName,
      songUrl: songUrl,
      author: author
    };
  }
  createImportedPlaylists(playlists) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      playlists.forEach(playlist => {
        const existingPlaylist = this.playlists.find(p => p.name.toLowerCase() === playlist.name.toLowerCase());
        if (existingPlaylist) {
          playlist.songs.forEach(newSong => {
            const isDuplicate = existingPlaylist.songs.some(existingSong => existingSong.videoId === newSong.videoId);
            if (!isDuplicate) {
              existingPlaylist.songs.push(newSong);
            }
          });
        } else {
          const newPlaylist = {
            id: Date.now() + Math.floor(Math.random() * 1e4),
            name: playlist.name,
            songs: playlist.songs,
            position: this.playlists.length
          };
          this.playlists.push(newPlaylist);
        }
      });
      this.savePlaylists().then(() => resolve()).catch(error => {
        console.error('Error saving imported playlists:', error);
        reject(error);
      });
    });
  }
  addImportedSongsOneByOne(importedSongs) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      this.songLibrary = [ ...this.songLibrary, ...importedSongs ];
      const transaction = this.db.transaction([ 'songLibrary' ], 'readwrite');
      const store = transaction.objectStore('songLibrary');
      let successCount = 0;
      importedSongs.forEach(song => {
        try {
          const getRequest = store.get(song.id);
          getRequest.onsuccess = () => {
            if (getRequest.result) {
              song.id = Date.now() + Math.floor(Math.random() * 1e4) + successCount;
            }
            const addRequest = store.add(song);
            addRequest.onsuccess = () => {
              successCount++;
            };
            addRequest.onerror = e => {
              console.error('Failed to add song:', e.target.error);
            };
          };
        } catch (error) {
          console.error('Error adding song:', error);
        }
      });
      transaction.oncomplete = () => {
        resolve();
      };
      transaction.onerror = event => {
        console.error('Transaction error:', event.target.error);
        resolve();
      };
    });
  }
  showImportModal() {
    const modal = document.getElementById('importModal');
    modal.style.display = 'block';
  }
  closeImportModal() {
    const modal = document.getElementById('importModal');
    modal.style.display = 'none';
    this.elements.importSongsTextarea.value = '';
  }
  setupExportButtonListeners() {
    const exportButton = document.getElementById('exportLibraryBtn');
    if (exportButton) {
      let hoverTimeout;
      exportButton.addEventListener('mouseenter', () => {
        clearTimeout(hoverTimeout);
        hoverTimeout = setTimeout(() => {
          this.showExportDropdown(exportButton);
        }, 200);
      });
      exportButton.addEventListener('mouseleave', () => {
        clearTimeout(hoverTimeout);
        setTimeout(() => {
          const dropdown = document.getElementById('exportDropdown');
          if (dropdown && !dropdown.matches(':hover') && !exportButton.matches(':hover')) {
            this.hideExportDropdown();
          }
        }, 100);
      });
      document.addEventListener('click', e => {
        if (!exportButton.contains(e.target) && !document.getElementById('exportDropdown')?.contains(e.target)) {
          this.hideExportDropdown();
        }
      });
    }
  }
  handleOpenSettings() {
    this.elements.settingsModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    this.initializeSettingsContent();
  }
  handleCloseSettings() {
    this.elements.settingsModal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
  handleSettingsModalClick(event) {
    if (event.target === this.elements.settingsModal) {
      this.handleCloseSettings();
    }
  }
  initializeSettingsContent() {
    this.loadThemeMode();
    this.loadCustomThemeColors();
    this.loadAdvertisementSettingsInModal();
    this.setupTabs();
    this.loadDiscoverMoreSettings();
    this.loadLibrarySortSetting();
    this.loadLibraryReverseSetting();
    this.loadKeybindsSettings();
    this.loadSavedThemesList();
    console.log('Settings modal opened - all settings loaded');
  }
  setupTabs() {
    const firstTab = document.querySelector('.settings-tab-btn');
    const firstPanel = document.querySelector('.tab-panel');
    if (firstTab && firstPanel) {
      firstTab.classList.add('active');
      firstPanel.classList.add('active');
    }
  }
  handleTabSwitch(event) {
    const targetTab = event.target.closest('.settings-tab-btn').dataset.tab;
    document.querySelectorAll('.settings-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
    event.target.closest('.settings-tab-btn').classList.add('active');
    document.getElementById(targetTab + 'Panel').classList.add('active');
    if (targetTab === 'feedback') {
      const iframe = document.querySelector('#feedbackPanel iframe');
      if (iframe && !iframe.src) {
        iframe.src = iframe.dataset.src;
      }
    }
  }
  loadAdvertisementSettingsInModal() {
    if (this.elements.adsToggle) {
      this.elements.adsToggle.checked = this.adsEnabled;
    }
  }
  loadThemeMode() {
    if (!this.db) {
      return;
    }
    const transaction = this.db.transaction([ 'settings' ], 'readonly');
    const store = transaction.objectStore('settings');
    const request = store.get('themeMode');
    request.onsuccess = () => {
      const savedMode = request.result ? request.result.value : 'dark';
      this.elements.themeMode.value = savedMode;
      this.elements.customThemeSection.style.display = savedMode === 'custom' ? 'block' : 'none';
    };
  }
  initializeTheme() {
    if (!this.db) {
      document.documentElement.setAttribute('data-theme', 'dark');
      this.updateThemeIcon('dark');
      setTimeout(() => {
        this.updateFaviconThemeFromDB();
      }, 100);
      return;
    }
    const transaction = this.db.transaction([ 'settings' ], 'readonly');
    const store = transaction.objectStore('settings');
    const request = store.get('themeMode');
    request.onsuccess = () => {
      const savedTheme = request.result ? request.result.value : 'dark';
      if (savedTheme === 'custom') {
        this.loadCustomTheme();
      } else {
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
        setTimeout(() => {
          this.updateFaviconThemeFromDB();
        }, 100);
      }
    };
    request.onerror = event => {
      console.error('Error loading theme setting:', event.target.error);
      document.documentElement.setAttribute('data-theme', 'dark');
      this.updateThemeIcon('dark');
      setTimeout(() => {
        this.updateFaviconThemeFromDB();
      }, 100);
    };
  }
  handleSaveCustomTheme() {
    const shadowColor = this.elements.shadowColorPicker.value;
    const shadowOpacity = this.elements.shadowOpacity.value;
    const shadowRgba = this.hexToRgba(shadowColor, shadowOpacity);
    const customColors = {
      primary: this.elements.primaryColorPicker.value,
      background: this.elements.backgroundColorPicker.value,
      secondary: this.elements.secondaryColorPicker?.value || '#334155',
      textPrimary: this.elements.textPrimaryColorPicker?.value || '#e2e8f0',
      textSecondary: this.elements.textSecondaryColorPicker?.value || '#94a3b8',
      hover: this.elements.hoverColorPicker?.value || '#2563eb',
      border: this.elements.borderColorPicker?.value || '#475569',
      accent: this.elements.accentColorPicker?.value || this.elements.primaryColorPicker.value,
      buttonText: this.elements.buttonTextColorPicker?.value || '#ffffff',
      shadow: shadowRgba,
      error: this.elements.errorColorPicker?.value || '#dc3545',
      errorHover: this.elements.errorHoverColorPicker?.value || '#c82333',
      youtubeRed: this.elements.youtubeRedColorPicker?.value || '#FF0000'
    };
    this.applyCustomColors(customColors);
    document.documentElement.setAttribute('data-theme', 'custom');
    const savePromises = [ this.saveSetting('customPrimary', customColors.primary), this.saveSetting('customBackground', customColors.background), this.saveSetting('customSecondary', customColors.secondary), this.saveSetting('customTextPrimary', customColors.textPrimary), this.saveSetting('customTextSecondary', customColors.textSecondary), this.saveSetting('customHover', customColors.hover), this.saveSetting('customBorder', customColors.border), this.saveSetting('customAccent', customColors.accent), this.saveSetting('customButtonText', customColors.buttonText), this.saveSetting('customShadow', customColors.shadow), this.saveSetting('customError', customColors.error), this.saveSetting('customErrorHover', customColors.errorHover), this.saveSetting('customYoutubeRed', customColors.youtubeRed), this.saveSetting('themeMode', 'custom') ];
    Promise.all(savePromises).then(() => {
      console.log('Custom theme saved successfully');
      this.showNotification('Custom theme saved!', 'success');
    }).catch(error => {
      console.error('Error saving custom theme:', error);
      this.showNotification('Error saving theme', 'error');
    });
  }
  applyCustomColors(colors) {
    document.documentElement.style.setProperty('--custom-primary', colors.primary);
    document.documentElement.style.setProperty('--custom-background', colors.background);
    document.documentElement.style.setProperty('--custom-secondary', colors.secondary);
    document.documentElement.style.setProperty('--custom-text-primary', colors.textPrimary);
    document.documentElement.style.setProperty('--custom-text-secondary', colors.textSecondary);
    document.documentElement.style.setProperty('--custom-hover', colors.hover);
    document.documentElement.style.setProperty('--custom-border', colors.border);
    document.documentElement.style.setProperty('--custom-accent', colors.accent);
    document.documentElement.style.setProperty('--custom-button-text', colors.buttonText);
    document.documentElement.style.setProperty('--custom-shadow', colors.shadow);
    document.documentElement.style.setProperty('--custom-error', colors.error);
    document.documentElement.style.setProperty('--custom-error-hover', colors.errorHover);
    document.documentElement.style.setProperty('--custom-youtube-red', colors.youtubeRed);
    setTimeout(() => {
      this.updateFaviconThemeFromDB();
    }, 150);
  }
  loadCustomTheme() {
    const transaction = this.db.transaction([ 'settings' ], 'readonly');
    const store = transaction.objectStore('settings');
    const colorKeys = [ 'customPrimary', 'customBackground', 'customSecondary', 'customTextPrimary', 'customTextSecondary', 'customHover', 'customBorder', 'customAccent', 'customButtonText', 'customShadow', 'customError', 'customErrorHover', 'customYoutubeRed' ];
    const requests = colorKeys.map(key => {
      const request = store.get(key);
      return new Promise(resolve => {
        request.onsuccess = () => resolve({
          key: key,
          value: request.result?.value
        });
      });
    });
    Promise.all(requests).then(results => {
      const colors = {};
      const defaults = {
        customPrimary: '#3b82f6',
        customBackground: '#1e293b',
        customSecondary: '#334155',
        customTextPrimary: '#e2e8f0',
        customTextSecondary: '#94a3b8',
        customHover: '#2563eb',
        customBorder: '#475569',
        customAccent: '#3b82f6'
      };
      results.forEach(result => {
        colors[result.key] = result.value || defaults[result.key];
      });
      this.applyCustomColors({
        primary: colors.customPrimary,
        background: colors.customBackground,
        secondary: colors.customSecondary,
        textPrimary: colors.customTextPrimary,
        textSecondary: colors.customTextSecondary,
        hover: colors.customHover,
        border: colors.customBorder,
        accent: colors.customAccent
      });
      this.updateColorPickerValues(colors);
      document.documentElement.setAttribute('data-theme', 'custom');
      this.updateThemeIcon('custom');
    });
  }
  loadCustomThemeColors() {
    if (!this.db) {
      return;
    }
    const transaction = this.db.transaction([ 'settings' ], 'readonly');
    const store = transaction.objectStore('settings');
    const colorKeys = [ 'customPrimary', 'customBackground', 'customSecondary', 'customTextPrimary', 'customTextSecondary', 'customHover', 'customBorder', 'customAccent', 'customButtonText', 'customShadow', 'customError', 'customErrorHover', 'customYoutubeRed' ];
    colorKeys.forEach(key => {
      const request = store.get(key);
      request.onsuccess = () => {
        if (request.result?.value) {
          this.updateColorPickerByKey(key, request.result.value);
        }
      };
    });
  }
  updateColorPickerByKey(key, value) {
    const pickerMap = {
      customPrimary: 'primaryColorPicker',
      customBackground: 'backgroundColorPicker',
      customSecondary: 'secondaryColorPicker',
      customTextPrimary: 'textPrimaryColorPicker',
      customTextSecondary: 'textSecondaryColorPicker',
      customHover: 'hoverColorPicker',
      customBorder: 'borderColorPicker',
      customAccent: 'accentColorPicker'
    };
    const elementKey = pickerMap[key];
    if (this.elements[elementKey]) {
      this.elements[elementKey].value = value;
    }
  }
  updateColorPickerValues(colors) {
    const pickerMap = {
      primaryColorPicker: colors.customPrimary,
      backgroundColorPicker: colors.customBackground,
      secondaryColorPicker: colors.customSecondary,
      textPrimaryColorPicker: colors.customTextPrimary,
      textSecondaryColorPicker: colors.customTextSecondary,
      hoverColorPicker: colors.customHover,
      borderColorPicker: colors.customBorder,
      accentColorPicker: colors.customAccent
    };
    Object.entries(pickerMap).forEach(([picker, value]) => {
      if (this.elements[picker]) {
        this.elements[picker].value = value;
      }
    });
  }
  handleThemeModeChange(event) {
    const mode = event.target.value;
    this.elements.customThemeSection.style.display = mode === 'custom' ? 'block' : 'none';
    if (mode !== 'custom') {
      document.documentElement.setAttribute('data-theme', mode);
      this.updateThemeIcon(mode);
      this.saveSetting('themeMode', mode);
      setTimeout(() => {
        this.updateFaviconThemeFromDB();
      }, 100);
    } else {
      this.loadCustomTheme();
    }
  }
  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    let newTheme;
    switch (currentTheme) {
     case 'light':
      newTheme = 'dark';
      break;

     case 'dark':
      newTheme = 'custom';
      break;

     case 'custom':
     default:
      newTheme = 'light';
      break;
    }
    if (newTheme === 'custom') {
      this.loadCustomTheme();
    } else {
      document.documentElement.setAttribute('data-theme', newTheme);
      this.updateThemeIcon(newTheme);
      setTimeout(() => {
        this.updateFaviconThemeFromDB();
      }, 100);
    }
    this.saveSetting('themeMode', newTheme).catch(error => {
      console.error('Error saving theme:', error);
      document.documentElement.setAttribute('data-theme', currentTheme);
      this.updateThemeIcon(currentTheme);
    });
    if (this.elements.themeMode) {
      this.elements.themeMode.value = newTheme;
      this.elements.customThemeSection.style.display = newTheme === 'custom' ? 'block' : 'none';
    }
  }
  updateFaviconThemeFromDB() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'custom') {
      if (!this.db) {
        console.log('Database not available');
        return;
      }
      const transaction = this.db.transaction([ 'settings' ], 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get('customAccent');
      request.onsuccess = () => {
        const accentColor = request.result?.value || '#3b82f6';
        console.log('Using accent color from DB for favicon:', accentColor);
        const finalColor = this.lightenDarkColor(accentColor);
        console.log('Final favicon color:', finalColor);
        this.updateFaviconColor(finalColor);
      };
      request.onerror = () => {
        console.log('Failed to load accent color from DB, using fallback');
        this.updateFaviconColor('#3b82f6');
      };
    } else {
      const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim().replace(/`/g, '');
      if (!accentColor) {
        console.log('No accent color found for preset theme');
        return;
      }
      const finalColor = this.lightenDarkColor(accentColor);
      console.log('Using preset theme color for favicon:', finalColor);
      this.updateFaviconColor(finalColor);
    }
  }
  updateFaviconColor(color) {
    fetch('favicon.svg').then(response => response.text()).then(svgText => {
      const coloredSvg = svgText.replace(/fill="#5D9C59"/g, `fill="${color}"`);
      const blob = new Blob([ coloredSvg ], {
        type: 'image/svg+xml'
      });
      const url = URL.createObjectURL(blob);
      const favicon = document.querySelector('link[rel="icon"]');
      if (favicon) {
        if (favicon.href.startsWith('blob:')) {
          URL.revokeObjectURL(favicon.href);
        }
        favicon.href = url;
        console.log('Favicon updated successfully with color:', color);
      }
    }).catch(error => console.error('Favicon update failed:', error));
  }
  lightenDarkColor(color) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1e3;
    if (brightness < 100) {
      const factor = 1.5;
      const newR = Math.min(255, Math.floor(r * factor));
      const newG = Math.min(255, Math.floor(g * factor));
      const newB = Math.min(255, Math.floor(b * factor));
      return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    }
    return color;
  }
  updateThemeIcon(theme) {
    const icon = this.elements.themeToggle.querySelector('i');
    icon.classList.remove('fa-moon', 'fa-sun', 'fa-palette');
    if (theme === 'custom') {
      icon.classList.add('fa-palette');
    } else {
      icon.classList.add(theme === 'light' ? 'fa-moon' : 'fa-sun');
    }
  }
  showNotification(message, type = 'info') {
    console.log(`${type.toUpperCase()}: ${message}`);
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `\n    position: fixed;\n    top: 20px;\n    right: 20px;\n    padding: 10px 20px;\n    border-radius: 4px;\n    color: white;\n    background-color: ${type === 'success' ? 'var(--accent-color)' : '#f44336'};\n    z-index: 10000;\n    opacity: 0;\n    transition: opacity 0.3s;\n  `;
    document.body.appendChild(notification);
    setTimeout(() => notification.style.opacity = '1', 10);
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 3e3);
  }
  exportTheme() {
    try {
      const themeData = {
        primary: this.elements.primaryColorPicker?.value || '#000000',
        background: this.elements.backgroundColorPicker?.value || '#ffffff',
        secondary: this.elements.secondaryColorPicker?.value || '#cccccc',
        textPrimary: this.elements.textPrimaryColorPicker?.value || '#000000',
        textSecondary: this.elements.textSecondaryColorPicker?.value || '#666666',
        hover: this.elements.hoverColorPicker?.value || '#eeeeee',
        border: this.elements.borderColorPicker?.value || '#dddddd',
        accent: this.elements.accentColorPicker?.value || '#007bff',
        buttonText: this.elements.buttonTextColorPicker?.value || '#ffffff',
        shadow: this.elements.shadowColorPicker?.value || '#000000',
        shadowOpacity: this.elements.shadowOpacity?.value || '0.1',
        error: this.elements.errorColorPicker?.value || '#f44336',
        errorHover: this.elements.errorHoverColorPicker?.value || '#d32f2f',
        youtubeRed: this.elements.youtubeRedColorPicker?.value || '#ff0000'
      };
      const themeString = JSON.stringify(themeData, null, 2);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(themeString).then(() => {
          this.showNotification('Theme exported to clipboard!', 'success');
        }).catch(err => {
          console.error('Failed to copy theme: ', err);
          this.fallbackCopyToClipboard(themeString);
        });
      } else {
        this.fallbackCopyToClipboard(themeString);
      }
    } catch (error) {
      console.error('Export error:', error);
      this.showNotification('Failed to export theme', 'error');
    }
  }
  importTheme() {
    const themeText = this.elements.themeImportText?.value?.trim();
    if (!themeText) {
      this.showNotification('Please paste a theme code first', 'error');
      return;
    }
    try {
      const themeData = JSON.parse(themeText);
      if (typeof themeData !== 'object' || themeData === null) {
        throw new Error('Invalid theme format: not an object');
      }
      const expectedProps = [ 'primary', 'background', 'secondary', 'textPrimary' ];
      const hasValidProps = expectedProps.some(prop => themeData.hasOwnProperty(prop));
      if (!hasValidProps) {
        throw new Error('Invalid theme format: missing expected properties');
      }
      this.applyImportedTheme(themeData);
      this.showNotification('Theme imported successfully! Press save theme buttom.', 'success');
      this.elements.themeImportText.value = '';
    } catch (error) {
      console.error('Failed to parse theme:', error);
      this.showNotification('Invalid theme format', 'error');
    }
  }
  applyImportedTheme(themeData) {
    try {
      const isValidHex = hex => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
      if (themeData.primary && isValidHex(themeData.primary)) {
        this.elements.primaryColorPicker.value = themeData.primary;
      }
      if (themeData.background && isValidHex(themeData.background)) {
        this.elements.backgroundColorPicker.value = themeData.background;
      }
      if (themeData.secondary && isValidHex(themeData.secondary)) {
        this.elements.secondaryColorPicker.value = themeData.secondary;
      }
      if (themeData.textPrimary && isValidHex(themeData.textPrimary)) {
        this.elements.textPrimaryColorPicker.value = themeData.textPrimary;
      }
      if (themeData.textSecondary && isValidHex(themeData.textSecondary)) {
        this.elements.textSecondaryColorPicker.value = themeData.textSecondary;
      }
      if (themeData.hover && isValidHex(themeData.hover)) {
        this.elements.hoverColorPicker.value = themeData.hover;
      }
      if (themeData.border && isValidHex(themeData.border)) {
        this.elements.borderColorPicker.value = themeData.border;
      }
      if (themeData.accent && isValidHex(themeData.accent)) {
        this.elements.accentColorPicker.value = themeData.accent;
      }
      if (themeData.buttonText && isValidHex(themeData.buttonText)) {
        this.elements.buttonTextColorPicker.value = themeData.buttonText;
      }
      if (themeData.shadow && isValidHex(themeData.shadow)) {
        this.elements.shadowColorPicker.value = themeData.shadow;
      }
      if (themeData.shadowOpacity && !isNaN(parseFloat(themeData.shadowOpacity))) {
        this.elements.shadowOpacity.value = themeData.shadowOpacity;
      }
      if (themeData.error && isValidHex(themeData.error)) {
        this.elements.errorColorPicker.value = themeData.error;
      }
      if (themeData.errorHover && isValidHex(themeData.errorHover)) {
        this.elements.errorHoverColorPicker.value = themeData.errorHover;
      }
      if (themeData.youtubeRed && isValidHex(themeData.youtubeRed)) {
        this.elements.youtubeRedColorPicker.value = themeData.youtubeRed;
      }
      if (typeof this.handleSaveCustomTheme === 'function') {
        this.handleSaveCustomTheme();
      }
    } catch (error) {
      console.error('Error applying imported theme:', error);
      this.showNotification('Error applying theme', 'error');
    }
  }
  hexToRgba(hex, opacity) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      const r = parseInt(result[1], 16);
      const g = parseInt(result[2], 16);
      const b = parseInt(result[3], 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return `rgba(0, 0, 0, ${opacity})`;
  }
  resetCustomTheme() {
    const defaultColors = {
      primary: '#3b82f6',
      background: '#1e293b',
      secondary: '#334155',
      textPrimary: '#e2e8f0',
      textSecondary: '#94a3b8',
      hover: '#2563eb',
      border: '#475569',
      accent: '#3b82f6'
    };
    this.applyCustomColors(defaultColors);
    this.updateColorPickerValues({
      customPrimary: defaultColors.primary,
      customBackground: defaultColors.background,
      customSecondary: defaultColors.secondary,
      customTextPrimary: defaultColors.textPrimary,
      customTextSecondary: defaultColors.textSecondary,
      customHover: defaultColors.hover,
      customBorder: defaultColors.border,
      customAccent: defaultColors.accent
    });
  }
  saveNamedTheme() {
    const nameInput = document.getElementById('savedThemeName');
    const name = nameInput?.value?.trim();
    if (!name) {
      this.showNotification('Enter a theme name first', 'error');
      return;
    }
    if (!this.db) {
      this.showNotification('Database not available', 'error');
      return;
    }
    const themeData = {
      primary: this.elements.primaryColorPicker?.value || '#3b82f6',
      background: this.elements.backgroundColorPicker?.value || '#1e293b',
      secondary: this.elements.secondaryColorPicker?.value || '#334155',
      textPrimary: this.elements.textPrimaryColorPicker?.value || '#e2e8f0',
      textSecondary: this.elements.textSecondaryColorPicker?.value || '#94a3b8',
      hover: this.elements.hoverColorPicker?.value || '#2563eb',
      border: this.elements.borderColorPicker?.value || '#475569',
      accent: this.elements.accentColorPicker?.value || '#3b82f6',
      buttonText: this.elements.buttonTextColorPicker?.value || '#ffffff',
      shadowHex: this.elements.shadowColorPicker?.value || '#000000',
      shadowOpacity: this.elements.shadowOpacity?.value || '0.1',
      error: this.elements.errorColorPicker?.value || '#dc3545',
      errorHover: this.elements.errorHoverColorPicker?.value || '#c82333',
      youtubeRed: this.elements.youtubeRedColorPicker?.value || '#FF0000'
    };
    this._getSavedThemesRecord().then(themes => {
      themes.push({
        id: `st_${Date.now()}`,
        name: name,
        data: themeData,
        savedAt: Date.now()
      });
      this._writeSavedThemes(themes).then(() => {
        this.showNotification(`Theme "${name}" saved!`, 'success');
        nameInput.value = '';
        this.loadSavedThemesList();
      });
    });
  }
  loadSavedThemesList() {
    const container = document.getElementById('savedThemesList');
    if (!container) {
      return;
    }
    this._getSavedThemesRecord().then(themes => {
      if (!themes.length) {
        container.innerHTML = '';
        return;
      }
      themes.sort((a, b) => b.savedAt - a.savedAt);
      container.innerHTML = themes.map(t => {
        const d = t.data;
        const date = new Date(t.savedAt).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: '2-digit'
        });
        const swatches = [ d.background, d.secondary, d.primary, d.accent, d.textPrimary ].map(c => `<div class="saved-theme-swatch" style="background:${c}"></div>`).join('');
        const safeName = d.name ? d.name.replace(/</g, '&lt;') : t.name.replace(/</g, '&lt;');
        return `\n\t\t\t\t<div class="saved-theme-item" data-id="${t.id}">\n\t\t\t\t  <div class="saved-theme-swatches">${swatches}</div>\n\t\t\t\t  <span class="saved-theme-name">${t.name.replace(/</g, '&lt;')}</span>\n\t\t\t\t  <span class="saved-theme-date">${date}</span>\n\t\t\t\t  <div class="saved-theme-actions">\n\t\t\t\t\t<button class="load-theme-btn" title="Apply" onclick="musicPlayer.applySavedTheme('${t.id}')"><i class="fa-solid fa-check"></i></button>\n\t\t\t\t\t<button class="delete-theme-btn" title="Delete" onclick="musicPlayer.deleteSavedTheme('${t.id}')"><i class="fa-solid fa-trash"></i></button>\n\t\t\t\t  </div>\n\t\t\t\t</div>`;
      }).join('');
    });
  }
  applySavedTheme(id) {
    this._getSavedThemesRecord().then(themes => {
      const theme = themes.find(t => t.id === id);
      if (!theme) {
        return;
      }
      const d = theme.data;
      const set = (el, v) => {
        if (this.elements[el]) {
          this.elements[el].value = v;
        }
      };
      set('primaryColorPicker', d.primary);
      set('backgroundColorPicker', d.background);
      set('secondaryColorPicker', d.secondary);
      set('textPrimaryColorPicker', d.textPrimary);
      set('textSecondaryColorPicker', d.textSecondary);
      set('hoverColorPicker', d.hover);
      set('borderColorPicker', d.border);
      set('accentColorPicker', d.accent);
      set('buttonTextColorPicker', d.buttonText);
      set('errorColorPicker', d.error);
      set('errorHoverColorPicker', d.errorHover);
      set('youtubeRedColorPicker', d.youtubeRed);
      if (this.elements.shadowColorPicker) {
        this.elements.shadowColorPicker.value = d.shadowHex || '#000000';
      }
      if (this.elements.shadowOpacity) {
        this.elements.shadowOpacity.value = d.shadowOpacity || '0.1';
      }
      this.handleSaveCustomTheme();
      this.showNotification(`Applied "${theme.name}"`, 'success');
    });
  }
  deleteSavedTheme(id) {
    this._getSavedThemesRecord().then(themes => {
      this._writeSavedThemes(themes.filter(t => t.id !== id)).then(() => {
        this.showNotification('Theme deleted', 'success');
        this.loadSavedThemesList();
      });
    });
  }
  _getSavedThemesRecord() {
    return new Promise(resolve => {
      if (!this.db) {
        return resolve([]);
      }
      const req = this.db.transaction([ 'settings' ], 'readonly').objectStore('settings').get('savedThemes');
      req.onsuccess = () => {
        try {
          resolve(JSON.parse(req.result?.value || '[]'));
        } catch {
          resolve([]);
        }
      };
      req.onerror = () => resolve([]);
    });
  }
  _writeSavedThemes(themes) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([ 'settings' ], 'readwrite');
      tx.objectStore('settings').put({
        name: 'savedThemes',
        value: JSON.stringify(themes)
      });
      tx.oncomplete = resolve;
      tx.onerror = reject;
    });
  }
  async loadAdvertisementSettings() {
    try {
      if (!this.db || !this.db.objectStoreNames.contains('settings')) {
        console.log('Settings store not found, using default advertisement settings');
        this.adsEnabled = false;
        this.updateAdvertisementDisplay();
        return;
      }
      const transaction = this.db.transaction([ 'settings' ], 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get('advertisementEnabled');
      return new Promise(resolve => {
        request.onsuccess = event => {
          const result = event.target.result;
          if (result && typeof result.value !== 'undefined') {
            this.adsEnabled = result.value;
          } else {
            this.adsEnabled = false;
          }
          this.updateAdvertisementDisplay();
          resolve();
        };
        request.onerror = () => {
          console.log('Error reading advertisement settings, using default');
          this.adsEnabled = false;
          this.updateAdvertisementDisplay();
          resolve();
        };
      });
    } catch (error) {
      console.error('Error loading advertisement settings:', error);
      this.adsEnabled = false;
      this.updateAdvertisementDisplay();
    }
  }
  async saveAdvertisementSettings() {
    try {
      if (!this.db) {
        console.error('Database not available for saving advertisement settings');
        return;
      }
      if (!this.db.objectStoreNames.contains('settings')) {
        console.error("Settings store doesn't exist");
        return;
      }
      const transaction = this.db.transaction([ 'settings' ], 'readwrite');
      const store = transaction.objectStore('settings');
      const settingsData = {
        name: 'advertisementEnabled',
        value: this.adsEnabled,
        lastUpdated: (new Date()).toISOString()
      };
      const request = store.put(settingsData);
      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          console.log('Advertisement settings saved successfully:', this.adsEnabled);
          resolve();
        };
        request.onerror = event => {
          console.error('Error saving advertisement settings:', event.target.error);
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error('Error in saveAdvertisementSettings:', error);
    }
  }
  handleAdsToggle(event) {
    this.adsEnabled = event.target.checked;
    this.updateAdvertisementDisplay();
    this.saveAdvertisementSettings();
    console.log(`Advertisements ${this.adsEnabled ? 'enabled' : 'disabled'}`);
  }
  updateAdvertisementDisplay() {
    const leftBanner = document.querySelector('.left-advertisement-banner');
    const rightBanner = document.querySelector('.right-advertisement-banner');
    if (this.adsEnabled) {
      document.body.classList.add('ads-enabled');
      if (leftBanner && !leftBanner.querySelector('iframe')) {
        leftBanner.innerHTML = `<iframe data-aa='2404119' src='//acceptable.a-ads.com/2404119' style='border:0px; padding:0; width:100%; height:100%; overflow:hidden; background-color: transparent;'></iframe>`;
      }
      if (rightBanner && !rightBanner.querySelector('iframe')) {
        rightBanner.innerHTML = `<iframe data-aa='2404119' src='//acceptable.a-ads.com/2404119' style='border:0px; padding:0; width:100%; height:100%; overflow:hidden; background-color: transparent;'></iframe>`;
      }
    } else {
      document.body.classList.remove('ads-enabled');
      if (leftBanner) {
        leftBanner.innerHTML = '';
      }
      if (rightBanner) {
        rightBanner.innerHTML = '';
      }
    }
    if (this.elements.adsToggle) {
      this.elements.adsToggle.checked = this.adsEnabled;
    }
  }
  initializeAdvertisementSettings() {
    this.loadAdvertisementSettings().catch(error => {
      console.error('Failed to load advertisement settings:', error);
      this.adsEnabled = false;
      this.updateAdvertisementDisplay();
    });
  }
  initializeVisualizer() {
    this.visualizer.canvas = document.getElementById('visualizerCanvas');
    if (!this.visualizer.canvas) {
      return;
    }
    this.visualizer.ctx = this.visualizer.canvas.getContext('2d');
    this.resizeCanvas();
    this.createVisualizerBars();
    this._cachedAccentColor = this._readAccentColor();
    window.addEventListener('resize', this.debounce(() => this.resizeCanvas(), 150));
  }
  _readAccentColor() {
    return getComputedStyle(document.documentElement).getPropertyValue('--accent-color');
  }
  resizeCanvas() {
    if (!this.visualizer.canvas) {
      return;
    }
    this.visualizer.canvas.width = window.innerWidth;
    this.visualizer.canvas.height = window.innerHeight;
  }
  createVisualizerBars() {
    const barsContainer = document.getElementById('visualizerBars');
    if (!barsContainer) {
      return;
    }
    for (let i = 0; i < 50; i++) {
      const bar = document.createElement('div');
      bar.className = 'bar';
      bar.style.height = '4px';
      barsContainer.appendChild(bar);
      this.visualizer.bars.push(bar);
    }
  }
  startVisualizer() {
    this.visualizer.isActive = true;
    this._visualizerFrameCount = 0;
    this.animateVisualizer();
  }
  animateVisualizer() {
    if (!this.visualizer.isActive || !this.isTabVisible) {
      return;
    }
    this._visualizerFrameCount = (this._visualizerFrameCount || 0) + 1;
    if (this._visualizerFrameCount % 60 === 0) {
      this._cachedAccentColor = this._readAccentColor();
    }
    const idleSkipFrames = this.isPlaying ? 1 : 3;
    if (this._visualizerFrameCount % idleSkipFrames === 0) {
      this.animateBars();
      this.animateParticles();
    }
    if (this.isTabVisible && this.visualizer.isActive) {
      this.visualizer.animationId = requestAnimationFrame(() => this.animateVisualizer());
    }
  }
  animateBars() {
    this.visualizer.bars.forEach((bar, index) => {
      let intensity = this.isPlaying ? 1.5 : 0.15;
      let baseHeight = Math.random() * 100 * intensity;
      let rhythmMultiplier = Math.sin(Date.now() * 0.01 + index * 0.3) * 0.5 + 0.5;
      let height = baseHeight * rhythmMultiplier + 4;
      if (this.isPlaying) {
        height += Math.sin(Date.now() * 0.005 + index * 0.1) * 30;
      } else {
        height += Math.sin(Date.now() * 0.002 + index * 0.1) * 5;
      }
      bar.style.height = Math.max(4, height) + 'px';
    });
  }
  animateParticles() {
    const ctx = this.visualizer.ctx;
    if (!ctx) {
      return;
    }
    ctx.clearRect(0, 0, this.visualizer.canvas.width, this.visualizer.canvas.height);
    if (Math.random() < (this.isPlaying ? 0.3 : 0.05)) {
      this.createParticle();
    }
    const accentColor = this._cachedAccentColor || this._readAccentColor();
    this.visualizer.particles = this.visualizer.particles.filter(particle => {
      let speedMultiplier = this.isPlaying ? 1 : 0.3;
      particle.x += particle.vx * speedMultiplier;
      particle.y += particle.vy * speedMultiplier;
      particle.life -= 0.01;
      particle.opacity = particle.life;
      if (particle.life <= 0) {
        return false;
      }
      ctx.save();
      ctx.globalAlpha = particle.opacity * (this.isPlaying ? 0.6 : 0.3);
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return true;
    });
  }
  createParticle() {
    this.visualizer.particles.push({
      x: Math.random() * this.visualizer.canvas.width,
      y: Math.random() * this.visualizer.canvas.height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: Math.random() * 3 + 1,
      life: 1,
      opacity: 1
    });
  }
  destroyVisualizer() {
    this.visualizer.isActive = false;
    if (this.visualizer.animationId) {
      cancelAnimationFrame(this.visualizer.animationId);
    }
  }
  syncVisualizerUI() {
    if (this.elements.visualizerToggle) {
      this.elements.visualizerToggle.checked = this.visualizerEnabled;
    }
    if (this.visualizerEnabled) {
      document.getElementById('musicVisualizer').style.display = 'block';
      this.visualizer.isActive = true;
      if (!this.visualizer.animationId) {
        this.startVisualizer();
      }
    } else {
      document.getElementById('musicVisualizer').style.display = 'none';
      this.visualizer.isActive = false;
      if (this.visualizer.animationId) {
        cancelAnimationFrame(this.visualizer.animationId);
        this.visualizer.animationId = null;
      }
    }
  }
  handleVisualizerToggle(event) {
    const isEnabled = event.target.checked;
    if (isEnabled) {
      this.visualizer.isActive = true;
      document.getElementById('musicVisualizer').style.display = 'block';
      if (!this.visualizer.animationId) {
        this.startVisualizer();
      }
    } else {
      this.visualizer.isActive = false;
      document.getElementById('musicVisualizer').style.display = 'none';
      if (this.visualizer.animationId) {
        cancelAnimationFrame(this.visualizer.animationId);
        this.visualizer.animationId = null;
      }
    }
    this.saveSetting('visualizerEnabled', isEnabled);
  }
  handleAutoMiniplayerToggle(event) {
    this.autoMiniplayerEnabled = event.target.checked;
    this.saveSetting('autoMiniplayerEnabled', this.autoMiniplayerEnabled);
  }
  setupMiniplayerAutoToggle() {
    document.addEventListener('visibilitychange', () => {
      if (!this.autoMiniplayerEnabled) {
        return;
      }
      if (document.hidden) {
        if (!this.miniplayerWindow && this.currentSong) {
          this.openMiniplayer(true);
        }
      } else if (this.miniplayerWindow && this.miniplayerAutoOpened) {
        this.closeMiniplayer();
      }
    });
  }
  toggleMiniplayer() {
    if (this.miniplayerWindow) {
      this.closeMiniplayer();
    } else {
      this.openMiniplayer(false);
    }
  }
  async openMiniplayer(isAuto) {
    if (this.miniplayerWindow) {
      return;
    }
    if (!('documentPictureInPicture' in window)) {
      this.showNotification('Miniplayer requires Chrome or Edge.', 'error');
      return;
    }
    try {
      const pipWindow = await documentPictureInPicture.requestWindow({
        width: 320,
        height: 96
      });
      this.miniplayerWindow = pipWindow;
      this.miniplayerAutoOpened = isAuto;
      this.buildMiniplayerDOM(pipWindow);
      this.updateMiniplayerUI();
      this._miniplayerInterval = setInterval(() => this.updateMiniplayerUI(), 500);
      pipWindow.addEventListener('pagehide', () => this.handleMiniplayerClosed(), {
        once: true
      });
      this.showNotification('Miniplayer on', 'success');
    } catch (err) {
      console.warn('Failed to open miniplayer:', err);
      this.showNotification('Could not open miniplayer.', 'error');
    }
  }
  closeMiniplayer() {
    if (!this.miniplayerWindow) {
      return;
    }
    this.miniplayerWindow.close();
  }
  handleMiniplayerClosed() {
    if (!this.miniplayerWindow) {
      return;
    }
    this.miniplayerWindow = null;
    this._miniplayerEls = null;
    this.miniplayerAutoOpened = false;
    if (this._miniplayerInterval) {
      clearInterval(this._miniplayerInterval);
      this._miniplayerInterval = null;
    }
    this.showNotification('Miniplayer off', 'success');
  }
  buildMiniplayerDOM(pipWindow) {
    const doc = pipWindow.document;
    const cs = getComputedStyle(document.documentElement);
    const varNames = [ '--bg-primary', '--bg-secondary', '--text-primary', '--text-secondary', '--accent-color', '--hover-color', '--border-color' ];
    const varsCss = varNames.map(name => `${name}:${cs.getPropertyValue(name).trim()}`).join(';');
    doc.documentElement.setAttribute('style', varsCss);
    const style = doc.createElement('style');
    style.textContent = `\n\t        * { margin:0; padding:0; box-sizing:border-box; }\n\t        html, body { width:100%; height:100%; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; background: var(--bg-secondary); color: var(--text-primary); overflow:hidden; }\n\t        .mp-body { display:flex; align-items:center; gap:10px; height:100%; padding:10px; }\n\t        .mp-thumb { width:60px; height:60px; border-radius:6px; object-fit:cover; flex-shrink:0; background:var(--bg-primary); }\n\t        .mp-info { flex:1 1 auto; min-width:0; display:flex; flex-direction:column; gap:2px; }\n\t        .mp-name { font-size:13px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }\n\t        .mp-artist { font-size:11px; color:var(--text-secondary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }\n\t        .mp-controls { display:flex; align-items:center; gap:6px; flex-shrink:0; }\n\t        .mp-btn { border:none; background:transparent; color:var(--text-primary); cursor:pointer; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:15px; transition:background .15s; }\n\t        .mp-btn:hover { background:var(--border-color); }\n\t        .mp-play { width:38px; height:38px; background:var(--accent-color); color:#fff; font-size:16px; }\n\t        .mp-play:hover { background:var(--hover-color); }\n\t    `;
    doc.head.appendChild(style);
    const body = doc.createElement('div');
    body.className = 'mp-body';
    body.innerHTML = `\n\t        <img class="mp-thumb" id="mpThumb" alt="">\n\t        <div class="mp-info">\n\t            <div class="mp-name" id="mpName">No Song Playing</div>\n\t            <div class="mp-artist" id="mpArtist"></div>\n\t        </div>\n\t        <div class="mp-controls">\n\t            <button class="mp-btn" id="mpPrev" title="Previous" aria-label="Previous">⏮</button>\n\t            <button class="mp-btn mp-play" id="mpPlayPause" title="Play/Pause" aria-label="Play/Pause">▶</button>\n\t            <button class="mp-btn" id="mpNext" title="Next" aria-label="Next">⏭</button>\n\t        </div>\n\t    `;
    doc.body.appendChild(body);
    doc.getElementById('mpPrev').addEventListener('click', () => this.playPreviousSong());
    doc.getElementById('mpPlayPause').addEventListener('click', () => this.togglePlayPause());
    doc.getElementById('mpNext').addEventListener('click', () => this.playNextSong());
    this._miniplayerEls = {
      thumb: doc.getElementById('mpThumb'),
      name: doc.getElementById('mpName'),
      artist: doc.getElementById('mpArtist'),
      playPauseBtn: doc.getElementById('mpPlayPause')
    };
  }
  updateMiniplayerUI() {
    if (!this._miniplayerEls) {
      return;
    }
    const thumb = document.getElementById('currentSongThumbnail');
    const name = document.getElementById('currentSongName');
    const author = document.getElementById('currentSongAuthor');
    if (thumb && thumb.src) {
      this._miniplayerEls.thumb.src = thumb.src;
    }
    this._miniplayerEls.name.textContent = name?.textContent || 'No Song Playing';
    this._miniplayerEls.artist.textContent = author?.textContent || '';
    const isPlaying = this.isLocalPlayback && this.localAudio ? !this.localAudio.paused : this.isPlaying;
    this._miniplayerEls.playPauseBtn.textContent = isPlaying ? '⏸' : '▶';
  }
  initSupabaseForFindSongs() {
    if (!this.supabase) {
      const supabaseUrl = 'https://cwhxanbpymkngzpbsshh.supabase.co';
      const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3aHhhbmJweW1rbmd6cGJzc2hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4NTQzMTksImV4cCI6MjA2OTQzMDMxOX0.6K3eM1XoWaPmyMHsLYgw0mAnSxYjME4clflL4PxQalQ';
      this.supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    }
  }
  initGlobalLibraryDebouncedSearch() {
    this.initSupabaseForFindSongs();
    this.globalLibrarySearchDebounceTimer = null;
    this.globalLibrarySearchAbortController = null;
    this.globalLibraryCurrentArtistContext = null;
    this.globalLibraryCurrentDetailContext = null;
    const bar = document.getElementById('globalLibraryDebouncedSearchBar');
    if (!bar) {
      return;
    }
    bar.addEventListener('input', e => this.handleGlobalLibraryDebouncedSearchInput(e));
    bar.addEventListener('focus', () => {
      if (bar.value.trim().length >= 2) {
        document.getElementById('globalLibrarySearchSuggestionsDropdown')?.classList.add('visible');
      }
    });
    document.addEventListener('click', e => {
      const dropdown = document.getElementById('globalLibrarySearchSuggestionsDropdown');
      if (!dropdown) {
        return;
      }
      if (!dropdown.contains(e.target) && e.target !== bar) {
        this.closeGlobalLibrarySearchSuggestionsDropdown();
      }
    });
  }
  handleGlobalLibraryDebouncedSearchInput(event) {
    const query = event.target.value.trim();
    clearTimeout(this.globalLibrarySearchDebounceTimer);
    if (query.length < 2) {
      this.closeGlobalLibrarySearchSuggestionsDropdown();
      return;
    }
    this.renderGlobalLibrarySearchSuggestionsDropdownLoading();
    this.globalLibrarySearchDebounceTimer = setTimeout(() => {
      this.executeGlobalLibraryCatalogSearch(query);
    }, 350);
  }
  async executeGlobalLibraryCatalogSearch(query) {
    if (this.globalLibrarySearchAbortController) {
      this.globalLibrarySearchAbortController.abort();
    }
    this.globalLibrarySearchAbortController = new AbortController();
    const signal = this.globalLibrarySearchAbortController.signal;
    try {
      const [deezerResult, playlistResults] = await Promise.all([ fetch(`/api/deezer?type=search&query=${encodeURIComponent(query)}&limit=8`, {
        signal: signal
      }).then(r => r.json()).catch(() => null), this.searchPremadePlaylistsSupabase(query).catch(() => []) ]);
      if (signal.aborted) {
        return;
      }
      const tracks = deezerResult && deezerResult.data && deezerResult.data.data || [];
      const seenArtistIds = new Set();
      const artists = [];
      tracks.forEach(t => {
        if (t.artist && !seenArtistIds.has(t.artist.id)) {
          seenArtistIds.add(t.artist.id);
          artists.push(t.artist);
        }
      });
      this.renderGlobalLibrarySearchSuggestionsDropdown({
        tracks: tracks.slice(0, 6),
        artists: artists.slice(0, 4),
        playlists: playlistResults
      });
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Global library search failed:', error);
        this.renderGlobalLibrarySearchSuggestionsDropdownError();
      }
    }
  }
  async searchPremadePlaylistsSupabase(query) {
    if (!this.supabase) {
      this.initSupabaseForFindSongs();
    }
    const {data: data, error: error} = await this.supabase.from('premade_playlists').select('id, name').ilike('name', `%${query}%`).limit(3);
    if (error) {
      throw error;
    }
    return data || [];
  }
  renderGlobalLibrarySearchSuggestionsDropdownLoading() {
    const dropdown = document.getElementById('globalLibrarySearchSuggestionsDropdown');
    if (!dropdown) {
      return;
    }
    dropdown.classList.add('visible');
    dropdown.innerHTML = '<div class="global-library-suggestions-loading">Searching…</div>';
  }
  renderGlobalLibrarySearchSuggestionsDropdownError() {
    const dropdown = document.getElementById('globalLibrarySearchSuggestionsDropdown');
    if (!dropdown) {
      return;
    }
    dropdown.innerHTML = '<div class="global-library-suggestions-loading">Search unavailable — try again</div>';
  }
  renderGlobalLibrarySearchSuggestionsDropdown({tracks: tracks, artists: artists, playlists: playlists}) {
    const dropdown = document.getElementById('globalLibrarySearchSuggestionsDropdown');
    if (!dropdown) {
      return;
    }
    if (tracks.length === 0 && artists.length === 0 && playlists.length === 0) {
      dropdown.innerHTML = '<div class="global-library-suggestions-loading">No results found</div>';
      dropdown.classList.add('visible');
      return;
    }
    let html = '';
    if (artists.length > 0) {
      html += `<div class="global-library-suggestions-section-label">Artists</div>`;
      html += artists.map(a => `\n\t            <div class="global-library-suggestion-artist-card" data-artist-id="${a.id}" data-artist-name="${a.name.replace(/"/g, '&quot;')}">\n\t                <img src="${a.picture_medium || a.picture}" alt="" class="global-library-suggestion-artist-thumb" loading="lazy">\n\t                <div class="global-library-suggestion-artist-name">${a.name}</div>\n\t            </div>\n\t        `).join('');
    }
    if (tracks.length > 0) {
      html += `<div class="global-library-suggestions-section-label">Songs</div>`;
      html += tracks.map(t => `\n\t            <div class="global-library-suggestion-track-card"\n\t                 data-song-name="${t.title.replace(/"/g, '&quot;')}"\n\t                 data-artist-name="${t.artist.name.replace(/"/g, '&quot;')}"\n\t                 data-album-cover="${t.album?.cover_medium || ''}"\n\t                 data-deezer-track-id="${t.id}">\n\t                <img src="${t.album?.cover_medium || ''}" alt="" class="global-library-suggestion-track-thumb" loading="lazy">\n\t                <div class="global-library-suggestion-track-meta">\n\t                    <div class="global-library-suggestion-track-title">${t.title}</div>\n\t                    <div class="global-library-suggestion-track-artist">${t.artist.name}</div>\n\t                </div>\n\t            </div>\n\t        `).join('');
    }
    if (playlists.length > 0) {
      html += `<div class="global-library-suggestions-section-label">Playlists</div>`;
      html += playlists.map(p => `\n\t            <div class="global-library-suggestion-playlist-card" data-playlist-id="${p.id}" data-playlist-name="${p.name.replace(/"/g, '&quot;')}">\n\t                <div class="global-library-suggestion-playlist-icon">🎶</div>\n\t                <div class="global-library-suggestion-track-title">${p.name}</div>\n\t            </div>\n\t        `).join('');
    }
    dropdown.innerHTML = html;
    dropdown.classList.add('visible');
    dropdown.querySelectorAll('.global-library-suggestion-artist-card').forEach(el => {
      el.addEventListener('click', () => this.handleGlobalLibraryArtistCardClick({
        id: el.dataset.artistId,
        name: el.dataset.artistName
      }));
    });
    dropdown.querySelectorAll('.global-library-suggestion-track-card').forEach(el => {
      el.addEventListener('click', () => this.handleGlobalLibrarySongCardClick({
        name: el.dataset.songName,
        artist: el.dataset.artistName,
        albumCover: el.dataset.albumCover,
        deezerTrackId: el.dataset.deezerTrackId,
        sourceContext: 'root'
      }));
    });
    dropdown.querySelectorAll('.global-library-suggestion-playlist-card').forEach(el => {
      el.addEventListener('click', () => this.addPremadePlaylistToLocalLibrary(el.dataset.playlistId, el.dataset.playlistName));
    });
  }
  closeGlobalLibrarySearchSuggestionsDropdown() {
    const dropdown = document.getElementById('globalLibrarySearchSuggestionsDropdown');
    if (dropdown) {
      dropdown.classList.remove('visible');
      dropdown.innerHTML = '';
    }
  }
  async handleGlobalLibraryArtistCardClick(artist) {
    this.closeGlobalLibrarySearchSuggestionsDropdown();
    this.globalLibraryCurrentArtistContext = {
      id: artist.id,
      name: artist.name,
      index: 0,
      songs: []
    };
    await this.renderGlobalLibraryArtistSongsGrid();
  }
  async renderGlobalLibraryArtistSongsGrid(appendMode = false) {
    const ctx = this.globalLibraryCurrentArtistContext;
    if (!ctx) {
      return;
    }
    const container = document.getElementById('globalLibraryArtistSongsGrid');
    if (!container) {
      return;
    }
    container.classList.add('visible');
    if (!appendMode) {
      container.innerHTML = `\n\t            <div class="global-library-artist-grid-header">\n\t                <button id="globalLibraryArtistGridBackBtn" class="global-library-artist-grid-back-btn">← Back</button>\n\t                <h3>${ctx.name}</h3>\n\t            </div>\n\t            <div id="globalLibraryArtistGridSongsList" class="global-library-artist-grid-songs-list"></div>\n\t            <button id="globalLibraryArtistGridLoadMoreBtn" class="global-library-artist-grid-load-more-btn" style="display:none;">Load more</button>\n\t        `;
      document.getElementById('globalLibraryArtistGridBackBtn').addEventListener('click', () => this.closeGlobalLibraryArtistSongsGrid());
      document.getElementById('globalLibraryArtistGridLoadMoreBtn').addEventListener('click', () => this.loadMoreGlobalLibraryArtistSongs());
    }
    const listEl = document.getElementById('globalLibraryArtistGridSongsList');
    listEl.insertAdjacentHTML('beforeend', '<div class="global-library-suggestions-loading" id="globalLibraryArtistGridSpinner">Loading songs…</div>');
    try {
      const res = await fetch(`/api/deezer?type=artist_top&artistId=${encodeURIComponent(ctx.id)}&index=${ctx.index}&limit=25`);
      const result = await res.json();
      document.getElementById('globalLibraryArtistGridSpinner')?.remove();
      const tracks = result.data && result.data.data || [];
      ctx.songs.push(...tracks);
      listEl.insertAdjacentHTML('beforeend', tracks.map(t => `\n\t            <div class="global-library-artist-grid-song-row"\n\t                 data-song-name="${t.title.replace(/"/g, '&quot;')}"\n\t                 data-artist-name="${ctx.name.replace(/"/g, '&quot;')}"\n\t                 data-album-cover="${t.album?.cover_medium || ''}">\n\t                <img src="${t.album?.cover_medium || ''}" alt="" class="global-library-artist-grid-song-thumb" loading="lazy">\n\t                <div class="global-library-artist-grid-song-title">${t.title}</div>\n\t            </div>\n\t        `).join(''));
      listEl.querySelectorAll('.global-library-artist-grid-song-row:not([data-bound])').forEach(el => {
        el.setAttribute('data-bound', 'true');
        el.addEventListener('click', () => this.handleGlobalLibrarySongCardClick({
          name: el.dataset.songName,
          artist: el.dataset.artistName,
          albumCover: el.dataset.albumCover,
          sourceContext: 'artist'
        }));
      });
      const loadMoreBtn = document.getElementById('globalLibraryArtistGridLoadMoreBtn');
      loadMoreBtn.style.display = tracks.length === 25 && ctx.index + 25 < 50 ? 'block' : 'none';
    } catch (error) {
      document.getElementById('globalLibraryArtistGridSpinner')?.remove();
      listEl.insertAdjacentHTML('beforeend', '<div class="global-library-suggestions-loading">Couldn\'t load songs — try again</div>');
      console.error('Artist songs fetch failed:', error);
    }
  }
  loadMoreGlobalLibraryArtistSongs() {
    if (!this.globalLibraryCurrentArtistContext) {
      return;
    }
    this.globalLibraryCurrentArtistContext.index += 25;
    this.renderGlobalLibraryArtistSongsGrid(true);
  }
  closeGlobalLibraryArtistSongsGrid() {
    this.globalLibraryCurrentArtistContext = null;
    const container = document.getElementById('globalLibraryArtistSongsGrid');
    if (container) {
      container.classList.remove('visible');
      container.innerHTML = '';
    }
  }
  async handleGlobalLibrarySongCardClick(song) {
    this.closeGlobalLibrarySearchSuggestionsDropdown();
    this.globalLibraryCurrentDetailContext = song.sourceContext || 'root';
    this.renderGlobalLibrarySongDetailCardLoading(song);
    try {
      const resolved = await this.resolveGlobalLibrarySongYouTubeId(song.name, song.artist);
      this.renderGlobalLibrarySongDetailCard(resolved, song.albumCover);
    } catch (error) {
      console.error('Song resolution failed:', error);
      this.renderGlobalLibrarySongDetailCardError();
    }
  }
  renderGlobalLibrarySongDetailCardLoading(song) {
    const card = document.getElementById('globalLibrarySongDetailCard');
    if (!card) {
      return;
    }
    card.classList.add('visible');
    card.innerHTML = `\n\t        <button id="globalLibrarySongDetailCloseBtn" class="global-library-song-detail-close-btn">×</button>\n\t        <div class="global-library-song-detail-loading">\n\t            <img src="${song.albumCover || ''}" alt="" class="global-library-song-detail-thumb-placeholder">\n\t            <div>Finding "${song.name}"…</div>\n\t        </div>\n\t    `;
    document.getElementById('globalLibrarySongDetailCloseBtn').addEventListener('click', () => this.closeGlobalLibrarySongDetailCard());
  }
  renderGlobalLibrarySongDetailCardError() {
    const card = document.getElementById('globalLibrarySongDetailCard');
    if (!card) {
      return;
    }
    card.innerHTML = `\n\t        <button id="globalLibrarySongDetailCloseBtn" class="global-library-song-detail-close-btn">×</button>\n\t        <div class="global-library-song-detail-loading">Couldn't find a match — try another search</div>\n\t    `;
    document.getElementById('globalLibrarySongDetailCloseBtn').addEventListener('click', () => this.closeGlobalLibrarySongDetailCard());
  }
  renderGlobalLibrarySongDetailCard(songRow) {
    const card = document.getElementById('globalLibrarySongDetailCard');
    if (!card) {
      return;
    }
    const thumbUrl = `https://i.ytimg.com/vi/${songRow.yt_id}/hqdefault.jpg`;
    const viewsText = songRow.view_count ? `${Number(songRow.view_count).toLocaleString()} views` : 'View count unavailable';
    const dateText = songRow.published_at ? new Date(songRow.published_at).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : 'Date unavailable';
    card.innerHTML = `\n\t        <button id="globalLibrarySongDetailCloseBtn" class="global-library-song-detail-close-btn">×</button>\n\t        <img src="${thumbUrl}" alt="" class="global-library-song-detail-thumb">\n\t        <div class="global-library-song-detail-info">\n\t            <div class="global-library-song-detail-title">${songRow.name}</div>\n\t            <div class="global-library-song-detail-artist">${songRow.artist}</div>\n\t            <div class="global-library-song-detail-meta">${viewsText} · ${dateText}</div>\n\t        </div>\n\t        <div class="global-library-song-detail-actions">\n\t\t\t    <button id="globalLibrarySongDetailListenBtn" class="listen-temp-song-btn" title="Preview this song">▶ Listen</button>\n\t\t\t    <button id="globalLibrarySongDetailAddBtn" class="global-library-song-detail-add-btn">+ Add to local library</button>\n\t\t\t</div>\n\t    `;
    document.getElementById('globalLibrarySongDetailCloseBtn').addEventListener('click', () => this.closeGlobalLibrarySongDetailCard());
    document.getElementById('globalLibrarySongDetailAddBtn').addEventListener('click', () => this.populateAddSongToLibraryModalFromGlobalLibrary(songRow));
    document.getElementById('globalLibrarySongDetailListenBtn').addEventListener('click', () => this.samplePlayTemporarySong(`https://www.youtube.com/watch?v=${songRow.yt_id}`));
  }
  closeGlobalLibrarySongDetailCard() {
    const card = document.getElementById('globalLibrarySongDetailCard');
    if (card) {
      card.classList.remove('visible');
      card.innerHTML = '';
    }
    this.globalLibraryCurrentDetailContext = null;
  }
  normalizeGlobalLibrarySearchKey(name, artist) {
    return `${name.trim().toLowerCase()}::${(artist || '').trim().toLowerCase()}`;
  }
  async resolveGlobalLibrarySongYouTubeId(songName, artistName) {
    if (!this.supabase) {
      this.initSupabaseForFindSongs();
    }
    const searchKey = this.normalizeGlobalLibrarySearchKey(songName, artistName);
    const cached = await this.checkGlobalSongCacheSupabase(searchKey);
    if (cached) {
      return cached;
    }
    const resolvedFromYouTube = await this.fetchGlobalLibrarySongFromYouTube(songName, artistName);
    const saved = await this.insertGlobalSongCacheSupabase({
      search_key: searchKey,
      name: songName,
      artist: artistName,
      yt_id: resolvedFromYouTube.yt_id,
      view_count: resolvedFromYouTube.view_count,
      published_at: resolvedFromYouTube.published_at
    });
    return saved;
  }
  async checkGlobalSongCacheSupabase(searchKey) {
    const {data: data, error: error} = await this.supabase.from('global_song_cache').select('*').eq('search_key', searchKey).maybeSingle();
    if (error) {
      throw error;
    }
    return data || null;
  }
  async insertGlobalSongCacheSupabase(payload) {
    const {data: data, error: error} = await this.supabase.from('global_song_cache').upsert([ payload ], {
      onConflict: 'search_key',
      ignoreDuplicates: false
    }).select('*').single();
    if (error) {
      throw error;
    }
    return data;
  }
  async fetchGlobalLibrarySongFromYouTube(songName, artistName) {
    const topicQuery = `${songName} ${artistName} "topic"`;
    let items = await this.runGlobalLibraryYouTubeSearch(topicQuery);
    if (items.length === 0) {
      const plainQuery = `${songName} ${artistName}`;
      items = await this.runGlobalLibraryYouTubeSearch(plainQuery);
    }
    if (items.length === 0) {
      throw new Error('No YouTube match found for this song');
    }
    const item = items[0];
    return {
      yt_id: item.id.videoId,
      view_count: item.statistics ? parseInt(item.statistics.viewCount, 10) : null,
      published_at: item.snippet?.publishedAt ? item.snippet.publishedAt.slice(0, 10) : null
    };
  }
  async runGlobalLibraryYouTubeSearch(query) {
    const MAX_RETRIES = 5;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const keyIndex = this.getRandomYouTubeApiKey();
      try {
        const url = `/api/youtube?query=${encodeURIComponent(query)}&maxResults=1&type=combined&keyIndex=${keyIndex}`;
        const response = await fetch(url);
        const result = await response.json();
        if (result.status !== 200) {
          if (result.status === 403) {
            console.warn(`API key index ${keyIndex} quota exceeded, retrying with a different key`);
            continue;
          }
          throw new Error(`YouTube API error: ${result.status}`);
        }
        return result.data.items || [];
      } catch (error) {
        console.error(`Global library YouTube search attempt ${attempt + 1} failed:`, error);
      }
    }
    throw new Error('Unable to resolve song after multiple attempts');
  }
  getRandomYouTubeApiKey() {
    return Math.floor(Math.random() * this.YOUTUBE_API_KEYS_COUNT);
  }
  populateAddSongToLibraryModalFromGlobalLibrary(songRow) {
    this.elements.songNameInput.value = songRow.name;
    this.elements.songAuthorInput.value = songRow.artist;
    this.elements.songUrlInput.value = `https://www.youtube.com/watch?v=${songRow.yt_id}`;
    this.onLibraryModalCloseCallback = () => this.returnToGlobalLibraryPreviousView();
    this.closeGlobalLibrarySongDetailCard();
    this.openLibraryModal();
  }
  returnToGlobalLibraryPreviousView() {
    if (this.globalLibraryCurrentArtistContext) {
      document.getElementById('globalLibraryArtistSongsGrid')?.classList.add('visible');
    }
  }
  async addPremadePlaylistToLocalLibrary(playlistId, playlistName) {
    try {
      const {data: data, error: error} = await this.supabase.from('premade_playlist_songs').select(`position, global_song_cache(name, artist, yt_id)`).eq('playlist_id', playlistId).order('position', {
        ascending: true
      });
      if (error) {
        throw error;
      }
      const importText = data.map(row => `${row.global_song_cache.name},https://www.youtube.com/watch?v=${row.global_song_cache.yt_id},${row.global_song_cache.artist || ''}`).join('\n');
      const playlistImportText = `${playlistName}{\n${importText}\n}`;
      this.importLibrary(playlistImportText);
      this.closeGlobalLibrarySearchSuggestionsDropdown();
    } catch (error) {
      console.error('Error adding premade playlist to library:', error);
      alert('Error adding playlist to library');
    }
  }
  async openFindSongs() {
    if (!this.supabase) {
      this.initSupabaseForFindSongs();
    }
    this.elements.findSongsDiv.style.display = 'flex';
    document.getElementById('globalLibraryDebouncedSearchBar')?.focus();
    await this.loadRecommendations();
  }
  closeFindSongs() {
    this.elements.findSongsDiv.style.display = 'none';
    document.getElementById('globalLibraryDebouncedSearchBar').value = '';
    this.closeGlobalLibrarySearchSuggestionsDropdown();
    this.closeGlobalLibrarySongDetailCard();
    this.closeGlobalLibraryArtistSongsGrid();
  }
  async loadRecommendations() {
    await this.loadBillboardHot100Top3();
    await this.loadRandomRecommendations();
  }
  async loadRandomRecommendations() {
    try {
      const {data: randomSongs, error: error} = await this.supabase.from('songs').select('id, name, artist, yt_id').limit(100);
      if (error) {
        throw error;
      }
      const shuffled = randomSongs.sort(() => 0.5 - Math.random());
      const selectedSongs = shuffled.slice(0, 3);
      this.displayRandomRecommendations(selectedSongs);
    } catch (error) {
      console.error('Error loading random recommendations:', error);
      document.getElementById('randomSongsContainer').innerHTML = '<div style="color: var(--text-secondary); font-size: 12px;">Unable to load recommendations</div>';
    }
  }
  displayRandomRecommendations(songs) {
    const container = document.getElementById('randomSongsContainer');
    if (!songs || songs.length === 0) {
      container.innerHTML = '<div style="color: var(--text-secondary); font-size: 12px;">No recommendations available</div>';
      return;
    }
    container.innerHTML = songs.map(song => {
      const youtubeUrl = `https://www.youtube.com/watch?v=${song.yt_id}`;
      const thumbnailUrl = `https://img.youtube.com/vi/${song.yt_id}/mqdefault.jpg`;
      return `\n\t            <div class="recommendation-song-item" onclick="musicPlayer.samplePlayTemporarySong('${youtubeUrl}')" style="cursor: pointer;" title="Click to preview">\n\t                <img src="${thumbnailUrl}" \n\t                     alt="Thumbnail" \n\t                     class="song-thumbnail" \n\t                     onerror="this.src='data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='30' viewBox='0 0 40 30'%3E%3Crect fill='%23ddd' width='40' height='30'/%3E%3Ctext x='20' y='18' text-anchor='middle' font-size='8' fill='%23666'%3E♪%3C/text%3E%3C/svg%3E'">\n\t                <div class="recommendation-song-info">\n\t                    <div class="recommendation-song-name">${song.name}</div>\n\t                    <div class="recommendation-song-author">by ${song.artist || 'Unknown'}</div>\n\t                </div>\n\t            </div>\n\t        `;
    }).join('');
  }
  async loadBillboardHot100Top3() {
    try {
      const {data: top3Songs, error: error} = await this.supabase.from('billboard_top_3').select('*').order('position');
      if (error) {
        throw error;
      }
      this.displayBillboardHot100Top3(top3Songs || []);
    } catch (error) {
      console.error('Error loading Billboard Hot 100 top 3:', error);
      document.getElementById('topSongsContainer').innerHTML = '<div style="color: var(--text-secondary); font-size: 12px;">Unable to load Billboard Hot 100</div>';
    }
  }
  displayBillboardHot100Top3(top3Songs) {
    const container = document.getElementById('topSongsContainer');
    if (!top3Songs || top3Songs.length === 0) {
      container.innerHTML = '<div style="color: var(--text-secondary); font-size: 12px;">No Billboard Hot 100 data available</div>';
      document.getElementById('billboardLastUpdated').innerHTML = '';
      return;
    }
    if (top3Songs[0]?.last_updated) {
      const lastUpdated = new Date(top3Songs[0].last_updated);
      const timeAgo = this.getTimeAgo(lastUpdated);
      document.getElementById('billboardLastUpdated').innerHTML = `Updated ${timeAgo} • <a href="https://www.billboard.com/charts/hot-100/" target="_blank" style="color: var(--accent-color); text-decoration: none;">View Official Chart</a>`;
    }
    container.innerHTML = top3Songs.map(song => {
      const thumbnailUrl = this.getYouTubeThumbnail(song.youtube_url);
      return `\n            <div class="recommendation-song-item" onclick="musicPlayer.samplePlayTemporarySong('${song.youtube_url}')" style="cursor: pointer;" title="Click to preview">\n                <img src="${thumbnailUrl}" \n                     alt="Thumbnail" \n                     class="song-thumbnail" \n                     onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'40\\' height=\\'30\\' viewBox=\\'0 0 40 30\\'%3E%3Crect fill=\\'%23ddd\\' width=\\'40\\' height=\\'30\\'/%3E%3Ctext x=\\'20\\' y=\\'18\\' text-anchor=\\'middle\\' font-size=\\'8\\' fill=\\'%23666\\'%3E♪%3C/text%3E%3C/svg%3E'">\n                <div class="recommendation-song-info">\n                    <div class="recommendation-song-name">${song.song}</div>\n                    <div class="recommendation-song-author">by ${song.artist}</div>\n                </div>\n            </div>\n        `;
    }).join('');
  }
  getTimeAgo(date) {
    const now = new Date();
    const updateTime = new Date(date);
    const seconds = Math.floor((now - updateTime) / 1e3);
    if (seconds < 10) {
      return 'just now';
    }
    const intervals = {
      year: 31536e3,
      month: 2592e3,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
      }
    }
    return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
  }
  async openBillboardHot100Modal() {
    try {
      const {data: allSongs, error: error} = await this.supabase.from('billboard_hot_100').select('*').order('this_week');
      if (error) {
        throw error;
      }
      this.displayBillboardHot100FullModal(allSongs || []);
    } catch (error) {
      console.error('Error loading full Billboard Hot 100:', error);
      alert('Error loading Billboard Hot 100 chart');
    }
  }
  displayBillboardHot100FullModal(songs) {
    const modal = document.createElement('div');
    modal.className = 'billboard-hot-100-modal';
    modal.id = 'billboardHot100Modal';
    modal.innerHTML = `\n        <div class="billboard-modal-content">\n            <div class="billboard-modal-header">\n                <h2>Billboard Hot 100</h2>\n                <button class="billboard-close-btn" onclick="musicPlayer.closeBillboardHot100Modal()">×</button>\n            </div>\n            <div class="billboard-songs-container">\n                ${songs.map(song => this.createBillboardSongElementInModal(song)).join('')}\n            </div>\n        </div>\n    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => {
      if (e.target === modal) {
        this.closeBillboardHot100Modal();
      }
    });
  }
  createBillboardSongElementInModal(song) {
    const isRising = song.last_week && song.last_week > song.this_week;
    const isFalling = song.last_week && song.last_week < song.this_week;
    const isNew = !song.last_week || song.weeks_on_chart === 1;
    const isSteady = song.last_week === song.this_week;
    const isPeakPosition = song.this_week === song.peak_position;
    let movementIndicator = '';
    let movementClass = '';
    if (isNew) {
      movementIndicator = '<span class="billboard-new-badge">NEW</span>';
      movementClass = 'billboard-new';
    } else if (isRising) {
      const movement = song.last_week - song.this_week;
      movementIndicator = `<span class="billboard-rising">▲ ${movement}</span>`;
      movementClass = 'billboard-rising-item';
    } else if (isFalling) {
      const movement = song.this_week - song.last_week;
      movementIndicator = `<span class="billboard-falling">▼ ${movement}</span>`;
      movementClass = 'billboard-falling-item';
    } else if (isSteady) {
      movementIndicator = '<span class="billboard-steady">—</span>';
      movementClass = 'billboard-steady-item';
    }
    const thumbnailUrl = this.getYouTubeThumbnail(song.youtube_url);
    return `\n        <div class="billboard-song-item ${movementClass}">\n            <div class="billboard-position-badge ${isPeakPosition ? 'billboard-peak' : ''}">#${song.this_week}</div>\n            <img src="${thumbnailUrl}" \n                 alt="${song.song}" \n                 class="billboard-song-thumbnail"\n                 onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\'%3E%3Crect fill=\\'%23ddd\\' width=\\'60\\' height=\\'60\\'/%3E%3Ctext x=\\'30\\' y=\\'35\\' text-anchor=\\'middle\\' font-size=\\'14\\' fill=\\'%23666\\'%3E♪%3C/text%3E%3C/svg%3E'">\n            <div class="billboard-song-details">\n                <div class="billboard-song-title">${song.song}</div>\n                <div class="billboard-song-artist">${song.artist}</div>\n                <div class="billboard-song-stats">\n                    <span class="billboard-stat">Peak: #${song.peak_position}</span>\n                    <span class="billboard-stat">Weeks: ${song.weeks_on_chart}</span>\n                    ${song.last_week ? `<span class="billboard-stat">Last: #${song.last_week}</span>` : ''}\n                </div>\n            </div>\n            <div class="billboard-song-actions">\n                ${movementIndicator}\n                <button class="billboard-add-btn" \n                        onclick="musicPlayer.addBillboardSongToLibrary('${song.song.replace(/'/g, "\\'")}', '${song.artist.replace(/'/g, "\\'")}', '${song.youtube_url}')"\n                        title="Add to Library">+ Add</button>\n                <button class="billboard-play-btn" \n\t\t\t\t        onclick="musicPlayer.samplePlayTemporarySong('${song.youtube_url}')"\n\t\t\t\t        title="Preview song">▶</button>\n            </div>\n        </div>\n    `;
  }
  async addBillboardSongToLibrary(songName, artist, youtubeUrl) {
    const videoId = this.extractYouTubeId(youtubeUrl);
    if (!videoId) {
      this.showNotification('Invalid YouTube URL', 'error');
      return;
    }
    if (this.songLibrary.some(song => song.videoId === videoId)) {
      this.showNotification('This song is already in your library', 'error');
      return;
    }
    const newSong = {
      id: Date.now(),
      name: songName,
      author: artist,
      videoId: videoId,
      favorite: false
    };
    this.songLibrary.push(newSong);
    try {
      await this.saveSongLibrary();
      this.renderSongLibrary();
      this.updatePlaylistSelection();
      this.showNotification(`Added "${songName}" to library!`, 'success');
    } catch (error) {
      console.error('Error adding song to library:', error);
      this.showNotification('Failed to save song. Please try again.', 'error');
    }
  }
  closeBillboardHot100Modal() {
    const modal = document.getElementById('billboardHot100Modal');
    if (modal) {
      modal.remove();
    }
  }
  getYouTubeThumbnail(youtubeUrl) {
    const videoId = this.extractYouTubeId(youtubeUrl);
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '';
  }
  async refreshRandomRecommendations() {
    await this.loadRandomRecommendations();
  }
  async searchYouTubeForLibraryMatches(searchTerm, pageToken = null) {
    const maxResults = 5;
    const effectiveSearchTerm = this.topicKeywordEnabled ? `${searchTerm} "topic"` : searchTerm;
    const MAX_RETRIES = 5;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const keyIndex = this.getRandomYouTubeApiKey();
      try {
        let url = `/api/youtube?query=${encodeURIComponent(effectiveSearchTerm)}&maxResults=${maxResults}&type=combined&keyIndex=${keyIndex}`;
        if (pageToken) {
          url += `&pageToken=${encodeURIComponent(pageToken)}`;
        }
        const response = await fetch(url);
        const result = await response.json();
        if (result.status !== 200) {
          if (result.status === 403) {
            console.warn(`API key index ${keyIndex} quota exceeded, retrying with a different key`);
            continue;
          }
          throw new Error(`YouTube API error: ${result.status}`);
        }
        const data = result.data;
        if (data.error && data.error.code === 403) {
          console.warn(`API key index ${keyIndex} quota exceeded, retrying with a different key`);
          continue;
        }
        return {
          items: data.items || [],
          nextPageToken: data.nextPageToken || null
        };
      } catch (error) {
        console.error(`YouTube API attempt ${attempt + 1} failed:`, error);
      }
    }
    throw new Error('Unable to complete search after multiple attempts — please try again shortly');
  }
  renderYouTubeLibrarySearchResults(results, searchTerm, nextPageToken = null) {
    this.currentLibrarySearchTerm = searchTerm;
    this.currentLibraryNextPageToken = nextPageToken;
    const fragment = document.createDocumentFragment();
    const youtubeResultsContainer = document.createElement('div');
    youtubeResultsContainer.classList.add('youtube-library-results');
    results.forEach(video => {
      const card = this.createYouTubeLibraryResultCard(video);
      youtubeResultsContainer.appendChild(card);
    });
    fragment.appendChild(youtubeResultsContainer);
    if (nextPageToken) {
      const loadMoreBtn = document.createElement('button');
      loadMoreBtn.id = 'loadMoreYouTubeBtn';
      loadMoreBtn.className = 'load-more-youtube-btn';
      loadMoreBtn.textContent = 'Load more results';
      loadMoreBtn.addEventListener('click', () => this.loadMoreYouTubeLibraryResults());
      fragment.appendChild(loadMoreBtn);
    }
    this.elements.songLibrary.innerHTML = '';
    this.elements.songLibrary.appendChild(fragment);
    this.showYouTubeSearchSuggestion(searchTerm);
  }
  async loadMoreYouTubeLibraryResults() {
    if (!this.currentLibraryNextPageToken || !this.currentLibrarySearchTerm) {
      return;
    }
    const btn = document.getElementById('loadMoreYouTubeBtn');
    if (btn) {
      btn.textContent = 'Loading...';
      btn.disabled = true;
    }
    try {
      const {items: items, nextPageToken: nextPageToken} = await this.searchYouTubeForLibraryMatches(this.currentLibrarySearchTerm, this.currentLibraryNextPageToken);
      this.currentLibraryNextPageToken = nextPageToken;
      const container = this.elements.songLibrary.querySelector('.youtube-library-results');
      items.forEach(video => {
        const card = this.createYouTubeLibraryResultCard(video);
        container.appendChild(card);
      });
      if (nextPageToken) {
        btn.textContent = 'Load more results';
        btn.disabled = false;
      } else {
        btn?.remove();
      }
    } catch (error) {
      console.error('Failed to load more results:', error);
      if (btn) {
        btn.textContent = 'Load more results';
        btn.disabled = false;
      }
    }
  }
  createYouTubeLibraryResultCard(video) {
    const videoId = video.id.videoId;
    const title = video.snippet.title;
    const channel = video.snippet.channelTitle;
    const publishedAt = new Date(video.snippet.publishedAt);
    const thumbnail = video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium.url;
    const uploadDate = this.formatYouTubeUploadDate(publishedAt);
    const viewCount = video.statistics?.viewCount ? this.formatYouTubeViewCount(parseInt(video.statistics.viewCount)) : null;
    const meta = viewCount ? `${viewCount} • ${uploadDate}` : uploadDate;
    const card = document.createElement('div');
    card.classList.add('youtube-library-result-card');
    card.innerHTML = `\n        <img src="${thumbnail}" alt="${this.escapeHtml(title)}" class="youtube-result-thumbnail">\n        <div class="youtube-result-info">\n            <div class="youtube-result-title">${this.decodeHtmlEntities(title)}</div>\n            <div class="youtube-result-channel">${this.decodeHtmlEntities(channel)}</div>\n            <div class="youtube-result-meta">${meta}</div>\n        </div>\n        <div class="youtube-result-actions">\n            <button class="youtube-result-preview-btn" data-video-id="${videoId}" title="Preview">\n                <i class="fas fa-play"></i> Preview\n            </button>\n            <button class="youtube-result-add-btn" data-video-id="${videoId}" data-title="${this.escapeHtml(title)}" data-channel="${this.escapeHtml(channel)}">\n                <i class="fas fa-plus"></i> Add\n            </button>\n        </div>\n    `;
    return card;
  }
  setupYouTubeLibraryResultsDelegation() {
    this.elements.songLibrary.addEventListener('click', e => {
      const previewBtn = e.target.closest('.youtube-result-preview-btn');
      if (previewBtn) {
        const videoId = previewBtn.dataset.videoId;
        const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
        this.samplePlayTemporarySong(youtubeUrl);
        return;
      }
      const addBtn = e.target.closest('.youtube-result-add-btn');
      if (!addBtn) {
        return;
      }
      const videoId = addBtn.dataset.videoId;
      const title = addBtn.dataset.title;
      const channel = addBtn.dataset.channel;
      this.autofillYouTubeVideoFromSearch(videoId, title, channel);
    });
  }
  formatYouTubeViewCount(count) {
    if (count >= 1e9) {
      return `${(count / 1e9).toFixed(1)}B views`;
    } else if (count >= 1e6) {
      return `${(count / 1e6).toFixed(1)}M views`;
    } else if (count >= 1e3) {
      return `${(count / 1e3).toFixed(1)}K views`;
    } else {
      return `${count} views`;
    }
  }
  autofillYouTubeVideoFromSearch(videoId, title, channel) {
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
    this.openLibraryModal();
    this.elements.songUrlInput.value = youtubeUrl;
    this.elements.songNameInput.value = title;
    this.elements.songAuthorInput.value = channel;
    this.handleUrlPaste();
    this.elements.librarySearch.value = '';
    this.hideYouTubeSearchSuggestion();
  }
  formatYouTubeUploadDate(date) {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1e3 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);
    if (diffYears > 0) {
      return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
    } else if (diffMonths > 0) {
      return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    } else if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return 'Today';
    }
  }
  loadKeybinds() {
    return new Promise(resolve => {
      if (!this.db) {
        resolve();
        return;
      }
      const transaction = this.db.transaction([ 'userSettings' ], 'readonly');
      const store = transaction.objectStore('userSettings');
      const request = store.get('keybinds');
      request.onsuccess = event => {
        if (event.target.result && event.target.result.settings) {
          this.currentKeybinds = {
            ...this.defaultKeybinds,
            ...event.target.result.settings
          };
        }
        resolve();
      };
      request.onerror = () => resolve();
    });
  }
  saveKeybinds() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }
      const transaction = this.db.transaction([ 'userSettings' ], 'readwrite');
      const store = transaction.objectStore('userSettings');
      store.put({
        category: 'keybinds',
        settings: this.currentKeybinds
      });
      transaction.oncomplete = () => resolve();
      transaction.onerror = event => reject('Could not save keybinds');
    });
  }
  loadKeybindsSettings() {
    const keybindInputs = document.querySelectorAll('.keybind-input');
    keybindInputs.forEach(input => {
      const action = input.dataset.action;
      input.classList.remove('unbound');
      const keyCode = this.currentKeybinds[action];
      if (keyCode && keyCode !== '') {
        input.value = this.getKeyDisplayName(keyCode);
      } else {
        input.value = 'Not Set';
        input.classList.add('unbound');
      }
    });
  }
  getKeyDisplayName(code) {
    if (!code || code === '') {
      return 'Not Set';
    }
    const keyNames = {
      Space: 'Space',
      Tab: 'Tab',
      Enter: 'Enter',
      ArrowLeft: '← Left',
      ArrowRight: '→ Right',
      ArrowUp: '↑ Up',
      ArrowDown: '↓ Down',
      Equal: '+ (Plus)',
      Minus: '- (Minus)',
      Escape: 'Esc',
      Backspace: 'Backspace'
    };
    if (code.startsWith('Key')) {
      return code.replace('Key', '');
    }
    if (code.startsWith('Digit')) {
      return code.replace('Digit', '');
    }
    if (code.startsWith('Numpad')) {
      return 'Num ' + code.replace('Numpad', '');
    }
    if (code.startsWith('F') && code.length <= 3) {
      return code;
    }
    return keyNames[code] || code;
  }
  startKeybindRecording(action, inputElement) {
    if (this.isRecordingKeybind) {
      this.stopKeybindRecording();
    }
    this.isRecordingKeybind = true;
    this.recordingAction = action;
    this.recordingInput = inputElement;
    inputElement.value = 'Press a key...';
    inputElement.classList.add('recording');
    this.keybindListener = e => {
      e.preventDefault();
      e.stopPropagation();
      if (e.code === 'Escape') {
        this.cancelKeybindRecording();
        return;
      }
      this.recordKeybind(e.code);
    };
    document.addEventListener('keydown', this.keybindListener, true);
  }
  getActionDisplayName(action) {
    const actionNames = {
      togglePlayPause: 'Play/Pause',
      togglePlayPause2: 'Play/Pause (Alt)',
      previousSong: 'Previous Song',
      previousSong2: 'Previous Song (Alt)',
      nextSong: 'Next Song',
      nextSong2: 'Next Song (Alt)',
      volumeUp: 'Volume Up',
      volumeDown: 'Volume Down',
      toggleLoop: 'Toggle Loop',
      restartSong: 'Restart Song',
      toggleTheme: 'Toggle Theme',
      openTimer: 'Open Timer',
      volumeUpFine: 'Volume Up (Fine)',
      volumeDownFine: 'Volume Down (Fine)',
      toggleControlBar: 'Toggle Control Bar',
      togglePlaylistSidebar: 'Toggle Sidebar',
      togglePlaylistSidebar2: 'Toggle Sidebar (Alt)',
      cycleTab: 'Cycle Tab',
      toggleVideoFullscreen: 'Toggle Fullscreen',
      showQueue: 'Show Queue',
      cycleFavicon: 'Cycle Favicon',
      toggleWebEmbed: 'Toggle Web Embed',
      toggleMusicExplorer: 'Toggle Music Explorer',
      seekForward: 'Seek Forward 5s',
      seekBackward: 'Seek Backward 5s',
      toggleMiniplayer: 'Toggle Miniplayer'
    };
    return actionNames[action] || action;
  }
  recordKeybind(keyCode) {
    if (!this.isRecordingKeybind) {
      return;
    }
    const conflictingAction = Object.keys(this.currentKeybinds).find(action => this.currentKeybinds[action] === keyCode && action !== this.recordingAction);
    if (conflictingAction) {
      const currentActionBase = this.recordingAction.replace(/2$/, '');
      const conflictActionBase = conflictingAction.replace(/2$/, '');
      if (currentActionBase !== conflictActionBase) {
        alert(`Key "${this.getKeyDisplayName(keyCode)}" is already used for "${this.getActionDisplayName(conflictingAction)}"!`);
        this.cancelKeybindRecording();
        return;
      }
      const userChoice = confirm(`Key "${this.getKeyDisplayName(keyCode)}" is already used for the same action. ` + `Click OK to swap the keys, or Cancel to keep both.`);
      if (userChoice) {
        this.currentKeybinds[conflictingAction] = '';
      }
    }
    this.currentKeybinds[this.recordingAction] = keyCode;
    this.recordingInput.value = this.getKeyDisplayName(keyCode);
    this.recordingInput.classList.remove('recording');
    this.saveKeybinds().then(() => {
      this.loadKeybindsSettings();
    }).catch(console.error);
    this.stopKeybindRecording();
  }
  cancelKeybindRecording() {
    if (this.recordingInput) {
      this.recordingInput.value = this.getKeyDisplayName(this.currentKeybinds[this.recordingAction]);
      this.recordingInput.classList.remove('recording');
    }
    this.stopKeybindRecording();
  }
  stopKeybindRecording() {
    if (this.keybindListener) {
      document.removeEventListener('keydown', this.keybindListener, true);
      this.keybindListener = null;
    }
    this.isRecordingKeybind = false;
    this.recordingAction = null;
    this.recordingInput = null;
  }
  resetKeybindsToDefault() {
    if (confirm('Reset all keybinds to default?')) {
      this.currentKeybinds = {
        ...this.defaultKeybinds
      };
      this.saveKeybinds().then(() => {
        this.loadKeybindsSettings();
      }).catch(console.error);
    }
  }
  handleKeybind(code) {
    const k = this.currentKeybinds;
    if (code === k.cycleFavicon && k.cycleFavicon !== '') {
      this.cycleFaviconAndTitle();
    } else if (code === k.toggleWebEmbed && k.toggleWebEmbed !== '') {
      this.toggleWebEmbedOverlay();
    } else if (code === k.togglePlayPause && k.togglePlayPause !== '' || code === k.togglePlayPause2 && k.togglePlayPause2 !== '') {
      this.togglePlayPause();
    } else if (code === k.previousSong && k.previousSong !== '' || code === k.previousSong2 && k.previousSong2 !== '') {
      this.playPreviousSong();
    } else if (code === k.nextSong && k.nextSong !== '' || code === k.nextSong2 && k.nextSong2 !== '') {
      this.playNextSong();
    } else if (code === k.volumeUp && k.volumeUp !== '') {
      this.adjustVolume(0.1);
    } else if (code === k.volumeDown && k.volumeDown !== '') {
      this.adjustVolume(-0.1);
    } else if (code === k.toggleLoop && k.toggleLoop !== '') {
      this.toggleLoop();
    } else if (code === k.restartSong && k.restartSong !== '') {
      this.restartCurrentSong();
    } else if (code === k.toggleTheme && k.toggleTheme !== '') {
      this.toggleTheme();
    } else if (code === k.openTimer && k.openTimer !== '') {
      this.openTimerModal();
    } else if (code === k.volumeUpFine && k.volumeUpFine !== '') {
      this.adjustVolume(0.01);
    } else if (code === k.volumeDownFine && k.volumeDownFine !== '') {
      this.adjustVolume(-0.01);
    } else if (code === k.toggleControlBar && k.toggleControlBar !== '') {
      this.toggleControlBar();
    } else if (code === k.togglePlaylistSidebar && k.togglePlaylistSidebar !== '' || code === k.togglePlaylistSidebar2 && k.togglePlaylistSidebar2 !== '') {
      this.togglePlaylistSidebar();
    } else if (code === k.cycleTab && k.cycleTab !== '') {
      this.cycleToNextTab();
    } else if (code === k.toggleVideoFullscreen && k.toggleVideoFullscreen !== '') {
      if (this.ytPlayer && this.elements.currentSongName.textContent !== 'No Song Playing') {
        this.toggleVideoFullscreen();
      }
    } else if (code === k.showQueue && k.showQueue !== '') {
      this.showQueueOverlay();
    } else if (code === k.toggleMusicExplorer && k.toggleMusicExplorer !== '') {
      this.toggleAdditionalDetails();
    } else if (code === k.seekForward && k.seekForward !== '') {
      this.seekBy(5);
    } else if (code === k.seekBackward && k.seekBackward !== '') {
      this.seekBy(-5);
    } else if (code === k.toggleMiniplayer && k.toggleMiniplayer !== '') {
      this.toggleMiniplayer();
    }
  }
  async loadDiscordSettings() {
    try {
      const tx = this.db.transaction([ 'settings' ], 'readonly');
      const req = tx.objectStore('settings').get('discordRPC');
      return new Promise(resolve => {
        req.onsuccess = () => {
          if (req.result) {
            this.discordEnabled = req.result.enabled || false;
          }
          resolve();
        };
        req.onerror = () => resolve();
      });
    } catch (error) {}
  }
  async saveDiscordSettings() {
    try {
      const tx = this.db.transaction([ 'settings' ], 'readwrite');
      tx.objectStore('settings').put({
        name: 'discordRPC',
        enabled: this.discordEnabled
      });
    } catch (error) {}
  }
  async openDiscordModal() {
    document.getElementById('discordRpcModal')?.classList.add('active');
    await this._discordSyncFields();
    this._discordRefreshModal();
  }
  closeDiscordModal() {
    document.getElementById('discordRpcModal')?.classList.remove('active');
  }
  initDiscordConnection() {
    if (this.discordWs?.readyState === WebSocket.OPEN) {
      return;
    }
    this._discordConnecting = true;
    this._discordWsOk = false;
    this._discordApiOk = false;
    this._discordAppFound = false;
    this._discordLastError = null;
    this.discordConnected = false;
    this._discordRefreshModal();
    this.updateDiscordButtonUI();
    try {
      this.discordWs = new WebSocket('ws://localhost:9112');
      this.discordWs.onopen = () => {
        this._discordConnecting = false;
        this._discordWsOk = true;
        this._discordApiOk = false;
        this._discordAppFound = true;
        this.discordConnected = false;
        this.discordReconnectAttempts = 0;
        this._discordLastError = null;
        this._discordRefreshModal();
        this.updateDiscordButtonUI();
      };
      this.discordWs.onclose = () => {
        if (!this.discordEnabled) {
          return;
        }
        this._discordConnecting = false;
        this.discordConnected = false;
        this._discordWsOk = false;
        this._discordApiOk = false;
        this._discordStopLastUpdateTick();
        this._discordRefreshModal();
        this.updateDiscordButtonUI();
        if (this.discordReconnectAttempts < this.maxDiscordReconnectAttempts) {
          this.discordReconnectAttempts++;
          clearTimeout(this.discordReconnectTimer);
          this.discordReconnectTimer = setTimeout(() => {
            if (this.discordEnabled) {
              this.initDiscordConnection();
            }
          }, 3e3);
        }
      };
      this.discordWs.onerror = () => {
        this._discordConnecting = false;
        this._discordAppFound = false;
        this._discordWsOk = false;
        this._discordApiOk = false;
        this.discordConnected = false;
        this._discordLastError = 'Cannot reach ws://localhost:9112 — is the SweetEscape desktop app running?';
        this._discordShowError(this._discordLastError);
        this._discordRefreshModal();
        this.updateDiscordButtonUI();
      };
      this.discordWs.onmessage = event => {
        try {
          const r = JSON.parse(event.data);
          if (r.status === 'app_ready') {
            this._discordWsOk = true;
            this._discordAppFound = true;
            this._discordApiOk = false;
            this.discordConnected = false;
          } else if (r.status === 'discord_ready') {
            this._discordApiOk = true;
            this.discordConnected = true;
            this._discordLastError = null;
            this._discordLastUpdate = null;
            this._discordShowSuccess('Connected to Discord RPC!');
            this.updateDiscordButtonUI();
            if (this.currentSong && this.isPlaying) {
              this.sendDiscordRPC();
            }
          } else if (r.status === 'success') {
            this._discordLastUpdate = Date.now();
            this._discordStartLastUpdateTick();
          } else if (r.status === 'error') {
            if (r.stage === 'discord') {
              this._discordWsOk = true;
              this._discordApiOk = false;
              this.discordConnected = false;
              this._discordLastError = r.message;
            } else {
              this._discordApiOk = false;
              this._discordLastError = r.message || 'Discord API error';
            }
            this._discordShowError(this._discordLastError);
            this.updateDiscordButtonUI();
          }
          this._discordRefreshModal();
        } catch (error) {}
      };
    } catch (error) {
      this._discordConnecting = false;
      this._discordLastError = error.message || 'Failed to initialize WebSocket';
      this._discordShowError(this._discordLastError);
      this._discordRefreshModal();
      this.updateDiscordButtonUI();
    }
  }
  closeDiscordConnection() {
    if (this.discordWs?.readyState === WebSocket.OPEN) {
      try {
        this.discordWs.send(JSON.stringify({
          action: 'clear',
          enabled: false
        }));
      } catch (error) {}
      setTimeout(() => {
        this.discordWs?.close();
        this.discordWs = null;
      }, 100);
    }
    clearTimeout(this.discordReconnectTimer);
    this.discordReconnectTimer = null;
    this.discordConnected = false;
    this._discordConnecting = false;
    this._discordWsOk = false;
    this._discordApiOk = false;
    this.discordReconnectAttempts = 0;
    this._discordRefreshModal();
    this.updateDiscordButtonUI();
  }
  async sendDiscordRPC() {
    if (!this.discordEnabled || !this.discordConnected || !this.currentSong) {
      return;
    }
    if (!this.discordWs || this.discordWs.readyState !== WebSocket.OPEN) {
      return;
    }
    const d = await this._discordGetEffective();
    try {
      this.discordWs.send(JSON.stringify({
        song: d.song,
        artist: d.artist,
        url: d.url
      }));
      await this._discordSyncPreview();
    } catch (error) {
      console.error('Discord RPC send failed:', error);
    }
  }
  updateDiscordButtonUI() {
    const dot = document.getElementById('discordStatusDot');
    if (!dot) {
      return;
    }
    dot.classList.remove('is-connected', 'is-error', 'is-connecting');
    if (this._discordConnecting) {
      dot.classList.add('is-connecting');
    } else if (this.discordConnected) {
      dot.classList.add('is-connected');
    } else if (this.discordEnabled) {
      dot.classList.add('is-error');
    }
  }
  async _discordRefreshModal() {
    const modal = document.getElementById('discordRpcModal');
    if (!modal?.classList.contains('active')) {
      return;
    }
    const tog = document.getElementById('discordEnabledToggle');
    if (tog) {
      tog.checked = this.discordEnabled;
    }
    const desc = document.getElementById('discordToggleDesc');
    if (desc) {
      desc.textContent = this.discordEnabled ? 'Sharing your activity on Discord' : 'Shows your current song on Discord';
    }
    let state = 'disabled';
    if (this._discordConnecting) {
      state = 'connecting';
    } else if (this.discordConnected) {
      state = 'connected';
    } else if (this.discordEnabled) {
      state = 'disconnected';
    }
    const badge = document.getElementById('discordBadge');
    if (badge) {
      badge.className = 'discord-badge state-' + state;
    }
    const icons = {
      disabled: 'fa-circle-minus',
      connecting: 'fa-circle-notch fa-spin',
      connected: 'fa-circle-check',
      disconnected: 'fa-circle-xmark'
    };
    const titles = {
      disabled: 'Disabled',
      connecting: 'Connecting…',
      connected: 'Connected & Live',
      disconnected: 'Not Connected'
    };
    const subs = {
      disabled: 'Toggle the switch above to enable',
      connecting: 'Looking for the desktop app…',
      connected: 'Your listening activity is live on Discord',
      disconnected: this._discordLastError || 'Connection failed'
    };
    const bi = document.getElementById('discordBadgeIcon');
    if (bi) {
      bi.innerHTML = `<i class="fas ${icons[state]}"></i>`;
    }
    const bt = document.getElementById('discordBadgeTitle');
    if (bt) {
      bt.textContent = titles[state];
    }
    const bs = document.getElementById('discordBadgeSubtitle');
    if (bs) {
      bs.textContent = subs[state];
    }
    const hint = document.getElementById('discordInstallHint');
    if (hint) {
      hint.classList.toggle('visible', state === 'disconnected' && !this._discordAppFound);
    }
    this._discordRefreshSteps(state);
    await this._discordSyncPreview();
    this._discordSyncLastUpdate();
    const cb = document.getElementById('discordConnectBtn');
    const db = document.getElementById('discordDisableBtn');
    if (cb) {
      cb.style.display = this.discordEnabled && !this.discordConnected && !this._discordConnecting ? 'inline-flex' : 'none';
    }
    if (db) {
      db.style.display = this.discordConnected ? 'inline-flex' : 'none';
    }
  }
  _discordRefreshSteps(state) {
    const set = (stepId, descId, stepState, desc) => {
      const el = document.getElementById(stepId);
      if (!el) {
        return;
      }
      el.className = 'discord-step step-' + stepState;
      const d = document.getElementById(descId);
      if (d) {
        d.textContent = desc;
      }
      let spinner = el.querySelector('.discord-step-spinner');
      if (stepState === 'pending') {
        if (!spinner) {
          spinner = document.createElement('div');
          spinner.className = 'discord-step-spinner';
          el.appendChild(spinner);
        }
        el.querySelector('.discord-step-icon').innerHTML = '';
      } else {
        spinner?.remove();
        const iconMap = {
          ok: 'fa-check',
          fail: 'fa-times',
          idle: 'fa-circle'
        };
        el.querySelector('.discord-step-icon').innerHTML = `<i class="fas ${iconMap[stepState] || 'fa-circle'}"></i>`;
      }
    };
    if (state === 'disabled') {
      set('discordStep1', 'discordStep1Desc', 'fail', 'Feature is disabled');
      set('discordStep2', 'discordStep2Desc', 'idle', 'Waiting');
      set('discordStep3', 'discordStep3Desc', 'idle', 'Waiting');
      return;
    }
    set('discordStep1', 'discordStep1Desc', 'ok', 'Discord RPC is enabled');
    if (state === 'connecting') {
      set('discordStep2', 'discordStep2Desc', 'pending', 'Connecting to ws://localhost:9112…');
      set('discordStep3', 'discordStep3Desc', 'idle', 'Waiting for WebSocket');
      return;
    }
    if (!this._discordWsOk) {
      set('discordStep2', 'discordStep2Desc', 'fail', 'Cannot reach ws://localhost:9112 — app not running?');
      set('discordStep3', 'discordStep3Desc', 'idle', 'Waiting for WebSocket');
      return;
    }
    set('discordStep2', 'discordStep2Desc', 'ok', 'WebSocket connected to desktop app');
    if (!this._discordApiOk) {
      set('discordStep3', 'discordStep3Desc', 'fail', 'Desktop app could not reach Discord — is Discord open?');
      return;
    }
    set('discordStep3', 'discordStep3Desc', 'ok', 'Discord API connected — presence is live');
  }
  _discordShowError(msg) {
    const b = document.getElementById('discordErrorBanner');
    const t = document.getElementById('discordErrorText');
    const s = document.getElementById('discordSuccessBanner');
    if (t) {
      t.textContent = msg;
    }
    if (b) {
      b.classList.add('visible');
    }
    if (s) {
      s.classList.remove('visible');
    }
    setTimeout(() => b?.classList.remove('visible'), 6e3);
  }
  _discordShowSuccess(msg) {
    const b = document.getElementById('discordSuccessBanner');
    const t = document.getElementById('discordSuccessText');
    const e = document.getElementById('discordErrorBanner');
    if (t) {
      t.textContent = msg;
    }
    if (b) {
      b.classList.add('visible');
    }
    if (e) {
      e.classList.remove('visible');
    }
    setTimeout(() => b?.classList.remove('visible'), 4e3);
  }
  async _discordSyncPreview() {
    const d = await this._discordGetEffective();
    const el = id => document.getElementById(id);
    if (el('discordPreviewSong')) {
      el('discordPreviewSong').textContent = d.song || 'No song playing';
    }
    if (el('discordPreviewArtist')) {
      el('discordPreviewArtist').textContent = d.artist ? `by ${d.artist}` : '—';
    }
    if (el('discordPreviewUrl')) {
      el('discordPreviewUrl').textContent = d.url || '—';
      el('discordPreviewUrl').href = d.url || '#';
    }
    if (el('discordPreviewThumb')) {
      el('discordPreviewThumb').innerHTML = d.thumbnail ? `<img src="${d.thumbnail}" onerror="this.parentElement.innerHTML='<i class=\\'fas fa-music\\'></i>'" alt="">` : '<i class="fas fa-music"></i>';
    }
  }
  async _discordSyncFields() {
    if (!this._discordOverrides) {
      this._discordOverrides = {};
    }
    const a = await this._discordGetAuto();
    const s = id => {
      const e = document.getElementById(id);
      return e ? e : null;
    };
    const set = (id, key, autoVal) => {
      const e = s(id);
      if (e) {
        e.value = this._discordOverrides[key] ?? autoVal;
      }
    };
    set('discordEditSong', 'song', a.song);
    set('discordEditArtist', 'artist', a.artist);
    set('discordEditThumb', 'thumbnail', a.thumbnail);
    await this._discordSyncPreview();
  }
  async _discordOnFieldEdit() {
    if (!this._discordOverrides) {
      this._discordOverrides = {};
    }
    const a = await this._discordGetAuto();
    const handle = (inputId, groupId, badgeId, key, autoVal) => {
      const el = document.getElementById(inputId);
      if (!el) {
        return;
      }
      const modified = el.value !== autoVal;
      this._discordOverrides[key] = modified ? el.value : null;
      document.getElementById(groupId)?.classList.toggle('is-modified', modified);
      const badge = document.getElementById(badgeId);
      if (badge) {
        badge.innerHTML = modified ? '<i class="fas fa-pencil"></i> Custom' : '<i class="fas fa-wand-magic-sparkles"></i> Auto';
      }
    };
    handle('discordEditSong', 'discordFieldSong', 'discordBadgeSong', 'song', a.song);
    handle('discordEditArtist', 'discordFieldArtist', 'discordBadgeArtist', 'artist', a.artist);
    handle('discordEditThumb', 'discordFieldThumb', 'discordBadgeThumb', 'thumbnail', a.thumbnail);
    await this._discordSyncPreview();
  }
  async _discordResetFields() {
    this._discordOverrides = {};
    [ 'discordFieldSong', 'discordFieldArtist', 'discordFieldThumb' ].forEach(id => document.getElementById(id)?.classList.remove('is-modified'));
    [ 'discordBadgeSong', 'discordBadgeArtist', 'discordBadgeThumb' ].forEach(id => {
      const e = document.getElementById(id);
      if (e) {
        e.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> Auto';
      }
    });
    await this._discordSyncFields();
  }
  _discordSendNow() {
    if (!this.discordConnected) {
      this._discordShowError('Not connected to Discord RPC. Connect first.');
      return;
    }
    this.sendDiscordRPC();
    this._discordShowSuccess('Sent to Discord successfully!');
    const btn = document.getElementById('discordSendNowBtn');
    if (!btn) {
      return;
    }
    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> Sent!';
    setTimeout(() => {
      btn.innerHTML = orig;
    }, 1800);
  }
  _discordScheduleSend() {
    clearTimeout(this._discordSendTimer);
    this._discordSendTimer = setTimeout(() => {
      this.sendDiscordRPC();
    }, 1500);
  }
  async _discordGetAuto() {
    const s = this.currentSong;
    const v = s?.videoId || '';
    let thumbnail = '';
    if (v) {
      const maxres = `https://img.youtube.com/vi/${v}/maxresdefault.jpg`;
      const hq = `https://img.youtube.com/vi/${v}/hqdefault.jpg`;
      try {
        const res = await fetch(maxres);
        const blob = await res.blob();
        thumbnail = blob.size > 5e3 ? maxres : hq;
      } catch {
        thumbnail = hq;
      }
    }
    return {
      song: s?.name || '',
      artist: s?.author || '',
      url: v ? `https://www.youtube.com/watch?v=${v}` : '',
      thumbnail: thumbnail
    };
  }
  async _discordGetEffective() {
    const a = await this._discordGetAuto();
    const o = this._discordOverrides || {};
    return {
      song: o.song ?? a.song,
      artist: o.artist ?? a.artist,
      url: o.url ?? a.url,
      thumbnail: o.thumbnail ?? a.thumbnail
    };
  }
  _discordSyncLastUpdate() {
    const el = document.getElementById('discordLastUpdate');
    const txt = document.getElementById('discordLastUpdateText');
    if (!el || !txt) {
      return;
    }
    if (!this._discordLastUpdate || !this.discordConnected) {
      el.style.display = 'none';
      return;
    }
    el.style.display = 'flex';
    const secs = Math.floor((Date.now() - this._discordLastUpdate) / 1e3);
    if (secs < 10) {
      txt.textContent = 'Last sent just now';
    } else if (secs < 60) {
      txt.textContent = `Last sent ${secs}s ago`;
    } else if (secs < 3600) {
      txt.textContent = `Last sent ${Math.floor(secs / 60)}m ago`;
    } else {
      txt.textContent = `Last sent ${Math.floor(secs / 3600)}h ago`;
    }
  }
  _discordStartLastUpdateTick() {
    this._discordStopLastUpdateTick();
    this._discordUpdateTickInterval = setInterval(() => {
      const modal = document.getElementById('discordRpcModal');
      if (modal?.classList.contains('active')) {
        this._discordSyncLastUpdate();
      } else {
        this._discordStopLastUpdateTick();
      }
    }, 15e3);
  }
  _discordStopLastUpdateTick() {
    clearInterval(this._discordUpdateTickInterval);
    this._discordUpdateTickInterval = null;
  }
  _discordRetry() {
    if (!this.discordEnabled) {
      this.discordEnabled = true;
      this.saveDiscordSettings();
    }
    if (this.discordWs) {
      this.discordWs.onclose = null;
      this.discordWs.onerror = null;
      this.discordWs.close();
      this.discordWs = null;
    }
    clearTimeout(this.discordReconnectTimer);
    this.discordReconnectTimer = null;
    this.discordReconnectAttempts = 0;
    this._discordConnecting = false;
    this.discordConnected = false;
    this._discordWsOk = false;
    this._discordApiOk = false;
    this._discordAppFound = false;
    this._discordLastError = null;
    this.initDiscordConnection();
    this._discordRefreshModal();
  }
  initDownloadModal() {
    const overlay = document.getElementById('downloadModal');
    const closeBtn = document.getElementById('dlCloseBtn');
    const modeBtns = document.querySelectorAll('.dl-mode-btn');
    const panels = {
      current: document.getElementById('dlPanelCurrent'),
      search: document.getElementById('dlPanelSearch'),
      url: document.getElementById('dlPanelUrl')
    };
    const searchInput = document.getElementById('dlSearchInput');
    const searchResults = document.getElementById('dlSearchResults');
    const urlInput = document.getElementById('dlUrlInput');
    const addUrlBtn = document.getElementById('dlAddUrlBtn');
    const queueSection = document.getElementById('dlQueueSection');
    const queueList = document.getElementById('dlQueueList');
    const downloadAllBtn = document.getElementById('dlDownloadAllBtn');
    const downloadAllLabel = document.getElementById('dlDownloadAllLabel');
    const escHtml = s => s ? s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
    const open = () => {
      overlay.style.display = 'flex';
      refreshCurrentPanel();
      setMode('current');
      if (!this.currentSong) {
        setMode('search');
      }
    };
    const close = () => {
      overlay.style.display = 'none';
    };
    overlay.addEventListener('click', e => {
      if (e.target === overlay) {
        close();
      }
    });
    closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && overlay.style.display !== 'none') {
        close();
      }
    });
    document.getElementById('downloadButton').addEventListener('click', open);
    const setMode = mode => {
      modeBtns.forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
      Object.entries(panels).forEach(([k, el]) => el.style.display = k === mode ? '' : 'none');
      if (mode === 'search') {
        setTimeout(() => searchInput.focus(), 50);
      }
      if (mode === 'url') {
        setTimeout(() => urlInput.focus(), 50);
      }
    };
    modeBtns.forEach(btn => btn.addEventListener('click', () => setMode(btn.dataset.mode)));
    const refreshCurrentPanel = () => {
      const song = this.currentSong;
      const modeBtn = document.getElementById('dlModeCurrent');
      if (!song) {
        modeBtn.style.display = 'none';
        return;
      }
      modeBtn.style.display = '';
      document.getElementById('dlCurrentName').textContent = song.name || 'Unknown';
      document.getElementById('dlCurrentAuthor').textContent = song.author || '';
      const thumb = document.getElementById('dlCurrentThumb');
      if (song.videoId) {
        thumb.style.backgroundImage = `url(https://img.youtube.com/vi/${song.videoId}/mqdefault.jpg)`;
      }
      const addBtn = document.getElementById('dlCurrentAddBtn');
      const alreadyQueued = this.dlQueue.some(q => q.videoId === song.videoId);
      addBtn.disabled = alreadyQueued;
      addBtn.title = alreadyQueued ? 'Already in queue' : 'Add to queue';
      addBtn.onclick = () => {
        addToQueue({
          videoId: song.videoId,
          name: song.name,
          author: song.author
        });
        addBtn.disabled = true;
      };
    };
    let _debounce = null;
    searchInput.addEventListener('input', () => {
      clearTimeout(_debounce);
      _debounce = setTimeout(() => renderSearch(searchInput.value.trim()), 120);
    });
    const renderSearch = term => {
      if (!term) {
        searchResults.hidden = true;
        return;
      }
      const lower = term.toLowerCase();
      const results = this.songLibrary.filter(s => s.name.toLowerCase().includes(lower) || s.author && s.author.toLowerCase().includes(lower)).slice(0, 5);
      if (!results.length) {
        searchResults.hidden = true;
        return;
      }
      searchResults.hidden = false;
      searchResults.innerHTML = results.map((s, i) => `\n      <div class="dl-result${i === 0 ? ' focused' : ''}" data-idx="${i}">\n        <div style="flex:1;min-width:0;">\n          <span class="dl-result-name">${escHtml(s.name)}</span>\n          ${s.author ? `<span class="dl-result-author">${escHtml(s.author)}</span>` : ''}\n        </div>\n        <button class="dl-result-add" title="Add to queue"><i class="fas fa-plus"></i></button>\n      </div>`).join('');
      searchResults.querySelectorAll('.dl-result').forEach((el, i) => {
        el.querySelector('.dl-result-add').addEventListener('click', e => {
          e.stopPropagation();
          addToQueue({
            videoId: results[i].videoId,
            name: results[i].name,
            author: results[i].author
          });
        });
        el.addEventListener('click', () => {
          addToQueue({
            videoId: results[i].videoId,
            name: results[i].name,
            author: results[i].author
          });
        });
      });
    };
    const handleSearchKey = e => {
      const items = [ ...searchResults.querySelectorAll('.dl-result') ];
      const focused = searchResults.querySelector('.dl-result.focused');
      let idx = focused ? items.indexOf(focused) : 0;
      if (e.key === 'Enter') {
        e.preventDefault();
        if (items[idx]) {
          items[idx].click();
        }
        searchInput.value = '';
        searchResults.hidden = true;
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        focused?.classList.remove('focused');
        idx = e.key === 'ArrowDown' ? Math.min(idx + 1, items.length - 1) : Math.max(idx - 1, 0);
        items[idx].classList.add('focused');
      } else if (e.key === 'Escape') {
        searchResults.hidden = true;
        searchInput.value = '';
      }
    };
    searchInput.addEventListener('keydown', handleSearchKey);
    const addFromUrl = () => {
      const id = this.extractYouTubeId(urlInput.value.trim());
      if (!id) {
        urlInput.style.borderColor = 'var(--error-color)';
        setTimeout(() => urlInput.style.borderColor = '', 1200);
        return;
      }
      addToQueue({
        videoId: id,
        name: id,
        author: ''
      });
      fetch(`/api/song/${id}`).then(r => r.text()).then(html => {
        const m = html.match(/<title>(.*?)<\/title>/);
        if (m) {
          const item = this.dlQueue.find(q => q.videoId === id);
          if (item) {
            item.name = m[1].replace(/ - .*/, '').trim();
            renderQueue();
          }
        }
      }).catch(() => {});
      urlInput.value = '';
    };
    addUrlBtn.addEventListener('click', addFromUrl);
    urlInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        addFromUrl();
      }
    });
    const addToQueue = song => {
      if (this.dlQueue.some(q => q.videoId === song.videoId)) {
        return;
      }
      this.dlQueue.push({
        ...song,
        status: 'idle',
        link: null,
        opened: false
      });
      renderQueue();
      convertItem(this.dlQueue[this.dlQueue.length - 1]);
    };
    const renderQueue = () => {
      if (!this.dlQueue.length) {
        queueSection.style.display = 'none';
        return;
      }
      queueSection.style.display = '';
      const totalDone = this.dlQueue.filter(q => q.status === 'done').length;
      const notOpened = this.dlQueue.filter(q => q.status === 'done' && !q.opened).length;
      const anyOpened = this.dlQueue.some(q => q.opened);
      if (anyOpened) {
        downloadAllLabel.textContent = notOpened > 0 ? `Download rest (${notOpened})` : 'All downloaded';
      } else {
        downloadAllLabel.textContent = `Download all (${totalDone}/${this.dlQueue.length})`;
      }
      downloadAllBtn.disabled = notOpened === 0;
      queueList.innerHTML = this.dlQueue.map((item, i) => `\n      <div class="dl-queue-item${item.opened ? ' dl-qi-opened' : ''}" data-idx="${i}">\n        <div class="dl-qi-thumb" style="${item.videoId ? `background-image:url(https://img.youtube.com/vi/${item.videoId}/mqdefault.jpg)` : ''}"></div>\n        <div class="dl-qi-info">\n          <div class="dl-qi-name">${escHtml(item.name)}</div>\n          <div class="dl-qi-status ${item.status}">\n            ${item.status === 'idle' ? 'Waiting…' : item.status === 'converting' ? '<span class="dl-spinner"></span> Converting…' : item.status === 'done' && item.opened ? '<i class="fas fa-check"></i> Downloaded' : item.status === 'done' ? 'Ready' : item._quotaExceeded ? 'API limit reached' : 'Failed — tap retry'}\n          </div>\n        </div>\n        <div class="dl-qi-actions">\n          ${item.status === 'done' && item.opened ? `<span class="dl-qi-tick" style="color:#5D9C59"><i class="fas fa-check-circle"></i></span>` : item.status === 'done' ? `<button class="dl-qi-download" title="Download"><i class="fas fa-download"></i></button>` : item.status === 'error' ? `<button class="dl-qi-download" title="Retry"><i class="fas fa-redo"></i></button>` : ''}\n          <button class="dl-qi-remove" title="Remove"><i class="fas fa-times"></i></button>\n        </div>\n      </div>`).join('');
      queueList.querySelectorAll('.dl-queue-item').forEach((el, i) => {
        const item = this.dlQueue[i];
        el.querySelector('.dl-qi-remove')?.addEventListener('click', () => {
          this.dlQueue.splice(i, 1);
          renderQueue();
        });
        const dlBtn = el.querySelector('.dl-qi-download');
        if (dlBtn) {
          dlBtn.addEventListener('click', () => {
            if (item.status === 'done' && item.link) {
              item.opened = true;
              window.open(item.link, '_blank');
              renderQueue();
            } else if (item.status === 'error') {
              item.status = 'idle';
              renderQueue();
              convertItem(item);
            }
          });
        }
      });
    };
    const convertItem = async item => {
      if (item.status === 'done' || item.status === 'converting') {
        return;
      }
      const activeCount = this.dlQueue.filter(q => q.status === 'converting').length;
      if (activeCount >= 2) {
        setTimeout(() => convertItem(item), 2e3);
        return;
      }
      item.status = 'converting';
      renderQueue();
      try {
        const res = await fetch(`/api/download?videoId=${item.videoId}`);
        const data = await res.json();
        if (data.status === 'ok' && data.link) {
          item.status = 'done';
          item.link = data.link;
          if (data.title && item.name === item.videoId) {
            item.name = data.title;
          }
        } else if (data.progress !== undefined && data.progress < 100) {
          item._retries = (item._retries || 0) + 1;
          if (item._retries >= 5) {
            item.status = 'error';
          } else {
            item.status = 'idle';
            renderQueue();
            setTimeout(() => convertItem(item), 8e3);
            return;
          }
        } else {
          item.status = 'error';
        }
      } catch {
        item.status = 'error';
        item._quotaExceeded = true;
      }
      renderQueue();
    };
    downloadAllBtn.addEventListener('click', () => {
      this.dlQueue.filter(item => item.status === 'done' && item.link && !item.opened).forEach(item => {
        item.opened = true;
        window.open(item.link, '_blank');
      });
      renderQueue();
    });
  }
  initShazamModal() {
    const MAX_SECONDS = 12;
    const PX_PER_SECOND = 40;
    const overlay = document.getElementById('shazamModal');
    const closeBtn = document.getElementById('szCloseBtn');
    const captureTabBtn = document.getElementById('szCaptureTabBtn');
    const micBtn = document.getElementById('szMicBtn');
    const uploadBtn = document.getElementById('szUploadBtn');
    const fileInput = document.getElementById('szFileInput');
    const gainSlider = document.getElementById('szGainSlider');
    const meterFill = document.getElementById('szMeterFill');
    const waveWrap = document.getElementById('szWaveWrap');
    const waveCanvas = document.getElementById('szWaveCanvas');
    const waveCtx = waveCanvas.getContext('2d');
    const selInfo = document.getElementById('szSelInfo');
    const identifyRow = document.getElementById('szIdentifyRow');
    const identifySelBtn = document.getElementById('szIdentifySelBtn');
    const identifyAllBtn = document.getElementById('szIdentifyAllBtn');
    const playback = document.getElementById('szPlayback');
    const statusEl = document.getElementById('szStatus');
    const resultCard = document.getElementById('szResultCard');
    const artEl = document.getElementById('szArt');
    const rTitle = document.getElementById('szTitle');
    const rArtist = document.getElementById('szArtist');
    const rAlbum = document.getElementById('szAlbum');
    const rLinks = document.getElementById('szLinks');
    const addToLibraryBtn = document.getElementById('szAddToLibraryBtn');
    const captureTabLabel = captureTabBtn.querySelector('span');
    const captureTabIcon = captureTabBtn.querySelector('i');
    const micLabel = micBtn.querySelector('span');
    const micIcon = micBtn.querySelector('i');
    let audioCtx, sourceNode, gainNode, processorNode, mediaStream;
    let sampleRate = 48e3;
    let chunks = [], levels = [], totalSamples = 0;
    let isListening = false, activeSource = null;
    let selStart = 0, selEnd = 0, dragging = false;
    let currentClipUrl = null;
    let lastMatchedTrack = null;
    const setStatus = msg => {
      statusEl.textContent = msg;
    };
    const openModal = () => {
      overlay.style.display = 'flex';
    };
    const closeModal = () => {
      overlay.style.display = 'none';
      if (isListening) {
        stopCapture();
      }
    };
    const acquireDisplayAudioStream = async () => {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      displayStream.getVideoTracks().forEach(t => t.stop());
      const audioTracks = displayStream.getAudioTracks();
      if (audioTracks.length === 0) {
        throw new Error('no-audio-track');
      }
      audioTracks[0].addEventListener('ended', () => {
        if (activeSource === 'display') {
          stopCapture();
        }
      });
      return new MediaStream(audioTracks);
    };
    const acquireMicStream = () => navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        channelCount: 1
      }
    });
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      captureTabBtn.disabled = true;
      captureTabBtn.title = 'Not supported in this browser';
    }
    const startCapture = async kind => {
      if (isListening) {
        return;
      }
      try {
        mediaStream = kind === 'display' ? await acquireDisplayAudioStream() : await acquireMicStream();
      } catch (error) {
        if (kind === 'display' && error.message === 'no-audio-track') {
          setStatus('That share had no audio — pick "Share tab audio", or use the microphone');
        } else if (kind === 'display') {
          setStatus('Screen/tab share cancelled or unsupported — try the microphone');
        } else {
          setStatus('Microphone access was denied');
        }
        return;
      }
      chunks = [];
      levels = [];
      totalSamples = 0;
      selStart = 0;
      selEnd = 0;
      identifySelBtn.disabled = true;
      identifyAllBtn.disabled = true;
      selInfo.style.display = 'none';
      waveWrap.style.display = 'block';
      identifyRow.style.display = 'flex';
      resultCard.style.display = 'none';
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      sampleRate = audioCtx.sampleRate;
      sourceNode = audioCtx.createMediaStreamSource(mediaStream);
      gainNode = audioCtx.createGain();
      gainNode.gain.value = parseFloat(gainSlider.value);
      sourceNode.connect(gainNode);
      processorNode = audioCtx.createScriptProcessor(4096, 1, 1);
      gainNode.connect(processorNode);
      const silent = audioCtx.createGain();
      silent.gain.value = 0;
      processorNode.connect(silent);
      silent.connect(audioCtx.destination);
      processorNode.onaudioprocess = e => {
        const copy = new Float32Array(e.inputBuffer.getChannelData(0));
        chunks.push(copy);
        let peak = 0;
        for (let i = 0; i < copy.length; i++) {
          const v = Math.abs(copy[i]);
          if (v > peak) {
            peak = v;
          }
        }
        levels.push(peak);
        meterFill.style.width = Math.min(100, peak * 140) + '%';
        totalSamples += copy.length;
        drawWaveform();
        if (totalSamples / sampleRate >= MAX_SECONDS) {
          stopCapture();
        }
      };
      isListening = true;
      activeSource = kind;
      updateSourceButtons();
      setStatus((kind === 'display' ? 'Capturing tab/system audio' : 'Listening on microphone') + `… up to ${MAX_SECONDS}s, then drag to select the music`);
    };
    const stopCapture = () => {
      if (!isListening) {
        return;
      }
      processorNode?.disconnect();
      gainNode?.disconnect();
      sourceNode?.disconnect();
      mediaStream?.getTracks().forEach(t => t.stop());
      audioCtx?.close();
      isListening = false;
      activeSource = null;
      updateSourceButtons();
      meterFill.style.width = '0%';
      setStatus('Stopped — drag a selection, then identify it');
      identifySelBtn.disabled = selEnd <= selStart;
      identifyAllBtn.disabled = totalSamples === 0;
    };
    const updateSourceButtons = () => {
      const tabActive = isListening && activeSource === 'display';
      const micActive = isListening && activeSource === 'mic';
      captureTabBtn.classList.toggle('sz-recording', tabActive);
      captureTabIcon.className = tabActive ? 'fas fa-stop' : 'fas fa-desktop';
      captureTabLabel.textContent = tabActive ? 'Stop capturing' : 'Tab / System audio';
      captureTabBtn.disabled = isListening && !tabActive;
      micBtn.classList.toggle('sz-recording', micActive);
      micIcon.className = micActive ? 'fas fa-stop' : 'fas fa-microphone';
      micLabel.textContent = micActive ? 'Stop microphone' : 'Microphone';
      micBtn.disabled = isListening && !micActive;
      uploadBtn.disabled = isListening;
    };
    const chunkDurationSec = () => 4096 / sampleRate;
    const drawWaveform = () => {
      const totalDur = totalSamples / sampleRate;
      const width = Math.max(300, Math.ceil(totalDur * PX_PER_SECOND));
      waveCanvas.width = width;
      waveCanvas.height = 70;
      waveCtx.clearRect(0, 0, width, 70);
      waveCtx.fillStyle = 'rgba(255,255,255,0.15)';
      waveCtx.fillRect(0, 34, width, 2);
      const pxPerChunk = PX_PER_SECOND * chunkDurationSec();
      waveCtx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#4C8DFF';
      levels.forEach((lvl, i) => {
        const h = Math.max(2, lvl * 60);
        waveCtx.fillRect(i * pxPerChunk, 35 - h / 2, Math.max(1, pxPerChunk - 1), h);
      });
      if (selEnd > selStart) {
        const x1 = selStart * PX_PER_SECOND, x2 = selEnd * PX_PER_SECOND;
        waveCtx.fillStyle = 'rgba(93,156,89,0.25)';
        waveCtx.fillRect(x1, 0, x2 - x1, 70);
      }
    };
    const pixelToTime = px => Math.max(0, Math.min(totalSamples / sampleRate, px / PX_PER_SECOND));
    const onWaveMouseDown = e => {
      dragging = true;
      const t = pixelToTime(e.offsetX);
      selStart = t;
      selEnd = t;
    };
    const onWaveMouseMove = e => {
      if (!dragging) {
        return;
      }
      selEnd = pixelToTime(e.offsetX);
      drawWaveform();
    };
    const onWindowMouseUp = () => {
      if (!dragging) {
        return;
      }
      dragging = false;
      if (selEnd < selStart) {
        const t = selStart;
        selStart = selEnd;
        selEnd = t;
      }
      const dur = (selEnd - selStart).toFixed(1);
      selInfo.style.display = 'block';
      selInfo.textContent = dur > 0 ? `Selected ${dur}s` : 'Drag across the waveform to select part of the clip';
      identifySelBtn.disabled = selEnd <= selStart;
      drawWaveform();
    };
    const extractSamples = (startSec, endSec) => {
      const startSample = Math.floor(startSec * sampleRate);
      const endSample = Math.floor(endSec * sampleRate);
      const out = new Float32Array(Math.max(0, endSample - startSample));
      let pos = 0, outIdx = 0;
      for (const chunk of chunks) {
        const chunkStart = pos, chunkEnd = pos + chunk.length;
        if (chunkEnd > startSample && chunkStart < endSample) {
          const from = Math.max(0, startSample - chunkStart);
          const to = Math.min(chunk.length, endSample - chunkStart);
          out.set(chunk.subarray(from, to), outIdx);
          outIdx += to - from;
        }
        pos = chunkEnd;
        if (pos >= endSample) {
          break;
        }
      }
      return out;
    };
    const encodeWAV = (samples, rate) => {
      const buffer = new ArrayBuffer(44 + samples.length * 2);
      const view = new DataView(buffer);
      const writeStr = (o, s) => {
        for (let i = 0; i < s.length; i++) {
          view.setUint8(o + i, s.charCodeAt(i));
        }
      };
      writeStr(0, 'RIFF');
      view.setUint32(4, 36 + samples.length * 2, true);
      writeStr(8, 'WAVE');
      writeStr(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, rate, true);
      view.setUint32(28, rate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeStr(36, 'data');
      view.setUint32(40, samples.length * 2, true);
      let off = 44;
      for (let i = 0; i < samples.length; i++) {
        const s = Math.max(-1, Math.min(1, samples[i]));
        view.setInt16(off, s < 0 ? s * 32768 : s * 32767, true);
        off += 2;
      }
      return new Blob([ view ], {
        type: 'audio/wav'
      });
    };
    const setClipForPlayback = blob => {
      if (currentClipUrl) {
        URL.revokeObjectURL(currentClipUrl);
      }
      currentClipUrl = URL.createObjectURL(blob);
      playback.src = currentClipUrl;
      playback.style.display = 'block';
    };
    const recognize = async blob => {
      setStatus('Matching…');
      resultCard.style.display = 'none';
      lastMatchedTrack = null;
      identifySelBtn.disabled = true;
      identifyAllBtn.disabled = true;
      try {
        const res = await fetch('/api/shazam', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream'
          },
          body: blob
        });
        const data = await res.json();
        if (!res.ok) {
          setStatus(data.error === 'quota_exceeded' ? 'Recognition quota exhausted for this month' : data.message || `Recognition failed (${res.status})`);
          return;
        }
        if (!data.matches || data.matches.length === 0 || !data.track) {
          setStatus('No match found — try a different part of the clip');
          return;
        }
        renderTrack(data.track);
        setStatus('Matched');
      } catch (error) {
        setStatus('Network error reaching the recognition service');
      } finally {
        identifySelBtn.disabled = selEnd <= selStart;
        identifyAllBtn.disabled = totalSamples === 0;
      }
    };
    const renderTrack = track => {
      rTitle.textContent = track.title || 'Unknown title';
      rArtist.textContent = track.subtitle || '';
      let album = '';
      if (Array.isArray(track.sections)) {
        for (const section of track.sections) {
          const meta = section.metadata;
          if (!Array.isArray(meta)) {
            continue;
          }
          const albumEntry = meta.find(m => /album/i.test(m.title || ''));
          if (albumEntry) {
            album = albumEntry.text;
            break;
          }
        }
      }
      rAlbum.textContent = album;
      const artwork = track.images?.coverarthq || track.images?.coverart || '';
      artEl.style.backgroundImage = artwork ? `url(${artwork})` : '';
      rLinks.innerHTML = '';
      if (track.url) {
        rLinks.innerHTML += `<a href="${track.url}" target="_blank" rel="noopener">Shazam</a>`;
      }
      if (Array.isArray(track.hub?.providers)) {
        for (const provider of track.hub.providers) {
          const uri = provider.actions?.[0]?.uri;
          if (uri) {
            rLinks.innerHTML += `<a href="${uri}" target="_blank" rel="noopener">${provider.type || 'Listen'}</a>`;
          }
        }
      }
      if (track.hub?.type === 'APPLEMUSIC') {
        const appleUri = track.hub.actions?.find(a => a.type === 'uri')?.uri;
        if (appleUri) {
          rLinks.innerHTML += `<a href="${appleUri}" target="_blank" rel="noopener">Apple Music</a>`;
        }
      }
      lastMatchedTrack = track;
      addToLibraryBtn.disabled = false;
      resultCard.style.display = 'flex';
    };
    const sendMatchToLibrarySearch = () => {
      if (!lastMatchedTrack) {
        return;
      }
      const query = `${lastMatchedTrack.title || ''} ${lastMatchedTrack.subtitle || ''}`.trim();
      closeModal();
      const libTabBtn = document.querySelector('.tabs [data-tab="library"]');
      if (libTabBtn && !libTabBtn.classList.contains('active')) {
        libTabBtn.click();
      }
      this.elements.librarySearch.value = query;
      this.elements.librarySearch.dispatchEvent(new Event('input', {
        bubbles: true
      }));
      this.elements.librarySearch.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true
      }));
      this.elements.librarySearch.focus();
    };
    const bindings = [ [ document.getElementById('shazamButton'), 'click', openModal ], [ overlay, 'click', e => {
      if (e.target === overlay) {
        closeModal();
      }
    } ], [ closeBtn, 'click', closeModal ], [ gainSlider, 'input', () => {
      if (gainNode) {
        gainNode.gain.value = parseFloat(gainSlider.value);
      }
    } ], [ captureTabBtn, 'click', () => isListening && activeSource === 'display' ? stopCapture() : startCapture('display') ], [ micBtn, 'click', () => isListening && activeSource === 'mic' ? stopCapture() : startCapture('mic') ], [ uploadBtn, 'click', () => fileInput.click() ], [ fileInput, 'change', () => {
      const file = fileInput.files[0];
      if (!file) {
        return;
      }
      if (file.size > 3 * 1024 * 1024) {
        setStatus('That file is too large — please trim it to a few seconds first');
        return;
      }
      setStatus('Matching uploaded clip…');
      setClipForPlayback(file);
      recognize(file);
    } ], [ waveCanvas, 'mousedown', onWaveMouseDown ], [ waveCanvas, 'mousemove', onWaveMouseMove ], [ window, 'mouseup', onWindowMouseUp ], [ identifySelBtn, 'click', () => {
      const w = encodeWAV(extractSamples(selStart, selEnd), sampleRate);
      setClipForPlayback(w);
      recognize(w);
    } ], [ identifyAllBtn, 'click', () => {
      const w = encodeWAV(extractSamples(0, totalSamples / sampleRate), sampleRate);
      setClipForPlayback(w);
      recognize(w);
    } ], [ addToLibraryBtn, 'click', sendMatchToLibrarySearch ], [ document, 'keydown', e => {
      if (e.key === 'Escape' && overlay.style.display !== 'none') {
        closeModal();
      }
    } ] ];
    bindings.forEach(([el, evt, fn]) => el?.addEventListener(evt, fn));
  }
  handleListeningStatsToggle(event) {
    this.listeningStatsEnabled = event.target.checked;
    this.saveListeningStatsSetting();
    if (!this.listeningStatsEnabled) {
      this.clearListeningStats();
    }
  }
  async saveListeningStatsSetting() {
    if (!this.db || !this.db.objectStoreNames.contains('settings')) {
      return;
    }
    const transaction = this.db.transaction([ 'settings' ], 'readwrite');
    transaction.objectStore('settings').put({
      name: 'listeningStatsEnabled',
      value: this.listeningStatsEnabled,
      lastUpdated: (new Date()).toISOString()
    });
  }
  clearListeningStats() {
    if (!this.db || !this.db.objectStoreNames.contains('listeningStats')) {
      return;
    }
    const transaction = this.db.transaction([ 'listeningStats' ], 'readwrite');
    transaction.objectStore('listeningStats').clear();
    console.log('Listening stats cleared');
  }
  _statsDayKey(date = new Date()) {
    return date.toISOString().slice(0, 10);
  }
  _pruneOldDays(days) {
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1e3;
    Object.keys(days).forEach(key => {
      if (new Date(key + 'T00:00:00Z').getTime() < cutoff) {
        delete days[key];
      }
    });
  }
  recordSongPlayStat(songId) {
    if (!this.listeningStatsEnabled || !this.db || !songId) {
      return;
    }
    if (!this.db.objectStoreNames.contains('listeningStats')) {
      return;
    }
    const transaction = this.db.transaction([ 'listeningStats' ], 'readwrite');
    const store = transaction.objectStore('listeningStats');
    const getReq = store.get(songId);
    getReq.onsuccess = () => {
      const record = getReq.result || {
        id: songId,
        lifetime: 0,
        days: {}
      };
      record.lifetime += 1;
      const todayKey = this._statsDayKey();
      record.days[todayKey] = (record.days[todayKey] || 0) + 1;
      this._pruneOldDays(record.days);
      store.put(record);
    };
    getReq.onerror = e => console.error('Failed to read listening stat:', e);
  }
  get30DayCount(record) {
    if (!record || !record.days) {
      return 0;
    }
    return Object.values(record.days).reduce((sum, n) => sum + n, 0);
  }
  openStatsModal() {
    document.getElementById('statsModal').style.display = 'flex';
    this.renderListeningStats();
  }
  closeStatsModal() {
    document.getElementById('statsModal').style.display = 'none';
  }
  renderListeningStats() {
    const panel = document.getElementById('lsPanel');
    if (!this.listeningStatsEnabled) {
      panel.innerHTML = `<p class="ls-disabled-msg">Listening statistics are off. Enable them in Settings → Additional.</p>`;
      return;
    }
    if (!this.db || !this.db.objectStoreNames.contains('listeningStats')) {
      panel.innerHTML = `<p class="ls-disabled-msg">No data yet.</p>`;
      return;
    }
    const transaction = this.db.transaction([ 'listeningStats' ], 'readonly');
    const request = transaction.objectStore('listeningStats').getAll();
    request.onsuccess = () => {
      const records = request.result || [];
      const timeRecord = records.find(r => r.id === '_global_time');
      const time30dSeconds = timeRecord ? Object.values(timeRecord.days || {}).reduce((a, b) => a + b, 0) : 0;
      const withNames = records.map(r => ({
        ...r,
        song: this.songLibrary.find(s => s.id === r.id)
      })).filter(r => r.song);
      const byLifetime = withNames.filter(r => r.lifetime > 0).sort((a, b) => b.lifetime - a.lifetime);
      const by30Day = withNames.map(r => ({
        ...r,
        count30: this.get30DayCount(r)
      })).filter(r => r.count30 > 0).sort((a, b) => b.count30 - a.count30);
      this._statsCache = {
        by30Day: by30Day,
        byLifetime: byLifetime,
        time30dSeconds: time30dSeconds
      };
      if (this._statsRange === undefined) {
        this._statsRange = '30';
      }
      if (this._statsShowAll === undefined) {
        this._statsShowAll = false;
      }
      this._statsSearchTerm = '';
      this._renderStatsPanel();
    };
  }
  _renderStatsPanel() {
    const panel = document.getElementById('lsPanel');
    const c = this._statsCache;
    if (!c) {
      return;
    }
    const isLifetime = this._statsRange === 'lifetime';
    const list = isLifetime ? c.byLifetime : c.by30Day;
    const countKey = isLifetime ? 'lifetime' : 'count30';
    const title = isLifetime ? 'Lifetime' : 'Last 30 Days';
    if (this.elements.lsRangeToggle) {
      this.elements.lsRangeToggle.checked = isLifetime;
    }
    const timeSummaryHtml = `\n\t\t        <div class="ls-time-summary">\n\t\t            <div><span class="ls-time-label">Last 30 Days</span><span class="ls-time-value">${this.formatSecondsAsHM(c.time30dSeconds)}</span></div>\n\t\t            <div><span class="ls-time-label">Lifetime</span><span class="ls-time-value">${this.formatSecondsAsHM(this.listeningTime)}</span></div>\n\t\t        </div>\n\t\t    `;
    panel.innerHTML = `\n\t\t        ${timeSummaryHtml}\n\t\t        ${this._buildStatsSectionHtml(title, list, countKey, this._statsShowAll)}\n\t\t    `;
  }
  _buildStatsSectionHtml(title, list, countKey, showAll) {
    if (!list.length) {
      return `\n\t            <div class="ls-section">\n\t                <div class="ls-section-header"><h3>${title}</h3></div>\n\t                <p class="ls-empty">No plays recorded yet</p>\n\t            </div>`;
    }
    if (showAll) {
      return `\n\t            <div class="ls-section">\n\t                <div class="ls-section-header">\n\t                    <h3>${title}</h3>\n\t                    <button class="ls-showall-btn" data-action="collapse">Show Top</button>\n\t                </div>\n\t                <div class="ls-search-wrap">\n\t                    <i class="fas fa-search ls-search-icon"></i>\n\t                    <input type="text" id="lsSearchInput" class="ls-search-input" placeholder="Search a song to see how many times you've listened…" autocomplete="off">\n\t                </div>\n\t                <div class="ls-full-list" id="lsFullListContainer">\n\t                    ${this._buildFullListHtml(list, countKey, '')}\n\t                </div>\n\t            </div>`;
    }
    const hero = list[0];
    const mid4 = list.slice(1, 5);
    const rest10 = list.slice(5, 15);
    const heroCard = hero ? this._heroCardHtml(hero, countKey) : '';
    const midCards = mid4.map((r, i) => this._largeCardHtml(r, i + 2, countKey)).join('');
    const smallCards = rest10.map((r, i) => this._smallCardHtml(r, i + 6, countKey)).join('');
    return `\n\t        <div class="ls-section">\n\t            <div class="ls-section-header">\n\t                <h3>${title}</h3>\n\t                ${list.length > 5 ? `<button class="ls-showall-btn" data-action="expand">Show All (${list.length})</button>` : ''}\n\t            </div>\n\t            <div class="ls-compact-view">\n\t                <div class="ls-left-col">\n\t                    ${heroCard}\n\t                    ${midCards ? `<div class="ls-top-large">${midCards}</div>` : ''}\n\t                </div>\n\t                ${smallCards ? `<div class="ls-top-small">${smallCards}</div>` : ''}\n\t            </div>\n\t        </div>`;
  }
  filterListeningStatisticsSongResults(list, searchTerm) {
    const ranked = list.map((r, i) => ({
      ...r,
      _rank: i + 1
    }));
    const term = (searchTerm || '').toLowerCase().trim();
    if (!term) {
      return ranked;
    }
    return ranked.filter(r => r.song.name.toLowerCase().includes(term) || r.song.author && r.song.author.toLowerCase().includes(term));
  }
  _songThumbHtml(song, sizeClass) {
    if (song.videoId) {
      return `<div class="ls-thumb-square ${sizeClass}" style="background-image:url(https://img.youtube.com/vi/${song.videoId}/mqdefault.jpg)"></div>`;
    }
    return `<div class="ls-thumb-square ${sizeClass} ls-thumb-fallback"><i class="fas fa-music"></i></div>`;
  }
  _buildFullListHtml(list, countKey, searchTerm) {
    const filtered = this.filterListeningStatisticsSongResults(list, searchTerm);
    if (!filtered.length) {
      return `<p class="ls-empty">No songs match "${this.escapeHtml(searchTerm)}"</p>`;
    }
    const items = filtered.map(r => this._fullListItemHtml(r, r._rank, countKey)).join('');
    return `<ul class="ls-full-ranked-list">${items}</ul>`;
  }
  _heroCardHtml(r, countKey) {
    return `\n\t        <div class="ls-card-hero">\n\t            ${this._songThumbHtml(r.song, 'ls-thumb-hero')}\n\t            <div class="ls-hero-info">\n\t                <span class="ls-rank-badge ls-rank-badge-hero">#1</span>\n\t                <div class="ls-card-name ls-hero-name">${this.escapeHtml(r.song.name)}</div>\n\t                ${r.song.author ? `<div class="ls-card-artist ls-hero-artist">${this.escapeHtml(r.song.author)}</div>` : ''}\n\t                <div class="ls-hero-count"><i class="fas fa-play"></i> ${r[countKey]} times listened</div>\n\t            </div>\n\t        </div>`;
  }
  _largeCardHtml(r, rank, countKey) {
    return `\n\t        <div class="ls-card-large">\n\t            <span class="ls-rank-badge">#${rank}</span>\n\t            ${this._songThumbHtml(r.song, 'ls-thumb-lg')}\n\t            <div class="ls-card-info">\n\t                <div class="ls-card-name">${this.escapeHtml(r.song.name)}</div>\n\t                ${r.song.author ? `<div class="ls-card-artist">${this.escapeHtml(r.song.author)}</div>` : ''}\n\t            </div>\n\t            <span class="ls-card-count" title="Times listened"><i class="fas fa-play"></i> ${r[countKey]}</span>\n\t        </div>`;
  }
  _smallCardHtml(r, rank, countKey) {
    return `\n\t        <div class="ls-card-small">\n\t            <span class="ls-rank">#${rank}</span>\n\t            ${this._songThumbHtml(r.song, 'ls-thumb-sm')}\n\t            <div class="ls-card-info">\n\t                <div class="ls-card-name">${this.escapeHtml(r.song.name)}</div>\n\t                ${r.song.author ? `<div class="ls-card-artist">${this.escapeHtml(r.song.author)}</div>` : ''}\n\t            </div>\n\t            <span class="ls-card-count" title="Times listened"><i class="fas fa-play"></i> ${r[countKey]}</span>\n\t        </div>`;
  }
  _fullListItemHtml(r, rank, countKey) {
    return `\n\t        <li class="ls-card-small ls-full-item">\n\t            <span class="ls-rank">#${rank}</span>\n\t            ${this._songThumbHtml(r.song, 'ls-thumb-sm')}\n\t            <div class="ls-card-info">\n\t                <div class="ls-card-name">${this.escapeHtml(r.song.name)}</div>\n\t                ${r.song.author ? `<div class="ls-card-artist">${this.escapeHtml(r.song.author)}</div>` : ''}\n\t            </div>\n\t            <span class="ls-card-count" title="Times listened"><i class="fas fa-play"></i> ${r[countKey]}</span>\n\t        </li>`;
  }
  _handleStatsShowAllClick(e) {
    const btn = e.target.closest('.ls-showall-btn');
    if (!btn) {
      return;
    }
    this._statsShowAll = btn.dataset.action === 'expand';
    this._statsSearchTerm = '';
    this._renderStatsPanel();
  }
  _handleStatsRangeToggle(e) {
    this._statsRange = e.target.checked ? 'lifetime' : '30';
    this._statsShowAll = false;
    this._statsSearchTerm = '';
    this._renderStatsPanel();
  }
  _handleStatsSearchInput(e) {
    if (e.target.id !== 'lsSearchInput') {
      return;
    }
    this._statsSearchTerm = e.target.value;
    const c = this._statsCache;
    if (!c) {
      return;
    }
    const isLifetime = this._statsRange === 'lifetime';
    const list = isLifetime ? c.byLifetime : c.by30Day;
    const countKey = isLifetime ? 'lifetime' : 'count30';
    const container = document.getElementById('lsFullListContainer');
    if (container) {
      container.innerHTML = this._buildFullListHtml(list, countKey, this._statsSearchTerm);
    }
  }
  _accumulate30DaySecond() {
    this._pending30DaySeconds = (this._pending30DaySeconds || 0) + 1;
    if (this._pending30DaySeconds >= 60) {
      this._flush30DayTime();
    }
  }
  _flush30DayTime() {
    if (!this.db || !this._pending30DaySeconds) {
      return;
    }
    if (!this.db.objectStoreNames.contains('listeningStats')) {
      return;
    }
    const seconds = this._pending30DaySeconds;
    this._pending30DaySeconds = 0;
    const transaction = this.db.transaction([ 'listeningStats' ], 'readwrite');
    const store = transaction.objectStore('listeningStats');
    const getReq = store.get('_global_time');
    getReq.onsuccess = () => {
      const record = getReq.result || {
        id: '_global_time',
        days: {}
      };
      const todayKey = this._statsDayKey();
      record.days[todayKey] = (record.days[todayKey] || 0) + seconds;
      this._pruneOldDays(record.days);
      store.put(record);
    };
    getReq.onerror = e => console.error('Failed to flush 30-day time:', e);
  }
  formatSecondsAsHM(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor(totalSeconds % 3600 / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  }
  updateListeningTimeDisplay() {
    if (!this.elements.listeningTimeDisplay) {
      return;
    }
    const seconds = this.listeningTime % 60;
    const minutes = Math.floor(this.listeningTime / 60) % 60;
    const hours = Math.floor(this.listeningTime / 3600);
    const newText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    if (this.elements.listeningTimeDisplay.textContent !== newText) {
      this.elements.listeningTimeDisplay.textContent = newText;
    }
  }
  startListeningTimeTracking() {
    if (this.listeningTimeInterval) {
      clearInterval(this.listeningTimeInterval);
    }
    this.listeningTimeInterval = setInterval(() => {
      this.listeningTime++;
      if (this.listeningStatsEnabled) {
        this._accumulate30DaySecond();
      }
      if (this.listeningTime % 60 === 0) {
        this.updateListeningTimeDisplay();
        this.saveListeningTime();
      }
    }, 1e3);
  }
  saveListeningTime() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.saveSetting('listeningTime', this.listeningTime).catch(error => console.error('Error saving listening time:', error));
    }, 100);
  }
  toggleTopicKeyword() {
    this.topicKeywordEnabled = !this.topicKeywordEnabled;
    this.elements.libTopicBtn.classList.toggle('is-off', !this.topicKeywordEnabled);
  }
  initializeVisibilityTracking() {
    this.handleVisibilityChange = () => {
      const wasVisible = this.isTabVisible;
      this.isTabVisible = !document.hidden;
      if (!wasVisible && this.isTabVisible) {
        console.log('Tab visible - resuming DOM updates');
        if (this.isPlaying) {
          this.updateProgressBar();
          if (this.visualizer.isActive) {
            this.animateVisualizer();
          }
          this.syncUIWithCurrentState();
        }
      } else if (wasVisible && !this.isTabVisible) {
        console.log('Tab hidden - pausing DOM updates');
      }
    };
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }
  syncUIWithCurrentState() {
    if (this.isLocalPlayback && this.localAudio) {
      try {
        const currentTime = this.localAudio.currentTime || 0;
        const duration = this.localAudio.duration || 0;
        if (duration > 0 && this.elements.progressBar) {
          const progressPercent = currentTime / duration * 100;
          this.elements.progressBar.value = progressPercent;
          if (this.elements.timeDisplay) {
            this.elements.timeDisplay.textContent = `${this.formatTime(currentTime)}/${this.formatTime(duration)}`;
          }
        }
      } catch (error) {
        console.warn('Could not sync local UI state:', error);
      }
      return;
    }
    if (this.ytPlayer && this.ytPlayerReady) {
      try {
        const currentTime = this.ytPlayer.getCurrentTime() || 0;
        const duration = this.ytPlayer.getDuration() || 0;
        if (duration > 0 && this.elements.progressBar) {
          const progressPercent = currentTime / duration * 100;
          this.elements.progressBar.value = progressPercent;
          if (this.elements.timeDisplay) {
            const formattedCurrentTime = this.formatTime(currentTime);
            const formattedDuration = this.formatTime(duration);
            this.elements.timeDisplay.textContent = `${formattedCurrentTime}/${formattedDuration}`;
          }
        }
      } catch (error) {
        console.warn('Could not sync UI state:', error);
      }
    }
  }
  samplePlayTemporarySong(youtubeUrl) {
    const videoId = this.extractYouTubeId(youtubeUrl);
    if (!videoId) {
      this.showNotification('Invalid YouTube URL', 'error');
      return;
    }
    this.openTemporarySongSampleModal();
    this.updateTemporarySongUrlDisplay(videoId);
    this.playTemporarySong(videoId);
  }
  openTemporarySongSampleModal() {
    let modal = document.getElementById('tempSongModal');
    if (!modal) {
      this.createTemporarySongModal();
      modal = document.getElementById('tempSongModal');
    }
    modal.style.display = 'flex';
    this.isTemporarySongPlaying = true;
  }
  updateTemporarySongUrlDisplay(videoId) {
    const urlInput = document.getElementById('tempSongUrlDisplay');
    if (urlInput) {
      urlInput.value = `https://www.youtube.com/watch?v=${videoId}`;
    }
  }
  closeTemporarySongSampleModal() {
    const modal = document.getElementById('tempSongModal');
    if (modal) {
      modal.style.display = 'none';
    }
    this.cleanupTemporarySongPlayer();
  }
  createTemporarySongModal() {
    const modal = document.createElement('div');
    modal.id = 'tempSongModal';
    modal.className = 'temp-song-modal';
    modal.innerHTML = `\n\t\t<div class="temp-song-modal-content">\n\t\t\t<button class="temp-song-close-btn" id="closeTempSongBtn">&times;</button>\n\t\t\t<h3 class="temp-song-title">Song Preview</h3>\n\t\t\t<div id="tempYtPlayerContainer" class="temp-song-player-container">\n\t\t\t\t<div id="tempYtPlayer"></div>\n\t\t\t</div>\n\t\t\t<div class="temp-song-url-container">\n\t\t\t\t<input type="text" id="tempSongUrlDisplay" class="temp-song-url-input" readonly>\n\t\t\t\t<button id="copyTempUrlBtn" class="temp-song-action-btn" title="Copy URL">\n\t\t\t\t\t<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">\n\t\t\t\t\t\t<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>\n\t\t\t\t\t\t<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>\n\t\t\t\t\t</svg>\n\t\t\t\t</button>\n\t\t\t\t<button id="openTempUrlBtn" class="temp-song-action-btn" title="Open in YouTube">\n\t\t\t\t\t<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">\n\t\t\t\t\t\t<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>\n\t\t\t\t\t\t<polyline points="15 3 21 3 21 9"></polyline>\n\t\t\t\t\t\t<line x1="10" y1="14" x2="21" y2="3"></line>\n\t\t\t\t\t</svg>\n\t\t\t\t</button>\n\t\t\t</div>\n\t\t</div>\n\t`;
    document.body.appendChild(modal);
    document.getElementById('closeTempSongBtn').addEventListener('click', () => {
      this.closeTemporarySongSampleModal();
    });
    document.getElementById('copyTempUrlBtn').addEventListener('click', () => {
      const urlInput = document.getElementById('tempSongUrlDisplay');
      urlInput.select();
      document.execCommand('copy');
      this.showNotification('URL copied to clipboard!', 'success');
    });
    document.getElementById('openTempUrlBtn').addEventListener('click', () => {
      const url = document.getElementById('tempSongUrlDisplay').value;
      if (url) {
        window.open(url, '_blank');
      }
    });
    modal.addEventListener('click', e => {
      if (e.target === modal) {
        this.closeTemporarySongSampleModal();
      }
    });
  }
  initializeTemporarySongPlayer(videoIdToLoadWhenReady) {
    if (this.tempYtPlayer) {
      return;
    }
    this.temporarySongPendingVideoId = videoIdToLoadWhenReady;
    this.tempYtPlayer = new YT.Player('tempYtPlayer', {
      height: '100%',
      width: '100%',
      playerVars: {
        rel: 0,
        showinfo: 1,
        controls: 1,
        disablekb: 0,
        fs: 1,
        modestbranding: 1,
        playsinline: 1,
        autoplay: 1,
        iv_load_policy: 3,
        enablejsapi: 1,
        origin: window.location.origin
      },
      events: {
        onReady: () => {
          this.tempYtPlayerReady = true;
          if (this.temporarySongPendingVideoId) {
            this.tempYtPlayer.loadVideoById(this.temporarySongPendingVideoId);
            this.temporarySongPendingVideoId = null;
          }
        },
        onError: event => {
          console.error('Temporary player error:', event.data);
          this.showNotification('Failed to load video', 'error');
        }
      }
    });
  }
  playTemporarySong(videoId) {
    if (this.tempYtPlayer && this.tempYtPlayerReady) {
      this.tempYtPlayer.loadVideoById(videoId);
    } else if (this.tempYtPlayer && !this.tempYtPlayerReady) {
      this.temporarySongPendingVideoId = videoId;
    } else {
      this.initializeTemporarySongPlayer(videoId);
    }
  }
  cleanupTemporarySongPlayer() {
    if (this.tempYtPlayer) {
      try {
        this.tempYtPlayer.stopVideo();
        this.tempYtPlayer.destroy();
      } catch (error) {
        console.warn('Error destroying temp player:', error);
      }
      this.tempYtPlayer = null;
      this.tempYtPlayerReady = false;
    }
    this.temporarySongPendingVideoId = null;
    this.isTemporarySongPlaying = false;
    const container = document.getElementById('tempYtPlayerContainer');
    if (container) {
      container.innerHTML = '<div id="tempYtPlayer"></div>';
    }
  }
  async loadVersion() {
    try {
      const response = await fetch('/current-version.txt', {
        cache: 'no-store'
      });
      const version = (await response.text()).trim();
      const versionDisplay = document.getElementById('versionDisplay');
      const versionText = document.getElementById('versionText');
      if (versionDisplay && versionText) {
        versionText.textContent = `v${version}`;
        versionDisplay.addEventListener('click', () => {
          this.loadAndShowChangelog();
        });
      }
    } catch (error) {
      console.warn('Could not load version:', error);
    }
  }
  async loadAndShowChangelog() {
    try {
      if (!this.fullChangelog) {
        const response = await fetch('changelog.md');
        this.fullChangelog = await response.text();
      }
      this.showChangelogModal();
    } catch (error) {
      console.warn('Could not load changelog:', error);
    }
  }
  showChangelogModal() {
    const modal = document.getElementById('changelogModal');
    const content = document.getElementById('changelogContent');
    if (modal && content && this.fullChangelog) {
      const lines = this.fullChangelog.trim().split('\n').filter(line => line.trim());
      const htmlContent = lines.reverse().map(line => {
        const versionMatch = line.match(/(v\d+\.\d+\.\d+)/);
        if (versionMatch) {
          const version = versionMatch[1];
          const change = line.replace(/^\*\s*/, '').replace(version, '').trim();
          return `<li><span class="changelog-version">${version}</span> - ${change}</li>`;
        }
        return `<li>${line.replace(/^\*\s*/, '')}</li>`;
      }).join('');
      content.innerHTML = `<ul>${htmlContent}</ul>`;
      modal.style.display = 'block';
    }
  }
  setupChangelogModal() {
    const modal = document.getElementById('changelogModal');
    const closeBtn = document.querySelector('.changelog-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
      });
    }
    if (modal) {
      modal.addEventListener('click', event => {
        if (event.target === modal) {
          modal.style.display = 'none';
        }
      });
    }
  }
  cleanup() {
    console.log('Starting cleanup process');
    this.saveCurrentState();
    this.clearTimersAndIntervals();
    this.cleanupYouTubePlayer();
    this.cleanupLocalAudio();
    this.cleanupVisualizer();
    this.cleanupBillboardAndGlobalLibrary();
    this.cleanupVirtualScroll();
    this.cleanupDiscoveryObserver();
    this.cleanupMiscState();
    this.restorePageAppearance();
    this.disconnectObservers();
    this.removeDynamicEventListeners();
    if (this.handleVisibilityChange) {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
      this.handleVisibilityChange = null;
    }
    this.closeDiscordConnection();
    this.gracefulDatabaseClose();
    console.log('Cleanup process completed successfully');
  }
  cleanupLocalAudio() {
    if (!this.localAudio) {
      return;
    }
    try {
      if (!this.localAudio.paused) {
        this.localAudio.pause();
      }
      if (this.localAudio.src?.startsWith('blob:')) {
        URL.revokeObjectURL(this.localAudio.src);
      }
      this.localAudio.removeAttribute('src');
      this.localAudio.load();
      console.log('Local audio cleaned up');
    } catch (error) {
      console.warn('Error cleaning up local audio:', error.message);
    }
  }
  cleanupVisualizer() {
    try {
      this.destroyVisualizer();
      if (this.visualizer) {
        this.visualizer.bars = [];
        this.visualizer.particles = [];
        if (this.visualizer.ctx && this.visualizer.canvas) {
          this.visualizer.ctx.clearRect(0, 0, this.visualizer.canvas.width, this.visualizer.canvas.height);
        }
        this.visualizer.ctx = null;
        this.visualizer.canvas = null;
      }
      console.log('Visualizer cleaned up');
    } catch (error) {
      console.warn('Error cleaning up visualizer:', error.message);
    }
  }
  cleanupVirtualScroll() {
    try {
      if (this._vsCleanup) {
        this._vsCleanup();
        this._vsCleanup = null;
      }
      if (this._vsContainer) {
        this._vsContainer.style.height = '';
        this._vsContainer.style.position = '';
        this._vsContainer.style.overflowY = '';
        this._vsContainer = null;
      }
      console.log('Virtual scroll cleaned up');
    } catch (error) {
      console.warn('Error cleaning up virtual scroll:', error.message);
    }
  }
  cleanupDiscoveryObserver() {
    try {
      if (this._discoveryResizeObserver) {
        this._discoveryResizeObserver.disconnect();
        this._discoveryResizeObserver = null;
        console.log('Discovery ResizeObserver disconnected');
      }
    } catch (error) {
      console.warn('Error disconnecting discovery observer:', error.message);
    }
  }
  cleanupMiscState() {
    try {
      if (this._discordSendTimer) {
        clearTimeout(this._discordSendTimer);
        clearInterval(this._discordSendTimer);
        this._discordSendTimer = null;
        console.log('Discord send timer cleared');
      }
      if (this.temporarilySkippedSongs) {
        this.temporarilySkippedSongs.clear();
      }
      if (this.elements?.saveCustomTheme) {
        this.elements.saveCustomTheme.onclick = null;
      }
      console.log('Misc state cleaned up');
    } catch (error) {
      console.warn('Error cleaning up misc state:', error.message);
    }
  }
  saveCurrentState() {
    try {
      console.log('Saving current application state');
      if (this.listeningTime > 0) {
        localStorage.setItem('musicPlayer_listeningTime', this.listeningTime.toString());
        console.log(`Listening time persisted: ${this.listeningTime} seconds`);
      }
      if (this.elements?.volumeSlider?.value) {
        localStorage.setItem('musicPlayer_volume', this.elements.volumeSlider.value);
        console.log(`Volume level persisted: ${this.elements.volumeSlider.value}`);
      }
      if (this.currentSpeed !== 1) {
        localStorage.setItem('musicPlayer_speed', this.currentSpeed.toString());
        console.log(`Playback speed persisted: ${this.currentSpeed}x`);
      }
      if (this.ytPlayer && this.isPlaying) {
        try {
          const currentTime = this.ytPlayer.getCurrentTime();
          if (currentTime > 0) {
            localStorage.setItem('musicPlayer_lastPosition', currentTime.toString());
            console.log(`Current position persisted: ${currentTime} seconds`);
          }
        } catch (error) {
          console.warn('Failed to persist current playback position:', error.message);
        }
      }
      console.log('Application state saved successfully');
    } catch (error) {
      console.error('Critical error during state persistence:', error);
    }
  }
  clearTimersAndIntervals() {
    console.log('Clearing active timers and intervals');
    const timers = [ {
      ref: 'progressInterval',
      timer: this.progressInterval
    }, {
      ref: 'listeningTimeInterval',
      timer: this.listeningTimeInterval
    }, {
      ref: 'longPressTimer',
      timer: this.longPressTimer
    }, {
      ref: 'titleScrollInterval',
      timer: this.titleScrollInterval
    }, {
      ref: 'appTimer',
      timer: this.appTimer
    }, {
      ref: '_discordSendTimer',
      timer: this._discordSendTimer
    }, {
      ref: 'discordReconnectTimer',
      timer: this.discordReconnectTimer
    } ];
    let clearedCount = 0;
    timers.forEach(({ref: ref, timer: timer}) => {
      if (timer) {
        clearInterval(timer);
        clearTimeout(timer);
        this[ref] = null;
        clearedCount++;
        console.log(`Timer cleared: ${ref}`);
      }
    });
    console.log(`Successfully cleared ${clearedCount} active timers`);
  }
  cleanupYouTubePlayer() {
    this.destroyVisualizer();
    console.log('Initiating YouTube player cleanup');
    if (this.ytPlayer) {
      try {
        if (typeof this.ytPlayer.pauseVideo === 'function') {
          this.ytPlayer.pauseVideo();
          console.log('YouTube player paused');
        }
        if (typeof this.ytPlayer.destroy === 'function') {
          this.ytPlayer.destroy();
          console.log('YouTube player instance destroyed');
        }
        this.ytPlayer = null;
        this.isPlaying = false;
        console.log('YouTube player cleanup completed');
      } catch (error) {
        console.warn('Error during YouTube player cleanup:', error.message);
        this.ytPlayer = null;
        this.isPlaying = false;
      }
    } else {
      console.log('No YouTube player instance found for cleanup');
    }
  }
  restorePageAppearance() {
    console.log('Restoring original page appearance');
    try {
      if (this.originalTitle && document.title !== this.originalTitle) {
        document.title = this.originalTitle;
        console.log(`Page title restored: ${this.originalTitle}`);
      }
      const faviconLink = document.querySelector('link[rel="icon"]');
      if (faviconLink && this.originalFavicon && faviconLink.href !== this.originalFavicon) {
        faviconLink.href = this.originalFavicon;
        console.log(`Favicon restored: ${this.originalFavicon}`);
      }
      if (this.isWebEmbedVisible) {
        this.destroyWebEmbedOverlay();
        console.log('Web embed overlay destroyed');
      }
      console.log('Page appearance restoration completed');
    } catch (error) {
      console.warn('Error during page appearance restoration:', error.message);
    }
  }
  disconnectObservers() {
    console.log('Disconnecting mutation observers');
    if (this.titleObserver) {
      try {
        this.titleObserver.disconnect();
        this.titleObserver = null;
        console.log('Title observer disconnected successfully');
      } catch (error) {
        console.warn('Error disconnecting title observer:', error.message);
      }
    } else {
      console.log('No active observers found for disconnection');
    }
  }
  removeDynamicEventListeners() {
    console.log('Removing dynamic event listeners');
    let removedCount = 0;
    try {
      const contextMenuHandler = this.contextMenuHandler;
      if (contextMenuHandler) {
        document.removeEventListener('contextmenu', contextMenuHandler);
        removedCount++;
        console.log('Context menu event listener removed');
      }
    } catch (error) {
      console.warn('Error removing context menu listener:', error.message);
    }
    try {
      const keyboardHandler = this.keyboardHandler;
      if (keyboardHandler) {
        document.removeEventListener('keydown', keyboardHandler);
        removedCount++;
        console.log('Global keyboard event listener removed');
      }
    } catch (error) {
      console.warn('Error removing keyboard listener:', error.message);
    }
    try {
      if (this.elements?.autoplayBtn && this.handleToggleAutoplay) {
        this.elements.autoplayBtn.removeEventListener('click', this.handleToggleAutoplay);
        removedCount++;
        console.log('Autoplay button event listener removed');
      }
    } catch (error) {
      console.warn('Error removing autoplay button listener:', error.message);
    }
    try {
      const playlistItems = document.querySelectorAll(".playlist-item[draggable='true']");
      playlistItems.forEach(item => {
        item.draggable = false;
        removedCount++;
      });
      if (playlistItems.length > 0) {
        console.log(`Drag functionality removed from ${playlistItems.length} playlist items`);
      }
    } catch (error) {
      console.warn('Error removing drag functionality:', error.message);
    }
    console.log(`Dynamic event listener removal completed: ${removedCount} listeners processed`);
  }
  gracefulDatabaseClose() {
    console.log('Initiating graceful database connection closure');
    if (this.db) {
      try {
        setTimeout(() => {
          if (this.db) {
            this.db.close();
            this.db = null;
            console.log('Database connection closed successfully');
          }
        }, 100);
      } catch (error) {
        console.warn('Error during database closure:', error.message);
        this.db = null;
      }
    } else {
      console.log('No active database connection found');
    }
  }
  cleanupBillboardAndGlobalLibrary() {
    console.log('Cleaning up Billboard and Global Library resources');
    const billboardModal = document.getElementById('billboardHot100Modal');
    if (billboardModal) {
      billboardModal.remove();
      console.log('Billboard Hot 100 modal removed');
    }
    this.closeGlobalLibrarySearchSuggestionsDropdown();
    this.closeGlobalLibrarySongDetailCard();
    this.closeGlobalLibraryArtistSongsGrid();
    console.log('Billboard and Global Library cleanup complete');
  }
}

let karaokeShareDepsPromise = null;

function loadScriptOnce(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
}

function loadKaraokeShareDependencies() {
  if (!karaokeShareDepsPromise) {
    karaokeShareDepsPromise = (async () => {
      if (typeof pako === 'undefined') {
        await loadScriptOnce('https://cdn.jsdelivr.net/npm/pako@2.1.0/dist/pako.min.js');
      }
      if (typeof KaraokeEncoder === 'undefined') {
        await loadScriptOnce('/karaoke-encoder.js');
      }
    })().catch(err => {
      karaokeShareDepsPromise = null;
      throw err;
    });
  }
  return karaokeShareDepsPromise;
}

let musicPlayer;

function initializeMusicPlayer() {
  musicPlayer = new AdvancedMusicPlayer();
}

window.addEventListener('beforeunload', () => {
  if (musicPlayer) {
    musicPlayer.cleanup();
  }
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeMusicPlayer);
} else {
  initializeMusicPlayer();
}