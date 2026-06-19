import { HydratedDocument, Types } from 'mongoose';
export declare enum KycVerificationStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected"
}
export declare class KycDocument {
    userId: Types.ObjectId;
    documentType: string;
    s3Key: string;
    verificationStatus: KycVerificationStatus;
    verifiedBy?: Types.ObjectId;
    verifiedAt?: Date;
}
export type KycDocumentDocument = HydratedDocument<KycDocument>;
export declare const KycDocumentSchema: import("mongoose").Schema<KycDocument, import("mongoose").Model<KycDocument, any, any, any, import("mongoose").Document<unknown, any, KycDocument, any, {}> & KycDocument & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, KycDocument, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<KycDocument>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<KycDocument> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
