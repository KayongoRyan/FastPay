import { HydratedDocument, Types } from 'mongoose';
export declare class Family {
    name: string;
    createdBy: Types.ObjectId;
    walletAddress?: string;
}
export type FamilyDocument = HydratedDocument<Family>;
export declare const FamilySchema: import("mongoose").Schema<Family, import("mongoose").Model<Family, any, any, any, import("mongoose").Document<unknown, any, Family, any, {}> & Family & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Family, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Family>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Family> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
