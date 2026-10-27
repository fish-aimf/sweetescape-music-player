# CODEMAP

Generated index of `public/script.js` and the dialogs in `public/index.html`, so a
method can be located without searching a 600 KB file. Regenerate with:

```bash
node scripts/codemap.js
```

Line numbers are navigation hints for `sed -n`, not guarantees — if the line does
not hold what this file claims, regenerate, or `grep -n "  methodName("`.

| Source | sha256 (first 12) | Lines |
|---|---|---|
| `public/script.js` | `f567a98c6aec` | 16543 |
| `public/index.html` | `6cae17fc6031` | 1502 |
| `public/script/settings.js` | `b1cbbfc3625b` | 561 |
| `public/karaoke-player.js` | `ec6846376de2` | 683 |
| `public/karaoke-encoder.js` | `d277db62d9e9` | 147 |
| `public/sw.js` | `cec0198433af` | 226 |

---

## Reading `public/script.js` cheaply

- 75 lines are longer than 300 characters (the machine-formatted
  `innerHTML` template literals; the longest is ~3.9 KB). A single `grep -n` that hits
  several of them dumps tens of kilobytes. Search with `grep -o`, or pipe through
  `cut -c1-200`, and only widen once you know which line you want.
- Read by range (`sed -n '1200,1260p'`) rather than opening the file.
- `UI` factory: lines 1-85. `AdvancedMusicPlayer`: line 350 onwards.

---

## `UI` factory (4 members)

`el` 3 · `icon` 13 · `button` 16 · `modal` 37

---

## `AdvancedMusicPlayer` by topic (629 methods)

Names only. `grep -n "^  name(" public/script.js` gives the current line, and a name
here that you cannot find has been renamed since this file was generated.

### Startup & database

`_initialize` · `initDatabase` · `loadSettings` · `saveSetting` · `loadSongLibrary` · `saveSongLibrary` · `saveSingleSong` · `loadPlaylists` · `savePlaylists` · `loadRecentlyPlayed` · `loadDiscoverMoreSettingsOnStartup` · `loadDiscoverMoreSettings` · `loadLibrarySortValue` · `loadLibraryReverseValue` · `loadVisualizerValue` · `loadLibrarySortSetting` · `loadLibraryReverseSetting` · `repairEncodedFields` · `repairEncodedStoredText` · `cleanupGhostEventListeners` · `loadInstructions` · `savePlaylistNameEdit` · `saveRecentlyPlayedSong` · `saveRecentlyPlayedPlaylist` · `loadLyricsStageSong` · `saveLyricsFromModal` · `saveQueue` · `loadQueue` · `loadAdvertisementSettingsInModal` · `loadThemeMode` · `loadAlbumArt` · `loadCustomTheme` · `loadCustomThemeColors` · `saveNamedTheme` · `loadSavedThemesList` · `loadAdvertisementSettings` · `saveAdvertisementSettings` · `loadMoreGlobalLibraryArtistSongs` · `loadRecommendations` · `loadRandomRecommendations` · `loadBillboardHot100Top3` · `loadMoreYouTubeLibraryResults` · `loadKeybinds` · `saveKeybinds` · `loadKeybindsSettings` · `loadDiscordSettings` · `saveDiscordSettings` · `saveListeningStatsSetting` · `saveListeningTime` · `cleanupTemporarySongPlayer` · `loadVersion` · `loadAndShowChangelog` · `cleanup` · `cleanupLocalAudio` · `cleanupVisualizer` · `cleanupVirtualScroll` · `cleanupDiscoveryObserver` · `cleanupMiscState` · `saveCurrentState` · `clearTimersAndIntervals` · `cleanupYouTubePlayer` · `gracefulDatabaseClose` · `cleanupBillboardAndGlobalLibrary`

### Song library

