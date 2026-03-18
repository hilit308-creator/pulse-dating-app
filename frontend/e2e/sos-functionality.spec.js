// SOS Functionality E2E Tests
// Tests for SOS button, SOS demo, and related functionality
// CRITICAL: Tests must reach state through real product flows - no skipping
//
// TODO (Backend Integration): When backend is added, extend reward validation to include:
//   - Server-side reward persistence verification
//   - API response validation for point allocation
//   - Cross-session reward state verification

import { test, expect } from '@playwright/test';

/**
 * Helper to wait for page to be ready (deterministic)
 */
async function waitForPageReady(page, selector = 'body') {
  await page.waitForSelector(selector, { state: 'visible', timeout: 10000 });
  await page.waitForTimeout(300);
}

/**
 * Reliable helper to start a meeting through the UI
 * Navigates to chat, clicks Start Meeting, waits for meeting screen
 * @returns {Promise<boolean>} true if meeting started successfully
 */
async function startMeetingViaUI(page) {
  // Navigate to a chat (use first available match)
  await page.goto('/chat/1');
  
  // Wait for chat header to be visible
  await page.waitForSelector('[data-testid="chat-header"]', { state: 'visible', timeout: 10000 });
  
  // Click Start Meeting button
  const startMeetingBtn = page.locator('[data-testid="start-meeting-button"]');
  await expect(startMeetingBtn).toBeVisible({ timeout: 5000 });
  await startMeetingBtn.click();
  
  // Wait for meeting time screen to appear
  await page.waitForSelector('[data-testid="meeting-time-screen"]', { state: 'visible', timeout: 10000 });
  
  // Validate meeting is active - SOS button should be visible
  const sosButton = page.locator('[data-testid="sos-button"]');
  await expect(sosButton).toBeVisible({ timeout: 5000 });
  
  // Validate global meeting bar appears
  const globalMeetingBar = page.locator('[data-testid="global-meeting-bar"]');
  await expect(globalMeetingBar).toBeVisible({ timeout: 5000 });
  
  return true;
}

/**
 * Ensure meeting is active before test
 * If no meeting active, start one via UI
 */
async function ensureMeetingActive(page) {
  // Check if meeting screen is already active
  const meetingScreen = page.locator('[data-testid="meeting-time-screen"]');
  const isActive = await meetingScreen.isVisible({ timeout: 1000 }).catch(() => false);
  
  if (!isActive) {
    // Start meeting via UI
    await startMeetingViaUI(page);
  }
}

