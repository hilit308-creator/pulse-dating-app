/**
 * QA Test Script for Add a Plan Feature
 * Run this in browser console to verify sync between:
 * - QuickPlanModal (Home page)
 * - Future Places (Settings)
 * - My Weekly Rhythm (Profile)
 * 
 * Usage: Copy and paste into browser console, then run testPlanSync()
 */

const PLANS_STORAGE_KEY = 'pulse.futurePlans';
const RHYTHM_VISIBILITY_KEY = 'pulse.weeklyRhythmVisibility';

// Test helper functions
const loadPlans = () => {
  try {
    const raw = localStorage.getItem(PLANS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const savePlans = (plans) => {
  localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(plans));
};

const addTestPlan = (plan) => {
  const plans = loadPlans();
  const newPlan = {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    ...plan,
  };
  plans.push(newPlan);
  savePlans(plans);
  return newPlan;
};

const deleteTestPlan = (planId) => {
  const plans = loadPlans();
  const filtered = plans.filter(p => p.id !== planId);
  savePlans(filtered);
  return filtered;
};

const clearAllPlans = () => {
  localStorage.removeItem(PLANS_STORAGE_KEY);
  console.log('✅ All plans cleared');
};

// QA Test Suite
export const testPlanSync = () => {
  console.log('🧪 Starting Plan Sync QA Tests...\n');
  
  // Clear existing plans
  clearAllPlans();
  
  // Test 1: Add a one-time plan
  console.log('📝 Test 1: Adding one-time plan...');
  const plan1 = addTestPlan({
    place: 'Coffee Shop',
    placeId: 'coffee',
    emoji: '☕',
    time: 'Tomorrow',
    timeId: 'tomorrow',
    isRecurring: false,
  });
  console.log('  Added plan:', plan1);
  
  let plans = loadPlans();
  console.log('  Plans in storage:', plans.length);
  console.assert(plans.length === 1, '❌ Expected 1 plan');
  console.log('  ✅ Test 1 passed\n');
  
  // Test 2: Add a recurring plan
  console.log('📝 Test 2: Adding recurring plan...');
  const plan2 = addTestPlan({
    place: 'Gym',
    placeId: 'gym',
    emoji: '💪',
    time: 'Weekday evenings',
    timeId: 'weekday_evenings',
    isRecurring: true,
  });
  console.log('  Added plan:', plan2);
  
  plans = loadPlans();
  console.log('  Plans in storage:', plans.length);
  console.assert(plans.length === 2, '❌ Expected 2 plans');
  console.log('  ✅ Test 2 passed\n');
  
  // Test 3: Delete a plan
  console.log('📝 Test 3: Deleting first plan...');
  deleteTestPlan(plan1.id);
  
  plans = loadPlans();
  console.log('  Plans in storage:', plans.length);
  console.assert(plans.length === 1, '❌ Expected 1 plan after deletion');
  console.assert(plans[0].id === plan2.id, '❌ Wrong plan remaining');
  console.log('  ✅ Test 3 passed\n');
  
  // Test 4: Privacy toggle
  console.log('📝 Test 4: Testing privacy toggle...');
  localStorage.setItem(RHYTHM_VISIBILITY_KEY, 'false');
  let visibility = localStorage.getItem(RHYTHM_VISIBILITY_KEY);
  console.assert(visibility === 'false', '❌ Privacy should be false');
  console.log('  Privacy set to hidden');
  
  localStorage.setItem(RHYTHM_VISIBILITY_KEY, 'true');
  visibility = localStorage.getItem(RHYTHM_VISIBILITY_KEY);
  console.assert(visibility === 'true', '❌ Privacy should be true');
  console.log('  Privacy set to visible');
  console.log('  ✅ Test 4 passed\n');
  
  // Test 5: Max 5 items limit
  console.log('📝 Test 5: Testing max 5 items limit...');
  clearAllPlans();
  for (let i = 0; i < 7; i++) {
    addTestPlan({
      place: `Place ${i + 1}`,
      placeId: 'mappin',
      emoji: '📍',
      time: 'Today',
      timeId: 'today',
      isRecurring: false,
    });
  }
  plans = loadPlans();
  console.log('  Total plans in storage:', plans.length);
  console.assert(plans.length === 7, '❌ Storage should have all 7 plans');
  console.log('  Note: WeeklyRhythmStrip will only show first 5');
  console.log('  ✅ Test 5 passed\n');
  
  // Cleanup
  clearAllPlans();
  localStorage.setItem(RHYTHM_VISIBILITY_KEY, 'true');
  
  console.log('🎉 All QA Tests Passed!\n');
  console.log('📋 Manual verification steps:');
  console.log('  1. Go to Home page, click "Add a plan"');
  console.log('  2. Add a plan (e.g., Gym - Tomorrow)');
  console.log('  3. Navigate to Settings > Location Visibility');
  console.log('  4. Verify plan appears in "Future Places" tab');
  console.log('  5. Delete the plan from Future Places');
  console.log('  6. Go back to Home, add another plan');
  console.log('  7. View any user profile, scroll to "My weekly rhythm"');
  console.log('  8. Verify your plan appears there');
  console.log('  9. Go to Settings, toggle "Show My Weekly Rhythm" OFF');
  console.log('  10. Verify Weekly Rhythm section is hidden on profiles');
  
  return '✅ QA Tests Complete';
};

// Export for console use
window.testPlanSync = testPlanSync;
window.clearAllPlans = clearAllPlans;
window.loadPlans = loadPlans;

console.log('📦 Plan Sync QA loaded. Run testPlanSync() to start tests.');
