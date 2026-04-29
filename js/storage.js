// LocalStorage adapter - namespaced per spec FR-P4.
const NS = 'jlpt-n5-tutor:';

export function get(key, fallback = null) {
  const raw = localStorage.getItem(NS + key);
  if (raw === null) return fallback;
  try { return JSON.parse(raw); } catch { return fallback; }
}

export function set(key, value) {
  localStorage.setItem(NS + key, JSON.stringify(value));
}

export function remove(key) {
  localStorage.removeItem(NS + key);
}

export function reset() {
  Object.keys(localStorage)
    .filter(k => k.startsWith(NS))
    .forEach(k => localStorage.removeItem(k));
}

const DEFAULT_SETTINGS = {
  furiganaOnN5Kanji: false,         // legacy binary toggle (kept for migration)
  furiganaMode: 'hide-known',       // 'always' | 'hide-known' | 'never' (Brief 2 §4.1)
  lastTestLength: 20,
  diagnosticCompleted: false,
  lastDiagnosticDate: null,
  audioPlaybackRate: 1.0,           // Brief 2 §5: 0.75 / 1.0 / 1.25
  reduceMotion: null,               // null = follow prefers-reduced-motion; true/false override
};

export function getSettings() {
  return { ...DEFAULT_SETTINGS, ...(get('settings') || {}) };
}

export function setSettings(patch) {
  const next = { ...getSettings(), ...patch };
  set('settings', next);
  return next;
}

export function getHistory() {
  return get('history', {});
}

export function setHistory(h) {
  set('history', h);
}

export function getResults() {
  return get('results', []);
}

export function initStorage() {
  if (get('settings') === null) set('settings', DEFAULT_SETTINGS);
  if (get('history') === null) set('history', {});
  if (get('results') === null) set('results', []);
  if (get('knownKanji') === null) set('knownKanji', {});  // Brief 2 §4.2
}

// Per-kanji "I know this" flags (Brief 2 §4.2).
export function getKnownKanji() { return get('knownKanji', {}); }
export function isKanjiKnown(glyph) { return !!getKnownKanji()[glyph]; }
export function setKanjiKnown(glyph, known) {
  const m = getKnownKanji();
  if (known) m[glyph] = true; else delete m[glyph];
  set('knownKanji', m);
}

// ---- Pattern history per spec §7.4 + §6.6 ----

const FRESH_PATTERN_ENTRY = {
  attempts: 0,
  correct: 0,
  incorrect: 0,
  errorRate: 0,
  consecutiveCorrect: 0,
  isWeak: false,
  isMastered: false,
  isManuallyKnown: false,
  lastSeen: null,
  // Legacy Leitner-light state (kept for migration / existing UI badges)
  srsBox: null,         // null | '1d' | '3d' | '7d' | '14d' | 'graduated'
  nextDue: null,        // ISO date string when this pattern next appears in Drill
  // SM-2 state (Brief §2.11)
  easeFactor: 2.5,      // EF - adjusts up/down with each grade
  interval: 0,          // days until next review
  reps: 0,              // consecutive correct streak (resets on lapse)
  lapses: 0,            // total times the user has forgotten this item
};

// SRS box graduation order. Per spec §5.8.
const NEXT_BOX = { '1d': '3d', '3d': '7d', '7d': '14d', '14d': 'graduated' };
const BOX_DAYS = { '1d': 1, '3d': 3, '7d': 7, '14d': 14 };

function isoNowPlusDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function updatePatternEntry(entry, isCorrect, nowIso, source = 'test') {
  const e = { ...FRESH_PATTERN_ENTRY, ...entry };
  e.attempts += 1;
  if (isCorrect) {
    e.correct += 1;
    e.consecutiveCorrect += 1;
  } else {
    e.incorrect += 1;
    e.consecutiveCorrect = 0;
  }
  e.errorRate = e.incorrect / e.attempts;
  // FR-W1: weak if errorRate >= 0.5 AND attempts >= 2
  e.isWeak = e.errorRate >= 0.5 && e.attempts >= 2;
  // FR-W3 / FR-W4: mastered after 4 consecutive correct OR manual override
  e.isMastered = e.isManuallyKnown || e.consecutiveCorrect >= 4;
  e.lastSeen = nowIso;

  // SRS state transitions per §5.8
  if (!isCorrect) {
    // Any wrong answer (test or drill) puts/keeps the pattern in the 1d box,
    // immediately drillable so the learner can recover the pattern while it's
    // fresh. Only on the NEXT correct in drill does it space out.
    e.srsBox = '1d';
    e.nextDue = nowIso;
    // FR-W4: a miss clears the manual-mastery override.
    e.isManuallyKnown = false;
    // Recompute isMastered now that isManuallyKnown is false.
    e.isMastered = e.consecutiveCorrect >= 4;
  } else if (source === 'drill' && e.srsBox && e.srsBox !== 'graduated') {
    // Correct answer in DRILL only - advance the box.
    if (e.consecutiveCorrect >= 4 || e.srsBox === '14d') {
      e.srsBox = 'graduated';
      e.nextDue = null;
    } else {
      e.srsBox = NEXT_BOX[e.srsBox] || e.srsBox;
      e.nextDue = e.srsBox === 'graduated' ? null : isoNowPlusDays(BOX_DAYS[e.srsBox]);
    }
  }
  // Note: correct answer in TEST does NOT advance the SRS box. Test is for
  // assessment; only Drill earns graduation (FR-S3 spirit).

  return e;
}

/**
 * Record a test's responses into rolling history.
 * @param {Array<{questionId, grammarPatternId, isCorrect}>} responses
 */
export function recordTestResponses(responses) {
  const history = getHistory();
  const now = new Date().toISOString();
  for (const r of responses) {
    if (!r.grammarPatternId) continue;
    history[r.grammarPatternId] = updatePatternEntry(
      history[r.grammarPatternId] || FRESH_PATTERN_ENTRY,
      r.isCorrect,
      now,
      'test',
    );
  }
  setHistory(history);
}

/**
 * Record a single drill response into rolling history.
 * Drill responses ADVANCE the SRS box on correct, RESET to 1d on wrong.
 */
export function recordDrillResponse(grammarPatternId, isCorrect) {
  if (!grammarPatternId) return;
  const history = getHistory();
  const now = new Date().toISOString();
  history[grammarPatternId] = updatePatternEntry(
    history[grammarPatternId] || FRESH_PATTERN_ENTRY,
    isCorrect,
    now,
    'drill',
  );
  setHistory(history);
}

/**
 * Return pattern IDs that are due for Drill now (nextDue <= now and not graduated).
 */
export function getDuePatternIds() {
  const history = getHistory();
  const now = new Date().toISOString();
  return Object.entries(history)
    .filter(([, v]) => v.srsBox && v.srsBox !== 'graduated' && v.nextDue && v.nextDue <= now)
    .map(([id]) => id);
}

export function getDueCount() {
  return getDuePatternIds().length;
}

/**
 * Append a test result summary to the results log.
 */
export function recordTestResult(result) {
  const all = getResults();
  all.push(result);
  setResults(all);
}

export function setResults(arr) {
  set('results', arr);
}

export function getWeakPatternIds() {
  const h = getHistory();
  return Object.entries(h)
    .filter(([, v]) => v.isWeak && !v.isMastered)
    .map(([id]) => id);
}

export function getMasteredPatternIds() {
  const h = getHistory();
  return Object.entries(h).filter(([, v]) => v.isMastered).map(([id]) => id);
}

export function getSeenPatternIds() {
  const h = getHistory();
  return Object.entries(h).filter(([, v]) => v.attempts > 0).map(([id]) => id);
}

export function getPatternEntry(id) {
  const h = getHistory();
  return h[id] || null;
}

// =============== SM-2 SRS algorithm (Brief §2.11) ===============
//
// Standard SM-2 with N5-friendly defaults. Per-item state: easeFactor,
// interval (days), reps, lapses, due (ISO). 4-button grading mapped to
// SM-2 quality scores:
//   Again → q=1   (forgotten, lapse)
//   Hard  → q=3   (correct but difficult)
//   Good  → q=4   (correct, normal)
//   Easy  → q=5   (correct, easy - bigger interval bump)
//
// On q < 3: reps reset, interval back to 1 day, lapses++.
// On q ≥ 3: reps++; interval = 1, 6, or prev*EF depending on rep count.
// EF adjusts each grade: EF' = max(1.3, EF + 0.1 - (5-q)*(0.08 + (5-q)*0.02)).

const GRADE_AGAIN = 1;
const GRADE_HARD = 3;
const GRADE_GOOD = 4;
const GRADE_EASY = 5;

