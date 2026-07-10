# Phase 2 — RabbitMQ event bus (infra ready, code migration pending)

RabbitMQ is deployed in-cluster (`rabbitmq:5672`, management UI `:15672`).

## Current state

- **ConfigMap** exposes `RABBITMQ_URL=amqp://fastpay:fastpay@rabbitmq:5672`
- **`@fastpay/messaging`** exports `getRabbitMqUrl()` / `isRabbitMqConfigured()` for future publishers
- **Offline relay** still uses **BullMQ on Redis** — no behavior change until consumers exist

## Follow-up migration

1. Publish offline-relay lifecycle events from payment-service to RabbitMQ exchanges
2. Add fraud/analytics consumers subscribed to those queues
3. Retire duplicate Redis pub/sub once consumers are stable

Do not remove BullMQ until RabbitMQ consumers are tested end-to-end.
