
// Lazy loaded — fetched only when user clicks to open settings.

export const settingsMethods = {

  // ── Modal ─────────────────────────────────────────────────────────────────

  handleCloseSettings() {
    this.elements.settingsModal.style.display = "none";
    document.body.style.overflow = "auto";
  },

  handleSettingsModalClick(event) {
    if (event.target === this.elements.settingsModal) {
      this.handleCloseSettings();
    }
  },

  initializeSettingsContent() {
    this.loadThemeMode();
    this.loadCustomThemeColors();
    this.loadAdvertisementSettingsInModal();
    this.setupTabs();
    this.loadDiscoverMoreSettings();
    this.loadLibrarySortSetting();
    this.loadLibraryReverseSetting();
    this.loadKeybindsSettings();
    console.log("Settings modal opened - all settings loaded");
  },

  // ── Tabs ──────────────────────────────────────────────────────────────────

  setupTabs() {
    const firstTab = document.querySelector('.settings-tab-btn');
    const firstPanel = document.querySelector('.tab-panel');
    if (firstTab && firstPanel) {
      firstTab.classList.add('active');
      firstPanel.classList.add('active');
    }
  },

  handleTabSwitch(event) {
    const targetTab = event.target.closest('.settings-tab-btn').dataset.tab;
    document.querySelectorAll('.settings-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
    event.target.closest('.settings-tab-btn').classList.add('active');
    document.getElementById(targetTab + 'Panel').classList.add('active');
  },

  // ── Theme (modal interactions only) ──────────────────────────────────────

  loadThemeMode() {
    if (!this.db) return;
    const request = this.db.transaction(["settings"], "readonly")
      .objectStore("settings").get("themeMode");
    request.onsuccess = () => {
      const savedMode = request.result?.value ?? "dark";
      this.elements.themeMode.value = savedMode;
      this.elements.customThemeSection.style.display = savedMode === "custom" ? "block" : "none";
    };
  },

  handleThemeModeChange(event) {
    const mode = event.target.value;
    this.elements.customThemeSection.style.display = mode === "custom" ? "block" : "none";
    if (mode !== "custom") {
      document.documentElement.setAttribute("data-theme", mode);
      this.updateThemeIcon(mode);
      this.saveSetting("themeMode", mode);
      setTimeout(() => this.updateFaviconThemeFromDB(), 100);
    } else {
      this.loadCustomTheme();
    }
  },

  // ── Custom theme (modal interactions only) ────────────────────────────────

  loadCustomThemeColors() {
    if (!this.db) return;
    const store = this.db.transaction(["settings"], "readonly").objectStore("settings");
    [
      'customPrimary', 'customBackground', 'customSecondary', 'customTextPrimary',
      'customTextSecondary', 'customHover', 'customBorder', 'customAccent',
      'customButtonText', 'customShadow', 'customError', 'customErrorHover', 'customYoutubeRed'
    ].forEach(key => {
      const req = store.get(key);
      req.onsuccess = () => { if (req.result?.value) this.updateColorPickerByKey(key, req.result.value); };
    });
  },

  handleSaveCustomTheme() {
    const shadowRgba = this.hexToRgba(
      this.elements.shadowColorPicker.value,
      this.elements.shadowOpacity.value
    );
    const customColors = {
      primary:      this.elements.primaryColorPicker.value,
      background:   this.elements.backgroundColorPicker.value,
      secondary:    this.elements.secondaryColorPicker?.value       || '#334155',
      textPrimary:  this.elements.textPrimaryColorPicker?.value     || '#e2e8f0',
      textSecondary:this.elements.textSecondaryColorPicker?.value   || '#94a3b8',
      hover:        this.elements.hoverColorPicker?.value           || '#2563eb',
      border:       this.elements.borderColorPicker?.value          || '#475569',
      accent:       this.elements.accentColorPicker?.value          || this.elements.primaryColorPicker.value,
      buttonText:   this.elements.buttonTextColorPicker?.value      || '#ffffff',
      shadow:       shadowRgba,
      error:        this.elements.errorColorPicker?.value           || '#dc3545',
      errorHover:   this.elements.errorHoverColorPicker?.value      || '#c82333',
      youtubeRed:   this.elements.youtubeRedColorPicker?.value      || '#FF0000'
    };
    this.applyCustomColors(customColors);
    document.documentElement.setAttribute("data-theme", "custom");

    Promise.all([
      this.saveSetting("customPrimary",       customColors.primary),
      this.saveSetting("customBackground",    customColors.background),
      this.saveSetting("customSecondary",     customColors.secondary),
      this.saveSetting("customTextPrimary",   customColors.textPrimary),
      this.saveSetting("customTextSecondary", customColors.textSecondary),
      this.saveSetting("customHover",         customColors.hover),
      this.saveSetting("customBorder",        customColors.border),
      this.saveSetting("customAccent",        customColors.accent),
      this.saveSetting("customButtonText",    customColors.buttonText),
      this.saveSetting("customShadow",        customColors.shadow),
      this.saveSetting("customError",         customColors.error),
      this.saveSetting("customErrorHover",    customColors.errorHover),
      this.saveSetting("customYoutubeRed",    customColors.youtubeRed),
      this.saveSetting("themeMode",           "custom")
    ])
      .then(() => this.showNotification("Custom theme saved!", "success"))
      .catch(() => this.showNotification("Error saving theme", "error"));
  },

  resetCustomTheme() {
    const defaultColors = {
      primary: '#3b82f6', background: '#1e293b', secondary: '#334155',
      textPrimary: '#e2e8f0', textSecondary: '#94a3b8',
      hover: '#2563eb', border: '#475569', accent: '#3b82f6'
    };
    this.applyCustomColors(defaultColors);
    this.updateColorPickerValues({
      customPrimary:       defaultColors.primary,
      customBackground:    defaultColors.background,
      customSecondary:     defaultColors.secondary,
      customTextPrimary:   defaultColors.textPrimary,
      customTextSecondary: defaultColors.textSecondary,
      customHover:         defaultColors.hover,
      customBorder:        defaultColors.border,
      customAccent:        defaultColors.accent
    });
  },

  handleColorChange(colorType, value) {
    const cssVarMap = {
      primary:      '--custom-primary',
      background:   '--custom-background',
      secondary:    '--custom-secondary',
      textPrimary:  '--custom-text-primary',
      textSecondary:'--custom-text-secondary',
      hover:        '--custom-hover',
      border:       '--custom-border',
      accent:       '--custom-accent'
    };
    if (cssVarMap[colorType]) document.documentElement.style.setProperty(cssVarMap[colorType], value);
  },

  updateColorPickerByKey(key, value) {
    const pickerMap = {
      customPrimary:       'primaryColorPicker',
      customBackground:    'backgroundColorPicker',
      customSecondary:     'secondaryColorPicker',
      customTextPrimary:   'textPrimaryColorPicker',
      customTextSecondary: 'textSecondaryColorPicker',
      customHover:         'hoverColorPicker',
      customBorder:        'borderColorPicker',
      customAccent:        'accentColorPicker'
    };
    const el = this.elements[pickerMap[key]];
    if (el) el.value = value;
  },

  updateColorPickerValues(colors) {
    const pickerMap = {
      primaryColorPicker:       colors.customPrimary,
      backgroundColorPicker:    colors.customBackground,
      secondaryColorPicker:     colors.customSecondary,
      textPrimaryColorPicker:   colors.customTextPrimary,
      textSecondaryColorPicker: colors.customTextSecondary,
      hoverColorPicker:         colors.customHover,
      borderColorPicker:        colors.customBorder,
      accentColorPicker:        colors.customAccent
    };
    Object.entries(pickerMap).forEach(([k, v]) => {
      if (this.elements[k]) this.elements[k].value = v;
    });
  },

  exportTheme() {
    try {
      const e = this.elements;
      const themeData = {
        primary:      e.primaryColorPicker?.value       || '#000000',
        background:   e.backgroundColorPicker?.value    || '#ffffff',
        secondary:    e.secondaryColorPicker?.value     || '#cccccc',
        textPrimary:  e.textPrimaryColorPicker?.value   || '#000000',
        textSecondary:e.textSecondaryColorPicker?.value || '#666666',
        hover:        e.hoverColorPicker?.value         || '#eeeeee',
        border:       e.borderColorPicker?.value        || '#dddddd',
        accent:       e.accentColorPicker?.value        || '#007bff',
        buttonText:   e.buttonTextColorPicker?.value    || '#ffffff',
        shadow:       e.shadowColorPicker?.value        || '#000000',
        shadowOpacity:e.shadowOpacity?.value            || '0.1',
        error:        e.errorColorPicker?.value         || '#f44336',
        errorHover:   e.errorHoverColorPicker?.value    || '#d32f2f',
        youtubeRed:   e.youtubeRedColorPicker?.value    || '#ff0000'
      };
      const str = JSON.stringify(themeData, null, 2);
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(str)
          .then(() => this.showNotification("Theme exported to clipboard!", "success"))
          .catch(() => this.fallbackCopyToClipboard(str));
      } else {
        this.fallbackCopyToClipboard(str);
      }
    } catch {
      this.showNotification("Failed to export theme", "error");
    }
  },

  importTheme() {
    const themeText = this.elements.themeImportText?.value?.trim();
    if (!themeText) { this.showNotification("Please paste a theme code first", "error"); return; }
    try {
      const themeData = JSON.parse(themeText);
      if (typeof themeData !== 'object' || themeData === null) throw new Error();
      const hasValidProps = ['primary', 'background', 'secondary', 'textPrimary'].some(p => p in themeData);
      if (!hasValidProps) throw new Error();
      this.applyImportedTheme(themeData);
      this.showNotification("Theme imported! Press save theme button.", "success");
      this.elements.themeImportText.value = '';
    } catch {
      this.showNotification("Invalid theme format", "error");
    }
  },

  applyImportedTheme(themeData) {
    try {
      const isValidHex = h => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(h);
      const apply = (prop, elKey) => {
        if (themeData[prop] && isValidHex(themeData[prop])) this.elements[elKey].value = themeData[prop];
      };
      apply('primary',       'primaryColorPicker');
      apply('background',    'backgroundColorPicker');
      apply('secondary',     'secondaryColorPicker');
      apply('textPrimary',   'textPrimaryColorPicker');
      apply('textSecondary', 'textSecondaryColorPicker');
      apply('hover',         'hoverColorPicker');
      apply('border',        'borderColorPicker');
      apply('accent',        'accentColorPicker');
      apply('buttonText',    'buttonTextColorPicker');
      apply('shadow',        'shadowColorPicker');
      apply('error',         'errorColorPicker');
      apply('errorHover',    'errorHoverColorPicker');
      apply('youtubeRed',    'youtubeRedColorPicker');
      if (themeData.shadowOpacity && !isNaN(parseFloat(themeData.shadowOpacity))) {
        this.elements.shadowOpacity.value = themeData.shadowOpacity;
      }
      this.handleSaveCustomTheme();
    } catch {
      this.showNotification("Error applying theme", "error");
    }
  },

  hexToRgba(hex, opacity) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${opacity})`;
    }
    return `rgba(0, 0, 0, ${opacity})`;
  },

  // ── Advertisements (modal toggle only) ───────────────────────────────────

  loadAdvertisementSettingsInModal() {
    if (this.elements.adsToggle) this.elements.adsToggle.checked = this.adsEnabled;
  },

  handleAdsToggle(event) {
    this.adsEnabled = event.target.checked;
    this.updateAdvertisementDisplay();
    this.saveAdvertisementSettings();
  },

  // ── Visualizer (modal toggle only) ───────────────────────────────────────

  handleVisualizerToggle(event) {
    const isEnabled = event.target.checked;
    const el = document.getElementById('musicVisualizer');
    this.visualizer.isActive = isEnabled;
    el.style.display = isEnabled ? 'block' : 'none';
    if (isEnabled && !this.visualizer.animationId) {
      this.startVisualizer();
    } else if (!isEnabled && this.visualizer.animationId) {
      cancelAnimationFrame(this.visualizer.animationId);
      this.visualizer.animationId = null;
    }
    this.saveSetting("visualizerEnabled", isEnabled);
  },

  // ── Library sort / reverse (modal toggles only) ───────────────────────────

  handleLibrarySortToggle(event) {
    this.librarySortAlphabetically = event.target.checked;
    this.renderSongLibrary();
    this.saveSetting("librarySortAlphabetically", this.librarySortAlphabetically);
  },

  loadLibrarySortSetting() {
    if (!this.db) return;
    const request = this.db.transaction(["settings"], "readonly")
      .objectStore("settings").get("librarySortAlphabetically");
    request.onsuccess = () => {
      this.librarySortAlphabetically = request.result?.value ?? true;
      if (this.elements.librarySortToggle) {
        this.elements.librarySortToggle.checked = this.librarySortAlphabetically;
      }
    };
    request.onerror = () => {
      this.librarySortAlphabetically = true;
      if (this.elements.librarySortToggle) this.elements.librarySortToggle.checked = true;
    };
  },

  handleLibraryReverseToggle(event) {
    this.libraryReverseOrder = event.target.checked;
    this.renderSongLibrary();
    this.saveSetting("libraryReverseOrder", this.libraryReverseOrder);
  },

  loadLibraryReverseSetting() {
    if (!this.db) return;
    const request = this.db.transaction(["settings"], "readonly")
      .objectStore("settings").get("libraryReverseOrder");
    request.onsuccess = () => {
      this.libraryReverseOrder = request.result?.value ?? false;
      if (this.elements.libraryReverseToggle) {
        this.elements.libraryReverseToggle.checked = this.libraryReverseOrder;
      }
    };
    request.onerror = () => {
      this.libraryReverseOrder = false;
      if (this.elements.libraryReverseToggle) this.elements.libraryReverseToggle.checked = false;
    };
  },

  // ── Discord (modal save only) ─────────────────────────────────────────────

  async saveDiscordSettings() {
    try {
      this.db.transaction(["settings"], "readwrite")
        .objectStore("settings")
        .put({ name: "discordRPC", enabled: this.discordEnabled });
    } catch (error) {
      console.error("Error saving Discord settings:", error);
    }
  },

  // ── Keybinds (modal only) ─────────────────────────────────────────────────

  saveKeybinds() {
    return new Promise((resolve, reject) => {
      if (!this.db) { reject("Database not initialized"); return; }
      const transaction = this.db.transaction(["userSettings"], "readwrite");
      transaction.objectStore("userSettings")
        .put({ category: "keybinds", settings: this.currentKeybinds });
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject("Could not save keybinds");
    });
  },

  loadKeybindsSettings() {
    document.querySelectorAll('.keybind-input').forEach(input => {
      const action = input.dataset.action;
      const keyCode = this.currentKeybinds[action];
      input.classList.remove('unbound');
      if (keyCode && keyCode !== '') {
        input.value = this.getKeyDisplayName(keyCode);
      } else {
        input.value = 'Not Set';
        input.classList.add('unbound');
      }
    });
  },

  getKeyDisplayName(code) {
    if (!code || code === '') return 'Not Set';
    const keyNames = {
      'Space': 'Space', 'Tab': 'Tab', 'Enter': 'Enter',
      'ArrowLeft': '← Left', 'ArrowRight': '→ Right',
      'ArrowUp': '↑ Up', 'ArrowDown': '↓ Down',
      'Equal': '+ (Plus)', 'Minus': '- (Minus)',
      'Escape': 'Esc', 'Backspace': 'Backspace'
    };
    if (code.startsWith('Key'))    return code.replace('Key', '');
    if (code.startsWith('Digit'))  return code.replace('Digit', '');
    if (code.startsWith('Numpad')) return 'Num ' + code.replace('Numpad', '');
    if (code.startsWith('F') && code.length <= 3) return code;
    return keyNames[code] || code;
  },

  getActionDisplayName(action) {
    const actionNames = {
      togglePlayPause:        'Play/Pause',
      togglePlayPause2:       'Play/Pause (Alt)',
      previousSong:           'Previous Song',
      previousSong2:          'Previous Song (Alt)',
      nextSong:               'Next Song',
      nextSong2:              'Next Song (Alt)',
      volumeUp:               'Volume Up',
      volumeDown:             'Volume Down',
      toggleLoop:             'Toggle Loop',
      restartSong:            'Restart Song',
      toggleTheme:            'Toggle Theme',
      openTimer:              'Open Timer',
      volumeUpFine:           'Volume Up (Fine)',
      volumeDownFine:         'Volume Down (Fine)',
      toggleControlBar:       'Toggle Control Bar',
      togglePlaylistSidebar:  'Toggle Sidebar',
      togglePlaylistSidebar2: 'Toggle Sidebar (Alt)',
      cycleTab:               'Cycle Tab',
      toggleVideoFullscreen:  'Toggle Fullscreen',
      showQueue:              'Show Queue',
      cycleFavicon:           'Cycle Favicon',
      toggleWebEmbed:         'Toggle Web Embed',
      toggleMusicExplorer:    'Toggle Music Explorer'
    };
    return actionNames[action] || action;
  },

  startKeybindRecording(action, inputElement) {
    if (this.isRecordingKeybind) this.stopKeybindRecording();
    this.isRecordingKeybind = true;
    this.recordingAction = action;
    this.recordingInput = inputElement;
    inputElement.value = 'Press a key...';
    inputElement.classList.add('recording');
    this.keybindListener = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.code === 'Escape') { this.cancelKeybindRecording(); return; }
      this.recordKeybind(e.code);
    };
    document.addEventListener('keydown', this.keybindListener, true);
  },

  recordKeybind(keyCode) {
    if (!this.isRecordingKeybind) return;
    const conflictingAction = Object.keys(this.currentKeybinds).find(action =>
      this.currentKeybinds[action] === keyCode && action !== this.recordingAction
    );
    if (conflictingAction) {
      const currentBase  = this.recordingAction.replace(/2$/, '');
      const conflictBase = conflictingAction.replace(/2$/, '');
      if (currentBase !== conflictBase) {
        alert(`Key "${this.getKeyDisplayName(keyCode)}" is already used for "${this.getActionDisplayName(conflictingAction)}"!`);
        this.cancelKeybindRecording();
        return;
      }
      if (confirm(`Key "${this.getKeyDisplayName(keyCode)}" is already used for the same action. Click OK to swap, or Cancel to keep both.`)) {
        this.currentKeybinds[conflictingAction] = '';
      }
    }
    this.currentKeybinds[this.recordingAction] = keyCode;
    this.recordingInput.value = this.getKeyDisplayName(keyCode);
    this.recordingInput.classList.remove('recording');
    this.saveKeybinds().then(() => this.loadKeybindsSettings()).catch(console.error);
    this.stopKeybindRecording();
  },

  cancelKeybindRecording() {
    if (this.recordingInput) {
      this.recordingInput.value = this.getKeyDisplayName(this.currentKeybinds[this.recordingAction]);
      this.recordingInput.classList.remove('recording');
    }
    this.stopKeybindRecording();
  },

  stopKeybindRecording() {
    if (this.keybindListener) {
      document.removeEventListener('keydown', this.keybindListener, true);
      this.keybindListener = null;
    }
    this.isRecordingKeybind = false;
    this.recordingAction = null;
    this.recordingInput = null;
  },

  resetKeybindsToDefault() {
    if (confirm('Reset all keybinds to default?')) {
      this.currentKeybinds = { ...this.defaultKeybinds };
      this.saveKeybinds().then(() => this.loadKeybindsSettings()).catch(console.error);
    }
  },

  // ── Discover More (modal only) ────────────────────────────────────────────

  async loadDiscoverMoreSettings() {
    try {
      const e = this.elements;
      if (e.recentlyPlayedStorageLimit)   e.recentlyPlayedStorageLimit.value   = this.recentlyPlayedLimit || 20;
      if (e.recentlyPlayedDisplayLimit)   e.recentlyPlayedDisplayLimit.value   = this.recentlyPlayedDisplayLimit || 3;
      if (e.suggestedSongsDisplayLimit)   e.suggestedSongsDisplayLimit.value   = this.suggestedSongsDisplayLimit || 2;
      if (e.yourPicksDisplayLimit)        e.yourPicksDisplayLimit.value        = this.yourPicksDisplayLimit || 2;
      if (e.recentlyPlayedPlaylistsLimit) e.recentlyPlayedPlaylistsLimit.value = this.recentlyPlayedPlaylistsDisplayLimit || 1;
    } catch {
      this.setDefaultDiscoverMoreValues();
    }
  },

  setDefaultDiscoverMoreValues() {
    this.recentlyPlayedLimit               = this.recentlyPlayedLimit || 20;
    this.recentlyPlayedDisplayLimit        = 3;
    this.suggestedSongsDisplayLimit        = 2;
    this.yourPicksDisplayLimit             = 2;
    this.recentlyPlayedPlaylistsDisplayLimit = 1;
    const e = this.elements;
    if (e.recentlyPlayedStorageLimit)   e.recentlyPlayedStorageLimit.value   = this.recentlyPlayedLimit;
    if (e.recentlyPlayedDisplayLimit)   e.recentlyPlayedDisplayLimit.value   = this.recentlyPlayedDisplayLimit;
    if (e.suggestedSongsDisplayLimit)   e.suggestedSongsDisplayLimit.value   = this.suggestedSongsDisplayLimit;
    if (e.yourPicksDisplayLimit)        e.yourPicksDisplayLimit.value        = this.yourPicksDisplayLimit;
    if (e.recentlyPlayedPlaylistsLimit) e.recentlyPlayedPlaylistsLimit.value = this.recentlyPlayedPlaylistsDisplayLimit;
  },

  async handleSaveDiscoverMoreSettings() {
    try {
      const e = this.elements;
      const rsl  = parseInt(e.recentlyPlayedStorageLimit?.value)   || 20;
      const rdl  = parseInt(e.recentlyPlayedDisplayLimit?.value)   || 3;
      const ssdl = parseInt(e.suggestedSongsDisplayLimit?.value)   || 2;
      const ypdl = parseInt(e.yourPicksDisplayLimit?.value)        || 2;
      const rppl = parseInt(e.recentlyPlayedPlaylistsLimit?.value) || 1;

      const checks = [
        [rsl,  1, 100, "Recently played storage limit must be between 1 and 100"],
        [rdl,  1,  10, "Recently played display limit must be between 1 and 10"],
        [ssdl, 1,  10, "Suggested songs display limit must be between 1 and 10"],
        [ypdl, 1,  10, "Your picks display limit must be between 1 and 10"],
        [rppl, 1,   5, "Recently played playlists limit must be between 1 and 5"]
      ];
      for (const [val, min, max, msg] of checks) {
        if (val < min || val > max) { this.showNotification(msg, "error"); return; }
      }

      const oldLimit = this.recentlyPlayedLimit;
      this.recentlyPlayedLimit               = rsl;
      this.recentlyPlayedDisplayLimit        = rdl;
      this.suggestedSongsDisplayLimit        = ssdl;
      this.yourPicksDisplayLimit             = ypdl;
      this.recentlyPlayedPlaylistsDisplayLimit = rppl;

      await Promise.all([
        this.saveSetting("recentlyPlayedLimit",                rsl),
        this.saveSetting("recentlyPlayedDisplayLimit",         rdl),
        this.saveSetting("suggestedSongsDisplayLimit",         ssdl),
        this.saveSetting("yourPicksDisplayLimit",              ypdl),
        this.saveSetting("recentlyPlayedPlaylistsDisplayLimit",rppl)
      ]);

      if (oldLimit !== rsl && this.recentlyPlayedSongs.length > rsl) {
        this.recentlyPlayedSongs = this.recentlyPlayedSongs.slice(0, rsl);
        if (this.db) {
          this.db.transaction(["recentlyPlayed"], "readwrite")
            .objectStore("recentlyPlayed")
            .put({ type: "songs", items: this.recentlyPlayedSongs });
        }
      }

      this.renderAdditionalDetails();
      this.showNotification("Discover More settings saved!", "success");
    } catch {
      this.showNotification("Error saving Discover More settings", "error");
    }
  },

};
