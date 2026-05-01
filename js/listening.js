// Listening module shell (Brief §3.1)
// Three JLPT N5 listening formats: 課題理解 / ポイント理解 / 発話表現.
// Audio assets ship via the build-time TTS pipeline (tools/build_audio.py).
// When MP3s are absent, the module degrades gracefully: shows the script
// text + plays nothing, with a clear "audio not yet generated" notice.
import { renderJa } from './furigana.js';

let bank = null;
let session = null;

const FORMATS = {
  task: '課題理解 (Task comprehension)',
  point: 'ポイント理解 (Point comprehension)',
  utterance: '発話表現 (Utterance expression)',
};

async function loadBank() {
  if (bank) return bank;
  try {
    const res = await fetch('data/listening.json');
    if (!res.ok) {
      bank = { items: [] };
      return bank;
    }
    bank = await res.json();
  } catch {
    bank = { items: [] };
  }
  return bank;
}

export async function renderListening(container) {
  await loadBank();
  if (session) return renderItem(container);
  return renderIndex(container);
}

function renderIndex(container) {
  const items = bank.items || [];
  if (items.length === 0) {
    container.innerHTML = `
      <h2>Listening practice</h2>
      <div class="placeholder">
        <p><strong>No listening items shipped yet.</strong></p>
        <p>The listening module is wired and will activate as soon as audio assets ship.</p>
        <p class="muted small">For developers: run <code>python tools/build_audio.py</code> to generate MP3 files for every reading passage and listening script. Audio files land in <code>audio/listening/*.mp3</code> and <code>audio/reading/*.mp3</code>; the service worker will cache them on first online visit.</p>
        <p class="muted small">Listening scripts and questions live in <code>data/listening.json</code> (created by the same build).</p>
      </div>
    `;
    return;
  }
  const byFormat = items.reduce((acc, x) => {
    (acc[x.format] = acc[x.format] || []).push(x);
    return acc;
  }, {});
  container.innerHTML = `
    <h2>Listening practice</h2>
    <p>JLPT N5 listening drills in three formats. Each item plays an audio clip; you pick the correct response.</p>
    ${Object.entries(byFormat).map(([fmt, list]) => `
      <details class="listening-section">
        <summary><h3>${esc(FORMATS[fmt] || fmt)} <span class="muted small">(${list.length})</span></h3></summary>
        <ul class="listening-list">
          ${list.map(it => `<li><button class="listening-pick" data-id="${esc(it.id)}">${esc(it.title_en || it.id)}</button></li>`).join('')}
        </ul>
      </details>
    `).join('')}
  `;
  container.querySelectorAll('[data-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = items.find(x => x.id === btn.dataset.id);
      session = { item, picked: null };
      renderItem(container);
    });
  });
}

function renderItem(container) {
  const it = session.item;
  const picked = session.picked;
  const feedback = picked != null;
  const correct = picked === it.correctAnswer;

  container.innerHTML = `
    <article class="listening-item">
      <div class="srs-progress">
        <span><a id="listening-back" href="#/listening">← Back to list</a></span>
      </div>
      <h2>${esc(it.title_en || it.id)}</h2>
      <p class="muted small">Format: ${esc(FORMATS[it.format] || it.format)}</p>
      <div class="listening-audio">
        ${it.audio ? `<audio controls preload="none" src="${esc(it.audio)}">Audio</audio>` : '<p class="muted small">No audio file linked yet.</p>'}
      </div>
      ${it.prompt_en ? `<p>${esc(it.prompt_en)}</p>` : ''}
      ${it.prompt_ja ? `<p>${renderJa(it.prompt_ja)}</p>` : ''}
      ${it.choices ? `
        <div class="choice-grid">
          ${it.choices.map(c => {
            let cls = 'choice-button';
            if (feedback) {
              if (c === it.correctAnswer) cls += ' correct-choice';
              else if (c === picked) cls += ' wrong-choice';
            } else if (picked === c) {
              cls += ' selected';
            }
            return `<button data-pick="${esc(c)}" class="${cls}" ${feedback ? 'disabled' : ''}>${renderJa(c)}</button>`;
          }).join('')}
        </div>
      ` : ''}
      ${feedback ? `
        <div class="drill-feedback ${correct ? 'correct' : 'incorrect'}">
          <div class="feedback-headline">${correct ? 'Correct' : 'Wrong'}</div>
          ${it.script_ja ? `<details><summary>Show script</summary><div>${renderJa(it.script_ja)}</div></details>` : ''}
          ${it.explanation_en ? `<p class="muted small">${esc(it.explanation_en)}</p>` : ''}
          <button id="listening-back-list" class="btn-primary">Back to list</button>
        </div>
      ` : ''}
    </article>
  `;
  container.querySelectorAll('[data-pick]').forEach(btn => {
    btn.addEventListener('click', () => {
      session.picked = btn.dataset.pick;
      renderItem(container);
    });
  });
  document.getElementById('listening-back')?.addEventListener('click', (e) => {
    e.preventDefault();
    session = null;
    renderIndex(container);
  });
  document.getElementById('listening-back-list')?.addEventListener('click', () => {
    session = null;
    renderIndex(container);
  });
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}
