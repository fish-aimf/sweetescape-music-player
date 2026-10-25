const GUIDE_BASE = new URL('./', import.meta.url);

const TOUCH_EVENTS = [ 'pointerdown', 'pointerup', 'touchstart', 'touchend', 'mousedown', 'mouseup', 'click', 'dblclick', 'contextmenu' ];

let session = null;

export function start(player, options = {}) {
  if (session) {
    session.setMode(options.mode || session.mode);
    return session.ready;
  }
  session = new GuideSession(player, options.mode || 'tour');
  return session.ready.catch(error => {
    session?.close();
    throw error;
  });
}

export function stop() {
  session?.close();
}

function fetchGuideData() {
  return fetch(new URL('guide.json', GUIDE_BASE), {
    cache: 'no-store'
  }).then(response => {
    if (!response.ok) {
      throw new Error(`guide.json ${response.status}`);
    }
    return response.json();
  });
}

function loadGuideStyles() {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL('guide.css', GUIDE_BASE).href;
    link.dataset.guide = '';
    link.onload = () => resolve(link);
    link.onerror = () => {
      link.remove();
      reject(new Error('guide.css failed to load'));
    };
    document.head.appendChild(link);
  });
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) {
    node.className = className;
  }
  if (text !== undefined) {
    node.textContent = text;
  }
  return node;
}

function isShown(node) {
  if (!node || !node.isConnected) {
    return false;
  }
  const rect = node.getBoundingClientRect();
  if (rect.width < 2 || rect.height < 2) {
    return false;
  }
  const style = getComputedStyle(node);
  return style.visibility !== 'hidden' && style.display !== 'none' && Number(style.opacity) > 0.05;
}

function firstShown(selector) {
  if (!selector) {
    return null;
  }
  return [ ...document.querySelectorAll(selector) ].find(isShown) || null;
}

const nextFrame = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

class GuideSession {
  constructor(player, mode) {
    this.player = player;
    this.mode = mode;
    this.index = 0;
    this.target = null;
    this.spot = null;
    this.tapState = null;
    this.lastRect = '';
    this.frame = 0;
    this.hoverTimer = 0;
    this.pointer = null;
    this.opened = {
      queue: false,
      sidebar: false
    };
    this.startTab = document.querySelector('.tab.active')?.dataset.tab || null;
    this.showToken = 0;
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onTouchGesture = this.onTouchGesture.bind(this);
    this.tick = this.tick.bind(this);
    this.ready = Promise.all([ fetchGuideData(), loadGuideStyles() ]).then(([data]) => {
      this.data = data;
      this.spots = new Map(data.spots.map(spot => [ spot.id, spot ]));
      this.tour = data.tour.filter(id => this.spots.has(id));
      this.pointSpots = data.spots.filter(spot => spot.target);
      this.mount();
    });
  }

  mount() {
    this.root = el('div', 'sg');
    this.root.setAttribute('data-guide-root', '');
    this.veil = el('div', 'sg-veil');
    this.hole = el('div', 'sg-hole');
    this.card = el('section', 'sg-card');
    this.card.setAttribute('role', 'dialog');
    this.card.setAttribute('aria-label', 'Guide mode');

    const head = el('div', 'sg-head');
    this.modeSwitch = el('div', 'sg-modes');
    this.modeSwitch.setAttribute('role', 'tablist');
    this.tourTab = this.modeButton('Tour', 'tour');
    this.pointTab = this.modeButton('Point and ask', 'point');
    this.modeSwitch.append(this.tourTab, this.pointTab);
    const close = el('button', 'sg-close');
    close.type = 'button';
    close.title = 'Close guide (Esc)';
    close.setAttribute('aria-label', 'Close guide');
    close.innerHTML = '<i class="fas fa-times" aria-hidden="true"></i>';
    close.addEventListener('click', () => this.close());
    head.append(this.modeSwitch, close);

    this.count = el('p', 'sg-count');
    this.title = el('h2', 'sg-title');
    this.body = el('p', 'sg-body');
    this.keys = el('ul', 'sg-keys');
    this.tips = el('div', 'sg-tips');
    const live = el('div', 'sg-live');
    live.setAttribute('aria-live', 'polite');
    live.append(this.count, this.title, this.body, this.keys, this.tips);

    this.foot = el('div', 'sg-foot');
    this.backButton = el('button', 'sg-btn sg-btn--ghost', 'Back');
    this.backButton.type = 'button';
    this.backButton.addEventListener('click', () => this.go(this.index - 1));
    this.nextButton = el('button', 'sg-btn sg-btn--primary', 'Next');
    this.nextButton.type = 'button';
    this.nextButton.addEventListener('click', () => this.go(this.index + 1));
    this.tutorialLink = el('a', 'sg-link', 'Full tutorial');
    this.tutorialLink.href = this.data.tutorial || '/tutorial';
    this.tutorialLink.target = '_blank';
    this.tutorialLink.rel = 'noopener';
    this.foot.append(this.tutorialLink, this.backButton, this.nextButton);

    this.card.append(head, live, this.foot);
    this.root.append(this.veil, this.hole, this.card);
    document.body.appendChild(this.root);

    window.addEventListener('keydown', this.onKeyDown, true);
    this.frame = requestAnimationFrame(this.tick);
    this.setMode(this.mode, true);
  }

