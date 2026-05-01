// Chapter 1 - Learn. Hub > Grammar TOC | Vocab TOC | pattern detail.
import { renderJa } from './furigana.js';
import * as storage from './storage.js';

let grammarCache = null;
let vocabCache = null;
let kanjiCache = null;

async function loadGrammar() {
  if (grammarCache) return grammarCache;
  const res = await fetch('data/grammar.json');
  if (!res.ok) throw new Error(`Failed to load grammar.json: ${res.status}`);
  grammarCache = await res.json();
  return grammarCache;
}

async function loadVocab() {
  if (vocabCache) return vocabCache;
  const res = await fetch('data/vocab.json');
  if (!res.ok) throw new Error(`Failed to load vocab.json: ${res.status}`);
  vocabCache = await res.json();
  return vocabCache;
}

async function loadKanji() {
  if (kanjiCache) return kanjiCache;
  const res = await fetch('data/kanji.json');
  if (!res.ok) throw new Error(`Failed to load kanji.json: ${res.status}`);
  kanjiCache = await res.json();
  return kanjiCache;
}

export async function renderLearn(container, params) {
  const slug = params ? decodeURIComponent(params) : '';
  // Hub: no slug -> 5-card chooser (Brief 2 follow-up).
  if (!slug) {
    // Pre-load corpora so the hub copy reflects live counts (single source of truth = data files).
    await Promise.all([loadGrammar(), loadVocab(), loadKanji()]);
    return renderHub(container);
  }
  // Sub-section: grammar TOC.
  if (slug === 'grammar') {
    const data = await loadGrammar();
    return renderTOC(container, data);
  }
  // Sub-section: vocabulary list or per-word detail.
  if (slug === 'vocab' || slug === 'vocabulary') {
    const data = await loadVocab();
    return renderVocabList(container, data);
  }
  if (slug.startsWith('vocab/')) {
    const data = await loadVocab();
    const grammar = await loadGrammar();
    const form = decodeURIComponent(slug.slice('vocab/'.length));
    return renderVocabDetail(container, data, grammar, form);
  }
  // Otherwise treat as a pattern ID.
  const data = await loadGrammar();
  const pattern = data.patterns.find(p => p.id === slug);
  if (pattern) return renderPatternDetail(container, pattern);
  // Unknown slug - fall back to hub.
  return renderHub(container);
}

function renderHub(container) {
  // Two semantic groups: Reference (3 cards) + Practice (2 cards).
  // Avoids the 3+2 orphan a flat 5-card grid produces, and the labels
  // help the learner pick the right surface for the moment.
  const grammarCount = (grammarCache?.patterns || []).length || 187;
  const vocabCount = (vocabCache?.entries || []).length || 1003;
  const kanjiCount = (kanjiCache?.entries || []).length || 106;
  container.innerHTML = `
    <h2>Learn</h2>
    <p class="page-lede">Pick what you want to study. Each section is self-contained.</p>

    <h3 class="hub-group-title">Reference</h3>
    <div class="learn-hub learn-hub-3">
      <a class="hub-card" href="#/learn/grammar">
        <span class="hub-icon" aria-hidden="true">📖</span>
        <h3>Grammar</h3>
        <p>${grammarCount} patterns across 32 categories. Form, examples, common mistakes.</p>
        <span class="hub-cta">Browse →</span>
      </a>
      <a class="hub-card" href="#/learn/vocab">
        <span class="hub-icon" aria-hidden="true">📚</span>
        <h3>Vocabulary</h3>
        <p>~${vocabCount} words grouped by topic - people, time, places, verbs, adjectives.</p>
        <span class="hub-cta">Browse →</span>
      </a>
      <a class="hub-card" href="#/kanji">
        <span class="hub-icon" aria-hidden="true">✍️</span>
        <h3>Kanji</h3>
        <p>${kanjiCount} kanji with on / kun-yomi, meanings, stroke-order slots. Tap any glyph.</p>
        <span class="hub-cta">Browse →</span>
      </a>
    </div>

    <h3 class="hub-group-title">Practice</h3>
    <div class="learn-hub learn-hub-2">
      <a class="hub-card" href="#/reading">
        <span class="hub-icon" aria-hidden="true">📰</span>
        <h3>Dokkai (Reading)</h3>
        <p>30 graded passages with comprehension questions. Audio for every passage.</p>
        <span class="hub-cta">Practice →</span>
      </a>
      <a class="hub-card" href="#/listening">
        <span class="hub-icon" aria-hidden="true">🎧</span>
        <h3>Listening</h3>
        <p>12 items across the three JLPT N5 listening formats. Audio for every script.</p>
        <span class="hub-cta">Practice →</span>
      </a>
    </div>
  `;
}

