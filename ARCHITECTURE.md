# SweetEscape Music Player Architecture

This document explains the structure and main components of **SweetEscape Music Player**, so contributors can understand how the project works and where to start.

---

## 📁 Project Files

- **index.html**  
  Main HTML layout for the player. Contains the player UI, playlist, lyric section, control buttons, and discovery system.

- **style.css**  
  Feature stylesheet: layout, per-component styling, and responsive rules.

- **ui-system.css**  
  The UI design system. Loaded after `style.css` so it is authoritative for shared chrome. See "UI Design System" below.

- **script.js**  
  Contains the **single class** `AdvancedMusicPlayer`, which controls all functionality (see below).

- **public/changelog.md**  
  Contains version history, feature updates, and roadmap information.

- **favicon.svg**  
  Icon displayed in the browser tab.

- **billboard.html**  
  Loaded daily by a bot to update the Supabase billboard automatically.

- **captures/**  
  Directory where logs are stored as `.txt` files.

---

## 🎨 UI Design System (`public/ui-system.css`)

Every dialog in the app renders through one system. `ui-system.css` loads after
`style.css`, so where the two disagree the system wins.

The file has four layers, in order:

1. **Tokens** — `:root` custom properties (`--ui-*`): radii, spacing, type scale,
   surfaces, shadows, overlay, modal padding and widths, control heights, motion,
   z-index. Change a value here and every dialog follows.
2. **Primitives** — the canonical classes. Build new UI out of these:
   - `.ui-overlay` + `.ui-modal` (`--sm` 420 / `--md` 560 / `--lg` 720 / `--xl` 900 / `--2xl` 1080 / `--full`)
   - `.ui-modal__header` > `.ui-modal__title` (+ `.ui-modal__subtitle`, `.ui-modal__header-actions`) + `.ui-modal__close`
   - `.ui-modal__body` (`--stack` for a vertical gap), `.ui-modal__footer`
   - `.ui-btn` (`--primary` / `--ghost` / `--danger` / `--sm` / `--block`), `.ui-icon-btn`
   - `.ui-input`, `.ui-select`, `.ui-textarea`, `.ui-field`, `.ui-label`
   - `.ui-card`, `.ui-chip`, `.ui-tabs` / `.ui-tab`, `.ui-section-label`, `.ui-empty`, `.ui-scroll`
3. **Adoption map** — maps the older per-feature class names (`.settings-modal-*`,
   `.dl-*`, `.sz-*`, `.ls-*`, `.discord-modal-*`, `.subtitles-import-*`, …) onto the
   same declarations, so legacy markup looks identical without being rewritten. To
   retire a legacy prefix, add the primitive classes to its markup and delete its
   entry here.
4. **Responsive + reduced motion** — one breakpoint at 768px that retunes the tokens.

### Conventions

- Overlays are shown with `display: flex` (inline style, or an existing `.active` /
  `.subtitles-import-modal-show` class). Never `display: block` — the overlay centres
  its modal with flex.
- Icons are Font Awesome 6 with an explicit style prefix (`fas` / `far` / `fab`).
  Close buttons are `<i class="fas fa-times">`; titles take one accent-coloured icon.
- JS-built dialogs use the `UI` factory at the top of `script.js`:
  `UI.modal({ title, icon, size, className, bodyClassName })` returns
  `{ overlay, shell, header, heading, body, footer, close, addFooter, open }`, and
  `UI.button(label, { variant, size, icon, block, onClick })` builds a `.ui-btn`.
  Prefer these over hand-rolling `document.createElement` chains and inline styles.
- No comments in source files; naming and this document carry the intent.

### Adding a new dialog

```js
const dialog = UI.modal({ title: 'My Dialog', icon: 'fa-star', size: 'md' });
dialog.body.append(/* content */);
dialog.addFooter(UI.button('Save', { variant: 'primary', onClick: save }));
dialog.open();
```

Nothing else is needed — chrome, motion, scrollbars, theming and the mobile
breakpoint all come from the system.

---

## 🧩 Core Architecture

**The entire project revolves around a single class: `AdvancedMusicPlayer`.**  

Everything—player functionality, playlists, lyrics, discovery system, IndexedDB storage, YouTube integration, visualizer, hotkeys, UI initialization—is encapsulated in this class.  

### Key Points:

- **Single Responsibility Container**: All logic, state, and UI management are centralized in one place.  
- **Easy to Track**: Contributors only need to understand `AdvancedMusicPlayer` to work on any feature.  
- **Initialization Flow**:
  - `_initialize()` sets up IndexedDB, loads libraries, playlists, settings, recently played songs, discovery settings, and keybinds.  
  - `initializeElements()` maps DOM elements for easy access.  
  - `_syncInitialUI()` synchronizes UI toggle states, visualizer, and library display.  
  - `_setupComponents()` sets up YouTube player, queue, event listeners, playlist sidebar, theme, autoplay, keyboard controls, lyrics tab, visualizer, changelog modal, and library results delegation.  

- **All Methods Inside the Class**: Methods for playback, queue, playlist management, lyrics, visualizer, hotkeys, theme, cleanup, and state persistence are all defined inside `AdvancedMusicPlayer`.  
- **No Other Classes**: There are no additional classes or modules in the project. All functionality is accessed via a single instance of this class.

**Implication for Contributors**:  
To add features, fix bugs, or improve performance, you only need to work within `AdvancedMusicPlayer`. Understanding this class is equivalent to understanding the entire project.

---

## ⚡ Component Overview

| Component                  | Responsible For                                                                 |
|-----------------------------|-------------------------------------------------------------------------------|
| IndexedDB (`MusicPlayerDB`) | Storing playlists, songs, settings, recently played tracks                     |
| UI Elements                 | Inputs, buttons, toggle switches, playlist sidebar, lyrics, visualizer        |
| YouTube Player              | Embedded video playback, search results, discovery system                     |
| Event Listeners             | Keyboard shortcuts, click events, playlist interactions                        |
| Visualizer                  | Animations synced with song playback                                           |
| Logs / Captures             | Text logs stored in `captures/` for debugging                                  |
| Billboard                   | Updates external Supabase billboard daily via `billboard.html`                 |

---

## 📝 Major Responsibilities of `AdvancedMusicPlayer`

### Initialization
- `_initialize()`
- `_handleInitializationError(error)`

### Database
- `initDatabase()` — Opens/creates IndexedDB object stores:
  - `songLibrary`
  - `playlists`
  - `settings`
  - `recentlyPlayed`
  - `userSettings`

### UI
- `initializeElements()` — Maps DOM elements  
- `_syncInitialUI()` — Syncs toggle states, visualizer, and library display  
- `_setupComponents()` — Sets up YouTube player, queue, event listeners, playlist sidebar, theme, autoplay, keyboard controls, lyrics tab, visualizer, changelog modal, and library results delegation

### State Management
- `cleanup()`, `saveCurrentState()`, `clearTimersAndIntervals()`, `cleanupYouTubePlayer()`  
- `restorePageAppearance()`, `disconnectObservers()`, `removeDynamicEventListeners()`, `gracefulDatabaseClose()`

### Other Systems
- Playback / Queue — Handling current song, queue, loop, shuffle  
- Playlist Management — Adding/removing songs, saving playlists  
- Library & Discovery — Loading and sorting the song library, discovery suggestions  
- Visualizer / Themes — Managing UI animations, colors, and visualizer display  
- Hotkeys & Keyboard Controls — Mapping keys to player actions  
- Lyrics & Additional Details — Displaying and syncing lyrics, rendering extra song info  

---

## 📌 Notes for Contributors

- All functionality is in **`AdvancedMusicPlayer`**; focus on this file for major changes.  
- Use `initializeElements()` and `_setupComponents()` to add new UI features.  
- IndexedDB-related methods handle all persistent storage; check `initDatabase()`.  
- For performance-sensitive changes, review methods that load libraries or playlists in parallel.  
- See `[public/changelog.md]` for roadmap, `[jobs.md]` for contributor tasks, and `[issues-and-updates.md]` for known issues.
