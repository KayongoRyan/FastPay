// Runs once on empty data directory via mongo docker entrypoint.
const appUser = process.env.MONGO_APP_USER || 'fastpay_app';
const appPassword = process.env.MONGO_APP_PASSWORD;
const backupUser = process.env.MONGO_BACKUP_USER || 'fastpay_backup';
const backupPassword = process.env.MONGO_BACKUP_PASSWORD;
const roUser = process.env.MONGO_RO_USER || 'fastpay_ro';
const roPassword = process.env.MONGO_RO_PASSWORD;

if (!appPassword || !backupPassword || !roPassword) {
  throw new Error('MONGO_APP_PASSWORD, MONGO_BACKUP_PASSWORD, and MONGO_RO_PASSWORD are required');
}

db = db.getSiblingDB('FastPay');
db.createUser({
  user: appUser,
  pwd: appPassword,
  roles: [{ role: 'readWrite', db: 'FastPay' }],
});
db.createUser({
  user: backupUser,
  pwd: backupPassword,
  roles: [
    { role: 'backup', db: 'admin' },
    { role: 'read', db: 'FastPay' },
  ],
});
db.createUser({
  user: roUser,
  pwd: roPassword,
  roles: [{ role: 'read', db: 'FastPay' }],
});

print(`[init] Created FastPay RBAC users: ${appUser}, ${backupUser}, ${roUser}`);
