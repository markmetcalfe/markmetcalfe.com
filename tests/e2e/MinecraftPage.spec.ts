import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/minecraft')
})

test.describe('MinecraftPage', () => {
  test('matches snapshot', async ({ page }) => {
    await page.waitForTimeout(1000)
    expect(await page.screenshot()).toMatchSnapshot()
  })
})
