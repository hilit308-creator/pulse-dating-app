# Store Billing Webhook Integration

## Overview

This document specifies the webhook integration requirements for Apple App Store and Google Play Store server-to-server notifications. These webhooks are essential for keeping subscription status synchronized even when the user doesn't open the app.

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   App Store     │     │   Google Play   │     │   Pulse App     │
│   (Apple)       │     │   (Google)      │     │   (Client)      │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │ Server Notifications  │ RTDN via Pub/Sub      │ Receipt
         │ (V2)                  │                       │ Validation
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Pulse Backend                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ Apple Webhook   │  │ Google Webhook  │  │ Receipt         │  │
│  │ Handler         │  │ Handler         │  │ Validator       │  │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘  │
│           │                    │                    │           │
│           └────────────────────┼────────────────────┘           │
│                                ▼                                │
│                    ┌─────────────────────┐                      │
│                    │ Entitlement Service │                      │
│                    └────────┬────────────┘                      │
│                             ▼                                   │
│                    ┌─────────────────────┐                      │
│                    │     Database        │                      │
│                    │ - users             │                      │
│                    │ - subscriptions     │                      │
│                    │ - transactions      │                      │
│                    │ - webhook_events    │                      │
│                    └─────────────────────┘                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. Apple App Store Server Notifications (V2)

### Endpoint

```
POST /api/v1/billing/apple-webhook
```

### Configuration in App Store Connect

1. Go to App Store Connect → Your App → App Information
2. Scroll to "App Store Server Notifications"
3. Set Production URL: `https://api.pulse-app.com/api/v1/billing/apple-webhook`
4. Set Sandbox URL: `https://api-staging.pulse-app.com/api/v1/billing/apple-webhook`
5. Select Version 2 notifications

### Request Format

Apple sends a signed JWT (JWS) in the request body:

```json
{
  "signedPayload": "eyJhbGciOiJFUzI1NiIsIng1YyI6WyJNSUlFT..."
}
```

### Implementation Requirements

```python
from fastapi import APIRouter, Request, HTTPException
from app.services.apple_billing import AppleBillingService
from app.models.webhook_event import WebhookEvent
from app.services.entitlement_service import EntitlementService

router = APIRouter()

@router.post("/api/v1/billing/apple-webhook")
async def apple_webhook(request: Request):
    """
    Handle Apple App Store Server Notifications V2
    
    CRITICAL: Never grant entitlements directly from webhook data.
    Always verify current state via App Store Server API.
    """
    try:
        body = await request.body()
        signed_payload = json.loads(body).get("signedPayload")
        
        # Step 1: Verify signature using Apple's public key
        notification = AppleBillingService.verify_and_decode_notification(signed_payload)
        if not notification:
            raise HTTPException(status_code=400, detail="Invalid signature")
        
        # Step 2: Extract notification details
        notification_type = notification["notificationType"]
        subtype = notification.get("subtype")
        transaction_info = notification.get("data", {}).get("signedTransactionInfo")
        
        # Step 3: Check idempotency - have we processed this notification?
        notification_uuid = notification.get("notificationUUID")
        existing = await WebhookEvent.get_by_notification_id(notification_uuid)
        if existing:
            return {"status": "already_processed"}
        
        # Step 4: Decode transaction info
        transaction = AppleBillingService.decode_signed_transaction(transaction_info)
        original_transaction_id = transaction.get("originalTransactionId")
        
        # Step 5: Fetch CURRENT subscription status from Apple (don't trust webhook alone)
        current_status = await AppleBillingService.get_subscription_status(
            original_transaction_id
        )
        
        # Step 6: Update entitlements based on VERIFIED status
        user = await get_user_by_apple_transaction(original_transaction_id)
        if user:
            await EntitlementService.sync_subscription_status(
                user_id=user.id,
                subscription_status=current_status,
                source="apple_webhook"
            )
        
        # Step 7: Log webhook event for audit
        await WebhookEvent.create(
            notification_id=notification_uuid,
            platform="apple",
            event_type=notification_type,
            subtype=subtype,
            transaction_id=original_transaction_id,
            payload=notification,
            processed_at=datetime.utcnow()
        )
        
        return {"status": "ok"}
        
    except Exception as e:
        logger.error(f"Apple webhook error: {e}")
        # Return 200 to prevent Apple from retrying (log error internally)
        return {"status": "error", "message": str(e)}
```