`_setupLibraryModificationModalTabs` · `switchLibraryModificationTab` · `handleLibrarySortToggle` · `handleLibraryReverseToggle` · `addSongToLibrary` · `renderSongLibrary` · `renderLibraryView` · `setupSongLibraryDelegation` · `filterLibrarySongs` · `handleLibrarySearchInput` · `showAddToLibrarySuggestion` · `_buildFavoritesCard` · `_syncLibraryPlayingState` · `toggleFavorite` · `syncFavoritesOnLoad` · `batchFavoriteUpdate` · `updateFavoritesPlaylist` · `getFavoritesPlaylist` · `createFavoritesPlaylist` · `openSongEditModal` · `updateSongDetails` · `openLibraryModal` · `closeLibraryModal` · `initLibraryFilter` · `_applyLibraryFiltersAndRender` · `resetLibrarySearchTimeout` · `renderLibrarySearchResults` · `addSongToCurrentPlaylist` · `addSongToSelectedPlaylist` · `openLyricsLibraryModal` · `exportLibrary` · `importLibrary` · `initGlobalLibraryDebouncedSearch` · `handleGlobalLibraryDebouncedSearchInput` · `executeGlobalLibraryCatalogSearch` · `renderGlobalLibrarySearchSuggestionsDropdownLoading` · `renderGlobalLibrarySearchSuggestionsDropdownError` · `renderGlobalLibrarySearchSuggestionsDropdown` · `closeGlobalLibrarySearchSuggestionsDropdown` · `handleGlobalLibraryArtistCardClick` · `renderGlobalLibraryArtistSongsGrid` · `closeGlobalLibraryArtistSongsGrid` · `handleGlobalLibrarySongCardClick` · `renderGlobalLibrarySongDetailCardLoading` · `renderGlobalLibrarySongDetailCardError` · `renderGlobalLibrarySongDetailCard` · `closeGlobalLibrarySongDetailCard` · `normalizeGlobalLibrarySearchKey` · `resolveGlobalLibrarySongYouTubeId` · `fetchGlobalLibrarySongFromYouTube` · `runGlobalLibraryYouTubeSearch` · `populateAddSongToLibraryModalFromGlobalLibrary` · `returnToGlobalLibraryPreviousView` · `addPremadePlaylistToLocalLibrary` · `addBillboardSongToLibrary` · `searchYouTubeForLibraryMatches` · `renderYouTubeLibrarySearchResults` · `createYouTubeLibraryResultCard` · `setupYouTubeLibraryResultsDelegation`

### Playback & queue

`_setupSpeedButton` · `_shuffleArray` · `togglePlaylistEditMode` · `playSong` · `playSongById` · `togglePlayPause` · `playNextSong` · `playPreviousSong` · `playSongFromPlaylist` · `seekMusic` · `seekBy` · `setVolume` · `adjustVolume` · `showVolumeIndicator` · `toggleLoop` · `togglePlaylistLoop` · `updatePlaylistLoopButton` · `toggleAutoplay` · `initializeAutoplay` · `setPlaybackSpeed` · `toggleSpeedOptions` · `playNextNonSkippedSong` · `updateProgressBar` · `togglePlaylistSidebar` · `togglePlaylistSidebarMode` · `addToQueue` · `addLoopBlock` · `removeFromQueue` · `clearQueue` · `shuffleQueue` · `duplicateQueueBlock` · `_debouncedSaveQueue` · `_consumeQueueHead` · `reorderQueue` · `updateQueueVisualIndicators` · `showQueueNotification` · `_queueRefreshPanel` · `_queueBuildOverlay` · `showQueueOverlay` · `_queueRenderRows` · `_queueBuildRow` · `_queueBindDrag` · `_queueBindSearch` · `addQueueStyles`

### Playlists