export const SM2 = { GRADE_AGAIN, GRADE_HARD, GRADE_GOOD, GRADE_EASY };

function applySm2(entry, grade, nowIso) {
  const e = { ...FRESH_PATTERN_ENTRY, ...entry };
  // Lapse
  if (grade < 3) {
    e.lapses = (e.lapses || 0) + 1;
    e.reps = 0;
    e.interval = 1;
  } else {
    e.reps = (e.reps || 0) + 1;
    if (e.reps === 1) e.interval = 1;
    else if (e.reps === 2) e.interval = 6;
    else e.interval = Math.round((e.interval || 1) * (e.easeFactor || 2.5));
  }
  // Adjust ease factor
  const newEf = (e.easeFactor || 2.5) + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  e.easeFactor = Math.max(1.3, newEf);

  // Schedule next due
  const next = new Date();
  next.setDate(next.getDate() + e.interval);
  e.nextDue = next.toISOString();
  e.lastSeen = nowIso;
  return e;
}

/**
 * Record an SM-2 graded response. Call from drill UIs that present 4-button
 * (Again/Hard/Good/Easy) grading.
 */
export function recordSrsResponse(grammarPatternId, grade) {
  if (!grammarPatternId) return;
  const history = getHistory();
  const now = new Date().toISOString();
  const existing = history[grammarPatternId] || FRESH_PATTERN_ENTRY;
  const updated = applySm2(existing, grade, now);
  // Also keep the rolling-history fields in sync for the existing weak-detection code.
  updated.attempts = (updated.attempts || 0) + 1;
  if (grade < 3) {
    updated.incorrect = (updated.incorrect || 0) + 1;
    updated.consecutiveCorrect = 0;
  } else {
    updated.correct = (updated.correct || 0) + 1;
    updated.consecutiveCorrect = (updated.consecutiveCorrect || 0) + 1;
  }
  updated.errorRate = updated.incorrect / Math.max(1, updated.attempts);
  updated.isWeak = updated.errorRate >= 0.5 && updated.attempts >= 2;
  updated.isMastered = updated.isManuallyKnown || updated.consecutiveCorrect >= 4;
  history[grammarPatternId] = updated;
  setHistory(history);
}

export function getSrsState(grammarPatternId) {
  const e = getHistory()[grammarPatternId];
  if (!e) return null;
  return {
    easeFactor: e.easeFactor ?? 2.5,
    interval: e.interval ?? 0,
    reps: e.reps ?? 0,
    lapses: e.lapses ?? 0,
    nextDue: e.nextDue,
  };
}

/**
 * Toggle the manual-mastery override for a pattern (FR-W4).
 * When true, isMastered becomes true regardless of attempt count. The flag
 * is cleared automatically on the next miss.
 */
export function setManuallyKnown(grammarPatternId, known) {
  const history = getHistory();
  const e = { ...FRESH_PATTERN_ENTRY, ...(history[grammarPatternId] || {}) };
  e.isManuallyKnown = !!known;
  e.isMastered = e.isManuallyKnown || e.consecutiveCorrect >= 4;
  history[grammarPatternId] = e;
  setHistory(history);
}

/**
 * Export all progress (settings + history + results) as a JSON-serializable
 * object suitable for download as `progress.json`.
 */
export function exportProgress() {
  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    appVersion: 'jlpt-n5-tutor',
    settings: getSettings(),
    history: getHistory(),
    results: getResults(),
  };
}

/**
 * Import a progress payload, replacing all existing state. Validates the
 * schema and refuses to import if it doesn't match.
 * @returns {{ok: boolean, message: string}}
 */
export function importProgress(payload) {
  if (!payload || typeof payload !== 'object') {
    return { ok: false, message: 'Invalid payload (not an object).' };
  }
  if (payload.schemaVersion !== 1) {
    return { ok: false, message: `Unsupported schema version: ${payload.schemaVersion}` };
  }
  if (!payload.settings || !payload.history || !Array.isArray(payload.results)) {
    return { ok: false, message: 'Missing required fields (settings/history/results).' };
  }
  set('settings', payload.settings);
  set('history', payload.history);
  set('results', payload.results);
  return { ok: true, message: `Imported. ${Object.keys(payload.history).length} pattern entries, ${payload.results.length} test results.` };
}
