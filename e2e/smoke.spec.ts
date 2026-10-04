import { expect, type Page, test } from '@playwright/test';
import { CAREER } from '../src/data/career';

const watchErrors = (page: Page): string[] => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return errors;
};

/** Opens the intro in French and chooses Career. */
const chooseCareer = async (page: Page) => {
  await page.goto('/?lang=fr');
  await page.locator('#path-career').click();
};

/** The stop where Dylan teaches: its card is the one reopened in the final view. */
const TEACHING = CAREER.findIndex(stop => stop.entries.some(entry => entry.role.en === 'Mentor and assessor'));

test('choosing Career leaves the intro for the drawing', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('/?lang=fr');
  await expect(page.locator('#intro h1')).toHaveText('Lifeline');
  await expect(page.locator('#path-life')).toBeDisabled();
  await page.locator('#path-career').click();
  await expect(page.locator('#intro')).toHaveClass(/gone/);
  expect(errors).toEqual([]);
});

test('Space pauses and resumes, even right after clicking Career', async ({ page }) => {
  const errors = watchErrors(page);
  await chooseCareer(page);
  await page.keyboard.press('Space');
  await expect(page.locator('#pause')).toHaveText('Reprendre');
  await page.keyboard.press('Space');
  await expect(page.locator('#pause')).toHaveText('Pause');
  expect(errors).toEqual([]);
});

test('the first stop opens a card for each of its jobs', async ({ page }) => {
  const errors = watchErrors(page);
  await chooseCareer(page);
  // The first card unfolds once its stop starts.
  await page.keyboard.press('ArrowRight');
  const first = page.locator('.card[data-stop="0"]');
  await expect(first).toHaveClass(/open/);
  await expect(first.locator('.tag')).toContainText('INTERVALLES');
  await expect(first.locator('.tag')).not.toContainText('RGIS');
  // The second job of the stop gets its own card beside the barcode, once the barcode starts.
  const side = page.locator('.card.side[data-side="0"]');
  await expect(side).toHaveClass(/open/, { timeout: 8000 });
  await expect(side).toContainText('RGIS');
  await expect(page.locator('#cap')).toContainText('Étudiant');
  expect(errors).toEqual([]);
});

test('stepping to the next stop folds the last card and opens the next', async ({ page }) => {
  await chooseCareer(page);
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  const accenture = page.locator('.card[data-stop="1"]');
  await expect(accenture).toHaveClass(/open/);
  await expect(accenture).toContainText('Développeur | Chef d’équipe');
  await expect(page.locator('.card[data-stop="0"]')).not.toHaveClass(/open/);
});

test('switching language rewrites the open card', async ({ page }) => {
  const errors = watchErrors(page);
  await chooseCareer(page);
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  const accenture = page.locator('.card[data-stop="1"]');
  await expect(accenture).toContainText('Développeur | Chef d’équipe');
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

test('the final view shows every stop, folded', async ({ page }) => {
  const errors = watchErrors(page);
  // Well past the end, which moves as the drawing grows.
  await page.goto('/?path=career&lang=en&t=400');
  await expect(page.locator('.card.shown')).toHaveCount(CAREER.length, { timeout: 8000 });
  await expect(page.locator('.card.open')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('in the final view, a tag reopens its card and the note folds it back', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('/?path=career&lang=en&t=400');
  const card = page.locator(`.card[data-stop="${TEACHING}"]`);
  await card.locator('.tag').click();
  await expect(card).toHaveClass(/open/);
  await expect(card).toContainText('Mentor and assessor');
  // Open, the note alone tells the stop; clicking it folds the card back into its tag.
  await expect(card.locator('.tag')).toHaveCSS('opacity', '0');
  await card.locator('.inner').click();
  await expect(card).not.toHaveClass(/open/);
  await expect(card.locator('.tag')).toBeVisible();
  expect(errors).toEqual([]);
});

test('the year and the controls stay in view while drawing', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('/?path=career&lang=en&t=40');
  await expect(page.locator('#year')).toHaveText(/^20\d\d$/);
  await page.waitForTimeout(2500);
  await expect(page.locator('#hint')).toBeVisible();
  expect(errors).toEqual([]);
});

test('pausing freezes the drawing, and playing moves it again', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('/?path=career&lang=en&t=40');
  await page.keyboard.press('Space');
  await expect(page.locator('#pause')).toHaveText('Play');
  const pixels = () => page.locator('#c').evaluate(canvas => (canvas as HTMLCanvasElement).toDataURL());
  // The camera finishes catching up with the pen, then nothing moves.
  let previous = '';
  await expect
    .poll(
      async () => {
        const current = await pixels();
        const still = current === previous;
        previous = current;
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
  const progress = () =>
    page.locator('#prog').evaluate(element => Number.parseFloat((element as HTMLElement).style.width));
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
  const progress = () =>
    page.locator('#prog').evaluate(element => Number.parseFloat((element as HTMLElement).style.width));
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
  for (let iteration = 0; iteration < 24; iteration++) {
    const [open, cardX, stopX] = await card.evaluate(element => {
      const hooks = (window as unknown as { lifeline: { cardAnchorOnScreen: (index: number) => [number, number] } })
        .lifeline;
      return [
        element.classList.contains('open'),
        element.getBoundingClientRect().x,
        hooks.cardAnchorOnScreen(0)[0],
      ] as const;
    });
    if (open) offsets.push(cardX - stopX);
    await page.waitForTimeout(250);
  }
  // Cards ease after their stop, so they trail it by a few pixels while the line moves.
  for (const offset of offsets) expect(Math.abs(offset - (offsets[0] ?? 0))).toBeLessThan(15);
  await expect(card).not.toHaveClass(/open/);
});
