import { test, expect, takeSnapshot } from '@chromatic-com/playwright'

test.beforeEach(async ({ page }) => {
  await page.goto('/sequencer/synths')
})

test.describe('EditSynthsPage', () => {
  test('can load page', async ({ page }, testInfo) => {
    await expect(page.locator('text="Edit Synths"')).toBeVisible()
    await takeSnapshot(page, 'Edit Synths Page', testInfo)
  })

  test('can navigate back to sequencer page', async ({ page }) => {
    const link = page.locator('[aria-label="Back"]')

    await Promise.all([page.waitForURL('/sequencer'), link.click()])

    await expect(page.locator('body')).toContainText('Step Sequencer')
  })
})
