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
exports.OfflineRelaySchema = exports.OfflineRelay = exports.OfflineRelayStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var OfflineRelayStatus;
(function (OfflineRelayStatus) {
    OfflineRelayStatus["QUEUED"] = "queued";
    OfflineRelayStatus["BROADCASTING"] = "broadcasting";
    OfflineRelayStatus["CONFIRMED"] = "confirmed";
    OfflineRelayStatus["FAILED"] = "failed";
})(OfflineRelayStatus || (exports.OfflineRelayStatus = OfflineRelayStatus = {}));
let OfflineRelay = class OfflineRelay {
};
exports.OfflineRelay = OfflineRelay;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Wallet', index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], OfflineRelay.prototype, "walletId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, index: true }),
    __metadata("design:type", String)
], OfflineRelay.prototype, "txHash", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], OfflineRelay.prototype, "signedXdr", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        enum: Object.values(OfflineRelayStatus),
        default: OfflineRelayStatus.QUEUED,
    }),
    __metadata("design:type", String)
], OfflineRelay.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], OfflineRelay.prototype, "retryCount", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], OfflineRelay.prototype, "lastError", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], OfflineRelay.prototype, "onChainTxHash", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], OfflineRelay.prototype, "recipientPhone", void 0);
exports.OfflineRelay = OfflineRelay = __decorate([
    (0, mongoose_1.Schema)({ collection: 'offline_relay', timestamps: true })
], OfflineRelay);
exports.OfflineRelaySchema = mongoose_1.SchemaFactory.createForClass(OfflineRelay);
//# sourceMappingURL=offline-relay.schema.js.map