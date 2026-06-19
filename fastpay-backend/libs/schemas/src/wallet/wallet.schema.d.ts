import { HydratedDocument, Types } from 'mongoose';
export declare class Wallet {
    userId: Types.ObjectId;
    chain: string;
    address: string;
    publicKey: string;
    encryptedKeyShardB?: string;
    balances: Map<string, string>;
    isDefault: boolean;
    lastActivityAt?: Date;
}
export type WalletDocument = HydratedDocument<Wallet>;
export declare const WalletSchema: import("mongoose").Schema<Wallet, import("mongoose").Model<Wallet, any, any, any, import("mongoose").Document<unknown, any, Wallet, any, {}> & Wallet & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Wallet, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Wallet>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Wallet> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
