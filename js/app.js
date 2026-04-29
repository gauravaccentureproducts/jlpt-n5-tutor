// Router + chapter coordinator.
import { initStorage, getDueCount } from './storage.js';
import { initFuriganaToggle } from './furigana.js';
import { renderLearn } from './learn.js';
import { renderTest } from './test.js';
import { renderReview } from './review.js';
import { renderSummary } from './summary.js';
import { renderDrill } from './drill.js';
import { renderDiagnostic } from './diagnostic.js';
import { renderSettings, applyTheme, applyFontSize } from './settings.js';
import { renderKosoado } from './kosoado.js';
import { renderWaGa } from './wa-vs-ga.js';
import { renderVerbClass } from './verb-class.js';
import { renderTeForm } from './te-form.js';
import { renderParticlePairs } from './particle-pairs.js';
import { renderCounters } from './counters.js';
import { renderReading } from './reading.js';
import { renderListening } from './listening.js';
import { initI18n } from './i18n.js';

const ROUTES = {
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

async function route() {
  const container = document.getElementById('app');
  const { name, params } = parseRoute();
  const handler = ROUTES[name] || renderLearn;
  setActiveNav(handler === renderLearn ? 'learn' : name);
  container.innerHTML = '<p class="loading">Loading...</p>';
  try {
    await handler(container, params);
  } catch (err) {
    console.error('Route handler failed:', err);
    container.innerHTML = `<div class="placeholder"><h2>Error</h2><p>${err.message}</p></div>`;
  }
  refreshDrillBadge();
}

window.addEventListener('hashchange', route);
window.addEventListener('DOMContentLoaded', async () => {
  initStorage();
  applyTheme();
  applyFontSize();
  await initI18n();
  await initFuriganaToggle(route);
  if (!location.hash) location.hash = '#/learn';
  await route();
});
