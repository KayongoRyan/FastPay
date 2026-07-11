FROM node:20-alpine@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293 AS builder

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

FROM node:20-alpine@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293 AS runtime

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY --from=builder /app/apps ./apps
COPY --from=builder /app/libs ./libs

RUN npm ci --omit=dev && \
    find apps libs -type d -name src -exec rm -rf {} + && \
    find apps libs -type f \( -name 'tsconfig*.json' -o -name 'nest-cli.json' \) -delete

COPY docker-entrypoint.sh /entrypoint.sh

RUN sed -i 's/\r$//' /entrypoint.sh && \
    chmod +x /entrypoint.sh && \
    chown -R node:node /app /entrypoint.sh

USER node

EXPOSE 3000

ENTRYPOINT ["/entrypoint.sh"]
