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
    const link = await page.locator('[aria-label="Back"]')

    await Promise.all([page.waitForNavigation(), link.click()])

    await expect(page.locator('body')).toContainText('Mark Metcalfe')
    await expect(page.locator('body')).toContainText('Kia ora, I’m Mark')
  })

  test('can navigate to messenger', async ({ page }) => {
    const link = await page.locator('a:has-text("Messenger")')

    const [page1] = await Promise.all([
      page.waitForEvent('popup'),
      link.click(),
    ])

    await expect(page1.url()).toMatch(/(messenger|facebook).com/)
  })

  test('messenger link hover state matches snapshot', async ({ page }) => {
    const link = await page.locator('a:has-text("Messenger")')
    link.hover()
    await page.waitForTimeout(500)
    expect(await link.screenshot()).toMatchSnapshot()
  })

  test('can navigate to whatsapp', async ({ page }) => {
    const link = await page.locator('a:has-text("WhatsApp")')

    const [page1] = await Promise.all([
      page.waitForEvent('popup'),
      link.click(),
    ])

    await expect(page1.url()).toContain('whatsapp.com')
    await expect(page1.locator('body')).toContainText('WhatsApp')
  })

  test('whatsapp link hover state matches snapshot', async ({ page }) => {
    const link = await page.locator('a:has-text("WhatsApp")')
    link.hover()
    await page.waitForTimeout(500)
    expect(await link.screenshot()).toMatchSnapshot()
  })

  test('email link has valid mailto value', async ({ page }) => {
    const link = await page.locator('a:has-text("Email")')

    await expect(link).toHaveAttribute(
      'href',
      'mailto:mark.ls.metcalfe@gmail.com',
    )
  })

  test('email link hover state matches snapshot', async ({ page }) => {
    const link = await page.locator('a:has-text("Email")')
    link.hover()
    await page.waitForTimeout(500)
    expect(await link.screenshot()).toMatchSnapshot()
  })

  test('phone link has valid sms value', async ({ page }) => {
    const link = await page.locator('a:has-text("Phone")')

    await expect(link).toHaveAttribute('href', 'sms:+64278746968')
  })

  test('phone link hover state matches snapshot', async ({ page }) => {
    const link = await page.locator('a:has-text("Phone")')
    link.hover()
    await page.waitForTimeout(500)
    expect(await link.screenshot()).toMatchSnapshot()
  })
})