// Render-time mapping: 40 fine-grained vocab sections -> 6 super-sections.
// Same pattern as GRAMMAR_SUPERCATS in renderTOC. Data file unchanged.
const VOCAB_SUPERSECTS = [
  ['People and Body', [
    '1. People - Pronouns and Self', '2. People - Family',
    '3. People - Roles', '4. Body Parts',
  ]],
  ['Demonstratives, Questions, Numbers, Time', [
    '5. Demonstratives', '6. Question Words', '7. Numbers',
    '8. Native Counters (つ-series)', '9. Counters (Common)',
    '10. Time - General', '11. Time - Days, Weeks, Months, Years',
    '12. Time - Frequency / Sequence',
  ]],
  ['Places and Things', [
    '13. Locations and Places (general)', '14. Nature and Weather',
    '15. Animals', '16. Food and Drink - General', '17. Food - Items',
    '18. Drinks', '19. Tableware and Cooking', '20. Colors',
    '21. Clothing and Accessories', '22. Money and Shopping',
    '23. Transport', '24. School and Study',
    '25. Languages and Countries', '26. House and Furniture',
  ]],
  ['Verbs', [
    '27. Verbs - Group 1 (う-verbs)', '28. Verbs - Group 2 (る-verbs)',
    '29. Verbs - Irregular and する-verbs', '30. Verbs - Existence and Possession',
  ]],
  ['Adjectives and Function Words', [
    '31. い-Adjectives', '32. な-Adjectives', '33. Adverbs',
    '34. Conjunctions', '35. Particles (functional vocabulary)',
    '36. Greetings and Set Phrases',
  ]],
  ['Misc', [
    '37. Common Nouns - Miscellaneous', '38. Sounds and Voice',
    '39. Function / Filler Expressions', '40. Misc Useful Items',
  ]],
];

function vocabSuperSectionFor(section) {
  for (const [supersect, members] of VOCAB_SUPERSECTS) {
    if (members.includes(section)) return supersect;
  }
  return 'Misc';  // safe fallback
}

function renderVocabList(container, data) {
  const entries = data.entries || [];
  const bySuper = new Map();
  for (const [s] of VOCAB_SUPERSECTS) bySuper.set(s, []);
  for (const e of entries) {
    const sup = vocabSuperSectionFor(e.section || 'Other');
    bySuper.get(sup).push(e);
  }
  const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const sections = [...bySuper.entries()].map(([sup, items]) => {
    // Sort items within a supersection by their original section number then by form
    items.sort((a, b) => {
      const na = parseInt(a.section || '', 10);
      const nb = parseInt(b.section || '', 10);
      if (!isNaN(na) && !isNaN(nb) && na !== nb) return na - nb;
      return (a.form || '').localeCompare(b.form || '');
    });
    const cards = items.map(v => `
      <a class="vocab-card" href="#/learn/vocab/${encodeURIComponent(v.form || '')}">
        <span class="vocab-form" lang="ja">${esc(v.form || '')}</span>
        ${v.reading ? `<span class="vocab-reading" lang="ja">${esc(v.reading)}</span>` : ''}
        <span class="vocab-gloss">${esc(v.gloss || '')}</span>
      </a>
    `).join('');
    return `
      <details class="vocab-section" id="vocab-${slugify(sup)}">
        <summary><strong>${esc(sup)}</strong> <span class="muted small">(${items.length})</span></summary>
        <div class="vocab-grid">${cards}</div>
      </details>
    `;
  }).join('');

  container.innerHTML = `
    <article class="vocab-toc">
      <a class="back-link" href="#/learn">← Back to Learn</a>
      <h2>Vocabulary</h2>
      <p class="page-lede">${entries.length} N5 words in ${VOCAB_SUPERSECTS.length} sections.</p>
      <div class="toc-controls">
        <button type="button" class="btn-secondary toc-expand-all">Expand all</button>
        <button type="button" class="btn-secondary toc-collapse-all">Collapse all</button>
      </div>
      ${sections}
    </article>
  `;
  wireExpandCollapseControls(container, 'details.vocab-section');
}

