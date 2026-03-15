/**
 * useStoreBilling Hook
 * 
 * React hook for integrating store billing into components.
 * Provides easy access to purchase, restore, and subscription status.
 * 
 * Usage:
 *   const { 
 *     purchase, 
 *     restorePurchases, 
 *     purchasing, 
 *     subscription,
 *     pointsBalance,
 *     platform 
 *   } = useStoreBilling();
 */

import { useState, useEffect, useCallback } from 'react';
import { storeBilling, PRODUCTS, PurchaseStatus, StoreBillingEvents } from '../services/storeBilling';

export function useStoreBilling() {
  const [initialized, setInitialized] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [pointsBalance, setPointsBalance] = useState(0);
  const [lastError, setLastError] = useState(null);
  const [lastPurchase, setLastPurchase] = useState(null);

  // Initialize billing service on mount
  useEffect(() => {
    const init = async () => {
      await storeBilling.initialize();
      setInitialized(true);
      
      // Load initial state
      const activeSub = await storeBilling.getActiveSubscription();
      setSubscription(activeSub);
      setPointsBalance(storeBilling.getPointsBalance());
    };
    
    init();
  }, []);

  // Subscribe to purchase events
  useEffect(() => {
    const unsubscribe = storeBilling.on(StoreBillingEvents.PURCHASE_RESULT, (result) => {
      setLastPurchase(result);
      
      if (result.status === PurchaseStatus.SUCCESS) {
        // Refresh points balance after purchase
        setPointsBalance(storeBilling.getPointsBalance());
      }
    });
    
    return unsubscribe;
  }, []);

  /**
   * Purchase a product by ID
   * @param {string} productId - Product ID to purchase
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Purchase result
   */
  const purchase = useCallback(async (productId, options = {}) => {
    if (purchasing) {
      return { success: false, error: 'Purchase already in progress' };
    }
    
    setPurchasing(true);
    setLastError(null);
    
    try {
      const result = await storeBilling.purchase(productId);
      
      if (result.success) {
        // Handle successful purchase based on product type
        const product = findProductById(productId);
        
        if (product) {
          if (product.type === 'consumable') {
            // Points purchase - add to balance
            const newBalance = storeBilling.addPoints(product.points);
            setPointsBalance(newBalance);
          } else {
            // Subscription purchase - save subscription
            const subscriptionData = {
              productId,
              type: options.planType || 'plus',
              duration: product.duration,
              purchasedAt: new Date().toISOString(),
              transactionId: result.transactionId,
              expiresAt: calculateExpiryDate(product),
            };
            storeBilling.saveSubscription(subscriptionData);
            setSubscription(subscriptionData);
          }
        }
      }
      
      return result;
    } catch (error) {
      const errorResult = {
        success: false,
        productId,
        status: error.status || PurchaseStatus.FAILED,
        error: error.error || error.message || 'Purchase failed',
      };
      setLastError(errorResult);
      return errorResult;
    } finally {
      setPurchasing(false);
    }
  }, [purchasing]);

  /**
   * Purchase points package
   * @param {'small' | 'medium' | 'large'} packageSize - Package size
   */
  const purchasePoints = useCallback(async (packageSize) => {
    const product = PRODUCTS.points[packageSize];
    if (!product) {
      return { success: false, error: 'Invalid package size' };
    }
    return purchase(product.id, { type: 'points' });
  }, [purchase]);

  /**
   * Purchase Plus subscription
   * @param {'hourly' | 'monthly' | 'quarterly'} duration - Subscription duration
   */
  const purchasePlus = useCallback(async (duration) => {
    const product = PRODUCTS.plus[duration];
    if (!product) {
      return { success: false, error: 'Invalid duration' };
    }
    return purchase(product.id, { planType: 'plus' });
  }, [purchase]);

  /**
   * Purchase Pro subscription
   * @param {'weekly' | 'monthly' | 'quarterly' | 'biannual'} duration - Subscription duration
   */
  const purchasePro = useCallback(async (duration) => {
    const product = PRODUCTS.pro[duration];
    if (!product) {
      return { success: false, error: 'Invalid duration' };
    }
    return purchase(product.id, { planType: 'pro' });
  }, [purchase]);

  /**
   * Restore previous purchases
   */
  const restorePurchases = useCallback(async () => {
    if (restoring) {
      return { success: false, error: 'Restore already in progress' };
    }
    
    setRestoring(true);
    setLastError(null);
    
    try {
      const purchases = await storeBilling.restorePurchases();
      
      // Process restored purchases
      if (purchases && purchases.length > 0) {
        for (const purchase of purchases) {
          const product = findProductById(purchase.productId);
          if (product && product.type !== 'consumable') {
            // Restore subscription
            const subscriptionData = {
              productId: purchase.productId,
              type: purchase.productId.includes('pro') ? 'pro' : 'plus',
              purchasedAt: purchase.purchasedAt,
              transactionId: purchase.transactionId,
              expiresAt: purchase.expiresAt,
            };
            storeBilling.saveSubscription(subscriptionData);
            setSubscription(subscriptionData);
          }
        }
      }
      
      return { success: true, purchases };
    } catch (error) {
      const errorResult = {
        success: false,
        error: error.error || error.message || 'Restore failed',
      };
      setLastError(errorResult);
      return errorResult;
    } finally {
      setRestoring(false);
    }
  }, [restoring]);

  /**
   * Spend points for a feature
   * @param {number} points - Points to spend
   * @returns {boolean} Success
   */
  const spendPoints = useCallback((points) => {
    const success = storeBilling.spendPoints(points);
    if (success) {
      setPointsBalance(storeBilling.getPointsBalance());
    }
    return success;
  }, []);

  /**
   * Check if user has active premium subscription
   */
  const hasPremium = useCallback(() => {
    if (!subscription) return false;
    if (!subscription.expiresAt) return true; // Non-expiring
    return new Date(subscription.expiresAt) > new Date();
  }, [subscription]);

  /**
   * Check if user has Pro tier
   */
  const hasPro = useCallback(() => {
    return hasPremium() && subscription?.type === 'pro';
  }, [hasPremium, subscription]);

  /**
   * Get product catalog
   */
  const getProducts = useCallback(() => PRODUCTS, []);

  return {
    // State
    initialized,
    purchasing,
    restoring,
    subscription,
    pointsBalance,
    lastError,
    lastPurchase,
    platform: storeBilling.getPlatform(),
    isNativeApp: storeBilling.isNativeApp(),
    
    // Actions
    purchase,
    purchasePoints,
    purchasePlus,
    purchasePro,
    restorePurchases,
    spendPoints,
    
    // Helpers
    hasPremium,
    hasPro,
    getProducts,
  };
}

// Helper: Find product by ID
function findProductById(productId) {
  const allProducts = [
    ...Object.values(PRODUCTS.points),
    ...Object.values(PRODUCTS.plus),
    ...Object.values(PRODUCTS.pro),
  ];
  return allProducts.find(p => p.id === productId);
}

// Helper: Calculate expiry date based on product duration
function calculateExpiryDate(product) {
  const now = new Date();
  
  switch (product.duration) {
    case '1 Hour':
      return new Date(now.getTime() + 60 * 60 * 1000).toISOString();
    case 'Weekly':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    case 'Monthly':
      return new Date(now.setMonth(now.getMonth() + 1)).toISOString();
    case '3 Months':
      return new Date(now.setMonth(now.getMonth() + 3)).toISOString();
    case '6 Months':
      return new Date(now.setMonth(now.getMonth() + 6)).toISOString();
    default:
      return new Date(now.setMonth(now.getMonth() + 1)).toISOString();
  }
}

export default useStoreBilling;
