/**
 * Store Billing Service
 * 
 * PRODUCTION-READY infrastructure for in-app purchases.
 * Handles Premium subscriptions and Points packages via native store billing.
 * 
 * ============================================================================
 * ARCHITECTURE OVERVIEW
 * ============================================================================
 * 
 * PLATFORMS:
 * - iOS: Apple StoreKit via WKWebView messageHandlers
 * - Android: Google Play Billing via JavaScript interface
 * - Web: Mock mode for development/testing ONLY
 * 
 * PURCHASE FLOW:
 * 1. Client initiates purchase → Native store handles payment
 * 2. Native returns receipt/token → Client sends to backend
 * 3. Backend validates receipt with Apple/Google servers
 * 4. Backend updates user entitlements → Returns verified status
 * 5. Client updates local cache from server response
 * 
 * SOURCE OF TRUTH:
 * - Backend database is the ONLY source of truth for entitlements
 * - localStorage is CACHE ONLY, always verify with server
 * - Mock mode uses localStorage for development convenience
 * 
 * RECEIPT VALIDATION:
 * - iOS: Backend calls Apple's verifyReceipt endpoint
 * - Android: Backend calls Google Play Developer API
 * - Never trust client-side validation alone
 * 
 * ============================================================================
 * ⚠️ BACKEND IDEMPOTENCY REQUIREMENT (CRITICAL) ⚠️
 * ============================================================================
 * 
 * The backend MUST enforce idempotency protection as the PRIMARY safeguard.
 * Client-side duplicate prevention is for UX only - server is the authority.
 * 
 * Backend validation endpoint MUST:
 * 1. Check if transactionId already exists in database BEFORE granting entitlements
 * 2. Return success with existing entitlements if transaction was already processed
 * 3. Use database transaction/lock to prevent race conditions
 * 4. Store: transactionId, productId, userId, validatedAt, receiptData
 * 
 * Example backend logic:
 * ```python
 * def validate_receipt(user_id, transaction_id, receipt):
 *     # Check for existing transaction (IDEMPOTENCY)
 *     existing = db.query(Transaction).filter_by(transaction_id=transaction_id).first()
 *     if existing:
 *         return {"valid": True, "entitlements": existing.entitlements, "alreadyProcessed": True}
 *     
 *     # Validate with Apple/Google
 *     validation = verify_with_store(receipt)
 *     if not validation.valid:
 *         return {"valid": False, "error": validation.error}
 *     
 *     # Grant entitlements (inside transaction)
 *     with db.transaction():
 *         # Double-check for race condition
 *         if db.query(Transaction).filter_by(transaction_id=transaction_id).first():
 *             return {"valid": True, "alreadyProcessed": True}
 *         
 *         # Save transaction
 *         db.add(Transaction(transaction_id=transaction_id, user_id=user_id, ...))
 *         
 *         # Grant entitlements
 *         entitlements = grant_entitlements(user_id, validation.product_id)
 *         
 *     return {"valid": True, "entitlements": entitlements}
 * ```
 * 
 * ============================================================================
 * IMPORTANT RULES
 * ============================================================================
 * 
 * 1. Premium and Points purchases MUST use native store billing ONLY
 * 2. PayPlus is ONLY for Events/Explorer tickets (separate flow)
 * 3. Always validate receipts server-side before granting entitlements
 * 4. Handle restore purchases for users switching devices
 * 5. Support subscription status checking for expired/cancelled subs
 * 
 * ============================================================================
 * USAGE
 * ============================================================================
 * 
 *   import { storeBilling } from '../services/storeBilling';
 *   
 *   // Initialize on app startup
 *   await storeBilling.initialize();
 *   
 *   // Purchase a product (returns after server validation)
 *   const result = await storeBilling.purchase('pulse_premium_monthly');
 *   
 *   // Restore purchases (for device switching)
 *   const restored = await storeBilling.restorePurchases();
 *   
 *   // Check subscription status (verifies with server)
 *   const subscription = await storeBilling.verifySubscription();
 *   
 *   // Get product info (prices from store)
 *   const products = await storeBilling.getProducts(['pulse_premium_monthly']);
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // API endpoints for receipt validation
  API_BASE_URL: process.env.REACT_APP_API_URL || 'https://pulse-dating-app.onrender.com',
  
  // Endpoints (Client-facing)
  ENDPOINTS: {
    VALIDATE_RECEIPT: '/api/v1/billing/validate-receipt',
    VERIFY_SUBSCRIPTION: '/api/v1/billing/verify-subscription',
    GET_ENTITLEMENTS: '/api/v1/billing/entitlements',
    CONSUME_POINTS: '/api/v1/billing/consume-points',
    ADD_POINTS: '/api/v1/billing/add-points',
  },
  
  // Webhook Endpoints (Server-to-Server, documented in backend/docs/BILLING_WEBHOOKS.md)
  // These are NOT called by the client - they receive notifications from Apple/Google
  WEBHOOK_ENDPOINTS: {
    APPLE: '/api/v1/billing/apple-webhook',   // App Store Server Notifications V2
    GOOGLE: '/api/v1/billing/google-webhook', // Google Play RTDN via Pub/Sub
  },
  
  // Timeouts
  PURCHASE_TIMEOUT_MS: 120000, // 2 minutes for purchase flow
  RESTORE_TIMEOUT_MS: 30000,   // 30 seconds for restore
  API_TIMEOUT_MS: 10000,       // 10 seconds for API calls
  
  // Development mode
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  MOCK_ENABLED: process.env.REACT_APP_MOCK_BILLING === 'true' || process.env.NODE_ENV === 'development',
  
  // LocalStorage keys for duplicate prevention
  STORAGE_KEYS: {
    PROCESSED_TRANSACTIONS: 'pulse_processed_transactions',
    PENDING_PURCHASE: 'pulse_pending_purchase',
  },
};

// ============================================================================
// PRODUCT CATALOG
// ============================================================================
// 
// ⚠️ CRITICAL: PRODUCT IDs ARE IMMUTABLE AFTER RELEASE ⚠️
// 
// Product IDs must match EXACTLY what's configured in:
// - App Store Connect (iOS)
// - Google Play Console (Android)
// - Backend validation logic (transactions table, receipt validation)
//
// NEVER change product IDs after they are published to the stores.
// Changing IDs will break:
// - Purchase validation
// - Restore purchases
// - Subscription status checks
// - Historical transaction records
//
// If you need a new product, create a NEW ID and deprecate the old one.
//
// Naming convention: pulse_{type}_{tier}_{duration}
// Examples: pulse_points_100, pulse_plus_monthly, pulse_pro_quarterly
//
// SUBSCRIPTION TYPES (App Store):
// - auto_renewable: Weekly, Monthly, 2mo, 3mo, 6mo, Yearly (managed by Apple)
// - non_renewing: Any duration (managed by your server, e.g., hourly)
//
// SUBSCRIPTION TYPES (Play Store):
// - auto_renewable: Mapped to "Subscriptions" in Play Console
// - non_renewing: Mapped to "One-time products" with server-side expiry

export const PRODUCTS = {
  // Points packages (consumable - can be purchased multiple times)
  points: {
    small: {
      id: 'pulse_points_100',           // App Store / Play Store product ID
      points: 100,
      price: 9.90,                       // Fallback price (actual price comes from store)
      currency: '₪',
      type: 'consumable',
      // App Store: com.pulse.points.100
      // Play Store: pulse_points_100
    },
    medium: {
      id: 'pulse_points_250',
      points: 250,
      price: 19.90,
      currency: '₪',
      type: 'consumable',
    },
    large: {
      id: 'pulse_points_600',
      points: 600,
      price: 39.90,
      currency: '₪',
      type: 'consumable',
    },
  },
  
  // Premium subscriptions - Plus tier
  plus: {
    // NOTE: Hourly is a NON-RENEWING subscription (one-time purchase with time limit)
    // Apple App Store does NOT support hourly auto-renewable subscriptions.
    // Supported auto-renewable durations: weekly, monthly, 2mo, 3mo, 6mo, yearly
    // This is implemented as a "non-consumable" with server-side expiry tracking
    hourly: {
      id: 'pulse_plus_hourly',
      duration: '1 Hour',
      durationMs: 60 * 60 * 1000,        // For local expiry calculation
      price: 5,
      currency: '₪',
      type: 'non_renewing',              // NOT auto-renewable - one-time purchase
      tier: 'plus',
      // App Store: Configure as "Non-Renewing Subscription" in App Store Connect
      // Play Store: Configure as "Non-recurring product" or use server-side time tracking
      _note: 'For testing/special promotions only. Not a standard subscription.',
    },
    monthly: {
      id: 'pulse_plus_monthly',
      duration: 'Monthly',
      durationMs: 30 * 24 * 60 * 60 * 1000,
      price: 29,
      currency: '₪',
      type: 'auto_renewable',
      tier: 'plus',
      // Subscription group: pulse_premium (iOS)
      // Base plan: pulse-plus-monthly (Android)
    },
    quarterly: {
      id: 'pulse_plus_quarterly',
      duration: '3 Months',
      durationMs: 90 * 24 * 60 * 60 * 1000,
      price: 69,
      currency: '₪',
      type: 'auto_renewable',
      tier: 'plus',
    },
  },
  
  // Premium subscriptions - Pro tier (includes all Plus features)
  pro: {
    weekly: {
      id: 'pulse_pro_weekly',
      duration: 'Weekly',
      durationMs: 7 * 24 * 60 * 60 * 1000,
      price: 9,
      currency: '₪',
      type: 'auto_renewable',
      tier: 'pro',
    },
    monthly: {
      id: 'pulse_pro_monthly',
      duration: 'Monthly',
      durationMs: 30 * 24 * 60 * 60 * 1000,
      price: 49,
      currency: '₪',
      type: 'auto_renewable',
      tier: 'pro',
    },
    quarterly: {
      id: 'pulse_pro_quarterly',
      duration: '3 Months',
      durationMs: 90 * 24 * 60 * 60 * 1000,
      price: 119,
      currency: '₪',
      type: 'auto_renewable',
      tier: 'pro',
    },
    biannual: {
      id: 'pulse_pro_biannual',
      duration: '6 Months',
      durationMs: 180 * 24 * 60 * 60 * 1000,
      price: 199,
      currency: '₪',
      type: 'auto_renewable',
      tier: 'pro',
    },
  },
};

// Helper to find product by ID
export const findProductById = (productId) => {
  const allProducts = [
    ...Object.values(PRODUCTS.points),
    ...Object.values(PRODUCTS.plus),
    ...Object.values(PRODUCTS.pro),
  ];
  return allProducts.find(p => p.id === productId);
};

// ============================================================================
// PLATFORM DETECTION
// ============================================================================

const getPlatform = () => {
  // Check for native app bridges first (more reliable than user agent)
  if (window.webkit?.messageHandlers?.inAppPurchase) return 'ios';
  if (window.Android?.purchaseProduct) return 'android';
  
  // Fallback to user agent detection
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) return 'ios';
  if (/Android/.test(navigator.userAgent)) return 'android';
  return 'web';
};

// ============================================================================
// API HELPERS
// ============================================================================

/**
 * Make authenticated API request to backend
 */
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('pulse_auth_token');
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONFIG.API_TIMEOUT_MS);
  
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers,
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
};

