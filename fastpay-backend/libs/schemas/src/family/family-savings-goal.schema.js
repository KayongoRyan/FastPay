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
exports.FamilySavingsGoalSchema = exports.FamilySavingsGoal = exports.SavingsGoalStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var SavingsGoalStatus;
(function (SavingsGoalStatus) {
    SavingsGoalStatus["ACTIVE"] = "active";
    SavingsGoalStatus["COMPLETED"] = "completed";
    SavingsGoalStatus["CANCELLED"] = "cancelled";
})(SavingsGoalStatus || (exports.SavingsGoalStatus = SavingsGoalStatus = {}));
let FamilySavingsGoal = class FamilySavingsGoal {
};
exports.FamilySavingsGoal = FamilySavingsGoal;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Family', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], FamilySavingsGoal.prototype, "familyId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], FamilySavingsGoal.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], FamilySavingsGoal.prototype, "targetAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], FamilySavingsGoal.prototype, "currentAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'XLM' }),
    __metadata("design:type", String)
], FamilySavingsGoal.prototype, "token", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], FamilySavingsGoal.prototype, "deadline", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: Object.values(SavingsGoalStatus), default: SavingsGoalStatus.ACTIVE }),
    __metadata("design:type", String)
], FamilySavingsGoal.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], FamilySavingsGoal.prototype, "contractAddress", void 0);
exports.FamilySavingsGoal = FamilySavingsGoal = __decorate([
    (0, mongoose_1.Schema)({ collection: 'family_savings_goals', timestamps: { createdAt: true, updatedAt: false } })
], FamilySavingsGoal);
exports.FamilySavingsGoalSchema = mongoose_1.SchemaFactory.createForClass(FamilySavingsGoal);
//# sourceMappingURL=family-savings-goal.schema.js.map