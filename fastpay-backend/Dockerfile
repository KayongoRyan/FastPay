FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY tsconfig.base.json ./
COPY apps ./apps
COPY libs ./libs

RUN npm ci
RUN npm run build -w @fastpay/common \
  -w @fastpay/mongo \
  -w @fastpay/schemas \
  -w @fastpay/messaging
RUN npm run build -w @fastpay/api-gateway \
  -w @fastpay/auth-service \
  -w @fastpay/wallet-service \
  -w @fastpay/payment-service \
  -w @fastpay/family-service \
  -w @fastpay/escrow-service \
  -w @fastpay/merchant-service \
  -w @fastpay/treasury-service \
  -w @fastpay/blockchain-service \
  -w @fastpay/fraud-service \
  -w @fastpay/kyc-service

FROM node:20-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY tsconfig.base.json ./
COPY apps ./apps
COPY libs ./libs
COPY --from=builder /app/apps ./apps
COPY --from=builder /app/libs ./libs
COPY --from=builder /app/node_modules ./node_modules
COPY docker-entrypoint.sh /entrypoint.sh

RUN sed -i 's/\r$//' /entrypoint.sh && chmod +x /entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/entrypoint.sh"]