// Event emitter for purchase callbacks
class PurchaseEventEmitter {
  constructor() {
    this.listeners = {};
  }
  
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return () => this.off(event, callback);
  }
  
  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }
  
  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => callback(data));
  }
}

const purchaseEvents = new PurchaseEventEmitter();

// Purchase result types
export const PurchaseStatus = {
  SUCCESS: 'success',
  CANCELLED: 'cancelled',
  FAILED: 'failed',
  PENDING: 'pending',
  RESTORED: 'restored',
};

// Store Billing Service
class StoreBillingService {
  constructor() {
    this.platform = getPlatform();
    this.initialized = false;
    this.pendingPurchases = new Map();
    
    // Setup native callbacks
    this._setupNativeCallbacks();
  }
  
  /**
   * Initialize the billing service
   * Call this on app startup
   */
  async initialize() {
    if (this.initialized) return true;
    
    console.log('[StoreBilling] Initializing for platform:', this.platform);
    
    try {
      if (this.platform === 'ios') {
        // iOS: Check if StoreKit is available
        if (window.webkit?.messageHandlers?.inAppPurchase) {
          window.webkit.messageHandlers.inAppPurchase.postMessage({ action: 'initialize' });
          this.initialized = true;
        }
      } else if (this.platform === 'android') {
        // Android: Check if billing is available
        if (window.Android?.initializeBilling) {
          window.Android.initializeBilling();
          this.initialized = true;
        }
      } else {
        // Web: Always ready (mock mode)
        this.initialized = true;
      }
      
      console.log('[StoreBilling] Initialized successfully');
      return true;
    } catch (error) {
      console.error('[StoreBilling] Initialization failed:', error);
      return false;
    }
  }
  
