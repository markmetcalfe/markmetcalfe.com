import { test, expect } from '@chromatic-com/playwright'

test.describe('HomePage', () => {
  test('can load page', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text="Mark Metcalfe"')).toBeVisible()
    await expect(page.locator('text="Developer"')).toBeVisible()
    await expect(page.locator('text="Digital Wizard"')).toBeVisible()
  })

  test('can load page for vizshun', async ({ page }) => {
    await page.goto('/?vizshun')
    await expect(page.locator('text="Vizshun"')).toBeVisible()
    await expect(page.locator('text="Visual Artist"')).toBeVisible()
    await expect(page.locator('text="DJ"')).toBeVisible()
    await expect(page.locator('text="Digital Wizard"')).toBeVisible()
  })

  test('can navigate to the portfolio page', async ({ page }) => {
    await page.goto('/')

    const link = page.locator('a:has-text("My Work")')

    await Promise.all([page.waitForURL('/portfolio'), link.click()])

    await page.waitForTimeout(1000)
    await expect(page.locator('body')).toContainText('My Work')
  })

  test('can navigate to the contact page', async ({ page }) => {
    await page.goto('/')

    const link = page.locator('a:has-text("Contact Me")')

    await Promise.all([page.waitForURL('/contact'), link.click()])

    await page.waitForTimeout(1000)
    await expect(page.locator('body')).toContainText('Contact')
    await expect(page.locator('body')).toContainText('Email')
  })

  test('can navigate to the demo settings page', async ({ page }) => {
    await page.goto('/')

    const link = page.locator('a[title="Demo Settings"]')

    await Promise.all([page.waitForURL('/demo'), link.click()])

    await page.waitForTimeout(1000)
    await expect(page.locator('body')).toContainText('3D Demo')
  })
})
