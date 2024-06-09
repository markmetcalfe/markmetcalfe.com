import { test, expect } from '@chromatic-com/playwright'

test.beforeEach(async ({ page }) => {
  await page.goto('/400')
})

test.describe('NotFoundPage', () => {
  test('can load page', async ({ page }) => {
    await expect(page.locator('text="Not Found"')).toBeVisible()
  })

  test('can navigate back home', async ({ page }) => {
    const link = page.locator('[aria-label="Back"]')

    await Promise.all([page.waitForURL('/'), link.click()])

    await page.waitForTimeout(1000)
    await expect(page.locator('body')).toContainText('Mark Metcalfe')
  })

  test('can navigate to the contact page', async ({ page }) => {
    const link = page.locator('a:has-text("Contact Me")')

    await Promise.all([page.waitForURL('/contact'), link.click()])

    await page.waitForTimeout(1000)
    await expect(page.locator('body')).toContainText('Contact')
    await expect(page.locator('body')).toContainText('Email')
  })
})