  /**
   * Setup callbacks from native code
   */
  _setupNativeCallbacks() {
    // Global callback for native code to call
    window.onStorePurchaseResult = (result) => {
      console.log('[StoreBilling] Native callback received:', result);
      
      const { productId, status, transactionId, error } = result;
      
      // Resolve pending purchase promise
      const pending = this.pendingPurchases.get(productId);
      if (pending) {
        if (status === PurchaseStatus.SUCCESS || status === PurchaseStatus.RESTORED) {
          pending.resolve({
            success: true,
            productId,
            transactionId,
            status,
          });
        } else {
          pending.reject({
            success: false,
            productId,
            status,
            error: error || 'Purchase failed',
          });
        }
        this.pendingPurchases.delete(productId);
      }
      
      // Emit event for listeners
      purchaseEvents.emit('purchaseResult', result);
    };
    
    // Callback for restored purchases
    window.onStorePurchasesRestored = (purchases) => {
      console.log('[StoreBilling] Purchases restored:', purchases);
      purchaseEvents.emit('purchasesRestored', purchases);
    };
  }
  
  /**
   * Get product information from the store
   * @param {string[]} productIds - Array of product IDs to fetch
   * @returns {Promise<Object[]>} Product information
   */
  async getProducts(productIds) {
    console.log('[StoreBilling] Getting products:', productIds);
    
    if (this.platform === 'ios' && window.webkit?.messageHandlers?.inAppPurchase) {
      return new Promise((resolve) => {
        window.onStoreProductsReceived = (products) => {
          resolve(products);
        };
        window.webkit.messageHandlers.inAppPurchase.postMessage({
          action: 'getProducts',
          productIds,
        });
      });
    } else if (this.platform === 'android' && window.Android?.getProducts) {
      return new Promise((resolve) => {
        window.onStoreProductsReceived = (products) => {
          resolve(JSON.parse(products));
        };
        window.Android.getProducts(JSON.stringify(productIds));
      });
    } else {
      // Web: Return mock product data from catalog
      return productIds.map(id => {
        const allProducts = [
          ...Object.values(PRODUCTS.points),
          ...Object.values(PRODUCTS.plus),
          ...Object.values(PRODUCTS.pro),
        ];
        return allProducts.find(p => p.id === id) || { id, price: 0, currency: '₪' };
      });
    }
  }
  
