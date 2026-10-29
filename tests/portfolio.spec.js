const { test, expect } = require('@playwright/test');

test.describe('Portfolio UI Tests', () => {
  test.setTimeout(30000);
  const URL = 'http://localhost:8080';

  test('Desktop: Page loads, theme toggles', async ({ page }) => {
    await page.goto(URL, { waitUntil: 'networkidle' });
    
    const themeBtn = page.locator('#theme-toggle');
    await expect(themeBtn).toBeVisible();
    
    await themeBtn.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('Mobile: Hamburger menu opens', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(URL, { waitUntil: 'networkidle' });
    
    const menuBtn = page.locator('#menu-toggle');
    await expect(menuBtn).toBeVisible();
    
    await menuBtn.click();
    await expect(page.locator('#site-navigation')).toHaveClass(/is-open/);
  });

  test('Contact form exists', async ({ page }) => {
    await page.goto(URL, { waitUntil: 'networkidle' });
    await expect(page.locator('#home-page #contact-form')).toBeVisible();
  });
});
