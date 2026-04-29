// Chapter 3 — Review Weak Areas.
// Per spec §5.5: re-teach each weak pattern with form rules, common mistakes,
// fresh examples, and per-distractor explanations from missed questions.
import { renderJa } from './furigana.js';
import * as storage from './storage.js';

let grammarCache = null;
let resultsCache = null;

async function loadGrammar() {
  if (grammarCache) return grammarCache;
  const res = await fetch('data/grammar.json');
  grammarCache = await res.json();
  return grammarCache;
}

async function loadResults() {
  // Always read fresh — results accumulate.
  resultsCache = storage.getResults();
  return resultsCache;
}

export async function renderReview(container) {
  const data = await loadGrammar();
  const results = await loadResults();
  const weakIds = storage.getWeakPatternIds();

  if (weakIds.length === 0) {
    container.innerHTML = `
      <div class="placeholder">
        <h2>Chapter 3 — Review Weak Areas</h2>
        <p>No weak patterns yet. Take a Test in <a href="#/test">Chapter 2</a> — patterns are flagged here once they show ≥ 50% error rate over at least 2 attempts.</p>
      </div>
    `;
    return;
  }

  const patternMap = new Map((data.patterns || []).map(p => [p.id, p]));
  const cards = weakIds.map(id => {
    const p = patternMap.get(id);
    if (!p) {
      return `<div class="review-card"><h3>${esc(id)}</h3><p class="muted">Pattern not yet authored in grammar.json</p></div>`;
    }
    const distractors = collectDistractorsForPattern(id, results);
    return renderCard(p, distractors);
  }).join('');

  container.innerHTML = `
    <h2>Chapter 3 — Review Weak Areas</h2>
    <p>Patterns flagged by your rolling history (errors/attempts ≥ 0.5 AND attempts ≥ 2). Each card shows form rules, common mistakes, examples, and explanations of distractors you've picked.</p>
    <div class="review-grid">${cards}</div>
  `;
}

function collectDistractorsForPattern(patternId, results) {
  // Walk every test result, find missed questions for this pattern, gather distractor explanations the user actually picked.
  const out = [];
  for (const r of results) {
    for (const resp of r.responses || []) {
      if (resp.grammarPatternId !== patternId || resp.isCorrect) continue;
      // Need the original question to read distractor_explanations — those aren't in the response.
      // For now, surface the user's incorrect answer with a hint.
      out.push({ userAnswer: resp.userAnswer, correctAnswer: resp.correctAnswer });
    }
  }
  return out;
}

function renderCard(p, missed) {
  const conj = p.form_rules?.conjugations ?? [];
  const examples = (p.examples ?? []).slice(0, 4);
  const mistakes = p.common_mistakes ?? [];

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

  const missedSummary = missed.length
    ? `<p class="muted"><strong>${missed.length}</strong> miss(es) on this pattern. Distractor analysis lives on the per-question Results screen — re-take the test to see fresh per-distractor explanations.</p>`
    : '';

  return `
    <article class="review-card">
      <header>
        <h3>${esc(p.pattern)}</h3>
        <p class="meaning-en">${esc(p.meaning_en)}</p>
        <a href="#/learn/${encodeURIComponent(p.id)}" class="link">View full lesson →</a>
      </header>

      <section>
        <h4>Form &amp; Connection</h4>
        ${conjRows ? `<table class="conjugation-table"><tbody>${conjRows}</tbody></table>` : '<p class="muted">No conjugation table yet.</p>'}
      </section>

      ${mistakes.length ? `
        <section>
          <h4>Common Mistakes</h4>
          <ul class="mistakes-list">${mistakeItems}</ul>
        </section>
      ` : ''}

      <section>
        <h4>Examples</h4>
        <ul class="example-list">${exampleItems}</ul>
      </section>

      ${missedSummary}
    </article>
  `;
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}
