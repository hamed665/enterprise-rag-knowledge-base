import { expect, test } from '@playwright/test'
for (const width of [320, 1440]) {
  test(`source citations and layout at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/')
    await page.getByRole('button', { name: 'Retrieve passages' }).click()
    await expect(page.getByRole('heading', { name: 'Retrieved passage', exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Delivery policy', exact: true })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.screenshot({ path: `test-results/knowledge-${width}.png`, fullPage: true })
    await page.getByLabel('Ask the document library').fill('quantum telescope orbit')
    await page.getByRole('button', { name: 'Retrieve passages' }).click()
    await expect(page.getByRole('heading', { name: 'No supporting evidence' })).toBeVisible()
  })
}
