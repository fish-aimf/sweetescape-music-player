const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.join(__dirname, '..');
const OUT = path.join(root, 'CODEMAP.md');

const CONTROL_WORDS = new Set([ 'if', 'for', 'while', 'switch', 'catch', 'return', 'do', 'else', 'try', 'function', 'typeof', 'new', 'await', 'constructor' ]);

const OTHER_SCRIPTS = [ 'public/script/settings.js', 'public/karaoke-player.js', 'public/karaoke-encoder.js', 'public/sw.js' ];

const TOPICS = [
  [ 'Startup & database', [ '^_initialize', 'initDatabase', '^load[A-Z]', '^save[A-Z]', 'Migration', 'repairEncoded', 'gracefulDatabase', '^cleanup', 'clearTimers', 'saveCurrentState' ] ],
  [ 'Song library', [ 'Library', 'library', 'songLibrary', '^addSong', '^deleteSong', '^updateSongDetails', 'SongEdit', 'favourite', 'Favorite', 'favorite' ] ],
  [ 'Playback & queue', [ 'playSong', 'playNext', 'playPrevious', 'togglePlay', 'Queue', 'queue', 'seek', 'Volume', 'volume', 'Speed', 'speed', 'Loop', 'loop', 'shuffle', 'Shuffle', 'autoplay', 'Autoplay', 'Progress', 'progress' ] ],
  [ 'Playlists', [ 'Playlist', 'playlist' ] ],
  [ 'YouTube & search', [ 'YouTube', 'youtube', 'videoId', 'VideoId', 'Thumbnail', 'thumbnail', 'oembed', 'Search', 'search', 'autofill', 'Autofill', 'Ghost', 'ghost' ] ],
  [ 'Lyrics & karaoke', [ 'Lyric', 'lyric', 'Karaoke', 'karaoke', 'Subtitle', 'subtitle' ] ],
  [ 'Discovery, stats & charts', [ 'Billboard', 'billboard', 'Discover', 'discover', 'Stats', 'stats', 'RecentlyPlayed', 'recentlyPlayed', 'Suggest', 'suggest', 'Global', 'global', 'Deezer', 'deezer', 'Shazam', 'shazam', 'Supabase', 'supabase' ] ],
  [ 'Appearance & visualizer', [ 'Theme', 'theme', 'Visualizer', 'visualizer', 'Appearance', 'appearance', 'Surface', 'surface', 'Backdrop', 'backdrop' ] ],
  [ 'Modals, notifications & UI chrome', [ 'Modal', 'modal', 'Notification', 'notification', 'showTab', 'Tab', 'tab', 'Sidebar', 'sidebar', 'ControlBar', 'Overlay', 'overlay', 'Tooltip', 'tooltip' ] ],
  [ 'Input, keybinds & escaping', [ 'Keybind', 'keybind', 'Keyboard', 'keyboard', 'Hotkey', 'hotkey', 'escapeHtml', 'escapeJs', 'decodeHtml', 'Drag', 'drag', 'Paste', 'paste' ] ],
  [ 'Settings, import & export', [ 'Setting', 'setting', 'Import', 'import', 'Export', 'export', 'Discord', 'discord', 'Disguise', 'disguise', 'Priority', 'priority', 'Download', 'download' ] ]
];

function readLines(file) {
  return fs.readFileSync(path.join(root, file), 'utf8').split(/\r?\n/);
}

function sha(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex').slice(0, 12);
}

function collectMembers(lines, from, to) {
  const members = [];
  const pattern = /^ {2}(?:static\s+)?(?:async\s+)?(?:(get|set)\s+)?([A-Za-z_$][\w$]*)\s*\(/;
  for (let i = from; i <= to && i < lines.length; i++) {
    const match = lines[i].match(pattern);
    if (!match || CONTROL_WORDS.has(match[2])) {
      continue;
    }
    members.push({ name: match[2], accessor: match[1] || '', line: i + 1 });
  }
  return members;
}

function classifyTopics(members) {
  const buckets = TOPICS.map(([title]) => ({ title, names: [] }));
  const other = [];
  members.forEach(member => {
    const index = TOPICS.findIndex(([, patterns]) => patterns.some(p => new RegExp(p).test(member.name)));
    if (index === -1) {
      other.push(member.name);
    } else {
      buckets[index].names.push(member.name);
    }
  });
  return { buckets: buckets.filter(b => b.names.length), other };
}

function collectElementMap(lines) {
  const start = lines.findIndex(line => /^ {2}initializeElements\(\)/.test(line));
  if (start === -1) {
    return [];
  }
  const pairs = [];
  for (let i = start; i < lines.length; i++) {
    if (i > start && /^ {2}[A-Za-z_$]/.test(lines[i])) {
      break;
    }
    const match = lines[i].match(/^\s*([A-Za-z_$][\w$]*):\s*document\.getElementById\('([^']+)'\)/);
    if (match && match[1] !== match[2]) {
      pairs.push([ match[1], match[2] ]);
    }
  }
  return pairs;
}

function collectOverlays(lines) {
  const found = new Map();
  lines.forEach((line, index) => {
    const idMatch = line.match(/id="([A-Za-z0-9_-]+)"/);
    if (!idMatch) {
      return;
    }
    const classMatch = line.match(/class="([^"]*)"/);
    const classes = classMatch ? classMatch[1].trim() : '';
    const isContainer = classes.split(/\s+/).some(token => token === 'modal' || token === 'ui-overlay' || /-overlay$/.test(token) || /-modal$/.test(token));
    if (isContainer && !found.has(idMatch[1])) {
      found.set(idMatch[1], { line: index + 1, classes: classes });
    }
  });
  return [ ...found ].sort((a, b) => a[1].line - b[1].line);
}

