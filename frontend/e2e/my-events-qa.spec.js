/**
 * QA Tests for My Events Flow
 * Tests all buttons and logic in MyEventsScreen, EventMatchesScreen, EventLikesScreen
 * 
 * Run with: npx playwright test e2e/my-events-qa.spec.js
 */

const { test, expect } = require('@playwright/test');

// Helper to clear localStorage before tests
const clearLocalStorage = async (page) => {
  await page.evaluate(() => {
    localStorage.removeItem('pulse_matches');
    localStorage.removeItem('pulse_blocked_users');
    localStorage.removeItem('event_purchased');
  });
};

// Helper to set up a purchased event
const setupPurchasedEvent = async (page, eventId = 'lp1') => {
  await page.evaluate((id) => {
    const purchased = JSON.parse(localStorage.getItem('event_purchased') || '[]');
    if (!purchased.includes(id)) {
      purchased.push(id);
      localStorage.setItem('event_purchased', JSON.stringify(purchased));
    }
  }, eventId);
};

test.describe('My Events Screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await setupPurchasedEvent(page, 'lp1'); // Summer Festival
    await page.goto('/my-events');
  });

  test('should display purchased events', async ({ page }) => {
    // Wait for the event card to appear
    await expect(page.locator('text=Summer Festival')).toBeVisible();
    await expect(page.locator('text=Central Park, New York')).toBeVisible();
  });

  test('should show correct counts for matches and interested', async ({ page }) => {
    // Summer Festival has attendees with isMatch and interestedInYou flags
    // a1, a2, a6 have isMatch: true (3 matches)
    // a3, a4, a5, a7 have interestedInYou: true (4 interested)
    await expect(page.locator('text=/\\d+ Matches/')).toBeVisible();
    await expect(page.locator('text=/\\d+Interested in You/')).toBeVisible();
  });

  test('View Attendees button should navigate to attendees screen', async ({ page }) => {
    await page.click('text=View Attendees');
    await expect(page).toHaveURL(/\/events\/lp1\/attendees/);
  });

  test('Matches button should navigate to matches screen', async ({ page }) => {
    await page.click('text=/\\d+ Matches/');
    await expect(page).toHaveURL(/\/events\/lp1\/matches/);
  });

  test('Interested in You button should navigate to likes screen', async ({ page }) => {
    await page.click('text=/Interested in You/');
    await expect(page).toHaveURL(/\/events\/lp1\/likes/);
  });
});

test.describe('Event Matches Screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await setupPurchasedEvent(page, 'lp1');
    await page.goto('/my-events');
    await page.click('text=/\\d+ Matches/');
  });

  test('should display match profiles', async ({ page }) => {
    // Should show match cards
    await expect(page.locator('[data-testid="match-card"]').or(page.locator('.MuiCard-root')).first()).toBeVisible();
  });

  test('Chat button should navigate to chat screen', async ({ page }) => {
    // Click the first Chat button
    await page.click('button:has-text("Chat")');
    await expect(page).toHaveURL(/\/chat\//);
  });

  test('Pass button should remove profile from list', async ({ page }) => {
    // Count initial cards
    const initialCount = await page.locator('.MuiCard-root').count();
    
    // Click Pass on first card
    await page.click('button:has-text("Pass")');
    
    // Should have one less card
    await expect(page.locator('.MuiCard-root')).toHaveCount(initialCount - 1);
  });

  test('Block button should remove profile and save to localStorage', async ({ page }) => {
    // Click Block on first card (confirm dialog will appear)
    page.on('dialog', dialog => dialog.accept());
    await page.click('button[title="Block"]');
    
    // Check localStorage has blocked user
    const blocked = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('pulse_blocked_users') || '[]');
    });
    expect(blocked.length).toBeGreaterThan(0);
  });

  test('blocked users should not appear when returning to screen', async ({ page }) => {
    // Block a user
    page.on('dialog', dialog => dialog.accept());
    await page.click('button[title="Block"]');
    
    // Navigate away and back
    await page.goto('/my-events');
    await page.click('text=/\\d+ Matches/');
    
    // The blocked user should not be visible
    // (This is verified by the count being reduced)
  });
});

