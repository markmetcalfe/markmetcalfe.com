import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/minecraft')
})

test.describe('MinecraftPage', () => {
  test('can load page', async ({ page }) => {
    await expect(page.locator('text="Server IP:"')).toBeVisible()
    await expect(
      page.locator('text="minecraft.markmetcalfe.com"'),
    ).toBeVisible()
  })
})
