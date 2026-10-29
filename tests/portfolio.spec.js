const { test, expect } = require('@playwright/test');

test.describe('Portfolio UI Tests', () => {
  test('Desktop: Page loads, theme toggles', async ({ page }) => {
    await page.goto('https://x2v0.github.io/');
    // Проверка заголовка
    await expect(page).toHaveTitle(/Валерий/);
    // Проверка переключения темы
    await page.click('#theme-toggle');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('Mobile: Hamburger menu opens', async ({ page }) => {
    // Эмулируем iPhone 13
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('https://x2v0.github.io/');
    // Кликаем по гамбургеру
    await page.click('#menu-toggle');
    // Проверяем, что меню получило класс is-open
    await expect(page.locator('#site-navigation')).toHaveClass(/is-open/);
  });

  test('Contact form exists', async ({ page }) => {
    await page.goto('https://x2v0.github.io/');
    await expect(page.locator('#contact-form')).toBeVisible();
  });
});