function renderVocabDetail(container, vocabData, grammarData, form) {
  const entries = vocabData.entries || [];
  const entry = entries.find(e => e.form === form);
  if (!entry) {
    container.innerHTML = `
      <article class="vocab-detail">
        <a class="back-link" href="#/learn/vocab">← Back to Vocabulary</a>
        <h2>Word not found</h2>
        <p>No vocab entry matches <strong lang="ja">${esc(form)}</strong>. The word may live under a different form.</p>
      </article>
    `;
    return;
  }
  // Pull example sentences from grammar.json. Each example carries a
  // `vocab_ids: [...]` field (populated by tools/link_grammar_examples_to_vocab.py)
  // listing exactly which vocab entries it demonstrates. We filter by ID
  // — not by substring on the form field — so homographs (e.g., かた "person"
  // vs かた "way of doing") never cross-contaminate. See JA-17 invariant.
  //
  // Backward-compat fallback: if an example has no vocab_ids field (older
  // data, or auto-tagger hasn't run), fall back to substring match. Future
  // CI run will catch and fix.
  const seen = new Set();
  const examples = [];
  for (const p of (grammarData.patterns || [])) {
    for (const ex of (p.examples || [])) {
      if (!ex.ja || ex.ja.includes('(see ')) continue;
      if (seen.has(ex.ja)) continue;
      let matches = false;
      if (Array.isArray(ex.vocab_ids)) {
        matches = ex.vocab_ids.includes(entry.id);
      } else {
        // Legacy substring fallback (kanji form OR kana reading)
        const needles = [form];
        if (entry.reading && entry.reading !== form) needles.push(entry.reading);
        matches = needles.some(n => ex.ja.includes(n));
      }
      if (matches) {
        seen.add(ex.ja);
        examples.push({ ja: ex.ja, en: ex.translation_en, source: p.pattern });
        if (examples.length >= 24) break;
      }
    }
    if (examples.length >= 24) break;
  }
  examples.sort((a, b) => (a.ja?.length || 0) - (b.ja?.length || 0));
  const top = examples.slice(0, 5);

  // prev / next within the same section for keyboard-style navigation.
  const sectionEntries = entries.filter(e => e.section === entry.section);
  const idx = sectionEntries.findIndex(e => e.form === entry.form);
  const prev = idx > 0 ? sectionEntries[idx - 1] : null;
  const next = idx >= 0 && idx < sectionEntries.length - 1 ? sectionEntries[idx + 1] : null;

  container.innerHTML = `
    <article class="vocab-detail">
      <a class="back-link" href="#/learn/vocab">← Back to Vocabulary</a>
      <header class="vocab-header">
        <div>
          <p class="muted small">${esc(entry.section || '')}</p>
          <h2 class="vocab-form-big" lang="ja">${esc(entry.form)}</h2>
          ${entry.reading ? `<p class="vocab-reading-big" lang="ja">${esc(entry.reading)}</p>` : ''}
          <p class="vocab-gloss-big">${esc(entry.gloss || '')}</p>
        </div>
      </header>

      <section>
        <h3 class="section-title">Meaning</h3>
        <p><strong>English:</strong> ${esc(entry.gloss || '-')}</p>
        ${entry.reading ? `<p><strong>Japanese reading:</strong> <span lang="ja">${esc(entry.reading)}</span></p>` : ''}
      </section>

      <section>
        <h3 class="section-title">Example sentences ${top.length ? `(${top.length})` : ''}</h3>
        ${top.length ? `
          <ol class="example-list">
            ${top.map(ex => `
              <li>
                <p lang="ja" class="example-ja">${renderJa(ex.ja)}</p>
                ${ex.en ? `<p class="translation">${esc(ex.en)}</p>` : ''}
                ${ex.source ? `<p class="muted small">From pattern: <span lang="ja">${esc(ex.source)}</span></p>` : ''}
              </li>
            `).join('')}
          </ol>
        ` : `
          <p class="muted">No example sentences in the corpus yet for this word. Try the search bar to find phrases that include it.</p>
        `}
      </section>

      <nav class="vocab-nav">
        ${prev ? `<a href="#/learn/vocab/${encodeURIComponent(prev.form)}">← <span lang="ja">${esc(prev.form)}</span></a>` : '<span></span>'}
        ${next ? `<a href="#/learn/vocab/${encodeURIComponent(next.form)}"><span lang="ja">${esc(next.form)}</span> →</a>` : '<span></span>'}
      </nav>
    </article>
  `;
}

