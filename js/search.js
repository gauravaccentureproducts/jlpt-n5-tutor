// Cross-corpus search (Brief 2 §8).
// Searches grammar (id, pattern, meaning_en, explanation_en), vocab (form,
// reading, gloss, section), kanji (glyph, on, kun, meanings).
// Results group by type with a count per group. Click to deep-link.
// `/` keyboard shortcut focuses the input. Works offline once data loads.

let bank = null;
let panel = null;

async function loadBank() {
  if (bank) return bank;
  try {
    const [g, v, k] = await Promise.all([
      fetch('data/grammar.json').then(r => r.json()),
      fetch('data/vocab.json').then(r => r.json()).catch(() => ({ entries: [] })),
      fetch('data/kanji.json').then(r => r.json()).catch(() => ({ entries: [] })),
    ]);
    bank = {
      grammar: (g.patterns || []).map(p => ({
        id: p.id, label: p.pattern, gloss: p.meaning_en || '', haystack: ((p.id||'') + ' ' + (p.pattern||'') + ' ' + (p.meaning_en||'') + ' ' + (p.explanation_en||'')).toLowerCase(),
      })),
      vocab: (v.entries || []).slice(0, 1500).map(e => ({
        id: e.form, label: e.form, gloss: e.gloss || '', reading: e.reading || '',
        haystack: ((e.form||'') + ' ' + (e.reading||'') + ' ' + (e.gloss||'')).toLowerCase(),
      })),
      kanji: (k.entries || []).map(e => ({
        id: e.glyph, label: e.glyph, gloss: (e.meanings || []).join(', '),
        haystack: ((e.glyph||'') + ' ' + (e.on||[]).join(' ') + ' ' + (e.kun||[]).join(' ') + ' ' + (e.meanings||[]).join(' ')).toLowerCase(),
      })),
    };
  } catch {
    bank = { grammar: [], vocab: [], kanji: [] };
  }
  return bank;
}

function search(query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return { grammar: [], vocab: [], kanji: [] };
  const limit = 8;
  const matches = (arr) => arr.filter(x => x.haystack.includes(q)).slice(0, limit);
  return {
    grammar: matches(bank.grammar),
    vocab: matches(bank.vocab),
    kanji: matches(bank.kanji),
  };
}

function renderResults(results) {
  const total = results.grammar.length + results.vocab.length + results.kanji.length;
  if (total === 0) return `<p class="search-empty muted">No matches.</p>`;
  return `
    ${results.grammar.length ? renderGroup('Grammar', results.grammar, p => `#/learn/${encodeURIComponent(p.id)}`) : ''}
    ${results.kanji.length ? renderGroup('Kanji', results.kanji, p => `#/kanji/${encodeURIComponent(p.id)}`) : ''}
    ${results.vocab.length ? renderGroup('Vocab', results.vocab, p => `#/learn`) : ''}
  `;
}

function renderGroup(title, items, hrefFn) {
  return `
    <section class="search-group">
      <h4>${title} <span class="muted small">(${items.length})</span></h4>
      <ul>
        ${items.map(it => `
          <li><a href="${hrefFn(it)}" tabindex="0"><span lang="ja">${esc(it.label)}</span> ${it.gloss ? `<span class="muted small">- ${esc(it.gloss)}</span>` : ''}</a></li>
        `).join('')}
      </ul>
    </section>
  `;
}

function ensurePanel() {
  if (panel) return panel;
  panel = document.createElement('div');
  panel.className = 'search-panel';
  panel.hidden = true;
  panel.setAttribute('role', 'listbox');
  panel.setAttribute('aria-label', 'Search results');
  document.body.appendChild(panel);
  document.addEventListener('click', (ev) => {
    if (panel.hidden) return;
    if (panel.contains(ev.target)) return;
    if (ev.target.id === 'search-input') return;
    panel.hidden = true;
  });
  return panel;
}

function positionPanel(input) {
  const r = input.getBoundingClientRect();
  panel.style.top = `${r.bottom + 4 + window.scrollY}px`;
  panel.style.left = `${r.left + window.scrollX}px`;
  panel.style.width = `${Math.max(r.width, 320)}px`;
}

export async function initSearch() {
  const input = document.getElementById('search-input');
  if (!input) return;
  ensurePanel();
  // Lazy-load bank on first focus
  let loaded = false;
  const ensureLoaded = async () => { if (!loaded) { await loadBank(); loaded = true; } };
  input.addEventListener('focus', ensureLoaded);
  input.addEventListener('input', async () => {
    await ensureLoaded();
    const q = input.value;
    if (!q.trim()) { panel.hidden = true; return; }
    const results = search(q);
    panel.innerHTML = renderResults(results);
    positionPanel(input);
    panel.hidden = false;
  });
  input.addEventListener('blur', () => {
    // Defer hide so click on a result still works
    setTimeout(() => { if (!panel.matches(':hover')) panel.hidden = true; }, 150);
  });
  input.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') { input.value = ''; panel.hidden = true; input.blur(); }
  });
  // '/' keyboard shortcut to focus search (Brief 2 §8).
  document.addEventListener('keydown', (ev) => {
    const t = ev.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    if (ev.key === '/' && !ev.metaKey && !ev.ctrlKey && !ev.altKey) {
      ev.preventDefault();
      input.focus();
      input.select();
    }
  });
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}
