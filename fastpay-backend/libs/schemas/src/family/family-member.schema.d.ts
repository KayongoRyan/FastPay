import { HydratedDocument, Types } from 'mongoose';
export declare enum FamilyRole {
    PARENT = "parent",
    CHILD = "child",
    GUARDIAN = "guardian"
}
export declare class FamilyMember {
    familyId: Types.ObjectId;
    userId: Types.ObjectId;
    role: FamilyRole;
    spendingLimitDaily?: number;
    spendingLimitMonthly?: number;
    requiresApprovalAbove?: number;
    joinedAt: Date;
    isActive: boolean;
}
export type FamilyMemberDocument = HydratedDocument<FamilyMember>;
export declare const FamilyMemberSchema: import("mongoose").Schema<FamilyMember, import("mongoose").Model<FamilyMember, any, any, any, import("mongoose").Document<unknown, any, FamilyMember, any, {}> & FamilyMember & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, FamilyMember, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<FamilyMember>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<FamilyMember> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