`_refreshPlaylistsShelf` · `_buildPlaylistsShelf` · `_buildPlaylistShelfTile` · `_buildCreatePlaylistShelfTile` · `_openCreatePlaylistFromShelf` · `createPlaylist` · `updatePlaylistEditModeButton` · `renderPlaylists` · `filterPlaylists` · `playTopPlaylistSearchResult` · `toggleCreatePlaylistDiv` · `hideCreatePlaylistDiv` · `openPlaylistEditModal` · `renderCurrentPlaylistSongs` · `searchSongsToAddToPlaylist` · `clearPlaylistDuplicates` · `reversePlaylistOrder` · `randomizePlaylist` · `updatePlaylistSelection` · `removeSongFromPlaylist` · `closePlaylistModal` · `deletePlaylist` · `playPlaylist` · `setupPlaylistNameEditing` · `cancelPlaylistNameEdit` · `handlePlaylistDragStart` · `handlePlaylistDragOver` · `handlePlaylistDrop` · `getPlaylistDragAfterElement` · `getPlaylistDuration` · `getPlaylistDurationText` · `renderPlaylistSidebar` · `renderPlaylistSidebarExpandedMode` · `renderPlaylistSidebarOverlayMode` · `applyPlaylistSidebarMode` · `setupPlaylistSidebarModeListeners` · `filterPlaylistSidebarSongs` · `exportPlaylist` · `showPlaylistSelectionForExport` · `exportSongsWithAllPlaylists` · `createImportedPlaylists` · `searchPremadePlaylistsSupabase`

### YouTube & search

`_searchFold` · `_buildSearchFoldTables` · `autofillFromUrl` · `showYouTubeSearchSuggestion` · `hideYouTubeSearchSuggestion` · `searchYouTube` · `validateYouTubeUrl` · `showYouTubeThumbnailPreview` · `removeYouTubeThumbnailPreview` · `handleAutofill` · `undoAutofill` · `showGhostPreview` · `createGhostPreview` · `createGhostElement` · `positionGhost` · `setupGhostEventListeners` · `updateGhostPositions` · `removeGhostPreview` · `extractYouTubeId` · `fetchYouTubeTitle` · `stripYouTubeTopicSuffix` · `fetchYouTubeChannel` · `setupYouTubePlayer` · `initializeYouTubePlayer` · `getRandomYouTubeApiKey` · `getYouTubeThumbnail` · `replaceSongVideoFromSearch` · `formatYouTubeViewCount` · `autofillYouTubeVideoFromSearch` · `formatYouTubeUploadDate` · `_trackYouTubePlayStat` · `_handleStatsSearchInput`

### Lyrics & karaoke

`renderLyricsTab` · `_startLyricsInterval` · `generateKaraokeURL` · `shareKaraokeURL` · `updateHighlightedLyric` · `setupLyricsTabContextMenu` · `openLyricsMakerModal` · `initLyricMaker` · `openLyricsModePicker` · `resolveLyricsStageSong` · `parseStageLyrics` · `buildLyricsStage` · `openLyricsStage` · `closeLyricsStage` · `syncLyricsStageKeys` · `syncLyricsStageInset` · `setLyricsStageCover` · `readLyricsClock` · `tickLyricsStage` · `relayoutLyricsStage` · `openImportSubtitlesModal` · `setupSubtitlesImportEventListeners` · `closeSubtitlesImportModal` · `resetSubtitlesImportForm` · `convertTranscriptToLyricsHandler` · `convertTranscriptToLyrics` · `formatLyricText`

### Discovery, stats & charts

