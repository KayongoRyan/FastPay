import { HydratedDocument, Types } from 'mongoose';
export declare enum ApprovalRequestStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
    EXPIRED = "expired"
}
export declare class ApprovalRequest {
    familyId: Types.ObjectId;
    requesterId: Types.ObjectId;
    approverId?: Types.ObjectId;
    transactionData: Record<string, unknown>;
    status: ApprovalRequestStatus;
    childSignature?: string;
    parentSignature?: string;
    expiresAt?: Date;
    resolvedAt?: Date;
}
export type ApprovalRequestDocument = HydratedDocument<ApprovalRequest>;
export declare const ApprovalRequestSchema: import("mongoose").Schema<ApprovalRequest, import("mongoose").Model<ApprovalRequest, any, any, any, import("mongoose").Document<unknown, any, ApprovalRequest, any, {}> & ApprovalRequest & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ApprovalRequest, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<ApprovalRequest>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<ApprovalRequest> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