// Render-time mapping: 32 fine-grained categories in data/grammar.json
// to 5 pedagogically-coherent super-categories.
//
// Revised 2026-05-01 to fix two issues from the prior mapping:
// (a) "Functional and Upper-N5" was a catchall that swept up 7 sub-
//     categories which are actually verb-modal patterns (Permission and
//     Obligation, Experience and Advice, Compound and Listed Actions,
//     Excess, Intention, Way of Doing, Prohibitive). Those duplicated
//     the "Verbs" bucket — moved them in.
// (b) The catchall name described its origin ("the leftovers from N5")
//     rather than its current contents. Renamed "Set Phrases and
//     Discourse" — what's now actually inside is set phrases and
//     idioms, nominalisation markers, polite/honorific vocabulary,
//     sentence-final particles, quotation, and explanatory んです.
//
// Every fine category is now explicitly mapped (no fallback needed).
const GRAMMAR_SUPERCATS = [
  ['Sentence Basics', [
    'Copula and Basic Sentence Structure',
    'Particles',
    'Demonstratives',
    'Question Words',
  ]],
  ['Verbs', [
    'Verbs - Tense and Politeness (ます-form)',
    'Verbs - Plain (Dictionary) Form and Negation',
    'Te-form and Related Patterns',
    'Existence and Possession',
    'Desiderative and Volitional',
    'Giving and Receiving (basic)',
    // Verb-modal patterns moved here from the old catchall bucket
    'Additional Upper N5 / Borderline Patterns - Permission and Obligation',
    'Additional Upper N5 / Borderline Patterns - Experience and Advice',
    'Additional Upper N5 / Borderline Patterns - Compound and Listed Actions',
    'Additional Upper N5 / Borderline Patterns - Excess',
    'Additional Upper N5 / Borderline Patterns - Intention',
    'Additional Upper N5 / Borderline Patterns - Way of Doing',
    'Additional Upper N5 / Borderline Patterns - Prohibitive (Casual)',
  ]],
  ['Adjectives and Comparison', [
    'Adjectives',
    'Comparison and Preference',
  ]],
  ['Time, Counters, Connectives', [
    'Counters and Quantity',
    'Time Expressions',
    'Conjunctions and Connectives',
    'Asking and Stating with から / ので (basic causation)',
    'Existence-of-Plans and Frequency',
  ]],
  ['Set Phrases and Discourse', [
    'Nominalization and Modification',
    'Common Set Patterns',
    'Functional Expressions (Non-Grammar, Common Usage)',
    'Other Core Patterns',
    'Honorific / Polite Vocabulary at N5 (functional)',
    'Additional Upper N5 / Borderline Patterns - Explanation and Emphasis',
    'Additional Upper N5 / Borderline Patterns - Quotation (Casual)',
    'Additional Upper N5 / Borderline Patterns - Sentence-Final Exclamation',
  ]],
];

