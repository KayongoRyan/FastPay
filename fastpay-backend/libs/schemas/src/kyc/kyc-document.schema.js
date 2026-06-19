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
exports.KycDocumentSchema = exports.KycDocument = exports.KycVerificationStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var KycVerificationStatus;
(function (KycVerificationStatus) {
    KycVerificationStatus["PENDING"] = "pending";
    KycVerificationStatus["APPROVED"] = "approved";
    KycVerificationStatus["REJECTED"] = "rejected";
})(KycVerificationStatus || (exports.KycVerificationStatus = KycVerificationStatus = {}));
let KycDocument = class KycDocument {
};
exports.KycDocument = KycDocument;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], KycDocument.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], KycDocument.prototype, "documentType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], KycDocument.prototype, "s3Key", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: Object.values(KycVerificationStatus), default: KycVerificationStatus.PENDING }),
    __metadata("design:type", String)
], KycDocument.prototype, "verificationStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], KycDocument.prototype, "verifiedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], KycDocument.prototype, "verifiedAt", void 0);
exports.KycDocument = KycDocument = __decorate([
    (0, mongoose_1.Schema)({ collection: 'kyc_documents', timestamps: { createdAt: true, updatedAt: false } })
], KycDocument);
exports.KycDocumentSchema = mongoose_1.SchemaFactory.createForClass(KycDocument);
//# sourceMappingURL=kyc-document.schema.js.map