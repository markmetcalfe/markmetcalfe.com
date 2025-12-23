import { test, expect, takeSnapshot } from '@chromatic-com/playwright'

test.beforeEach(async ({ page }) => {
  await page.goto('/interests')
})

test.describe('InterestsPage', () => {
  test('can load page', async ({ page }, testInfo) => {
    await expect(page.locator('text="Interests"')).toBeVisible()

    await expect(page.locator('text="Visual Art"')).toBeVisible()
    await expect(page.locator('text="DJing"')).toBeVisible()
    await expect(page.locator('text="Recently Played"')).toBeVisible()

    await takeSnapshot(page, 'Interests Page', testInfo)
  })

  test('can navigate back home', async ({ page }) => {
    const link = page.locator('[aria-label="Back"]')

    await Promise.all([page.waitForURL('/'), link.click()])

    await expect(page.locator('body')).toContainText('Mark Metcalfe')
  })

  test('can navigate to instagram', async ({ page }) => {
    const link = page.locator('a:has-text("Instagram")')

    await expect(link).toHaveAttribute('href', 'https://www.instagram.com/_vizshun/')
  })

  test('can navigate to soundcloud', async ({ page }) => {
    const link = page.locator('a:has-text("Soundcloud")')

    await expect(link).toHaveAttribute('href', 'https://soundcloud.com/vizshun')
  })

  test('can navigate to minecraft server', async ({ page }) => {
    const link = page.locator('a:has-text("Minecraft Server")')

    await expect(link).toHaveAttribute('href', '/minecraft')
  })

  test('can see recently played track', async ({ page }, testInfo) => {
    await page.route('/api/get-last-played', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          name: 'Hard Discount Primitivo',
          artist: 'Abdul Raeva',
          album: 'Passion de la Passion',
          image:
            'https://i.scdn.co/image/ab67616d0000b273dc2cb9760cb0294dfe4309fc',
          timestamp: '2025-03-24T08:41:28.751Z',
          url: 'https://open.spotify.com/track/1GFb5Tb1edvKidRXkEQ487',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
    })

    await page.reload()
    await page.waitForTimeout(1000)

    await takeSnapshot(page, 'Interests Page - Recently Played', testInfo)

    const link = page.getByTitle('Play Track')

    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute(
      'href',
      'https://open.spotify.com/track/1GFb5Tb1edvKidRXkEQ487',
    )

    const albumArt = link.getByLabel('Passion de la Passion album art')
    await expect(albumArt).toBeVisible()
    await expect(albumArt).toHaveAttribute(
      'src',
      'https://i.scdn.co/image/ab67616d0000b273dc2cb9760cb0294dfe4309fc',
    )

    const trackInfo = link.getByTestId('recentlyplayed-info')
    await expect(trackInfo).toBeVisible()
    await expect(trackInfo).toContainText('Hard Discount Primitivo')
    await expect(trackInfo).toContainText('Abdul Raeva')
    await expect(trackInfo).toContainText('Played on 24/03/2025, 9:41 pm')

    const [page1] = await Promise.all([
      page.waitForEvent('popup'),
      link.click(),
    ])

    await page.waitForTimeout(1000)
    expect(page1.url()).toContain('spotify.com')
    await expect(page1).toHaveTitle(/Spotify/)
  })
})
