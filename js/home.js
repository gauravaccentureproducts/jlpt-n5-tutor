// Home / landing screen.
// First-time visitor: 2 pillar cards (Learn / Test) + small placement-check link.
// Returning visitor: recommender + resume cards + streak strip + pillars.
//
// Voice: institutional / reference (think MIT OpenCourseWare, arxiv.org).
// No outcome promises, no time-to-result claims, no second-person imperatives,
// no celebration glyphs. State facts; describe what the tool contains.
// See TASKS.md "Copy audit: remove sales-promo voice" for the full guideline.
//
// 2026-05-01: hero (heading + tagline + CTAs) removed entirely per user
// direction. Pillars are now the front door. Corpus counts no longer
// appear on the home page; they're on the Learn hub instead.
import * as storage from './storage.js';

export async function renderHome(container) {
  const history = storage.getHistory();
  const results = storage.getResults();
  const isReturning = Object.keys(history).length > 0 || results.length > 0;
  const dueCount = storage.getDueCount();
  const streak = storage.getStreak();
  const settings = storage.getSettings();
  const lastViewed = settings.lastLearnId || null;

  container.innerHTML = `
    <section class="home">
      ${isReturning ? renderRecommendation(pickRecommendation({ dueCount, streak, lastViewed })) : ''}
      ${isReturning ? renderReturning({ history, results, dueCount, streak, lastViewed }) : ''}
      <section class="home-pillars" aria-label="Sections">
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
        <p class="muted small home-footnote"><a href="#/diagnostic">Take a placement check</a> to skip what you already know.</p>
      `}
    </section>
  `;
}

function renderReturning({ results, dueCount, streak, lastViewed }) {
  const lastResult = results[results.length - 1];
  const dayBoxes = renderHeatmap(streak.days || []);
  return `
    <section class="home-resume" aria-label="Resume">
      <div class="resume-card">
        <h3>Resume</h3>
        ${lastViewed ? `
          <p>Last lesson: <strong>${esc(lastViewed)}</strong></p>
          <a class="btn-primary" href="#/learn/${encodeURIComponent(lastViewed)}">Resume lesson</a>
        ` : `
          <p>Pick up the next pattern in order.</p>
          <a class="btn-primary" href="#/learn">Continue lessons</a>
        `}
      </div>
      <div class="resume-card">
        <h3>Reviews due today</h3>
        ${dueCount > 0 ? `
          <p><strong>${dueCount}</strong> ${dueCount === 1 ? 'item' : 'items'}.</p>
          <a class="btn-primary" href="#/review">Start review</a>
        ` : `
          <p class="muted">No reviews due.</p>
          <a class="btn-secondary" href="#/learn">Open Learn</a>
        `}
      </div>
    </section>
    <section class="home-streak" aria-label="Study streak">
      <div class="streak-summary">
        <span class="streak-flame" aria-hidden="true">🔥</span>
        <span class="streak-num">${streak.current || 0}</span>
        <span class="streak-label">${(streak.current || 0) === 1 ? 'day' : 'days'}</span>
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

// Minimal "Suggested next" recommender (Spec supplement OQ-1, option d).
// Picks ONE action based on current state, in priority order:
//   1. Many reviews due (>=10) - state count.
//   2. Streak risk - hasn't studied today and current streak >= 1.
//   3. Some reviews due - state count.
//   4. Studied today, nothing due - mixed drill.
//   5. Default - next lesson.
function pickRecommendation({ dueCount, streak, lastViewed }) {
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  const studiedToday = (streak.days || []).includes(todayKey);
  const learnHref = lastViewed ? `#/learn/${encodeURIComponent(lastViewed)}` : '#/learn';

  if (dueCount >= 10) {
    return { label: `${dueCount} reviews due today`, href: '#/review' };
  }
  if ((streak.current || 0) >= 1 && !studiedToday) {
    return { label: `Continue (${streak.current}-day streak)`, href: learnHref };
  }
  if (dueCount >= 1) {
    return { label: `${dueCount} ${dueCount === 1 ? 'review' : 'reviews'} due today`, href: '#/review' };
  }
  if (studiedToday) {
    return { label: 'Mixed drill', href: '#/drill' };
  }
  return { label: 'Next lesson', href: learnHref };
}

function renderRecommendation(rec) {
  return `
    <aside class="home-recommend" aria-label="Suggested next">
      <span class="rec-prompt">Suggested next</span>
      <a class="rec-link" href="${rec.href}">${esc(rec.label)} →</a>
    </aside>
  `;
}
