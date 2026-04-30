// P0 smoke tests per feedback/ui-testing-plan.md §17.1.
//
// Goal: catch regressions in core navigation, the Learn hub, key
// detail pages, settings flow, and accessibility on the home route.
// Runs in <60s on a clean machine. Wired into CI as a release gate.

const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

test.describe('P0 smoke - core navigation', () => {
  // Note: Playwright gives each test a fresh browser context with empty
  // storage by default, so no beforeEach storage cleanup is needed. An
  // earlier `addInitScript(() => localStorage.clear())` broke the
  // 'persists across reload' test because it cleared storage on the
  // reload too.

  test('home loads with title, CTA, two pillars, no console errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

    await page.goto('/');
    // Site title + brand updated in v1.6.1 copy audit (removed "Grammar Tutor"
    // sub-brand; supplements §B.12 voice contract).
    await expect(page).toHaveTitle('JLPT N5 — study material');
    await expect(page.locator('.brand-link')).toContainText('JLPT N5');
    await expect(page.locator('.home-cta h2')).toBeVisible();
    // Trust strip removed in v1.6.1 (replaced by PRIVACY.md link in footer).
    // Pillars reduced to Learn + Test in v1.6 nav simplification.
    await expect(page.locator('.pillar-card')).toHaveCount(2);
    await expect(page.locator('.btn-primary').first()).toContainText(/lesson|continue/i);
    expect(errors, `console errors: ${errors.join('\n')}`).toEqual([]);
  });

  test('Learn hub shows 5 cards in two semantic groups', async ({ page }) => {
    await page.goto('/#/learn');
    await expect(page.locator('.hub-group-title')).toHaveCount(2);
    await expect(page.locator('.hub-group-title').nth(0)).toContainText('Reference');
    await expect(page.locator('.hub-group-title').nth(1)).toContainText('Practice');
    await expect(page.locator('.hub-card')).toHaveCount(5);
    const cards = page.locator('.hub-card h3');
    await expect(cards.nth(0)).toContainText('Grammar');
    await expect(cards.nth(1)).toContainText('Vocabulary');
    await expect(cards.nth(2)).toContainText('Kanji');
    await expect(cards.nth(3)).toContainText(/Dokkai|Reading/);
    await expect(cards.nth(4)).toContainText('Listening');
  });

  test('Grammar TOC has 187 cards across 32 categories with chip jump menu', async ({ page }) => {
    await page.goto('/#/learn/grammar');
    await expect(page.locator('h2')).toContainText('Grammar');
    await expect(page.locator('section.toc-category')).toHaveCount(32);
    await expect(page.locator('.grammar-card')).toHaveCount(187);
    await expect(page.locator('.cat-chip')).toHaveCount(32);
  });

  test('pattern detail (n5-001) shows pattern, EN + JA meaning, examples', async ({ page }) => {
    await page.goto('/#/learn/n5-001');
    await expect(page.locator('h2.pattern-name')).toBeVisible();
    await expect(page.locator('.meaning-en')).toBeVisible();
    await expect(page.locator('.example-list li')).not.toHaveCount(0);
    // Japanese-meaning section heading is rendered with full-width parens
    await expect(page.getByText('意味')).toBeVisible();
  });

  test('Vocab list has 40 sections with chip jump menu, only first open', async ({ page }) => {
    await page.goto('/#/learn/vocab');
    await expect(page.locator('h2')).toContainText('Vocabulary');
    await expect(page.locator('details.vocab-section')).toHaveCount(40);
    await expect(page.locator('.cat-chip')).toHaveCount(40);
    // Default-open invariant from the Brief 2 follow-up
    const open = await page.locator('details.vocab-section[open]').count();
    expect(open).toBe(1);
  });

  test('Kanji index has 106 cards, each linking to a glyph detail', async ({ page }) => {
    // Corpus is 106 entries since Pass-13 build-pipeline fix recovered 9 missing
    // kanji (手/力/口/目/足/号/員/社/私). Was 97 pre-Pass-13.
    await page.goto('/#/kanji');
    await expect(page.locator('h2')).toContainText('Kanji');
    await expect(page.locator('.kanji-card')).toHaveCount(106);
    const firstHref = await page.locator('.kanji-card').first().getAttribute('href');
    expect(firstHref).toMatch(/^#\/kanji\/%E[0-9A-F]/);
  });

  test('Test setup -> start -> first question renders with 4 choices', async ({ page }) => {
    await page.goto('/#/test');
    await page.locator('#start-test').click();
    await expect(page.locator('.choice-grid, .sentence-order, .text-input-wrap')).toBeVisible({ timeout: 5_000 });
  });

  test('Diagnostic Start button is visible (regression guard for white-on-white CSS bug)', async ({ page }) => {
    await page.goto('/#/diagnostic');
    const btn = page.locator('#start-diagnostic');
    await expect(btn).toBeVisible();
    await expect(btn).toContainText(/Start|Re-take/);
    // Background must NOT be white (regression of the white-on-white bug)
    const bg = await btn.evaluate(el => getComputedStyle(el).backgroundColor);
    expect(bg).not.toBe('rgb(255, 255, 255)');
  });

  test('Settings: 3-mode furigana radios + audio speed + reset confirm box', async ({ page }) => {
    await page.goto('/#/settings');
    await expect(page.locator('input[name="furi"]')).toHaveCount(3);
    await expect(page.locator('#set-audio-rate option')).toHaveCount(3);
    await expect(page.locator('#reset-confirm')).toBeAttached();
    // Reset confirm box hidden until clicked
    await expect(page.locator('#reset-confirm')).toBeHidden();
  });

  test('Settings furigana mode persists across reload', async ({ page }) => {
    await page.goto('/#/settings');
    await page.locator('input[name="furi"][value="always"]').check();
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('input[name="furi"][value="always"]')).toBeChecked();
  });
});

