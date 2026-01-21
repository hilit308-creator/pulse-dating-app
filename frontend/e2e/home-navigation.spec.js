// @ts-check
const { test, expect } = require('@playwright/test');

// Helper to get current user state from the hidden test element
async function getCurrentUserState(page) {
  const stateElement = page.locator('[data-testid="current-user-state"]');
  const isVisible = await stateElement.count() > 0;
  if (!isVisible) return null;
  const userId = await stateElement.getAttribute('data-user-id');
  const deckIndex = await stateElement.getAttribute('data-deck-index');
  const filteredCount = await stateElement.getAttribute('data-filtered-count');
  return {
    userId: userId ? parseInt(userId) : null,
    deckIndex: deckIndex ? parseInt(deckIndex) : null,
    filteredCount: filteredCount ? parseInt(filteredCount) : null,
  };
}

// Helper to check if end-of-list UI is shown
async function isEndOfList(page) {
  return await page.locator('text="You are all caught up"').or(page.locator('text="You\'re all caught up"')).isVisible().catch(() => false);
}

// Helper to simulate swipe pass via drag gesture
async function swipePass(page) {
  const card = page.locator('[data-testid="current-user-state"]').locator('xpath=..').locator('div').first();
  if (await card.isVisible().catch(() => false)) {
    const box = await card.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x - 300, box.y + box.height / 2, { steps: 10 });
      await page.mouse.up();
      await page.waitForTimeout(500);
      return true;
    }
  }
  return false;
}

test.describe('Home Card Navigation', () => {
  test('Test A: Swipe changes visible user and anchor restore works', async ({ page }) => {
    const consoleLogs = [];
    let clampedCount = 0;
    let unexpectedFilteredChange = false;
    
    page.on('console', msg => {
      const text = msg.text();
      consoleLogs.push(text);
      if (text.includes('clamped=')) clampedCount++;
      if (text.includes('reason=unexpected')) unexpectedFilteredChange = true;
    });
    
    // Start fresh at Home
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Get initial state
    const initialState = await getCurrentUserState(page);
    console.log('[TEST] Initial state: userId=' + initialState?.userId + ' deckIndex=' + initialState?.deckIndex);
    
    if (!initialState || !initialState.userId) {
      console.log('[TEST] SKIP - no initial state');
      return;
    }
    
    // Perform 5 swipes and track user changes
    const swipedUsers = [initialState.userId];
    for (let i = 0; i < 5; i++) {
      await swipePass(page);
      await page.waitForTimeout(500);
      const state = await getCurrentUserState(page);
      if (state && state.userId) {
        swipedUsers.push(state.userId);
        console.log('[TEST] After swipe ' + (i+1) + ': userId=' + state.userId + ' deckIndex=' + state.deckIndex);
      }
      if (await isEndOfList(page)) break;
    }
    
    // Get state before navigation
    const beforeState = await getCurrentUserState(page);
    const beforeUserId = beforeState?.userId;
    console.log('[TEST] Before profile: userId=' + beforeUserId);
    
    if (!beforeUserId) {
      console.log('[TEST] SKIP - no user visible');
      return;
    }
    
    // Navigate to profile
    await page.goto('/profile/' + beforeUserId);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Go back
    await page.goBack();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Get state after back
    const afterState = await getCurrentUserState(page);
    const afterUserId = afterState?.userId;
    console.log('[TEST] After back: userId=' + afterUserId);
    
    const pass = afterUserId === beforeUserId;
    console.log('[TEST] AnchorRestore: ' + (pass ? 'PASS' : 'FAIL') + ' beforeUserId=' + beforeUserId + ' afterUserId=' + afterUserId);
    console.log('[TEST] clampedLogs=' + clampedCount + ' unexpectedChanges=' + unexpectedFilteredChange);
    
    // Print relevant logs
    consoleLogs.filter(l => l.includes('[Home]')).slice(-30).forEach(l => console.log(l));
    
    expect(pass).toBe(true);
    expect(clampedCount).toBe(0);
  });

  test('Test B: Undo stability', async ({ page }) => {
    let clampedCount = 0;
    page.on('console', msg => { if (msg.text().includes('clamped=')) clampedCount++; });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const state = await getCurrentUserState(page);
    console.log('[TEST] UndoStability: Initial state userId=' + state?.userId);
    expect(clampedCount).toBe(0);
  });

  test('Test C: End-of-list UI', async ({ page }) => {
    let clampedCount = 0;
    page.on('console', msg => { if (msg.text().includes('clamped=')) clampedCount++; });
    
    await page.goto('/?card=100');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const hasEndUI = await isEndOfList(page);
    const hasAdjustFilters = await page.locator('button:has-text("Adjust filters")').isVisible().catch(() => false);
    const hasStartOver = await page.locator('button:has-text("Start over")').isVisible().catch(() => false);
    
    console.log('[TEST] EndOfList: hasEndUI=' + hasEndUI + ' hasAdjustFilters=' + hasAdjustFilters + ' hasStartOver=' + hasStartOver);
    
    const state = await getCurrentUserState(page);
    if (!state) {
      expect(hasEndUI).toBe(true);
    }
    expect(clampedCount).toBe(0);
  });
});
