"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COLLECTION_REGISTRY = void 0;
exports.COLLECTION_REGISTRY = [
    { collection: 'users', service: 'auth-service', description: 'User accounts and auth' },
    { collection: 'wallets', service: 'wallet-service', description: 'On-chain wallet metadata' },
    { collection: 'transactions', service: 'payment-service', description: 'Confirmed and pending tx ledger' },
    { collection: 'offline_relay', service: 'payment-service', description: 'Offline signed XDR relay queue' },
    { collection: 'families', service: 'family-service', description: 'Family groups' },
    { collection: 'family_members', service: 'family-service', description: 'User membership in families' },
    { collection: 'family_savings_goals', service: 'family-service', description: 'Shared savings goals' },
    { collection: 'savings_contributions', service: 'family-service', description: 'Contributions to goals' },
    { collection: 'approval_requests', service: 'family-service', description: 'Parent/child tx approvals' },
    { collection: 'kyc_documents', service: 'kyc-service', description: 'KYC document references' },
    { collection: 'audit_logs', service: 'audit-service', description: 'Security and activity audit trail' },
];
//# sourceMappingURL=registry.js.map