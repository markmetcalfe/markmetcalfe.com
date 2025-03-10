import { test, expect, takeSnapshot } from '@chromatic-com/playwright'

test.beforeEach(async ({ page }) => {
  await page.goto('/visuals')
})

test.describe('VisualsPage', () => {
  test('can load page', async ({ page }, testInfo) => {
    await expect(page.locator('text="3D Visuals"')).toBeVisible()
    await takeSnapshot(page, 'Visuals Page', testInfo)
  })

  test('can navigate back home', async ({ page }) => {
    const link = page.locator('[aria-label="Back"]')

    await Promise.all([page.waitForURL('/'), link.click()])

    await expect(page.locator('body')).toContainText('Mark Metcalfe')
  })

  test('can open geometry definitions dialog', async ({ page }, testInfo) => {
    const button = page.locator('text="Edit Shapes"')

    await button.click()

    await expect(page.locator('body')).toContainText('Save')

    await page.waitForTimeout(1000)
    await takeSnapshot(page, 'Visuals Page - Geometry Definitions', testInfo)
  })
})