  /**
   * Purchase a product
   * @param {string} productId - The product ID to purchase
   * @returns {Promise<Object>} Purchase result
   */
  async purchase(productId) {
    console.log('[StoreBilling] Initiating purchase:', productId);
    
    // Create a promise that will be resolved by native callback
    const purchasePromise = new Promise((resolve, reject) => {
      this.pendingPurchases.set(productId, { resolve, reject });
      
      // Timeout after 2 minutes
      setTimeout(() => {
        if (this.pendingPurchases.has(productId)) {
          this.pendingPurchases.delete(productId);
          reject({
            success: false,
            productId,
            status: PurchaseStatus.FAILED,
            error: 'Purchase timeout',
          });
        }
      }, 120000);
    });
    
    try {
      if (this.platform === 'ios' && window.webkit?.messageHandlers?.inAppPurchase) {
        // iOS: Call StoreKit
        window.webkit.messageHandlers.inAppPurchase.postMessage({
          action: 'purchase',
          productId,
        });
        return await purchasePromise;
        
      } else if (this.platform === 'android' && window.Android?.purchaseProduct) {
        // Android: Call Google Play Billing
        window.Android.purchaseProduct(productId);
        return await purchasePromise;
        
      } else {
        // Web: Mock purchase for development ONLY
        if (!CONFIG.MOCK_ENABLED) {
          throw new Error('Native billing not available');
        }
        
        console.log('[StoreBilling] Web mock purchase (DEV ONLY):', productId);
        
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Clean up pending promise
        this.pendingPurchases.delete(productId);
        
        // Return mock success with fake receipt
        const result = {
          success: true,
          productId,
          transactionId: `mock_${Date.now()}`,
          receipt: `mock_receipt_${productId}_${Date.now()}`, // Mock receipt for testing
          status: PurchaseStatus.SUCCESS,
          _isMock: true, // Flag to identify mock purchases
        };
        
        // Emit event
        purchaseEvents.emit('purchaseResult', result);
        
        return result;
      }
    } catch (error) {
      console.error('[StoreBilling] Purchase error:', error);
      this.pendingPurchases.delete(productId);
      throw error;
    }
  }
  
