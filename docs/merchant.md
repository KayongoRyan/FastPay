# FastPay Merchant

Merchants are **separate accounts** from consumer wallets. They accept customer payments via Bank Pay and track invoices/settlements in the merchant portal.

## Architecture

| Layer | Path | Purpose |
|-------|------|---------|
| Merchant portal (web) | `/merchant/*` | Dashboard, invoices, transactions, settings |
| Consumer wallet (web) | `/app/*` | Personal banking — pays merchants via Bank Pay |
| merchant-service | `/merchant/*` | Orgs, invoices, transaction feed |
| payment-service | `/payments/bank-pay/*` | Consumer → merchant payments |
| auth-service | `/auth/register/merchant` | Merchant signup (no consumer wallet auto-provision) |

## Merchant signup

```http
POST /auth/register/merchant
{
  "fullName": "Jane Owner",
  "email": "shop@example.com",
  "password": "secure-password",
  "businessName": "Kigali City Market",
  "category": "Retail"
}
```

Returns JWT with `accountType: "merchant"` and auto-created org with `merchantCode` (e.g. `MRC482`).

## Consumer pays merchant

```http
GET /payments/bank-pay/lookup/MRC482
POST /payments/bank-pay/pay   # JWT (consumer)
{
  "merchantCode": "MRC482",
  "amountRwf": 12500,
  "beneficiaryLabel": "Rent — Kigali Heights"
}
```

Flow: lookup org → wallet transfer to settlement address → record `merchant_transactions` + increment org total.

## Local dev

```bash
cd fastpay-backend
npm run start:merchant   # :3006
npm run start:payment
npm run start:wallet
npm run start:auth
npm run start:gateway
```

Web: `http://localhost:5173/merchant/login`

## Env

- `MERCHANT_SERVICE_URL=http://localhost:3006`
- `MERCHANT_SETTLEMENT_PUBLIC_KEY` — Stellar G-address for incoming merchant payments
- `INTERNAL_SERVICE_SECRET` — auth → merchant org creation, payment → merchant ledger