`setDefaultDiscoverMoreValuesOnStartup` · `setDefaultDiscoverMoreValues` · `handleSaveDiscoverMoreSettings` · `_buildDiscoveryCard` · `_buildDiscoverySongItem` · `getCombinedRecentlyPlayed` · `showRecentlyPlayedModal` · `setupRecentlyPlayedModalListeners` · `renderRecentlyPlayedContent` · `hideRecentlyPlayedModal` · `removeFromRecentlyPlayed` · `updateRecentlyPlayedLimit` · `initSupabaseForFindSongs` · `checkGlobalSongCacheSupabase` · `insertGlobalSongCacheSupabase` · `displayBillboardHot100Top3` · `openBillboardHot100Modal` · `displayBillboardHot100FullModal` · `createBillboardSongElementInModal` · `closeBillboardHot100Modal` · `initShazamModal` · `handleListeningStatsToggle` · `clearListeningStats` · `_statsDayKey` · `openStatsModal` · `closeStatsModal` · `renderListeningStats` · `_renderStatsPanel` · `_syncStatsRangeTabs` · `_buildStatsSummaryHtml` · `_statsTilesHtml` · `_buildStatsSectionHtml` · `_statsRowHtml` · `_handleStatsRowKeydown` · `_statsDateLabel` · `openSongStatsModal` · `_songStatsBuckets` · `_songStatsChartSvg` · `_handleStatsShowAllClick` · `_handleStatsRangeToggle`

### Appearance & visualizer

`getAppearanceDefaults` · `initializeAppearance` · `setAppearanceBackgroundBlob` · `applyAppearance` · `getAppearanceBackgroundValue` · `sampleAppearanceBackground` · `syncAlbumArtBackdrop` · `getGlassBackdropColors` · `renderAppearanceControls` · `renderVisualizerColorControls` · `handleVisualizerColorModeClick` · `handleVisualizerColorInput` · `renderAppearancePresets` · `updateAppearance` · `handleSurfaceStyleChange` · `handleAppearanceSliderInput` · `setupAppearanceListeners` · `initializeTheme` · `handleSaveCustomTheme` · `handleThemeModeChange` · `toggleTheme` · `updateFaviconThemeFromDB` · `updateThemeIcon` · `exportTheme` · `importTheme` · `applyImportedTheme` · `resetCustomTheme` · `applySavedTheme` · `deleteSavedTheme` · `_getSavedThemesRecord` · `_writeSavedThemes` · `initializeVisualizer` · `buildVisualizerBars` · `buildVisualizerBands` · `attachVisualizerAnalyser` · `resumeVisualizerAudio` · `idleVisualizerAudio` · `startVisualizer` · `renderVisualizerFrame` · `sampleVisualizerLevels` · `sampleVisualizerWave` · `readVisualizerColor` · `vividVisualizerColor` · `invalidateVisualizerPalette` · `getVisualizerBackdropColors` · `getAutoVisualizerColor` · `refreshVisualizerPalette` · `buildVisualizerGlowSprites` · `drawVisualizerFrame` · `drawVisualizerBars` · `drawVisualizerLevels` · `drawVisualizerWave` · `drawVisualizerRibbon` · `drawVisualizerRadial` · `drawVisualizerGlow` · `destroyVisualizer` · `refreshVisualizerPower` · `syncVisualizerUI` · `renderVisualizerStyleOptions` · `handleVisualizerStyleClick` · `setVisualizerStyle` · `clampVisualizerGain` · `renderVisualizerGainLabel` · `handleVisualizerGainInput` · `handleVisualizerToggle` · `restorePageAppearance`

### Modals, notifications & UI chrome

`_checkControlBarVisibility` · `showWelcomeModal` · `showSidebar` · `hideSidebar` · `updateSidebarModeToggleIcon` · `switchTab` · `cycleToNextTab` · `initNowPlayingTab` · `showNowPlayingTab` · `hideNowPlayingTab` · `openDisguiseModal` · `buildDisguiseModal` · `syncDisguiseModal` · `openTimerModal` · `toggleControlBar` · `showExportModal` · `showImportModal` · `closeImportModal` · `handleSettingsModalClick` · `setupTabs` · `handleTabSwitch` · `showNotification` · `openDiscordModal` · `closeDiscordModal` · `_discordRefreshModal` · `initDownloadModal` · `suspendHiddenTabWork` · `openTemporarySongSampleModal` · `closeTemporarySongSampleModal` · `createTemporarySongModal` · `showChangelogModal` · `setupChangelogModal`

