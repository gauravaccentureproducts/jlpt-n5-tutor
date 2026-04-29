// Reading passages module (Brief §3.2)
// Each session: pick a passage, show it, then run comprehension questions.
import { renderJa } from './furigana.js';

let bank = null;
let session = null;

async function loadBank() {
  if (bank) return bank;
  const res = await fetch('data/reading.json');
  bank = await res.json();
  return bank;
}

export async function renderReading(container) {
  await loadBank();
  if (session) return renderSession(container);
  return renderIndex(container);
}

function renderIndex(container) {
  const passages = bank.passages || [];
  const items = passages.map(p => `
    <li>
      <button class="reading-pick" data-id="${esc(p.id)}">
        <span class="reading-title"><strong>${esc(p.title_en)}</strong> <span class="muted small">(${esc(p.level)})</span></span>
        <span class="muted small">${esc(p.topic)}</span>
      </button>
    </li>
  `).join('');
  container.innerHTML = `
    <h2>Reading practice</h2>
    <p>Short JLPT-format passages with comprehension questions. ${passages.length} passages available, sorted by difficulty (easy → medium → info-search).</p>
    <ul class="reading-list">${items}</ul>
  `;
  container.querySelectorAll('[data-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = passages.find(x => x.id === btn.dataset.id);
      session = { passage: p, phase: 'read', answers: {}, idx: 0 };
      renderSession(container);
    });
  });
}

function renderSession(container) {
  const p = session.passage;
  if (session.phase === 'read') return renderRead(container, p);
  if (session.phase === 'questions') return renderQuestions(container, p);
  return renderResults(container, p);
}

function renderRead(container, p) {
  container.innerHTML = `
    <article class="reading-passage">
      <div class="srs-progress">
        <span><a href="#/reading" id="reading-back">← Back</a> · Read the passage, then start the questions.</span>
      </div>
      <h2>${esc(p.title_en)}</h2>
      <p class="muted small">Level: ${esc(p.level)} · Topic: ${esc(p.topic)}</p>
      <div class="passage-text">${renderJa(p.ja)}</div>
      <details class="reading-translation">
        <summary>Show English translation</summary>
        <p class="muted">${esc(p.translation_en)}</p>
      </details>
      ${p.audio ? `
        <div class="reading-audio">
          <p class="muted small">Audio (if available):</p>
          <audio controls preload="none" src="${esc(p.audio)}">Your browser does not support audio.</audio>
        </div>
      ` : ''}
      <button id="reading-start-q" class="btn-primary">Start questions (${p.questions.length})</button>
    </article>
  `;
  document.getElementById('reading-back').addEventListener('click', (e) => {
    e.preventDefault();
    session = null;
    location.hash = '#/reading';
  });
  document.getElementById('reading-start-q').addEventListener('click', () => {
    session.phase = 'questions';
    renderQuestions(container, p);
  });
}

function renderQuestions(container, p) {
  const total = p.questions.length;
  const idx = session.idx;
  const q = p.questions[idx];
  const picked = session.answers[q.id];
  const feedback = picked != null;
  const correct = picked === q.correctAnswer;

  container.innerHTML = `
    <article class="reading-passage">
      <div class="srs-progress">
        <span>${esc(p.title_en)} - Q ${idx + 1} of ${total}</span>
      </div>
      <details class="passage-recap">
        <summary>Show passage</summary>
        <div class="passage-text">${renderJa(p.ja)}</div>
      </details>
      <div class="question-card">
        <p class="question">${renderJa(q.prompt_ja)}</p>
        <div class="choice-grid">
          ${q.choices.map(c => {
            let cls = 'choice-button';
            if (feedback) {
              if (c === q.correctAnswer) cls += ' correct-choice';
              else if (c === picked) cls += ' wrong-choice';
            } else if (picked === c) {
              cls += ' selected';
            }
            return `<button data-pick="${esc(c)}" class="${cls}" ${feedback ? 'disabled' : ''}>${renderJa(c)}</button>`;
          }).join('')}
        </div>
        ${feedback ? `
          <div class="drill-feedback ${correct ? 'correct' : 'incorrect'}">
            <div class="feedback-headline">${correct ? '✓ Correct' : '✗ Not quite'}</div>
            ${q.explanation_en ? `<p class="muted small">${esc(q.explanation_en)}</p>` : ''}
            <button id="reading-next" class="btn-primary">${idx === total - 1 ? 'Finish' : 'Next question'}</button>
          </div>
        ` : ''}
      </div>
    </article>
  `;
  container.querySelectorAll('[data-pick]').forEach(btn => {
    btn.addEventListener('click', () => {
      session.answers[q.id] = btn.dataset.pick;
      renderQuestions(container, p);
    });
  });
  document.getElementById('reading-next')?.addEventListener('click', () => {
    if (idx === total - 1) {
      session.phase = 'results';
      renderResults(container, p);
    } else {
      session.idx += 1;
      renderQuestions(container, p);
    }
  });
}

function renderResults(container, p) {
  const total = p.questions.length;
  const score = p.questions.filter(q => session.answers[q.id] === q.correctAnswer).length;
  const pct = Math.round((score / total) * 100);
  container.innerHTML = `
    <div class="reading-results">
      <h2>${esc(p.title_en)} - Results</h2>
      <section class="srs-summary-stats">
        <div class="stat-card mastered"><div class="stat-num">${score}/${total}</div><div class="stat-label">Score</div></div>
        <div class="stat-card ${pct >= 70 ? 'mastered' : 'weak'}"><div class="stat-num">${pct}%</div><div class="stat-label">Accuracy</div></div>
      </section>
      <div class="test-nav">
        <button id="reading-back-list" class="btn-primary">Pick another passage</button>
      </div>
    </div>
  `;
  document.getElementById('reading-back-list').addEventListener('click', () => {
    session = null;
    renderIndex(container);
  });
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}
