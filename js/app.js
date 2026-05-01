// Router + chapter coordinator.
import { initStorage, getDueCount, recordStudyToday } from './storage.js';
import { initFuriganaToggle } from './furigana.js';
import { renderLearn } from './learn.js';
import { renderTest } from './test.js';
import { renderReview } from './review.js';
import { renderSummary } from './summary.js';
import { renderDrill } from './drill.js';
import { renderDiagnostic } from './diagnostic.js';
import { renderSettings, applyTheme, applyFontSize, applyAudioRate, applyReduceMotion } from './settings.js';
import { initKanjiPopover } from './kanji-popover.js';
import { initShortcuts } from './shortcuts.js';
import { initSearch } from './search.js';
import { initPwa } from './pwa.js';
import { renderKosoado } from './kosoado.js';
import { renderWaGa } from './wa-vs-ga.js';
import { renderVerbClass } from './verb-class.js';
import { renderTeForm } from './te-form.js';
import { renderParticlePairs } from './particle-pairs.js';
import { renderCounters } from './counters.js';
import { renderReading } from './reading.js';
import { renderListening } from './listening.js';
import { renderKanji } from './kanji.js';
import { renderHome } from './home.js';
import { initI18n } from './i18n.js';
import { renderPapers } from './papers.js';

const ROUTES = {
  home:       renderHome,
  learn:      renderLearn,
  test:       renderTest,
  drill:      renderDrill,
  review:     renderReview,
  summary:    renderSummary,
  diagnostic: renderDiagnostic,
  settings:   renderSettings,
  kosoado:    renderKosoado,
  waga:       renderWaGa,
  verbclass:  renderVerbClass,
  teform:     renderTeForm,
  particles:  renderParticlePairs,
  counters:   renderCounters,
  reading:    renderReading,
  listening:  renderListening,
  kanji:      renderKanji,
  papers:     renderPapers,
};

function parseRoute() {
  const hash = location.hash || '#/learn';
  const m = hash.match(/^#\/(\w+)(?:\/(.*))?$/);
  if (!m) return { name: 'learn', params: '' };
  return { name: m[1], params: m[2] || '' };
}

function setActiveNav(name) {
  document.querySelectorAll('.primary-nav a').forEach(a => {
    a.classList.toggle('active', a.dataset.route === name);
  });
}


function refreshDrillBadge() {
  const badge = document.getElementById('drill-badge');
  if (!badge) return;
  const due = getDueCount();
  if (due > 0) {
    badge.textContent = String(due);
    badge.hidden = false;
  } else {
    badge.hidden = true;
  }
}

function renderSkeleton(container, name) {
  // Skeleton placeholder shapes matching the destination route.
  // Replaces the legacy "Loading..." text per Brief 2 §3.1.
  // Each shape kind maps to a specific HTML block that approximates the
  // dimensions of the rendered content, so the layout doesn't shift when
  // the real content swaps in.
  const shapes = {
    home:       ['title', 'tagline', 'cta', 'pillars'],
    learn:      ['title', 'rows', 'rows', 'rows'],
    test:       ['title', 'card', 'card'],
    drill:      ['title', 'card'],
    review:     ['title', 'card'],
    summary:    ['title', 'rows', 'rows'],
    diagnostic: ['title', 'card', 'rows'],
    settings:   ['title', 'rows', 'rows'],
    reading:    ['title', 'rows', 'rows'],
    listening:  ['title', 'rows'],
    kanji:      ['title', 'grid'],
  };
  const blocks = (shapes[name] || ['title', 'card', 'rows']).map(kind => {
    if (kind === 'title')   return '<div class="skeleton skeleton-title" aria-hidden="true"></div>';
    if (kind === 'tagline') return '<div class="skeleton skeleton-tagline" aria-hidden="true"></div>';
    if (kind === 'cta')     return '<div class="skeleton-ctas" aria-hidden="true"><div class="skeleton skeleton-btn"></div><div class="skeleton skeleton-btn"></div></div>';
    if (kind === 'pillars') return '<div class="skeleton-pillars" aria-hidden="true"><div class="skeleton skeleton-pillar"></div><div class="skeleton skeleton-pillar"></div></div>';
    if (kind === 'grid')    return '<div class="skeleton-grid" aria-hidden="true">' + '<div class="skeleton skeleton-grid-cell"></div>'.repeat(18) + '</div>';
    if (kind === 'card')    return '<div class="skeleton skeleton-card" aria-hidden="true"></div>';
    return '<div class="skeleton skeleton-row" aria-hidden="true"></div>'.repeat(3);
  }).join('');
  container.innerHTML = `<div class="skeleton-wrap" role="status" aria-live="polite" aria-label="Loading">${blocks}</div>`;
}

function renderTimeout(container, name) {
  container.innerHTML = `
    <div class="placeholder">
      <h2>Couldn't load this view</h2>
      <p>The <strong>${name}</strong> tab is taking longer than expected.</p>
      <p class="muted small">If you're offline, the cached version may still appear in a moment. Otherwise the data file may be missing or unreachable.</p>
      <button class="btn-primary" onclick="window.location.reload()">Retry</button>
    </div>
  `;
}

async function route() {
  const container = document.getElementById('app');
  const { name, params } = parseRoute();
  const handler = ROUTES[name] || renderLearn;
  setActiveNav(handler === renderLearn ? 'learn' : name);
  renderSkeleton(container, name);
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    renderTimeout(container, name);
  }, 5000);
  try {
    await handler(container, params);
  } catch (err) {
    console.error('Route handler failed:', err);
    if (!timedOut) {
      container.innerHTML = `<div class="placeholder"><h2>Error</h2><p>${err.message}</p><button class="btn-primary" onclick="window.location.reload()">Reload</button></div>`;
    }
  } finally {
    clearTimeout(timeoutId);
  }
  refreshDrillBadge();
}

