import { expect, type Page, test } from '@playwright/test';

const watchErrors = (page: Page): string[] => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => {
    if (m.type() === 'error') errors.push(m.text());
  });
  return errors;
};

test('choose Career, step through stops, switch language', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('/?lang=fr');
  await expect(page.locator('#intro h1')).toHaveText('Lifeline');
  await expect(page.locator('#path-life')).toBeDisabled();
  await page.locator('#path-career').click();
  await expect(page.locator('#intro')).toHaveClass(/gone/);

  // The first card unfolds once its stop starts.
  await page.keyboard.press('ArrowRight');
  const first = page.locator('.card[data-stop="0"]');
  await expect(first).toHaveClass(/open/);
  await expect(first.locator('.tag')).toContainText('INTERVALLES');

  // Next stop: Accenture opens, the first folds back into its tag.
  await page.keyboard.press('ArrowRight');
  const accenture = page.locator('.card[data-stop="1"]');
  await expect(accenture).toHaveClass(/open/);
  await expect(accenture).toContainText('Développeur | Chef d’équipe');
  await expect(first).not.toHaveClass(/open/);

  await page.locator('#lang').click();
  await expect(accenture).toContainText('Developer | Team lead');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');

  expect(errors).toEqual([]);
});

test('the language choice is remembered', async ({ page }) => {
  await page.goto('/?path=career&t=40');
  const start = (await page.locator('html').getAttribute('lang')) ?? 'fr';
  await page.locator('#lang').click();
  await page.goto('/?path=career&t=40');
  await expect(page.locator('html')).not.toHaveAttribute('lang', start);
});

test('the final view shows every stop and reopens a card on click', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('/?path=career&lang=en&t=300');
  await expect(page.locator('.card.shown')).toHaveCount(21, { timeout: 8000 });
  await expect(page.locator('.card.open')).toHaveCount(0);
  await page.locator('.card[data-stop="18"] .tag').click();
  await expect(page.locator('.card[data-stop="18"]')).toHaveClass(/open/);
  await expect(page.locator('.card[data-stop="18"]')).toContainText('Mentor and assessor');
  expect(errors).toEqual([]);
});