// Per-pattern overrides for cases where the fine-grained `category` value
// doesn't match the pattern's true type. These are individual patterns
// that live inside a non-verb subcategory but are actually verb patterns
// (verb relative clauses, verb-stem constructions, ています/ました with
// time markers, etc.). Moved to "Verbs" to remove the cross-bucket
// duplication the user flagged 2026-05-01.
const PATTERN_SUPERCAT_OVERRIDES = {
  'n5-135': 'Verbs',  // Verb (plain) + Noun — relative clauses
  'n5-144': 'Verbs',  // Verb-stem + ながら — while doing
  'n5-153': 'Verbs',  // まだ + Verb-ていません — not yet
  'n5-154': 'Verbs',  // もう + Verb-ました — already
  'n5-162': 'Verbs',  // Verb-plain ましょう (see 〜ます)
  'n5-163': 'Verbs',  // Verb-た あとで (see 〜あと)
};

function superCategoryFor(pattern) {
  // Allow per-pattern override when the category-level rule misroutes.
  // Caller passes the full pattern object so we can read both `id` and
  // `category`; legacy callers passing just a string still work.
  if (typeof pattern === 'object' && pattern && pattern.id in PATTERN_SUPERCAT_OVERRIDES) {
    return PATTERN_SUPERCAT_OVERRIDES[pattern.id];
  }
  const category = (typeof pattern === 'string') ? pattern : (pattern?.category || '');
  for (const [supercat, members] of GRAMMAR_SUPERCATS) {
    if (members.includes(category)) return supercat;
  }
  // Should never fire on the current 32 categories (all explicitly
  // mapped). Fallback for any future category not in the explicit map.
  return 'Set Phrases and Discourse';
}

function renderTOC(container, data) {
  // Group by super-category instead of fine-grained category.
  const bySuperCat = new Map();
  for (const [supercat] of GRAMMAR_SUPERCATS) bySuperCat.set(supercat, []);
  for (const p of data.patterns) {
    // Pass full pattern so per-id overrides apply (verb-pattern leakers
    // that live inside non-verb subcategories — see PATTERN_SUPERCAT_OVERRIDES).
    const sc = superCategoryFor(p);
    bySuperCat.get(sc).push(p);
  }

  const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  let html = `
    <a class="back-link" href="#/learn">← Back to Learn</a>
    <h2>Grammar</h2>
    <p class="page-lede">${data.patterns.length} patterns in ${bySuperCat.size} sections.</p>
    <div class="toc-controls">
      <button type="button" class="btn-secondary toc-expand-all">Expand all</button>
      <button type="button" class="btn-secondary toc-collapse-all">Collapse all</button>
    </div>
  `;
  // Each super-category renders as a collapsible <details>. First paint:
  // 5 short heading rows (one per super-category). Click to expand a
  // section to see its cards.
  for (const [supercat, items] of bySuperCat) {
    items.sort((a, b) => (a.patternOrder ?? 0) - (b.patternOrder ?? 0));
    html += `<details class="toc-category" id="cat-${slugify(supercat)}">`;
    html += `<summary><h3>${esc(supercat)} <span class="cat-count muted small">(${items.length})</span></h3></summary>`;
    html += `<div class="grammar-grid">`;
    for (const p of items) {
      html += `
        <a class="grammar-card" href="#/learn/${encodeURIComponent(p.id)}">
          <span class="grammar-pattern" lang="ja">${esc(p.pattern)}</span>
          <span class="grammar-gloss">${esc(p.meaning_en)}</span>
        </a>
      `;
    }
    html += `</div></details>`;
  }
  if (data.patterns.length === 0) {
    html += `<div class="placeholder"><p>No patterns yet. Add entries to <code>data/grammar.json</code>.</p></div>`;
  } else if (data.patterns.length === 1) {
    html += `<div class="placeholder" style="margin-top:24px"><p>Scaffold currently has 1 example pattern. Add more to <code>data/grammar.json</code> as you author content.</p></div>`;
  }
  container.innerHTML = html;
  wireExpandCollapseControls(container, 'details.toc-category');
}