  /**
   * RECOMMENDED: Purchase and validate in one call
   * This is the method that should be used by UI components
   * It handles the full flow: purchase → validate → grant entitlements
   * 
   * @param {string} productId - The product ID to purchase
   * @returns {Promise<Object>} Validated purchase with entitlements
   */
  async purchaseAndValidate(productId) {
    console.log('[StoreBilling] Starting purchase and validate flow:', productId);
    
    // Check for duplicate/pending purchase
    const pendingPurchase = this._getPendingPurchase();
    if (pendingPurchase && pendingPurchase.productId === productId) {
      console.log('[StoreBilling] Found pending purchase, resuming validation');
      // Resume validation for interrupted purchase
      return await this.validateReceipt(pendingPurchase);
    }
    
    try {
      // Mark purchase as pending (for crash recovery)
      this._setPendingPurchase(productId);
      
      // Step 1: Execute native purchase
      const purchaseResult = await this.purchase(productId);
      
      if (!purchaseResult.success) {
        this._clearPendingPurchase();
        throw new Error(purchaseResult.error || 'Purchase failed');
      }
      
      // Check for duplicate transaction
      if (this._isTransactionProcessed(purchaseResult.transactionId)) {
        console.log('[StoreBilling] Transaction already processed:', purchaseResult.transactionId);
        this._clearPendingPurchase();
        return {
          success: true,
          alreadyProcessed: true,
          transactionId: purchaseResult.transactionId,
        };
      }
      
      // Step 2: Validate receipt with backend
      const validationResult = await this.validateReceipt(purchaseResult);
      
      // Step 3: Mark transaction as processed (prevent duplicates)
      this._markTransactionProcessed(purchaseResult.transactionId);
      
      // Clear pending purchase
      this._clearPendingPurchase();
      
      console.log('[StoreBilling] Purchase and validation complete:', validationResult);
      return {
        success: true,
        ...validationResult,
      };
      
    } catch (error) {
      console.error('[StoreBilling] Purchase and validate error:', error);
      // Don't clear pending purchase on validation error - allow retry
      if (error.message !== 'Receipt validation failed') {
        this._clearPendingPurchase();
      }
      throw error;
    }
  }
  
  // ==========================================================================
  // DUPLICATE PREVENTION
  // ==========================================================================
  
  /**
   * Check if a transaction has already been processed
   * @private
   */
  _isTransactionProcessed(transactionId) {
    if (!transactionId) return false;
    const processed = this._getProcessedTransactions();
    return processed.includes(transactionId);
  }
  
  /**
   * Mark a transaction as processed
   * @private
   */
  _markTransactionProcessed(transactionId) {
    if (!transactionId) return;
    const processed = this._getProcessedTransactions();
    if (!processed.includes(transactionId)) {
      processed.push(transactionId);
      // Keep only last 100 transactions to prevent storage bloat
      const trimmed = processed.slice(-100);
      localStorage.setItem(CONFIG.STORAGE_KEYS.PROCESSED_TRANSACTIONS, JSON.stringify(trimmed));
    }
  }
  
