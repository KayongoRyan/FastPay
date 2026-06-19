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
exports.FamilyMemberSchema = exports.FamilyMember = exports.FamilyRole = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var FamilyRole;
(function (FamilyRole) {
    FamilyRole["PARENT"] = "parent";
    FamilyRole["CHILD"] = "child";
    FamilyRole["GUARDIAN"] = "guardian";
})(FamilyRole || (exports.FamilyRole = FamilyRole = {}));
let FamilyMember = class FamilyMember {
};
exports.FamilyMember = FamilyMember;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Family', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], FamilyMember.prototype, "familyId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], FamilyMember.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: Object.values(FamilyRole), required: true }),
    __metadata("design:type", String)
], FamilyMember.prototype, "role", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], FamilyMember.prototype, "spendingLimitDaily", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], FamilyMember.prototype, "spendingLimitMonthly", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], FamilyMember.prototype, "requiresApprovalAbove", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: () => new Date() }),
    __metadata("design:type", Date)
], FamilyMember.prototype, "joinedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], FamilyMember.prototype, "isActive", void 0);
exports.FamilyMember = FamilyMember = __decorate([
    (0, mongoose_1.Schema)({ collection: 'family_members', timestamps: false })
], FamilyMember);
exports.FamilyMemberSchema = mongoose_1.SchemaFactory.createForClass(FamilyMember);
exports.FamilyMemberSchema.index({ familyId: 1, userId: 1 }, { unique: true });
//# sourceMappingURL=family-member.schema.js.map