### Input, keybinds & escaping

`setupGuideHotkey` · `setupKeyboardControls` · `escapeJsStringForAttribute` · `escapeHtml` · `decodeHtmlEntities` · `handleUrlPaste` · `_setupSongItemDragDrop` · `handleDragStart` · `handleDragOver` · `handleDragEnd` · `getDragAfterElement` · `startKeybindRecording` · `recordKeybind` · `cancelKeybindRecording` · `stopKeybindRecording` · `resetKeybindsToDefault` · `handleKeybind`

### Settings, import & export

`disguiseIconUrl` · `applyFaviconDisguise` · `showExportDropdown` · `hideExportDropdown` · `addImportedSongsOneByOne` · `setupExportButtonListeners` · `handleOpenSettings` · `handleCloseSettings` · `initializeSettingsContent` · `getSetting` · `initializeAdvertisementSettings` · `initDiscordConnection` · `closeDiscordConnection` · `sendDiscordRPC` · `updateDiscordButtonUI` · `_discordRefreshSteps` · `_discordShowError` · `_discordShowSuccess` · `_discordSyncPreview` · `_discordSyncFields` · `_discordOnFieldEdit` · `_discordResetFields` · `_discordSendNow` · `_discordScheduleSend` · `_discordGetAuto` · `_discordGetEffective` · `_discordSyncLastUpdate` · `_discordStartLastUpdateTick` · `_discordStopLastUpdateTick` · `_discordRetry`

### Uncategorised

