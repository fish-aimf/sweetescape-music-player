// public/script/settings.js
// All settings-related methods for AdvancedMusicPlayer.
// Wired up in script.js via:
//   import { settingsMethods } from './public/script/settings.js';
//   Object.assign(AdvancedMusicPlayer.prototype, settingsMethods);

export const settingsMethods = {

  // ── Modal open/close ──────────────────────────────────────────────────────

  handleOpenSettings() {
    this.elements.settingsModal.style.display = "block";
    document.body.style.overflow = "hidden";
    this.initializeSettingsContent();
  },

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

  // ── Collapsible sections ──────────────────────────────────────────────────

  handleSectionToggle(event) {
    const header = event.currentTarget;
    const sectionType = header.dataset.section;
    const content = document.getElementById(`${sectionType}Content`);
    const arrow = header.querySelector('.section-arrow');
    if (!content || !arrow) {
      console.error(`Section content or arrow not found for: ${sectionType}`);
      return;
    }
    const isExpanded = content.classList.contains('expanded');
    content.classList.toggle('expanded', !isExpanded);
    arrow.classList.toggle('rotated', !isExpanded);
  },

  expandSection(sectionType) {
    const content = document.getElementById(`${sectionType}Content`);
    const arrow = document.querySelector(`[data-section="${sectionType}"]`)?.querySelector('.section-arrow');
    if (content && arrow) { content.classList.add('expanded'); arrow.classList.add('rotated'); }
  },

  collapseSection(sectionType) {
    const content = document.getElementById(`${sectionType}Content`);
    const arrow = document.querySelector(`[data-section="${sectionType}"]`)?.querySelector('.section-arrow');
    if (content && arrow) { content.classList.remove('expanded'); arrow.classList.remove('rotated'); }
  },

  collapseAllSections() {
    ['feedback', 'advertisement', 'theme'].forEach(s => this.collapseSection(s));
  },

  // ── Core settings load/save ───────────────────────────────────────────────

  loadSettings() {
    return new Promise((resolve, reject) => {
      if (!this.db) { reject("Database not initialized"); return; }
      try {
        const transaction = this.db.transaction(["settings"], "readonly");
        const store = transaction.objectStore("settings");
        const settingsToLoad = [
          { key: "listeningTime",      default: 0,    target: "listeningTime" },
          { key: "playbackSpeed",      default: 1,    target: "currentSpeed" },
          { key: "isPlaylistLooping",  default: true, target: "isPlaylistLooping" },
          { key: "recentlyPlayedLimit",default: 20,   target: "recentlyPlayedLimit" },
          { key: "allowDuplicates",    default: true, target: "allowDuplicates" },
        ];
        settingsToLoad.forEach(setting => {
          const request = store.get(setting.key);
          request.onsuccess = () => {
            this[setting.target] = request.result
              ? (request.result.value ?? setting.default)
              : setting.default;
          };
          request.onerror = () => {
            console.warn(`Failed to load setting: ${setting.key}, using default`);
            this[setting.target] = setting.default;
          };
        });
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject("Could not load settings");
      } catch (error) {
        console.error("Error in loadSettings:", error);
        reject("Exception in loadSettings");
      }
    });
  },

  async saveSetting(key, value) {
    if (!this.db) return;
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["settings"], "readwrite");
      const store = transaction.objectStore("settings");
      const request = store.put({ name: key, value });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  // ── Theme ─────────────────────────────────────────────────────────────────

  initializeTheme() {
    if (!this.db) {
      document.documentElement.setAttribute("data-theme", "dark");
      this.updateThemeIcon("dark");
      setTimeout(() => this.updateFaviconThemeFromDB(), 100);
      return;
    }
    const transaction = this.db.transaction(["settings"], "readonly");
    const store = transaction.objectStore("settings");
    const request = store.get("themeMode");
    request.onsuccess = () => {
      const savedTheme = request.result?.value ?? "dark";
      if (savedTheme === "custom") {
        this.loadCustomTheme();
      } else {
        document.documentElement.setAttribute("data-theme", savedTheme);
        this.updateThemeIcon(savedTheme);
        setTimeout(() => this.updateFaviconThemeFromDB(), 100);
      }
    };
    request.onerror = () => {
      document.documentElement.setAttribute("data-theme", "dark");
      this.updateThemeIcon("dark");
      setTimeout(() => this.updateFaviconThemeFromDB(), 100);
    };
  },

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const cycle = { light: "dark", dark: "custom", custom: "light" };
    const newTheme = cycle[currentTheme] ?? "light";

    if (newTheme === "custom") {
      this.loadCustomTheme();
    } else {
      document.documentElement.setAttribute("data-theme", newTheme);
      this.updateThemeIcon(newTheme);
      setTimeout(() => this.updateFaviconThemeFromDB(), 100);
    }

    this.saveSetting("themeMode", newTheme).catch(() => {
      document.documentElement.setAttribute("data-theme", currentTheme);
      this.updateThemeIcon(currentTheme);
    });

    if (this.elements.themeMode) {
      this.elements.themeMode.value = newTheme;
      this.elements.customThemeSection.style.display = newTheme === "custom" ? "block" : "none";
    }
  },

  loadThemeMode() {
    if (!this.db) return;
    const store = this.db.transaction(["settings"], "readonly").objectStore("settings");
    const request = store.get("themeMode");
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

  updateThemeIcon(theme) {
    const icon = this.elements.themeToggle.querySelector("i");
    icon.classList.remove("fa-moon", "fa-sun", "fa-palette");
    icon.classList.add(theme === "custom" ? "fa-palette" : theme === "light" ? "fa-moon" : "fa-sun");
  },

  // ── Custom theme ──────────────────────────────────────────────────────────

  loadCustomTheme() {
    const store = this.db.transaction(["settings"], "readonly").objectStore("settings");
    const colorKeys = [
      'customPrimary', 'customBackground', 'customSecondary',
      'customTextPrimary', 'customTextSecondary', 'customHover',
      'customBorder', 'customAccent', 'customButtonText',
      'customShadow', 'customError', 'customErrorHover', 'customYoutubeRed'
    ];
    const defaults = {
      customPrimary: '#3b82f6', customBackground: '#1e293b', customSecondary: '#334155',
      customTextPrimary: '#e2e8f0', customTextSecondary: '#94a3b8',
      customHover: '#2563eb', customBorder: '#475569', customAccent: '#3b82f6'
    };
    Promise.all(colorKeys.map(key => new Promise(resolve => {
      const req = store.get(key);
      req.onsuccess = () => resolve({ key, value: req.result?.value });
    }))).then(results => {
      const colors = {};
      results.forEach(r => { colors[r.key] = r.value || defaults[r.key]; });
      this.applyCustomColors({
        primary:     colors.customPrimary,
        background:  colors.customBackground,
        secondary:   colors.customSecondary,
        textPrimary: colors.customTextPrimary,
        textSecondary: colors.customTextSecondary,
        hover:       colors.customHover,
        border:      colors.customBorder,
        accent:      colors.customAccent
      });
      this.updateColorPickerValues(colors);
      document.documentElement.setAttribute("data-theme", "custom");
      this.updateThemeIcon("custom");
    });
  },

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

  applyCustomColors(colors) {
    const map = {
      primary:      '--custom-primary',
      background:   '--custom-background',
      secondary:    '--custom-secondary',
      textPrimary:  '--custom-text-primary',
      textSecondary:'--custom-text-secondary',
      hover:        '--custom-hover',
      border:       '--custom-border',
      accent:       '--custom-accent',
      buttonText:   '--custom-button-text',
      shadow:       '--custom-shadow',
      error:        '--custom-error',
      errorHover:   '--custom-error-hover',
      youtubeRed:   '--custom-youtube-red'
    };
    Object.entries(map).forEach(([k, v]) => {
      if (colors[k]) document.documentElement.style.setProperty(v, colors[k]);
    });
    setTimeout(() => this.updateFaviconThemeFromDB(), 150);
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

    const savePromises = [
      this.saveSetting("customPrimary",      customColors.primary),
      this.saveSetting("customBackground",   customColors.background),
      this.saveSetting("customSecondary",    customColors.secondary),
      this.saveSetting("customTextPrimary",  customColors.textPrimary),
      this.saveSetting("customTextSecondary",customColors.textSecondary),
      this.saveSetting("customHover",        customColors.hover),
      this.saveSetting("customBorder",       customColors.border),
      this.saveSetting("customAccent",       customColors.accent),
      this.saveSetting("customButtonText",   customColors.buttonText),
      this.saveSetting("customShadow",       customColors.shadow),
      this.saveSetting("customError",        customColors.error),
      this.saveSetting("customErrorHover",   customColors.errorHover),
      this.saveSetting("customYoutubeRed",   customColors.youtubeRed),
      this.saveSetting("themeMode",          "custom")
    ];
    Promise.all(savePromises)
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
      customPrimary:      defaultColors.primary,
      customBackground:   defaultColors.background,
      customSecondary:    defaultColors.secondary,
      customTextPrimary:  defaultColors.textPrimary,
      customTextSecondary:defaultColors.textSecondary,
      customHover:        defaultColors.hover,
      customBorder:       defaultColors.border,
      customAccent:       defaultColors.accent
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
      customPrimary:      'primaryColorPicker',
      customBackground:   'backgroundColorPicker',
      customSecondary:    'secondaryColorPicker',
      customTextPrimary:  'textPrimaryColorPicker',
      customTextSecondary:'textSecondaryColorPicker',
      customHover:        'hoverColorPicker',
      customBorder:       'borderColorPicker',
      customAccent:       'accentColorPicker'
    };
    const el = this.elements[pickerMap[key]];
    if (el) el.value = value;
  },

  updateColorPickerValues(colors) {
    const pickerMap = {
      primaryColorPicker:      colors.customPrimary,
      backgroundColorPicker:   colors.customBackground,
      secondaryColorPicker:    colors.customSecondary,
      textPrimaryColorPicker:  colors.customTextPrimary,
      textSecondaryColorPicker:colors.customTextSecondary,
      hoverColorPicker:        colors.customHover,
      borderColorPicker:       colors.customBorder,
      accentColorPicker:       colors.customAccent
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

  // ── Favicon ───────────────────────────────────────────────────────────────

  updateFaviconThemeFromDB() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'custom') {
      if (!this.db) return;
      const req = this.db.transaction(["settings"], "readonly").objectStore("settings").get("customAccent");
      req.onsuccess = () => this.updateFaviconColor(this.lightenDarkColor(req.result?.value || '#3b82f6'));
      req.onerror  = () => this.updateFaviconColor('#3b82f6');
    } else {
      const accentColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--accent-color').trim().replace(/`/g, '');
      if (accentColor) this.updateFaviconColor(this.lightenDarkColor(accentColor));
    }
  },

  updateFaviconColor(color) {
    fetch('favicon.svg')
      .then(r => r.text())
      .then(svgText => {
        const blob = new Blob(
          [svgText.replace(/fill="#5D9C59"/g, `fill="${color}"`)],
          { type: 'image/svg+xml' }
        );
        const url = URL.createObjectURL(blob);
        const favicon = document.querySelector('link[rel="icon"]');
        if (favicon) {
          if (favicon.href.startsWith('blob:')) URL.revokeObjectURL(favicon.href);
          favicon.href = url;
        }
      })
      .catch(e => console.error('Favicon update failed:', e));
  },

  lightenDarkColor(color) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    if ((r * 299 + g * 587 + b * 114) / 1000 < 100) {
      const f = 1.5;
      return `#${Math.min(255, Math.floor(r*f)).toString(16).padStart(2,'0')}` +
             `${Math.min(255, Math.floor(g*f)).toString(16).padStart(2,'0')}` +
             `${Math.min(255, Math.floor(b*f)).toString(16).padStart(2,'0')}`;
    }
    return color;
  },

  // ── Advertisements ────────────────────────────────────────────────────────

  initializeAdvertisementSettings() {
    this.loadAdvertisementSettings().catch(() => {
      this.adsEnabled = false;
      this.updateAdvertisementDisplay();
    });
  },

  async loadAdvertisementSettings() {
    try {
      if (!this.db?.objectStoreNames.contains("settings")) {
        this.adsEnabled = false;
        this.updateAdvertisementDisplay();
        return;
      }
      const req = this.db.transaction(["settings"], "readonly")
        .objectStore("settings").get("advertisementEnabled");
      return new Promise(resolve => {
        req.onsuccess = e => {
          this.adsEnabled = e.target.result?.value ?? false;
          this.updateAdvertisementDisplay();
          resolve();
        };
        req.onerror = () => {
          this.adsEnabled = false;
          this.updateAdvertisementDisplay();
          resolve();
        };
      });
    } catch {
      this.adsEnabled = false;
      this.updateAdvertisementDisplay();
    }
  },

  async saveAdvertisementSettings() {
    if (!this.db?.objectStoreNames.contains("settings")) return;
    const req = this.db.transaction(["settings"], "readwrite")
      .objectStore("settings")
      .put({ name: "advertisementEnabled", value: this.adsEnabled, lastUpdated: new Date().toISOString() });
    return new Promise((resolve, reject) => {
      req.onsuccess = () => resolve();
      req.onerror = e => reject(e.target.error);
    });
  },

  loadAdvertisementSettingsInModal() {
    if (this.elements.adsToggle) this.elements.adsToggle.checked = this.adsEnabled;
  },

  handleAdsToggle(event) {
    this.adsEnabled = event.target.checked;
    this.updateAdvertisementDisplay();
    this.saveAdvertisementSettings();
  },

  updateAdvertisementDisplay() {
    document.body.classList.toggle('ads-enabled', this.adsEnabled);
    if (this.elements.adsToggle) this.elements.adsToggle.checked = this.adsEnabled;
    if (this.adsEnabled) this.refreshAdvertisements();
  },

  refreshAdvertisements() {
    document.querySelectorAll('.left-banner iframe, .right-banner iframe').forEach(frame => {
      const src = frame.src;
      frame.src = '';
      setTimeout(() => frame.src = src, 100);
    });
  },

  // ── Visualizer ────────────────────────────────────────────────────────────

  loadVisualizerSettings() {
    if (!this.db) return;
    const req = this.db.transaction(["settings"], "readonly")
      .objectStore("settings").get("visualizerEnabled");
    req.onsuccess = () => {
      const enabled = req.result?.value ?? true;
      if (this.elements.visualizerToggle) this.elements.visualizerToggle.checked = enabled;
      const el = document.getElementById('musicVisualizer');
      if (enabled) {
        el.style.display = 'block';
        this.visualizer.isActive = true;
        if (!this.visualizer.animationId) this.startVisualizer();
      } else {
        el.style.display = 'none';
        this.visualizer.isActive = false;
        if (this.visualizer.animationId) {
          cancelAnimationFrame(this.visualizer.animationId);
          this.visualizer.animationId = null;
        }
      }
    };
  },

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

  // ── Library display settings ──────────────────────────────────────────────

  handleShowLibraryDropdown() {
    this.elements.libraryOptionsDropdown.classList.add("show");
  },

  handleHideLibraryDropdown() {
    this.elements.libraryOptionsDropdown.classList.remove("show");
  },

  handleToggleDeleteButtons(e) {
    this.showDeleteButtons = e.target.checked;
    this.saveLibraryDisplaySettings();
    this.renderSongLibrary();
  },

  handleToggleUnfavoriteButtons(e) {
    this.showUnfavoriteButtons = e.target.checked;
    this.saveLibraryDisplaySettings();
    this.renderSongLibrary();
  },

  handleToggleEditButtons(e) {
    this.showEditButtons = e.target.checked;
    this.saveLibraryDisplaySettings();
    this.renderSongLibrary();
  },

  saveLibraryDisplaySettings() {
    if (!this.db) return;
    const transaction = this.db.transaction(["userSettings"], "readwrite");
    const store = transaction.objectStore("userSettings");
    store.put({
      category:             "libraryDisplay",
      showDeleteButtons:    this.showDeleteButtons,
      showUnfavoriteButtons:this.showUnfavoriteButtons,
      showEditButtons:      this.showEditButtons
    });
  },

  loadLibraryDisplaySettings() {
    return new Promise((resolve) => {
      if (!this.db) { resolve(); return; }
      const transaction = this.db.transaction(["userSettings"], "readonly");
      const store = transaction.objectStore("userSettings");
      const request = store.get("libraryDisplay");
      request.onsuccess = () => {
        if (request.result) {
          this.showDeleteButtons     = request.result.showDeleteButtons     ?? true;
          this.showUnfavoriteButtons = request.result.showUnfavoriteButtons ?? true;
          this.showEditButtons       = request.result.showEditButtons       ?? true;
        }
        resolve();
      };
      request.onerror = () => resolve();
    });
  },

  syncLibraryDisplayUI() {
    if (this.elements?.showDeleteBtn) {
      this.elements.showDeleteBtn.checked      = this.showDeleteButtons;
      this.elements.showUnfavoriteBtn.checked  = this.showUnfavoriteButtons;
      this.elements.showEditBtn.checked        = this.showEditButtons;
    }
  },

  // ── Library sort/reverse ──────────────────────────────────────────────────

  handleLibrarySortToggle(event) {
    this.librarySortAlphabetically = event.target.checked;
    this.renderSongLibrary();
    this.saveSetting("librarySortAlphabetically", this.librarySortAlphabetically);
  },

  loadLibrarySortSetting() {
    if (!this.db) return;
    const store = this.db.transaction(["settings"], "readonly").objectStore("settings");
    const request = store.get("librarySortAlphabetically");
    request.onsuccess = () => {
      this.librarySortAlphabetically = request.result?.value ?? true;
      if (this.elements.librarySortToggle) {
        this.elements.librarySortToggle.checked = this.librarySortAlphabetically;
      }
      if (this.elements.songLibrary) this.renderSongLibrary();
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
    const store = this.db.transaction(["settings"], "readonly").objectStore("settings");
    const request = store.get("libraryReverseOrder");
    request.onsuccess = () => {
      this.libraryReverseOrder = request.result?.value ?? false;
      if (this.elements.libraryReverseToggle) {
        this.elements.libraryReverseToggle.checked = this.libraryReverseOrder;
      }
      if (this.elements.songLibrary) this.renderSongLibrary();
    };
    request.onerror = () => {
      this.libraryReverseOrder = false;
      if (this.elements.libraryReverseToggle) this.elements.libraryReverseToggle.checked = false;
    };
  },

  // ── Library sort/reverse value loaders (startup) ──────────────────────────

  loadLibrarySortValue() {
    return new Promise((resolve) => {
      if (!this.db) { resolve(); return; }
      const store = this.db.transaction(["settings"], "readonly").objectStore("settings");
      const request = store.get("librarySortAlphabetically");
      request.onsuccess = () => {
        this.librarySortAlphabetically = request.result?.value ?? true;
        resolve();
      };
      request.onerror = () => { this.librarySortAlphabetically = true; resolve(); };
    });
  },

  loadLibraryReverseValue() {
    return new Promise((resolve) => {
      if (!this.db) { resolve(); return; }
      const store = this.db.transaction(["settings"], "readonly").objectStore("settings");
      const request = store.get("libraryReverseOrder");
      request.onsuccess = () => {
        this.libraryReverseOrder = request.result?.value ?? false;
        resolve();
      };
      request.onerror = () => { this.libraryReverseOrder = false; resolve(); };
    });
  },

  loadVisualizerValue() {
    return new Promise((resolve) => {
      if (!this.db) { resolve(); return; }
      const store = this.db.transaction(["settings"], "readonly").objectStore("settings");
      const request = store.get("visualizerEnabled");
      request.onsuccess = () => {
        this.visualizerEnabled = request.result?.value ?? true;
        resolve();
      };
      request.onerror = () => { this.visualizerEnabled = true; resolve(); };
    });
  },

  syncVisualizerUI() {
    if (this.elements?.visualizerToggle) {
      this.elements.visualizerToggle.checked = this.visualizerEnabled ?? true;
    }
  },

  // ── Discord settings ──────────────────────────────────────────────────────

  async loadDiscordSettings() {
    try {
      const transaction = this.db.transaction(["settings"], "readonly");
      const store = transaction.objectStore("settings");
      const request = store.get("discordRPC");
      return new Promise((resolve) => {
        request.onsuccess = () => {
          if (request.result) this.discordEnabled = request.result.enabled || false;
          resolve();
        };
        request.onerror = () => resolve();
      });
    } catch (error) {
      console.error("Error loading Discord settings:", error);
    }
  },

  async saveDiscordSettings() {
    try {
      const transaction = this.db.transaction(["settings"], "readwrite");
      const store = transaction.objectStore("settings");
      await store.put({ name: "discordRPC", enabled: this.discordEnabled });
    } catch (error) {
      console.error("Error saving Discord settings:", error);
    }
  },

  // ── Keybinds ──────────────────────────────────────────────────────────────

  loadKeybinds() {
    return new Promise((resolve) => {
      if (!this.db) { resolve(); return; }
      const transaction = this.db.transaction(["userSettings"], "readonly");
      const store = transaction.objectStore("userSettings");
      const request = store.get("keybinds");
      request.onsuccess = (event) => {
        if (event.target.result?.settings) {
          this.currentKeybinds = { ...this.defaultKeybinds, ...event.target.result.settings };
        }
        resolve();
      };
      request.onerror = () => resolve();
    });
  },

  saveKeybinds() {
    return new Promise((resolve, reject) => {
      if (!this.db) { reject("Database not initialized"); return; }
      const transaction = this.db.transaction(["userSettings"], "readwrite");
      const store = transaction.objectStore("userSettings");
      store.put({ category: "keybinds", settings: this.currentKeybinds });
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject("Could not save keybinds");
    });
  },

  handleKeybind(code) {
    const k = this.currentKeybinds;
    const match = (key) => key && key !== '' && code === key;

    if (match(k.cycleFavicon))          { this.cycleFaviconAndTitle(); }
    else if (match(k.toggleWebEmbed))   { /* web embed logic */ }
    else if (match(k.togglePlayPause)  || match(k.togglePlayPause2))   { this.togglePlayPause(); }
    else if (match(k.previousSong)     || match(k.previousSong2))      { this.playPreviousSong(); }
    else if (match(k.nextSong)         || match(k.nextSong2))          { this.playNextSong(); }
    else if (match(k.volumeUp))         { this.adjustVolume(0.1); }
    else if (match(k.volumeDown))       { this.adjustVolume(-0.1); }
    else if (match(k.toggleLoop))       { this.toggleLoop(); }
    else if (match(k.restartSong))      { if (this.ytPlayer) this.ytPlayer.seekTo(0, true); }
    else if (match(k.toggleTheme))      { this.toggleTheme(); }
    else if (match(k.openTimer))        { this.openTimerModal(); }
    else if (match(k.volumeUpFine))     { this.adjustVolume(0.01); }
    else if (match(k.volumeDownFine))   { this.adjustVolume(-0.01); }
    else if (match(k.toggleControlBar)) { this.toggleControlBar(); }
    else if (match(k.togglePlaylistSidebar) || match(k.togglePlaylistSidebar2)) { this.togglePlaylistSidebar(); }
    else if (match(k.cycleTab))         { this.cycleToNextTab(); }
    else if (match(k.toggleVideoFullscreen)) {
      if (this.ytPlayer && this.elements.currentSongName.textContent !== "No Song Playing") {
        this.toggleVideoFullscreen();
      }
    }
    else if (match(k.showQueue))             { this.showQueueOverlay(); }
    else if (match(k.toggleMusicExplorer))   { this.toggleAdditionalDetails(); }
  },

  loadKeybindsSettings() {
    const keybindInputs = document.querySelectorAll('.keybind-input');
    keybindInputs.forEach(input => {
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
      if (confirm(`Key "${this.getKeyDisplayName(keyCode)}" is already used for the same action. Click OK to swap the keys, or Cancel to keep both.`)) {
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

  // ── Discover More ─────────────────────────────────────────────────────────

  async loadDiscoverMoreSettingsOnStartup() {
    try {
      if (!this.db?.objectStoreNames.contains("settings")) {
        this.setDefaultDiscoverMoreValuesOnStartup();
        return;
      }
      const store = this.db.transaction(["settings"], "readonly").objectStore("settings");
      const keys = [
        "recentlyPlayedLimit", "recentlyPlayedDisplayLimit",
        "suggestedSongsDisplayLimit", "yourPicksDisplayLimit",
        "recentlyPlayedPlaylistsDisplayLimit"
      ];
      const results = await Promise.all(keys.map(key => new Promise(resolve => {
        const req = store.get(key);
        req.onsuccess = () => resolve({ key, value: req.result?.value });
        req.onerror  = () => resolve({ key, value: null });
      })));
      const defaults = {
        recentlyPlayedLimit: 20, recentlyPlayedDisplayLimit: 3,
        suggestedSongsDisplayLimit: 2, yourPicksDisplayLimit: 2,
        recentlyPlayedPlaylistsDisplayLimit: 1
      };
      results.forEach(r => { this[r.key] = r.value ?? defaults[r.key]; });
    } catch {
      this.setDefaultDiscoverMoreValuesOnStartup();
    }
  },

  setDefaultDiscoverMoreValuesOnStartup() {
    this.recentlyPlayedLimit               = this.recentlyPlayedLimit || 20;
    this.recentlyPlayedDisplayLimit        = 3;
    this.suggestedSongsDisplayLimit        = 2;
    this.yourPicksDisplayLimit             = 2;
    this.recentlyPlayedPlaylistsDisplayLimit = 1;
  },

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
        this.saveSetting("recentlyPlayedLimit",               rsl),
        this.saveSetting("recentlyPlayedDisplayLimit",        rdl),
        this.saveSetting("suggestedSongsDisplayLimit",        ssdl),
        this.saveSetting("yourPicksDisplayLimit",             ypdl),
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
      this.showNotification("Discover More settings saved successfully!", "success");
    } catch {
      this.showNotification("Error saving Discover More settings", "error");
    }
  },

  // ── Notifications ─────────────────────────────────────────────────────────

  showNotification(message, type = "info") {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed; top: 20px; right: 20px; padding: 10px 20px;
      border-radius: 4px; color: white; z-index: 10000;
      background-color: ${type === 'success' ? 'var(--accent-color)' : '#f44336'};
      opacity: 0; transition: opacity 0.3s;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.style.opacity = '1', 10);
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  },

};
