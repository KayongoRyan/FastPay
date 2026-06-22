# FastPay Mobile (Flutter)

Flutter client for the FastPay backend. Replaces the Expo/React Native app (`FastPay/`) for iOS and Android.

## Prerequisites

- Flutter SDK 3.35+
- Backend running: `fastpay-backend` (gateway `:3000`, auth `:3001`)
- Docker: Mongo + Redis

## Run

```bash
cd fastpay_mobile
flutter pub get

# Android emulator (API → 10.0.2.2:3000 automatically)
flutter run

# Physical device — point to your machine IP
flutter run --dart-define=API_URL=http://192.168.x.x:3000
```

## Project layout

```
lib/
├── config/api_config.dart       # API base URL
├── core/api/api_client.dart     # HTTP + JWT
├── features/auth/               # Login, register, secure tokens
├── features/home/               # Home after sign-in
├── features/offline/            # QR send/receive (stubs → Stellar next)
├── router/app_router.dart       # go_router + auth guards
└── theme/app_theme.dart
```

## API (via gateway :3000)

Same as the RN app: `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/me`.

## Milestones

- [x] Auth + secure token storage
- [x] Navigation + dark theme
- [x] QR scanner shell (receive)
- [ ] Stellar wallet + offline sign/relay (port from `FastPay/lib/stellar`)

## Legacy

The Expo app in `FastPay/` remains for web development until Flutter web or a separate web client is needed.
