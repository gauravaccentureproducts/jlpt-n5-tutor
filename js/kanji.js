// Single-kanji detail page (Brief 2 §14.1).
// Routed via #/kanji/<glyph> - shows glyph, on/kun-yomi, meanings,
// stroke-order SVG slot, and a "back to list" link.
// The stroke-order SVG path lives in data/kanji.json under stroke_order_svg;
// the SVG file itself ships separately (KanjiVG drop-in target).

let bank = null;

async function loadBank() {
  if (bank) return bank;
  const res = await fetch('data/kanji.json');
  bank = await res.json();
  return bank;
}

export async function renderKanji(container, params) {
  await loadBank();
  const entries = bank.entries || [];
  const glyph = params ? decodeURIComponent(params) : '';
  if (!glyph) return renderIndex(container, entries);
  const entry = entries.find(e => e.glyph === glyph);
  if (!entry) {
    container.innerHTML = `
      <div class="placeholder">
        <h2>Kanji not found</h2>
        <p>No N5 entry for <strong lang="ja">${esc(glyph)}</strong>.</p>
        <p><a href="#/kanji" class="btn-primary" style="text-decoration:none">Back to kanji list</a></p>
      </div>
    `;
    return;
  }
  return renderDetail(container, entry, entries);
}

function renderIndex(container, entries) {
  const cards = entries.map(e => `
    <a class="kanji-card" href="#/kanji/${encodeURIComponent(e.glyph)}">
      <span class="kanji-card-glyph" lang="ja">${esc(e.glyph)}</span>
      ${e.meanings?.length ? `<span class="kanji-card-meaning">${esc(e.meanings.slice(0,2).join(', '))}</span>` : ''}
      <span class="kanji-card-readings" lang="ja">
        ${e.kun?.[0] ? esc(e.kun[0]) : ''}${e.on?.[0] ? `<br>${esc(e.on[0])}` : ''}
      </span>
    </a>
  `).join('');
  container.innerHTML = `
    <a class="back-link" href="#/learn">← Back to Learn</a>
    <h2>Kanji</h2>
    <p>${entries.length} kanji at JLPT N5 level. Tap any card for readings, meanings, and stroke order.</p>
    <div class="kanji-card-grid">${cards}</div>
  `;
}

function renderDetail(container, entry, entries) {
  const idx = entries.findIndex(e => e.glyph === entry.glyph);
  const prev = idx > 0 ? entries[idx - 1] : null;
  const next = idx < entries.length - 1 ? entries[idx + 1] : null;
  container.innerHTML = `
    <article class="kanji-detail">
      <div class="srs-progress">
        <a href="#/kanji">← All kanji</a>
        <span class="muted small">${idx + 1} of ${entries.length}</span>
      </div>
      <div class="kanji-glyph-row">
        <div class="kanji-glyph-big" lang="ja">${esc(entry.glyph)}</div>
        <div class="kanji-readings">
          ${entry.on?.length ? `<p><strong>On:</strong> <span lang="ja">${entry.on.map(esc).join(' / ')}</span></p>` : ''}
          ${entry.kun?.length ? `<p><strong>Kun:</strong> <span lang="ja">${entry.kun.map(esc).join(' / ')}</span></p>` : ''}
          ${entry.meanings?.length ? `<p><strong>Meaning:</strong> ${entry.meanings.map(esc).join(', ')}</p>` : ''}
        </div>
      </div>
      ${entry.stroke_order_svg ? `
        <section class="kanji-stroke">
          <h3>Stroke order</h3>
          <object class="stroke-svg" data="${esc(entry.stroke_order_svg)}" type="image/svg+xml" aria-label="Stroke order for ${esc(entry.glyph)}">
            <p class="muted small">Stroke-order SVG not yet shipped. Drop-in target: <code>${esc(entry.stroke_order_svg)}</code> (KanjiVG-compatible).</p>
          </object>
        </section>
      ` : ''}
      <nav class="kanji-nav">
        ${prev ? `<a href="#/kanji/${encodeURIComponent(prev.glyph)}">← <span lang="ja">${esc(prev.glyph)}</span></a>` : '<span></span>'}
        ${next ? `<a href="#/kanji/${encodeURIComponent(next.glyph)}"><span lang="ja">${esc(next.glyph)}</span> →</a>` : '<span></span>'}
      </nav>
    </article>
  `;
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}
