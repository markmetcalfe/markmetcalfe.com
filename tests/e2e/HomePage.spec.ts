import { test, expect, takeSnapshot } from '@chromatic-com/playwright'

test.describe('HomePage', () => {
  test('can load page for mark metcalfe', async ({ page }, testInfo) => {
    await page.goto('/')
    await expect(page.locator('text="Mark Metcalfe"')).toBeVisible()
    await expect(page.locator('text="Developer"')).toBeVisible()
    await expect(page.locator('text="Digital Wizard"')).toBeVisible()
    await takeSnapshot(page, 'Home Page - Mark Metcalfe', testInfo)
  })

  test('can load page for vizshun', async ({ page }, testInfo) => {
    await page.goto('/?vizshun')
    await expect(page.locator('text="Vizshun"')).toBeVisible()
    await expect(page.locator('text="Visual Artist"')).toBeVisible()
    await expect(page.locator('text="DJ"')).toBeVisible()
    await expect(page.locator('text="Digital Wizard"')).toBeVisible()
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

    const link = page.locator('a:has-text("Email")')

    await expect(link).toHaveAttribute('href', 'mailto:mark@markmetcalfe.com')
  })

  test('can navigate to github', async ({ page }) => {
    await page.goto('/')

    const link = page.locator('a:has-text("GitHub")')

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

    const link = page.locator('a:has-text("LinkedIn")')

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
})