// Brief 2 §7.3: prompt before discarding in-progress Test state.
function shouldPromptOnLeave() {
  const hash = location.hash || '';
  // The test module sets view='attempting' on its own state. We can't peek
  // into it cleanly here, but we can detect via a global flag the module
  // sets when it enters/exits attempting.
  return !!window.__testInProgress;
}

window.addEventListener('beforeunload', (ev) => {
  if (shouldPromptOnLeave()) {
    ev.preventDefault();
    ev.returnValue = '';
    return '';
  }
});

let lastConfirmedHash = location.hash;
window.addEventListener('hashchange', (ev) => {
  if (shouldPromptOnLeave()) {
    const ok = confirm('Quit this test? Progress so far will be saved to history.');
    if (!ok) {
      // Revert hash without re-firing the handler (silent)
      history.replaceState(null, '', lastConfirmedHash || '#/home');
      return;
    }
    window.__testInProgress = false;
  }
  lastConfirmedHash = location.hash;
  route();
});
window.addEventListener('DOMContentLoaded', async () => {
  initStorage();
  applyTheme();
  applyFontSize();
  applyReduceMotion();
  await initI18n();
  await initFuriganaToggle(route);
  initKanjiPopover();
  initShortcuts();
  initSearch();
  initPwa();
  // Record study activity for streak (Brief 2 §6.1) on any meaningful interaction
  ['click', 'keydown'].forEach(evt => {
    document.addEventListener(evt, () => recordStudyToday(), { once: true });
  });
  if (!location.hash) location.hash = '#/home';
  await route();
  applyAudioRate();
});

// Re-render the active route when furigana mode changes (Brief 2 §4.1, §4.2)
// without losing scroll - listens for the custom event from Settings + popover.
document.addEventListener('furigana-rerender', () => { route(); });
// Apply audio rate on every route change (any new <audio> elements).
document.addEventListener('DOMContentLoaded', () => {
  const obs = new MutationObserver(() => applyAudioRate());
  obs.observe(document.getElementById('app') || document.body, { childList: true, subtree: true });
});