### Notification Types to Handle

| Notification Type | Subtype | Action |
|-------------------|---------|--------|
| `SUBSCRIBED` | `INITIAL_BUY` | New subscription - grant entitlements |
| `SUBSCRIBED` | `RESUBSCRIBE` | User resubscribed - grant entitlements |
| `DID_RENEW` | - | Subscription renewed - extend expiry |
| `DID_FAIL_TO_RENEW` | `GRACE_PERIOD` | Payment failed, in grace period |
| `DID_FAIL_TO_RENEW` | - | Payment failed, subscription ending |
| `EXPIRED` | `VOLUNTARY` | User cancelled, now expired |
| `EXPIRED` | `BILLING_RETRY` | Billing failed, now expired |
| `EXPIRED` | `PRICE_INCREASE` | User declined price increase |
| `REFUND` | - | Apple refunded purchase - revoke entitlements |
| `REVOKE` | - | Family sharing revoked - revoke entitlements |
| `GRACE_PERIOD_EXPIRED` | - | Grace period ended - revoke entitlements |
| `OFFER_REDEEMED` | - | Promotional offer applied |
| `RENEWAL_EXTENDED` | - | Apple extended renewal date |
| `CONSUMPTION_REQUEST` | - | Apple requesting consumption data |

### Signature Verification

```python
import jwt
from cryptography.x509 import load_pem_x509_certificate

class AppleBillingService:
    APPLE_ROOT_CA_G3_URL = "https://www.apple.com/certificateauthority/AppleRootCA-G3.cer"
    
    @staticmethod
    def verify_and_decode_notification(signed_payload: str) -> dict:
        """
        Verify Apple's JWS signature and decode the notification.
        
        1. Extract the certificate chain from x5c header
        2. Verify chain leads to Apple Root CA
        3. Verify signature using leaf certificate
        4. Decode and return payload
        """
        try:
            # Decode header to get certificate chain
            header = jwt.get_unverified_header(signed_payload)
            x5c = header.get("x5c", [])
            
            if not x5c:
                return None
            
            # Verify certificate chain (implementation depends on your crypto library)
            if not AppleBillingService._verify_certificate_chain(x5c):
                return None
            
            # Extract public key from leaf certificate
            leaf_cert_pem = f"-----BEGIN CERTIFICATE-----\n{x5c[0]}\n-----END CERTIFICATE-----"
            cert = load_pem_x509_certificate(leaf_cert_pem.encode())
            public_key = cert.public_key()
            
            # Verify and decode
            payload = jwt.decode(
                signed_payload,
                public_key,
                algorithms=["ES256"]
            )
            
            return payload
            
        except Exception as e:
            logger.error(f"Failed to verify Apple notification: {e}")
            return None
```

### App Store Server API Integration

