const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

const GROUPS = [
  {
    label: 'app',
    css: [ 'public/style.css', 'public/ui-system.css' ],
    sources: [ 'public/index.html', 'public/script.js', 'public/script/settings.js', 'public/sw.js', 'public/register-sw.js', 'public/karaoke-encoder.js' ]
  },
  {
    label: 'karaoke',
    css: [ 'public/karaoke-styles.css' ],
    sources: [ 'public/karaoke.html', 'public/karaoke-player.js', 'public/karaoke-encoder.js' ]
  }
];

function read(file) {
  const full = path.join(root, file);
  return fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : null;
}

function collectTokens(sources) {
  const tokens = new Set();
  const prefixes = new Set();
  sources.forEach(file => {
    const text = read(file);
    if (text === null) {
      console.warn(`  missing source: ${file}`);
      return;
    }
    (text.match(/[A-Za-z0-9_-]+/g) || []).forEach(token => tokens.add(token));
    (text.match(/'[^'\n]*-'|"[^"\n]*-"|`[^`\n]*-`/g) || []).forEach(literal => {
      const tail = (literal.slice(1, -1).match(/[A-Za-z][A-Za-z0-9_-]*-$/) || [])[0];
      if (tail) {
        prefixes.add(tail);
      }
    });
    (text.match(/`[^`]*?\$\{/g) || []).forEach(chunk => {
      const before = chunk.slice(1, -2);
      const tail = (before.match(/[A-Za-z][A-Za-z0-9_-]*-$/) || [])[0];
      if (tail) {
        prefixes.add(tail);
      }
    });
  });
  return { tokens, prefixes };
}

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, match => match.replace(/[^\n]/g, ' '));
}

function lineOf(text, index) {
  return text.slice(0, index).split('\n').length;
}

function collectRules(css) {
  const clean = stripComments(css);
  const rules = [];
  const keyframes = [];
  const pattern = /([^{}]+)\{/g;
  let match;
  let atKeyframesDepth = null;
  let depth = 0;
  let cursor = 0;
  while ((match = pattern.exec(clean)) !== null) {
    for (let i = cursor; i < match.index; i++) {
      if (clean[i] === '}') {
        depth--;
        if (atKeyframesDepth !== null && depth <= atKeyframesDepth) {
          atKeyframesDepth = null;
        }
      }
    }
    cursor = pattern.lastIndex;
    const selector = match[1].trim();
    depth++;
    if (/^@keyframes\s/i.test(selector) || /^@-webkit-keyframes\s/i.test(selector)) {
      keyframes.push({ name: selector.replace(/^@(-webkit-)?keyframes\s+/i, '').trim(), line: lineOf(clean, match.index) });
      atKeyframesDepth = depth - 1;
      continue;
    }
    if (selector.startsWith('@') || atKeyframesDepth !== null) {
      continue;
    }
    rules.push({ selector, line: lineOf(clean, match.index) });
  }
  return { rules, keyframes };
}

function classesIn(selectorPart) {
  return (selectorPart.match(/\.(-?[A-Za-z_][A-Za-z0-9_-]*)/g) || []).map(c => c.slice(1));
}

function isLive(className, tokens, prefixes) {
  if (tokens.has(className)) {
    return true;
  }
  for (const prefix of prefixes) {
    if (className.startsWith(prefix)) {
      return true;
    }
  }
  return false;
}

let deadTotal = 0;

GROUPS.forEach(group => {
  console.log(`\n=== ${group.label} ===`);
  const { tokens, prefixes } = collectTokens(group.sources);
  console.log(`  tokens: ${tokens.size}, dynamic prefixes: ${prefixes.size}`);
  group.css.forEach(cssFile => {
    const css = read(cssFile);
    if (css === null) {
      console.warn(`  missing stylesheet: ${cssFile}`);
      return;
    }
    const { rules, keyframes } = collectRules(css);
    const dead = [];
    rules.forEach(rule => {
      const parts = rule.selector.split(',').map(p => p.trim()).filter(Boolean);
      const anyLive = parts.some(part => {
        const classes = classesIn(part);
        if (classes.length === 0) {
          return true;
        }
        return classes.every(className => isLive(className, tokens, prefixes));
      });
      if (!anyLive) {
        dead.push(rule);
      }
    });
    const animationNames = new Set();
    (stripComments(css).match(/animation(?:-name)?\s*:[^;}]+/g) || []).forEach(decl => {
      (decl.match(/[A-Za-z_][A-Za-z0-9_-]*/g) || []).forEach(word => animationNames.add(word));
    });
    const deadKeyframes = keyframes.filter(frame => !animationNames.has(frame.name));
    deadTotal += dead.length;
    console.log(`\n  ${cssFile}: ${rules.length} rules, ${keyframes.length} @keyframes`);
    console.log(`    comma-groups with no live part: ${dead.length}`);
    dead.forEach(rule => console.log(`      ${cssFile}:${rule.line}  ${rule.selector.replace(/\s+/g, ' ').slice(0, 160)}`));
    console.log(`    @keyframes with no animation-name reference: ${deadKeyframes.length}`);
    deadKeyframes.forEach(frame => console.log(`      ${cssFile}:${frame.line}  @keyframes ${frame.name}`));
  });
});

console.log(`\nreport only — nothing was changed. Verify each hit by hand before deleting.`);
process.exitCode = 0;
