/**
 * Canonical MongoDB collection registry for FastPay.
 * All services share the FastPay database; each service owns writes to its collections.
 */
export interface CollectionRegistryEntry {
  collection: string;
  service: string;
  description: string;
}

export const COLLECTION_REGISTRY: CollectionRegistryEntry[] = [
  { collection: 'users', service: 'auth-service', description: 'User accounts and auth' },
  { collection: 'wallets', service: 'wallet-service', description: 'On-chain wallet metadata' },
  { collection: 'transactions', service: 'payment-service', description: 'Confirmed and pending tx ledger' },
  { collection: 'offline_relay', service: 'payment-service', description: 'Offline signed XDR relay queue' },
  { collection: 'families', service: 'family-service', description: 'Family groups' },
  { collection: 'family_members', service: 'family-service', description: 'User membership in families' },
  { collection: 'family_invites', service: 'family-service', description: 'Pending family membership invites' },
  { collection: 'family_savings_goals', service: 'family-service', description: 'Shared savings goals' },
  { collection: 'savings_contributions', service: 'family-service', description: 'Contributions to goals' },
  { collection: 'approval_requests', service: 'family-service', description: 'Parent/child tx approvals' },
  { collection: 'kyc_documents', service: 'kyc-service', description: 'KYC document references' },
  { collection: 'audit_logs', service: 'audit-service', description: 'Security and activity audit trail' },
  { collection: 'user_sessions', service: 'auth-service', description: 'Active user sessions with refresh token hashes' },
  { collection: 'trusted_devices', service: 'auth-service', description: 'Biometric trusted device registry' },
  { collection: 'security_alerts', service: 'audit-service', description: 'User-facing security notifications' },
  { collection: 'fraud_cases', service: 'fraud-service', description: 'Flagged transactions for review' },
  { collection: 'knowledge_chunks', service: 'assistant-service', description: 'RAG knowledge chunks and embeddings' },
  { collection: 'chat_conversations', service: 'assistant-service', description: 'Assistant chat history per user' },
  { collection: 'assistant_feedback', service: 'assistant-service', description: 'Assistant thumbs up/down feedback' },
  { collection: 'momo_payments', service: 'payment-service', description: 'Mobile money top-up payments' },
  { collection: 'merchant_orgs', service: 'merchant-service', description: 'Registered merchant businesses' },
  { collection: 'merchant_invoices', service: 'merchant-service', description: 'Payable merchant invoices' },
  { collection: 'merchant_transactions', service: 'merchant-service', description: 'Payments received by merchants' },
  { collection: 'merchant_products', service: 'merchant-service', description: 'Merchant product catalog and stock levels' },
  { collection: 'merchant_stock_movements', service: 'merchant-service', description: 'Stock in/out/sale/adjustment ledger' },
  { collection: 'merchant_employees', service: 'merchant-service', description: 'Merchant staff roster and salary config' },
  { collection: 'merchant_payroll_entries', service: 'merchant-service', description: 'Employee payroll periods and payments' },
  { collection: 'merchant_goals', service: 'merchant-service', description: 'Short and long-term merchant business goals' },
  { collection: 'merchant_orders', service: 'merchant-service', description: 'Merchant fulfillment orders linked to escrow deals' },
  { collection: 'escrow_contracts', service: 'escrow-service', description: 'Buyer–seller escrow protection contracts' },
  { collection: 'business_orgs', service: 'business-service', description: 'Company / HQ organizations above merchant branches' },
  { collection: 'business_members', service: 'business-service', description: 'Business portal team memberships and roles' },
];