`_syncInitialUI` · `_setupComponents` · `_handleInitializationError` · `_recoverFromStaleCache` · `initializeElements` · `setupEventListeners` · `_setupDelegatedListeners` · `setupNavigationGuards` · `openGuide` · `renderInitialState` · `debounce` · `deleteSingleSong` · `_getDefaultSectionOrder` · `_renderSectionOrderUI` · `_moveSectionOrderRow` · `removeSong` · `_mountVirtualScroll` · `_destroyVirtualScroll` · `createSongElement` · `playFirstVisibleSong` · `_buildFavThumb` · `checkVideoRestrictions` · `parseVideoTitle` · `removeNoisePatterns` · `extractFeaturedArtists` · `_applyFilters` · `_renderLanguageFilterList` · `_detectSongLanguage` · `_detectTextLanguage` · `createDuplicateToggle` · `updateDuplicatesButtonText` · `handleDrop` · `handleSongNameRightClick` · `playCurrentSong` · `_syncTransportDisplays` · `_getPreviewSource` · `_songToPreviewItem` · `getUpcomingSongsPreview` · `getPreviousSongsPreview` · `_buildTransportPreviewPopup` · `showTransportPreview` · `hideTransportPreview` · `setupTransportHoverPreviews` · `restartCurrentSong` · `temporarilySkipSong` · `isSongTemporarilySkipped` · `playLocalAudio` · `updatePlayerUI` · `formatTime` · `formatDuration` · `onPlayerReady` · `onPlayerError` · `onPlayerStateChange` · `updateNowPlayingView` · `initializeCurrentSongSection` · `updateCurrentSongDisplay` · `showCurrentSongSection` · `hideCurrentSongSection` · `renderAdditionalDetails` · `createDetailsSection` · `refreshSpecificSection` · `toggleAdditionalDetails` · `getRandomItems` · `getTimeAgorecentlyplayedmodel` · `stopPlaybackTrackingIntervals` · `fillStageWords` · `measureStageCards` · `findStageLine` · `applyStageLine` · `layoutStageVerse` · `layoutStageFlow` · `layoutStageStanza` · `frameStageCards` · `autoFetchTranscript` · `populateTranscriptLangDropdown` · `addTimestampsToPlainText` · `formatSupadataTranscriptForConversion` · `isMobileConnection` · `toggleVideoFullscreen` · `showVideoFullscreen` · `hideVideoFullscreen` · `showVideoHint` · `hideVideoHint` · `addStopBlock` · `normalizeEmbedUrl` · `openWebEmbed` · `closeWebEmbed` · `changeFavicon` · `startTitleMonitor` · `stopTitleMonitor` · `updatePageTitle` · `setSpecificTimeTimer` · `setAppTimer` · `stopMusic` · `closeApp` · `clearAppTimer` · `updateTimerCountdown` · `setupTimerEventListeners` · `adjustLayoutTogglePosition` · `setupLayoutEventListeners` · `copyToClipboardWithFallback` · `parseSongLine` · `getGlassPresets` · `getBackgroundGradients` · `readCssColor` · `sampleImageColors` · `getAlbumArtSong` · `paintAlbumArt` · `renderAlbumArt` · `showAlbumArt` · `observeRootStyle` · `scheduleGlassLegibility` · `refreshGlassLegibility` · `relativeLuminance` · `contrastRatio` · `renderBackgroundGradients` · `renderBackgroundPreview` · `handleAlbumArtToggle` · `handleGlassPresetClick` · `handleBackgroundFitChange` · `handleBackgroundGradientClick` · `handleBackgroundFileChange` · `handleBackgroundRemove` · `applyCustomColors` · `updateColorPickerByKey` · `updateColorPickerValues` · `updateFaviconColor` · `lightenDarkColor` · `hexToRgba` · `handleAdsToggle` · `updateAdvertisementDisplay` · `resizeCanvas` · `pickVibrantColor` · `rgbToHsl` · `hslToRgb` · `toggleMiniplayer` · `openMiniplayer` · `closeMiniplayer` · `handleMiniplayerClosed` · `buildMiniplayerDOM` · `updateMiniplayerUI` · `openFindSongs` · `closeFindSongs` · `displayRandomRecommendations` · `getTimeAgo` · `refreshRandomRecommendations` · `getReplaceTargetSong` · `startSongVideoReplacement` · `cancelSongVideoReplacement` · `getKeyDisplayName` · `getActionDisplayName` · `_pruneOldDays` · `recordSongPlayStat` · `_applyPlayStat` · `_trackPlayStat` · `get30DayCount` · `_formatPlayCount` · `filterListeningStatisticsSongResults` · `_songThumbHtml` · `_buildFullListHtml` · `_heroCardHtml` · `_accumulate30DaySecond` · `_flush30DayTime` · `formatSecondsAsHM` · `updateListeningTimeDisplay` · `stopListeningTimeTracking` · `startListeningTimeTracking` · `toggleTopicKeyword` · `initializeVisibilityTracking` · `syncUIWithCurrentState` · `samplePlayTemporarySong` · `updateTemporarySongUrlDisplay` · `initializeTemporarySongPlayer` · `playTemporarySong` · `disconnectObservers` · `removeDynamicEventListeners` · `initializeMusicPlayer`

---

## `this.elements` keys that differ from their DOM id (9)

The rest match their id exactly.

| `this.elements` key | `getElementById` |
|---|---|
| `songNameInput` | `songName` |
| `songAuthorInput` | `songAuthor` |
| `songUrlInput` | `songUrl` |
| `closePlaylistModalBtn` | `closePlaylistModal` |
| `closeLibraryModalBtn` | `closeLibraryModal` |
| `progressBar` | `musicProgressBar` |
| `listeningTimeDisplay` | `listeningTime` |
| `lyricsPane` | `lyrics` |
| `closeImportModalBtn` | `closeImportModal` |

---

## Dialogs in `public/index.html` (13)

