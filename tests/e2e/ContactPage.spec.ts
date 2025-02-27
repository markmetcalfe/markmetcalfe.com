import { test, expect } from '@chromatic-com/playwright'

test.describe('ContactPage', () => {
  test('can load page', async ({ page }) => {
    await page.goto('/contact')
    await expect(page.locator('text="Contact"')).toBeVisible()
  })

  test('can navigate back home', async ({ page }) => {
    await page.goto('/contact')

    const link = page.locator('[aria-label="Back"]')

    await Promise.all([page.waitForURL('/'), link.click()])
    await page.waitForTimeout(1000)
    await expect(page.locator('body')).toContainText('Mark Metcalfe')
  })

  test('email link has valid mailto value', async ({ page }) => {
    await page.goto('/contact')

    const link = page.locator('a:has-text("Email")')

    await expect(link).toHaveAttribute('href', 'mailto:mark@markmetcalfe.com')
  })

  test('can navigate to linkedin', async ({ page }) => {
    await page.goto('/contact')

    const link = page.locator('a:has-text("LinkedIn")')

    const [page1] = await Promise.all([
      page.waitForEvent('popup'),
      link.click(),
    ])

    await page.waitForTimeout(1000)
    expect(page1.url()).toContain('linkedin.com/in/mark-metcalfe')
    await expect(page1).toHaveTitle(/LinkedIn/)
  })

  test('can navigate to instagram', async ({ page }) => {
    await page.goto('/contact?vizshun')

    const link = page.locator('a:has-text("Instagram")')

    const [page1] = await Promise.all([
      page.waitForEvent('popup'),
      link.click(),
    ])

    await page.waitForTimeout(1000)
    expect(page1.url()).toContain('instagram.com')
    expect(page1.url()).toContain('_vizshun')
  })
})
