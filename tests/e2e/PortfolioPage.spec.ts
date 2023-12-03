import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/portfolio')
})

test.describe('PortfolioPage', () => {
  test('matches snapshot', async ({ page }) => {
    await page.waitForTimeout(1000)
    expect(await page.screenshot()).toMatchSnapshot()
  })

  test('can navigate back home', async ({ page }) => {
    const link = page.locator('[aria-label="Back"]')

    await Promise.all([page.waitForURL('/'), link.click()])

    await expect(page.locator('body')).toContainText('Mark Metcalfe')
  })

  test('can navigate to instagram', async ({ page }) => {
    const link = page.locator('a:has-text("Instagram")')

    const [page1] = await Promise.all([
      page.waitForEvent('popup'),
      link.click(),
    ])

    expect(page1.url()).toContain('instagram.com')
    await expect(page1).toHaveTitle(/Instagram/)
  })

  test('can navigate to github', async ({ page }) => {
    const link = page.locator('a:has-text("GitHub")')

    const [page1] = await Promise.all([
      page.waitForEvent('popup'),
      link.click(),
    ])

    expect(page1.url()).toContain('github.com')
    await expect(page1.locator('body')).toContainText('GitHub')
  })

  // TODO: Fix this failing test
  test.skip('can navigate to the resume pdf', async ({ page }) => {
    const link = page.locator('a:has-text("Resume")')

    const [page1] = await Promise.all([
      page.waitForEvent('popup'),
      link.click(),
    ])

    expect(page1.url()).toContain('/Mark-Metcalfe-Resume.pdf')
  })
})
