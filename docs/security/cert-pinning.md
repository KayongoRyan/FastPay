# Horizon certificate pinning (production mobile)

Pin Stellar Horizon TLS certificates in **Expo** and **Flutter** production builds to reduce MITM risk on transaction broadcast paths.

## Scope

- Pin the Horizon host configured via `STELLAR_HORIZON_URL` / `EXPO_PUBLIC_HORIZON_URL`
- Do **not** pin in development (mock Horizon uses HTTP)

## Expo (production)

Use a networking layer that supports SSL pinning (e.g. `expo-dev-client` + native module, or proxy through your gateway for mobile).

Recommended approach for MVP beta:

1. Route Horizon reads through `blockchain-service` (already server-side)
2. Mobile only talks to FastPay gateway over HTTPS with standard CA trust
3. Add native pinning when shipping store builds with direct Horizon access

## Flutter

When using `stellar_sdk` with direct Horizon:

```dart
// Use platform HttpClient with SecurityContext pins — production only
// See: https://api.dart.dev/stable/dart-io/SecurityContext/addTrustedCertificate.html
```

For beta: same as Expo — gateway-only mobile traffic, no direct Horizon from device.

## Rotation

- Maintain 2 pins (current + next) during cert renewal
- Test on staging before store release

## Checklist

- [ ] Production builds use HTTPS gateway only
- [ ] Horizon URL not exposed to client in prod env
- [ ] Pin set documented in release runbook
- [ ] Staging uses mock Horizon (no pin required)
