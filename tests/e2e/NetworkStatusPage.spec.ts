import { test, expect } from '@chromatic-com/playwright'

test.describe('NetworkStatusPage', () => {
  test('can load page', async ({ page }) => {
    await page.goto('/status')
    await expect(page.locator('text="Connection Status"')).toBeVisible()
    await page.waitForTimeout(1000)
  })

  test('can navigate back home', async ({ page }) => {
    await page.goto('/status')
    const link = page.locator('[aria-label="Back"]')

    await Promise.all([page.waitForURL('/'), link.click()])
    await page.waitForTimeout(1000)
    await expect(page.locator('body')).toContainText('Mark Metcalfe')
  })

  test('can see connected network status', async ({ page }) => {
    await page.route('/api/get-network-status', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          isConnected: true,
          yourIp: '250.80.20.30',
          homeIp: '250.80.20.30',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
    })
    await page.goto('/status')
    await page.waitForTimeout(3000)
    await expect(page.locator('.networkstatus')).toContainText(
      'Connected To Local Network',
    )
    await expect(page.locator('.networkstatus')).not.toContainText(
      'Not Connected To Local Network',
    )
  })

  test('can see not connected network status', async ({ page }) => {
    await page.route('/api/get-network-status', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          isConnected: false,
          yourIp: '100.40.80.70',
          homeIp: '250.80.20.30',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
    })
    await page.goto('/status')
    await page.waitForTimeout(3000)
    await expect(page.locator('.networkstatus')).toContainText(
      'Not Connected To Local Network',
    )
  })
})
