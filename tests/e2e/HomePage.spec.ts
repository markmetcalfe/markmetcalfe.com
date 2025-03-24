import { test, expect, takeSnapshot } from '@chromatic-com/playwright'

test.describe('HomePage', () => {
  test('can load page for mark metcalfe', async ({ page }, testInfo) => {
    await page.goto('/')
    await expect(page.locator('text="Mark Metcalfe"')).toBeVisible()
    await expect(page.locator('text="Developer"')).toBeVisible()
    await expect(page.locator('text="Digital Wizard"')).toBeVisible()

    await expect(page.locator('text="Projects"')).toBeVisible()
    await expect(page.locator('text="Links"')).toBeVisible()
    await expect(page.locator('text="Recently Played"')).toBeVisible()

    await takeSnapshot(page, 'Home Page - Mark Metcalfe', testInfo)
  })

  test('can load page for vizshun', async ({ page }, testInfo) => {
    await page.goto('/?vizshun')
    await expect(page.locator('text="Vizshun"')).toBeVisible()
    await expect(page.locator('text="Visual Artist"')).toBeVisible()
    await expect(page.locator('text="DJ"')).toBeVisible()
    await expect(page.locator('text="Digital Wizard"')).toBeVisible()

    await expect(page.locator('text="Projects"')).toBeVisible()
    await expect(page.locator('text="Links"')).toBeVisible()
    await expect(page.locator('text="Recently Played"')).toBeVisible()

    await takeSnapshot(page, 'Home Page - Vizshun', testInfo)
  })

  test('can load card page for mark metcalfe', async ({ page }, testInfo) => {
    await page.goto('/card')
    await expect(page.locator('text="Mark Metcalfe"')).toBeVisible()
    await expect(page.locator('text="Developer"')).toBeVisible()
    await expect(page.locator('text="Digital Wizard"')).toBeVisible()
    await takeSnapshot(page, 'Card Page - Mark Metcalfe', testInfo)
  })

  test('can load card page for vizshun', async ({ page }, testInfo) => {
    await page.goto('/card?vizshun')
    await expect(page.locator('text="Vizshun"')).toBeVisible()
    await expect(page.locator('text="Visual Artist"')).toBeVisible()
    await expect(page.locator('text="DJ"')).toBeVisible()
    await expect(page.locator('text="Digital Wizard"')).toBeVisible()
    await takeSnapshot(page, 'Card Page - Vizshun', testInfo)
  })

  test('email link has valid mailto value', async ({ page }) => {
    await page.goto('/')

    const link = page.getByTitle('Email')

    await expect(link).toHaveAttribute('href', 'mailto:mark@markmetcalfe.com')
  })

  test('can navigate to github', async ({ page }) => {
    await page.goto('/')

    const link = page.getByTitle('GitHub')

    const [page1] = await Promise.all([
      page.waitForEvent('popup'),
      link.click(),
    ])

    await page.waitForTimeout(1000)
    expect(page1.url()).toContain('github.com/markmetcalfe')
    await expect(page1.locator('body')).toContainText('GitHub')
  })

  test('can navigate to linkedin', async ({ page }) => {
    await page.goto('/')

    const link = page.getByTitle('LinkedIn')

    const [page1] = await Promise.all([
      page.waitForEvent('popup'),
      link.click(),
    ])

    await page.waitForTimeout(1000)
    expect(page1.url()).toContain('linkedin.com/in/mark-metcalfe')
    await expect(page1).toHaveTitle(/LinkedIn/)
  })

  test('can navigate to instagram', async ({ page }) => {
    await page.goto('/?vizshun')

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
    await page.goto('/?vizshun')

    const link = page.locator('a:has-text("Soundcloud")')

    const [page1] = await Promise.all([
      page.waitForEvent('popup'),
      link.click(),
    ])

    await page.waitForTimeout(1000)
    expect(page1.url()).toContain('soundcloud.com')
    expect(page1.url()).toContain('vizshun')
  })

  // TODO: Fix this failing test
  test.skip('can navigate to the resume pdf', async ({ page }) => {
    await page.goto('/')

    const link = page.locator('a:has-text("Resume")')

    const [page1] = await Promise.all([
      page.waitForEvent('popup'),
      link.click(),
    ])

    expect(page1.url()).toContain('/Mark-Metcalfe-Resume.pdf')
  })

  test('can navigate to the visuals page', async ({ page }) => {
    await page.goto('/')

    const link = page.locator('a:has-text("Visuals")')

    await Promise.all([page.waitForURL('/visuals'), link.click()])

    await expect(page.locator('body')).toContainText('3D Visuals')
  })

  test('can navigate to the sequencer page', async ({ page }) => {
    await page.goto('/')

    const link = page.locator('a:has-text("Sequencer")')

    await Promise.all([page.waitForURL('/sequencer'), link.click()])

    await expect(page.locator('body')).toContainText('Step Sequencer')
  })

  test('can see recently played track', async ({ page }, testInfo) => {
    await page.route('/api/get-last-played', async route => {
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

    await page.goto('/')
    await page.waitForTimeout(1000)

    await takeSnapshot(page, 'Home Page - Recently Played', testInfo)

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
