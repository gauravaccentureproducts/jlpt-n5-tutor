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

function renderVocabList(container, data) {
  const entries = data.entries || [];
  const bySection = new Map();
  for (const e of entries) {
    const key = e.section || 'Other';
    if (!bySection.has(key)) bySection.set(key, []);
    bySection.get(key).push(e);
  }
  const sectionKeys = [...bySection.keys()].sort((a, b) => {
    const na = parseInt(a, 10); const nb = parseInt(b, 10);
    if (!isNaN(na) && !isNaN(nb)) return na - nb;
    return a.localeCompare(b);
  });
  const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  // Strip the leading "NN. " from chip labels so the chip rail scans clean.
  const chipLabel = (k) => k.replace(/^\d+\.\s*/, '');
  const jumpItems = sectionKeys.map(k => `
    <button type="button" class="cat-chip" data-jump="vocab-${slugify(k)}">
      <span class="cat-chip-label">${esc(chipLabel(k))}</span>
      <span class="cat-chip-count">${bySection.get(k).length}</span>
    </button>
  `).join('');
  const sections = sectionKeys.map((key, idx) => {
    const items = bySection.get(key);
    const cards = items.map(v => `
      <a class="vocab-card" href="#/learn/vocab/${encodeURIComponent(v.form || '')}">
        <span class="vocab-form" lang="ja">${esc(v.form || '')}</span>
        ${v.reading ? `<span class="vocab-reading" lang="ja">${esc(v.reading)}</span>` : ''}
        <span class="vocab-gloss">${esc(v.gloss || '')}</span>
      </a>
    `).join('');
    // First section open as a preview; the other 39 collapsed to avoid a wall of cards.
    const openAttr = idx === 0 ? 'open' : '';
    return `
      <details class="vocab-section" id="vocab-${slugify(key)}" ${openAttr}>
        <summary><strong>${esc(key)}</strong> <span class="muted small">(${items.length})</span></summary>
        <div class="vocab-grid">${cards}</div>
      </details>
    `;
  }).join('');
  container.innerHTML = `
    <article class="vocab-toc">
      <a class="back-link" href="#/learn">← Back to Learn</a>
      <h2>Vocabulary</h2>
      <p class="page-lede">${entries.length} N5 words across ${sectionKeys.length} sections. Jump to a topic or scroll.</p>
      <nav class="cat-jump" aria-label="Vocabulary section jump menu">
        ${jumpItems}
      </nav>
      ${sections}
    </article>
  `;

  // Click chip -> open the target section + smooth-scroll to it.
  container.querySelectorAll('[data-jump]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = container.querySelector(`#${btn.dataset.jump}`);
      if (!target) return;
      if (target.tagName === 'DETAILS') target.open = true;
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
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
  // Pull example sentences from grammar.json that contain this word.
  // Match on either the kanji form OR the kana reading - many examples
  // are written in kana even when the dictionary form is kanji.
  const needles = [form];
  if (entry.reading && entry.reading !== form) needles.push(entry.reading);
  const seen = new Set();
  const examples = [];
  for (const p of (grammarData.patterns || [])) {
    for (const ex of (p.examples || [])) {
      if (!ex.ja || ex.ja.includes('(see ')) continue;
      if (seen.has(ex.ja)) continue;
      if (needles.some(n => ex.ja.includes(n))) {
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

function renderTOC(container, data) {
  const byCategory = new Map();
  for (const p of data.patterns) {
    const key = p.category || 'Other';
    if (!byCategory.has(key)) byCategory.set(key, { order: p.categoryOrder ?? 99, items: [] });
    byCategory.get(key).items.push(p);
  }
  const sorted = [...byCategory.entries()].sort((a, b) => a[1].order - b[1].order);

  const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  let html = `
    <a class="back-link" href="#/learn">← Back to Learn</a>
    <h2>Grammar</h2>
    <p class="page-lede">${data.patterns.length} patterns in ${sorted.length} categories.</p>
  `;
  for (const [cat, { items }] of sorted) {
    items.sort((a, b) => (a.patternOrder ?? 0) - (b.patternOrder ?? 0));
    html += `<section class="toc-category" id="cat-${slugify(cat)}"><h3>${esc(cat)} <span class="cat-count muted small">(${items.length})</span></h3><div class="grammar-grid">`;
    for (const p of items) {
      html += `
        <a class="grammar-card" href="#/learn/${encodeURIComponent(p.id)}">
          <span class="grammar-pattern" lang="ja">${esc(p.pattern)}</span>
          <span class="grammar-gloss">${esc(p.meaning_en)}</span>
        </a>
      `;
    }
    html += `</div></section>`;
  }
  if (data.patterns.length === 0) {
    html += `<div class="placeholder"><p>No patterns yet. Add entries to <code>data/grammar.json</code>.</p></div>`;
  } else if (data.patterns.length === 1) {
    html += `<div class="placeholder" style="margin-top:24px"><p>Scaffold currently has 1 example pattern. Add more to <code>data/grammar.json</code> as you author content.</p></div>`;
  }
  container.innerHTML = html;
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
