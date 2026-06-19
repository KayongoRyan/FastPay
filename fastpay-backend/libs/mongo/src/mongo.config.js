"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('mongo', () => ({
    uri: process.env.MONGODB_URI ?? 'mongodb://localhost:27018/FastPay',
    dbName: process.env.MONGODB_DB_NAME ?? 'FastPay',
}));
//# sourceMappingURL=mongo.config.js.map