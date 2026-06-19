import { HydratedDocument } from 'mongoose';
export declare enum KycStatus {
    PENDING = "pending",
    VERIFIED = "verified",
    REJECTED = "rejected"
}
export declare class User {
    phone?: string;
    email?: string;
    fullName: string;
    nationalIdHash?: string;
    kycLevel: number;
    kycStatus: KycStatus;
    isActive: boolean;
    frozenUntil?: Date;
    biometricEnabled: boolean;
    passwordHash?: string;
    refreshTokenHash?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export type UserDocument = HydratedDocument<User>;
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, import("mongoose").Document<unknown, any, User, any, {}> & User & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<User>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<User> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
