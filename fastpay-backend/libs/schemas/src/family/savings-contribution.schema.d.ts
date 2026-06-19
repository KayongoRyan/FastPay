import { HydratedDocument, Types } from 'mongoose';
export declare class SavingsContribution {
    goalId: Types.ObjectId;
    userId: Types.ObjectId;
    amount: number;
    transactionHash?: string;
    contributedAt: Date;
}
export type SavingsContributionDocument = HydratedDocument<SavingsContribution>;
export declare const SavingsContributionSchema: import("mongoose").Schema<SavingsContribution, import("mongoose").Model<SavingsContribution, any, any, any, import("mongoose").Document<unknown, any, SavingsContribution, any, {}> & SavingsContribution & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, SavingsContribution, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<SavingsContribution>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<SavingsContribution> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
