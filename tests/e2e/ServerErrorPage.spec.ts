import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/5xx')
})

test.describe('ServerErrorPage', () => {
  test('matches snapshot', async ({ page }) => {
    await page.waitForTimeout(1000)
    expect(await page.screenshot()).toMatchSnapshot()
  })

  test('can navigate back home', async ({ page }) => {
    const link = page.locator('[aria-label="Back"]')

    await Promise.all([page.waitForURL('/'), link.click()])

    await expect(page.locator('body')).toContainText('Mark Metcalfe')
  })

  test('can navigate to the contact page', async ({ page }) => {
    const link = page.locator('a:has-text("Contact Me")')

    await Promise.all([page.waitForURL('/contact'), link.click()])

    await expect(page.locator('body')).toContainText('Contact')
    await expect(page.locator('body')).toContainText('Email')
  })
})
