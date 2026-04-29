// Chapter 1 — Learn. TOC + 7-block pattern detail.
import { renderJa } from './furigana.js';
import * as storage from './storage.js';

let grammarCache = null;

async function loadGrammar() {
  if (grammarCache) return grammarCache;
  const res = await fetch('data/grammar.json');
  if (!res.ok) throw new Error(`Failed to load grammar.json: ${res.status}`);
  grammarCache = await res.json();
  return grammarCache;
}

export async function renderLearn(container, params) {
  const data = await loadGrammar();
  if (params) {
    const id = decodeURIComponent(params);
    const pattern = data.patterns.find(p => p.id === id);
    if (pattern) return renderPatternDetail(container, pattern);
  }
  renderTOC(container, data);
}

function renderTOC(container, data) {
  const byCategory = new Map();
  for (const p of data.patterns) {
    const key = p.category || 'Other';
    if (!byCategory.has(key)) byCategory.set(key, { order: p.categoryOrder ?? 99, items: [] });
    byCategory.get(key).items.push(p);
  }
  const sorted = [...byCategory.entries()].sort((a, b) => a[1].order - b[1].order);

  const settings = storage.getSettings();
  const showDiagBanner = !settings.diagnosticCompleted;

  let html = `
    <h2>Chapter 1 — Learn</h2>
    <p>Pick a grammar pattern to study. Patterns are grouped into ${sorted.length} ${sorted.length === 1 ? 'category' : 'categories'} per the N5 catalog.</p>
    ${showDiagBanner ? `
      <div class="diag-cta">
        <div>
          <strong>New here?</strong> Take a quick 10-question diagnostic to map your strengths.
          It seeds the Drill queue without affecting your test history.
        </div>
        <a href="#/diagnostic" class="btn-primary" style="text-decoration:none">Take Diagnostic →</a>
      </div>
    ` : ''}
    <div class="learn-tools">
      <strong>Topic deep-dives:</strong>
      <a href="#/waga">は vs が →</a>
      <a href="#/kosoado">こそあど grid →</a>
      <a href="#/verbclass">Verb groups →</a>
      <a href="#/teform">て-form gym →</a>
    </div>
  `;
  for (const [cat, { items }] of sorted) {
    items.sort((a, b) => (a.patternOrder ?? 0) - (b.patternOrder ?? 0));
    html += `<div class="toc-category"><h3>${esc(cat)}</h3><ul>`;
    for (const p of items) {
      html += `
        <li>
          <a href="#/learn/${encodeURIComponent(p.id)}">${esc(p.pattern)}</a>
          <span class="gloss">— ${esc(p.meaning_en)}</span>
        </li>
      `;
    }
    html += `</ul></div>`;
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

  const exampleItems = examples.map(ex => `
    <li>
      <span class="form-tag">${esc(ex.form || '')}</span>
      ${renderJa(ex.ja, ex.furigana)}
      ${ex.translation_en ? `<span class="translation">${esc(ex.translation_en)}</span>` : ''}
    </li>
  `).join('');

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
      <a class="back-link" href="#/learn">← Back to TOC</a>
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
