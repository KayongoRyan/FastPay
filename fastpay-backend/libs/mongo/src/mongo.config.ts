import { registerAs } from '@nestjs/config';

export default registerAs('mongo', () => ({
  uri: process.env.MONGODB_URI ?? 'mongodb://localhost:27018/FastPay',
  dbName: process.env.MONGODB_DB_NAME ?? 'FastPay',
}));