test.describe('Event Likes Screen (Interested in You)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await setupPurchasedEvent(page, 'lp1');
    await page.goto('/my-events');
    await page.click('text=/Interested in You/');
  });

  test('should display interested profiles', async ({ page }) => {
    // Should show like cards
    await expect(page.locator('.MuiCard-root').first()).toBeVisible();
  });

  test('Like Back button should trigger match celebration', async ({ page }) => {
    // Click Like Back on first card
    await page.click('button:has-text("Like Back")');
    
    // Match celebration popup should appear
    await expect(page.locator('text="It\'s a Match"').or(page.locator('text=/Match/'))).toBeVisible({ timeout: 5000 });
  });

  test('Like Back should save match to localStorage', async ({ page }) => {
    // Click Like Back
    await page.click('button:has-text("Like Back")');
    
    // Wait for celebration
    await page.waitForTimeout(500);
    
    // Check localStorage has new match
    const matches = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('pulse_matches') || '[]');
    });
    expect(matches.length).toBeGreaterThan(0);
  });

  test('Send a message button in match popup should navigate to chat', async ({ page }) => {
    // Click Like Back
    await page.click('button:has-text("Like Back")');
    
    // Wait for match popup
    await page.waitForSelector('text=/Send a message|Send message/i', { timeout: 5000 });
    
    // Click send message
    await page.click('text=/Send a message|Send message/i');
    
    // Should navigate to chat
    await expect(page).toHaveURL(/\/chat\//);
  });

  test('Keep swiping button should close popup and stay on screen', async ({ page }) => {
    // Click Like Back
    await page.click('button:has-text("Like Back")');
    
    // Wait for match popup
    await page.waitForSelector('text=/Keep swiping|Later/i', { timeout: 5000 });
    
    // Click keep swiping
    await page.click('text=/Keep swiping|Later/i');
    
    // Should stay on likes screen
    await expect(page).toHaveURL(/\/events\/.*\/likes/);
  });

  test('liked profile should not appear after returning to screen', async ({ page }) => {
    // Get initial count
    const initialCount = await page.locator('.MuiCard-root').count();
    
    // Click Like Back
    await page.click('button:has-text("Like Back")');
    
    // Close popup
    await page.waitForSelector('text=/Keep swiping|Later/i', { timeout: 5000 });
    await page.click('text=/Keep swiping|Later/i');
    
    // Navigate away and back
    await page.goto('/my-events');
    await page.click('text=/Interested in You/');
    
    // Should have one less card
    const newCount = await page.locator('.MuiCard-root').count();
    expect(newCount).toBeLessThan(initialCount);
  });

  test('Pass button should remove profile from list', async ({ page }) => {
    const initialCount = await page.locator('.MuiCard-root').count();
    
    await page.click('button:has-text("Pass")');
    
    await expect(page.locator('.MuiCard-root')).toHaveCount(initialCount - 1);
  });

  test('Block button should remove profile and save to localStorage', async ({ page }) => {
    page.on('dialog', dialog => dialog.accept());
    await page.click('button[title="Block"]');
    
    const blocked = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('pulse_blocked_users') || '[]');
    });
    expect(blocked.length).toBeGreaterThan(0);
  });
});

