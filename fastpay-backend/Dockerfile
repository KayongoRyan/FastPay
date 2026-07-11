FROM node:20-alpine@sha256:b88333c42c23fbd91596ebd7fd10de239cedab9617de04142dde7315e3bc0afa AS builder

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

FROM node:20-alpine@sha256:b88333c42c23fbd91596ebd7fd10de239cedab9617de04142dde7315e3bc0afa AS runtime

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