  modeButton(label, mode) {
    const button = el('button', 'sg-mode', label);
    button.type = 'button';
    button.setAttribute('role', 'tab');
    button.addEventListener('click', () => this.setMode(mode));
    return button;
  }

  setMode(mode, initial = false) {
    if (!this.root || mode === this.mode && !initial) {
      return;
    }
    this.mode = mode;
    const point = mode === 'point';
    this.root.classList.toggle('sg--point', point);
    this.tourTab.setAttribute('aria-selected', String(!point));
    this.pointTab.setAttribute('aria-selected', String(point));
    this.card.setAttribute('aria-modal', String(!point));
    if (point) {
      this.restorePrepared(null);
      window.addEventListener('pointermove', this.onPointerMove, true);
      TOUCH_EVENTS.forEach(type => window.addEventListener(type, this.onTouchGesture, true));
      this.showPoint(null);
    } else {
      clearTimeout(this.hoverTimer);
      window.removeEventListener('pointermove', this.onPointerMove, true);
      TOUCH_EVENTS.forEach(type => window.removeEventListener(type, this.onTouchGesture, true));
      this.go(initial ? 0 : this.index);
    }
  }

  async go(index) {
    if (index < 0) {
      return;
    }
    if (index >= this.tour.length) {
      this.close();
      return;
    }
    this.index = index;
    const token = ++this.showToken;
    const spot = this.spots.get(this.tour[index]);
    this.restorePrepared(spot.prepare);
    await this.prepare(spot.prepare);
    if (token !== this.showToken || this.mode !== 'tour') {
      return;
    }
    const target = firstShown(spot.target) || firstShown(spot.fallback);
    if (target) {
      this.bringIntoView(target);
    }
    this.render(spot, target);
    this.count.textContent = `${index + 1} of ${this.tour.length}`;
    this.backButton.disabled = index === 0;
    this.nextButton.textContent = index === this.tour.length - 1 ? 'Finish' : 'Next';
    this.nextButton.focus({
      preventScroll: true
    });
  }

  async prepare(prepare) {
    if (!prepare) {
      return;
    }
    const player = this.player;
    if (prepare.tab) {
      const tab = document.querySelector(`.tab[data-tab="${prepare.tab}"]`);
      if (tab && isShown(tab) && !tab.classList.contains('active')) {
        player.switchTab(prepare.tab);
      }
    }
    if (prepare.queue && !document.getElementById('qv2-panel')) {
      player.showQueueOverlay();
      this.opened.queue = true;
    }
    if (prepare.sidebar && !player.isSidebarVisible && player.currentPlaylist) {
      player.showSidebar();
      this.opened.sidebar = true;
    }
    await nextFrame();
    if (prepare.queue || prepare.sidebar) {
      await new Promise(resolve => setTimeout(resolve, 260));
    }
  }

