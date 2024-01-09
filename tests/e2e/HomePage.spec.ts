import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test.describe('HomePage', () => {
  test('matches snapshot', async ({ page }) => {
    await page.waitForTimeout(1000)
    expect(await page.screenshot()).toMatchSnapshot()
  })

  test('can navigate to the portfolio page', async ({ page }) => {
    const link = page.locator('a:has-text("My Work")')

    await Promise.all([page.waitForURL('/portfolio'), link.click()])

    await expect(page.locator('body')).toContainText('My Work')
  })

  test('can navigate to the contact page', async ({ page }) => {
    const link = page.locator('a:has-text("Contact Me")')

    await Promise.all([page.waitForURL('/contact'), link.click()])

    await expect(page.locator('body')).toContainText('Contact')
    await expect(page.locator('body')).toContainText('Email')
  })

  test('can navigate to the demo settings page', async ({ page }) => {
    const link = page.locator('a[title="Demo Settings"]')

    await Promise.all([page.waitForURL('/demo'), link.click()])

    await expect(page.locator('body')).toContainText('3D Demo')
  })
})
