import { test, expect, takeSnapshot } from '@chromatic-com/playwright'

test.beforeEach(async ({ page }) => {
  await page.goto('/visuals/shapes')
})

test.describe('EditShapesPage', () => {
  test('can load page', async ({ page }, testInfo) => {
    await expect(page.locator('text="Edit Shapes"')).toBeVisible()
    await takeSnapshot(page, 'Edit Shapes Page', testInfo)
  })

  test('can navigate back to visuals page', async ({ page }) => {
    const link = page.locator('[aria-label="Back"]')

    await Promise.all([page.waitForURL('/visuals'), link.click()])

    await expect(page.locator('body')).toContainText('3D Visuals')
  })
})
