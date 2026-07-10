/**
 * RabbitMQ connection URL for event publishing (phase 2).
 * Offline relay still uses BullMQ on Redis until consumers migrate.
 */
export function getRabbitMqUrl(): string {
  return process.env.RABBITMQ_URL ?? 'amqp://localhost:5672';
}

export function isRabbitMqConfigured(): boolean {
  return Boolean(process.env.RABBITMQ_URL?.trim());
}