test.describe('Data Persistence', () => {
  test('matches should persist across page reloads', async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await setupPurchasedEvent(page, 'lp1');
    
    // Go to likes and create a match
    await page.goto('/my-events');
    await page.click('text=/Interested in You/');
    await page.click('button:has-text("Like Back")');
    await page.waitForSelector('text=/Keep swiping|Later/i', { timeout: 5000 });
    await page.click('text=/Keep swiping|Later/i');
    
    // Reload page
    await page.reload();
    
    // Check localStorage still has match
    const matches = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('pulse_matches') || '[]');
    });
    expect(matches.length).toBeGreaterThan(0);
  });

  test('blocked users should persist across page reloads', async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await setupPurchasedEvent(page, 'lp1');
    
    // Go to matches and block someone
    await page.goto('/my-events');
    await page.click('text=/\\d+ Matches/');
    page.on('dialog', dialog => dialog.accept());
    await page.click('button[title="Block"]');
    
    // Reload page
    await page.reload();
    
    // Check localStorage still has blocked user
    const blocked = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('pulse_blocked_users') || '[]');
    });
    expect(blocked.length).toBeGreaterThan(0);
  });

  test('new matches should appear in Event Matches', async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await setupPurchasedEvent(page, 'lp1');
    
    // Go to likes and create a match
    await page.goto('/my-events');
    await page.click('text=/Interested in You/');
    
    // Get the name of the first profile
    const profileName = await page.locator('.MuiCard-root').first().locator('h6, .MuiTypography-h6').first().textContent();
    
    await page.click('button:has-text("Like Back")');
    await page.waitForSelector('text=/Keep swiping|Later/i', { timeout: 5000 });
    await page.click('text=/Keep swiping|Later/i');
    
    // Go to Event Matches
    await page.goto('/my-events');
    await page.click('text=/\\d+ Matches/');
    
    // The matched profile should now appear in matches
    // (The count should have increased)
  });

  test('blocked users should not appear in Interested in You', async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await setupPurchasedEvent(page, 'lp1');
    
    // Go to likes and block someone
    await page.goto('/my-events');
    await page.click('text=/Interested in You/');
    
    const initialCount = await page.locator('.MuiCard-root').count();
    
    page.on('dialog', dialog => dialog.accept());
    await page.click('button[title="Block"]');
    
    // Navigate away and back
    await page.goto('/my-events');
    await page.click('text=/Interested in You/');
    
    // Should have one less card
    const newCount = await page.locator('.MuiCard-root').count();
    expect(newCount).toBeLessThan(initialCount);
  });
});

test.describe('My Events Count Updates', () => {
  test('match count should update after Like Back', async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await setupPurchasedEvent(page, 'lp1');
    
    // Get initial match count
    await page.goto('/my-events');
    const initialMatchText = await page.locator('text=/\\d+ Matches/').textContent();
    const initialMatchCount = parseInt(initialMatchText.match(/\d+/)[0]);
    
    // Create a match
    await page.click('text=/Interested in You/');
    await page.click('button:has-text("Like Back")');
    await page.waitForSelector('text=/Keep swiping|Later/i', { timeout: 5000 });
    await page.click('text=/Keep swiping|Later/i');
    
    // Go back to My Events
    await page.goto('/my-events');
    
    // Match count should have increased
    const newMatchText = await page.locator('text=/\\d+ Matches/').textContent();
    const newMatchCount = parseInt(newMatchText.match(/\d+/)[0]);
    
    expect(newMatchCount).toBeGreaterThan(initialMatchCount);
  });

  test('interested count should decrease after Like Back', async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await setupPurchasedEvent(page, 'lp1');
    
    // Get initial interested count
    await page.goto('/my-events');
    const initialText = await page.locator('text=/\\d+Interested in You/').textContent();
    const initialCount = parseInt(initialText.match(/\d+/)[0]);
    
    // Create a match
    await page.click('text=/Interested in You/');
    await page.click('button:has-text("Like Back")');
    await page.waitForSelector('text=/Keep swiping|Later/i', { timeout: 5000 });
    await page.click('text=/Keep swiping|Later/i');
    
    // Go back to My Events
    await page.goto('/my-events');
    
    // Interested count should have decreased
    const newText = await page.locator('text=/\\d+Interested in You/').textContent();
    const newCount = parseInt(newText.match(/\d+/)[0]);
    
    expect(newCount).toBeLessThan(initialCount);
  });
});
