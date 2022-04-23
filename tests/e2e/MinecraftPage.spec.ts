import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/minecraft')
})

test.describe('MinecraftPage', () => {
  test('matches snapshot', async ({ page }) => {
    await page.waitForTimeout(1000)
    expect(await page.screenshot()).toMatchSnapshot()
  })

  test('can navigate to the contact page', async ({ page }) => {
    const link = await page.locator('a:has-text("contact me")')

    await Promise.all([page.waitForNavigation(), link.click()])

    await expect(page.locator('body')).toContainText('Contact Me')
    await expect(page.locator('body')).toContainText('Email')
  })

  test('can navigate to the creative map page and back', async ({ page }) => {
    let link = await page.locator('a:has-text("Creative Map")')

    await Promise.all([page.waitForNavigation(), link.click()])

    await expect(page.locator('body')).toContainText(
      'Minecraft Creative Server Map',
    )

    await page.waitForTimeout(1000)
    expect(await page.locator('header').screenshot()).toMatchSnapshot()

    link = await page.locator('[aria-label="Back"]')

    await Promise.all([page.waitForNavigation(), link.click()])

    await expect(page.locator('body')).toContainText(
      'A Private Minecraft Server',
    )
  })

  test('creative map link hover state matches snapshot', async ({ page }) => {
    const link = await page.locator('a:has-text("Creative Map")')
    link.hover()
    await page.waitForTimeout(500)
    expect(await link.screenshot()).toMatchSnapshot()
  })

  test('can navigate to the survival map page and back', async ({ page }) => {
    let link = await page.locator('a:has-text("Survival Map")')

    await Promise.all([page.waitForNavigation(), link.click()])

    await expect(page.locator('body')).toContainText(
      'Minecraft Survival Server Map',
    )

    await page.waitForTimeout(1000)
    expect(await page.locator('header').screenshot()).toMatchSnapshot()

    link = await page.locator('[aria-label="Back"]')

    await Promise.all([page.waitForNavigation(), link.click()])

    await expect(page.locator('body')).toContainText(
      'A Private Minecraft Server',
    )
  })

  test('survival map link hover state matches snapshot', async ({ page }) => {
    const link = await page.locator('a:has-text("Survival Map")')
    link.hover()
    await page.waitForTimeout(500)
    expect(await link.screenshot()).toMatchSnapshot()
  })
})
