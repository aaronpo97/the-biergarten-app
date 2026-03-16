import { expect, test } from '@playwright/test';

const themes = [
   'biergarten-lager',
   'biergarten-stout',
   'biergarten-cassis',
   'biergarten-weizen',
] as const;

test.describe('storybook component coverage', () => {
   for (const theme of themes) {
      test(`SubmitButton idle renders in ${theme}`, async ({ page }) => {
         await page.goto(`/iframe.html?id=forms-submitbutton--idle&globals=theme:${theme}`);
         await expect(page.getByRole('button', { name: /save changes/i })).toBeVisible();
         await expect(page.locator(`[data-theme=\"${theme}\"]`)).toBeVisible();
      });

      test(`FormField error renders in ${theme}`, async ({ page }) => {
         await page.goto(`/iframe.html?id=forms-formfield--with-error&globals=theme:${theme}`);
         await expect(page.getByLabel('Email address')).toBeVisible();
         await expect(page.getByText(/valid email address/i)).toBeVisible();
         await expect(page.locator(`[data-theme=\"${theme}\"]`)).toBeVisible();
      });

      test(`Navbar guest renders in ${theme}`, async ({ page }) => {
         await page.goto(`/iframe.html?id=navigation-navbar--guest&globals=theme:${theme}`);
         await expect(page.getByRole('link', { name: /the biergarten app/i })).toBeVisible();
         await expect(page.getByRole('link', { name: /^login$/i })).toBeVisible();
         await expect(page.locator(`[data-theme=\"${theme}\"]`)).toBeVisible();
      });
   }

   test('Navbar authenticated state renders', async ({ page }) => {
      await page.goto(
         `/iframe.html?id=navigation-navbar--authenticated&globals=theme:biergarten-stout`,
      );
      await expect(page.getByRole('button', { name: /hans/i })).toBeVisible();
   });

   test('Theme gallery shows all themes', async ({ page }) => {
      await page.goto(
         `/iframe.html?id=themes-biergarten-themes--gallery&globals=theme:biergarten-lager`,
      );
      await expect(page.getByRole('heading', { name: 'Biergarten Lager' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Biergarten Stout' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Biergarten Cassis' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Biergarten Weizen' })).toBeVisible();
   });
});
