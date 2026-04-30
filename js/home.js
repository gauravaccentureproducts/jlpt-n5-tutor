// Home / landing screen (Brief 2 §1).
// First-time visitor: tagline + CTA + placement + 3-card row + trust strip.
// Returning visitor: Continue card + Today's queue + 7-day streak strip
// above the 3-card row.
import * as storage from './storage.js';

let grammarCount = null;
let vocabCount = null;
let kanjiCount = null;

async function loadCorpusCounts() {
  // Single source of truth for corpus sizes: the data files. Refusing to hardcode
  // these in the home tagline (per 2026-04-30: 97/106 kanji drift caught in QA).
  if (grammarCount !== null && vocabCount !== null && kanjiCount !== null) return;
  try {
    const [g, v, k] = await Promise.all([
      fetch('data/grammar.json').then(r => r.json()),
      fetch('data/vocab.json').then(r => r.json()),
      fetch('data/kanji.json').then(r => r.json()),
    ]);
    grammarCount = (g.patterns || []).length;
    vocabCount = (v.entries || []).length;
    kanjiCount = (k.entries || []).length;
  } catch {
    grammarCount = grammarCount ?? 0;
    vocabCount = vocabCount ?? 0;
    kanjiCount = kanjiCount ?? 0;
  }
}

export async function renderHome(container) {
  await loadCorpusCounts();
  const history = storage.getHistory();
  const results = storage.getResults();
  const isReturning = Object.keys(history).length > 0 || results.length > 0;
  const dueCount = storage.getDueCount();
  const streak = storage.getStreak();
  const settings = storage.getSettings();
  // Find the first unstudied pattern for the CTA
  // (cheap heuristic: any pattern id not in history)
  const lastViewed = settings.lastLearnId || null;

  container.innerHTML = `
    <section class="home">
      ${isReturning ? renderRecommendation(pickRecommendation({ dueCount, streak, lastViewed })) : ''}
      ${isReturning ? renderReturning({ history, results, dueCount, streak, lastViewed }) : ''}
      <section class="home-cta">
        <h2>${isReturning ? 'Continue your N5 study' : 'Pass JLPT N5 with 15 minutes a day'}</h2>
        ${isReturning ? `
          <p class="home-tagline">${grammarCount} grammar patterns. ${vocabCount} vocab words. ${kanjiCount} N5 kanji.</p>
        ` : `
          <ul class="hero-stats" aria-label="Corpus size">
            <li class="stat"><b>${grammarCount}</b> grammar</li>
            <li class="stat"><b>${vocabCount}</b> vocab</li>
            <li class="stat"><b>${kanjiCount}</b> kanji</li>
            <li class="stat"><b>30</b> reading</li>
            <li class="stat"><b>12</b> listening</li>
          </ul>
        `}
        ${!isReturning ? `
          <ul class="trust-strip" aria-label="What this app guarantees">
            <li>✓ Works offline</li>
            <li>✓ No login required</li>
            <li>✓ Your progress stays on this device</li>
          </ul>
        ` : ''}
        <div class="home-cta-buttons">
          <a class="btn-primary" href="#/learn${lastViewed ? '/' + encodeURIComponent(lastViewed) : ''}">${isReturning ? 'Continue lessons' : 'Start your first lesson'}</a>
          <a class="btn-secondary" href="#/diagnostic">Take a placement check</a>
        </div>
      </section>
      <section class="home-pillars" aria-label="Product pillars">
        <a class="pillar-card" href="#/learn">
          <h3>Learn</h3>
          <p>Grammar, vocab, kanji, reading, listening - pick a section.</p>
          <span class="pillar-arrow" aria-hidden="true">→</span>
        </a>
        <a class="pillar-card" href="#/test">
          <h3>Test</h3>
          <p>Mock JLPT-format exams (20 / 30 / 50 questions).</p>
          <span class="pillar-arrow" aria-hidden="true">→</span>
        </a>
      </section>
      ${isReturning ? '' : `
        <p class="muted small home-footnote">Already familiar with some N5 material? Take the placement check above to skip what you know.</p>
      `}
    </section>
  `;
}

