import { test, expect } from '@chromatic-com/playwright'

test.describe('BusinessCardPage', () => {
  test('can load page', async ({ page }) => {
    await page.goto('/card')
    await expect(page.locator('text="Developer"')).toBeVisible()
    await expect(page.locator('text="Digital Wizard"')).toBeVisible()
  })

  test('can load page for vizshun', async ({ page }) => {
    await page.goto('/card?vizshun')
    await expect(page.locator('text="Visual Artist"')).toBeVisible()
    await expect(page.locator('text="DJ"')).toBeVisible()
  })
})
