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
exports.ApprovalRequestSchema = exports.ApprovalRequest = exports.ApprovalRequestStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var ApprovalRequestStatus;
(function (ApprovalRequestStatus) {
    ApprovalRequestStatus["PENDING"] = "pending";
    ApprovalRequestStatus["APPROVED"] = "approved";
    ApprovalRequestStatus["REJECTED"] = "rejected";
    ApprovalRequestStatus["EXPIRED"] = "expired";
})(ApprovalRequestStatus || (exports.ApprovalRequestStatus = ApprovalRequestStatus = {}));
let ApprovalRequest = class ApprovalRequest {
};
exports.ApprovalRequest = ApprovalRequest;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Family', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ApprovalRequest.prototype, "familyId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ApprovalRequest.prototype, "requesterId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ApprovalRequest.prototype, "approverId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, required: true }),
    __metadata("design:type", Object)
], ApprovalRequest.prototype, "transactionData", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: Object.values(ApprovalRequestStatus), default: ApprovalRequestStatus.PENDING }),
    __metadata("design:type", String)
], ApprovalRequest.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ApprovalRequest.prototype, "childSignature", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ApprovalRequest.prototype, "parentSignature", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], ApprovalRequest.prototype, "expiresAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], ApprovalRequest.prototype, "resolvedAt", void 0);
exports.ApprovalRequest = ApprovalRequest = __decorate([
    (0, mongoose_1.Schema)({ collection: 'approval_requests', timestamps: { createdAt: true, updatedAt: false } })
], ApprovalRequest);
exports.ApprovalRequestSchema = mongoose_1.SchemaFactory.createForClass(ApprovalRequest);
exports.ApprovalRequestSchema.index({ familyId: 1, status: 1 });
//# sourceMappingURL=approval-request.schema.js.map