```python
import httpx
import jwt
from datetime import datetime, timedelta

class AppleBillingService:
    """
    App Store Server API client for fetching subscription status.
    
    Required credentials (from App Store Connect):
    - APPLE_KEY_ID: Key ID from App Store Connect
    - APPLE_ISSUER_ID: Issuer ID from App Store Connect  
    - APPLE_PRIVATE_KEY: Private key (.p8 file contents)
    - APPLE_BUNDLE_ID: Your app's bundle ID
    """
    
    PRODUCTION_URL = "https://api.storekit.itunes.apple.com"
    SANDBOX_URL = "https://api.storekit-sandbox.itunes.apple.com"
    
    @staticmethod
    def _generate_token() -> str:
        """Generate JWT for App Store Server API authentication."""
        now = datetime.utcnow()
        payload = {
            "iss": settings.APPLE_ISSUER_ID,
            "iat": now,
            "exp": now + timedelta(minutes=60),
            "aud": "appstoreconnect-v1",
            "bid": settings.APPLE_BUNDLE_ID
        }
        
        return jwt.encode(
            payload,
            settings.APPLE_PRIVATE_KEY,
            algorithm="ES256",
            headers={"kid": settings.APPLE_KEY_ID}
        )
    
    @staticmethod
    async def get_subscription_status(original_transaction_id: str) -> dict:
        """
        Fetch current subscription status from App Store Server API.
        
        This is the authoritative source - always use this to verify
        subscription state before granting/revoking entitlements.
        """
        token = AppleBillingService._generate_token()
        
        # Try production first, fall back to sandbox
        for base_url in [AppleBillingService.PRODUCTION_URL, AppleBillingService.SANDBOX_URL]:
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.get(
                        f"{base_url}/inApps/v1/subscriptions/{original_transaction_id}",
                        headers={"Authorization": f"Bearer {token}"}
                    )
                    
                    if response.status_code == 200:
                        return response.json()
                        
            except Exception as e:
                logger.warning(f"Failed to fetch from {base_url}: {e}")
                continue
        
        raise Exception("Failed to fetch subscription status from Apple")
```

---

## 2. Google Play Real-time Developer Notifications (RTDN)

### Architecture

Google uses Cloud Pub/Sub for notifications:

```
Google Play → Cloud Pub/Sub Topic → Pub/Sub Subscription → Your Backend
```

### Setup Steps

#### 1. Google Cloud Setup

```bash
# Create project (if not exists)
gcloud projects create pulse-billing --name="Pulse Billing"

# Enable APIs
gcloud services enable pubsub.googleapis.com
gcloud services enable androidpublisher.googleapis.com

# Create Pub/Sub topic
gcloud pubsub topics create play-billing-notifications

# Create subscription
gcloud pubsub subscriptions create play-billing-sub \
  --topic=play-billing-notifications \
  --push-endpoint=https://api.pulse-app.com/api/v1/billing/google-webhook \
  --ack-deadline=60
```

#### 2. Play Console Configuration

1. Go to Play Console → Your App → Monetization setup
2. Find "Real-time developer notifications"
3. Set Topic name: `projects/pulse-billing/topics/play-billing-notifications`
4. Click "Send test notification" to verify

### Endpoint

```
POST /api/v1/billing/google-webhook
```

### Implementation

