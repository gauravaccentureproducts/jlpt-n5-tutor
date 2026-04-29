// Home / landing screen (Brief 2 §1).
// First-time visitor: tagline + CTA + placement + 3-card row + trust strip.
// Returning visitor: Continue card + Today's queue + 7-day streak strip
// above the 3-card row.
import * as storage from './storage.js';

let grammarCount = null;

async function loadGrammarCount() {
  if (grammarCount !== null) return grammarCount;
  try {
    const res = await fetch('data/grammar.json');
    const d = await res.json();
    grammarCount = (d.patterns || []).length;
  } catch {
    grammarCount = 0;
  }
  return grammarCount;
}

export async function renderHome(container) {
  await loadGrammarCount();
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
      ${isReturning ? renderReturning({ history, results, dueCount, streak, lastViewed }) : ''}
      <section class="home-cta">
        <h2>${isReturning ? 'Continue your N5 study' : 'Start your N5 study'}</h2>
        <p class="muted">${grammarCount} grammar patterns. ~1000 vocab words. 97 N5 kanji. No login. Works offline.</p>
        <div class="home-cta-buttons">
          <a class="btn-primary" href="#/learn${lastViewed ? '/' + encodeURIComponent(lastViewed) : ''}">${isReturning ? 'Continue lessons' : 'Start your first lesson'}</a>
          <a class="btn-secondary" href="#/diagnostic">Take a placement check</a>
        </div>
      </section>
      <section class="home-pillars" aria-label="Product pillars">
        <a class="pillar-card" href="#/learn">
          <h3>Learn</h3>
          <p>Grammar, vocab, kanji, reading, listening - pick a section.</p>
        </a>
        <a class="pillar-card" href="#/drill">
          <h3>Practice</h3>
          <p>Daily mixed drills + spaced-repetition Review.</p>
        </a>
        <a class="pillar-card" href="#/test">
          <h3>Test</h3>
          <p>Mock JLPT-format exams (20 / 30 / 50 questions).</p>
        </a>
      </section>
      ${isReturning ? '' : `
        <p class="muted small home-footnote">Already partway through? Take the placement check above so you don't repeat what you know.</p>
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