function longLines(lines, threshold) {
  return lines.reduce((acc, line) => (line.length > threshold ? acc + 1 : acc), 0);
}

const scriptLines = readLines('public/script.js');
const htmlLines = readLines('public/index.html');

const uiEnd = scriptLines.findIndex(line => line === '};');
const classStart = scriptLines.findIndex(line => /^class AdvancedMusicPlayer/.test(line));
const uiMembers = collectMembers(scriptLines, 0, uiEnd);
const classMembers = collectMembers(scriptLines, classStart, scriptLines.length - 1);
const { buckets, other } = classifyTopics(classMembers);
const elementPairs = collectElementMap(scriptLines);
const overlays = collectOverlays(htmlLines);

const out = [];
out.push('# CODEMAP');
out.push('');
out.push('Generated index of `public/script.js` and the dialogs in `public/index.html`, so a');
out.push('method can be located without searching a 600 KB file. Regenerate with:');
out.push('');
out.push('```bash');
out.push('node scripts/codemap.js');
out.push('```');
out.push('');
out.push('Line numbers are navigation hints for `sed -n`, not guarantees — if the line does');
out.push('not hold what this file claims, regenerate, or `grep -n "  methodName("`.');
out.push('');
out.push('| Source | sha256 (first 12) | Lines |');
out.push('|---|---|---|');
[ 'public/script.js', 'public/index.html', ...OTHER_SCRIPTS ].forEach(file => {
  out.push(`| \`${file}\` | \`${sha(file)}\` | ${readLines(file).length} |`);
});
out.push('');
out.push('---');
out.push('');
out.push('## Reading `public/script.js` cheaply');
out.push('');
out.push(`- ${longLines(scriptLines, 300)} lines are longer than 300 characters (the machine-formatted`);
out.push('  `innerHTML` template literals; the longest is ~3.9 KB). A single `grep -n` that hits');
out.push('  several of them dumps tens of kilobytes. Search with `grep -o`, or pipe through');
out.push("  `cut -c1-200`, and only widen once you know which line you want.");
out.push('- Read by range (`sed -n \'1200,1260p\'`) rather than opening the file.');
out.push(`- \`UI\` factory: lines 1-${uiEnd + 1}. \`AdvancedMusicPlayer\`: line ${classStart + 1} onwards.`);
out.push('');
out.push('---');
out.push('');
out.push(`## \`UI\` factory (${uiMembers.length} members)`);
out.push('');
out.push(uiMembers.map(m => `\`${m.name}\` ${m.line}`).join(' · '));
out.push('');
out.push('---');
out.push('');
out.push(`## \`AdvancedMusicPlayer\` by topic (${classMembers.length} methods)`);
out.push('');
out.push('Names only. `grep -n "^  name(" public/script.js` gives the current line, and a name');
out.push('here that you cannot find has been renamed since this file was generated.');
out.push('');
buckets.forEach(bucket => {
  out.push(`### ${bucket.title}`);
  out.push('');
  out.push(bucket.names.map(n => `\`${n}\``).join(' · '));
  out.push('');
});
if (other.length) {
  out.push('### Uncategorised');
  out.push('');
  out.push(other.map(n => `\`${n}\``).join(' · '));
  out.push('');
}
out.push('---');
out.push('');
out.push(`## \`this.elements\` keys that differ from their DOM id (${elementPairs.length})`);
out.push('');
out.push('The rest match their id exactly.');
out.push('');
out.push('| `this.elements` key | `getElementById` |');
out.push('|---|---|');
elementPairs.forEach(([ key, id ]) => out.push(`| \`${key}\` | \`${id}\` |`));
out.push('');
out.push('---');
out.push('');
out.push(`## Dialogs in \`public/index.html\` (${overlays.length})`);
out.push('');
out.push('| id | line | classes |');
out.push('|---|---|---|');
overlays.forEach(([ id, info ]) => out.push(`| \`${id}\` | ${info.line} | \`${info.classes || '—'}\` |`));
out.push('');
out.push('---');
out.push('');
out.push('## Other scripts');
out.push('');
OTHER_SCRIPTS.forEach(file => {
  const members = collectMembers(readLines(file), 0, Infinity);
  out.push(`### \`${file}\` (${members.length} members)`);
  out.push('');
  out.push(members.map(m => `\`${m.name}\` ${m.line}`).join(' · ') || '_no two-space members detected_');
  out.push('');
});

const body = out.join('\n').replace(/\r?\n/g, '\r\n');
const previous = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : null;
fs.writeFileSync(OUT, body);
console.log(`${previous === body ? 'unchanged' : 'written'}: CODEMAP.md`);
console.log(`  UI members: ${uiMembers.length}`);
console.log(`  AdvancedMusicPlayer methods: ${classMembers.length}`);
console.log(`  element aliases: ${elementPairs.length}`);
console.log(`  dialogs: ${overlays.length}`);
