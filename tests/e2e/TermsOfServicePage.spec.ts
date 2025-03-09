import { test, expect } from '@chromatic-com/playwright'

test.beforeEach(async ({ page }) => {
  await page.goto('/terms-of-service')
})

test.describe('TermsOfServicePage', () => {
  test('can load page', async ({ page }) => {
    await expect(page.locator('.pagecard-title')).toContainText(
      'Terms of Service',
    )
  })

  test('can navigate back home', async ({ page }) => {
    const link = page.locator('[aria-label="Back"]')

    await Promise.all([page.waitForURL('/'), link.click()])

    await page.waitForTimeout(1000)
    await expect(page.locator('body')).toContainText('Mark Metcalfe')
  })

  test('contact link has correct email', async ({ page }) => {
    const link = page.locator('a:has-text("You can contact us here")')
    await expect(link).toHaveAttribute('href', 'mailto:mark@markmetcalfe.com')
  })
})