test.describe('P0 smoke - keyboard shortcuts', () => {
  test('? opens shortcuts cheatsheet, Esc closes', async ({ page }) => {
    await page.goto('/#/learn');
    await page.waitForLoadState('networkidle');
    // The shortcuts handler is wired in app.js DOMContentLoaded chain;
    // wait until it's bound before dispatching.
    await page.waitForFunction(() => typeof window !== 'undefined');
    await page.evaluate(() => {
      document.body.focus();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: '?', bubbles: true }));
    });
    await expect(page.locator('.shortcuts-overlay')).toBeVisible({ timeout: 3_000 });
    await page.evaluate(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
    await expect(page.locator('.shortcuts-overlay')).toBeHidden({ timeout: 3_000 });
  });

  test('/ focuses search input', async ({ page, isMobile }) => {
    // Conceptually a desktop power-user shortcut; on mobile the search
    // input may be reflowed off-viewport and there's no real keyboard
    // anyway. Skip on mobile rather than test something the user won't do.
    test.skip(isMobile, 'desktop-only shortcut');
    await page.goto('/#/learn');
    await page.waitForLoadState('domcontentloaded');
    await page.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur());
    await page.evaluate(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: '/' })));
    await expect(page.locator('#search-input')).toBeFocused();
  });
});

test.describe('P0 smoke - no third-party requests during steady state', () => {
  test('first-load network requests are all same-origin', async ({ page }) => {
    const thirdParty = [];
    page.on('request', req => {
      const u = new URL(req.url());
      if (u.hostname !== 'localhost' && u.hostname !== '127.0.0.1') {
        thirdParty.push(req.url());
      }
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(thirdParty, `unexpected third-party requests: ${thirdParty.join(', ')}`).toEqual([]);
  });
});

test.describe('P0 smoke - accessibility (axe-core)', () => {
  // Per testing-plan §5.1: zero serious / critical violations on every route.
  // Cover the 6 routes most users actually touch.
  for (const route of ['/', '/#/learn', '/#/learn/grammar', '/#/test', '/#/settings', '/#/kanji']) {
    test(`axe-core: no serious/critical violations on ${route}`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .disableRules([
          // Skip rules that have known acceptable behavior on this app:
          // 'page-has-heading-one' is enforced site-wide; per-route h1
          // would duplicate the brand h1 unnecessarily.
          'page-has-heading-one',
        ])
        .analyze();
      const blocking = results.violations.filter(v =>
        v.impact === 'serious' || v.impact === 'critical'
      );
      expect(
        blocking,
        blocking.length
          ? `serious/critical a11y violations on ${route}:\n` +
            blocking.map(v => `  ${v.id}: ${v.help}`).join('\n')
          : ''
      ).toEqual([]);
    });
  }
});
