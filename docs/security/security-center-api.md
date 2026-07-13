# Security Center API

Base URL: API gateway (`http://localhost:3000` in dev).

Authentication: `Authorization: Bearer <access_token>` on all endpoints except public health.

Session context: `X-Session-Id: <sessionId>` header on revoke-all and logout (optional but recommended).

## Summary

### `GET /security/summary`

```json
{
  "lastLogin": "2026-07-13T18:00:00.000Z",
  "activeSessions": 2,
  "trustedDevices": 1,
  "unreadAlerts": 3,
  "accountFrozen": false
}
```

## Sessions

### `GET /security/sessions`

```json
{
  "sessions": [
    {
      "sessionId": "uuid",
      "deviceLabel": "iPhone 15",
      "platform": "ios",
      "ipAddress": "192.168.1.10",
      "lastActiveAt": "2026-07-13T18:00:00.000Z",
      "createdAt": "2026-07-10T12:00:00.000Z",
      "current": true
    }
  ]
}
```

### `DELETE /security/sessions/:sessionId`

Revokes one session. Returns `{ "success": true }`.

### `DELETE /security/sessions`

Revokes all sessions except the one in `X-Session-Id` header.

## Trusted devices

### `GET /security/devices`

```json
{
  "devices": [
    {
      "deviceId": "uuid",
      "platform": "ios",
      "enrolledAt": "2026-07-10T12:00:00.000Z",
      "lastSeenAt": "2026-07-13T18:00:00.000Z"
    }
  ]
}
```

### `DELETE /security/devices/:deviceId`

Revokes biometric binding for device. Returns `{ "success": true }`.

## Alerts

### `GET /security/alerts?limit=20&cursor=<iso>`

```json
{
  "alerts": [
    {
      "id": "mongoId",
      "type": "new_login",
      "title": "New sign-in",
      "body": "Your account was accessed from a new device.",
      "readAt": null,
      "createdAt": "2026-07-13T18:00:00.000Z"
    }
  ],
  "nextCursor": "2026-07-12T10:00:00.000Z"
}
```

### `PATCH /security/alerts/:id/read`

Returns `{ "success": true }`.

## Audit events

### `GET /audit/events?limit=20&cursor=<iso>&category=auth`

Categories: `auth`, `payment`, `security`, `assistant`.

```json
{
  "events": [
    {
      "id": "mongoId",
      "action": "auth.login.success",
      "category": "auth",
      "severity": "info",
      "ipAddress": "192.168.1.10",
      "createdAt": "2026-07-13T18:00:00.000Z",
      "details": {}
    }
  ],
  "nextCursor": "2026-07-12T10:00:00.000Z"
}
```

## Auth write endpoints (auth-service)

### `POST /auth/change-password`

```json
{ "currentPassword": "...", "newPassword": "..." }
```

### `POST /auth/freeze-account`

Self-service freeze. Returns `{ "success": true, "frozenUntil": "..." }`.

### `POST /auth/unfreeze-account`

Requires prior `verify-password`. Returns `{ "success": true }`.

## Token response extension

Login/refresh responses include `sessionId` (refresh token `jti`):

```json
{
  "user": { ... },
  "tokens": {
    "accessToken": "...",
    "refreshToken": "...",
    "expiresIn": "15m",
    "sessionId": "uuid"
  }
}
```

## Fraud screening (fraud-service)

### `POST /compliance/screen`

Unified pre-sign check (client + server).

```json
{
  "address": "G...",
  "direction": "outgoing",
  "amount": "100",
  "asset": "XLM",
  "userId": "optional",
  "txHash": "optional"
}
```

Response:

```json
{
  "allowed": true,
  "decision": "allow",
  "riskScore": 12,
  "reasons": ["No compliance issues detected"],
  "ruleHits": []
}
```

Decisions: `allow` | `review` | `block`.