```python
import base64
import json
from google.cloud import pubsub_v1
from google.oauth2 import service_account
from googleapiclient.discovery import build

router = APIRouter()

@router.post("/api/v1/billing/google-webhook")
async def google_webhook(request: Request):
    """
    Handle Google Play Real-time Developer Notifications.
    
    CRITICAL: RTDN messages are triggers only.
    Always fetch full subscription status from Google Play API before updating.
    """
    try:
        body = await request.json()
        
        # Pub/Sub wraps the message
        message = body.get("message", {})
        data = message.get("data", "")
        message_id = message.get("messageId")
        
        # Check idempotency
        existing = await WebhookEvent.get_by_notification_id(f"google_{message_id}")
        if existing:
            return {"status": "already_processed"}
        
        # Decode base64 data
        decoded_data = base64.b64decode(data).decode("utf-8")
        notification = json.loads(decoded_data)
        
        # Extract notification type
        if "subscriptionNotification" in notification:
            await handle_subscription_notification(notification, message_id)
        elif "oneTimeProductNotification" in notification:
            await handle_one_time_notification(notification, message_id)
        elif "voidedPurchaseNotification" in notification:
            await handle_voided_purchase(notification, message_id)
        elif "testNotification" in notification:
            logger.info("Received Google test notification")
        
        return {"status": "ok"}
        
    except Exception as e:
        logger.error(f"Google webhook error: {e}")
        return {"status": "error"}


async def handle_subscription_notification(notification: dict, message_id: str):
    """
    Handle subscription lifecycle notifications.
    
    Notification types:
    1 = SUBSCRIPTION_RECOVERED (billing retry success)
    2 = SUBSCRIPTION_RENEWED
    3 = SUBSCRIPTION_CANCELED
    4 = SUBSCRIPTION_PURCHASED
    5 = SUBSCRIPTION_ON_HOLD
    6 = SUBSCRIPTION_IN_GRACE_PERIOD
    7 = SUBSCRIPTION_RESTARTED
    8 = SUBSCRIPTION_PRICE_CHANGE_CONFIRMED
    9 = SUBSCRIPTION_DEFERRED
    10 = SUBSCRIPTION_PAUSED
    11 = SUBSCRIPTION_PAUSE_SCHEDULE_CHANGED
    12 = SUBSCRIPTION_REVOKED
    13 = SUBSCRIPTION_EXPIRED
    """
    sub_notification = notification["subscriptionNotification"]
    notification_type = sub_notification["notificationType"]
    purchase_token = sub_notification["purchaseToken"]
    subscription_id = sub_notification["subscriptionId"]
    
    # CRITICAL: Fetch current status from Google Play API
    current_status = await GoogleBillingService.get_subscription_status(
        subscription_id=subscription_id,
        purchase_token=purchase_token
    )
    
    # Find user by purchase token
    user = await get_user_by_google_purchase_token(purchase_token)
    if not user:
        logger.warning(f"No user found for purchase token: {purchase_token[:20]}...")
        return
    
    # Update entitlements based on VERIFIED status
    await EntitlementService.sync_subscription_status(
        user_id=user.id,
        subscription_status=current_status,
        source="google_webhook"
    )
    
    # Log event
    await WebhookEvent.create(
        notification_id=f"google_{message_id}",
        platform="google",
        event_type=f"SUBSCRIPTION_{notification_type}",
        transaction_id=purchase_token,
        payload=notification,
        processed_at=datetime.utcnow()
    )
```

### Google Play Developer API Integration

```python
from google.oauth2 import service_account
from googleapiclient.discovery import build

class GoogleBillingService:
    """
    Google Play Developer API client.
    
    Required:
    - Service account with "View financial data" permission
    - Service account JSON key file
    """
    
    SCOPES = ["https://www.googleapis.com/auth/androidpublisher"]
    
    @staticmethod
    def _get_service():
        """Get authenticated Google Play Developer API service."""
        credentials = service_account.Credentials.from_service_account_file(
            settings.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
            scopes=GoogleBillingService.SCOPES
        )
        return build("androidpublisher", "v3", credentials=credentials)
    
    @staticmethod
    async def get_subscription_status(subscription_id: str, purchase_token: str) -> dict:
        """
        Fetch current subscription status from Google Play.
        
        Returns subscription details including:
        - expiryTimeMillis
        - autoRenewing
        - paymentState
        - cancelReason
        - acknowledgementState
        """
        service = GoogleBillingService._get_service()
        
        result = service.purchases().subscriptionsv2().get(
            packageName=settings.GOOGLE_PACKAGE_NAME,
            token=purchase_token
        ).execute()
        
        return result
    
    @staticmethod
    async def get_product_purchase(product_id: str, purchase_token: str) -> dict:
        """
        Fetch one-time product purchase status.
        Used for points packages and non-renewing subscriptions.
        """
        service = GoogleBillingService._get_service()
        
        result = service.purchases().products().get(
            packageName=settings.GOOGLE_PACKAGE_NAME,
            productId=product_id,
            token=purchase_token
        ).execute()
        
        return result
    
    @staticmethod
    async def acknowledge_purchase(product_id: str, purchase_token: str):
        """
        Acknowledge a purchase (required within 3 days).
        Should be called after successful receipt validation.
        """
        service = GoogleBillingService._get_service()
        
        service.purchases().products().acknowledge(
            packageName=settings.GOOGLE_PACKAGE_NAME,
            productId=product_id,
            token=purchase_token
        ).execute()
```

