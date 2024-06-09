import { test, expect } from '@chromatic-com/playwright'

test.beforeEach(async ({ page }) => {
  await page.goto('/card')
})

test.describe('BusinessCardPage', () => {
  test('can load page', async ({ page }) => {
    await expect(page.locator('text="Developer"')).toBeVisible()
    await expect(page.locator('text="VJ"')).toBeVisible()
    await expect(page.locator('text="Digital Wizard"')).toBeVisible()
  })
})
