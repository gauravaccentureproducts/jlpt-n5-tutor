// Furigana toggle + ruby renderer.
// Per spec §4.2:
//   - DEFAULT: furigana OFF on N5-scope kanji (matches a late-N5 learner).
//   - ALWAYS ON for out-of-scope kanji (passed in via explicitFurigana).
//   - Per-session TOGGLE: when ON, N5 kanji also get a ruby annotation using
//     a representative reading from data/n5_kanji_readings.json.
// Limitation: readings are pragmatic single-pick (kun first, on fallback).
// Real Japanese reading is context-dependent; without a morphological analyzer
// (kuromoji, etc.), some readings will be wrong (e.g., 月 = つき alone vs ゲツ
// in 月よう日). Late-N5 learners can override mentally; future enhancement is
// to integrate a tokenizer.
import * as storage from './storage.js';

let n5KanjiSet = null;
let n5KanjiReadings = null;

async function loadData() {
  if (n5KanjiSet && n5KanjiReadings) return;
  try {
    const [wl, rd] = await Promise.all([
      fetch('data/n5_kanji_whitelist.json').then(r => r.json()),
      fetch('data/n5_kanji_readings.json').then(r => r.json()).catch(() => ({})),
    ]);
    n5KanjiSet = new Set(wl);
    n5KanjiReadings = rd;
  } catch (err) {
    console.warn('Could not load kanji whitelist / readings.', err);
    n5KanjiSet = new Set();
    n5KanjiReadings = {};
  }
}

export async function initFuriganaToggle(onChange) {
  await loadData();
  const toggle = document.getElementById('furigana-toggle');
  const settings = storage.getSettings();
  toggle.checked = !!settings.furiganaOnN5Kanji;
  toggle.addEventListener('change', () => {
    storage.setSettings({ furiganaOnN5Kanji: toggle.checked });
    if (typeof onChange === 'function') onChange();
  });
}

export function isFuriganaOnForN5() {
  return !!storage.getSettings().furiganaOnN5Kanji;
}

const KANJI_RE = /[一-鿿]/;

function isKanji(ch) {
  return KANJI_RE.test(ch);
}

/**
 * Render Japanese text with furigana annotations.
 *
 * Order of precedence (most specific wins):
 *   1. Explicit annotations passed in (out-of-scope words, custom readings).
 *   2. If toggle is ON: best-effort ruby for each N5-scope kanji using the
 *      primary reading from n5_kanji_readings.json.
 *   3. Otherwise: leave kanji as-is.
 *
 * @param {string} text - Japanese text.
 * @param {Array<{word: string, reading: string}>} explicitFurigana
 * @returns {string} HTML string.
 */
export function renderJa(text, explicitFurigana = []) {
  if (!text) return '';
  // First: handle explicit per-word annotations by replacing whole-word matches.
  let working = text;
  const placeholders = [];
  for (const { word, reading } of (explicitFurigana || [])) {
    if (!word || !reading) continue;
    while (working.includes(word)) {
      const token = `\x00FURI${placeholders.length}\x00`;
      placeholders.push({ word, reading });
      working = working.replace(word, token);
    }
  }

  // Second: walk the text and apply per-kanji ruby if toggle is ON.
  const toggleOn = isFuriganaOnForN5();
  const readings = n5KanjiReadings || {};
  const inScope = n5KanjiSet || new Set();

  let html = '';
  for (const ch of working) {
    if (ch.startsWith('\x00')) {
      // Will be substituted in third pass.
      html += ch;
      continue;
    }
    if (isKanji(ch)) {
      if (toggleOn && inScope.has(ch) && readings[ch]?.primary) {
        html += `<ruby>${escapeHtml(ch)}<rt>${escapeHtml(readings[ch].primary)}</rt></ruby>`;
      } else if (!inScope.has(ch)) {
        // Out-of-scope kanji without explicit furigana — at least flag it.
        // The author should provide explicitFurigana; this is a fallback.
        html += `<ruby>${escapeHtml(ch)}<rt>?</rt></ruby>`;
      } else {
        html += escapeHtml(ch);
      }
    } else {
      html += escapeHtml(ch);
    }
  }

  // Third: substitute the explicit-annotation placeholders.
  for (let i = 0; i < placeholders.length; i++) {
    const { word, reading } = placeholders[i];
    const ruby = `<ruby>${escapeHtml(word)}<rt>${escapeHtml(reading)}</rt></ruby>`;
    html = html.replace(`\x00FURI${i}\x00`, ruby);
  }

  // Wrap with lang="ja" so screen readers / fonts pick the right pronunciation
  // and glyph variant. Required for accessibility per WCAG and avoids
  // Chinese-glyph fallback on Windows systems without a Japanese language pack.
  return `<span lang="ja">${html}</span>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}
