// Settings panel - per spec §3.6 of the developer brief.
// On-device only. Reads/writes via storage adapter.
import * as storage from './storage.js';
import { setLocale, currentLocale, supportedLocales } from './i18n.js';

const LOCALE_NAMES = {
  en: 'English',
  vi: 'Tiếng Việt',
  id: 'Bahasa Indonesia',
  ne: 'नेपाली',
  zh: '中文',
};

export async function renderSettings(container) {
  const s = storage.getSettings();

  container.innerHTML = `
    <h2>Settings</h2>
    <p class="muted">All settings live on this device. Nothing leaves your browser.</p>

    <section class="settings-section">
      <h3>Display</h3>
      <label class="settings-row">
        <span>UI language</span>
        <select id="set-locale">
          ${supportedLocales.map(lc => `<option value="${lc}" ${currentLocale()===lc?'selected':''}>${LOCALE_NAMES[lc] || lc}</option>`).join('')}
        </select>
      </label>
      <label class="settings-row">
        <span>Furigana on N5 kanji</span>
        <select id="set-furigana">
          <option value="off" ${!s.furiganaOnN5Kanji ? 'selected' : ''}>Off (default for late-N5 learner)</option>
          <option value="on" ${s.furiganaOnN5Kanji ? 'selected' : ''}>On (always show readings)</option>
        </select>
      </label>
      <label class="settings-row">
        <span>Theme</span>
        <select id="set-theme">
          <option value="system" ${(s.theme||'system')==='system'?'selected':''}>System</option>
          <option value="light"  ${s.theme==='light'?'selected':''}>Light</option>
          <option value="dark"   ${s.theme==='dark'?'selected':''}>Dark</option>
        </select>
      </label>
      <label class="settings-row">
        <span>Font size</span>
        <select id="set-font">
          <option value="s"  ${s.fontSize==='s'?'selected':''}>S</option>
          <option value="m"  ${(s.fontSize||'m')==='m'?'selected':''}>M (default)</option>
          <option value="l"  ${s.fontSize==='l'?'selected':''}>L</option>
          <option value="xl" ${s.fontSize==='xl'?'selected':''}>XL</option>
        </select>
      </label>
    </section>

    <section class="settings-section">
      <h3>Practice</h3>
      <label class="settings-row">
        <span>Default test length</span>
        <select id="set-test-length">
          ${[20,30,50].map(n => `<option value="${n}" ${s.lastTestLength===n?'selected':''}>${n} questions</option>`).join('')}
        </select>
      </label>
      <label class="settings-row">
        <span>Daily new-card limit</span>
        <input type="number" id="set-daily-new" min="1" max="50" value="${s.dailyNewLimit||10}">
      </label>
      <label class="settings-row">
        <span>Daily review cap</span>
        <input type="number" id="set-daily-review" min="5" max="200" value="${s.dailyReviewCap||50}">
      </label>
    </section>

    <section class="settings-section">
      <h3>Data</h3>
      <p class="muted small">Use export to back up your progress (no cloud sync). Import re-applies a saved file.</p>
      <div class="settings-actions">
        <button id="set-export">Export progress</button>
        <button id="set-import-trigger">Import progress…</button>
        <input type="file" id="set-import-file" accept="application/json,.json" hidden>
      </div>
      <p id="set-import-msg" class="muted small" role="status" aria-live="polite"></p>
    </section>

    <section class="settings-section">
      <h3>Reset</h3>
      <button id="set-reset" class="btn-danger">Reset all progress</button>
      <p class="muted small">Clears history, results, weak patterns, and settings. Cannot be undone.</p>
    </section>
  `;

  // Wire change handlers
  document.getElementById('set-locale').addEventListener('change', async (e) => {
    await setLocale(e.target.value);
    location.reload();
  });
  document.getElementById('set-furigana').addEventListener('change', (e) => {
    storage.setSettings({ furiganaOnN5Kanji: e.target.value === 'on' });
    applyTheme();
  });
  document.getElementById('set-theme').addEventListener('change', (e) => {
    storage.setSettings({ theme: e.target.value });
    applyTheme();
  });
  document.getElementById('set-font').addEventListener('change', (e) => {
    storage.setSettings({ fontSize: e.target.value });
    applyFontSize();
  });
  document.getElementById('set-test-length').addEventListener('change', (e) => {
    storage.setSettings({ lastTestLength: parseInt(e.target.value, 10) });
  });
  document.getElementById('set-daily-new').addEventListener('change', (e) => {
    storage.setSettings({ dailyNewLimit: parseInt(e.target.value, 10) });
  });
  document.getElementById('set-daily-review').addEventListener('change', (e) => {
    storage.setSettings({ dailyReviewCap: parseInt(e.target.value, 10) });
  });

  document.getElementById('set-export').addEventListener('click', () => {
    const payload = storage.exportProgress();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jlpt-n5-progress-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  const fileInput = document.getElementById('set-import-file');
  document.getElementById('set-import-trigger').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    const msg = document.getElementById('set-import-msg');
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const result = storage.importProgress(data);
      msg.textContent = result.message;
      msg.style.color = result.ok ? 'var(--c-success)' : 'var(--c-error)';
      if (result.ok) setTimeout(() => location.reload(), 800);
    } catch (err) {
      msg.textContent = `Import failed: ${err.message}`;
      msg.style.color = 'var(--c-error)';
    }
  });

  document.getElementById('set-reset').addEventListener('click', () => {
    if (!confirm('Reset all progress? This clears every test result, the rolling history, and weak-pattern flags.')) return;
    if (!confirm('Are you sure? This cannot be undone.')) return;
    storage.reset();
    location.hash = '#/learn';
    location.reload();
  });
}

// Theme + font are global side-effects; expose so app.js can apply on boot.
export function applyTheme() {
  const s = storage.getSettings();
  const theme = s.theme || 'system';
  document.documentElement.setAttribute('data-theme', theme);
}
export function applyFontSize() {
  const s = storage.getSettings();
  document.documentElement.setAttribute('data-font', s.fontSize || 'm');
}