  /**
   * Get list of processed transaction IDs
   * @private
   */
  _getProcessedTransactions() {
    try {
      const stored = localStorage.getItem(CONFIG.STORAGE_KEYS.PROCESSED_TRANSACTIONS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
  
  /**
   * Set pending purchase (for crash recovery)
   * @private
   */
  _setPendingPurchase(productId) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.PENDING_PURCHASE, JSON.stringify({
      productId,
      startedAt: new Date().toISOString(),
    }));
  }
  
  /**
   * Get pending purchase (for crash recovery)
   * @private
   */
  _getPendingPurchase() {
    try {
      const stored = localStorage.getItem(CONFIG.STORAGE_KEYS.PENDING_PURCHASE);
      if (!stored) return null;
      
      const pending = JSON.parse(stored);
      // Expire pending purchases after 10 minutes
      const startedAt = new Date(pending.startedAt);
      if (Date.now() - startedAt.getTime() > 10 * 60 * 1000) {
        this._clearPendingPurchase();
        return null;
      }
      return pending;
    } catch {
      return null;
    }
  }
  
  /**
   * Clear pending purchase
   * @private
   */
  _clearPendingPurchase() {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.PENDING_PURCHASE);
  }
  
  /**
   * Check and resume any interrupted purchases (call on app startup)
   * @returns {Promise<Object|null>} Resumed purchase result or null
   */
  async resumeInterruptedPurchase() {
    const pending = this._getPendingPurchase();
    if (!pending) return null;
    
    console.log('[StoreBilling] Found interrupted purchase, attempting to resume:', pending.productId);
    
    try {
      // Try to restore and validate
      const purchases = await this.restorePurchases();
      const matchingPurchase = purchases.find(p => p.productId === pending.productId);
      
      if (matchingPurchase && !this._isTransactionProcessed(matchingPurchase.transactionId)) {
        const result = await this.validateReceipt(matchingPurchase);
        this._markTransactionProcessed(matchingPurchase.transactionId);
        this._clearPendingPurchase();
        return result;
      }
      
      this._clearPendingPurchase();
      return null;
    } catch (error) {
      console.error('[StoreBilling] Failed to resume interrupted purchase:', error);
      return null;
    }
  }
  