### Google Notification Types

| Type | Name | Action |
|------|------|--------|
| 1 | `SUBSCRIPTION_RECOVERED` | Billing retry succeeded - restore access |
| 2 | `SUBSCRIPTION_RENEWED` | Auto-renewed - extend expiry |
| 3 | `SUBSCRIPTION_CANCELED` | User cancelled - mark for expiry |
| 4 | `SUBSCRIPTION_PURCHASED` | New purchase - grant access |
| 5 | `SUBSCRIPTION_ON_HOLD` | Payment failed, on hold - suspend access |
| 6 | `SUBSCRIPTION_IN_GRACE_PERIOD` | Payment failed, grace period - keep access |
| 7 | `SUBSCRIPTION_RESTARTED` | User restarted - restore access |
| 8 | `SUBSCRIPTION_PRICE_CHANGE_CONFIRMED` | User accepted price change |
| 9 | `SUBSCRIPTION_DEFERRED` | Renewal deferred |
| 10 | `SUBSCRIPTION_PAUSED` | User paused - suspend access |
| 11 | `SUBSCRIPTION_PAUSE_SCHEDULE_CHANGED` | Pause schedule updated |
| 12 | `SUBSCRIPTION_REVOKED` | Refunded/revoked - revoke access |
| 13 | `SUBSCRIPTION_EXPIRED` | Expired - revoke access |

---

## 3. Database Schema

### Webhook Events Table

```sql
CREATE TABLE webhook_events (
    id SERIAL PRIMARY KEY,
    notification_id VARCHAR(255) UNIQUE NOT NULL,  -- For idempotency
    platform VARCHAR(20) NOT NULL,                  -- 'apple' or 'google'
    event_type VARCHAR(100) NOT NULL,
    subtype VARCHAR(100),
    transaction_id VARCHAR(255),
    user_id INTEGER REFERENCES users(id),
    payload JSONB NOT NULL,
    processed_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    INDEX idx_webhook_notification_id (notification_id),
    INDEX idx_webhook_transaction_id (transaction_id),
    INDEX idx_webhook_user_id (user_id),
    INDEX idx_webhook_created_at (created_at)
);
```

### Subscriptions Table

```sql
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    platform VARCHAR(20) NOT NULL,                  -- 'apple' or 'google'
    product_id VARCHAR(100) NOT NULL,
    original_transaction_id VARCHAR(255) UNIQUE,    -- Apple
    purchase_token TEXT,                            -- Google
    
    -- Status
    status VARCHAR(50) NOT NULL,                    -- 'active', 'expired', 'cancelled', 'grace_period', 'on_hold'
    tier VARCHAR(20) NOT NULL,                      -- 'plus' or 'pro'
    
    -- Dates
    purchased_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    cancelled_at TIMESTAMP,
    
    -- Renewal info
    auto_renewing BOOLEAN DEFAULT TRUE,
    in_grace_period BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    last_verified_at TIMESTAMP,
    last_webhook_at TIMESTAMP,
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    INDEX idx_subscription_user_id (user_id),
    INDEX idx_subscription_status (status),
    INDEX idx_subscription_expires_at (expires_at)
);
```

### Transactions Table (for idempotency)

```sql
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    transaction_id VARCHAR(255) UNIQUE NOT NULL,    -- Apple transactionId or Google purchaseToken
    user_id INTEGER NOT NULL REFERENCES users(id),
    product_id VARCHAR(100) NOT NULL,
    platform VARCHAR(20) NOT NULL,
    
    -- Purchase details
    purchase_type VARCHAR(50) NOT NULL,             -- 'subscription', 'consumable', 'non_consumable'
    price_amount DECIMAL(10, 2),
    price_currency VARCHAR(3),
    
    -- Validation
    receipt_data TEXT,
    validated_at TIMESTAMP NOT NULL,
    validation_source VARCHAR(50),                  -- 'client', 'webhook', 'restore'
    
    -- Entitlements granted
    entitlements_granted JSONB,
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    INDEX idx_transaction_user_id (user_id),
    INDEX idx_transaction_product_id (product_id)
);
```

