import { HydratedDocument, Types } from 'mongoose';
export declare enum OfflineRelayStatus {
    QUEUED = "queued",
    BROADCASTING = "broadcasting",
    CONFIRMED = "confirmed",
    FAILED = "failed"
}
export declare class OfflineRelay {
    walletId?: Types.ObjectId;
    txHash: string;
    signedXdr: string;
    status: OfflineRelayStatus;
    retryCount: number;
    lastError?: string;
    onChainTxHash?: string;
    recipientPhone?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export type OfflineRelayDocument = HydratedDocument<OfflineRelay>;
export declare const OfflineRelaySchema: import("mongoose").Schema<OfflineRelay, import("mongoose").Model<OfflineRelay, any, any, any, import("mongoose").Document<unknown, any, OfflineRelay, any, {}> & OfflineRelay & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, OfflineRelay, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<OfflineRelay>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<OfflineRelay> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
