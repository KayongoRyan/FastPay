# FastPay MongoDB ERD (Canonical)

All services connect to the same MongoDB database (`FastPay`) and follow these collections.
Schema definitions live in `libs/schemas/`.

```mermaid
erDiagram
  User ||--o{ Wallet : owns
  User ||--o{ AuditLog : generates
  User ||--o{ KycDocument : submits
  User ||--o{ Family : creates
  User ||--o{ FamilyMember : belongs_to
  User ||--o{ SavingsContribution : makes
  User ||--o{ ApprovalRequest : requests
  User ||--o{ ApprovalRequest : approves

  Wallet ||--o{ Transaction : performs
  Wallet ||--o{ OfflineRelay : queues

  Family ||--o{ FamilyMember : contains
  Family ||--o{ FamilySavingsGoal : has
  Family ||--o{ ApprovalRequest : manages

  FamilySavingsGoal ||--o{ SavingsContribution : receives

  User {
    ObjectId _id PK
    string phone UK
    string email UK
    string fullName
    string nationalIdHash UK
    int kycLevel
    string kycStatus
    bool isActive
    date frozenUntil
    bool biometricEnabled
    string passwordHash
    string refreshTokenHash
    date createdAt
    date updatedAt
  }

  Wallet {
    ObjectId _id PK
    ObjectId userId FK
    string chain
    string address UK
    string publicKey
    string encryptedKeyShardB
    map balances
    bool isDefault
    date lastActivityAt
    date createdAt
  }

  Transaction {
    ObjectId _id PK
    ObjectId walletId FK
    string txHash UK
    string chain
    string type
    string amount
    string token
    number netAmount
    string fee
    string fromAddress
    string toAddress
    string status
    number blockNumber
    date ledgerCloseTime
    date createdAt
    date confirmedAt
  }

  OfflineRelay {
    ObjectId _id PK
    ObjectId walletId FK
    string txHash UK
    string signedXdr
    string status
    number retryCount
    string lastError
    string onChainTxHash
    string recipientPhone
    date createdAt
    date updatedAt
  }

  Family {
    ObjectId _id PK
    string name
    ObjectId createdBy FK
    string walletAddress UK
    date createdAt
    date updatedAt
  }

  FamilyMember {
    ObjectId _id PK
    ObjectId familyId FK
    ObjectId userId FK
    string role
    number spendingLimitDaily
    number spendingLimitMonthly
    number requiresApprovalAbove
    date joinedAt
    bool isActive
  }

  FamilySavingsGoal {
    ObjectId _id PK
    ObjectId familyId FK
    string name
    number targetAmount
    number currentAmount
    string token
    date deadline
    string status
    string contractAddress
    date createdAt
  }

  SavingsContribution {
    ObjectId _id PK
    ObjectId goalId FK
    ObjectId userId FK
    number amount
    string transactionHash
    date contributedAt
  }

  ApprovalRequest {
    ObjectId _id PK
    ObjectId familyId FK
    ObjectId requesterId FK
    ObjectId approverId FK
    json transactionData
    string status
    string childSignature
    string parentSignature
    date expiresAt
    date createdAt
    date resolvedAt
  }

  KycDocument {
    ObjectId _id PK
    ObjectId userId FK
    string documentType
    string s3Key
    string verificationStatus
    ObjectId verifiedBy FK
    date verifiedAt
    date createdAt
  }

  AuditLog {
    ObjectId _id PK
    ObjectId userId FK
    string action
    string ipAddress
    string userAgent
    json details
    string blockchainHash
    date createdAt
  }
```

## Collection → Service ownership

| Collection | Service |
|------------|---------|
| `users` | auth-service |
| `wallets` | wallet-service |
| `transactions`, `offline_relay` | payment-service |
| `families`, `family_members`, `family_savings_goals`, `savings_contributions`, `approval_requests` | family-service |
| `kyc_documents` | kyc-service |
| `audit_logs` | audit-service |

## External mapping

- `Wallet.address` / `publicKey` maps to **Stellar** on-chain accounts (via blockchain-service).
- `offline_relay` entries promote to `transactions` once broadcast confirms.
