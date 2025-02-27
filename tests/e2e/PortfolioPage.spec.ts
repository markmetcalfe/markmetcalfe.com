import { test, expect } from '@chromatic-com/playwright'

test.describe('PortfolioPage', () => {
  test('can load page', async ({ page }) => {
    await page.goto('/portfolio')

    await expect(page.locator('text="My Work"')).toBeVisible()
  })
  test('can load page for vizshun', async ({ page }) => {
    await page.goto('/portfolio?vizshun')

    await expect(page.locator('text="My Work"')).toBeVisible()
  })

  test('can navigate back home', async ({ page }) => {
    await page.goto('/portfolio')

    const link = page.locator('[aria-label="Back"]')

    await Promise.all([page.waitForURL('/'), link.click()])

    await page.waitForTimeout(1000)
    await expect(page.locator('body')).toContainText('Mark Metcalfe')
  })

  test('can navigate to instagram', async ({ page }) => {
    await page.goto('/portfolio?vizshun')

    const link = page.locator('a:has-text("Instagram")')

    const [page1] = await Promise.all([
      page.waitForEvent('popup'),
      link.click(),
    ])

    await page.waitForTimeout(1000)
    expect(page1.url()).toContain('instagram.com')
    expect(page1.url()).toContain('_vizshun')
  })

  test('can navigate to soundcloud', async ({ page }) => {
    await page.goto('/portfolio?vizshun')

    const link = page.locator('a:has-text("Soundcloud")')

    const [page1] = await Promise.all([
      page.waitForEvent('popup'),
      link.click(),
    ])

    await page.waitForTimeout(1000)
    expect(page1.url()).toContain('soundcloud.com')
    expect(page1.url()).toContain('vizshun')
  })

  test('can navigate to github', async ({ page }) => {
    await page.goto('/portfolio')

    const link = page.locator('a:has-text("GitHub")')

    const [page1] = await Promise.all([
      page.waitForEvent('popup'),
      link.click(),
    ])

    await page.waitForTimeout(1000)
    expect(page1.url()).toContain('github.com/markmetcalfe')
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