  restorePrepared(next) {
    if (this.opened.queue && !next?.queue) {
      document.getElementById('qv2-close')?.click();
      this.opened.queue = false;
    }
    if (this.opened.sidebar && !next?.sidebar) {
      this.player.hideSidebar();
      this.opened.sidebar = false;
    }
  }

  bringIntoView(target) {
    const rect = target.getBoundingClientRect();
    if (rect.top < 0 || rect.bottom > innerHeight || rect.left < 0 || rect.right > innerWidth) {
      target.scrollIntoView({
        block: rect.height > innerHeight * .7 ? 'start' : 'center',
        inline: 'nearest',
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
      });
    }
  }

  render(spot, target) {
    this.spot = spot;
    this.target = target;
    this.lastRect = '';
    this.title.textContent = spot ? spot.title : 'Point at anything';
    this.body.textContent = spot ? spot.body : 'Hover over any part of the player to see what it does, and keep using it as normal. On a touchscreen, tap something once to read about it and again to use it.';
    this.keys.replaceChildren(...(spot?.keys || []).map(([key, label]) => {
      const item = el('li');
      key.split(' ').forEach(part => item.append(el('kbd', null, part)));
      if (label) {
        item.append(el('span', null, label));
      }
      return item;
    }));
    this.keys.hidden = !this.keys.childElementCount;
    this.tips.replaceChildren();
    if (spot?.tips?.length) {
      const label = el('p', 'sg-tips__label');
      label.innerHTML = '<i class="fas fa-lightbulb" aria-hidden="true"></i> ';
      label.append(spot.tips.length > 1 ? 'Tips' : 'Tip');
      const list = el('ul');
      list.append(...spot.tips.map(text => el('li', null, text)));
      this.tips.append(label, list);
    }
    this.tips.hidden = !spot?.tips?.length;
    this.root.classList.toggle('sg--free', !target);
    this.layout(true);
  }

  showPoint(match, tapped = false) {
    this.count.textContent = tapped && match ? 'Tap it again to use it.' : '';
    this.render(match?.spot || null, match?.el || null);
  }

  findSpot(node) {
    if (!node || this.root.contains(node)) {
      return null;
    }
    let best = null;
    for (const spot of this.pointSpots) {
      let match = null;
      try {
        match = node.closest(spot.target);
      } catch {
        match = null;
      }
      if (match && isShown(match) && (!best || best.el !== match && best.el.contains(match))) {
        best = {
          spot: spot,
          el: match
        };
      }
    }
    return best;
  }

  onPointerMove(event) {
    if (event.pointerType === 'touch') {
      return;
    }
    this.pointer = event;
    clearTimeout(this.hoverTimer);
    this.hoverTimer = setTimeout(() => {
      const node = document.elementFromPoint(this.pointer.clientX, this.pointer.clientY);
      if (!node || this.root.contains(node)) {
        return;
      }
      const match = this.findSpot(node);
      if (match?.el !== this.target) {
        this.showPoint(match);
      }
    }, 140);
  }

  onTouchGesture(event) {
    if (this.root.contains(event.target)) {
      return;
    }
    if (event.type === 'pointerdown') {
      if (event.pointerType !== 'touch') {
        this.tapState = null;
        return;
      }
      const match = this.findSpot(event.target);
      this.tapState = match && match.el !== this.target ? 'explain' : null;
      if (this.tapState) {
        this.showPoint(match, true);
      }
    }
    if (this.tapState !== 'explain') {
      return;
    }
    event.stopPropagation();
    if (event.cancelable && event.type !== 'touchstart' && event.type !== 'touchend') {
      event.preventDefault();
    }
    if (event.type === 'click') {
      this.tapState = null;
    }
  }

