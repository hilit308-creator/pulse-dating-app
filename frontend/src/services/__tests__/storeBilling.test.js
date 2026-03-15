/**
 * Unit Tests for Store Billing Service
 * 
 * Tests the storeBilling service for:
 * - Platform detection (iOS, Android, Web)
 * - Product catalog structure
 * - Purchase flow
 * - Points management
 * - Subscription management
 */

import { storeBilling, PRODUCTS, PurchaseStatus, purchaseEvents } from '../storeBilling';

describe('Store Billing Service', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Reset any mocked window objects
    delete window.webkit;
    delete window.Android;
  });

  describe('Product Catalog', () => {
    test('PRODUCTS contains points packages', () => {
      expect(PRODUCTS.points).toBeDefined();
      expect(PRODUCTS.points.small).toBeDefined();
      expect(PRODUCTS.points.medium).toBeDefined();
      expect(PRODUCTS.points.large).toBeDefined();
    });

    test('Points packages have correct structure', () => {
      const smallPackage = PRODUCTS.points.small;
      expect(smallPackage.id).toBe('pulse_points_100');
      expect(smallPackage.points).toBe(100);
      expect(smallPackage.price).toBe(9.90);
      expect(smallPackage.currency).toBe('₪');
      expect(smallPackage.type).toBe('consumable');
    });

    test('PRODUCTS contains Plus subscription tiers', () => {
      expect(PRODUCTS.plus).toBeDefined();
      expect(PRODUCTS.plus.hourly).toBeDefined();
      expect(PRODUCTS.plus.monthly).toBeDefined();
      expect(PRODUCTS.plus.quarterly).toBeDefined();
    });

    test('PRODUCTS contains Pro subscription tiers', () => {
      expect(PRODUCTS.pro).toBeDefined();
      expect(PRODUCTS.pro.weekly).toBeDefined();
      expect(PRODUCTS.pro.monthly).toBeDefined();
      expect(PRODUCTS.pro.quarterly).toBeDefined();
      expect(PRODUCTS.pro.biannual).toBeDefined();
    });

    test('Plus subscriptions have correct structure', () => {
      const monthly = PRODUCTS.plus.monthly;
      expect(monthly.id).toBe('pulse_premium_monthly');
      expect(monthly.duration).toBe('Monthly');
      expect(monthly.price).toBe(29);
      expect(monthly.currency).toBe('₪');
      expect(monthly.type).toBe('auto_renewable');
    });

    test('Pro subscriptions have correct structure', () => {
      const monthly = PRODUCTS.pro.monthly;
      expect(monthly.id).toBe('pulse_pro_monthly');
      expect(monthly.duration).toBe('Monthly');
      expect(monthly.price).toBe(49);
      expect(monthly.currency).toBe('₪');
      expect(monthly.type).toBe('auto_renewable');
    });
  });

  describe('Platform Detection', () => {
    test('Detects web platform by default', () => {
      const platform = storeBilling.getPlatform();
      expect(platform).toBe('web');
    });

    test('Detects iOS platform when webkit is available', () => {
      window.webkit = {
        messageHandlers: {
          inAppPurchase: { postMessage: jest.fn() }
        }
      };
      
      // Need to reinitialize to detect platform
      const newBilling = new storeBilling.constructor();
      expect(newBilling.getPlatform()).toBe('ios');
    });

    test('Detects Android platform when Android bridge is available', () => {
      window.Android = {
        purchaseProduct: jest.fn()
      };
      
      const newBilling = new storeBilling.constructor();
      expect(newBilling.getPlatform()).toBe('android');
    });
  });

  describe('Points Management', () => {
    test('getPointsBalance returns 0 initially', () => {
      const balance = storeBilling.getPointsBalance();
      expect(balance).toBe(0);
    });

    test('addPoints increases balance correctly', () => {
      const newBalance = storeBilling.addPoints(100);
      expect(newBalance).toBe(100);
      
      const finalBalance = storeBilling.addPoints(50);
      expect(finalBalance).toBe(150);
    });

    test('spendPoints decreases balance correctly', () => {
      storeBilling.addPoints(100);
      const result = storeBilling.spendPoints(40);
      expect(result).toBe(true);
      expect(storeBilling.getPointsBalance()).toBe(60);
    });

    test('spendPoints fails when insufficient balance', () => {
      storeBilling.addPoints(30);
      const result = storeBilling.spendPoints(50);
      expect(result).toBe(false);
      expect(storeBilling.getPointsBalance()).toBe(30); // Unchanged
    });

    test('Points balance persists in localStorage', () => {
      storeBilling.addPoints(200);
      
      // Check localStorage directly
      const stored = localStorage.getItem('pulse_points_balance');
      expect(stored).toBe('200');
    });
  });

  describe('Subscription Management', () => {
    test('getSubscription returns null initially', () => {
      const subscription = storeBilling.getSubscription();
      expect(subscription).toBeNull();
    });

    test('saveSubscription stores subscription data', () => {
      const subData = {
        productId: 'pulse_premium_monthly',
        type: 'plus',
        duration: 'Monthly',
        purchasedAt: new Date().toISOString()
      };
      
      storeBilling.saveSubscription(subData);
      const retrieved = storeBilling.getSubscription();
      
      expect(retrieved.productId).toBe('pulse_premium_monthly');
      expect(retrieved.type).toBe('plus');
    });

    test('hasActiveSubscription returns false initially', () => {
      expect(storeBilling.hasActiveSubscription()).toBe(false);
    });

    test('hasActiveSubscription returns true after saving subscription', () => {
      storeBilling.saveSubscription({
        productId: 'pulse_pro_monthly',
        type: 'pro',
        purchasedAt: new Date().toISOString()
      });
      
      expect(storeBilling.hasActiveSubscription()).toBe(true);
    });

    test('clearSubscription removes subscription', () => {
      storeBilling.saveSubscription({
        productId: 'pulse_premium_monthly',
        type: 'plus'
      });
      
      storeBilling.clearSubscription();
      expect(storeBilling.getSubscription()).toBeNull();
      expect(storeBilling.hasActiveSubscription()).toBe(false);
    });
  });

  describe('Purchase Flow (Web Mock)', () => {
    test('purchase returns success for valid product', async () => {
      const result = await storeBilling.purchase('pulse_points_100');
      
      expect(result.success).toBe(true);
      expect(result.productId).toBe('pulse_points_100');
      expect(result.transactionId).toBeDefined();
      expect(result.status).toBe(PurchaseStatus.SUCCESS);
    });

    test('purchase completes within expected time', async () => {
      const startTime = Date.now();
      await storeBilling.purchase('pulse_points_250');
      const elapsed = Date.now() - startTime;
      
      // Mock purchase should take ~1500ms
      expect(elapsed).toBeGreaterThanOrEqual(1400);
      expect(elapsed).toBeLessThan(3000);
    });
  });

  describe('Purchase Events', () => {
    test('purchaseEvents emits purchaseResult on success', async () => {
      const mockCallback = jest.fn();
      const cleanup = purchaseEvents.on('purchaseResult', mockCallback);
      
      await storeBilling.purchase('pulse_points_100');
      
      expect(mockCallback).toHaveBeenCalled();
      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          productId: 'pulse_points_100'
        })
      );
      
      cleanup();
    });
  });

  describe('PurchaseStatus Enum', () => {
    test('PurchaseStatus has expected values', () => {
      expect(PurchaseStatus.PENDING).toBe('pending');
      expect(PurchaseStatus.SUCCESS).toBe('success');
      expect(PurchaseStatus.FAILED).toBe('failed');
      expect(PurchaseStatus.CANCELLED).toBe('cancelled');
    });
  });
});

