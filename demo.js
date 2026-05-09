/**
 * ══════════════════════════════════════════════════════════
 *  ACRINDER – app.js
 *  Modular ES-module architecture (branch-friendly)
 *  ──────────────────────────────────────────────────────
 *  Module map:
 *    config.js   →  API key, endpoints, constants
 *    api.js      →  fetch / Nookipedia requests
 *    screens.js  →  screen transitions
 *    landing.js  →  feature/home     logic
 *    swipe.js    →  feature/swipe    logic + GSAP
 *    profile.js  →  feature/profile  logic
 *    match.js    →  feature/match    logic
 *  (All modules are inlined here for single-file delivery;
 *   split into separate files per feature branch as needed)
 * ══════════════════════════════════════════════════════════
 */

'use strict';

/* ╔══════════════════════════════════════╗
   ║  MODULE: config                      ║
   ╚══════════════════════════════════════╝ */

const CONFIG = {
  /**
   * ▶ PLACE YOUR NOOKIPEDIA API KEY HERE ◀
   * Obtain it at: https://api.nookipedia.com/
   *
   * For team branches: store it in a `.env` file or a
   * `config.local.js` that is git-ignored. Example:
   *
   *   config.local.js  →  export const API_KEY = 'your_key';
   *   Then import and use it here instead of the placeholder.
   */
  NOOKIPEDIA_API_KEY: '955e9378-ac80-4d2d-9f7f-09003656bb3c',

  /** Base URL for the Nookipedia REST API */
  API_BASE: 'https://api.nookipedia.com',

  /** How many villagers to pre-fetch per batch */
  BATCH_SIZE: 20,

  /** Drag threshold (px) before a swipe is committed */
  SWIPE_THRESHOLD: 120,

  /** Fly-out distance for swiped cards */
  SWIPE_EXIT_X: window.innerWidth + 300,
};


/* ╔══════════════════════════════════════╗
   ║  MODULE: api                         ║
   ╚══════════════════════════════════════╝ */

/**
 * Build request headers required by Nookipedia.
 *
 * ▶ The API key goes here, inside the 'X-API-KEY' header.
 *   Nookipedia requires this header on every request.
 */
function buildHeaders() {
  return {
    'X-API-KEY':      CONFIG.NOOKIPEDIA_API_KEY,  // ← YOUR KEY IS READ FROM HERE
    'Accept-Version': '1.0.0',
    'Content-Type':   'application/json',
  };
}

/**
 * Fetch a random list of villagers from Nookipedia.
 * @returns {Promise<Array>} Array of villager objects
 */