  /**
   * Restore previous purchases
   * @returns {Promise<Object[]>} Array of restored purchases
   */
  async restorePurchases() {
    console.log('[StoreBilling] Restoring purchases');
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject({ success: false, error: 'Restore timeout' });
      }, 30000);
      
      const cleanup = purchaseEvents.on('purchasesRestored', (purchases) => {
        clearTimeout(timeout);
        cleanup();
        resolve(purchases);
      });
      
      if (this.platform === 'ios' && window.webkit?.messageHandlers?.inAppPurchase) {
        window.webkit.messageHandlers.inAppPurchase.postMessage({ action: 'restore' });
      } else if (this.platform === 'android' && window.Android?.restorePurchases) {
        window.Android.restorePurchases();
      } else {
        // Web: Return empty (no purchases to restore in mock mode)
        clearTimeout(timeout);
        cleanup();
        resolve([]);
      }
    });
  }
  
  // ==========================================================================
  // RECEIPT VALIDATION (Server-side verification)
  // ==========================================================================
  
  /**
   * Validate a purchase receipt with the backend
   * This is the CRITICAL step that grants entitlements
   * 
   * @param {Object} purchaseResult - Result from native purchase
   * @returns {Promise<Object>} Validated purchase with entitlements
   */
  async validateReceipt(purchaseResult) {
    const { productId, transactionId, receipt } = purchaseResult;
    
    // In mock mode, skip server validation
    if (purchaseResult._isMock && CONFIG.MOCK_ENABLED) {
      console.log('[StoreBilling] Skipping receipt validation (mock mode)');
      return {
        valid: true,
        productId,
        transactionId,
        entitlements: this._getMockEntitlements(productId),
      };
    }
    
    console.log('[StoreBilling] Validating receipt with server:', productId);
    
    try {
      const response = await apiRequest(CONFIG.ENDPOINTS.VALIDATE_RECEIPT, {
        method: 'POST',
        body: JSON.stringify({
          platform: this.platform,
          productId,
          transactionId,
          receipt, // iOS: base64 receipt, Android: purchase token
        }),
      });
      
      // Server returns validated entitlements
      if (response.valid) {
        // Cache the entitlements locally
        this._cacheEntitlements(response.entitlements);
        return response;
      } else {
        throw new Error(response.error || 'Receipt validation failed');
      }
    } catch (error) {
      console.error('[StoreBilling] Receipt validation error:', error);
      throw error;
    }
  }
  
  /**
   * Verify subscription status with server
   * Call this on app launch and periodically
   * 
   * @returns {Promise<Object|null>} Current subscription or null
   */
  async verifySubscription() {
    console.log('[StoreBilling] Verifying subscription with server');
    
    // In mock mode, use local cache
    if (CONFIG.MOCK_ENABLED && this.platform === 'web') {
      return this._getCachedSubscription();
    }
    
    try {
      const response = await apiRequest(CONFIG.ENDPOINTS.VERIFY_SUBSCRIPTION, {
        method: 'GET',
      });
      
      if (response.subscription) {
        // Update local cache with server data
        this.saveSubscription(response.subscription);
        return response.subscription;
      }
      
      // No active subscription - clear local cache
      localStorage.removeItem('pulse_subscription');
      return null;
    } catch (error) {
      console.error('[StoreBilling] Subscription verification error:', error);
      // On error, fall back to cached data (but mark as unverified)
      const cached = this._getCachedSubscription();
      if (cached) {
        cached._unverified = true;
      }
      return cached;
    }
  }
  
  /**
   * Get all user entitlements from server
   * Includes subscription status, points balance, active features
   * 
   * @returns {Promise<Object>} User entitlements
   */
  async getEntitlements() {
    console.log('[StoreBilling] Fetching entitlements from server');
    
    // In mock mode, return local state
    if (CONFIG.MOCK_ENABLED && this.platform === 'web') {
      return {
        subscription: this._getCachedSubscription(),
        pointsBalance: this.getPointsBalance(),
        activeFeatures: JSON.parse(localStorage.getItem('pulse_active_features') || '{}'),
        _isMock: true,
      };
    }
    
    try {
      const response = await apiRequest(CONFIG.ENDPOINTS.GET_ENTITLEMENTS, {
        method: 'GET',
      });
      
      // Update local cache with server data
      if (response.subscription) {
        this.saveSubscription(response.subscription);
      }
      if (typeof response.pointsBalance === 'number') {
        localStorage.setItem('pulse_points_balance', String(response.pointsBalance));
      }
      
      return response;
    } catch (error) {
      console.error('[StoreBilling] Get entitlements error:', error);
      // Return cached data on error
      return {
        subscription: this._getCachedSubscription(),
        pointsBalance: this.getPointsBalance(),
        _offline: true,
      };
    }
  }
  
  // ==========================================================================
  // SUBSCRIPTION MANAGEMENT
  // ==========================================================================
  
  /**
   * Check if user has an active subscription (uses cache, verify with server for accuracy)
   * @returns {Promise<Object|null>} Active subscription info or null
   */
  async getActiveSubscription() {
    // First check local cache for quick response
    const cached = this._getCachedSubscription();
    
    // If we have a cached subscription that hasn't expired, return it
    if (cached && cached.expiresAt && new Date(cached.expiresAt) > new Date()) {
      return cached;
    }
    
    // Otherwise verify with server (if not in mock mode)
    if (!CONFIG.MOCK_ENABLED || this.platform !== 'web') {
      return await this.verifySubscription();
    }
    
    return cached;
  }
  
  /**
   * Get cached subscription from localStorage
   * @private
   */
  _getCachedSubscription() {
    const cached = localStorage.getItem('pulse_subscription');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        localStorage.removeItem('pulse_subscription');
      }
    }
    return null;
  }
  
  /**
   * Save subscription status locally (cache)
   * @param {Object} subscription - Subscription details
   */
  saveSubscription(subscription) {
    localStorage.setItem('pulse_subscription', JSON.stringify({
      ...subscription,
      _cachedAt: new Date().toISOString(),
    }));
  }
  
  /**
   * Clear subscription (on logout or cancellation)
   */
  clearSubscription() {
    localStorage.removeItem('pulse_subscription');
  }
  
  /**
   * Check if user has active subscription (quick check, uses cache)
   * @returns {boolean}
   */
  hasActiveSubscription() {
    const sub = this._getCachedSubscription();
    if (!sub) return false;
    if (sub.expiresAt && new Date(sub.expiresAt) <= new Date()) return false;
    return true;
  }
  
  // ==========================================================================
  // POINTS MANAGEMENT
  // ==========================================================================
  
  /**
   * Get user's points balance (from cache)
   * For accurate balance, call getEntitlements()
   * @returns {number} Current points balance
   */
  getPointsBalance() {
    return parseInt(localStorage.getItem('pulse_points_balance') || '0', 10);
  }
  
  /**
   * Add points to user's balance
   * In production, this should be called after server confirms the purchase
   * @param {number} points - Points to add
   * @returns {number} New balance
   */
  addPoints(points) {
    const current = this.getPointsBalance();
    const newBalance = current + points;
    localStorage.setItem('pulse_points_balance', String(newBalance));
    return newBalance;
  }
  
  /**
   * Spend points from user's balance
   * In production, this should validate with server first
   * @param {number} points - Points to spend
   * @returns {boolean} Success
   */
  spendPoints(points) {
    const current = this.getPointsBalance();
    if (current < points) return false;
    localStorage.setItem('pulse_points_balance', String(current - points));
    return true;
  }
  
  /**
   * Spend points with server validation
   * @param {number} points - Points to spend
   * @param {string} featureId - Feature being activated
   * @returns {Promise<Object>} Result with new balance
   */
  async spendPointsWithValidation(points, featureId) {
    if (CONFIG.MOCK_ENABLED && this.platform === 'web') {
      // Mock mode - just use local
      const success = this.spendPoints(points);
      return { success, newBalance: this.getPointsBalance() };
    }
    
    try {
      const response = await apiRequest(CONFIG.ENDPOINTS.CONSUME_POINTS, {
        method: 'POST',
        body: JSON.stringify({ points, featureId }),
      });
      
      // Update local cache with server balance
      localStorage.setItem('pulse_points_balance', String(response.newBalance));
      return response;
    } catch (error) {
      console.error('[StoreBilling] Spend points error:', error);
      throw error;
    }
  }
  
  // ==========================================================================
  // MOCK HELPERS (Development only)
  // ==========================================================================
  
  /**
   * Get mock entitlements for a product (dev only)
   * @private
   */
  _getMockEntitlements(productId) {
    const product = findProductById(productId);
    if (!product) return {};
    
    if (product.type === 'consumable') {
      return { pointsAdded: product.points };
    }
    
    return {
      subscription: {
        productId,
        tier: product.tier,
        expiresAt: new Date(Date.now() + (product.durationMs || 30 * 24 * 60 * 60 * 1000)).toISOString(),
      },
    };
  }
  
  /**
   * Cache entitlements locally
   * @private
   */
  _cacheEntitlements(entitlements) {
    if (entitlements.subscription) {
      this.saveSubscription(entitlements.subscription);
    }
    if (entitlements.pointsAdded) {
      this.addPoints(entitlements.pointsAdded);
    }
  }
  
  // ==========================================================================
  // EVENT HANDLING
  // ==========================================================================
  
  /**
   * Subscribe to purchase events
   * @param {string} event - Event name ('purchaseResult', 'purchasesRestored')
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  on(event, callback) {
    return purchaseEvents.on(event, callback);
  }
  
  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================
  
  /**
   * Get current platform
   * @returns {string} 'ios', 'android', or 'web'
   */
  getPlatform() {
    return this.platform;
  }
  
  /**
   * Check if running in native app
   * @returns {boolean}
   */
  isNativeApp() {
    return this.platform !== 'web';
  }
  
  /**
   * Check if mock mode is enabled
   * @returns {boolean}
   */
  isMockMode() {
    return CONFIG.MOCK_ENABLED && this.platform === 'web';
  }
  
  /**
   * Get configuration (for debugging)
   * @returns {Object}
   */
  getConfig() {
    return { ...CONFIG };
  }
}

// Export singleton instance
export const storeBilling = new StoreBillingService();

// Export class for testing
export { StoreBillingService };

// Export event emitter for external listeners
export { purchaseEvents };

// Export event types
export const StoreBillingEvents = {
  PURCHASE_RESULT: 'purchaseResult',
  PURCHASES_RESTORED: 'purchasesRestored',
};

// Export configuration (for debugging/testing)
export const getStoreBillingConfig = () => ({ ...CONFIG });
