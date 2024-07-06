import { test, expect } from '@chromatic-com/playwright'

test.beforeEach(async ({ page }) => {
  await page.goto('/demo')
})

test.describe('DemoPage', () => {
  test('can load page', async ({ page }) => {
    await expect(page.locator('text="3D Demo"')).toBeVisible()
  })

  test('can navigate back home', async ({ page }) => {
    const link = page.locator('[aria-label="Back"]')

    await Promise.all([page.waitForURL('/'), link.click()])

    await page.waitForTimeout(1000)
    await expect(page.locator('body')).toContainText('Mark Metcalfe')
  })

  test('can open geometry definitions dialog', async ({ page }) => {
    const button = page.locator('text="Edit Shapes"')

    await button.click()

    await expect(page.locator('body')).toContainText('Save')

    await page.waitForTimeout(1000)
  })
})