function renderReturning({ results, dueCount, streak, lastViewed }) {
  const lastResult = results[results.length - 1];
  const dayBoxes = renderHeatmap(streak.days || []);
  return `
    <section class="home-resume" aria-label="Resume where you left off">
      <div class="resume-card">
        <h3>Continue where you left off</h3>
        ${lastViewed ? `
          <p>Last lesson: <strong>${esc(lastViewed)}</strong></p>
          <a class="btn-primary" href="#/learn/${encodeURIComponent(lastViewed)}">Resume lesson</a>
        ` : `
          <p>Pick up the next pattern in order.</p>
          <a class="btn-primary" href="#/learn">Continue lessons</a>
        `}
      </div>
      <div class="resume-card">
        <h3>Today's review queue</h3>
        ${dueCount > 0 ? `
          <p><strong>${dueCount}</strong> ${dueCount === 1 ? 'item is' : 'items are'} due today.</p>
          <a class="btn-primary" href="#/review">Start review</a>
        ` : `
          <p class="muted">All caught up - come back tomorrow.</p>
          <a class="btn-secondary" href="#/learn">Learn something new</a>
        `}
      </div>
    </section>
    <section class="home-streak" aria-label="Study streak">
      <div class="streak-summary">
        <span class="streak-flame" aria-hidden="true">🔥</span>
        <span class="streak-num">${streak.current || 0}</span>
        <span class="streak-label">${(streak.current || 0) === 1 ? 'day streak' : 'day streak'}</span>
        ${streak.longest > 1 ? `<span class="muted small">(longest: ${streak.longest})</span>` : ''}
      </div>
      <div class="streak-heatmap" aria-hidden="true">${dayBoxes}</div>
      ${lastResult ? `<p class="muted small">Last test: ${formatDate(lastResult.timestamp)} - ${lastResult.correct}/${lastResult.total}.</p>` : ''}
    </section>
  `;
}

function renderHeatmap(days) {
  // 7-day window ending today
  const today = new Date();
  const cells = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const studied = days.includes(key);
    cells.push(`<span class="heat-cell ${studied ? 'studied' : ''}" title="${key}${studied ? ' - studied' : ''}"></span>`);
  }
  return cells.join('');
}

function formatDate(iso) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString(); } catch { return iso; }
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

// "What should I study next?" minimal recommender (Spec supplement OQ-1, option d).
// Picks ONE action based on current state, in priority order:
//   1. Many reviews due (>=10) - clear them first.
//   2. Streak risk - hasn't studied today and current streak >= 1.
//   3. Some reviews due - keep retention up.
//   4. Studied today, nothing due - mix it up with a drill.
//   5. Default - continue the next lesson.
function pickRecommendation({ dueCount, streak, lastViewed }) {
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  const studiedToday = (streak.days || []).includes(todayKey);
  const learnHref = lastViewed ? `#/learn/${encodeURIComponent(lastViewed)}` : '#/learn';

  if (dueCount >= 10) {
    return { label: `Clear today's review queue (${dueCount} due)`, href: '#/review' };
  }
  if ((streak.current || 0) >= 1 && !studiedToday) {
    return { label: `Keep your ${streak.current}-day streak alive`, href: learnHref };
  }
  if (dueCount >= 1) {
    return { label: `Run today's review (${dueCount} due)`, href: '#/review' };
  }
  if (studiedToday) {
    return { label: 'Try a quick mixed drill', href: '#/drill' };
  }
  return { label: 'Pick up the next lesson', href: learnHref };
}

function renderRecommendation(rec) {
  return `
    <aside class="home-recommend" aria-label="Recommended next step">
      <span class="rec-prompt">What should I study next?</span>
      <a class="rec-link" href="${rec.href}">${esc(rec.label)} →</a>
    </aside>
  `;
}
