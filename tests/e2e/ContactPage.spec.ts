import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/contact')
})

test.describe('ContactPage', () => {
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

  test('can navigate to messenger', async ({ page }) => {
    const link = page.locator('a:has-text("Messenger")')

    const [page1] = await Promise.all([
      page.waitForEvent('popup'),
      link.click(),
    ])

    expect(page1.url()).toMatch(/(messenger|facebook).com/)
  })

  test('can navigate to whatsapp', async ({ page }) => {
    const link = page.locator('a:has-text("WhatsApp")')

    const [page1] = await Promise.all([
      page.waitForEvent('popup'),
      link.click(),
    ])

    expect(page1.url()).toContain('whatsapp.com')
    await expect(page1.locator('body')).toContainText('WhatsApp')
  })

  test('email link has valid mailto value', async ({ page }) => {
    const link = page.locator('a:has-text("Email")')

    await expect(link).toHaveAttribute(
      'href',
      'mailto:mark@markmetcalfe.com',
    )
  })

  test('phone link has valid sms value', async ({ page }) => {
    const link = page.locator('a:has-text("Phone")')

    await expect(link).toHaveAttribute('href', 'sms:***REMOVED***')
  })
})
