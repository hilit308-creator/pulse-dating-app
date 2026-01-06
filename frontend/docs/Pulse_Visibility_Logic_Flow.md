# 🔄 Pulse Visibility Logic Flow

> **State Machine & Priority Rules for Profile Visibility**

---

## Priority Order (Absolute)

```
Paused > Hidden Area > Time Visibility > Always Visible
```

---

## State Machine Diagram

```mermaid
stateDiagram-v2
    [*] --> CheckPaused
    
    CheckPaused --> HIDDEN_PAUSED: isPaused = true
    CheckPaused --> CheckLocation: isPaused = false
    
    CheckLocation --> HIDDEN_AREA: inHiddenArea = true
    CheckLocation --> CheckTime: inHiddenArea = false
    
    CheckTime --> HIDDEN_TIME: outsideActiveHours = true
    CheckTime --> VISIBLE: withinActiveHours = true
    
    HIDDEN_PAUSED --> [*]: Profile hidden (Paused)
    HIDDEN_AREA --> [*]: Profile hidden (Location)
    HIDDEN_TIME --> [*]: Profile hidden (Time)
    VISIBLE --> [*]: Profile visible
```

---

## Decision Flow

```mermaid
flowchart TD
    START([User Opens App]) --> A{Is Profile Paused?}
    
    A -->|Yes| H1[🔴 HIDDEN - Paused]
    A -->|No| B{Visibility Mode?}
    
    B -->|Always| V1[🟢 VISIBLE]
    B -->|Selected Places| C{In Hidden Area?}
    B -->|Selected Times| D{Within Active Hours?}
    B -->|Paused| H1
    
    C -->|Yes| H2[🔴 HIDDEN - Location]
    C -->|No| V2[🟢 VISIBLE]
    
    D -->|Yes| V3[🟢 VISIBLE]
    D -->|No| H3[🔴 HIDDEN - Time]
    
    style H1 fill:#ef4444,color:#fff
    style H2 fill:#ef4444,color:#fff
    style H3 fill:#ef4444,color:#fff
    style V1 fill:#22c55e,color:#fff
    style V2 fill:#22c55e,color:#fff
    style V3 fill:#22c55e,color:#fff
```

---

## Combined Visibility Check

```mermaid
flowchart TD
    START([Calculate Visibility]) --> P{Paused?}
    
    P -->|Yes| HIDDEN[🔴 HIDDEN]
    P -->|No| L{In Hidden Area?}
    
    L -->|Yes| HIDDEN
    L -->|No| T{Time Visibility Enabled?}
    
    T -->|No| VISIBLE[🟢 VISIBLE]
    T -->|Yes| TH{Within Active Hours?}
    
    TH -->|Yes| VISIBLE
    TH -->|No| HIDDEN
    
    style HIDDEN fill:#ef4444,color:#fff
    style VISIBLE fill:#22c55e,color:#fff
```

---

## Visibility Status Calculation (Code Reference)

```javascript
const calculateVisibilityStatus = (settings) => {
  const {
    isPaused,
    hiddenAreas,
    currentLocation,
    timeVisibility,
    currentTime
  } = settings;

  // Priority 1: Paused (highest)
  if (isPaused) {
    return { visible: false, reason: 'paused' };
  }

  // Priority 2: Hidden Area
  if (hiddenAreas?.length > 0 && currentLocation) {
    const inHiddenArea = hiddenAreas.some(area => 
      isWithinRadius(currentLocation, area)
    );
    if (inHiddenArea) {
      return { visible: false, reason: 'hidden_area' };
    }
  }

  // Priority 3: Time Visibility
  if (timeVisibility?.enabled) {
    const isActiveTime = checkActiveHours(
      currentTime,
      timeVisibility.days,
      timeVisibility.startTime,
      timeVisibility.endTime
    );
    if (!isActiveTime) {
      return { visible: false, reason: 'time_visibility' };
    }
  }

  // Default: Visible
  return { visible: true, reason: null };
};
```

---

## Sign-In Method Safety Logic

```mermaid
flowchart TD
    START([Can Disconnect Provider?]) --> A{Has Verified Email?}
    
    A -->|Yes| ALLOW[✅ ALLOW Disconnect]
    A -->|No| B{Other Providers Connected?}
    
    B -->|Yes, 1+| ALLOW
    B -->|No| BLOCK[❌ BLOCK Disconnect]
    
    style ALLOW fill:#22c55e,color:#fff
    style BLOCK fill:#ef4444,color:#fff
```

```javascript
const canDisconnectProvider = (providerId, state) => {
  const { emailStatus, connectedProviders } = state;
  
  // If email is verified, can always disconnect any provider
  if (emailStatus === 'verified') {
    return true;
  }
  
  // Count other connected providers (excluding the one to disconnect)
  const otherProviders = connectedProviders.filter(
    p => p.connected && p.id !== providerId
  );
  
  // Allow only if there's at least one other provider
  return otherProviders.length > 0;
};
```

---

## Email Verification Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client
    participant S as Server
    
    U->>C: Enter email
    C->>S: PUT /v1/settings/account/email
    S-->>C: 200 OK, code sent
    S-->>U: Email with code
    
    Note over C: Status = Pending
    
    U->>C: Enter verification code
    C->>S: POST /v1/settings/account/email/verify
    
    alt Code Valid
        S-->>C: 200 OK, verified
        Note over C: Status = Verified
        C->>U: Success toast, return to settings
    else Code Invalid
        S-->>C: 409 INCORRECT_CODE
        C->>U: Error: "Code is incorrect"
    else Code Expired
        S-->>C: 410 CODE_EXPIRED
        C->>U: Error: "Code expired"
    end
```

---

## Connected Accounts Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client
    participant O as OAuth Provider
    participant S as Server
    
    U->>C: Tap "Connect Google"
    C->>O: Open OAuth popup
    U->>O: Authorize
    O-->>C: OAuth token
    C->>S: POST /v1/auth/connect/google
    
    alt Success
        S-->>C: 200 OK
        C->>U: Toast "Account connected"
    else Already Connected
        S-->>C: 409 ALREADY_CONNECTED
        C->>U: Error message
    end
```

---

**Last Updated:** January 2026  
**Version:** 1.0