---

## 4. Entitlement Service

```python
class EntitlementService:
    """
    Central service for managing user entitlements.
    All entitlement changes MUST go through this service.
    """
    
    @staticmethod
    async def sync_subscription_status(
        user_id: int,
        subscription_status: dict,
        source: str
    ):
        """
        Synchronize subscription status from store API response.
        
        This is called by:
        - Receipt validation (initial purchase)
        - Apple webhook handler
        - Google webhook handler
        - Restore purchases
        - Periodic verification job
        """
        # Parse status based on platform
        if "originalTransactionId" in subscription_status:
            # Apple format
            parsed = EntitlementService._parse_apple_status(subscription_status)
        else:
            # Google format
            parsed = EntitlementService._parse_google_status(subscription_status)
        
        # Get or create subscription record
        subscription = await Subscription.get_by_user_and_product(
            user_id=user_id,
            product_id=parsed["product_id"]
        )
        
        if subscription:
            # Update existing
            await subscription.update(
                status=parsed["status"],
                expires_at=parsed["expires_at"],
                auto_renewing=parsed["auto_renewing"],
                in_grace_period=parsed["in_grace_period"],
                cancelled_at=parsed.get("cancelled_at"),
                last_verified_at=datetime.utcnow(),
                last_webhook_at=datetime.utcnow() if "webhook" in source else None
            )
        else:
            # Create new
            await Subscription.create(
                user_id=user_id,
                platform=parsed["platform"],
                product_id=parsed["product_id"],
                original_transaction_id=parsed.get("original_transaction_id"),
                purchase_token=parsed.get("purchase_token"),
                status=parsed["status"],
                tier=parsed["tier"],
                purchased_at=parsed["purchased_at"],
                expires_at=parsed["expires_at"],
                auto_renewing=parsed["auto_renewing"],
                last_verified_at=datetime.utcnow()
            )
        
        # Update user's active tier (for quick access)
        await User.update_premium_tier(user_id, parsed["tier"] if parsed["status"] == "active" else None)
        
        logger.info(f"Synced subscription for user {user_id}: {parsed['status']}")
    
    @staticmethod
    async def grant_points(user_id: int, points: int, transaction_id: str):
        """
        Grant points to user (for consumable purchases).
        Idempotent - checks transaction_id before granting.
        """
        # Check if already granted
        existing = await Transaction.get_by_transaction_id(transaction_id)
        if existing and existing.entitlements_granted:
            logger.info(f"Points already granted for transaction {transaction_id}")
            return existing.entitlements_granted
        
        # Grant points
        user = await User.get(user_id)
        new_balance = user.points_balance + points
        await user.update(points_balance=new_balance)
        
        # Record entitlements
        entitlements = {"points_added": points, "new_balance": new_balance}
        await Transaction.update(
            transaction_id=transaction_id,
            entitlements_granted=entitlements
        )
        
        return entitlements
```

---

## 5. Periodic Verification Job