| id | line | classes |
|---|---|---|
| `discordRpcModal` | 290 | `modal discord-rpc-modal-overlay ui-overlay` |
| `libraryModificationModal` | 423 | `modal ui-overlay` |
| `importModal` | 459 | `modal ui-overlay` |
| `playlistEditModal` | 505 | `modal ui-overlay` |
| `timerModal` | 525 | `modal ui-overlay` |
| `changelogModal` | 667 | `changelog-modal ui-overlay` |
| `subtitlesImportModal` | 676 | `subtitles-import-modal-overlay ui-overlay` |
| `settingsModal` | 745 | `settings-modal ui-overlay` |
| `recentlyPlayedModal` | 1221 | `recently-played-modal-bg ui-overlay` |
| `lyricsModal` | 1236 | `lyrics-maker-modal hidden ui-overlay` |
| `downloadModal` | 1354 | `dl-overlay ui-overlay` |
| `shazamModal` | 1418 | `sz-overlay ui-overlay` |
| `statsModal` | 1469 | `ls-overlay ui-overlay` |

---

## Other scripts

### `public/script/settings.js` (37 members)

`handleCloseSettings` 3 · `handleSettingsModalClick` 8 · `initializeSettingsContent` 14 · `setupTabs` 26 · `handleTabSwitch` 35 · `loadThemeMode` 43 · `handleThemeModeChange` 54 · `loadCustomThemeColors` 67 · `handleSaveCustomTheme` 80 · `resetCustomTheme` 123 · `handleColorChange` 142 · `updateColorPickerByKey` 156 · `updateColorPickerValues` 171 · `exportTheme` 187 · `importTheme` 219 · `applyImportedTheme` 235 · `hexToRgba` 263 · `loadAdvertisementSettingsInModal` 271 · `handleAdsToggle` 275 · `handleVisualizerToggle` 281 · `handleLibrarySortToggle` 295 · `loadLibrarySortSetting` 301 · `handleLibraryReverseToggle` 317 · `loadLibraryReverseSetting` 323 · `saveDiscordSettings` 339 · `saveKeybinds` 349 · `loadKeybindsSettings` 360 · `getKeyDisplayName` 374 · `getActionDisplayName` 390 · `startKeybindRecording` 417 · `recordKeybind` 433 · `cancelKeybindRecording` 457 · `stopKeybindRecording` 465 · `resetKeybindsToDefault` 475 · `loadDiscoverMoreSettings` 482 · `setDefaultDiscoverMoreValues` 495 · `handleSaveDiscoverMoreSettings` 509

### `public/karaoke-player.js` (40 members)

`initElements` 21 · `setupEventListeners` 47 · `initializeDatabase` 75 · `openDatabase` 85 · `initializeTheme` 111 · `loadCustomTheme` 136 · `applyCustomColors` 205 · `hexToRgba` 223 · `loadKaraokeData` 236 · `showError` 255 · `initYouTubePlayer` 259 · `createPlayer` 269 · `onPlayerReady` 287 · `onPlayerStateChange` 294 · `togglePlayPause` 322 · `updatePlayPauseButton` 332 · `restart` 341 · `toggleLoop` 347 · `toggleCentering` 351 · `changeSpeed` 362 · `seek` 371 · `startProgressTracking` 379 · `stopProgressTracking` 403 · `formatTime` 410 · `renderLyrics` 416 · `startLyricsTracking` 438 · `stopLyricsTracking` 457 · `updateHighlightedLyric` 464 · `enterFullscreen` 496 · `exitFullscreen` 502 · `toggleFullscreen` 507 · `renderFullscreenLyrics` 515 · `updateFullscreenLyric` 530 · `copyURL` 559 · `updateTitle` 573 · `saveToLibrary` 579 · `findSongByVideoId` 606 · `updateSongLyrics` 622 · `addNewSong` 641 · `showToast` 664

### `public/karaoke-encoder.js` (11 members)

`encode` 2 · `decode` 34 · `_encodeVarInt` 64 · `_decodeVarInt` 76 · `_toBase64URL` 86 · `_fromBase64URL` 97 · `generateURL` 108 · `getFromURL` 113 · `estimateSize` 121 · `convertToSweetescapeLyrics` 131 · `_formatTime` 137

### `public/sw.js` (0 members)

_no two-space members detected_
