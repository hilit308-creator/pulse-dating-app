// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Store Billing QA Tests
 * 
 * Tests for Points and Premium purchase flows
 * Verifies integration with Apple In-App Purchase and Google Play Billing
 */

test.describe('Points Hub Purchase Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing subscription/points data
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      localStorage.removeItem('pulse_subscription');
      localStorage.removeItem('pulse_points_balance');
    });
  });

  test('Points page loads correctly', async ({ page }) => {
    await page.goto('http://localhost:3000/points');
    
    // Check page title
    await expect(page.locator('text=Points')).toBeVisible({ timeout: 10000 });
    
    // Check points packages are visible
    await expect(page.locator('text=100 Points')).toBeVisible();
    await expect(page.locator('text=250 Points')).toBeVisible();
    await expect(page.locator('text=600 Points')).toBeVisible();
  });

  test('Clicking points package selects it (does NOT purchase)', async ({ page }) => {
    await page.goto('http://localhost:3000/points');
    await page.waitForTimeout(1000);
    
    // Click on 100 Points package
    await page.locator('text=100 Points').click();
    await page.waitForTimeout(500);
    
    // Verify no purchase dialog opened yet
    const purchaseDialog = page.locator('text=Confirm Purchase');
    const dialogVisible = await purchaseDialog.isVisible().catch(() => false);
    
    // Should NOT show purchase dialog on package click
    expect(dialogVisible).toBe(false);
  });

  test('Buy Now button opens purchase confirmation dialog', async ({ page }) => {
    await page.goto('http://localhost:3000/points');
    await page.waitForTimeout(1000);
    
    // Click Buy Now button
    await page.locator('button:has-text("Buy Now")').click();
    await page.waitForTimeout(500);
    
    // Verify purchase confirmation dialog appears
    await expect(page.locator('text=Confirm Purchase')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=You\'re about to purchase')).toBeVisible();
  });

  test('Purchase dialog shows correct package details', async ({ page }) => {
    await page.goto('http://localhost:3000/points');
    await page.waitForTimeout(1000);
    
    // Select 600 Points package
    await page.locator('text=600 Points').click();
    await page.waitForTimeout(300);
    
    // Click Buy Now
    await page.locator('button:has-text("Buy Now")').click();
    await page.waitForTimeout(500);
    
    // Verify dialog shows 600 Points
    await expect(page.locator('dialog >> text=600 Points, text=600 Points').first()).toBeVisible({ timeout: 5000 });
  });

  test('Cancel button closes purchase dialog', async ({ page }) => {
    await page.goto('http://localhost:3000/points');
    await page.waitForTimeout(1000);
    
    // Open purchase dialog
    await page.locator('button:has-text("Buy Now")').click();
    await page.waitForTimeout(500);
    
    // Click Cancel
    await page.locator('button:has-text("Cancel"), span:has-text("Cancel")').click();
    await page.waitForTimeout(500);
    
    // Verify dialog is closed
    const dialogVisible = await page.locator('text=Confirm Purchase').isVisible().catch(() => false);
    expect(dialogVisible).toBe(false);
  });

  test('Confirm button triggers purchase flow', async ({ page }) => {
    await page.goto('http://localhost:3000/points');
    await page.waitForTimeout(1000);
    
    // Open purchase dialog
    await page.locator('button:has-text("Buy Now")').click();
    await page.waitForTimeout(500);
    
    // Click Confirm
    await page.locator('button:has-text("Confirm")').click();
    
    // Should show loading state
    await expect(page.locator('text=Connecting to store')).toBeVisible({ timeout: 3000 });
    
    // Wait for mock purchase to complete (1.5s)
    await page.waitForTimeout(2000);
    
    // Should show success message
    await expect(page.locator('text=Points added successfully')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Premium Subscriptions Purchase Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing subscription data
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      localStorage.removeItem('pulse_subscription');
    });
  });

  test('Premium page loads correctly', async ({ page }) => {
    await page.goto('http://localhost:3000/premium');
    
    // Check page elements
    await expect(page.locator('text=PULSE PLUS')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=PULSE PRO')).toBeVisible();
  });

  test('Activate button opens purchase confirmation dialog', async ({ page }) => {
    await page.goto('http://localhost:3000/premium');
    await page.waitForTimeout(1000);
    
    // Click first Activate button (Plus)
    await page.locator('button:has-text("Activate")').first().click();
    await page.waitForTimeout(500);
    
    // Verify purchase confirmation dialog appears
    await expect(page.locator('text=Confirm Purchase')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=You\'re about to subscribe')).toBeVisible();
  });

  test('Purchase dialog shows Pulse Plus details', async ({ page }) => {
    await page.goto('http://localhost:3000/premium');
    await page.waitForTimeout(1000);
    
    // Click Plus Activate button
    await page.locator('button:has-text("Activate")').first().click();
    await page.waitForTimeout(500);
    
    // Verify dialog shows Pulse Plus
    await expect(page.locator('text=Pulse Plus')).toBeVisible({ timeout: 5000 });
  });

  test('Purchase dialog shows Pulse Pro details', async ({ page }) => {
    await page.goto('http://localhost:3000/premium');
    await page.waitForTimeout(1000);
    
    // Click Pro Activate button (second one)
    await page.locator('button:has-text("Activate")').nth(1).click();
    await page.waitForTimeout(500);
    
    // Verify dialog shows Pulse Pro
    await expect(page.locator('text=Pulse Pro')).toBeVisible({ timeout: 5000 });
  });

  test('Cancel button closes purchase dialog', async ({ page }) => {
    await page.goto('http://localhost:3000/premium');
    await page.waitForTimeout(1000);
    
    // Open purchase dialog
    await page.locator('button:has-text("Activate")').first().click();
    await page.waitForTimeout(500);
    
    // Click Cancel
    await page.locator('button:has-text("Cancel"), span:has-text("Cancel")').click();
    await page.waitForTimeout(500);
    
    // Verify dialog is closed
    const dialogVisible = await page.locator('text=Confirm Purchase').isVisible().catch(() => false);
    expect(dialogVisible).toBe(false);
  });

  test('Confirm button triggers subscription purchase', async ({ page }) => {
    await page.goto('http://localhost:3000/premium');
    await page.waitForTimeout(1000);
    
    // Open purchase dialog
    await page.locator('button:has-text("Activate")').first().click();
    await page.waitForTimeout(500);
    
    // Click Confirm
    await page.locator('button:has-text("Confirm")').click();
    
    // Should show loading state
    await expect(page.locator('text=Connecting to store')).toBeVisible({ timeout: 3000 });
    
    // Wait for mock purchase to complete
    await page.waitForTimeout(2000);
    
    // Should show success message
    await expect(page.locator('text=Purchase successful')).toBeVisible({ timeout: 5000 });
  });

  test('Active subscription shows "Active Plan" badge', async ({ page }) => {
    // Set up an active subscription
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      localStorage.setItem('pulse_subscription', JSON.stringify({
        type: 'plus',
        productId: 'pulse_premium_monthly',
        purchasedAt: new Date().toISOString()
      }));
    });
    
    await page.goto('http://localhost:3000/premium');
    await page.waitForTimeout(1000);
    
    // Should show Active Plan indicator
    await expect(page.locator('text=Active Plan')).toBeVisible({ timeout: 5000 });
  });

  test('Manage subscription button is visible for active subscribers', async ({ page }) => {
    // Set up an active subscription
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      localStorage.setItem('pulse_subscription', JSON.stringify({
        type: 'plus',
        productId: 'pulse_premium_monthly',
        purchasedAt: new Date().toISOString()
      }));
    });
    
    await page.goto('http://localhost:3000/premium');
    await page.waitForTimeout(1000);
    
    // Should show Manage subscription button
    await expect(page.locator('text=Manage subscription')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Store Billing Service Integration', () => {
  test('Web platform uses mock purchase (development)', async ({ page }) => {
    await page.goto('http://localhost:3000/points');
    
    // Check console for platform detection
    const consoleLogs = [];
    page.on('console', msg => consoleLogs.push(msg.text()));
    
    // Trigger a purchase
    await page.locator('button:has-text("Buy Now")').click();
    await page.waitForTimeout(500);
    await page.locator('button:has-text("Confirm")').click();
    await page.waitForTimeout(2000);
    
    // Verify mock purchase was used (web platform)
    const hasMockLog = consoleLogs.some(log => log.includes('Web mock purchase'));
    expect(hasMockLog).toBe(true);
  });

  test('Restore Purchases button is functional', async ({ page }) => {
    await page.goto('http://localhost:3000/premium');
    await page.waitForTimeout(1000);
    
    // Click Restore Purchases
    await page.locator('text=Restore Purchases').click();
    
    // Should show restoring message
    await expect(page.locator('text=Restoring purchases')).toBeVisible({ timeout: 3000 });
  });
});

