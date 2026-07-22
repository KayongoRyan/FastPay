/**
 * Generate MongoDB TLS certs (no OpenSSL required).
 * Dev-only self-signed cert with SANs; ca.crt = server public cert.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import selfsigned from 'selfsigned';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const certDir = path.join(__dirname, '..', 'certs');
const force = process.argv.includes('--force') || process.env.FORCE === '1';
const days = Number(process.env.CERT_DAYS ?? 825);

const hasCerts =
  fs.existsSync(path.join(certDir, 'ca.crt')) &&
  fs.existsSync(path.join(certDir, 'keyfile'));

if (hasCerts && !force) {
  console.log(`Certs already exist in ${certDir} (pass --force to regenerate).`);
  process.exit(0);
}

fs.mkdirSync(certDir, { recursive: true });

const altNames = [
  { type: 2, value: 'localhost' },
  { type: 2, value: 'mongo' },
  { type: 2, value: 'mongo-0' },
  { type: 2, value: 'mongo-1' },
  { type: 2, value: 'mongo-2' },
  { type: 2, value: 'mongo.fastpay' },
  { type: 2, value: 'mongo.fastpay.svc' },
  { type: 2, value: 'mongo.fastpay.svc.cluster.local' },
  { type: 2, value: 'mongo-0.mongo' },
  { type: 2, value: 'mongo-1.mongo' },
  { type: 2, value: 'mongo-2.mongo' },
  { type: 2, value: 'mongo-0.mongo.fastpay.svc.cluster.local' },
  { type: 2, value: 'mongo-1.mongo.fastpay.svc.cluster.local' },
  { type: 2, value: 'mongo-2.mongo.fastpay.svc.cluster.local' },
  { type: 7, ip: '127.0.0.1' },
];

console.log(`Generating Mongo TLS certs in ${certDir} ...`);

const server = selfsigned.generate(
  [
    { name: 'commonName', value: 'mongo' },
    { name: 'organizationName', value: 'FastPay' },
    { name: 'countryName', value: 'RW' },
  ],
  {
    days,
    keySize: 2048,
    algorithm: 'sha256',
    extensions: [
      { name: 'basicConstraints', cA: false, critical: true },
      { name: 'keyUsage', digitalSignature: true, keyEncipherment: true, critical: true },
      { name: 'extKeyUsage', serverAuth: true },
      { name: 'subjectAltName', altNames },
    ],
  },
);

fs.writeFileSync(path.join(certDir, 'ca.crt'), server.cert, 'utf8');
fs.writeFileSync(path.join(certDir, 'server.key'), server.private, 'utf8');
fs.writeFileSync(path.join(certDir, 'server.crt'), server.cert, 'utf8');
fs.writeFileSync(path.join(certDir, 'server.pem'), `${server.cert}\n${server.private}`, 'utf8');

const keyfile = crypto.randomBytes(756).toString('base64');
const keyfilePath = path.join(certDir, 'keyfile');
fs.writeFileSync(keyfilePath, `${keyfile}\n`, { mode: 0o400 });

console.log('Done.');
console.log(`  CA:     ${path.join(certDir, 'ca.crt')}`);
console.log(`  Server: ${path.join(certDir, 'server.pem')}`);
console.log(`  RS key: ${keyfilePath}`);
console.log('');
console.log('Host mongosh:');
console.log(
  '  mongosh "mongodb://fastpay_app:PASSWORD@localhost:27018/FastPay?authSource=FastPay&tls=true" \\',
);
console.log(`    --tlsCAFile ${path.join(certDir, 'ca.crt')}`);