// Wire Expand-all / Collapse-all buttons to the matching details elements.
// Used by Grammar TOC, Vocab list, and Listening index.
function wireExpandCollapseControls(container, detailsSelector) {
  const expand = container.querySelector('.toc-expand-all');
  const collapse = container.querySelector('.toc-collapse-all');
  if (!expand || !collapse) return;
  expand.addEventListener('click', () => {
    container.querySelectorAll(detailsSelector).forEach(d => d.open = true);
  });
  collapse.addEventListener('click', () => {
    container.querySelectorAll(detailsSelector).forEach(d => d.open = false);
  });
}

function renderPatternDetail(container, p) {
  const conj = p.form_rules?.conjugations ?? [];
  const examples = p.examples ?? [];
  const mistakes = p.common_mistakes ?? [];
  const attaches = p.form_rules?.attaches_to ?? [];
  const entry = storage.getPatternEntry(p.id);
  const isKnown = !!entry?.isManuallyKnown;
  const isMastered = !!entry?.isMastered;
  const isWeak = !!entry?.isWeak && !isMastered;

  const conjRows = conj.map(c => `
    <tr><td>${esc(c.label || c.form)}</td><td>${renderJa(c.example)}</td></tr>
  `).join('');

  const exampleItems = examples.map((ex, i) => {
    const skipAudio = !ex.ja || ex.ja.includes('(see ');
    const audioPath = skipAudio ? null : `audio/grammar/${p.id}.${i}.mp3`;
    return `
    <li>
      <span class="form-tag">${esc(ex.form || '')}</span>
      ${renderJa(ex.ja, ex.furigana)}
      ${ex.translation_en ? `<span class="translation">${esc(ex.translation_en)}</span>` : ''}
      ${audioPath ? `<audio class="example-audio" controls preload="none" src="${esc(audioPath)}">Audio not available.</audio>` : ''}
    </li>
  `;
  }).join('');

  const mistakeItems = mistakes.map(m => `
    <li>
      <div><span class="wrong">${renderJa(m.wrong)}</span></div>
      <div><span class="right">${renderJa(m.right)}</span></div>
      <span class="why">${esc(m.why)}</span>
    </li>
  `).join('');

  const statusBadge = isMastered
    ? `<span class="status-badge mastered">★ Mastered</span>`
    : isWeak
      ? `<span class="status-badge weak">Needs practice</span>`
      : '';

  const html = `
    <article class="pattern-detail">
      <a class="back-link" href="#/learn/grammar">← Back to grammar list</a>
      <div class="pattern-header">
        <div>
          <h2 class="pattern-name">${esc(p.pattern)}</h2>
          <p class="meaning-en">${esc(p.meaning_en)}</p>
        </div>
        <label class="known-toggle" title="Manually mark as known. Cleared on the next miss in Test or Drill.">
          <input type="checkbox" id="mark-known" ${isKnown ? 'checked' : ''}>
          <span>Mark as known</span>
          ${statusBadge}
        </label>
      </div>

      <section>
        <h3 class="section-title">Form &amp; Connection</h3>
        ${attaches.length ? `<p>Attaches to: <strong>${attaches.map(esc).join(', ')}</strong></p>` : ''}
        ${conjRows ? `<table class="conjugation-table"><tbody>${conjRows}</tbody></table>` : ''}
      </section>

      <section>
        <h3 class="section-title">Explanation</h3>
        <p>${esc(p.explanation_en)}</p>
      </section>

      <section>
        <h3 class="section-title">Examples (${examples.length})</h3>
        <ul class="example-list">${exampleItems}</ul>
      </section>

      ${mistakes.length ? `
        <section>
          <h3 class="section-title">Common Mistakes / Contrasts</h3>
          <ul class="mistakes-list">${mistakeItems}</ul>
        </section>
      ` : ''}

      <section>
        <h3 class="section-title">意味（やさしい にほんご）</h3>
        <p>${renderJa(p.meaning_ja)}</p>
      </section>

      ${p.notes ? `<section><h3 class="section-title">Notes</h3><p>${esc(p.notes)}</p></section>` : ''}
    </article>
  `;
  container.innerHTML = html;

  document.getElementById('mark-known')?.addEventListener('change', (ev) => {
    storage.setManuallyKnown(p.id, ev.target.checked);
    // Re-render so the badge updates without a full route() call.
    renderPatternDetail(container, p);
  });
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}
