// Home / landing screen.
//
// Layout per `specifications/jlpt-n5-design-system-zen-modern.md` §5.1
// (homepage rewrite, 2026-05-02):
//   1. Hero: "JLPT N5 study material." + 5-line inventory (counts read at
//      runtime from data/*.json so the homepage updates automatically when
//      content is added).
//   2. Resume strip: single line above SECTIONS for returning users only.
//   3. SECTIONS label + 2 cards (Learn / Test, no "Browse" text label, →
//      chevron is the affordance).
//   4. "Placement check available." inline link.
//
// Copy register (§5.1.1, mandatory): describe contents, no opinion. No
// outcome claims, no second-person, no verbs of encouragement, no trust
// reassurance, no superlatives. Counts are bare numerals + nouns.
import * as storage from './storage.js';

// Cache the corpus counts at module scope so we fetch each file once.
let corpusCounts = null;
async function loadCorpusCounts() {
  if (corpusCounts) return corpusCounts;
  const files = ['grammar', 'vocab', 'kanji', 'reading', 'listening'];
  const fetches = files.map(name =>
    fetch(`data/${name}.json`)
      .then(r => r.ok ? r.json() : null)
      .catch(() => null)
  );
  const [grammar, vocab, kanji, reading, listening] = await Promise.all(fetches);
  // Each data file uses a different top-level key for its main array.
  const count = (d, ...keys) => {
    if (!d) return 0;
    for (const k of keys) {
      if (Array.isArray(d[k])) return d[k].length;
    }
    return 0;
  };
  corpusCounts = {
    grammar: count(grammar, 'patterns'),
    vocab: count(vocab, 'entries'),
    kanji: count(kanji, 'entries'),
    reading: count(reading, 'passages'),
    listening: count(listening, 'items'),
  };
  return corpusCounts;
}

// Render a number with US-locale thousands separators (1003 → "1,003"). Bare
// digits otherwise. Per spec §5.1 rule 4.
const fmt = (n) => Intl.NumberFormat('en-US').format(n || 0);

export async function renderHome(container) {
  const history = storage.getHistory();
  const results = storage.getResults();
  const isReturning = Object.keys(history).length > 0 || results.length > 0;
  const settings = storage.getSettings();
  const lastViewed = settings.lastLearnId || null;
  const counts = await loadCorpusCounts();

  // Resume strip: single-line link above SECTIONS, ONLY for returning users.
  // Format: "Last session: <topic>." per spec §5.1 rule 9. We keep this
  // minimal -- full session/topic mapping is approximated via the
  // last-viewed pattern ID. First-time visitors see no strip at all.
  const resumeStrip = (isReturning && lastViewed)
    ? `<a class="resume-strip" href="#/learn/${encodeURIComponent(lastViewed)}">Last session: ${esc(lastViewed)}.</a>`
    : '';

  container.innerHTML = `
    <section class="home">
      <section class="hero">
        <h1 class="hero-headline">JLPT N5 study material.</h1>
        <ul class="hero-inventory">
          <li>${fmt(counts.grammar)} grammar patterns.</li>
          <li>${fmt(counts.vocab)} vocabulary items.</li>
          <li>${fmt(counts.kanji)} kanji.</li>
          <li>${fmt(counts.reading)} reading passages.</li>
          <li>${fmt(counts.listening)} listening drills.</li>
        </ul>
      </section>

      ${resumeStrip}

      <section class="sections" aria-label="Sections">
        <header class="section-label">
          <span class="section-label-text">Sections</span>
          <span class="section-label-rule" aria-hidden="true"></span>
        </header>
        <div class="learn-grid">
          <a class="card card-link" href="#/learn">
            <p class="card-index" aria-hidden="true">01</p>
            <h3 class="card-title">Learn</h3>
            <p class="card-meta">Grammar, vocabulary, kanji, reading, listening.</p>
            <span class="card-arrow" aria-hidden="true">→</span>
          </a>
          <a class="card card-link" href="#/test">
            <p class="card-index" aria-hidden="true">02</p>
            <h3 class="card-title">Test</h3>
            <p class="card-meta">15-question mock exam.</p>
            <span class="card-arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      <p class="placement-link">
        <a href="#/diagnostic">Placement check available.</a>
      </p>
    </section>
  `;
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}
