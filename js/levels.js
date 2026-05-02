// Level-picker page (Level 1) and placeholder pages for N4-N1.
//
// Added 2026-05-02 per user direction. The corpus + study tools today
// only cover N5; we lifted the structural hierarchy by one level so
// that the URL `/` shows a 5-card picker (N5 / N4 / N3 / N2 / N1) and
// the existing N5 syllabus dashboard moves to be reached *via* clicking
// the N5 card on the picker. URLs that previously worked still work —
// `#/home` continues to render the N5 syllabus dashboard verbatim.
//
// N4-N1 are not yet built. Their cards are clickable but route to a
// "Content not yet available" placeholder. We deliberately don't
// disable the buttons because clickable + clear-message is more
// honest than greyed-out (which suggests "we forgot to build this").

const LEVELS = [
  {
    id: 'n5',
    code: 'N5',
    label: 'Beginner',
    desc: 'Basic Japanese — 177 grammar patterns, 1003 vocab, 106 kanji, 60 dokkai/listening drills.',
    href: '#/home',          // Routes into the existing N5 dashboard
    available: true,
  },
  {
    id: 'n4',
    code: 'N4',
    label: 'Elementary',
    desc: 'Builds on N5 with everyday topics, basic written passages, and lower-frequency kanji.',
    href: '#/n4',
    available: false,
  },
  {
    id: 'n3',
    code: 'N3',
    label: 'Intermediate',
    desc: 'Bridge between elementary and upper-intermediate Japanese — natural-speed listening.',
    href: '#/n3',
    available: false,
  },
  {
    id: 'n2',
    code: 'N2',
    label: 'Upper-intermediate',
    desc: 'Newspapers, business contexts, and abstract grammar; expected for university entry.',
    href: '#/n2',
    available: false,
  },
  {
    id: 'n1',
    code: 'N1',
    label: 'Advanced',
    desc: 'Logical reasoning, formal/literary registers, all major grammar at native speed.',
    href: '#/n1',
    available: false,
  },
];

export function renderLevels(container) {
  container.innerHTML = `
    <section class="levels-page">
      <header class="levels-header">
        <h1 class="levels-title">JLPT</h1>
        <p class="levels-subtitle">Choose a level to start. Each level has its own grammar, vocabulary, kanji, reading, and listening study material.</p>
      </header>
      <div class="levels-grid">
        ${LEVELS.map(lvl => {
          // Available levels render as anchors (clickable). Unavailable
          // levels render as <div> with aria-disabled — visible, in
          // their own grid cell, but not focusable + not clickable.
          // Keeps the layout intact without inviting a click that
          // would route to a "nothing here" placeholder.
          if (lvl.available) {
            return `
              <a class="level-card is-available" href="${lvl.href}" data-level="${lvl.id}">
                <span class="level-card-code">${lvl.code}</span>
                <h2 class="level-card-label">${lvl.label}</h2>
                <p class="level-card-desc">${lvl.desc}</p>
                <span class="level-card-arrow" aria-hidden="true">→</span>
              </a>
            `;
          }
          return `
            <div class="level-card is-disabled" data-level="${lvl.id}"
                 aria-disabled="true"
                 title="Content not yet available">
              <span class="level-card-code">${lvl.code}</span>
              <h2 class="level-card-label">${lvl.label}</h2>
              <p class="level-card-desc">${lvl.desc}</p>
            </div>
          `;
        }).join('')}
      </div>
      <p class="levels-foot">
        N5 is currently the only level with content. N4 → N1 will fill in over time.
      </p>
    </section>
  `;
}

// Single placeholder renderer used for #/n4, #/n3, #/n2, #/n1.
// Differentiates by reading the route name out of location.hash.
export function renderLevelPlaceholder(container) {
  const m = (location.hash || '').match(/^#\/(n[1-4])(?:$|\/)/i);
  const code = (m ? m[1] : 'N?').toUpperCase();
  const lvl = LEVELS.find(l => l.id === code.toLowerCase()) || {
    code, label: 'Level', desc: '',
  };
  container.innerHTML = `
    <section class="level-placeholder">
      <p class="level-placeholder-back">
        <a href="#/levels">← All JLPT levels</a>
      </p>
      <h1 class="level-placeholder-title">JLPT ${esc(code)}</h1>
      <p class="level-placeholder-label">${esc(lvl.label)}</p>
      <div class="level-placeholder-card">
        <p class="level-placeholder-headline">Content not yet available.</p>
        <p>${esc(lvl.desc)}</p>
        <p>This site currently ships the JLPT N5 corpus only. ${esc(code)} content is on the roadmap.</p>
      </div>
      <p class="level-placeholder-foot">
        <a href="#/home" class="btn-action btn-action-secondary">Open JLPT N5 instead</a>
      </p>
    </section>
  `;
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}
