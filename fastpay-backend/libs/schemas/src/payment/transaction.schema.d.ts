import { HydratedDocument, Types } from 'mongoose';
export declare enum TransactionType {
    PAYMENT = "payment",
    TRANSFER = "transfer",
    ESCROW = "escrow",
    SAVINGS = "savings"
}
export declare enum TransactionStatus {
    PENDING = "pending",
    QUEUED = "queued",
    BROADCASTING = "broadcasting",
    CONFIRMED = "confirmed",
    FAILED = "failed"
}
export declare class Transaction {
    walletId: Types.ObjectId;
    txHash: string;
    chain: string;
    type: TransactionType;
    amount: string;
    token: string;
    netAmount: number;
    fee: string;
    fromAddress: string;
    toAddress: string;
    status: TransactionStatus;
    blockNumber?: number;
    ledgerCloseTime?: Date;
    confirmedAt?: Date;
}
export type TransactionDocument = HydratedDocument<Transaction>;
export declare const TransactionSchema: import("mongoose").Schema<Transaction, import("mongoose").Model<Transaction, any, any, any, import("mongoose").Document<unknown, any, Transaction, any, {}> & Transaction & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Transaction, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Transaction>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Transaction> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