async function fetchVillagers() {
  const url = `${CONFIG.API_BASE}/villagers?excludedetails=false&nhdetails=true`;

  const response = await fetch(url, {
    method:  'GET',
    headers: buildHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Nookipedia API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  // Shuffle and take a batch so we get variety each session
  return shuffleArray(data).slice(0, CONFIG.BATCH_SIZE);
}

/** Fisher–Yates shuffle */
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}


/* ╔══════════════════════════════════════╗
   ║  MODULE: screens                     ║
   ╚══════════════════════════════════════╝ */

const SCREENS = {
  landing: document.getElementById('screen-landing'),
  swipe:   document.getElementById('screen-swipe'),
  profile: document.getElementById('screen-profile'),
  match:   document.getElementById('screen-match'),
};

/**
 * Transition to a new screen.
 * @param {'landing'|'swipe'|'profile'|'match'} id
 */
function goTo(id) {
  Object.values(SCREENS).forEach(screen => {
    screen.classList.remove('screen--active');
    screen.setAttribute('hidden', '');
    screen.style.display = '';
  });

  const target = SCREENS[id];
  if (!target) return;

  target.removeAttribute('hidden');

  // Trigger reflow so the CSS transition fires
  target.offsetHeight; // eslint-disable-line no-unused-expressions

  target.classList.add('screen--active');
}


/* ╔══════════════════════════════════════╗
   ║  MODULE: landing  (feature/home)     ║
   ╚══════════════════════════════════════╝ */

function initLanding() {
  _spawnHearts();

  document.getElementById('btn-start').addEventListener('click', () => {
    goTo('swipe');
    initSwipe();
  });

  document.getElementById('btn-exit').addEventListener('click', () => {
    // Graceful exit message for browsers (window.close() only works for
    // windows opened via script; show a friendly overlay otherwise)
    const confirmed = window.confirm('¿Seguro que quieres salir de ACRINDER? 💔');
    if (confirmed) window.close();
  });
}

/** Generate floating hearts background for landing */
function _spawnHearts() {
  const container = document.getElementById('hearts-bg');
  const EMOJIS = ['♥', '❤', '💕', '💗', '💖', '💓', '🌿', '🍃'];
  const COUNT  = 28;

  for (let i = 0; i < COUNT; i++) {
    const el = document.createElement('span');
    el.className  = 'heart-float';
    el.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    el.style.left     = `${Math.random() * 100}%`;
    el.style.animationDuration   = `${6 + Math.random() * 10}s`;
    el.style.animationDelay      = `${-Math.random() * 14}s`;
    el.style.fontSize             = `${0.8 + Math.random() * 1.6}rem`;
    container.appendChild(el);
  }
}


/* ╔══════════════════════════════════════╗
   ║  MODULE: swipe  (feature/swipe)      ║
   ╚══════════════════════════════════════╝ */

/** Internal state for the swipe screen */
const swipeState = {
  queue:          [],   // Array of villager objects
  currentVillager: null,
  isAnimating:    false,
  draggable:      null, // GSAP Draggable instance
};

async function initSwipe() {
  if (swipeState.queue.length > 0) {
    _loadNextCard();
    return;
  }

  _setLoading(true);

  try {
    swipeState.queue = await fetchVillagers();
    _loadNextCard();
  } catch (err) {
    console.error('[ACRINDER] Failed to fetch villagers:', err);
    _showFetchError();
  } finally {
    _setLoading(false);
  }
}

/** Show / hide the loading overlay */
function _setLoading(isLoading) {
  document.getElementById('swipe-loader').classList.toggle('is-loading', isLoading);
}

/** Inject next villager data into the card and attach GSAP draggable */
function _loadNextCard() {
  if (swipeState.queue.length === 0) {
    _showEmptyState();
    return;
  }

  const villager = swipeState.queue.shift();
  swipeState.currentVillager = villager;

  const card = document.getElementById('villager-card');

  // Reset card position/rotation
  gsap.set(card, { x: 0, y: 0, rotation: 0, opacity: 1, scale: 1 });

  // Inject content
  const img      = document.getElementById('card-img');
  const nameEl   = document.getElementById('card-name');
  const quoteEl  = document.getElementById('card-quote');
  const pronounEl = document.getElementById('card-pronoun');

  img.src     = villager.nh_details?.image_url || villager.image_url || '';
  img.alt     = `${villager.name}, personaje de Animal Crossing`;
  nameEl.textContent  = villager.name  || 'Unknown';
  quoteEl.textContent = `"${villager.saying || villager.quote || 'Warp! I said warp!'}"`;
  pronounEl.textContent = _getPronoun(villager.gender);

  // Entrance animation
  gsap.from(card, {
    y: -60,
    opacity: 0,
    scale: 0.85,
    duration: 0.55,
    ease: 'back.out(1.4)',
  });

  _attachDraggable(card);
}

/** Return pronoun based on gender field from API */
function _getPronoun(gender) {
  if (!gender) return 'them';
  const g = gender.toLowerCase();
  if (g === 'male')   return 'him';
  if (g === 'female') return 'her';
  return 'them';
}

/**
 * ─────────────────────────────────────────────────────
 *  GSAP DRAGGABLE – Tinder-style swipe interaction
 * ─────────────────────────────────────────────────────
 */
function _attachDraggable(card) {
  // Destroy any previous instance
  if (swipeState.draggable) {
    swipeState.draggable.kill();
    swipeState.draggable = null;
  }

  const likeStamp = card.parentElement.querySelector('.swipe-stamp--like');
  const nopeStamp = card.parentElement.querySelector('.swipe-stamp--nope');

  swipeState.draggable = Draggable.create(card, {
    type: 'x,y',
    inertia: false,
    cursor: 'grab',
    activeCursor: 'grabbing',

    onDrag() {
      if (swipeState.isAnimating) return;

      const progress = this.x / CONFIG.SWIPE_THRESHOLD;

      // Rotate card while dragging
      gsap.set(card, { rotation: this.x * 0.06 });

      // Show / fade stamps
      if (this.x > 0) {
        likeStamp.style.opacity = Math.min(Math.abs(progress), 1);
        nopeStamp.style.opacity = 0;
      } else {
        nopeStamp.style.opacity = Math.min(Math.abs(progress), 1);
        likeStamp.style.opacity = 0;
      }
    },

    onDragEnd() {
      if (swipeState.isAnimating) return;

      likeStamp.style.opacity = 0;
      nopeStamp.style.opacity = 0;

      if (this.x > CONFIG.SWIPE_THRESHOLD) {
        _swipeOut('right');
      } else if (this.x < -CONFIG.SWIPE_THRESHOLD) {
        _swipeOut('left');
      } else {
        // Snap back
        gsap.to(card, {
          x: 0, y: 0, rotation: 0,
          duration: 0.5,
          ease: 'elastic.out(1, 0.6)',
        });
      }
    },
  })[0];
}

/**
 * Animate a card off-screen and trigger the appropriate action.
 * @param {'left'|'right'} direction
 */
function _swipeOut(direction) {
  if (swipeState.isAnimating) return;
  swipeState.isAnimating = true;

  const card   = document.getElementById('villager-card');
  const exitX  = direction === 'right' ? CONFIG.SWIPE_EXIT_X : -CONFIG.SWIPE_EXIT_X;
  const rotate = direction === 'right' ? 30 : -30;

  gsap.to(card, {
    x: exitX,
    rotation: rotate,
    opacity: 0,
    duration: 0.45,
    ease: 'power2.in',
    onComplete: () => {
      swipeState.isAnimating = false;

      if (direction === 'right') {
        // LIKE → go to match screen
        initMatch(swipeState.currentVillager);
        goTo('match');
      } else {
        // NOPE → load next card
        _loadNextCard();
      }
    },
  });
}

/** Wire up the manual control buttons */
function _initSwipeButtons() {
  document.getElementById('btn-like').addEventListener('click', () => _swipeOut('right'));
  document.getElementById('btn-nope').addEventListener('click', () => _swipeOut('left'));

  document.getElementById('btn-know-more').addEventListener('click', () => {
    goTo('profile');
    initProfile(swipeState.currentVillager);
  });
}

/** Shown when the villager queue is exhausted */
function _showEmptyState() {
  const card = document.getElementById('villager-card');
  card.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:1rem;padding:2rem;text-align:center;">
      <span style="font-size:3rem">🍃</span>
      <p style="font-family:var(--font-display);font-size:1.2rem;font-weight:800;color:var(--color-pink-dark)">
        No more villagers!
      </p>
      <p style="font-size:0.9rem;color:var(--color-text-mid)">You've seen everyone. Come back later!</p>
      <button onclick="location.reload()" style="margin-top:.5rem;font-family:var(--font-display);font-weight:800;background:var(--color-pink);color:#fff;border:none;border-radius:999px;padding:.65rem 1.8rem;cursor:pointer;">
        Reload 🔄
      </button>
    </div>
  `;
}

/** Shown when API call fails */
function _showFetchError() {
  const loader = document.getElementById('swipe-loader');
  loader.innerHTML = `
    <div style="text-align:center;padding:1rem;">
      <span style="font-size:2rem">🚫</span>
      <p style="margin:.5rem 0;font-weight:700;color:var(--color-red-nope)">API Error</p>
      <p style="font-size:.85rem;color:var(--color-text-mid);margin-bottom:1rem">
        Check your API key in <code>app.js → CONFIG.NOOKIPEDIA_API_KEY</code>
      </p>
      <button onclick="location.reload()" style="font-family:var(--font-display);font-weight:800;background:var(--color-pink);color:#fff;border:none;border-radius:999px;padding:.6rem 1.5rem;cursor:pointer;">
        Retry
      </button>
    </div>
  `;
  loader.classList.add('is-loading');
}


/* ╔══════════════════════════════════════╗
   ║  MODULE: profile  (feature/profile)  ║
   ╚══════════════════════════════════════╝ */

function initProfile(villager) {
  if (!villager) return;

  // Image
  const img = document.getElementById('profile-img');
  img.src = villager.nh_details?.image_url || villager.image_url || '';
  img.alt = villager.name;

  // Personality list
  const stats = _buildStats(villager);
  const list  = document.getElementById('personality-list');
  list.innerHTML = stats.map(s => `
    <li>
      <span class="stat-icon">${s.icon}</span>
      <span class="stat-label">${s.label}</span>
      <span class="stat-value">${s.value || '—'}</span>
    </li>
  `).join('');

  // Animate items in
  gsap.from(list.children, {
    x: 40,
    opacity: 0,
    stagger: 0.07,
    duration: 0.4,
    ease: 'power2.out',
  });

  // DATE button → go to match
  document.getElementById('btn-date').onclick = () => {
    goTo('match');
    initMatch(villager);
  };
}

/** Build the array of stats to display in the personality card */
function _buildStats(v) {
  return [
    { icon: '🏷️', label: 'Name',        value: v.name },
    { icon: '🐾', label: 'Species',     value: v.species },
    { icon: '⚥',  label: 'Gender',      value: v.gender },
    { icon: '✨', label: 'Personality', value: v.personality },
    { icon: '⭐', label: 'Star Sign',   value: v.sign      || v.star_sign },
    { icon: '🎂', label: 'Birthday',    value: v.birthday_month
      ? `${v.birthday_month} ${v.birthday_day}`
      : v.birthday },
    { icon: '💬', label: 'Phrase',      value: v.phrase    || v.catchphrase },
    { icon: '🎮', label: 'Game',        value: (v.appearances || []).join(', ') || 'NH' },
  ];
}

/** Back button wires up to the swipe screen */
function _initProfileBackButton() {
  document.getElementById('btn-back').addEventListener('click', () => {
    goTo('swipe');
  });
}


/* ╔══════════════════════════════════════╗
   ║  MODULE: match   (feature/match)     ║
   ╚══════════════════════════════════════╝ */

function initMatch(villager) {
  if (!villager) return;

  // Image
  const img = document.getElementById('match-img');
  img.src = villager.nh_details?.image_url || villager.image_url || '';
  img.alt = villager.name;

  // Romantic message
  document.getElementById('match-message-box').innerHTML = _buildMatchMessage(villager);

  // Side hearts
  _spawnMatchHearts('match-hearts-left');
  _spawnMatchHearts('match-hearts-right');

  // Keep swiping button
  document.getElementById('btn-keep-swiping').onclick = () => {
    goTo('swipe');
    _loadNextCard();
  };
}

/** Build a short romantic blurb using the villager's data */
function _buildMatchMessage(v) {
  const name  = v.name        || 'this villager';
  const phrase = v.phrase     || v.catchphrase || 'warp';
  const sign  = v.sign        || v.star_sign   || 'the stars';
  const pronoun = _getPronoun(v.gender);
  const poss    = pronoun === 'him' ? 'his' : pronoun === 'her' ? 'her' : 'their';

  return `
    <p>💌 <strong>${name}</strong> is smitten! A ${sign} who loves to say
    <em>"${phrase}"</em>... sounds like <em>${poss}</em> heart was waiting for
    someone just like you.</p>
    <p style="margin-top:.65rem">Together you'll pick fruit, decorate islands,
    and maybe write your names in the sand. 🏝️✨</p>
  `;
}

/** Fill a match-side column with animated heart emojis */
function _spawnMatchHearts(containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  const EMOJIS = ['💕', '💗', '💖', '💓', '💞', '♥', '❤️'];
  for (let i = 0; i < 10; i++) {
    const span = document.createElement('span');
    span.className   = 'hrt';
    span.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    container.appendChild(span);
  }
}


/* ╔══════════════════════════════════════╗
   ║  INIT – Bootstrap all modules        ║
   ╚══════════════════════════════════════╝ */

function bootstrap() {
  // Show landing screen on load
  goTo('landing');

  // Wire all modules
  initLanding();
  _initSwipeButtons();
  _initProfileBackButton();

  console.log('%c🍃 ACRINDER loaded!', 'font-size:16px;color:#F28FAD;font-weight:bold;');
  console.log(
    '%cAPI KEY location → app.js line with CONFIG.NOOKIPEDIA_API_KEY',
    'color:#7A5C5C;font-size:12px;'
  );
}

// Run after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}

