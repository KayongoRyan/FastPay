# Security Operations

## Key rotation

- Rotate `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` quarterly.
- Update mobile cert pins in `EXPO_PUBLIC_API_CERT_PINS` when gateway TLS cert changes.

## Incident response (stub)

1. Identify scope via `audit_logs` and `fraud_cases`.
2. Freeze affected accounts via Security Center or `POST /auth/freeze-account`.
3. Revoke sessions: `DELETE /security/sessions`.
4. Document in post-incident review.

## Monitoring

- Gateway emits `X-Request-Id` on every response.
- Fraud `review` decisions create `fraud_cases` with `status: open`.
- Security alerts surface in mobile Security Center.
