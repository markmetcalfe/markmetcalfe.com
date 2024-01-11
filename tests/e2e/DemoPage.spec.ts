import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/demo')
})

test.describe('DemoPage', () => {
  test('matches snapshot', async ({ page }) => {
    await page.waitForTimeout(1000)
    expect(await page.screenshot()).toMatchSnapshot()
  })

  test('can navigate back home', async ({ page }) => {
    const link = page.locator('[aria-label="Back"]')

    await Promise.all([page.waitForURL('/'), link.click()])

    await expect(page.locator('body')).toContainText('Mark Metcalfe')
  })

  test('can open geometry definitions dialog and it matches snapshot', async ({
    page,
  }) => {
    const button = page.locator('[aria-label="Configure Geometry Definitions"]')

    await button.click()

    await expect(page.locator('body')).toContainText('Save')

    await page.waitForTimeout(1000)
    expect(await page.screenshot()).toMatchSnapshot()
  })
})
