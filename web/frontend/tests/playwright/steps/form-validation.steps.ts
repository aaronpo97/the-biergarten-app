import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

Given('I open the {string} story', async ({ page }, storyId: string) => {
   await page.goto(`/iframe.html?id=${storyId}`);
});

When('I fill in the {string} field with {string}', async ({ page }, label: string, value: string) => {
   await page.getByLabel(label, { exact: true }).fill(value);
});

When('I click the {string} button', async ({ page }, name: string) => {
   await page.getByRole('button', { name, exact: true }).click();
});

Then('I should see the error {string}', async ({ page }, message: string) => {
   await expect(page.getByText(message)).toBeVisible();
});

Then('the submitted result should contain {string}', async ({ page }, text: string) => {
   await expect(page.getByTestId('submit-result')).toContainText(text);
});

Then('the form should submit successfully', async ({ page }) => {
   await expect(page.getByTestId('submit-result')).toBeVisible();
});
