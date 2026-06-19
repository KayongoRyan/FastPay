"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionSchema = exports.Transaction = exports.TransactionStatus = exports.TransactionType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var TransactionType;
(function (TransactionType) {
    TransactionType["PAYMENT"] = "payment";
    TransactionType["TRANSFER"] = "transfer";
    TransactionType["ESCROW"] = "escrow";
    TransactionType["SAVINGS"] = "savings";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "pending";
    TransactionStatus["QUEUED"] = "queued";
    TransactionStatus["BROADCASTING"] = "broadcasting";
    TransactionStatus["CONFIRMED"] = "confirmed";
    TransactionStatus["FAILED"] = "failed";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
let Transaction = class Transaction {
};
exports.Transaction = Transaction;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Wallet', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Transaction.prototype, "walletId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], Transaction.prototype, "txHash", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 'stellar' }),
    __metadata("design:type", String)
], Transaction.prototype, "chain", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: Object.values(TransactionType), required: true }),
    __metadata("design:type", String)
], Transaction.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Transaction.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 'XLM' }),
    __metadata("design:type", String)
], Transaction.prototype, "token", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Transaction.prototype, "netAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '0' }),
    __metadata("design:type", String)
], Transaction.prototype, "fee", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Transaction.prototype, "fromAddress", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Transaction.prototype, "toAddress", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: Object.values(TransactionStatus), default: TransactionStatus.PENDING }),
    __metadata("design:type", String)
], Transaction.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Transaction.prototype, "blockNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Transaction.prototype, "ledgerCloseTime", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Transaction.prototype, "confirmedAt", void 0);
exports.Transaction = Transaction = __decorate([
    (0, mongoose_1.Schema)({ collection: 'transactions', timestamps: { createdAt: true, updatedAt: false } })
], Transaction);
exports.TransactionSchema = mongoose_1.SchemaFactory.createForClass(Transaction);
exports.TransactionSchema.index({ walletId: 1, createdAt: -1 });
exports.TransactionSchema.index({ fromAddress: 1, toAddress: 1 });
//# sourceMappingURL=transaction.schema.js.map