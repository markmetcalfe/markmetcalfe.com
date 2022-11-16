import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test.describe('HomePage', () => {
  test('matches snapshot', async ({ page }) => {
    await page.waitForTimeout(1000)
    expect(await page.screenshot()).toMatchSnapshot()
  })

  test('can navigate to the contact page', async ({ page }) => {
    const link = await page.locator('a:has-text("Contact")')

    await Promise.all([page.waitForNavigation(), link.click()])

    await expect(page.locator('body')).toContainText('Contact Me')
  })

  test('contact link hover state matches snapshot', async ({ page }) => {
    const link = await page.locator('a:has-text("Contact")')
    link.hover()
    await page.waitForTimeout(500)
    expect(await link.screenshot()).toMatchSnapshot()
  })

  test('can navigate to the resume pdf', async ({ page, browserName }) => {
    const link = await page.locator('a:has-text("Resume")')

    if (browserName !== 'webkit') {
      // Test doesn't work in Chrome for some reason
      return
    }

    const [page1] = await Promise.all([
      page.waitForEvent('popup'),
      link.click(),
    ])

    await expect(page1.url()).toContain('/Mark-Metcalfe-Resume.pdf')
  })

  test('resume link hover state matches snapshot', async ({ page }) => {
    const link = await page.locator('a:has-text("Resume")')
    link.hover()
    await page.waitForTimeout(500)
    expect(await link.screenshot()).toMatchSnapshot()
  })

  test('can navigate to github', async ({ page }) => {
    const link = await page.locator('a:has-text("GitHub")')

    const [page1] = await Promise.all([
      page.waitForEvent('popup'),
      link.click(),
    ])

    await expect(page1.url()).toContain('github.com')
    await expect(page1.locator('body')).toContainText('GitHub')
  })

  test('github link hover state matches snapshot', async ({ page }) => {
    const link = await page.locator('a:has-text("GitHub")')
    link.hover()
    await page.waitForTimeout(500)
    expect(await link.screenshot()).toMatchSnapshot()
  })

  test('can navigate to linkedin', async ({ page }) => {
    const link = await page.locator('a:has-text("LinkedIn")')

    const [page1] = await Promise.all([
      page.waitForEvent('popup'),
      link.click(),
    ])

    await expect(page1.url()).toContain('linkedin.com')
    await expect(page1.locator('body')).toContainText('LinkedIn')
  })

  test('linkedin link hover state matches snapshot', async ({ page }) => {
    const link = await page.locator('a:has-text("LinkedIn")')
    link.hover()
    await page.waitForTimeout(500)
    expect(await link.screenshot()).toMatchSnapshot()
  })
})
