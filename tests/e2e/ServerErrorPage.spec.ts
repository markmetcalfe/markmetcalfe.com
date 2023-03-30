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

    await Promise.all([page.waitForNavigation(), link.click()])

    await expect(page.locator('body')).toContainText('Mark Metcalfe')
    await expect(page.locator('body')).toContainText('Kia ora, I’m Mark')
  })

  test('can navigate to the contact page', async ({ page }) => {
    const link = page.locator('a:has-text("contact me")')

    await Promise.all([page.waitForNavigation(), link.click()])

    await expect(page.locator('body')).toContainText('Contact Me')
    await expect(page.locator('body')).toContainText('Email')
  })
})
