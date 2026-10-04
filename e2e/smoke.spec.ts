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
  // Space pauses even right after clicking the path button.
  await page.keyboard.press('Space');
  await expect(page.locator('#pause')).toHaveText('Reprendre');
  await page.keyboard.press('Space');
  await expect(page.locator('#pause')).toHaveText('Pause');

  // The first card unfolds once its stop starts.
  await page.keyboard.press('ArrowRight');
  const first = page.locator('.card[data-stop="0"]');
  await expect(first).toHaveClass(/open/);
  await expect(first.locator('.tag')).toContainText('INTERVALLES');
  await expect(first.locator('.tag')).not.toContainText('RGIS');
  // The second job of the stop gets its own card beside the barcode, once the barcode starts.
  await expect(page.locator('.card.side[data-side="0"]')).toHaveClass(/open/, { timeout: 8000 });
  await expect(page.locator('.card.side[data-side="0"]')).toContainText('RGIS');
  await expect(page.locator('#cap')).toContainText('Étudiant');

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
  // Well past the end, which moves as the drawing grows.
  await page.goto('/?path=career&lang=en&t=400');
  await expect(page.locator('.card.shown')).toHaveCount(21, { timeout: 8000 });
  await expect(page.locator('.card.open')).toHaveCount(0);
  await page.locator('.card[data-stop="18"] .tag').click();
  await expect(page.locator('.card[data-stop="18"]')).toHaveClass(/open/);
  await expect(page.locator('.card[data-stop="18"]')).toContainText('Mentor and assessor');
  // Open, the note alone tells the stop; clicking it folds the card back into its tag.
  await expect(page.locator('.card[data-stop="18"] .tag')).toHaveCSS('opacity', '0');
  await page.locator('.card[data-stop="18"] .inner').click();
  await expect(page.locator('.card[data-stop="18"]')).not.toHaveClass(/open/);
  await expect(page.locator('.card[data-stop="18"] .tag')).toBeVisible();
  expect(errors).toEqual([]);
});

test('pausing freezes the drawing; the year and controls stay in view', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('/?path=career&lang=en&t=40');
  await expect(page.locator('#year')).toHaveText(/^20\d\d$/);
  await page.waitForTimeout(2500);
  await expect(page.locator('#hint')).toBeVisible();
  await page.keyboard.press('Space');
  await expect(page.locator('#pause')).toHaveText('Play');
  const pixels = () => page.locator('#c').evaluate(c => (c as HTMLCanvasElement).toDataURL());
  // The camera finishes catching up with the pen, then nothing moves.
  let last = '';
  await expect
    .poll(
      async () => {
        const now = await pixels();
        const still = now === last;
        last = now;
        return still;
      },
      { intervals: [300], timeout: 10000 },
    )
    .toBe(true);
  const before = await pixels();
  await page.waitForTimeout(1200);
  expect(await pixels()).toBe(before);
  await page.locator('#pause').click();
  await expect(page.locator('#pause')).toHaveText('Pause');
  await page.waitForTimeout(800);
  expect(await pixels()).not.toBe(before);
  expect(errors).toEqual([]);
});

test('holding Shift hurries the drawing', async ({ page }) => {
  await page.goto('/?path=career&lang=en&t=20');
  const progress = () => page.locator('#prog').evaluate(el => Number.parseFloat((el as HTMLElement).style.width));
  const advance = async () => {
    const from = await progress();
    await page.waitForTimeout(1500);
    return (await progress()) - from;
  };
  const calm = await advance();
  await page.keyboard.down('Shift');
  const hurried = await advance();
  await page.keyboard.up('Shift');
  expect(hurried).toBeGreaterThan(calm * 1.6);
});

test('scrolling rewinds and skips ahead, even while paused', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('/?path=career&lang=en&t=60');
  const progress = () => page.locator('#prog').evaluate(el => Number.parseFloat((el as HTMLElement).style.width));
  await page.keyboard.press('Space');
  const start = await progress();
  await page.mouse.move(600, 300);
  await page.mouse.wheel(0, -1500);
  await expect.poll(progress).toBeLessThan(start - 5);
  const rewound = await progress();
  await page.mouse.wheel(0, 3000);
  await expect.poll(progress).toBeGreaterThan(rewound + 15);
  // Still paused: time holds where the scroll left it.
  const after = await progress();
  await page.waitForTimeout(800);
  expect(await progress()).toBe(after);
  expect(errors).toEqual([]);
});

test('an open card stays in place on the line, then folds when its stop is drawn', async ({ page }) => {
  // INTERVALLES: from late in its stop, through the stretch of line leading to Accenture.
  await page.goto('/?path=career&lang=fr&t=10');
  const card = page.locator('.card[data-stop="0"]');
  await expect(card).toHaveClass(/open/);
  const offsets: number[] = [];
  for (let k = 0; k < 24; k++) {
    const [open, cardX, stopX] = await card.evaluate(el => {
      const at = (window as unknown as { lifeline: { cardAnchorOnScreen: (i: number) => [number, number] } }).lifeline;
      return [el.classList.contains('open'), el.getBoundingClientRect().x, at.cardAnchorOnScreen(0)[0]] as const;
    });
    if (open) offsets.push(cardX - stopX);
    await page.waitForTimeout(250);
  }
  // Cards ease after their stop, so they trail it by a few pixels while the line moves.
  for (const o of offsets) expect(Math.abs(o - (offsets[0] ?? 0))).toBeLessThan(15);
  await expect(card).not.toHaveClass(/open/);
});