  onKeyDown(event) {
    if (event.code === 'KeyG' && event.altKey && event.shiftKey) {
      event.preventDefault();
      event.stopImmediatePropagation();
      this.close();
      return;
    }
    if (this.mode === 'point') {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        this.close();
      }
      return;
    }
    if (this.root.contains(event.target) && event.key === 'Tab') {
      event.stopPropagation();
      return;
    }
    event.stopPropagation();
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
    } else if (this.mode === 'tour' && (event.key === 'ArrowRight' || event.key === 'PageDown')) {
      event.preventDefault();
      this.go(this.index + 1);
    } else if (this.mode === 'tour' && (event.key === 'ArrowLeft' || event.key === 'PageUp')) {
      event.preventDefault();
      this.go(this.index - 1);
    } else if (event.key === ' ' || event.key === 'Enter') {
      if (!this.root.contains(event.target)) {
        event.preventDefault();
        if (this.mode === 'tour') {
          this.go(this.index + 1);
        }
      }
    }
  }

  tick() {
    this.frame = requestAnimationFrame(this.tick);
    this.layout(false);
  }

  layout(force) {
    const target = this.target;
    if (target && !target.isConnected) {
      this.target = null;
      this.root.classList.add('sg--free');
    }
    const rect = this.target ? this.target.getBoundingClientRect() : null;
    const key = rect ? `${rect.left|0},${rect.top|0},${rect.width|0},${rect.height|0},${innerWidth},${innerHeight}` : `free,${innerWidth},${innerHeight}`;
    if (!force && key === this.lastRect) {
      return;
    }
    this.lastRect = key;
    const margin = 12;
    const gap = 14;
    const pad = this.mode === 'point' ? 3 : 6;
    if (rect) {
      const left = Math.max(2, rect.left - pad);
      const top = Math.max(2, rect.top - pad);
      const right = Math.min(innerWidth - 2, rect.right + pad);
      const bottom = Math.min(innerHeight - 2, rect.bottom + pad);
      Object.assign(this.hole.style, {
        left: `${left}px`,
        top: `${top}px`,
        width: `${Math.max(0, right - left)}px`,
        height: `${Math.max(0, bottom - top)}px`
      });
    }
    const card = this.card;
    const width = card.offsetWidth;
    const height = card.offsetHeight;
    let x;
    let y;
    if (innerWidth <= 560) {
      x = margin;
      y = rect && rect.top + rect.height / 2 > innerHeight / 2 ? margin : innerHeight - height - margin;
    } else if (!rect) {
      x = (innerWidth - width) / 2;
      y = (innerHeight - height) / 2;
    } else {
      const spots = [ {
        x: rect.left + rect.width / 2 - width / 2,
        y: rect.bottom + gap,
        fits: rect.bottom + gap + height <= innerHeight - margin
      }, {
        x: rect.left + rect.width / 2 - width / 2,
        y: rect.top - gap - height,
        fits: rect.top - gap - height >= margin
      }, {
        x: rect.right + gap,
        y: rect.top + rect.height / 2 - height / 2,
        fits: rect.right + gap + width <= innerWidth - margin
      }, {
        x: rect.left - gap - width,
        y: rect.top + rect.height / 2 - height / 2,
        fits: rect.left - gap - width >= margin
      } ];
      const choice = spots.find(spot => spot.fits) || {
        x: innerWidth - width - margin,
        y: rect.top > innerHeight / 2 ? margin : innerHeight - height - margin
      };
      x = choice.x;
      y = choice.y;
    }
    x = Math.min(Math.max(margin, x), Math.max(margin, innerWidth - width - margin));
    y = Math.min(Math.max(margin, y), Math.max(margin, innerHeight - height - margin));
    card.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
  }

  close() {
    if (session !== this) {
      return;
    }
    session = null;
    this.showToken++;
    cancelAnimationFrame(this.frame);
    clearTimeout(this.hoverTimer);
    window.removeEventListener('keydown', this.onKeyDown, true);
    window.removeEventListener('pointermove', this.onPointerMove, true);
    TOUCH_EVENTS.forEach(type => window.removeEventListener(type, this.onTouchGesture, true));
    if (this.root) {
      this.restorePrepared(null);
      if (this.startTab && document.querySelector('.tab.active')?.dataset.tab !== this.startTab) {
        const tab = document.querySelector(`.tab[data-tab="${this.startTab}"]`);
        if (tab && isShown(tab)) {
          this.player.switchTab(this.startTab);
        }
      }
      this.root.remove();
    }
    document.querySelectorAll('link[data-guide]').forEach(link => link.remove());
  }
}