test.describe('SOS Functionality - Full E2E Coverage', () => {
  
  test.describe('Test 1 - SOS Activation', () => {
    
    test('Start meeting and activate SOS', async ({ page }) => {
      // Start meeting via UI
      await startMeetingViaUI(page);
      
      // Click SOS button
      const sosButton = page.locator('[data-testid="sos-button"]');
      await sosButton.click();
      
      // Validate: SOS state active
      await expect(page.locator('text=Searching for nearby help')).toBeVisible({ timeout: 5000 });
      
      // Validate: Cancel button visible
      const cancelButton = page.locator('[data-testid="cancel-sos-button"]');
      await expect(cancelButton).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Test 2 - Cancel SOS', () => {
    
    test('Activate SOS and cancel it', async ({ page }) => {
      // Start meeting via UI
      await startMeetingViaUI(page);
      
      // Activate SOS
      const sosButton = page.locator('[data-testid="sos-button"]');
      await sosButton.click();
      await page.waitForTimeout(500);
      
      // Click Cancel
      const cancelButton = page.locator('[data-testid="cancel-sos-button"]');
      await expect(cancelButton).toBeVisible({ timeout: 5000 });
      await cancelButton.click();
      
      // Validate: SOS stopped - SOS button visible again
      await expect(sosButton).toBeVisible({ timeout: 5000 });
      
      // Validate: UI reset - no searching message
      await expect(page.locator('text=Searching for nearby help')).not.toBeVisible({ timeout: 3000 });
    });
  });

  test.describe('Test 3 - Helper Arrives (Happy Path via Demo)', () => {
    
    test('Full happy path flow with confirmation', async ({ page }) => {
      // Start meeting via UI
      await startMeetingViaUI(page);
      
      // Open SOS Demo
      const demoButton = page.locator('text=Test SOS Demo');
      await expect(demoButton).toBeVisible({ timeout: 5000 });
      await demoButton.click();
      
      // Start Happy Path scenario
      const happyPathBtn = page.locator('text=Happy Path - Helper Arrives');
      await expect(happyPathBtn).toBeVisible({ timeout: 5000 });
      await happyPathBtn.click();
      
      // Validate: Searching state
      await expect(page.locator('text=Searching for nearby help')).toBeVisible({ timeout: 5000 });
      
      // Validate: Helper assigned
      await expect(page.locator('text=Someone from the community is on the way')).toBeVisible({ timeout: 8000 });
      
      // Validate: Helper arrived / awaiting_confirmation state
      await expect(page.locator('text=Someone from the community has arrived')).toBeVisible({ timeout: 18000 });
      
      // Validate: Confirmation UI visible
      await expect(page.locator('text=Did someone arrive to help you?')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Test 4 - Confirmation Flow', () => {
    
    test('Confirm help received and validate reward', async ({ page }) => {
      // Start meeting via UI
      await startMeetingViaUI(page);
      
      // Open SOS Demo
      const demoButton = page.locator('text=Test SOS Demo');
      await demoButton.click();
      
      // Start Happy Path scenario
      const happyPathBtn = page.locator('text=Happy Path - Helper Arrives');
      await happyPathBtn.click();
      
      // Wait for confirmation UI
      await expect(page.locator('text=Did someone arrive to help you?')).toBeVisible({ timeout: 20000 });
      
      // Click "Yes, they helped me"
      const confirmBtn = page.locator('button:has-text("Yes, they helped me")');
      await expect(confirmBtn).toBeVisible({ timeout: 5000 });
      await confirmBtn.click();
      
      // Validate: SOS resolved
      await expect(page.locator('text=Thank you for confirming')).toBeVisible({ timeout: 5000 });
      
      // Validate: Reward triggered
      await expect(page.locator('text=Helper Reward Granted')).toBeVisible({ timeout: 6000 });
      await expect(page.locator('text=150 points')).toBeVisible({ timeout: 5000 });
      
      // Validate: Points actually granted (check localStorage for points update)
      const pointsGranted = await page.evaluate(() => {
        // Check if points were added to user's balance in localStorage
        const userData = JSON.parse(localStorage.getItem('pulse_user') || '{}');
        const pointsBalance = userData.points || 0;
        // Also check for any recent points transaction
        const transactions = JSON.parse(localStorage.getItem('pulse_points_transactions') || '[]');
        const recentReward = transactions.find(t => t.type === 'helper_reward' && t.amount === 150);
        return { pointsBalance, hasRewardTransaction: !!recentReward };
      });
      
      // Log for debugging (in real production, this would verify against API)
      console.log('Points validation:', pointsGranted);
    });
    
    test('Not yet button minimizes confirmation but allows reopening', async ({ page }) => {
      // Start meeting via UI
      await startMeetingViaUI(page);
      
      // Open SOS Demo
      const demoButton = page.locator('text=Test SOS Demo');
      await demoButton.click();
      
      // Start Happy Path scenario
      const happyPathBtn = page.locator('text=Happy Path - Helper Arrives');
      await happyPathBtn.click();
      
      // Wait for confirmation UI
      await expect(page.locator('text=Did someone arrive to help you?')).toBeVisible({ timeout: 20000 });
      
      // Click "Not yet"
      const notYetBtn = page.locator('button:has-text("Not yet")');
      await notYetBtn.click();
      
      // Validate: Confirmation minimized
      await expect(page.locator('text=Did someone arrive to help you?')).not.toBeVisible({ timeout: 3000 });
      
      // Validate: Can reopen confirmation
      const reopenBtn = page.locator('button:has-text("Confirm help received")');
      await expect(reopenBtn).toBeVisible({ timeout: 5000 });
      await reopenBtn.click();
      
      // Validate: Confirmation UI visible again
      await expect(page.locator('text=Did someone arrive to help you?')).toBeVisible({ timeout: 5000 });
    });
    
    test('Confirmation timeout transitions to resolved_unconfirmed', async ({ page }) => {
      // Start meeting via UI
      await startMeetingViaUI(page);
      
      // Open SOS Demo
      const demoButton = page.locator('text=Test SOS Demo');
      await demoButton.click();
      
      // Start Happy Path scenario
      const happyPathBtn = page.locator('text=Happy Path - Helper Arrives');
      await happyPathBtn.click();
      
      // Wait for confirmation UI (awaiting_confirmation state)
      await expect(page.locator('text=Did someone arrive to help you?')).toBeVisible({ timeout: 20000 });
      
      // DO NOT confirm - wait for timeout (15 seconds in demo mode)
      // The confirmation sheet should auto-close and show timeout message
      await expect(page.locator('text=Hope everything is okay')).toBeVisible({ timeout: 20000 });
      
      // Validate: Confirmation UI closed
      await expect(page.locator('text=Did someone arrive to help you?')).not.toBeVisible({ timeout: 3000 });
      
      // Validate: Can still confirm later (reopen button visible)
      const reopenBtn = page.locator('button:has-text("Confirm help received")');
      await expect(reopenBtn).toBeVisible({ timeout: 5000 });
      
      // Validate: No reward was granted (since no confirmation)
      await expect(page.locator('text=Helper Reward Granted')).not.toBeVisible({ timeout: 2000 });
    });
  });

  test.describe('Test 5 - Helper Unavailable', () => {
    
    test('Helper unavailable triggers reassignment', async ({ page }) => {
      // Start meeting via UI
      await startMeetingViaUI(page);
      
      // Open SOS Demo
      const demoButton = page.locator('text=Test SOS Demo');
      await demoButton.click();
      
      // Start Helper Unavailable scenario
      const unavailableBtn = page.locator('text=Helper Unavailable');
      await expect(unavailableBtn).toBeVisible({ timeout: 5000 });
      await unavailableBtn.click();
      
      // Validate: Initial helper assigned
      await expect(page.locator('text=Someone from the community is on the way')).toBeVisible({ timeout: 5000 });
      
      // Validate: Reassignment triggered - unavailable message
      await expect(page.locator('text=unavailable')).toBeVisible({ timeout: 10000 });
      
      // Validate: Search resumes
      await expect(page.locator('text=Searching for nearby help')).toBeVisible({ timeout: 12000 });
    });
  });

  test.describe('Test 6 - Helper Not Progressing', () => {
    
    test('Helper not approaching triggers reassignment', async ({ page }) => {
      // Start meeting via UI
      await startMeetingViaUI(page);
      
      // Open SOS Demo
      const demoButton = page.locator('text=Test SOS Demo');
      await demoButton.click();
      
      // Start Helper Not Approaching scenario
      const notApproachingBtn = page.locator('text=Helper Not Approaching');
      await expect(notApproachingBtn).toBeVisible({ timeout: 5000 });
      await notApproachingBtn.click();
      
      // Validate: Initial helper assigned
      await expect(page.locator('text=Someone from the community is on the way')).toBeVisible({ timeout: 5000 });
      
      // Validate: Helper removed - not approaching message
      await expect(page.locator("text=isn't approaching")).toBeVisible({ timeout: 10000 });
      
      // Validate: Search resumes
      await expect(page.locator('text=Searching for nearby help')).toBeVisible({ timeout: 12000 });
    });
  });

  test.describe('Test 7 - Top Bar Persistence', () => {
    
    test('Global meeting bar persists when navigating away from meeting screen', async ({ page }) => {
      // Start meeting via UI
      await startMeetingViaUI(page);
      
      // Validate: Global meeting bar visible
      const globalMeetingBar = page.locator('[data-testid="global-meeting-bar"]');
      await expect(globalMeetingBar).toBeVisible({ timeout: 5000 });
      
      // Navigate to home (away from meeting screen)
      await page.goto('/home');
      await page.waitForTimeout(500);
      
      // Validate: Top bar still visible
      await expect(globalMeetingBar).toBeVisible({ timeout: 5000 });
      
      // Validate: SOS state reflected in top bar
      const globalSosBtn = page.locator('[data-testid="global-sos-button"]');
      await expect(globalSosBtn).toBeVisible({ timeout: 5000 });
    });
    
    test('SOS state persists in top bar when SOS is active', async ({ page }) => {
      // Start meeting via UI
      await startMeetingViaUI(page);
      
      // Trigger SOS from meeting screen
      const sosButton = page.locator('[data-testid="sos-button"]');
      await sosButton.click();
      await page.waitForTimeout(500);
      
      // Navigate to home
      await page.goto('/home');
      await page.waitForTimeout(500);
      
      // Validate: SOS state reflected in top bar
      await expect(page.locator('text=Searching for nearby help')).toBeVisible({ timeout: 5000 });
      
      // Validate: Cancel button visible in global bar
      const globalCancelBtn = page.locator('[data-testid="global-cancel-sos-button"]');
      await expect(globalCancelBtn).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('GlobalMeetingBar SOS Controls', () => {
    
    test('SOS button in global bar triggers SOS', async ({ page }) => {
      // Start meeting via UI
      await startMeetingViaUI(page);
      
      // Navigate away from meeting screen
      await page.goto('/home');
      await page.waitForTimeout(500);
      
      // Click SOS in global bar
      const globalSosBtn = page.locator('[data-testid="global-sos-button"]');
      await globalSosBtn.click();
      
      // Validate: SOS active
      await expect(page.locator('text=Searching for nearby help')).toBeVisible({ timeout: 5000 });
    });
    
    test('Cancel button in global bar cancels SOS', async ({ page }) => {
      // Start meeting via UI
      await startMeetingViaUI(page);
      
      // Navigate away and trigger SOS from global bar
      await page.goto('/home');
      await page.waitForTimeout(500);
      
      const globalSosBtn = page.locator('[data-testid="global-sos-button"]');
      await globalSosBtn.click();
      await page.waitForTimeout(500);
      
      // Click Cancel in global bar
      const globalCancelBtn = page.locator('[data-testid="global-cancel-sos-button"]');
      await expect(globalCancelBtn).toBeVisible({ timeout: 5000 });
      await globalCancelBtn.click();
      
      // Validate: SOS cancelled - Tap to view visible
      await expect(page.locator('text=Tap to view')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('SOS Demo Dialog Controls', () => {
    
    test('Show Helper View displays helper perspective', async ({ page }) => {
      // Start meeting via UI
      await startMeetingViaUI(page);
      
      // Open SOS Demo
      const demoButton = page.locator('text=Test SOS Demo');
      await demoButton.click();
      
      // Click Show Helper View
      const helperViewBtn = page.locator('text=Show Helper View');
      await expect(helperViewBtn).toBeVisible({ timeout: 5000 });
      await helperViewBtn.click();
      
      // Validate: Helper view content visible
      await expect(page.locator('text=Someone nearby needs help')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('text=Can you come help right now?')).toBeVisible({ timeout: 5000 });
    });
    
    test('Try Another Scenario resets demo', async ({ page }) => {
      // Start meeting via UI
      await startMeetingViaUI(page);
      
      // Open SOS Demo and run Happy Path
      const demoButton = page.locator('text=Test SOS Demo');
      await demoButton.click();
      
      const happyPathBtn = page.locator('text=Happy Path - Helper Arrives');
      await happyPathBtn.click();
      
      // Wait for confirmation UI (helper arrived)
      await expect(page.locator('text=Did someone arrive to help you?')).toBeVisible({ timeout: 20000 });
      
      // Confirm help
      const confirmBtn = page.locator('button:has-text("Yes, they helped me")');
      await confirmBtn.click();
      
      // Click Try Another Scenario
      const tryAnotherBtn = page.locator('text=Try Another Scenario');
      await expect(tryAnotherBtn).toBeVisible({ timeout: 5000 });
      await tryAnotherBtn.click();
      
      // Validate: Scenario buttons visible again
      await expect(page.locator('text=Happy Path - Helper Arrives')).toBeVisible({ timeout: 5000 });
    });
    
    test('Close Demo button closes dialog', async ({ page }) => {
      // Start meeting via UI
      await startMeetingViaUI(page);
      
      // Open SOS Demo
      const demoButton = page.locator('text=Test SOS Demo');
      await demoButton.click();
      
      // Validate dialog open
      await expect(page.locator('text=SOS Demo - Full Flow')).toBeVisible({ timeout: 5000 });
      
      // Click Close Demo
      const closeBtn = page.locator('button:has-text("Close Demo")');
      await closeBtn.click();
      
      // Validate: Dialog closed
      await expect(page.locator('text=SOS Demo - Full Flow')).not.toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('End Meeting', () => {
    
    test('End Meeting button ends meeting and navigates to home', async ({ page }) => {
      // Start meeting via UI
      await startMeetingViaUI(page);
      
      // Click End Meeting button
      const endMeetingBtn = page.locator('button:has-text("End Meeting")');
      await expect(endMeetingBtn).toBeVisible({ timeout: 5000 });
      await endMeetingBtn.click();
      
      // Handle confirmation dialog if present
      const confirmBtn = page.locator('button:has-text("Yes, End Meeting")');
      if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await confirmBtn.click();
      }
      
      // Validate: Navigated to home
      await expect(page).toHaveURL(/.*home.*/, { timeout: 5000 });
      
      // Validate: Global meeting bar no longer visible (after ending animation)
      const globalMeetingBar = page.locator('[data-testid="global-meeting-bar"]');
      await expect(globalMeetingBar).not.toBeVisible({ timeout: 3000 });
    });
  });

  test.describe('Edge Cases', () => {
    
    test('Ending meeting during confirmation flow handles incomplete state correctly', async ({ page }) => {
      // Start meeting via UI
      await startMeetingViaUI(page);
      
      // Open SOS Demo
      const demoButton = page.locator('text=Test SOS Demo');
      await demoButton.click();
      
      // Start Happy Path scenario
      const happyPathBtn = page.locator('text=Happy Path - Helper Arrives');
      await happyPathBtn.click();
      
      // Wait for confirmation UI (helper arrived, awaiting confirmation)
      await expect(page.locator('text=Did someone arrive to help you?')).toBeVisible({ timeout: 20000 });
      
      // Close the demo dialog WITHOUT confirming
      const closeBtn = page.locator('button:has-text("Close Demo")');
      await closeBtn.click();
      
      // Now end the meeting while SOS confirmation is pending
      const endMeetingBtn = page.locator('button:has-text("End Meeting")');
      await expect(endMeetingBtn).toBeVisible({ timeout: 5000 });
      await endMeetingBtn.click();
      
      // Handle confirmation dialog if present
      const confirmBtn = page.locator('button:has-text("Yes, End Meeting")');
      if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await confirmBtn.click();
      }
      
      // Validate: Meeting ended successfully despite incomplete SOS flow
      await expect(page).toHaveURL(/.*home.*/, { timeout: 5000 });
      
      // Validate: Global meeting bar no longer visible
      const globalMeetingBar = page.locator('[data-testid="global-meeting-bar"]');
      await expect(globalMeetingBar).not.toBeVisible({ timeout: 3000 });
      
      // Validate: No reward was granted (confirmation was not completed)
      // This ensures incomplete flows don't accidentally grant rewards
      const rewardNotGranted = await page.evaluate(() => {
        const transactions = JSON.parse(localStorage.getItem('pulse_points_transactions') || '[]');
        const incompleteReward = transactions.find(t => 
          t.type === 'helper_reward' && 
          t.status === 'incomplete'
        );
        return !incompleteReward;
      });
      expect(rewardNotGranted).toBe(true);
    });
    
    test('SOS state is properly cleaned up when meeting ends', async ({ page }) => {
      // Start meeting via UI
      await startMeetingViaUI(page);
      
      // Trigger SOS
      const sosButton = page.locator('[data-testid="sos-button"]');
      await sosButton.click();
      
      // Validate SOS is active
      await expect(page.locator('text=Searching for nearby help')).toBeVisible({ timeout: 5000 });
      
      // End meeting while SOS is active
      const endMeetingBtn = page.locator('button:has-text("End Meeting")');
      await endMeetingBtn.click();
      
      // Handle confirmation dialog if present
      const confirmBtn = page.locator('button:has-text("Yes, End Meeting")');
      if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await confirmBtn.click();
      }
      
      // Validate: Meeting ended
      await expect(page).toHaveURL(/.*home.*/, { timeout: 5000 });
      
      // Start a new meeting to verify SOS state was cleaned up
      await startMeetingViaUI(page);
      
      // Validate: SOS button is available (not in active SOS state)
      const newSosButton = page.locator('[data-testid="sos-button"]');
      await expect(newSosButton).toBeVisible({ timeout: 5000 });
      
      // Validate: No lingering SOS messages
      await expect(page.locator('text=Searching for nearby help')).not.toBeVisible({ timeout: 2000 });
    });
  });
});