```python
from celery import Celery

app = Celery("pulse")

@app.task
def verify_active_subscriptions():
    """
    Periodic job to verify all active subscriptions.
    Run every 6 hours to catch any missed webhooks.
    """
    active_subs = Subscription.query.filter(
        Subscription.status.in_(["active", "grace_period"]),
        Subscription.expires_at > datetime.utcnow()
    ).all()
    
    for sub in active_subs:
        try:
            if sub.platform == "apple":
                status = AppleBillingService.get_subscription_status(
                    sub.original_transaction_id
                )
            else:
                status = GoogleBillingService.get_subscription_status(
                    sub.product_id,
                    sub.purchase_token
                )
            
            EntitlementService.sync_subscription_status(
                user_id=sub.user_id,
                subscription_status=status,
                source="periodic_verification"
            )
            
        except Exception as e:
            logger.error(f"Failed to verify subscription {sub.id}: {e}")
    
    logger.info(f"Verified {len(active_subs)} active subscriptions")


@app.task
def expire_subscriptions():
    """
    Mark expired subscriptions as expired.
    Run every hour.
    """
    expired = Subscription.query.filter(
        Subscription.status == "active",
        Subscription.expires_at < datetime.utcnow()
    ).all()
    
    for sub in expired:
        sub.status = "expired"
        User.update_premium_tier(sub.user_id, None)
    
    db.session.commit()
    logger.info(f"Expired {len(expired)} subscriptions")
```

---

## 6. Security Considerations

### Apple Webhook Security

1. **Signature Verification**: Always verify the JWS signature using Apple's certificate chain
2. **Certificate Chain Validation**: Verify the chain leads to Apple Root CA G3
3. **Timestamp Validation**: Reject notifications older than 5 minutes
4. **HTTPS Only**: Endpoint must use HTTPS with valid certificate

### Google Webhook Security

1. **Pub/Sub Authentication**: Use push authentication with service account
2. **Message Verification**: Verify the Pub/Sub message signature
3. **Token Validation**: Always validate purchase tokens with Google API
4. **HTTPS Only**: Endpoint must use HTTPS

### General Security

1. **Idempotency**: Always check notification_id/message_id before processing
2. **Rate Limiting**: Implement rate limiting on webhook endpoints
3. **Logging**: Log all webhook events for audit trail
4. **Alerting**: Set up alerts for webhook failures

---

## 7. Environment Variables

```bash
# Apple App Store
APPLE_KEY_ID=ABC123DEF4
APPLE_ISSUER_ID=12345678-1234-1234-1234-123456789012
APPLE_PRIVATE_KEY_PATH=/path/to/AuthKey_ABC123DEF4.p8
APPLE_BUNDLE_ID=com.pulse.dating

# Google Play
GOOGLE_PACKAGE_NAME=com.pulse.dating
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=/path/to/service-account.json
GOOGLE_PUBSUB_PROJECT_ID=pulse-billing
GOOGLE_PUBSUB_SUBSCRIPTION=play-billing-sub

# Webhook URLs (for reference)
APPLE_WEBHOOK_URL=https://api.pulse-app.com/api/v1/billing/apple-webhook
GOOGLE_WEBHOOK_URL=https://api.pulse-app.com/api/v1/billing/google-webhook
```

---

## 8. Testing

### Apple Sandbox Testing

1. Use sandbox environment in App Store Connect
2. Test notifications go to sandbox URL
3. Use sandbox Apple IDs for testing

### Google Test Notifications

1. Use "Send test notification" in Play Console
2. Test with license testers
3. Use test purchase flow

### Local Development

```python
# Mock webhook endpoint for local testing
@router.post("/api/v1/billing/test-webhook")
async def test_webhook(request: Request):
    """
    Simulate webhook for local development.
    NOT for production use.
    """
    if not settings.DEBUG:
        raise HTTPException(status_code=404)
    
    body = await request.json()
    # Process as if it were a real webhook
    ...
```

---

## Summary

| Component | Purpose |
|-----------|---------|
| Apple Webhook | Receive App Store Server Notifications V2 |
| Google Webhook | Receive RTDN via Pub/Sub |
| Entitlement Service | Central entitlement management |
| Webhook Events Table | Idempotency + audit trail |
| Periodic Verification | Catch missed webhooks |

**Key Principles:**
1. Webhooks are **triggers only** - always verify with store API
2. **Idempotency** is enforced at database level
3. **Entitlement Service** is the single source of truth
4. All changes are **logged** for audit
5. **Periodic verification** catches edge cases
