import { HydratedDocument, Types } from 'mongoose';
export declare enum SavingsGoalStatus {
    ACTIVE = "active",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}
export declare class FamilySavingsGoal {
    familyId: Types.ObjectId;
    name: string;
    targetAmount: number;
    currentAmount: number;
    token: string;
    deadline?: Date;
    status: SavingsGoalStatus;
    contractAddress?: string;
}
export type FamilySavingsGoalDocument = HydratedDocument<FamilySavingsGoal>;
export declare const FamilySavingsGoalSchema: import("mongoose").Schema<FamilySavingsGoal, import("mongoose").Model<FamilySavingsGoal, any, any, any, import("mongoose").Document<unknown, any, FamilySavingsGoal, any, {}> & FamilySavingsGoal & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, FamilySavingsGoal, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<FamilySavingsGoal>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<FamilySavingsGoal> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