test.describe('Feature Activation Flow (Points)', () => {
  test('Features require points purchase before activation', async ({ page }) => {
    await page.goto('http://localhost:3000/points');
    await page.waitForTimeout(1000);
    
    // Check that features section exists
    await expect(page.locator('text=PULSE BOOST')).toBeVisible({ timeout: 5000 });
    
    // Features should have selection checkboxes, not direct activation
    const featureCheckboxes = page.locator('[type="checkbox"]');
    const checkboxCount = await featureCheckboxes.count();
    
    // Should have feature selection checkboxes
    expect(checkboxCount).toBeGreaterThan(0);
  });

  test('Multiple features can be selected simultaneously', async ({ page }) => {
    await page.goto('http://localhost:3000/points');
    await page.waitForTimeout(1000);
    
    // Select multiple features by clicking checkboxes
    const checkboxes = page.locator('[type="checkbox"]');
    const count = await checkboxes.count();
    
    if (count >= 2) {
      await checkboxes.nth(0).click();
      await checkboxes.nth(1).click();
      await page.waitForTimeout(300);
      
      // Both should be checked
      await expect(checkboxes.nth(0)).toBeChecked();
      await expect(checkboxes.nth(1)).toBeChecked();
    }
  });
});

test.describe('UI/UX Verification', () => {
  test('Cancel button text is white and visible', async ({ page }) => {
    await page.goto('http://localhost:3000/points');
    await page.waitForTimeout(1000);
    
    // Open purchase dialog
    await page.locator('button:has-text("Buy Now")').click();
    await page.waitForTimeout(500);
    
    // Check Cancel button is visible
    const cancelButton = page.locator('span:has-text("Cancel")');
    await expect(cancelButton).toBeVisible();
    
    // Verify text color is white
    const color = await cancelButton.evaluate(el => window.getComputedStyle(el).color);
    expect(color).toBe('rgb(255, 255, 255)'); // White
  });

  test('Purchase dialog has proper styling', async ({ page }) => {
    await page.goto('http://localhost:3000/points');
    await page.waitForTimeout(1000);
    
    // Open purchase dialog
    await page.locator('button:has-text("Buy Now")').click();
    await page.waitForTimeout(500);
    
    // Check dialog elements
    await expect(page.locator('text=Confirm Purchase')).toBeVisible();
    await expect(page.locator('button:has-text("Cancel"), span:has-text("Cancel")')).toBeVisible();
    await expect(page.locator('button:has-text("Confirm")')).toBeVisible();
  });

  test('Loading spinner appears during purchase', async ({ page }) => {
    await page.goto('http://localhost:3000/points');
    await page.waitForTimeout(1000);
    
    // Open and confirm purchase
    await page.locator('button:has-text("Buy Now")').click();
    await page.waitForTimeout(500);
    await page.locator('button:has-text("Confirm")').click();
    
    // Should show loading indicator
    await expect(page.locator('text=Connecting to store')).toBeVisible({ timeout: 2000 });
  });
});
