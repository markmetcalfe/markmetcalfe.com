import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/privacy-policy')
})

test.describe('PrivacyPolicyPage', () => {
  test('matches snapshot', async ({ page }) => {
    await page.waitForTimeout(1000)
    expect(await page.screenshot()).toMatchSnapshot()
  })

  test('can navigate back home', async ({ page }) => {
    const link = page.locator('[aria-label="Back"]')

    await Promise.all([page.waitForURL('/'), link.click()])

    await expect(page.locator('body')).toContainText('Mark Metcalfe')
    await expect(page.locator('body')).toContainText('Kia ora, I’m Mark')
  })
})
