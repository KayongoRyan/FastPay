# Staging deployment

Public marketing site + staging API for testers.

## Marketing site (Cloudflare Pages)

```bash
cd fastpay-web
npm ci
VITE_API_URL=https://staging-api.fastpay.example npm run build
npx wrangler pages deploy dist --project-name fastpay-web
```

- Guest routes (`/`, `/services`, …) ship from `dist/`
- `/app` uses `VITE_API_URL` at build time — point at staging gateway
- Optional: `VITE_USE_MOCK_WALLET=false` for real wallet APIs

## Staging backend (Kubernetes)

```bash
cd fastpay-backend
npm run docker:build
npm run k8s:load          # kind clusters only
kubectl apply -k infrastructure/k8s/overlays/staging
kubectl -n fastpay-staging get pods
```

Port-forward gateway for local testers:

```bash
kubectl -n fastpay-staging port-forward svc/api-gateway 3000:3000
curl http://127.0.0.1:3000/health
```

## Environment

| Variable | Staging example |
|----------|-----------------|
| `GATEWAY_URL` | `https://staging-api.fastpay.example` |
| `WALLET_SERVICE_URL` | in-cluster `http://wallet-service:3002` |
| `INTERNAL_SERVICE_SECRET` | from K8s secret |
| `FASTPAY_INLINE_OFFLINE_QUEUE` | `true` (no Redis required for smoke) |

## Health checks

- Gateway: `GET /health`
- Golden smoke against staging: `GATEWAY_URL=https://staging-api… npm run golden:smoke -- --skip-mongo`

## Exit criteria

- Marketing site live on Cloudflare Pages
- Staging gateway reachable without local Docker
- Team can register and transfer against staging
