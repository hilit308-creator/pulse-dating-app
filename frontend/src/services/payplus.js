/**
 * PayPlus Payment Service
 * Handles all payment redirects to PayPlus external payment page
 */

// PayPlus configuration
const PAYPLUS_CONFIG = {
  // PayPlus payment page URL - will be replaced with actual PayPlus URL
  baseUrl: process.env.REACT_APP_PAYPLUS_URL || 'https://payments.payplus.co.il',
  // Merchant credentials
  merchantId: process.env.REACT_APP_PAYPLUS_MERCHANT_ID || 'demo_merchant',
  // Return URLs
  successUrl: window.location.origin + '/payment/success',
  cancelUrl: window.location.origin + '/payment/cancel',
  callbackUrl: process.env.REACT_APP_API_URL + '/api/payments/payplus/callback',
};

/**
 * Generate PayPlus payment URL and redirect user
 * @param {Object} options Payment options
 * @param {string} options.type - Payment type: 'event', 'workshop', 'gesture', 'subscription', 'points'
 * @param {string} options.itemId - ID of the item being purchased
 * @param {string} options.itemName - Name/title of the item
 * @param {number} options.amount - Amount in ILS (shekels)
 * @param {number} options.quantity - Quantity (default 1)
 * @param {string} options.description - Payment description
 * @param {Object} options.metadata - Additional metadata to pass through
 * @returns {string} PayPlus payment URL
 */
export const createPayPlusUrl = (options) => {
  const {
    type,
    itemId,
    itemName,
    amount,
    quantity = 1,
    description,
    metadata = {},
  } = options;

  // Build payment reference for tracking
  const paymentRef = `${type}_${itemId}_${Date.now()}`;
  
  // Store payment info in sessionStorage for retrieval after redirect
  sessionStorage.setItem('pending_payment', JSON.stringify({
    ref: paymentRef,
    type,
    itemId,
    itemName,
    amount,
    quantity,
    metadata,
    createdAt: new Date().toISOString(),
  }));

  // Build PayPlus URL with parameters
  const params = new URLSearchParams({
    merchant_id: PAYPLUS_CONFIG.merchantId,
    amount: (amount * quantity).toFixed(2),
    currency: 'ILS',
    description: description || itemName,
    reference: paymentRef,
    success_url: PAYPLUS_CONFIG.successUrl,
    cancel_url: PAYPLUS_CONFIG.cancelUrl,
    callback_url: PAYPLUS_CONFIG.callbackUrl,
    // Custom fields
    item_type: type,
    item_id: itemId,
    quantity: quantity.toString(),
    metadata: JSON.stringify(metadata),
  });

  return `${PAYPLUS_CONFIG.baseUrl}/pay?${params.toString()}`;
};

/**
 * Redirect to PayPlus payment page
 * @param {Object} options - Same as createPayPlusUrl options
 */
export const redirectToPayPlus = (options) => {
  const url = createPayPlusUrl(options);
  window.location.href = url;
};

/**
 * Open PayPlus in a new window/tab
 * @param {Object} options - Same as createPayPlusUrl options
 * @returns {Window} The opened window reference
 */
export const openPayPlusWindow = (options) => {
  const url = createPayPlusUrl(options);
  return window.open(url, '_blank', 'noopener,noreferrer');
};

/**
 * Get pending payment info from sessionStorage
 * @returns {Object|null} Pending payment info or null
 */
export const getPendingPayment = () => {
  try {
    const data = sessionStorage.getItem('pending_payment');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

/**
 * Clear pending payment from sessionStorage
 */
export const clearPendingPayment = () => {
  sessionStorage.removeItem('pending_payment');
};

/**
 * Check if payment was successful (called on success redirect)
 * @param {URLSearchParams} params - URL search params from redirect
 * @returns {Object} Payment result
 */
export const handlePaymentSuccess = (params) => {
  const pending = getPendingPayment();
  if (!pending) {
    return { success: false, error: 'no_pending_payment' };
  }

  const transactionId = params.get('transaction_id');
  const reference = params.get('reference');

  // Verify reference matches
  if (reference !== pending.ref) {
    return { success: false, error: 'reference_mismatch' };
  }

  clearPendingPayment();

  return {
    success: true,
    transactionId,
    reference,
    type: pending.type,
    itemId: pending.itemId,
    amount: pending.amount,
    metadata: pending.metadata,
  };
};

/**
 * Handle payment cancellation
 * @returns {Object} Cancelled payment info
 */
export const handlePaymentCancel = () => {
  const pending = getPendingPayment();
  clearPendingPayment();
  return {
    cancelled: true,
    payment: pending,
  };
};

export default {
  createPayPlusUrl,
  redirectToPayPlus,
  openPayPlusWindow,
  getPendingPayment,
  clearPendingPayment,
  handlePaymentSuccess,
  handlePaymentCancel,
};
