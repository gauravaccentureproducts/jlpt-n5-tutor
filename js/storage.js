// LocalStorage adapter — namespaced per spec FR-P4.
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
  furiganaOnN5Kanji: false,
  lastTestLength: 20,
  diagnosticCompleted: false,
  lastDiagnosticDate: null,
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
  srsBox: null,         // null | '1d' | '3d' | '7d' | '14d' | 'graduated'
  nextDue: null,        // ISO date string when this pattern next appears in Drill
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
    // Correct answer in DRILL only — advance the box.
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