describe('iOS Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('iOS purchase calls StoreKit via webkit messageHandler', async () => {
    const mockPostMessage = jest.fn();
    window.webkit = {
      messageHandlers: {
        inAppPurchase: { postMessage: mockPostMessage }
      }
    };
    
    // Create new instance to detect iOS
    const iosBilling = new storeBilling.constructor();
    
    // Start purchase (will timeout since no native response)
    const purchasePromise = iosBilling.purchase('pulse_points_100');
    
    // Verify StoreKit was called
    expect(mockPostMessage).toHaveBeenCalledWith({
      action: 'purchase',
      productId: 'pulse_points_100'
    });
    
    // Clean up - simulate native callback to resolve promise
    iosBilling.handlePurchaseResult({
      success: true,
      productId: 'pulse_points_100',
      transactionId: 'ios_test_123'
    });
    
    const result = await purchasePromise;
    expect(result.success).toBe(true);
  });
});

describe('Android Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('Android purchase calls Google Play Billing via Android bridge', async () => {
    const mockPurchaseProduct = jest.fn();
    window.Android = {
      purchaseProduct: mockPurchaseProduct
    };
    
    // Create new instance to detect Android
    const androidBilling = new storeBilling.constructor();
    
    // Start purchase
    const purchasePromise = androidBilling.purchase('pulse_points_100');
    
    // Verify Google Play Billing was called
    expect(mockPurchaseProduct).toHaveBeenCalledWith('pulse_points_100');
    
    // Simulate native callback
    androidBilling.handlePurchaseResult({
      success: true,
      productId: 'pulse_points_100',
      transactionId: 'android_test_456'
    });
    
    const result = await purchasePromise;
    expect(result.success).toBe(true);
  });
});
